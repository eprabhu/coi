import { Component, OnDestroy, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription ,  forkJoin ,  of ,  Observable } from 'rxjs';
import { SpecialApprovalService } from './special-approval.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonService } from '../../../../common/services/common.service';
import { CompareDetails } from '../../interfaces';
import { compareArray } from '../../../../common/utilities/array-compare';
import { AwardForeignTravel, AwardEquipment } from '../../comparison-constants';
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
  selector: 'app-special-approval',
  templateUrl: './special-approval.component.html',
  styleUrls: ['./special-approval.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SpecialApprovalService]
})
export class SpecialApprovalComponent implements OnDestroy, OnChanges {
  foreignTravelSum = 0;
  equipmentSum = 0;
  totalSum = 0;
  specialForeignTravel: any = [];
  specialEquipment: any = [];
  reportTermsLookup: any = {};
  awardId: any;
  isApproval = false;
  isSpecialApproval = false;
  isEquipment = false;
  $subscriptions: Subscription[] = [];
  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  specialApprovalCache = {};

  constructor(public _commonService: CommonService, public currencyFormatter: CurrencyParserService,
    private _specialApprovalService: SpecialApprovalService, public dateFormatter: DateParserService,
    private _CDRef: ChangeDetectorRef, private _toolKitEvents: ToolkitEventInteractionService) { }

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
      && (this._toolKitEvents.checkSectionTypeCode('119', this.comparisonDetails.moduleVariableSections)
      || this.comparisonDetails.isActiveComparison ) ? this.comparedSpecialApproval() : this.setCurrentView();
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
  comparedSpecialApproval(): void {
    this.$subscriptions.push(forkJoin(this.getSpecialApprovalData('base'), this.getSpecialApprovalData('current')).subscribe(
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
    this.$subscriptions.push(this.getSpecialApprovalData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.reportTermsLookup = data;
      this.specialForeignTravel = this.reportTermsLookup.awardAprovedForeignTravelList;
      this.specialEquipment = this.reportTermsLookup.awardApprovedEquipmentList;
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
    this.specialForeignTravel = compareArray(base[AwardForeignTravel.reviewSectionName],
      current[AwardForeignTravel.reviewSectionName],
      AwardForeignTravel.reviewSectionUniqueFields,
      AwardForeignTravel.reviewSectionSubFields);
    this.specialEquipment = compareArray(base[AwardEquipment.reviewSectionName],
        current[AwardEquipment.reviewSectionName],
        AwardEquipment.reviewSectionUniqueFields,
        AwardEquipment.reviewSectionSubFields);
  }

  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getSpecialApprovalData(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.specialApprovalCache[AWARD_ID]));
    } else {
      return this._specialApprovalService.reportsTermsLookUpData(AWARD_ID);
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
    return !!Object.keys(this.specialApprovalCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
     this.specialApprovalCache[awardId] = this.deepCopy(data);
    }
  }

  /**
   * calculate the total sum of foreign travel amount and equipment amount.
   */
  specialApprovalSum() {
    this.foreignTravelSum = 0;
    this.equipmentSum = 0;
    if (this.specialForeignTravel) {
      this.specialForeignTravel.forEach(element => {
      this.foreignTravelSum = this.foreignTravelSum + parseInt(element.amount, 10);
      });
    }
    if (this.specialForeignTravel) {
      this.specialEquipment.forEach(element => { this.equipmentSum = this.equipmentSum + parseInt(element.amount, 10); });
    }
  }
}
