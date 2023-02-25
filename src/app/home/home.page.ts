import { Component, NgZone, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ActionSheetController, AlertController, IonicModule } from '@ionic/angular';
import { HistoryService } from '../history.service';
import { ScanService } from '../scan.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { SlidesComponent } from '../slides/slides.component';
import { SlideComponent } from '../slide/slide.component';
import { delay } from '../util.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../discovery';
import { IonicDiscover } from '../cordova-plugins';
import { ShortcutAction, ShortcutComponent } from '../shortcut/shortcut.component';
import { Role, SettingsService } from '../settings.service';
import { UIService } from '../ui.service';
import { UrlService } from '../url.service';

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
    private alert: AlertController,
    private ui: UIService,
    private historyService: HistoryService,
    private scanService: ScanService,
    private ngZone: NgZone,
    private urlService: UrlService,
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
    if (!services || services.length == 0) return;
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
      await this.ui.alert(this.alert, 'Enter a valid url');
      this.ui.focus('devServerUrl');
      return;
    }

    await delay(300);    
    this.visit(fullUrl, true);
  }

  public async open(action: ShortcutAction, service: Service) {
    switch (action) {
      case ShortcutAction.press: {
        this.actions(service);
        break;
      }
      case ShortcutAction.click: {
        const url = `${service.address}${service.port ? ':' + service.port : ''}`;
        const save = !service.hostname;
        await this.visit(this.historyService.toFullUrl(url), save);
        IonicDiscover.stop();
        break;
      }
    }
  }

  public async clearHistory() {
    this.vm.services = await this.historyService.clear();
  }

  public async settings() {
    const action = await this.settingsService.presentSettings(this.actionSheetCtrl);
    switch (action) {
      case Role.destructive: this.clearHistory(); break;
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
      this.ui.alert(this.alert, err as string);
    } finally {
      this.vm.busy = false;
    }
  }

  private async visit(url: string, save: boolean) {
    try {
      this.vm.busy = true;
      const error = await this.urlService.visit(url, save);
      await this.load();
      if (error) {
        this.ui.alert(this.alert, error);
      }
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

  private async actions(service: Service) {
    const action = await this.settingsService.presentActions(this.actionSheetCtrl, service);
    if (action == Role.destructive) {
      await this.historyService.remove(service.address);
      await this.load();
    }
    if (action == Role.go) {
      this.open(ShortcutAction.click, service);
    }
  }

}
