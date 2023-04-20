import { Injectable } from '@angular/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';

@Injectable({
  providedIn: 'root',
})
export class ScanService {
  constructor() { }

  public async scan(): Promise<string | undefined> {
    try {
      this.hide();
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (!status.granted) return undefined;
      if (status.denied) {
        this.show();
        alert('Camera access was denied. You can enabled it in settings.');
        await BarcodeScanner.openAppSettings();
        return;
      }
      const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });
      if (result.hasContent) {
        this.show();
        return result.content;
      }
    } catch (error) {
      console.error(error);
    }
    this.show();
    return undefined;
  }

  private hide() {
    BarcodeScanner.hideBackground();
    const e = document.querySelector('body');
    if (e) {
      e.style.display = 'none';
    }
  }

  private show() {
    const e = document.querySelector('body');
    if (e) {
      e.style.display = 'block';
    }
  }
}
