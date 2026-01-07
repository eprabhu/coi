import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.scss']
})
export class ReadMoreComponent {

  @Input() readMore: string = 'false';
  @Input() valueToShow: string = '';
  @Input() sliceCount: number = 50;
  @Input() classesToApply: string = '';
  @Input() clickableContent: boolean = false;
  @Output() emitClickEvent = new EventEmitter<any>();

  constructor() { }

  valueClicked() {
    if(this.clickableContent) {
        this.emitClickEvent.emit(true);
    }
  }

}
