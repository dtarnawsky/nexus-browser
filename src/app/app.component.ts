import { Component } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { UrlService } from './url.service';
import { IonActionSheet, IonApp, IonRouterOutlet } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { ellipsisHorizontal, qrCodeSharp, closeOutline, documentTextOutline } from "ionicons/icons";

@Component({
    standalone: true,
    imports: [IonApp, IonRouterOutlet, IonActionSheet],
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    constructor(private urlService: UrlService) {
        addIcons({ ellipsisHorizontal, qrCodeSharp, closeOutline, documentTextOutline });
        this.initializeApp();
    }

    private initializeApp() {
        App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
            const slug = event.url.split('.com').pop();
            if (slug) {
                this.urlService.deepLink(slug);
            }
        });
    }
}
