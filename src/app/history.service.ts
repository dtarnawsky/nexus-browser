import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Http } from './cordova-plugins';
import { Service } from './discovery';
import { getStringFrom, random } from './util.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private key = 'shortcuts';
  private maxShortcuts = 100;
  private services: Service[] = [];
  constructor() {}

  public async load(): Promise<Service[]> {
    if (this.services.length > 0) {
      return this.services;
    }

    const { value } = await Preferences.get({ key: this.key });
    if (!value) {
      this.services = [];
    } else {
      const services: Array<Service> = JSON.parse(value);
      this.services = services.map((service: Service) => {
        return this.cleanup(service);
      });

      // Filter out auto detected shortcuts
      this.services = this.services.filter((service) => { return service.hostname == undefined});
    }
    return this.services;
  }

  public async add(url: string) {
    const service = this.newService(url);
    if (!this.services) throw new Error('Services Not Loaded');

    const idx = this.services.findIndex((found) => found.address == service.address);
    if (idx === -1) {
      this.services.unshift(service);
      if (this.services.length > this.maxShortcuts) {
        this.services.pop();
      }
      this.save();
    }
  }

  private find(url: string): Service | undefined {
    const service = this.newService(url);
    if (!this.services) return undefined;
    return this.services.find((found) => found.address == service.address);
  }

  public async setIcon(url: string) {
    const service = this.find(url);
    if (!this.services) throw new Error('Services Not Loaded');
    if (!service) return;
    if (!service.id) {
      service.id = this.unique();
    }
    let finalURL = undefined;
    try {
      finalURL = await this.setPWAIcon(url, service);
    } catch {
      try {
        finalURL = await this.setFavIcon(url, service);
      } catch {
        finalURL = undefined;
      }
    }
    if (finalURL) {
      service.icon = Capacitor.convertFileSrc(finalURL);
      console.log(`Wrote ${service.icon} for ${url}`);
      this.save();
    }
  }

  private async setFavIcon(url: string, service: Service): Promise<string> {
    return new Promise(async (resolve, reject) => {
      Http.setDataSerializer('raw');
      const pth: string = (await Filesystem.getUri({ path: `${service.id}.jpg`, directory: Directory.Data })).uri;
      console.log(`fav.get ${url}/favicon.ico`);
      Http.downloadFile(
        `${url}/favicon.ico`,
        {},
        {},
        pth,
        (entry: any) => {
          resolve(entry.nativeURL);
        },
        (err: any) => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  private async setPWAIcon(url: string, service: Service): Promise<string> {
    return new Promise((resolve, reject) => {
      Http.setDataSerializer('raw');
      console.log(`pwa.get ${url}`);
      Http.get(
        url,
        {},
        {},
        async (response: any) => {
          const appleIconUrl = this.findInHTML(response.data);
          if (!appleIconUrl) {
            reject('apple icon not found');
            return;
          }
          const fullUrl = this.joinUrl(url, appleIconUrl);
          console.log('Download', fullUrl);

          let ext = '.jpg';
          if (fullUrl.toLowerCase().endsWith('.png')) ext = '.png';
          const pth: string = (await Filesystem.getUri({ path: `${service.id}${ext}`, directory: Directory.Data })).uri;
          Http.downloadFile(
            fullUrl,
            {},
            {},
            pth,
            (entry: any) => {
              resolve(entry.nativeURL);
            },
            (err: any) => {
              console.error(err);
              reject(err);
            }
          );
        },
        (err: any) => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  // Join url together. Examples:
  // 'a/', 'b' => 'a/b'
  // 'a/', '/b' => 'a/b'
  // 'a',  '/b' => 'a/b'
  // 'a',  'b' => 'a/b'
  // 'a', 'http...b' => 'b'
  private joinUrl(url1: string, url2: string): string {
    if (url2.startsWith('http')) {
      return url2;
    }
    if (url1.endsWith('/')) {
      if (url2.startsWith('/')) {
        return url1 + url2.replace('/', '');
      } else {
        return url1 + url2;
      }
    } else {
      if (url2.startsWith('/')) {
        return url1 + url2;
      } else {
        return `${url1}/${url2}`;
      }
    }
  }

  private findInHTML(html: string): string | undefined {
    try {
      const data = getStringFrom(html, `<link rel="apple-touch-icon"`, `>`);
      if (data) {
        const href = getStringFrom(data, `href="`, `"`);
        if (!href) {
          console.log(`Icon not found in ${data}`);
        }
        console.log('apple-touch-icon url', href);
        return href;
      }
    } catch (err) {
      console.warn(`Failed to parse html`, err);
    }
    return undefined;
  }

  private unique(): string {
    let id: string;
    let found: Service | undefined;
    do {
      id = random(1, 999999).toString();
      found = this.services.find((service) => service.id === id);
    } while (found);
    return id;
  }

  public async clear(): Promise<Array<Service>> {
    this.services = [];
    await this.save();
    return await this.load();
  }

  public toFullUrl(url: string): string {
    if (!url) {
      return '';
    }
    url = url.toLowerCase().trim();
    if (url.includes('nexusbrowser.com/')) {
      // Likely a deep link like: https://nexusbrowser.com/192.168.0.125%3A8101
      const part = url.split('nexusbrowser.com/');
      if (part[1]) {
        url = decodeURIComponent(part[1]);
      }
    }
    if (!url.startsWith('http')) {
      if (url.match(/^\d/)) {
        // Assume http for ip addresses
        url = 'http://' + url;
      } else {
        url = 'https://' + url;
      }
    }
    if (!url.includes('.')) {
      url += '.com';
    }
    return url;
  }

  public async remove(url: string): Promise<void> {
    const services = await this.load();
    const look = this.newService(url);
    const index = services.findIndex((service) => service.address == look.address);
    if (index !== -1) {
      if (services[index].icon) {
        await Filesystem.deleteFile({ path: services[index].icon!, directory: Directory.Data });
        console.log(`Deleted ${services[index].icon}`);
      }
      services.splice(index, 1);
      await this.save();
    }
  }

  private newService(url: string): Service {
    return this.cleanup({ address: url, name: this.extractName(url) });
  }

  private extractName(url: string): string {
    try {
      let name = url.toLowerCase().replace('http://', '').replace('https://', '');
      name = name.charAt(0).toUpperCase() + name.slice(1);
      if (name.endsWith('.com')) {
        name = name.substring(0, name.length - 4);
      }
      return name;
    } catch {
      return url;
    }
  }

  public isValidUrl(url: string): boolean {
    var urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // validate fragment locator
    return !!urlPattern.test(url);
  }

  private cleanup(service: Service): Service {
    let url = service.address;
    let r = url.replace('https://', '').replace('http://', '').toLowerCase();
    if (r.endsWith('/')) {
      r = r.slice(0, -1);
    }
    service.address = url;
    return service;
  }

  private async save() {
    await Preferences.set({
      key: this.key,
      value: JSON.stringify(this.services),
    });
  }
}
