import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../../../../../app/app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { CurrencyParserService } from '../../../../common/services/currency-parser.service';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { compareArray } from '../../../../common/utilities/array-compare';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { calculateUncommittedAmount } from '../../../man-power/manpower-utilities';
import { CommonDataService } from '../../../services/common-data.service';
import { AwardManpower, AwardManpowerResource } from '../../comparison-constants';
import { CompareDetails } from '../../interfaces';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';
import { ManpowerComparisonService } from './manpower-comparison.service';

@Component({
  selector: 'app-manpower',
  templateUrl: './manpower-comparison.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./manpower-comparison.component.css'],
  providers: [ManpowerComparisonService]
})
export class ManpowerComponent implements OnInit, OnChanges, OnDestroy {

  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  isManpowerWidgetOpen = true;
  manpowerOther: any = [];
  manpowerEOM: any = [];
  manpowerRSS: any = [];
  manpowerCache = {};
  $subscriptions: Subscription[] = [];
  currentDetails: any;
  canViewStaff = false;
  canViewStudent = false;
  canViewOthers = false;
  isShowEOMAllDetails: any = [];
  isShowRSSAllDetails: any = [];
  manpowerResourceDetails: any = [];
  manpowerStudentDetails: any = [];

  constructor(private _manpowerService: ManpowerComparisonService, public _commonService: CommonService,
    private _CDRef: ChangeDetectorRef, private _commonData: CommonDataService,
    public dateFormatter: DateParserService, public currencyFormatter: CurrencyParserService,
    private _toolKitEvents: ToolkitEventInteractionService) { }

  ngOnInit() {
    this.getPermissions();
  }

