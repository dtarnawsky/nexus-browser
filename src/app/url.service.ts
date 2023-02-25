import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor, CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { AdvHttpResponse, Http } from './cordova-plugins';
import { HistoryService } from './history.service';
import { delay } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor(private historyService: HistoryService) {
  }

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

  private async testUrl(url: string): Promise<string | undefined> {
    let hasRetried = false;
    let retry;
    do {
      try {
        retry = false;
        if (!Capacitor.isNativePlatform()) {
          window.open(url);
        } else {
          const response: HttpResponse = await CapacitorHttp.get({ url });
          if (response.status == 200) {
            if (this.isHttp(url)) {
              window.location.href = url;
            } else {
              await Browser.open({ url, toolbarColor: '111111' });
              this.getIcon(url);
              //const ico: HttpResponse = await CapacitorHttp.get({ url: `${url}/favicon.ico` });
              //console.log(ico);

            }
          } else {
            return `${url} responded with the status code ${response.status}`;
          }
        }
      } catch (error) {
        console.error('er', error);
        const message = (error as any).message;

        if ((message == 'The Internet connection appears to be offline.') && !hasRetried) {
          // First installation shows a prompt to access local network. So we retry after that          
          retry = true;
          hasRetried = true;
          await delay(2500);
        } else {
          await this.historyService.remove(url);
          return message;
        }
      }
    }
    while (retry);
    return;
  }

  private getIcon(url: string) {
    Http.setDataSerializer('raw');
    Http.sendRequest(`${url}/favicon.ico`, { method: 'get' }, (response: AdvHttpResponse) => {
      if (response.status == 200) {
        this.historyService.setIcon(url, response);
      } else {
        console.error(`Failed to get icon for ${url}`);
      }
    },
      (error: any) => { console.error(`${error.status}: ${error.error}`) }
    );
  }

  private isHttp(url: string): boolean {
    return url.startsWith('http://');
  }
}