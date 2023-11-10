import { Component, NgZone, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ActionSheetController, AlertController, IonActionSheet, IonModal, IonRouterLink } from '@ionic/angular/standalone';
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
import { Router, RouterLink } from '@angular/router';
import { App } from '@capacitor/app';
import { addIcons } from "ionicons";
import { ellipsisHorizontal, qrCodeSharp, qrCode } from "ionicons/icons";
import { IonContent, IonFab, IonFabButton, IonIcon, IonSpinner } from "@ionic/angular/standalone";

interface HomeModel {
    url: string;
    busy?: boolean;
    hideTutorial?: boolean;
    hideHistory?: boolean;
    isNative: boolean;
    services: Service[];
    scanDisabled: boolean;
    connectDisabled: boolean;
}

@Component({
    standalone: true,
    imports: [SlidesComponent, ShortcutComponent, SlideComponent, CommonModule, FormsModule, 
        IonContent, IonFab, IonFabButton, IonIcon, IonSpinner, IonContent, IonFab, IonFabButton, 
        IonIcon, IonSpinner, RouterLink, IonRouterLink, IonActionSheet, IonModal],
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    public vm: HomeModel = {
        url: '',
        isNative: Capacitor.isNativePlatform(),
        services: [],
        scanDisabled: false,
        connectDisabled: false,
    };

    constructor(
        private router: Router,
        private alert: AlertController,
        private ui: UIService,
        private historyService: HistoryService,
        private scanService: ScanService,
        private ngZone: NgZone,
        private urlService: UrlService,
        private actionSheetCtrl: ActionSheetController,
        private settingsService: SettingsService
    ) {
        addIcons({ ellipsisHorizontal, qrCodeSharp, qrCode });
    }

    async ngOnInit() {
        await this.urlService.setRemoteURL(undefined);
        await this.load();

        if (!Capacitor.isNativePlatform()) {
            return;
        }
        if (Capacitor.getPlatform() === 'ios') {
            await Keyboard.setResizeMode({ mode: KeyboardResize.None });
        }

        App.addListener('resume', () => {
            this.ngZone.run(() => {
                this.checkDeepLink();
            });
        });

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
        if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#333333' });
        }
        await StatusBar.setStyle({ style: Style.Dark });
        await SplashScreen.hide();

        IonicDiscover.start(); // Note: we cannot await
        setInterval(async () => {
            this.discover();
        }, 2000);

        this.checkDeepLink();
    }

    private checkDeepLink() {
        setTimeout(() => {
            const url = this.urlService.getDeepLink();
            if (url) {
                this.connect(url, false);
            }
        }, 1000);
    }

    async discover() {
        const data = await IonicDiscover.getServices();
        this.addServices(data?.services);
    }

    private async addServices(services: Service[]) {
        if (!services || services.length == 0) return;
        for (const service of services) {
            const idx = this.vm.services.findIndex((found) => found.id == service.id);
            if (idx == -1) {
                this.vm.services.push(service);                
                await this.ui.keepAwake();                
                this.open(ShortcutAction.click, service);
            }
        }
    }

    /**
     * Go to a url entered by the user
     * @param  {string} url
     * @param {boolean} save Whether to save as a shortcut
     */
    public async connect(url: string, save?: boolean) {
        if (this.vm.connectDisabled) {
            this.vm.connectDisabled = false;
            return;
        }
        const fullUrl = this.historyService.toFullUrl(url);
        this.urlService.setRemoteURL(fullUrl);
        if (!this.historyService.isValidUrl(fullUrl)) {
            await this.ui.alert(this.alert, 'Enter a valid url');
            this.ui.focus('devServerUrl');
            return;
        }

        await delay(300);
        this.visit(fullUrl, save !== false);
    }

    public async open(action: ShortcutAction, service: Service) {
        switch (action) {
            case ShortcutAction.press: {
                this.actions(service);
                break;
            }
            case ShortcutAction.click: {
                // IonicDiscover.stop();
                const url = `${service.address}${service.port ? ':' + service.port : ''}`;
                const save = !service.hostname;
                await this.visit(this.historyService.toFullUrl(url, service.secure), save);
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
            case Role.destructive:
                this.clearHistory();
                break;
            case Role.privacy:
                this.router.navigateByUrl('/privacy');
                break;
        }
    }

    public handleKeyEnter(event: any) {
        this.vm.scanDisabled = true;
    }

    public async scan() {
        if (this.vm.scanDisabled) {
            this.vm.scanDisabled = false;
            return;
        }
        this.vm.connectDisabled = true;
        if (!Capacitor.isNativePlatform()) return;
        try {
            await this.scanService.prepare();
            this.vm.busy = true;
            const result = await this.scanService.scan();
            if (result) {
                await this.connect(result, false);
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
            await this.urlService.setRemoteURL(url);
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
