import { Directive, HostListener, ElementRef } from '@angular/core';

/**
 * written by Mahesh Sreenath V M
 * its a click and drag directive which enables to change simple div to a draggable one.
 * please see sticky-note component for its implementation.
 * header class is hard coded for now('sticky-header') which can be changed to dynamic.
 * But since this serves the most use cases this is used.
 * TODO @self please update the name of the selector and component it looks messy.
 */
@Directive({
  selector: '[appClickNdrag]'
})
export class ClickNdragDirective {
  element: HTMLElement;
  isMouseDown = false;
  offset = [];
  constructor(public hostElement: ElementRef) {
    this.element = hostElement.nativeElement;
  }
  @HostListener('mousedown', ['$event'])
   public onListenerTriggered(event: any): void {
     if (event.target.className === 'sticky-header') {
      this.isMouseDown = true;
      this.offset.push(this.element.offsetLeft - event.clientX);
      this.offset.push(this.element.offsetTop - event.clientY);
     }
   }
   @HostListener('mousemove', ['$event'])
   public onListenerMove(event: any): void {
    event.preventDefault();
    if (this.isMouseDown ) {
      this.element.style.left = this.offset[0] + event.clientX + 'px';
      this.element.style.top  = this.offset[1] + event.clientY + 'px';
    }
   }
   @HostListener('mouseup', ['$event'])
   public onListenerEnd(event: any): void {
    this.isMouseDown = false;
   }
   @HostListener('mouseleave', ['$event'])
   public onListenerLeave(event: any): void {
    this.isMouseDown = false;
   }
}
