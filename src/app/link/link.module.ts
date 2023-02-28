import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LinkPageRoutingModule } from './link-routing.module';
import { QRCodeModule } from 'angularx-qrcode';
import { LinkPage } from './link.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LinkPageRoutingModule,
    QRCodeModule
  ],
  declarations: [LinkPage]
})
export class LinkPageModule {}
