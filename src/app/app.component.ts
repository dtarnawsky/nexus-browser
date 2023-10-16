import { Component } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { UrlService } from './url.service';
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";

@Component({
    standalone: true,
    imports: [IonApp, IonRouterOutlet],
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    constructor(private urlService: UrlService) {
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
