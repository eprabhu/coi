import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appTailingSpaceRemover]'
})
export class TailingSpaceRemoverDirective {

  @Output() ngModelChange = new EventEmitter();

  constructor(private el: ElementRef) {
  }

  @HostListener('focusout') onFocusOut() {
    const trimmedValue = this.el.nativeElement.value.trim();
    this.ngModelChange.emit(trimmedValue);
  }

}
