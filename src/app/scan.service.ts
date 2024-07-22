import { Injectable } from '@angular/core';
import { CapacitorBarcodeScannerOptions, CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
@Injectable({
  providedIn: 'root',
})
export class ScanService {
  constructor() { }

  public async prepare(): Promise<void> {
  }

  public async scan(): Promise<string | undefined> {
    try {
      this.hide();
      const options: CapacitorBarcodeScannerOptions = { hint: CapacitorBarcodeScannerTypeHint.QR_CODE };
      const result = await CapacitorBarcodeScanner.scanBarcode(options);
      //const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });
      if (result.ScanResult) {
        this.show();
        return result.ScanResult;
      }
    } catch (error) {
      console.error(error);
    }
    this.show();
    return undefined;
  }

  private hide() {
    // BarcodeScanner.hideBackground();
    // const e = document.querySelector('body');
    // if (e) {
    //   e.style.display = 'none';
    // }
  }

  private show() {
    // const e = document.querySelector('body');
    // if (e) {
    //   e.style.display = 'block';
    // }
  }
}
