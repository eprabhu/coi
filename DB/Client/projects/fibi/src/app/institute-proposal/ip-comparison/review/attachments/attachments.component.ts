import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { compareArray } from '../../../../common/utilities/array-compare';
import { deepCloneObject, fileDownloader } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { InstituteProposalService } from '../../../services/institute-proposal.service';
import { ProposalAttachments } from '../../comparison-constants';
import { ComparisonDataStoreService } from '../../comparison-data-store.service';
import { ComparisonData } from '../../interface';
import { AttachmentService } from './attachment.service';

@Component({
	selector: 'app-ip-attachments-compare',
	templateUrl: './attachments.component.html',
	styleUrls: ['./attachments.component.css'],
	providers: [AttachmentService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachmentsComponent implements OnInit, OnDestroy {

	$subscriptions: Subscription[] = [];
	result: any = {};
	ipAttachments: any[] = [];
	attachmentsCache: any = [];
	attachmentVersions: any = [];
	documentId: any;
	fileName: any;
	isAttachmentListOpen = true;
	comparisonData: ComparisonData;
	latestVersionAttachments: any[] = [];


	constructor(private _comparisonStoreData: ComparisonDataStoreService,
		private _CDRef: ChangeDetectorRef,
		private _attachmentsService: AttachmentService,
		public ipService: InstituteProposalService) { }

	ngOnInit() {
		this.comparisonData = new ComparisonData();
		this.getComparisonData();
		this.viewOrCompare();
	}

	private getComparisonData(): void {
		this.$subscriptions.push(this._comparisonStoreData.$comparisonData.subscribe((data: any) => {
			this.comparisonData = data;
		}));
	}

	private viewOrCompare(): void {
		this.$subscriptions.push(this._comparisonStoreData.$currentMethod.subscribe((data) => {
			if (data) {
				if (this.comparisonData.baseProposalId) {
					data + '' === 'COMPARE' ? this.compareAttachments() : this.setCurrentView();
				}
			}
		}));
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	/**
	* @returns void
	* compare the data:
	* actually it fetches the data for comparison.
	* Since wee need two different ip version data to compare. forkJoin is used so that
	* we trigger the compare function once both version data has been loaded.
	* This also updates the data to the cache so that the next time we can
	* reuse the same data instead of making a DB call. improves performance
	*/

	private compareAttachments(): void {
		this.$subscriptions.push(forkJoin([this.getAttachmentData('base'), this.getAttachmentData('current')]).subscribe(
			data => {
				this.updateCache(data[0], 'base');
				this.updateCache(data[1], 'current');
				this.compare(data[0], data[1]);
				this._CDRef.markForCheck();
			}));
	}

	/**
	 * @returns void
	 * sets the value to view
	 * baseIP is used since base is always compared to current.
	 * This also updates the data to the cache so that the next time we can
	 * reuse the same data instead of making a DB call. improves performance
	 */
	private setCurrentView(): void {
		this.$subscriptions.push(this.getAttachmentData('base').subscribe((data: any) => {
			this.updateCache(data, 'current');
			this.ipAttachments = data.instituteProposalAttachments;
			this.filterOutLatestAttachments();
			this._CDRef.markForCheck();
		}));
	}

	filterOutLatestAttachments() {
		this.latestVersionAttachments = [];
		const map = new Map();
		for (const item of this.ipAttachments) {
		  if (!map.has(item.documentId)) {
			map.set(item.documentId, true);
			this.latestVersionAttachments.push(this.getMaxVersion(item.documentId));
			this.latestVersionAttachments.sort(function(x, y){
				return y.updateTimeStamp - x.updateTimeStamp;
			})
		  }
		}
	  }
	
	  getMaxVersion(documentId) {
		return this.ipAttachments.filter(item => item.documentId === documentId)
		  .reduce((p, c) => p.versionNumber > c.versionNumber ? p : c);
	  }

	/**
	* @param  {any} base
	* @param  {any} current
	* @returns void
	* Compare the versions of the data.
	* Compare method is used according to the type of the
	* data that need to be compared. Here since Array is the data type it is used.
	*/

	private compare(base: any, current: any): void {
		this.ipAttachments = compareArray(base[ProposalAttachments.reviewSectionName],
			current[ProposalAttachments.reviewSectionName],
			ProposalAttachments.reviewSectionUniqueFields,
			ProposalAttachments.reviewSectionSubFields);
			this.filterOutLatestAttachments();
	}

	/**
	 * @param  {string} type
	 * @returns Observable
	 * fetches the data from server if its not available in cache.
	 * only return the Observable.
	 * Subscription will be done at the function which invokes this method.
	 */

	private getAttachmentData(type: string): Observable<any> {
		const PROPOSAL_ID = this.getProposalId(type);
		const VERSION_NUMBER = this.getVersionNumber(type);
		const requestObject =  {
			proposalId: PROPOSAL_ID,
		    proposalNumber: this.comparisonData.proposalNumber,
			sequenceNumber: VERSION_NUMBER
	   };
		if (this.checkInCache(PROPOSAL_ID)) {
			return of(deepCloneObject(this.attachmentsCache[PROPOSAL_ID]));
		} else {
			return this._attachmentsService.loadIPAttachments(requestObject);
		}
	}

	/**
	 * @param  {string} type
	 * @returns string
	 * return the ip id from the input Comparison details according to the Type.
	 * if base is the type reruns baseIPId other wise currentIPId.
	 */

	private getProposalId(type: string): string {
		return type === 'base' ? this.comparisonData.baseProposalId
			: this.comparisonData.currentProposalId;
	}

	private getVersionNumber(type: string): number {
		return type === 'base' ? this.comparisonData.baseVersionNumber
			: this.comparisonData.currentVersionNumber;
	}

	private checkInCache(cacheName: string): boolean {
		return !!Object.keys(this.attachmentsCache).find(key => key === cacheName);
	}

	/**
	* @param  {any} data
	* @param  {string} type
	* @returns void
	* save the value to the cache. Cache name is set same as proposal id since each version will
	* have a unique proposal id.
	*/

	private updateCache(data: any, type: string): void {
		const proposalId = this.getProposalId(type);
		if (!this.checkInCache(proposalId)) {
			this.attachmentsCache[proposalId] = deepCloneObject(data);
		}
	}

	getVersion(documentId, versionNumber, fileName): void {
		this.attachmentVersions = [];
		this.documentId = documentId;
		this.fileName = fileName;
		this.attachmentVersions = this.ipAttachments.filter(attachObj =>
			attachObj.versionNumber !== versionNumber  && attachObj.documentId === documentId).reverse();
	}


	downloadProposalAttachments(attachment): void {
		this.$subscriptions.push(this._attachmentsService.downloadProposalAttachment(attachment.attachmentId)
			.subscribe(data => {
				fileDownloader(data, attachment.fileName);
			}));
	}

}
