import { Component, OnInit, Input, OnChanges, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ActivatedRoute } from '@angular/router';
import { Subscription ,  forkJoin ,  of ,  Observable } from 'rxjs';
import { CostShareService } from './cost-share.service';
import { CompareDetails } from '../../interfaces';
import { AwardCostShare } from '../../comparison-constants';
import { compareArray } from '../../../../common/utilities/array-compare';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { CurrencyParserService } from '../../../../common/services/currency-parser.service';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonDetails have the details for fetching the required data.
 */
@Component({
  selector: 'app-cost-share',
  templateUrl: './cost-share.component.html',
  styleUrls: ['./cost-share.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CostShareService]
})
export class CostShareComponent implements OnInit, OnDestroy, OnChanges {

  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  costShareResult: any = {};
  isCostSharesWidgetOpen = true;
  currency: any;
  organizationSum = 0;
  commitmentSum = 0;
  costShareMetSum = 0;
  costShareData: any = [];
  awardCostShares = [];
  costShareCache = {};
  $subscriptions: Subscription[] = [];

  constructor(private _commonService: CommonService, private _toolKitEvents: ToolkitEventInteractionService,
    private _costShareService: CostShareService, public dateFormatter: DateParserService,
    public currencyFormatter: CurrencyParserService, private _CDRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
  }

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
      && (this._toolKitEvents.checkSectionTypeCode('111', this.comparisonDetails.moduleVariableSections)
        || this.comparisonDetails.isActiveComparison) ? this.compareCostShare() : this.setCurrentView();
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
  compareCostShare(): void {
    this.$subscriptions.push(forkJoin(this.getCostShareData('base'), this.getCostShareData('current')).subscribe(
      data => {
        this.updateCache(data[0], 'base');
        this.updateCache(data[1], 'current');
        this.compare(data[0], data[1]);
        this.updateCurrentMethod('COMPARE');
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
    this.$subscriptions.push(this.getCostShareData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.costShareResult = data;
      this.awardCostShares = data.awardCostShares;
      this.updateCurrentMethod('VIEW');
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
    this.awardCostShares = compareArray(base[AwardCostShare.reviewSectionName],
      current[AwardCostShare.reviewSectionName],
      AwardCostShare.reviewSectionUniqueFields,
      AwardCostShare.reviewSectionSubFields);
  }

  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getCostShareData(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.costShareCache[AWARD_ID]));
    } else {
      return this._costShareService.getCostShareData(AWARD_ID);
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
    return !!Object.keys(this.costShareCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
      this.costShareCache[awardId] = this.deepCopy(data);
    }
  }

  updateCurrentMethod(method: string) {
    this.currentMethod = method;
  }
  /**
  * @param  {} costShareTypeCode
  * get cost share type code and returns corresponding type description to the table list
  */
  getCostshareTypes(costShareTypeCode) {
    let costShareType: any = {};
    if (this.costShareResult.costShareTypes && costShareTypeCode) {
      costShareType = this.costShareResult.costShareTypes.find(type => type.costShareTypeCode === costShareTypeCode);
      return (costShareType) ? costShareType.description : null;
    }
  }

  costShareSum() {
    this.commitmentSum = 0;
    this.costShareMetSum = 0;
    this.costShareData.forEach(element => {
      this.commitmentSum = this.commitmentSum + element.commitmentAmount;
      this.costShareMetSum = this.costShareMetSum + element.costShareMet;
    });
  }
}
