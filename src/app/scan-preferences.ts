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