import { Directive, Output, HostListener, EventEmitter, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDragNdrop]'
})
export class DragNdropDirective {
  element: any;

  constructor(public elmnt: ElementRef) {
    this.element = elmnt.nativeElement; }
  @Input() multiple;
  @Output() filesDropEvent: EventEmitter<any> = new EventEmitter();

  @HostListener('dragover') onDragOver() {
    this.element.style.border = '2px hsl(211, 100%, 50%)';
    this.element.style.backgroundColor = 'hsla(211, 70%, 68%, 0.3)';
    this.element.style.borderStyle  = 'dotted';
    return false;
  }
  @HostListener('dragenter' ,['$event']) onDragStart(e) {
    e.dataTransfer.setData('text', e.target.id);
    return false;
  }
  @HostListener('drop', ['$event']) handleDrop(e) {
    e.preventDefault();
    this.filesDropEvent.emit(e.dataTransfer.files);
    this.element.style.border = '2px hsl(214, 15%, 81%)';
    this.element.style.backgroundColor = 'hsl(246, 100%, 96%)';
    this.element.style.borderStyle  = 'dotted';
  }
}
