import { AttachmentService } from './attachment.service';
import { Component, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Subscription, of, forkJoin, Observable } from 'rxjs';
import { CompareDetails } from '../../interfaces';
import { compareArray } from '../../../../common/utilities/array-compare';
import { ProposalAttachments } from '../../comparison-constants';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given proposalId.
 * The required details is fetched as input from parent.
 * The comparisonDetails have the details for fetching the required data.
 */
@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AttachmentService]
})
export class AttachmentComponent implements OnChanges, OnDestroy {

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
  constructor(private _attachmentsService: AttachmentService,
    public dateFormatter: DateParserService, private _CDRef: ChangeDetectorRef,
    private _toolKitEvents: ToolkitEventInteractionService) { }

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no proposal number available to fetch data. to avoid empty service call
   * baseProposalId check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges() {
    if (this.comparisonDetails.baseProposalId) {
      this.currentMethod + '' === 'COMPARE' ? this.compareAttachments() : this.setCurrentView();
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
   * sets the value to view baseProposalId is used since base is always compared to current.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  setCurrentView(): void {
    this.$subscriptions.push(this.getAttachmentData('base').subscribe((data: any) => {
      this.updateCache(data, 'current');
      this.result = data;
      this.newAttachments = data.proposalAttachments;
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
    this.newAttachments = compareArray(base[ProposalAttachments.reviewSectionName],
      current[ProposalAttachments.reviewSectionName],
      ProposalAttachments.reviewSectionUniqueFields,
      ProposalAttachments.reviewSectionSubFields);
  }
  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getAttachmentData(type: string): Observable<any> {
    const PROPOSAL_ID = this.getProposalId(type);
    if (this.checkInCache(PROPOSAL_ID)) {
      return of(this.deepCopy(this.attachmentsCache[PROPOSAL_ID]));
    } else {
      const requestObject =  {
        'proposalId': PROPOSAL_ID,
        'proposalStatusCode': 4
      }
      return this._attachmentsService.proposalAttachmentData(requestObject);
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
    return !!Object.keys(this.attachmentsCache).find(key => key === cacheName);
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
      this.attachmentsCache[proposalId] = this.deepCopy(data);
    }
  }

  getVersion(documentId, fileName) {
    this.attachmentVersions = [];
    this.documentId = documentId;
    this.fileName = fileName;
    this.attachmentVersions = this.newAttachments.filter(attachObj =>
      attachObj.documentStatusCode === 2 && attachObj.documentId === documentId);
  }


  downloadProposalAttachments(attachment) {
    this.$subscriptions.push(this._attachmentsService.downloadProposalAttachment(attachment.attachmentId)
      .subscribe(data => {
        if ((window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveBlob(new Blob([data], { type: attachment.mimeType }), attachment.fileName);
        } else {
          this.createDownloadElement(data, attachment.fileName);
        }
      }));
  }

  createDownloadElement(data, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(data);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

}
