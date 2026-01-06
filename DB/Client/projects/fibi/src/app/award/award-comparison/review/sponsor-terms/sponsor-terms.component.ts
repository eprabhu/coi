import { Component, OnDestroy, OnChanges, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription ,  forkJoin ,  of ,  Observable } from 'rxjs';
import { SponsorTermsService } from './sponsor-terms.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CompareDetails } from '../../interfaces';
import { compareArray } from '../../../../common/utilities/array-compare';
import { AwardTermsList } from '../../comparison-constants';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonDetails have the details for fetching the required data.
 */
@Component({
  selector: 'app-sponsor-terms',
  templateUrl: './sponsor-terms.component.html',
  styleUrls: ['./sponsor-terms.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SponsorTermsService]
})
export class SponsorTermsComponent implements OnDestroy, OnChanges {

  awardId: any;
  reportTermsLookup: any = {};
  termKeys: any[] = [];
  termDatas: any = [];
  isTerms = false;
  $subscriptions: Subscription[] = [];
  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  termsDataCache = {};
  baseTermKeys: any = [];
  currentTermKeys: any = [];

  constructor(private _termsService: SponsorTermsService, private _toolKitEvents: ToolkitEventInteractionService,
    private _CDRef: ChangeDetectorRef) { }

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
      && (this._toolKitEvents.checkSectionTypeCode('110', this.comparisonDetails.moduleVariableSections)
      || this.comparisonDetails.isActiveComparison ) ? this.compareSponsorTerms() : this.setCurrentView();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * @returns void
   * compare the data actually it fetches the data for comparison.
   * Since we need two different award version data to compare. forkJoin is used so that
   * we trigger the compare function once both version data has been loaded.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  compareSponsorTerms(): void {
    this.$subscriptions.push(forkJoin(this.getTermsData('base'), this.getTermsData('current')).subscribe(
      data => {
        this.updateCache(data[0], 'base');
        this.updateCache(data[1], 'current');
        this.baseTermKeys = data[0].awardTermsList && Object.keys(data[0].awardTermsList) || [];
        this.currentTermKeys = data[1].awardTermsList && Object.keys(data[1].awardTermsList) || [];
        this.termKeys = Array.from(new Set([...this.baseTermKeys, ...this.currentTermKeys]));
        this.compare(data[0], data[1]);
      }));
  }
  /**
   * @returns void
   * sets the value to view baseAwardId is used since base is always compared to current.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  setCurrentView(): void {
    this.$subscriptions.push(this.getTermsData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.termDatas = data.awardTermsList;
      if (this.termDatas) {
        this.termKeys = Object.keys(this.termDatas);
      }
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
    this.termKeys.forEach(key => {
      const BASE = base[AwardTermsList.reviewSectionName] && base[AwardTermsList.reviewSectionName][key] || [];
      const CURRENT = current[AwardTermsList.reviewSectionName] && current[AwardTermsList.reviewSectionName][key] || [];
      this.termDatas[key] = compareArray(BASE, CURRENT,
        AwardTermsList.reviewSectionUniqueFields,
        AwardTermsList.reviewSectionSubFields);
      this._CDRef.detectChanges();
    });
  }

  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getTermsData(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.termsDataCache[AWARD_ID]));
    } else {
      return this._termsService.termsData(AWARD_ID);
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
    return !!Object.keys(this.termsDataCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
      this.termsDataCache[awardId] = this.deepCopy(data);
    }
  }

}
