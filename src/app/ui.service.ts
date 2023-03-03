import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { KeepAwake } from '@capacitor-community/keep-awake';

@Injectable({
  providedIn: 'root'
})
export class UIService {

  private woke: boolean = false;

  public async alert(alertController: AlertController, message: string) {
    const alert = await alertController.create({
      header: message,
      buttons: ['OK']
    });

    await alert.present();
    await alert.onDidDismiss();
  }

  public focus(id: string) {
    document.getElementById(id)?.focus();
  }

  public async keepAwake() {
    if (this.woke) return;    
    const { isSupported } = await KeepAwake.isSupported();
    if (isSupported) {
      await KeepAwake.keepAwake();
    }
    this.woke = true; // Only call once
  }
}