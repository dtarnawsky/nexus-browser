import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AdvHttpResponse } from './cordova-plugins';
import { Service } from './discovery';
import { random } from './util.service';
import { Directory, Filesystem, FilesystemDirectory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private key = 'shortcuts';
  private maxShortcuts = 100;
  private services: Service[] = [];
  constructor() {
  }

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

  public async setIcon(url: string, res: AdvHttpResponse) {
    const service = this.find(url);
    if (!this.services) throw new Error('Services Not Loaded');
    if (!service) return;
    if (!service.id) {
      service.id = this.unique();
    }

    let type = '.jpg';
    switch (res.headers['content-type']) {
      case 'image/png': type = '.png'; break;
      case 'image/x-icon': type = '.ico'; break;
      default: console.warn(`Unknown content-type ${res.headers['content-type']}`);
    }
    const filename = `${service.id}${type}`;
    const b64 = btoa(res.data);    
    const tmp = await Filesystem.writeFile({ data: b64, path: filename, directory: Directory.Data });
    service.icon = Capacitor.convertFileSrc(tmp.uri);
    console.log(`Wrote ${service.icon} for ${url}`);
    this.save();

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
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
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
