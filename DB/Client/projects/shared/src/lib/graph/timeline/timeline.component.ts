import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventHistoryItem } from '../interface';
import { listAnimation } from '../../../../../coi/src/app/common/utilities/animations';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  animations: [listAnimation]
})
export class TimelineComponent {

  @Input() history = [];
  @Output() historySelectEvent: EventEmitter<any> = new EventEmitter();
  @Input() selectedEventIndex = 0;

  showContent = false;

  constructor() { }

  emitEventToParent(event: EventHistoryItem, index: number): void {
    this.historySelectEvent.emit(event);
  }

}
