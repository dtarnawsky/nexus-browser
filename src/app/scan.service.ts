import { Injectable } from '@angular/core';
import { ScanPreferences } from './scan-preferences';
import { ScanResult } from './scan-result';
@Injectable({
  providedIn: 'root'
})
export class ScanService {

  constructor() { }

  public scan(): Promise<ScanResult> {
    const preferences: ScanPreferences =
    {
      preferFrontCamera: false, // iOS and Android
      showFlipCameraButton: false, // iOS and Android
      showTorchButton: false, // iOS and Android
      torchOn: false, // Android, launch with the flashlight switched on (if available)
      saveHistory: false, // Android, save scan history (default false)
      prompt: 'Place the QR Code inside the scan area', // Android
      resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
      formats: 'QR_CODE,PDF_417', // default: all but PDF_417 and RSS_EXPANDED
      orientation: 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device
      disableAnimations: true, // iOS
      disableSuccessBeep: true // iOS and Android
    };

    return new Promise((resolve,reject) => {
      (window as any).cordova.plugins.barcodeScanner.scan(
        (result: ScanResult) => { resolve(result); },
        (error: string) => { reject(error); },
        preferences);
    });   
  }
}
