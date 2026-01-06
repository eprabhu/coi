import { Component, OnDestroy, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import { DatesAmountsService } from '../dates-amounts.service';
import { CommonService } from '../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-dates-amounts-view',
  templateUrl: './dates-amounts-view.component.html',
  styleUrls: ['./dates-amounts-view.component.css']
})
export class DatesAmountsViewComponent implements OnChanges, OnDestroy {
  transactionList: any = [];
  obligatedAmount = 0;
  anticipatedAmount = 0;
  awardId: any;
  isTransactions = false;
  @ViewChild('commentOptions', { static: false }) commentOptions: ElementRef;
  viewComment: any = {};
  $subscriptions: Subscription[] = [];
  @Input() datesAndAmountsData: any = {};


  constructor(
    public _commonService: CommonService
  ) { document.addEventListener('mouseup', this.offClickHandler.bind(this)); }

  ngOnChanges() {
    if (this.datesAndAmountsData) {
      this.transactionList = this.datesAndAmountsData.awardAmountInfos;
      this.totalAmountCalculation();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param  {any} event
   * Hide comments dropdown on clicking
   */
  offClickHandler(event: any) {
    if (this.commentOptions) {
      if (!this.commentOptions.nativeElement.contains(event.target)) {
        this.viewComment = {};
      }
    }
  }

  enableOrDisableComment(index) {
    this.viewComment = {};
    this.viewComment[index] = true;
  }
  /**
  * calculates the total sum of obligation change and anticipated change
  */
  totalAmountCalculation() {
    this.transactionList.forEach(element => {
      this.obligatedAmount = this.obligatedAmount + parseInt(element.obligatedChange, 10);
      this.anticipatedAmount = this.anticipatedAmount + parseInt(element.anticipatedChange, 10);
    });
  }

}
