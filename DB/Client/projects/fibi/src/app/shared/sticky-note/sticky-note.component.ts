import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';

@Component({
  selector: 'app-sticky-note',
  templateUrl: './sticky-note.component.html',
  styleUrls: ['./sticky-note.component.css']
})
export class StickyNoteComponent implements OnInit, OnChanges {

  constructor() { }
  @Input() headerSection;
  @Input() minimize: boolean;
  @Input() maximize: boolean;
  @Input() IsShowStickyNote: boolean;
  @Input() StickyNoteContents: any = {};
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  showCommentBox = true;
  $showCommentBox: ISubscription;
  copyPlaceholderMessage = null;

  ngOnInit() {}
  ngOnChanges() {
    this.showCommentBox = this.IsShowStickyNote;
  }
  copyMessage(event) {
    if (event.target.tagName === 'B') {
      const selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.value = event.target.innerText;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      if (document.execCommand('copy')) {
       this.copyPlaceholderMessage = selBox.value + ' Copied!';
       setTimeout(() => { this.copyPlaceholderMessage = null; }, 2000);
      }
      document.body.removeChild(selBox);
    }
  }
}
