import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Component({
  selector: '[app-previous-excluded]',
  templateUrl: './previous-excluded.component.html',
  styleUrls: ['./previous-excluded.component.css']
})
export class PreviousExcludedComponent implements OnInit {

  @Input() excludedTransaction: any = {};
  @Input() category: any = {};
  @Input() isEditMode = false;
  @Output() selectedTransactions = new EventEmitter();


  constructor(public _commonService: CommonService) { }

  ngOnInit() {
  }

  toggleExclude(transaction) {
    this.selectedTransactions.emit(transaction);
  }
}
