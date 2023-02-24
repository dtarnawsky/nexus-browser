import { Component, NgZone, OnInit } from '@angular/core';
import { Capacitor, HttpResponse } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AlertController, IonicModule } from '@ionic/angular';
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

interface HomeModel {
  url: string;
  urls: Array<string>;
  busy?: boolean;
  hideTutorial?: boolean;
  hideHistory?: boolean;  
  services: Service[];
}

@Component({
  standalone: true,
  imports: [SlidesComponent, SlideComponent, CommonModule, FormsModule, IonicModule],
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public vm: HomeModel = {
    url: '',
    urls: [],
    services: []
  };


  constructor(
    private alertController: AlertController,
    private historyService: HistoryService,
    private scanService: ScanService,
    private ngZone: NgZone,
  ) { }

  async ngOnInit() {
    await this.loadUrls();

    //this.vm.services.push({address:'192.168.1.12', port: 8100, name: 'my-app', path: '', hostname: 'Damians-MacBook-Pro.local', id: '12332'});
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
    this.vm.services = data?.services;
    console.log(this.vm.services);
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

  /**
   * Go to a url from the history list
   * @param  {string} url
   */
  public async go(url: string) {
    await this.visit(this.historyService.toFullUrl(url));
    IonicDiscover.stop();
  }


  public async clearHistory() {
    this.vm.urls = await this.historyService.clear();
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
    } finally {
      this.vm.busy = false;
    }
  }

  private async loadUrls() {
    try {
      this.vm.urls = await this.historyService.load();
    } catch {
      this.vm.urls = [];
    }
  }

  private async testUrl(url: string): Promise<void> {
    let hasRetried = false;
    let retry;
    do {
      try {
        retry = false;
        if (url.startsWith('http://1.1.1.1')) {
          url = 'https://conf-sample.netlify.app/index.html';
        }
        const response: HttpResponse = await CapacitorHttp.get({ url });
        if (response.status == 200) {
          window.location.href = url;
        } else {
          this.alert(`${url} responded with the status code ${response.status}`);
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
          await this.loadUrls();
        }
      }
    }
    while (retry);
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

}
