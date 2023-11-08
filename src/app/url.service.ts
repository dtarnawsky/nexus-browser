import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor, CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { InAppBrowser } from './cordova-plugins';
import { HistoryService } from './history.service';
import { delay } from './util.service';
import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private slug: string | undefined;

  constructor(private historyService: HistoryService) {}

  public async visit(url: string, save: boolean): Promise<string | undefined> {
    if (Capacitor.isNativePlatform()) {
      await Keyboard.hide();
    }
    if (Capacitor.isNativePlatform()) {
      if (Capacitor.getPlatform() === 'ios') {
        await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      }
    }
    if (save) {
      await this.historyService.add(url);
    } else {
      // Used for exiting to home
      localStorage['capViewURL'] = window.location.href;
      localStorage['siteURL'] = url;
    }
    return await this.testUrl(url);
  }

  public deepLink(slug: string) {
    this.slug = slug;
  }

  public getDeepLink(): string | undefined {
    try {
      let slug = this.slug;
      if (!slug) return undefined;
      slug = decodeURIComponent(slug);
      let valid = false;
      if (slug.startsWith('/')) {
        slug = slug.slice(1);
      }
      // Only work with ip/port
      const ipPort = slug.split(':');
      if (ipPort?.length == 2) {
        if (this.isIp(ipPort[0])) {
          valid = true;
        }
      }
      if (!valid) {
        console.warn(`Deep link to "${this.slug}" is not valid`);
        return;
      } else {
        console.log(`Deep link to "${this.slug}" looks good`);
      }
      this.slug = undefined;
      return slug;
    } catch (err) {
      console.error('getDeepLink', err);
      return undefined;
    }
  }

  // Set the remote logging URL Capacitor will report to
  public async setRemoteURL(url: string | undefined) {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    if (!url) {
      console.log(`[#RemoteLoggingURL=]`);
      return;
    }
    const domain = this.getDomain(url);
    if (!domain) return; // This ensure we only get through if we're using an address and port

    const info = await Device.getInfo();

    // This triggers remote logging to use this url
    console.log(`[#RemoteLoggingURL=http://${domain}:8942]`);

    console.log(`Connected from ${info.manufacturer} ${info.name} version ${info.osVersion}`);
  }

  private getDomain(url: string): string | undefined {
    let domain = url.toLowerCase().replace('http://', '').replace('https://', '');
    if (domain.includes(':')) {
      const tmp = domain.split(':');
      domain = tmp[0];
    }
    if (domain.includes('/')) {
      return;
    }
    return domain;
  }

  private isIp(val: string): boolean {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      val
    );
  }

  private async testUrl(url: string): Promise<string | undefined> {
    let hasRetried = false;
    let retry;
    do {
      try {
        retry = false;
        if (!Capacitor.isNativePlatform()) {
          window.open(url);
        } else {
          const launchInternal = this.isHttp(url) || this.allowed(url);
          console.log(`testUrl called for ${url} (internal=${launchInternal})`);
          if (!launchInternal) {
            console.log(`Call get ${url}`);
            const response: HttpResponse = await CapacitorHttp.get({ url });
            if (response.status !== 200) {
              return `${url} responded with the status code ${response.status}`;
            } else {
              if (Capacitor.getPlatform() === 'ios') {
                await Browser.open({ url, toolbarColor: '111111' });
              } else {
                // The Capacitor Browser freezes the app so we use cordovas browser
                InAppBrowser.open(url, '_blank', 'location=no');
              }
              this.getIcon(url);
            }
          } else {
            window.location.href = url;
          }
        }
      } catch (error) {
        console.error(`Unable to verify ${url}`, error);
        const message = (error as any).message;

        if (message == 'The Internet connection appears to be offline.' && !hasRetried) {
          // First installation shows a prompt to access local network. So we retry after that
          retry = true;
          hasRetried = true;
          await delay(2500);
        } else {
          await this.historyService.remove(url);
          return url + ': ' + message;
        }
      }
    } while (retry);
    return;
  }

  // Return if this site can be viewed in the app (true)
  // or will launch a browser window
  private allowed(url: string): boolean {
    if (!url) return false;
    try {
      const uri = new URL(url);
      if (uri.port !== '80' && uri.port !== '443') {
        return true;
      }
      return url?.includes('.appflowapp.com') || url?.includes('ngrok.io');
    } catch {
      return false;
    }
  }

  private getIcon(url: string) {
    this.historyService.setIcon(url);
  }

  private isHttp(url: string): boolean {
    return url.startsWith('http://');
  }
}
