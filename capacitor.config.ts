import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'ionic.capview',
  appName: 'capview',
  webDir: 'www',
  bundledWebRuntime: false,
  backgroundColor: '#333333',
  loggingBehavior: 'none',
  server: {
    allowNavigation: ['*'],
    cleartext: true,
    errorPath: 'error.html'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#333333',
    buildOptions: {
      keystorePath: '/Volumes/CodeDrive/Code/nexus-browser-1/keys/AndroidKeys',
      keystoreAlias: 'key0'
    }
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#333333',
      splashFullScreen: true,
      splashImmersive: false,
      launchAutoHide: false
    },
    Keyboard: {
      style: KeyboardStyle.Dark,
    },
    CapacitorHttp: {
      enabled: false
    }
  }
};

export default config;
