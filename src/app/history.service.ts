import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Service } from './discovery';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private key = 'shortcuts';
  private maxShortcuts = 100;
  constructor() {
  }

  public async load(): Promise<Array<Service>> {
    const { value } = await Preferences.get({ key: this.key });
    if (!value) return [];
    const urls: Array<Service> = JSON.parse(value);
    return urls.map((service: Service) => {
      return this.cleanup(service);
    });
  }

  public async add(url: string) {
    const service = this.newService(url);
    const services: Array<Service> = await this.load();

    const idx = services.findIndex((found) => found.address == service.address);
    if (idx === -1) {
      services.unshift(service);
      if (services.length > this.maxShortcuts) {
        services.pop();
      }
      this.save(services);
    }
  }

  public async clear(): Promise<Array<Service>> {
    await this.save([]);
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
      services.splice(index, 1);
      await this.save(services);
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

  private async save(services: Array<Service>) {
    await Preferences.set({
      key: this.key,
      value: JSON.stringify(services),
    });
  }
}
