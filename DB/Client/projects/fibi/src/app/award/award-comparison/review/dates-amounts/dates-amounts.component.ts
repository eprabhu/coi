import { CurrencyParserService } from '../../../../common/services/currency-parser.service';
import { Component, OnDestroy, ViewChild, ElementRef, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';
import { Subscription ,  forkJoin ,  of ,  Observable } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { DatesAmountsService } from './dates-amounts.service';
import { CompareDetails } from '../../interfaces';
import { compareArray } from '../../../../common/utilities/array-compare';
import { AwardDateAndAmounts } from '../../comparison-constants';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonDetails have the details for fetching the required data.
 */
@Component({
  selector: 'app-dates-amounts',
  templateUrl: './dates-amounts.component.html',
  styleUrls: ['./dates-amounts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatesAmountsService]
})
export class DatesAmountsComponent implements OnDestroy, OnChanges {

  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  awardAmountInfos: any = [];
  obligatedAmount = 0;
  anticipatedAmount = 0;
  awardId: any;
  isTransactions = false;
  @ViewChild('commentOptions', { static: false }) commentOptions: ElementRef;
  viewComment: any = {};
  datesAndAmountsCache = {};
  $subscriptions: Subscription[] = [];

  constructor(private _datesAmountsService: DatesAmountsService, public currencyFormatter: CurrencyParserService,
    public _commonService: CommonService, public dateFormatter: DateParserService,
     private _CDRef: ChangeDetectorRef, private _toolKitEvents: ToolkitEventInteractionService
  ) { document.addEventListener('mouseup', this.offClickHandler.bind(this)); }
  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * baseAwardId check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges() {
    if (this.comparisonDetails.baseAwardId) {
      this.currentMethod + '' === 'COMPARE'
      && (this._toolKitEvents.checkSectionTypeCode('108', this.comparisonDetails.moduleVariableSections)
        || this.comparisonDetails.isActiveComparison )? this.comparedDatesAndAmounts() : this.setCurrentView();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @returns void
   * compare the data actually it fetches the data for comparison.
   * Since wee need two different award version data to compare. forkJoin is used so that
   * we trigger the compare function once both version data has been loaded.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  comparedDatesAndAmounts(): void {
    this.$subscriptions.push(forkJoin(this.getDatesAmountData('base'), this.getDatesAmountData('current')).subscribe(
      data => {
        this.updateCache(data[0], 'base');
        this.updateCache(data[1], 'current');
        this.compare(data[0], data[1]);
        this._CDRef.detectChanges();
    }));
  }

  /**
   * @returns void
   * sets the value to view baseAwardId is used since base is always compared to current.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  setCurrentView(): void {
    this.$subscriptions.push(this.getDatesAmountData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.awardAmountInfos = data.awardAmountInfos;
      this._CDRef.detectChanges();
    }));
  }

  /**
   * @param  {any} base
   * @param  {any} current
   * @returns void
   * Compare the versions of the data. Compare method is used according to the type of the
   * data that need to be compared. Here since Array is the data type it is used.
   */
  compare(base: any, current: any): void {
    this.awardAmountInfos = compareArray(base[AwardDateAndAmounts.reviewSectionName],
      current[AwardDateAndAmounts.reviewSectionName],
      AwardDateAndAmounts.reviewSectionUniqueFields,
      AwardDateAndAmounts.reviewSectionSubFields);
      (this.awardAmountInfos)
  }

  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getDatesAmountData(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.datesAndAmountsCache[AWARD_ID]));
    } else {
      return this._datesAmountsService.datesAmountsLookUpData({
      'awardId': AWARD_ID, 
      'awardNumber': this.comparisonDetails.awardNumber,
      'awardSequenceNumber': type === 'base' ? this.comparisonDetails.sequenceNumber : this.comparisonDetails.currentSequenceNumber});
    }
  }

 /**
   * @param  {string} type
   * @returns string
   * return the award id from the input Comparison details according to the Type.
   * if base is the type reruns baseAwardId other wise currentAwardId.
   */
  getAwardId(type: string): string {
    return type === 'base' ? this.comparisonDetails.baseAwardId : this.comparisonDetails.currentAwardId;
  }
  checkInCache(cacheName: string) {
    return !!Object.keys(this.datesAndAmountsCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
     this.datesAndAmountsCache[awardId] = this.deepCopy(data);
    }
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
    this.awardAmountInfos.forEach(element => {
      this.obligatedAmount = this.obligatedAmount + parseInt(element.obligatedChange, 10);
      this.anticipatedAmount = this.anticipatedAmount + parseInt(element.anticipatedChange, 10);
    });
  }

}
