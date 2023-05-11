import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage {
  isNative: boolean = Capacitor.isNativePlatform();

  constructor() {}
}
