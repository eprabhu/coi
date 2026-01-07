import { Directive, Input, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutoGrow]'
})
export class AutoGrowDirective {

  private el: HTMLElement;
  @HostListener('input', ['$event.target'])
    onInput(textArea: HTMLTextAreaElement): void {
      this.updateHeight();
    }
    @HostListener('focus', ['$event.target'])
    onFocus(textArea: HTMLTextAreaElement): void {
      this.updateHeight();
    }

  constructor(public element: ElementRef) {
    this.el = element.nativeElement;
  }

  updateHeight(): void {
    // perform height adjustments after input changes, if height is different
    if (this.el.style.height == this.element.nativeElement.scrollHeight + 'px') {
      return;
    }
    this.el.style.overflow = 'hidden';
    this.el.style.height = 'auto';
    this.el.style.height = this.el.scrollHeight + 'px';
  }


}
