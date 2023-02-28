import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.page.html',
  styleUrls: ['./link.page.scss'],
})
export class LinkPage implements OnInit {

  opening: boolean = true;
  web: boolean = false;
  appStoreUrl = 'https://apps.apple.com/us/app/nexus-web-browser/id6445866986';
  playStoreUrl = 'https://play.google.com/store/apps/details?id=com.nexusconcepts.nexus';

  constructor() { }

  ngOnInit() {
    document.location.href = 'io.ionic.capview://launch';
    this.web = !this.isAndroid() && !this.isIOS() && (Capacitor.getPlatform() == 'web');
    let waitTime = this.web ? 5 : 5000;
    const timer = setTimeout(() => {
      this.launchStore();
    }, waitTime);


  }

  private launchStore() {
    if (document.hidden) {
      console.log('dont launch store');
      return;
    }
    switch (Capacitor.getPlatform()) {
      case 'ios': this.openAppStore(); break;
      case 'android': this.openPlayStore(); break;
      case 'web': this.isIOS() ? this.openAppStore() : (this.isAndroid() ? this.openPlayStore() : this.showLinks()); break;
      default: console.log(Capacitor.getPlatform());
    }
  }

  public openAppStore() {
    this.open(this.appStoreUrl);
  }

  public openPlayStore() {
    this.open(this.playStoreUrl);
  }

  private showLinks() {
    this.opening = false;
    console.log('This is web');
  }

  private open(url: string) {
    document.location.href = url;
    this.opening = false;
  }

  public isIOS() {
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

  public isAndroid() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1;
  }
}
