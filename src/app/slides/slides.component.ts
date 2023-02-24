import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-slides',
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss'],
})
export class SlidesComponent {

  currentIndex: number = 0;
  lastIndex: number = 0;
  slides = ['1', '2', '3'];
  @ViewChild('slider', { read: ElementRef }) slider: any;

  constructor() { }

  changeSlide(index: number) {
    this.currentIndex = index;
    this.slider.nativeElement.scrollLeft = this.currentIndex * this.slider.nativeElement.children[0].clientWidth;
  }

  public onSliderScroll(event: any) {
    const index = Math.trunc(event?.srcElement.scrollLeft / event?.srcElement.children[0].clientWidth);
    if (index != this.lastIndex) {
      this.lastIndex = index;
      this.currentIndex = index;
    }
  }

}
