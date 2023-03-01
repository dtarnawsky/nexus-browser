import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CapacitorPageRoutingModule } from './capacitor-routing.module';
import { QRCodeModule } from 'angularx-qrcode';
import { CapacitorPage } from './capacitor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CapacitorPageRoutingModule,
    QRCodeModule
  ],
  declarations: [CapacitorPage]
})
export class CapacitorPageModule {}
