import { Directive, Input, HostListener, ElementRef, OnChanges, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appAutoGrow]',
  providers: [NgModel],
})
export class AutoGrowDirective implements OnChanges, OnInit {

  @Input() ngModel;
  height: string;
  private el: HTMLElement;

  @HostListener('input', ['$event.target'])
  onInput(): void {
    setTimeout(() => {
      this.updateHeight();
    });
  }

  @HostListener('focus', ['$event.target'])
  onFocus(): void {
    setTimeout(() => {
      this.updateHeight();
    });
  }

  @HostListener('paste', ['$event.target'])
  onPaste(): void {
    setTimeout(() => {
      this.updateHeight();
    });
  }

  @HostListener('cut', ['$event.target'])
  onCut(): void {
    setTimeout(() => {
      this.updateHeight();
    });
  }

  constructor(public element: ElementRef) {
    this.el = element.nativeElement;
    this.el.style.overflow = 'hidden';
    this.height = this.el.style.height ? this.el.style.height : '35px';
    setTimeout(() => {
      this.updateHeight();
    }, 500);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateHeight();
    }, 500);
  }

  ngOnChanges() {
    setTimeout(() => {
      this.updateHeight();
    }, 200);
  }

  updateHeight(): void {
    // perform height adjustments after input changes, if height is different
    this.el.style.overflow = 'hidden';
    const textAreaElement = this.element.nativeElement;
    textAreaElement.style.height = 'auto';
    textAreaElement.style.height = `${textAreaElement.scrollHeight}px`;
    const height = parseInt(this.height.slice(0, -2));
    if (!this.ngModel || textAreaElement.scrollHeight <= height) {
      this.el.style.height = this.height;
    }
  }
}
