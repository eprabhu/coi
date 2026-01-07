import { Component, OnInit, OnDestroy, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, of, forkJoin, Observable } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ProjectCostOverviewViewService } from './project-cost-overview-view.service';
import { CompareDetails } from '../../interfaces';
import { AwardProjectOverview } from '../../comparison-constants';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { compareObject } from '../../../../common/utilities/object-compare';
import { CurrencyParserService } from '../../../../common/services/currency-parser.service';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';
import { CommonService } from '../../../../common/services/common.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonDetails have the details for fetching the required data.
 */
@Component({
  selector: 'app-project-cost-overview',
  templateUrl: './project-cost-overview-view.component.html',
  styleUrls: ['./project-cost-overview-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProjectCostOverviewViewService]
})
export class ProjectCostOverviewViewComponent implements OnInit, OnDestroy, OnChanges {
  isProjectCost = false;
  awardId: any;
  awardCostDetails: any = {};
  isShowCollapse = true;
  $subscriptions: Subscription[] = [];
  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  projectOverviewCache = {};

  constructor(private _overviewService: ProjectCostOverviewViewService, private route: ActivatedRoute,
    public currencyFormatter: CurrencyParserService, public dateFormatter: DateParserService,
    private _CDRef: ChangeDetectorRef, private _toolKitEvents: ToolkitEventInteractionService,
    public _commonService: CommonService) { }
  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * baseAwardId check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnInit() {
    this.awardId = this.route.snapshot.queryParams['awardId'];
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  ngOnChanges() {
    if (this.comparisonDetails.baseAwardId) {
      this.currentMethod + '' === 'COMPARE'
      && (this._toolKitEvents.checkSectionTypeCode('130', this.comparisonDetails.moduleVariableSections)
      || this.comparisonDetails.isActiveComparison ) ? this.compareProjectView() : this.setCurrentView();
    }
  }

  /**
   * @returns void
   * compare the data actually it fetches the data for comparison.
   * Since wee need two different award version data to compare. forkJoin is used so that
   * we trigger the compare function once both version data has been loaded.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  compareProjectView(): void {
    this.$subscriptions.push(forkJoin(this.getProjectCostData('base'), this.getProjectCostData('current')).subscribe(
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
    this.$subscriptions.push(this.getProjectCostData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.awardCostDetails = data;
      if (this.awardCostDetails.activeAmountInfo) {
        this.awardCostDetails.activeAmountInfo.currencySymbol =
          this.awardCostDetails.activeAmountInfo.currency ? this.awardCostDetails.activeAmountInfo.currency.currencySymbol : null;
      }
      if (this.awardCostDetails.pendingAmountInfo) {
        this.awardCostDetails.pendingAmountInfo.currencySymbol =
          this.awardCostDetails.pendingAmountInfo.currency ? this.awardCostDetails.pendingAmountInfo.currency.currencySymbol : null;
      }
      this._CDRef.detectChanges();
    }));
  }

  /**
   * @param  {any} base
   * @param  {any} current
   * @returns void
   * Compare the versions of the data. Compare method is used according to the type of the
   * data that need to be compared. Here compare Object since Object is the data type it is used.
   */
  compare(base: any, current: any): void {
    if (base.activeAmountInfo) {
      base.activeAmountInfo.currencySymbol = base.activeAmountInfo.currency ?
        base.activeAmountInfo.currency.currencySymbol : null;
    }
    if (base.pendingAmountInfo) {
      base.pendingAmountInfo.currencySymbol = base.pendingAmountInfo.currency ?
        base.pendingAmountInfo.currency.currencySymbol : null;
    }
    if (current.activeAmountInfo) {
      current.activeAmountInfo.currencySymbol = current.activeAmountInfo.currency ?
        current.activeAmountInfo.currency.currencySymbol : null;
    }
    if (current.pendingAmountInfo) {
      current.pendingAmountInfo.currencySymbol = current.pendingAmountInfo.currency ?
        current.pendingAmountInfo.currency.currencySymbol : null;
    }
    this.awardCostDetails = compareObject(base, current, AwardProjectOverview.reviewSectionSubFields);
  }


  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getProjectCostData(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.projectOverviewCache[AWARD_ID]));
    } else {
      return this._overviewService.getAwardFunds(
        {
          'awardId': AWARD_ID, 
          'awardNumber': this.comparisonDetails.awardNumber
        }
      );
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
    return !!Object.keys(this.projectOverviewCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
      this.projectOverviewCache[awardId] = this.deepCopy(data);
    }
  }

}
