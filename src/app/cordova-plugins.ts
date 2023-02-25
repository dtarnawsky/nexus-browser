// Friendly names for cordova plugins
export const IonicDiscover = (window as any).IonicDiscover;
export const BarcodeScanner = (window as any).cordova?.plugins?.barcodeScanner;
export const Http = (window as any).cordova?.plugin?.http

// Cordova advanced Http Response
export interface AdvHttpResponse {
    data: any; // Raw data
    status: number; // eg 200
    url: string;
    headers: {
        'content-type': string;
        date: string;
        etag: string;
        expires: string;
        'content-length': string;
    }
}

// Cordova barcode scanner
export interface ScanPreferences {
    preferFrontCamera: boolean;
    showFlipCameraButton: boolean;
    showTorchButton: boolean;
    torchOn: boolean;
    saveHistory?: boolean;
    prompt: string;
    resultDisplayDuration: number;
    formats?: string;
    orientation: string;
    disableSuccessBeep: boolean;
    disableAnimations: boolean;
}

// Cordova barcode scanner
export interface ScanResult {
    text: string;
    format: string;
}