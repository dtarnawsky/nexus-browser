import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { IonRouterLink, IonContent, IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RouterLink,
    IonRouterLink,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage {
  isNative: boolean = Capacitor.isNativePlatform();

  constructor() {
    addIcons({ closeOutline });
  }
}
