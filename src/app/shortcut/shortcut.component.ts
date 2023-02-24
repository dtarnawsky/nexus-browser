import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Service } from '../discovery';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule],
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
  styleUrls: ['./shortcut.component.scss'],
})
export class ShortcutComponent {

  @Input() service: Service = { address: 'localhost', name: 'domain'};
  @Output() clicked = new EventEmitter<string>();
  constructor() { }

  click() {
    this.clicked.emit('click');
  }

  press() {
    this.clicked.emit('press');
  }

}
