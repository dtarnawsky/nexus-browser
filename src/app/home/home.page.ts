import { Component, NgZone, OnInit } from '@angular/core';
import { Capacitor, HttpResponse } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ActionSheetController, AlertController, IonicModule } from '@ionic/angular';
import { HistoryService } from '../history.service';
import { ScanService } from '../scan.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { CapacitorHttp } from '@capacitor/core';
import { SlidesComponent } from '../slides/slides.component';
import { SlideComponent } from '../slide/slide.component';
import { delay } from '../util.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicDiscover, Service } from '../discovery';
import { ShortcutComponent } from '../shortcut/shortcut.component';
import { SettingsService } from '../settings.service';
import { Browser } from '@capacitor/browser';

interface HomeModel {
  url: string;
  busy?: boolean;
  hideTutorial?: boolean;
  hideHistory?: boolean;
  services: Service[];
}

@Component({
  standalone: true,
  imports: [SlidesComponent, ShortcutComponent, SlideComponent, CommonModule, FormsModule, IonicModule],
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public vm: HomeModel = {
    url: '',
    services: []
  };

  constructor(
    private alertController: AlertController,
    private historyService: HistoryService,
    private scanService: ScanService,
    private ngZone: NgZone,
    private actionSheetCtrl: ActionSheetController,
    private settingsService: SettingsService
  ) { }

  async ngOnInit() {
    await this.load();

    if (!Capacitor.isNativePlatform()) {
      return;
    }
    if (Capacitor.getPlatform() === 'ios') {
      await Keyboard.setResizeMode({ mode: KeyboardResize.None });
    }
    Keyboard.addListener('keyboardWillShow', () => {
      this.ngZone.run(() => {
        this.vm.hideHistory = true;
      });
    });
    Keyboard.addListener('keyboardWillHide', () => {
      this.ngZone.run(async () => {
        await delay(100);
        this.vm.hideHistory = false;
      });
    });
    await StatusBar.setStyle({ style: Style.Dark });
    await SplashScreen.hide();

    IonicDiscover.start(); // Note: we cannot await    
    setInterval(async () => { this.discover() }, 2000);
  }

  async discover() {
    const data = await IonicDiscover.getServices();
    this.addServices(data?.services);    
  }

  private addServices(services: Service[]) {
    if (!services) return;
    for (const service of services) {
      const idx = this.vm.services.findIndex((found) => found.id == service.id);
      if (idx == -1) {
        this.vm.services.push(service);
      }
    }
  }

  /**
   * Go to a url entered by the user
   * @param  {string} url
   */
  public async connect(url: string) {
    const fullUrl = this.historyService.toFullUrl(url);

    if (!this.historyService.isValidUrl(fullUrl)) {
      await this.alert('Enter a valid url');
      this.focusUrl();
      return;
    }

    await delay(300);
    this.visit(fullUrl);
  }

  public async open(e: string, service: Service) {
    if (e == 'press') {
      this.actions(service);
      return;
    }
    const url = `${service.address}${service.port ? ':' + service.port : ''}`;
    this.go(url);
  }
  /**
   * Go to a url from the history list
   * @param  {string} url
   */
  public async go(url: string) {
    await this.visit(this.historyService.toFullUrl(url));
    IonicDiscover.stop();
  }


  public async clearHistory() {
    this.vm.services = await this.historyService.clear();
  }

  public async settings() {
    const action = await this.settingsService.presentSettings(this.actionSheetCtrl);
    switch (action) {
      case 'destructive': this.clearHistory(); break;
    }
  }

  public async scan() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      this.vm.busy = true;
      const result = await this.scanService.scan();
      if (result.text) {
        await this.connect(result.text);
      }
    } catch (err) {
      this.alert(err as string);
    } finally {
      this.vm.busy = false;
    }
  }

  private async visit(url: string) {
    try {
      this.vm.busy = true;
      if (Capacitor.isNativePlatform()) {
        await Keyboard.hide();
      }
      if (Capacitor.isNativePlatform()) {
        if (Capacitor.getPlatform() === 'ios') {
          await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
        }
      }
      await this.historyService.add(url);

      localStorage['capViewURL'] = window.location.href;
      localStorage['siteURL'] = url;
      await this.testUrl(url);
      await this.load();
      this.vm.url = '';
    } finally {
      this.vm.busy = false;
    }
  }

  private async load() {
    try {
      this.vm.services = await this.historyService.load();
    } catch {
      this.vm.services = [];
    }
  }

  private async testUrl(url: string): Promise<void> {
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
            }
          } else {
            this.alert(`${url} responded with the status code ${response.status}`);
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
          this.alert(message);
          await this.historyService.remove(url);
          await this.load();
        }
      }
    }
    while (retry);
  }

  private isHttp(url: string): boolean {
    return url.startsWith('http://');
  }

  private focusUrl() {
    document.getElementById('devServerUrl')?.focus();
  }

  private async alert(message: string) {
    const alert = await this.alertController.create({
      header: message,
      buttons: ['OK']
    });

    await alert.present();
    await alert.onDidDismiss();
  }

  private async actions(service: Service) {
    const action = await this.settingsService.presentActions(this.actionSheetCtrl, service);
    if (action == 'destructive') {
      await this.historyService.remove(service.address);
      await this.load();
    }
  }

}