  ngOnChanges() {
    this.isShowEOMAllDetails = [];
    this.isShowRSSAllDetails = [];
    if (this.comparisonDetails.baseAwardId) {
      this.currentMethod + '' === 'COMPARE'
        && (this._toolKitEvents.checkSectionTypeCode('131', this.comparisonDetails.moduleVariableSections)
          || this._toolKitEvents.checkSectionTypeCode('132', this.comparisonDetails.moduleVariableSections)
          || this._toolKitEvents.checkSectionTypeCode('133', this.comparisonDetails.moduleVariableSections)
          || this._toolKitEvents.checkSectionTypeCode('134', this.comparisonDetails.moduleVariableSections)
          || this._toolKitEvents.checkSectionTypeCode('136', this.comparisonDetails.moduleVariableSections)
          || this.comparisonDetails.isActiveComparison) ? (this.compareManpower(), this.compareOthersDetails()) : this.setCurrentView();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getPermissions(): void {
    this.canViewStaff = this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_VIEW_STAFF_PLAN') ||
      this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_STAFF');
    this.canViewStudent = this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_VIEW_STUDENT_PLAN') ||
      this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_STUDENT');
    this.canViewOthers = this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_VIEW_OTHERS_PLAN') ||
      this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_OTHERS');
  }
  /**
   * @returns void
   * compare the data actually it fetches the data for comparison.
   * Since wee need two different award version data to compare. forkJoin is used so that
   * we trigger the compare function once both version data has been loaded.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  compareManpower(): void {
    this.$subscriptions.push(forkJoin(this.fetchManpower('base'), this.fetchManpower('current'))
      .subscribe(data => {
        this.updateCache(data[0], 'base');
        this.updateCache(data[1], 'current');
        if (data[0].accountNumber && data[1].accountNumber) {
          this.manpowerEOM = this.compareCategory(this.canViewStaff, data[0], data[1], 'Staff');
          this.manpowerRSS = this.compareCategory(this.canViewStudent, data[0], data[1], 'Student');
        }
        this.updateCurrentMethod('COMPARE');
        this._CDRef.detectChanges();
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching manpower data'); }));
  }

  compareCategory(canView: boolean, base: any, variant: any, sectionName: string): any[] {
    return canView ? this.compareManpowerArray(base, variant, sectionName) : [];
  }
  /**
   * @returns void
   * sets the value to view baseAwardId is used since base is always compared to current.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  setCurrentView(): void {
    this.$subscriptions.push(this.fetchManpower('base')
      .subscribe((data: any) => {
        this.updateCache(data, 'base');
        this.manpowerEOM = data.manpowerCategory.awardManpowerDetails.Staff;
        this.manpowerRSS = data.manpowerCategory.awardManpowerDetails.Student;
        if (data.manpowerCategory.awardManpowerDetails.Others) {
          this.fetchManpowerOthers('base', data.manpowerCategory.awardManpowerDetails.Others[0]);
        }
        this.updateCurrentMethod('VIEW');
        this._CDRef.detectChanges();
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching manpower data'); }));
  }

  fetchManpowerOthers(type: string, othersData) {
    this.$subscriptions.push(this._manpowerService.fetchManpowerResources(this.getResourceRequestObject(othersData))
      .subscribe((data: any) => {
        this.manpowerOther = data.awardManpowerResources;
        this._CDRef.detectChanges();
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching Others data'); }));
  }

  compareOthersDetails() {
    const manpowerTypeCode = 3;
    this.$subscriptions.push(
      forkJoin(this.fetchManpowerResourceDetail('base', manpowerTypeCode, null),
        this.fetchManpowerResourceDetail('current', manpowerTypeCode, null))
        .subscribe((data: any) => {
          this.manpowerOther = this.compareResource(data[0], data[1]);
          this._CDRef.detectChanges(); // Manual Change detection
        },
          err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching Others data'); })
    );
  }

  showResourceDetails(resourceDetails: any) {
    this.currentMethod === 'VIEW' ? this.fetchManpowerResourceDetails(resourceDetails) : this.compareManpowerResource(resourceDetails);
  }

  // The following API is used to fetch resource details of corresponding cost element
  fetchManpowerResourceDetails(resourceDetails) {
    this.$subscriptions.push(this._manpowerService.fetchManpowerResources(this.getResourceRequestObject(resourceDetails))
      .subscribe((data: any) => {
        if (data.awardManpowerResources) {
            this.setAccountDetails(data);
            if (resourceDetails.manpowerType.description == "Staff") {
              this.manpowerResourceDetails[resourceDetails.awardManpowerId] = data.awardManpowerResources;
            } else{
              this.manpowerStudentDetails[resourceDetails.awardManpowerId] = data.awardManpowerResources;
            }
            this._CDRef.detectChanges(); // Manual Change detection
        }
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching resource data'); }));
  }
  getResourceRequestObject(resourceDetails) {
    const requestObject = {
      awardId: resourceDetails.awardId,
      awardManpowerId: resourceDetails.awardManpowerId,
      manpowerTypeCode: resourceDetails.manpowerTypeCode,
      wbsNumber: resourceDetails.budgetReferenceNumber ? resourceDetails.budgetReferenceNumber : null
    };
    return requestObject;
  }

  setAccountDetails(awardDetails) {
    if (awardDetails.awardManpowerResources) {
      awardDetails.awardManpowerResources.forEach((element) => {
          element.isMultiAccount = element.isMultiAccount ? 'Yes' : 'No';
          element.isMainAccount = element.isMainAccount ? 'Yes' : 'No';
        element.costAllocation = element.costAllocation ? element.costAllocation + '%' : '';
      });
    }
  }


  // resource comparison
  compareManpowerResource(currentResource: any) {
    const wbsNumber = currentResource.budgetReferenceNumber;
    this.$subscriptions.push(
      forkJoin(this.fetchManpowerResourceDetail('base', currentResource.manpowerTypeCode, wbsNumber),
        this.fetchManpowerResourceDetail('current', currentResource.manpowerTypeCode, wbsNumber))
        .subscribe((data: any) => {
          this.setAccountDetails(data[0]);
          this.setAccountDetails(data[1]);
          this.manpowerResourceDetails[currentResource.awardManpowerId] = this.compareResource(data[0], data[1]);
          this._CDRef.detectChanges(); // Manual Change detection
        },
          err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching resource data'); })
    );
  }
  fetchManpowerResourceDetail(type: string, manpowerTypeCode, wbsNumber: any) {
    const awardId = Number(this.getAwardId(type));
    const requestObject = { wbsNumber, awardId, manpowerTypeCode };
    return this._manpowerService.getManpowerResourcesForComparison(requestObject);
  }

  compareResource(base: any, current: any) {
    const awardManpowerResource = compareArray(
      base[AwardManpowerResource.reviewSectionName] ? base[AwardManpowerResource.reviewSectionName] : [],
      current[AwardManpowerResource.reviewSectionName] ? current[AwardManpowerResource.reviewSectionName] : [],
      AwardManpowerResource.reviewSectionUniqueFields,
      AwardManpowerResource.reviewSectionSubFields);
    return awardManpowerResource;
  }

  /**
   * @param  {} details
   * for setting manpower staff details like committedBalance and uncommittedAmount which are not stored in db
   */
  manpowerBalanceDetails(details: any, calculationFlag: boolean): void {
    details.map(element => {
      if (calculationFlag) {
        element.committedBalance = element.sapCommittedAmount - element.expenseAmount;
        element.uncommittedAmount = calculateUncommittedAmount(element.awardManpowerResource,
          element.budgetAmount, element.sapCommittedAmount);
      } else {
        element.balance = element.budgetAmount - element.sapCommittedAmount;
      }
    });
  }
  /**
   * @param  {any} base
   * @param  {any} current
   * @param  {string} sectionName : defines the section name which has to be compared
   * compared the array of category elements and also the array of resources in each category
   */
  compareManpowerArray(base: any, current: any, sectionName: string): any {
    this.currentDetails = JSON.parse(JSON.stringify(this.getCurrentSection(current, sectionName)));
    const compareManpower = compareArray(base.manpowerCategory.awardManpowerDetails[sectionName],
      current.manpowerCategory.awardManpowerDetails[sectionName], AwardManpower.reviewSectionUniqueFields,
      AwardManpower.reviewSectionSubFields);
    return compareManpower;
  }

  getCurrentSection(current: any, sectionName: string): any[] {
    return current.manpowerCategory.awardManpowerDetails[sectionName] ?
      current.manpowerCategory.awardManpowerDetails[sectionName] : [];
  }
  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  fetchManpower(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.manpowerCache[AWARD_ID]));
    } else {
      return this._manpowerService.fetchManpowerDetails(AWARD_ID);
    }
  }

  findInCurrentCategory(budgetReferenceNumber: string) {
    return this.currentDetails.find(current => current.budgetReferenceNumber === budgetReferenceNumber);
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
    return !!Object.keys(this.manpowerCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
      this.manpowerCache[awardId] = this.deepCopy(data);
    }
  }

  updateCurrentMethod(method: string): void {
    this.currentMethod = method;
  }

  getPositionStatusClass(code) {
    if (code === '9') {
      return 'warning';
    } else if (code === '4') {
      return 'success';
    } else if (code === '5' || code === '8') {
      return 'danger';
    } else {
      return 'info';
    }
  }

  getJobRequisitionStatusClass(status) {
    if (status === 'Open') {
      return 'info';
    } else if (status === 'Filled') {
      return 'success';
    } else if (status === 'Frozen') {
      return 'warning';
    } else if (status === 'Closed') {
      return 'danger';
    } else {
      return 'dark';
    }

  }

}
