import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor() {
  }

  public async load(): Promise<Array<string>> {
    const { value } = await Preferences.get({ key: 'url-history' });
    if (!value) return [];
    const urls: Array<string> = JSON.parse(value);
    return urls.map((url: string) => {
      return this.cleanup(url);
    });
  }

  public async add(url: string) {
    const cleaned = this.cleanup(url);
    const urls: Array<string> = await this.load();
    if (!urls.includes(cleaned)) {
      urls.unshift(cleaned);
      if (urls.length > 5) {
        urls.pop();
      }
      this.save(urls);
    }
  }

  public async clear(): Promise<Array<string>> {
    await this.save([]);
    return await this.load();
  }

  public toFullUrl(url: string): string {
    if (!url) {
      return '';
    }
    if (!url.startsWith('http')) {
      if (url.match(/^\d/)) {
        // Assume http for ip addresses
        return 'http://' + url.toLowerCase();
      } else {
        return 'https://' + url.toLowerCase();
      }
    }
    return url.toLowerCase();
  }

  public async remove(url: string): Promise<void> {
    const urls = await this.load();   
    const index = urls.indexOf(this.cleanup(url));
    if (index !== -1) {
       urls.splice(index, 1);
       await this.save(urls);
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

  private cleanup(url: string): string {
    let r = url.replace('https://', '').replace('http://', '').toLowerCase();
    if (r.endsWith('/')) {
      r = r.slice(0, -1);
    }
    return r;
  }

  private async save(urls: Array<string>) {
    await Preferences.set({
      key: 'url-history',
      value: JSON.stringify(urls),
    });
  }
}
