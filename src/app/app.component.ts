import { Component } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { UrlService } from './url.service';
import { IonActionSheet, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisHorizontal, qrCodeSharp, closeOutline, documentTextOutline } from 'ionicons/icons';
import { defineCustomElement } from '@ionic/core/components/ion-modal.js';

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

    // This is required to fix tree shaking until this issue is resolved: https://github.com/ionic-team/ionic-framework/issues/28385
    defineCustomElement();
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
