import { AttachmentsService } from './attachments.service';
import { Component, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Subscription, of, forkJoin, Observable } from 'rxjs';
import { CompareDetails } from '../../interfaces';
import { compareArray } from '../../../../common/utilities/array-compare';
import { AwardAttachments } from '../../comparison-constants';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../../services/common-data.service';
import { fileDownloader } from '../../../../common/utilities/custom-utilities';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonDetails have the details for fetching the required data.
 */
@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AttachmentsService]
})
export class AttachmentsComponent implements OnChanges, OnDestroy {

  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  documentId: number;
  isShowAttachmentVersionModal = false;
  fileName: string;
  attachmentVersions = [];
  isAttachmentListOpen = true;
  newAttachments: any = [];
  deployMap = environment.deployUrl;
  attachmentsCache = {};
  result: any = {};
  $subscriptions: Subscription[] = [];
  isShowConfidentialAttachment = false;
  temporaryAttachments: any[];
  constructor(private _attachmentsService: AttachmentsService, private _commonData: CommonDataService,
    public dateFormatter: DateParserService, private _CDRef: ChangeDetectorRef,
    private _toolKitEvents: ToolkitEventInteractionService) { }

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * baseAwardId check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges() {
    this.getPermissions();
    if (this.comparisonDetails.baseAwardId) {
      this.currentMethod + '' === 'COMPARE'
      && (this._toolKitEvents.checkSectionTypeCode('103', this.comparisonDetails.moduleVariableSections)
        || this.comparisonDetails.isActiveComparison) ? this.compareAttachments() : this.setCurrentView();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getPermissions() {
    this.isShowConfidentialAttachment = this._commonData.checkDepartmentLevelRightsInArray('VIEW_CONFIDENTIAL_AWARD_ATTACHMENTS');
  }

  /**
   * @returns void
   * compare the data actually it fetches the data for comparison.
   * Since wee need two different award version data to compare. forkJoin is used so that
   * we trigger the compare function once both version data has been loaded.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  compareAttachments(): void {
    this.$subscriptions.push(forkJoin([this.getAttachmentData('base'), this.getAttachmentData('current')]).subscribe(
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
    this.$subscriptions.push(this.getAttachmentData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.result = data;
      this.newAttachments = data.newAttachments;
      this.filterAttachments();
      this._CDRef.detectChanges();
    }));
  }

  filterAttachments() {
    this.temporaryAttachments = [];
    const map = new Map();
    for (const item of this.newAttachments) {
      if (!map.has(item.documentId)) {
        map.set(item.documentId, true);
        this.temporaryAttachments.push(this.getMaxVersion(item.documentId));
      }
    }
  }

  getMaxVersion(documentId) {
    return this.newAttachments.filter(item => item.documentId === documentId)
      .reduce((p, c) => p.versionNumber > c.versionNumber ? p : c);
  }


  /**
   * @param  {any} base
   * @param  {any} current
   * @returns void
   * Compare the versions of the data. Compare method is used according to the type of the
   * data that need to be compared. Here since Array is the data type it is used.
   */
  compare(base: any, current: any): void {
    this.newAttachments = compareArray(base[AwardAttachments.reviewSectionName],
      current[AwardAttachments.reviewSectionName],
      AwardAttachments.reviewSectionUniqueFields,
      AwardAttachments.reviewSectionSubFields);
      this.filterAttachments();
  }
  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getAttachmentData(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.attachmentsCache[AWARD_ID]));
    } else {
      const requestObject =  {
        'awardId': AWARD_ID,
        'awardNumber': this.comparisonDetails.awardNumber,
        'awardSequenceNumber': type === 'base' ? this.comparisonDetails.sequenceNumber : this.comparisonDetails.currentSequenceNumber,
        'awardLeadUnitNumber': type === 'base' ? this.comparisonDetails.baseUnitNumber : this.comparisonDetails.currentUnitNumber
      };
      return this._attachmentsService.awardAttachmentData(requestObject);
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
    return !!Object.keys(this.attachmentsCache).find(key => key === cacheName);
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
      this.attachmentsCache[awardId] = this.deepCopy(data);
    }
  }

  getVersion(documentId, fileName, versionNumber) {
    this.attachmentVersions = [];
    this.documentId = documentId;
    this.fileName = fileName;
    this.attachmentVersions = this.result.newAttachments.filter(attachObj =>
      attachObj.versionNumber !== versionNumber && attachObj.documentId === documentId);
    this.isShowAttachmentVersionModal = true;
  }


  downloadAwardAttachments(attachment) {
    this.$subscriptions.push(this._attachmentsService.downloadAwardAttachment(attachment.awardAttachmentId)
      .subscribe(data => {
        fileDownloader(data, attachment.fileName);
      }));
  }

}
