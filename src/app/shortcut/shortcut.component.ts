import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Service } from '../discovery';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export enum ShortcutAction {
  click,
  press,
}

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule],
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
  styleUrls: ['./shortcut.component.scss'],
})
export class ShortcutComponent {
  @Input() service: Service = { address: 'localhost', name: 'domain', secure: false };
  @Output() clicked = new EventEmitter<ShortcutAction>();
  constructor(private sanitizer: DomSanitizer) {}

  click() {
    this.clicked.emit(ShortcutAction.click);
  }

  press() {
    this.clicked.emit(ShortcutAction.press);
  }

  safeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
