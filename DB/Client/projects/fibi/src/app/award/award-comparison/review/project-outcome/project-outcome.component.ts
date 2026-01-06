import { Component, Input, OnChanges, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription ,  forkJoin ,  of ,  Observable } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ProjectOutcomeService } from './project-outcome.service';
import { CompareDetails } from '../../interfaces';
import { compareArray } from '../../../../common/utilities/array-compare';
import { AwardPublications, AwardAssociations, AwardAchievements, AwardScopus } from '../../comparison-constants';
import { CurrencyParserService } from '../../../../common/services/currency-parser.service';
import { CommonService } from '../../../../common/services/common.service';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';
import { CommonDataService } from '../../../services/common-data.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonDetails have the details for fetching the required data.
 */
@Component({
  selector: 'app-project-outcome',
  templateUrl: './project-outcome.component.html',
  styleUrls: ['./project-outcome.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProjectOutcomeService]
})
export class ProjectOutcomeComponent implements OnDestroy, OnChanges {

  isPublications = false;
  isAssociation = false;
  isAcheviments = false;
  isShowNoneAssociationDetails = false;
  projectOutComes: any = {};
  awardPublicationList: any = [];
  associationList: any = [];
  awardAcheivementList: any = [];
  publicationDetails: any = {};
  $subscriptions: Subscription[] = [];
  temporaryAssociationDetails: any = {};
  awardId: any;
  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  outcomeCache = {};
  awardScopusList: any = [];
  isShowCollapse: Boolean[] = [];

  constructor(private _outcomeService: ProjectOutcomeService, public currencyFormatter: CurrencyParserService,
    public _commonService: CommonService, private _CDRef: ChangeDetectorRef,
    private _toolKitEvents: ToolkitEventInteractionService, public _commonData: CommonDataService) { }

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
      && (this._toolKitEvents.checkSectionTypeCode('115', this.comparisonDetails.moduleVariableSections)
      || this.comparisonDetails.isActiveComparison)  ? this.comparedProjectOutComes() : this.setCurrentView();
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
  comparedProjectOutComes(): void {
    this.$subscriptions.push(forkJoin(this.getProjectOutComes('base'), this.getProjectOutComes('current')).subscribe(
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
    this.$subscriptions.push(this.getProjectOutComes('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.projectOutComes = data;
      this.awardPublicationList = this.projectOutComes.awardPublications;
      this.associationList = this.projectOutComes.awardAssociations;
      this.awardAcheivementList = this.projectOutComes.awardAcheivements;
      this.awardScopusList = this.projectOutComes.awardScopuses;
      this._CDRef.detectChanges();
    }));
  }

  /**
   * @param  {any} base
   * @param  {any} current
   * @returns void
   * Compare the versions of the data. Compare method is used according to the type of the
   * data that need to be compared. Here since Array is the data type it is used.
   * here we have multiple values to be compare so each one is compared.
   */
  compare(base: any, current: any): void {
    this.awardPublicationList = compareArray(base[AwardPublications.reviewSectionName],
      current[AwardPublications.reviewSectionName],
      AwardPublications.reviewSectionUniqueFields,
      AwardPublications.reviewSectionSubFields);
    this.associationList = compareArray(base[AwardAssociations.reviewSectionName],
      current[AwardAssociations.reviewSectionName],
      AwardAssociations.reviewSectionUniqueFields,
      AwardAssociations.reviewSectionSubFields);
    this.awardAcheivementList = compareArray(base[AwardAchievements.reviewSectionName],
      current[AwardAchievements.reviewSectionName],
      AwardAchievements.reviewSectionUniqueFields,
      AwardAchievements.reviewSectionSubFields);
    this.awardScopusList = compareArray(base[AwardScopus.reviewSectionName],
      current[AwardScopus.reviewSectionName],
      AwardScopus.reviewSectionUniqueFields,
      AwardScopus.reviewSectionSubFields);
  }

  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getProjectOutComes(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.outcomeCache[AWARD_ID]));
    } else {
      return this._outcomeService.loadAllProjectOutcomes({ 'awardId': AWARD_ID });
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
    return !!Object.keys(this.outcomeCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
      this.outcomeCache[awardId] = this.deepCopy(data);
    }
  }

  /**
 * @param  {} achievement
 * Download achievement attachment w.r.t awardAcheivementAttachId
 */

  downloadAcheivement(achievement) {
    this.$subscriptions.push(this._outcomeService.downloadAttachment(achievement.awardAcheivementAttachId).subscribe((data: any) => {
      const a = document.createElement('a');
      const blob = new Blob([data], { type: data.type });
      a.href = URL.createObjectURL(blob);
      a.download = achievement.fileName;
      a.id = 'attachment';
      document.body.appendChild(a);
      a.click();
    }));
  }

  /**
   * @param  {} typeCode
   * @param  {} id
   * opens a new tab of award or proposal details based on id
   */
  viewAssociation(typeCode, id) {
    const a = document.createElement('a');
    a.href = typeCode === '2' ? '#/fibi/proposal?proposalId=' + id :
      '#/fibi/award?awardId=' + id;
    a.target = '_blank';
    a.click();
  }
}
