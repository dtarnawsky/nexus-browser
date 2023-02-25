import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
  })
  export class UIService {

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
  }