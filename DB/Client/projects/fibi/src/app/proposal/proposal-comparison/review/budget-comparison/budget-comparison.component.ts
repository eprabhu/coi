import { ProposalModularBudget, ProposalSimpleBudget } from './../../comparison-constants';
import { Component, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subscription, of, forkJoin, Observable } from 'rxjs';
import { CompareDetails } from '../../interfaces';
import { ProposalBudgetOverview, ProposalBudgetPeriods, ProposalBudgetSummary, ProposalPeriodDetail } from '../../comparison-constants';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { BudgetComparisonService } from './budget-comparison.service';
import { compareObject } from '../../../../common/utilities/object-compare';
import { compareArray } from '../../../../common/utilities/array-compare';
import { CurrencyParserService } from '../../../../common/services/currency-parser.service';
import { compareString } from '../../../../common/utilities/string-compare';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { setHelpTextForSubItems } from '../../../../common/utilities/custom-utilities';
import { ProposalService } from '../../../services/proposal.service';

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given proposalId.
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
  budgetCache = {};
  $subscriptions: Subscription[] = [];
  proposalBudgetHeader: any = null;
  currentSummary: any = {};
  proposalBudgetSummary: any = null;
  budgetPeriods: any = [];
  currentPeriod: any = [];
  currentDetailBudget: any = [];
  isPeriodsWidgetOpen = true;
  isSummaryWidgetOpen = true;
  isDetailedBudgetWidgetOpen = true;
  isOverviewWidgetOpen = true;
  isModularBudgetWidgetOpen = true;
  isSimpleBudgetWidgetOpen = true;
  @Input() helpText: any = {};
  budgetData: any = {};
  simpleBudgetVo: any = [];
  budgetModularVO: any = {};
  currentSimpleBudget: any = [];
  currentLineItem: any = [];
  budgetSummaryVOs: any = [];
  periodTotalCostShareSum: string;
  periodTotalFundRequestedSum: string;
  periodTotalSum: string;

  constructor(private _budgetService: BudgetComparisonService, public currencyFormatter: CurrencyParserService,
    public _proposalService: ProposalService,
    public dateFormatter: DateParserService, private _CDRef: ChangeDetectorRef, public _commonService: CommonService) { }

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no proposal number available to fetch data. to avoid empty service call
   * baseProposalId check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   */
  ngOnChanges() {
    if (Object.keys(this.helpText).length && this.helpText.budget && this.helpText.budget.parentHelpTexts.length) {
      this.helpText = setHelpTextForSubItems(this.helpText, 'budget');
    }
    if (this.comparisonDetails.baseProposalId) {
      this.currentMethod + '' === 'COMPARE' ? this.compareBudget() : this.setCurrentView();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @returns void
   * compare the data actually it fetches the data for comparison.
   * Since wee need two different proposal version data to compare. forkJoin is used so that
   * we trigger the compare function once both version data has been loaded.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance.
   */
  compareBudget(): void {
    this.$subscriptions.push(forkJoin(this.getBudgetData('base'), this.getBudgetData('current')).subscribe(
      data => {
        this.updateCache(data[0], 'base');
        this.updateCache(data[1], 'current');
        this.updateProposalBudgetHeader(data[0]);
        this.updateProposalBudgetHeader(data[1]);
        this.compare(data[0], data[1]);
        this._CDRef.detectChanges();
      }));
  }

  updateProposalBudgetHeader(data) {
    this.budgetData = data;
    if (data.budgetHeader) {
      data.budgetHeader.campusFlag = data.budgetHeader.campusFlag === 'N' ? 'ON' 
                                     : (data.budgetHeader.campusFlag === 'F' ? 'OFF' : 'BOTH');
      data.budgetHeader.isAutoCalc = data.budgetHeader.isAutoCalc ? 'ON' : 'OFF';
      if(data.budgetTemplateTypes && data.budgetTemplateTypes.length) {
        const SELECTED_VALUE = data.budgetTemplateTypes.find(e => e.budgetTemplateTypeId === data.budgetHeader.budgetTemplateTypeId);
        data.budgetHeader.budgetTemplate = SELECTED_VALUE ? SELECTED_VALUE : {};
      }
      this.proposalBudgetHeader = data.budgetHeader;
      this.budgetPeriods = data.budgetHeader.budgetPeriods;
    } else {
      this.proposalBudgetHeader = null;
      this.budgetPeriods = [];
    }
    this.budgetModularVO = data.budgetModularVO;
    this.setPeriodId();
    this.simpleBudgetVo = this.budgetData.simpleBudgetVo;
    if (data.budgetSummary) {
      this.proposalBudgetSummary = this.sortBudgetData(data.budgetSummary.budgetPeriodSummaries);
      this.budgetSummaryVOs = data.budgetSummary.budgetSummaryVOs;
      this.periodTotalCostShareSum = data.budgetSummary['periodTotalCostShareSum'].toString();
      this.periodTotalFundRequestedSum = data.budgetSummary['periodTotalFundRequestedSum'].toString();
      this.periodTotalSum = data.budgetSummary['periodTotalSum'].toString();
    } else {
      this.proposalBudgetSummary = [];
      this.budgetSummaryVOs = [];
    }
  }

  setPeriodId() {
    if (this.budgetModularVO && this.budgetModularVO.modularBudget && this.budgetModularVO.modularBudget.length) {
      this.budgetModularVO.modularBudget.forEach((element, index) => {
        element.periodId = index + 1;
      });
    }
  }
  /**
   * @returns void
   * sets the value to view baseProposalId is used since base is always compared to current.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  setCurrentView(): void {
    this.$subscriptions.push(this.getBudgetData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.updateProposalBudgetHeader(data);
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
    this.simpleBudgetComparison(base, current);
    this.modularBudgetComparison(base, current);
    this.periodTotalCostShareSum = compareString(current.budgetSummary ? current.budgetSummary['periodTotalCostShareSum'].toString() : '',
    base.budgetSummary ? base.budgetSummary['periodTotalCostShareSum'].toString(): '');
    this.periodTotalFundRequestedSum = compareString(current.budgetSummary ? current.budgetSummary['periodTotalFundRequestedSum'].toString(): '', 
    base.budgetSummary ? base.budgetSummary['periodTotalFundRequestedSum'].toString(): '');
    this.periodTotalSum = compareString(current.budgetSummary ? current.budgetSummary['periodTotalSum'].toString(): '', 
    base.budgetSummary ? base.budgetSummary['periodTotalSum'].toString(): '');
  }

  budgetHeaderComparison(base, current) {
    this.proposalBudgetHeader = compareObject(base[ProposalBudgetOverview.reviewSectionName],
      current[ProposalBudgetOverview.reviewSectionName],
      ProposalBudgetOverview.reviewSectionSubFields);
  }

  budgetPeriodsAndTotalComparison(base, current) {
    this.currentPeriod = JSON.parse(JSON.stringify(current.budgetHeader ?
      current.budgetHeader[ProposalBudgetPeriods.reviewSectionName] : []));
    this.budgetPeriods = compareArray(base.budgetHeader ?
      base.budgetHeader[ProposalBudgetPeriods.reviewSectionName] : [],
      current.budgetHeader ? current.budgetHeader[ProposalBudgetPeriods.reviewSectionName] : [],
      ProposalBudgetPeriods.reviewSectionUniqueFields,
      ProposalBudgetPeriods.reviewSectionSubFields);
    this.budgetData.budgetSummaryVOs = compareArray(
      base[ProposalPeriodDetail.reviewSectionName],
      current[ProposalPeriodDetail.reviewSectionName],
      ProposalPeriodDetail.reviewSectionUniqueFields,
      ProposalPeriodDetail.reviewSectionSubFields);
  }

  detailBudgetComparison() {
    const tempPeriods = JSON.parse(JSON.stringify(this.currentPeriod));
    this.budgetPeriods.forEach((period, index) => {
      if (period.status === 0) {
        const currentPeriod = this.findInCurrentPeriod(period.budgetPeriod);
        period.budgetDetails = compareArray(period.budgetDetails,
          currentPeriod.budgetDetails, ['costElementCode', 'lineItemNumber'],
          ['quantity', 'costSharingPercentage', 'lineItemCost',
            'costSharingAmount', 'sponsorRequestedAmount']);
      }
      this.currentDetailBudget = JSON.parse(JSON.stringify(tempPeriods.length ?
        tempPeriods.length > index ? tempPeriods[index].budgetDetails : [] : []));
      period.budgetDetails.forEach(person => {
        if (person.status === 0) {
          const currentPerson = this.findInCurrentPerson(person);
          person.personsDetails = compareArray(person.personsDetails, currentPerson ?
            currentPerson.personsDetails : [], ['budgetPerson.personName', 'budgetPerson.jobCode'],
            ['startDate', 'endDate', 'costSharingPercentage', 'percentageEffort', 'salaryRequested',
              'costSharingAmount', 'sponsorRequestedAmount']);
        }
      });
    });
  }

  findInCurrentPerson(person) {
    return this.currentDetailBudget.find(current => current.lineItemNumber === person.lineItemNumber &&
      current.costElementCode === person.costElementCode);
  }

  modularBudgetComparison(base, current) {
    this.budgetModularVO = compareObject(base.budgetModularVO,
      current.budgetModularVO,
      ['totalDirectAndInDirectCostforAllPeriod', 'totalConsortiumFnaforAllPeriod',
        'totalDirectCostforAllPeriod', 'totalIndirectDirectCostforAllPeriod', 'totalDirectCostLessConsorFnaforAllPeriod']);
    this.budgetModularVO.modularBudget = compareArray(base.budgetModularVO ?
      base.budgetModularVO[ProposalModularBudget.reviewSectionName] : [],
      current.budgetModularVO ? current.budgetModularVO[ProposalModularBudget.reviewSectionName] : [],
      ProposalModularBudget.reviewSectionUniqueFields,
      ProposalModularBudget.reviewSectionSubFields);

  }


  budgetSummaryComparison(base, current) {
    this.proposalBudgetSummary = compareArray(base.budgetSummary ? base.budgetSummary.budgetPeriodSummaries : [],
      current.budgetSummary ? current.budgetSummary.budgetPeriodSummaries : [],
      ProposalBudgetSummary.reviewSectionUniqueFields,
      ProposalBudgetSummary.reviewSectionSubFields);
    this.proposalBudgetSummary = this.sortBudgetData(this.proposalBudgetSummary);
    this.budgetSummaryVOs = compareArray(base.budgetSummary ? base.budgetSummary.budgetSummaryVOs : [],
      current.budgetSummary ? current.budgetSummary.budgetSummaryVOs: [], ['periodNumber'], ['totalFundRequested']);
  }

  simpleBudgetComparison(base, current) {
    this.currentSimpleBudget = JSON.parse(JSON.stringify(current[ProposalSimpleBudget.reviewSectionName]));
    this.simpleBudgetVo = compareArray(base[ProposalSimpleBudget.reviewSectionName],
      current[ProposalSimpleBudget.reviewSectionName], ['categoryCode'],
      ['totalCategoryCost']);
    this.simpleBudgetVo.forEach((e, index) => {
      if (e.status === 0) {
        const currentItem = this.findInCurrent(e.categoryCode);
        this.currentLineItem = JSON.parse(JSON.stringify(currentItem && currentItem.lineItemList.length ?
          currentItem.lineItemList : []));
        e.lineItemList = compareArray(e.lineItemList,
          currentItem ? currentItem.lineItemList : [], ProposalSimpleBudget.reviewSectionUniqueFields,
          ProposalSimpleBudget.reviewSectionSubFields);
        e.lineItemList.forEach(period => {
          const currentPeriod = this.findInCurrentLineItem(period.costElementCode, period.lineItemNumber);
          period.periodCostsList = compareArray(period.periodCostsList || [], currentPeriod ?
            currentPeriod.periodCostsList : [], ['budgetPeriod'], ['cost']);
        });
      }
    });
  }

  findInCurrent(categoryCode) {
    return this.currentSimpleBudget.find(e => e.categoryCode === categoryCode);
  }

  findInCurrentLineItem(code, lineItemNumber) {
    return this.currentLineItem.find(e => e.costElementCode === code && e.lineItemNumber === lineItemNumber);
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

  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getBudgetData(type: string): Observable<any> {
    const PROPOSAL_ID = this.getProposalId(type);
    if (this.checkInCache(PROPOSAL_ID)) {
      return of(this.deepCopy(this.budgetCache[PROPOSAL_ID]));
    } else {
      return this._budgetService.proposalBudgetHeader(PROPOSAL_ID);
    }
  }
  /**
   * @param  {string} type
   * @returns string
   * return the proposal id from the input Comparison details according to the Type.
   * if base is the type reruns baseProposalId other wise currentProposalId.
   */
  getProposalId(type: string): string {
    return type === 'base' ? this.comparisonDetails.baseProposalId : this.comparisonDetails.currentProposalId;
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
   * save the value to the cache. Cache name is set same as proposal id since each version will
   * have a unique proposal id.
   */
  updateCache(data: any, type: string): void {
    const proposalId = this.getProposalId(type);
    if (!this.checkInCache(proposalId)) {
      this.budgetCache[proposalId] = this.deepCopy(data);
    }
  }

}
