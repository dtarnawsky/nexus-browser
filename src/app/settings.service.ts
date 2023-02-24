import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Service } from './discovery';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  public async presentSettings(ctrl: ActionSheetController): Promise<string> {
    const actionSheet = await ctrl.create({
      header: 'Settings',
      buttons: [
        {
          text: 'Clear History',
          role: 'destructive',
          data: {
            action: 'delete',
          },
        },
        {
          text: 'Exit',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
    return result.role!;
  }

  public async presentActions(ctrl: ActionSheetController, service: Service): Promise<string> {
    const actionSheet = await ctrl.create({      
      header: service.name,
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          data: {
            action: 'delete',
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
    return result.role!;
  }
}
