import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ionic.capview',
  appName: 'capview',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {    
    allowNavigation: ['*'],
    cleartext: true,
    errorPath: 'error.html'
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#333',
      launchAutoHide: false
    },
    CapacitorHttp: {
      enabled: false
    }
  }
};

export default config;
