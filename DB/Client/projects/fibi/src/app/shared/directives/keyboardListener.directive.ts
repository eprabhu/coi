import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

/**
 * Written by Mahesh Sreenath V M
 * a dynamic view selector and highlighter for applications.
 * by adding this yo provide support for keyboard events such as arrow down arrow up etc.
 * see this link for more details https://github.com/maheshpolus/directives/tree/master/keyboardListener
 * happy coding :)
 * TODO @self clean up the code with empty events as input
 * which might lead to error in angular 8 or later build process.
 */
@Directive({
  selector: '[appKeyboardListener]'
})
export class KeyboardListenerDirective  {
  @Output() onEscape: EventEmitter<any> = new EventEmitter();
  counter = -1;
  constructor() {}

  @HostListener('keydown.arrowdown') arrowDown() {
    event.preventDefault();
    this.removeHighlight();
    this.counter < document.getElementsByClassName('app-kb-listener').length - 1 ?  this.counter++ : this.counter = 0;
    this.addHighlight();
  }
  @HostListener('keydown.arrowup') arrowUp() {
    event.preventDefault();
    this.removeHighlight();
    this.counter > 0 ? this.counter-- :  this.counter = document.getElementsByClassName('app-kb-listener').length - 1;
    this.addHighlight();
  }
  @HostListener('keydown.enter') keyEnter() {
    event.preventDefault();
    (document.getElementsByClassName('app-kb-listener')[this.counter] as HTMLInputElement).dispatchEvent(new Event('mousedown'));
    (document.getElementsByClassName('app-kb-listener')[this.counter] as HTMLInputElement).click();
    (document.activeElement as HTMLInputElement).blur();
    this.counter = -1;
  }
  @HostListener('keydown.esc') keyEsc() {
    this.cancelSearch();
  }
  @HostListener('focusout') cancel() {
    this.cancelSearch();
  }
  cancelSearch() {
    this.counter = -1;
    this.onEscape.emit(false);
  }
  removeHighlight() {
    const el = (document.getElementsByClassName('app-kb-listener')[this.counter] as HTMLInputElement);
    if (el) {
      el.classList.remove('app-item-highlighted');
    }
  }
  addHighlight() {
    const el = (document.getElementsByClassName('app-kb-listener')[this.counter] as HTMLInputElement);
    if (el) {
        el.scrollIntoView({block: 'end'});
        el.classList.add('app-item-highlighted');
    }
  }
}
