import { Component, OnDestroy, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import {  CompareData } from '../../../interfaces';
import { compareObject } from '../../../../../common/utilities/object-compare';
import { AwardPayments } from '../../../comparison-constants';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches dat for
 * all these components in one service call.
 */
@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsComponent implements OnDestroy, OnChanges {

  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    awardId: '',
    awardNumber: '',
    sequenceNumber : null,
    moduleVariableSections: [],
    currentSequenceNumber: null,
    isActiveComparison: false
   };
  @Input() currentMethod: string;
  isPaymentWidgetOpen = false;
  $subscriptions: Subscription[] = [];
  award: any = {};
  paymentsCache = {};
  constructor(private _toolKitEvents: ToolkitEventInteractionService) { }

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges () {
    if ( this.currentMethod + '' !== '') {
       this.currentMethod + '' === 'COMPARE'
       && (this._toolKitEvents.checkSectionTypeCode('121', this.comparisonData.moduleVariableSections)
       || this.comparisonData.isActiveComparison) ? this.compare() : this.setCurrentView();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  compare() {
    this.award = compareObject(this.comparisonData.base[AwardPayments.reviewSectionName],
      this.comparisonData.current[AwardPayments.reviewSectionName],
      AwardPayments.reviewSectionSubFields);
  }

  setCurrentView() {
    this.award = this.comparisonData.base[AwardPayments.reviewSectionName];
  }

}
