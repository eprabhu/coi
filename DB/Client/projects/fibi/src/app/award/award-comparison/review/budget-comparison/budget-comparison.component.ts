import { Component, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subscription, of, forkJoin, Observable } from 'rxjs';
import { CompareDetails } from '../../interfaces';
import { AwardBudgetOverview, AwardBudgetPeriods, AwardBudgetSummary, AwardPeriodDetail } from '../../comparison-constants';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { BudgetComparisonService } from './budget-comparison.service';
import { compareObject } from '../../../../common/utilities/object-compare';
import { compareArray } from '../../../../common/utilities/array-compare';
import { CurrencyParserService } from '../../../../common/services/currency-parser.service';
import { compareString } from '../../../../common/utilities/string-compare';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../../services/common-data.service';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonDetails have the details for fetching the required data.
 */

@Component({
  selector: 'app-budget-comparison',
  templateUrl: './budget-comparison.component.html',
  styleUrls: ['./budget-comparison.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BudgetComparisonService]
})
export class BudgetComparisonComponent implements OnChanges, OnDestroy {

  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  result: any = {};
  budgetCache = {};
  $subscriptions: Subscription[] = [];
  awardBudgetHeader: any = {};
  currentSummary: any = {};
  awardBudgetSummary: any = {};
  budgetPeriods: any = [];
  currentPeriod: any = [];
  currentDetailBudget: any = [];
  isPeriodsWidgetOpen = true;
  isSummaryWidgetOpen = true;
  isDetailedBudgetWidgetOpen = true;
  isOverviewWidgetOpen = true;
  isShowBudgetOHRatePercentage = false;
  isShowAwardBudgetFieldForSap = false;
  enableCostShareStatus = false;
  enabledCampusFlagAward = false;
  @Input() helpText: any = {};

  constructor(private _budgetService: BudgetComparisonService, public currencyFormatter: CurrencyParserService,
    public dateFormatter: DateParserService, private _CDRef: ChangeDetectorRef, public _commonService: CommonService,
    public _commonData: CommonDataService,private _toolKitEvents: ToolkitEventInteractionService) { }

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
      && (this._toolKitEvents.checkSectionTypeCode('102', this.comparisonDetails.moduleVariableSections)
        || this.comparisonDetails.isActiveComparison ) ? this.compareBudget() : this.setCurrentView();
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
   * reuse the same data instead of making a DB call. improves performance.
   */
  compareBudget(): void {
    this.$subscriptions.push(forkJoin(this.getBudgetData('base'), this.getBudgetData('current')).subscribe(
      data => {
        this.updateCache(data[0], 'base');
        this.updateCache(data[1], 'current');
        this.updateAwardHeader(data[0]);
        this.updateAwardHeader(data[1]);
        this.compare(data[0], data[1]);
        this._CDRef.detectChanges();
      }));
  }

  updateAwardHeader(data) {
    if (data.budgetHeader) {
      data.budgetHeader.onOffCampusFlag = data.budgetHeader.onOffCampusFlag === 'N' ? 'ON' 
                                          : (data.budgetHeader.onOffCampusFlag === 'F' ? 'OFF' : 'BOTH');
      data.budgetHeader.availableFundType = data.budgetHeader.availableFundType === 'O' ? 'Obligated Distributable'
        : 'Total Project Cost';
      data.budgetHeader.virement = data.budgetHeader.virement ? data.budgetHeader.virement : '0.00';
      data.budgetHeader.cumulativeVirement = data.budgetHeader.cumulativeVirement ? data.budgetHeader.cumulativeVirement : '0.00';
      this.awardBudgetHeader = data.budgetHeader;
      this.budgetPeriods = data.budgetHeader.budgetPeriods;
      this.isShowBudgetOHRatePercentage = data.isShowBudgetOHRatePercentage;
      this.enableCostShareStatus = data.enableCostShareStatus;
      this.isShowAwardBudgetFieldForSap = data.showAwardBudgetFieldForSap;
      this.enabledCampusFlagAward = data.enabledCampusFlagAward;
    }
  }
  /**
   * @returns void
   * sets the value to view baseAwardId is used since base is always compared to current.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  setCurrentView(): void {
    this.$subscriptions.push(this.getBudgetData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.updateAwardHeader(data);
      this.result = data;
      this.awardBudgetSummary =  this.sortBudgetData(data.budgetPeriodSummaries);
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
    this.budgetHeaderComparison(base, current);
    this.budgetPeriodsAndTotalComparison(base, current);
    this.detailBudgetComparison();
    this.budgetSummaryComparison(base, current);
    this.result.periodTotalSum = compareString(current['periodTotalSum'].toString(), base['periodTotalSum'].toString());
  }

  budgetHeaderComparison(base, current) {
    this.awardBudgetHeader = compareObject(base[AwardBudgetOverview.reviewSectionName],
      current[AwardBudgetOverview.reviewSectionName],
      AwardBudgetOverview.reviewSectionSubFields);
  }

  budgetPeriodsAndTotalComparison(base, current) {
    this.currentPeriod = JSON.parse(JSON.stringify(current.budgetHeader ?
      current.budgetHeader[AwardBudgetPeriods.reviewSectionName] : []));
    this.budgetPeriods = compareArray(base.budgetHeader ?
      base.budgetHeader[AwardBudgetPeriods.reviewSectionName] : [],
      current.budgetHeader ? current.budgetHeader[AwardBudgetPeriods.reviewSectionName] : [],
      AwardBudgetPeriods.reviewSectionUniqueFields,
      AwardBudgetPeriods.reviewSectionSubFields);
    this.result.budgetSummaryVOs = compareArray(
      base[AwardPeriodDetail.reviewSectionName],
      current[AwardPeriodDetail.reviewSectionName],
      AwardPeriodDetail.reviewSectionUniqueFields,
      AwardPeriodDetail.reviewSectionSubFields);
  }

  detailBudgetComparison() {
    const tempPeriods = JSON.parse(JSON.stringify(this.currentPeriod));
    
    this.budgetPeriods.forEach((period, index) => {
      if (period.status === 0) {
        const currentPeriod = this.findInCurrentPeriod(period.budgetPeriod);
        period.budgetDetails = compareArray(period.budgetDetails,
          currentPeriod.budgetDetails, ['costElementCode', 'lineItemNumber'],
          ['quantity', 'internalOrderCode', 'lineItemCost', 'lineItemDescription']);
      }
      this.currentDetailBudget = JSON.parse(JSON.stringify(tempPeriods.length ?
        tempPeriods.length > index ? tempPeriods[index].budgetDetails : [] : []));
      period.budgetDetails.forEach(person => {
        if (person.status === 0) {
          const currentPerson = this.findInCurrentPerson(person);
          person.personsDetails = compareArray(person.personsDetails, currentPerson ?
            currentPerson.personsDetails : [], ['budgetPerson.budgetPersonName', 'budgetPerson.jobCode'],
            ['startDate', 'endDate', 'internalOrderCode', 'percentageEffort', 'salaryRequested',
              'totalSalary']);
          const currentNonPerson = this.findInCurrentPerson(person);
          person.nonPersonsDetails = compareArray(person.nonPersonsDetails, currentNonPerson ?
            currentNonPerson.nonPersonsDetails : [], ['description'],
            ['description', 'internalOrderCode', 'lineItemCost', 'lineItemNumber']);
        }
      });
    });
  }

  budgetSummaryComparison(base, current) {
    this.currentSummary = JSON.parse(JSON.stringify(current[AwardBudgetSummary.reviewSectionName]));
    base[AwardBudgetSummary.reviewSectionName] = this.sortBudgetData(base[AwardBudgetSummary.reviewSectionName]);
    current[AwardBudgetSummary.reviewSectionName] = this.sortBudgetData(current[AwardBudgetSummary.reviewSectionName]);
    this.awardBudgetSummary = compareArray(base[AwardBudgetSummary.reviewSectionName],
      current[AwardBudgetSummary.reviewSectionName],
      AwardBudgetSummary.reviewSectionUniqueFields,
      AwardBudgetSummary.reviewSectionSubFields);
    this.awardBudgetSummary.forEach(summary => {
      if (summary.status === 0) {
        const currentCategory = this.findInCurrentSummary(summary.budgetCategory);
        summary.budgetSummaryVOs = compareArray(summary.budgetSummaryVOs,
          currentCategory.budgetSummaryVOs, ['periodNumber'],
          ['lineItemCost']);
      }
    });
  }
  /**
 * To sort the budget data
 */
  sortBudgetData(budgetData) {
    if (budgetData && budgetData.length) {
      return budgetData.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });
    } else {
      return [];
    }
  }

  findInCurrentSummary(category) {
    return this.currentSummary.find(summary => summary.budgetCategory === category);
  }
  findInCurrentPeriod(period) {
    return this.currentPeriod.find(current => current.budgetPeriod === period);
  }
  findInCurrentPerson(person) {
    return this.currentDetailBudget.find(current => current.lineItemNumber === person.lineItemNumber &&
      current.costElementCode === person.costElementCode);
  }
  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getBudgetData(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.budgetCache[AWARD_ID]));
    } else {
      return this._budgetService.awardBudgetData(AWARD_ID);
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

  checkInCache(cacheName: string): boolean {
    return !!Object.keys(this.budgetCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * @param  {any} data
   * @param  {string} type
   * @returns void
   * save the value to the cache. Cache name is set same as award id since each version will
   * have a unique award id.
   */
  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
      this.budgetCache[awardId] = this.deepCopy(data);
    }
  }

}
