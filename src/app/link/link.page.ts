import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.page.html',
  styleUrls: ['./link.page.scss'],
})
export class LinkPage implements OnInit {

  opening: boolean = true;
  appStoreUrl = 'https://apps.apple.com/us/app/nexus-web-browser/id6445866986';
  playStoreUrl = 'https://play.google.com/store/apps/details?id=com.nexusconcepts.nexus';

  constructor() { }

  ngOnInit() {
    const timer = setTimeout(() => {
      this.launchStore();
    }, 3000);
    document.location.href = 'io.ionic.capview://launch';
  }

  private launchStore() {
    switch (Capacitor.getPlatform()) {
      case 'ios': this.openAppStore(); break;
      case 'android': this.openPlayStore(); break;
      case 'web': this.isIOS() ? this.openAppStore() : (this.isAndroid() ? this.openPlayStore() : this.showLinks()); break;
      default: console.log(Capacitor.getPlatform());
    }
  }

  private openAppStore() {
    this.open(this.appStoreUrl);
  }

  private openPlayStore() {
    this.open(this.playStoreUrl);
  }

  private showLinks() {
    this.opening = false;
    console.log('This is web');
  }

  private open(url: string) {
    document.location.href = url;
  }

  private isIOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
      // iPad on iOS 13 detection
      || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  }

  private isAndroid() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1;
  }
}
