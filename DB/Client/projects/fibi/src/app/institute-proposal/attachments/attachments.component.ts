import { Component, OnInit, OnDestroy } from '@angular/core';
import { InstituteProposalService } from '../services/institute-proposal.service';
import { Observable, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { environment } from '../../../environments/environment';
import { AttachmentsService } from './attachments.service';
import { ActivatedRoute } from '@angular/router';
import { deepCloneObject, fileDownloader } from '../../common/utilities/custom-utilities';
import { Attachment, AttachmentType, InstituteProposal } from '../institute-proposal-interfaces';
import { DataStoreService } from '../services/data-store.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { WebSocketService } from '../../common/services/web-socket.service';
declare var $: any;

@Component({
	selector: 'app-attachments',
	templateUrl: './attachments.component.html',
	styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit, OnDestroy {

	attachmentVersions = [];
	$subscriptions: Subscription[] = [];
	deployMap = environment.deployUrl;
	sortBy = 'updateTimeStamp';
	order: number = -1;
	sortByDevProposal = 'updateTimeStamp';
	orderDevProposal: number = -1;
	instProposalId = null;
	attachment: Attachment = new Attachment();
	attachments: Array<Attachment> = [];
	devProposalAttachments: any = {};
	replaceIndex = -1;
	isReplaceAttachmentEnabled = false;
	isAttachmentListOpen = true;
	isDevProposalAttachmentListOpen = true;
	uploadedFile: Array<File> = [];
	errorMap = new Map();
	attachmentTypes: Array<AttachmentType> = [];
	newAttachments: Array<Attachment> = [];
	isSaving = false;
	fileName = '';
	isModifyProposal = false;
	editAttachmentDetails: any = {};
	devProposalAttachmentIds: Array<string> = [];
	ID: string = '';
	instProposalData: any;
	attachmentWarningMsg = false;
	latestVersionAttachments: any[] = [];
	deleteAttachmentObj: any;
	replaceAttachments: Attachment[] = [];
	isReplaceAttachment = false;
	constructor(public _instituteService: InstituteProposalService,
		private _attachment: AttachmentsService,
		private _route: ActivatedRoute, private _dataStore: DataStoreService,
		private _commonService: CommonService,
		public webSocket: WebSocketService) { }

	ngOnInit() {
		this.getGeneralDetails();
		this.getDataStoreEvent();
		this.getProposalAttachmentData();	
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	getGeneralDetails() {
		const data: InstituteProposal = this._dataStore.getData(['proposalAttachmentTypes', 'isReplaceAttachmentEnabled', 'availableRights', 'instProposal']);
		this.instProposalData = data.instProposal;
		this.attachmentTypes = data.proposalAttachmentTypes;
		this.isReplaceAttachmentEnabled = data.isReplaceAttachmentEnabled;
		this.isModifyProposal = data.availableRights.includes('MODIFY_INST_PROPOSAL') && data.instProposal.proposalSequenceStatus === 'PENDING';
		const isKey = 'IP' + '#' + this._route.snapshot.queryParamMap.get('instituteProposalId');
		if ( this.isModifyProposal && !this.webSocket.isLockAvailable(isKey)) {
			this.isModifyProposal = false;
		}
	}

	getDataStoreEvent() {
		this.$subscriptions.push(this._dataStore.dataEvent
		  .subscribe((data: any) => {
			if (data.includes('availableRights') || data.includes('instProposal')) {
			  this.getGeneralDetails();
			}
		  }));
	  }

	getProposalAttachmentData() {
		this.instProposalId = this._route.snapshot.queryParamMap.get('instituteProposalId');
		const requestObject =  {
			 proposalId: this.instProposalId,
			 proposalNumber: this.instProposalData.proposalNumber,
			 sequenceNumber: this.instProposalData.sequenceNumber
	    };
		this.$subscriptions.push(this._attachment.getProposalAttachments(requestObject)
			.subscribe((data: InstituteProposal) => {
				this.attachments = data.instituteProposalAttachments;
				this.filterOutLatestAttachments();
				this.devProposalAttachments = data.proposalAttachments || {};
				this.devProposalAttachmentIds = Object.keys(data.proposalAttachments);
				this.ID = this.devProposalAttachmentIds[0];
			}));
	}

	filterOutLatestAttachments() {
		this.latestVersionAttachments = [];
		const map = new Map();
		for (const item of this.attachments) {
		  if (!map.has(item.documentId)) {
			map.set(item.documentId, true);
			this.latestVersionAttachments.push(this.getMaxVersion(item.documentId));
		  }
		}
	  }
	
	  getMaxVersion(documentId) {
		return this.attachments.filter(item => item.documentId === documentId)
		  .reduce((p, c) => p.versionNumber > c.versionNumber ? p : c);
	  }

	downloadProposalAttachments(attachment) {
		this.$subscriptions.push(this._attachment.downloadProposalAttachment(attachment.attachmentId)
			.subscribe(data => {
				fileDownloader(data, attachment.fileName);
			}));
	}

	downloadDevProposalAttachments(attachment) {
		this.$subscriptions.push(this._attachment.downloadDevProposalAttachments(attachment.attachmentId)
			.subscribe(data => {
				fileDownloader(data, attachment.fileName);
			}));
	}

	getVersion(documentId: number, versionNumber: number, fileName: string) {
		this.fileName = fileName;
		this.attachmentVersions = this.attachments.filter(A =>
			A.versionNumber !== versionNumber && A.documentId === documentId).reverse();
	}

	setReplaceAttachmentObj(attachment) {
		  this.replaceAttachments = attachment;
	  }

	addAttachments(): void {
		if (this.validateAttachments() && !this.isSaving) {
			this.isSaving = true;
			const ID = parseInt(this._route.snapshot.queryParamMap.get('instituteProposalId'), 10);
			const proposalNumber = this.instProposalData.proposalNumber;
			this.newAttachments.forEach(element => {
				element.proposalId = ID;
				element.proposalNumber = proposalNumber;
				element.sequenceNumber = this.instProposalData.sequenceNumber;
			  }); 
			this.$subscriptions.push(this._attachment.addProposalAttachment(this.uploadedFile, ID, this.newAttachments, proposalNumber)
				.subscribe((data: InstituteProposal) => {
					this.isSaving = false;
					this.attachments = data.instituteProposalAttachments;
					this.filterOutLatestAttachments();
					this._commonService.showToast(HTTP_SUCCESS_STATUS, this.isReplaceAttachment ? 'Attachment replaced successfully.':'Attachment added successfully.');
					$('#addAwardAttachment').modal('hide');
					this.newAttachments = [];
					this.uploadedFile = [];
					this.isReplaceAttachment = false;
				}, err => {
					this._commonService.showToast(HTTP_ERROR_STATUS, this.isReplaceAttachment ? 'Failed to replace Attachment. Please try again.' : 'Failed to add Attachment. Please try again.');
					this.isSaving = false;
				}));
		}
	}

	setEditAttachment(attachment): void {
		this.editAttachmentDetails = deepCloneObject(attachment);
		$('#editIpAttachmentModal').modal('show');
	}

	updateAttachmentDescription(): void {
	    const proposalNumber = this._dataStore.getData(['instProposal']).instProposal.proposalNumber;
		this.$subscriptions.push(this._attachment.updateIPAttachmentDetails({ instituteProposalAttachment: this.editAttachmentDetails, proposalNumber})
			.subscribe((data: any) => {
				this.attachments = data;
				this.filterOutLatestAttachments();
				this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment updated successfully.');
			}, err => {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update Attachment. Please try again.');
			}));
		$('#editIpAttachmentModal').modal('hide');
	}

	clearEditAttachmentDetails() {
		this.editAttachmentDetails = {narrativeStatus: {description: ''}};
		$('#editIpAttachmentModal').modal('hide');
	}

	OnFileDrop(files) {
		this.errorMap.clear();
		this.attachmentWarningMsg = false;
		this.uploadedFile = [];
		this.newAttachments = [];
		for (let index = 0; index < files.length; index++) {
			this.isReplaceAttachment ? this.replaceAttachment(files, index) : this.addNewAttachments(files, index)
		}
	}

	replaceAttachment(files, index) {
		if (files.length === 1) {
			this.uploadedFile.push(files[index]);
			const attachment: Attachment = deepCloneObject(this.replaceAttachments);
			attachment.fileName = files[index].name;
			this.newAttachments.push(attachment);
		} else {
			this.attachmentWarningMsg = true;
			this.validateAttachments();
		}
	}

	addNewAttachments(files, index) {
		this.uploadedFile.push(files[index]);
		let attachment = new Attachment();
		attachment.fileName = files[index].name;
		this.newAttachments.push(attachment);
	}

	cancelAttachmentAction() {
		setTimeout(() => {
			this.uploadedFile = [];
			this.isReplaceAttachment = false;
			this.newAttachments = [];
			this.errorMap.clear();
			this.attachmentWarningMsg = false;
		});
	}

	onAttachmentTypeChange(index: number, typeCode: number | string) {
		const TYPE = this.attachmentTypes.find(A => A.attachmentTypeCode == typeCode);
		this.newAttachments[index].attachmentType = TYPE;
	}

	clearAttachmentDetails(index: number) {
		this.newAttachments.splice(index, 1);
		this.uploadedFile.splice(index, 1);
		this.attachmentWarningMsg = false;
		this.validateAttachments();
	}

	validateAttachments(): boolean {
		this.errorMap.clear();
		if (this.checkMandatoryFields()) {
			this.errorMap.set('mandatory', '* Please fill all the mandatory fields');
		}
		if(this.attachmentWarningMsg){
            this.errorMap.set('mandatory', '* Choose only one document to replace');
		}
		return this.errorMap.size > 0 ? false : true;

	}

	checkMandatoryFields(): boolean {
		return !!this.newAttachments.find(NA => NA.attachmentTypeCode == 'null' || !NA.attachmentTypeCode);
	}

	setDeleteAttachmentObj(deleteAttachmentObj) {
		this.deleteAttachmentObj = deleteAttachmentObj;
	  }

	deleteAttachment(): void {
		const ID = parseInt(this._route.snapshot.queryParamMap.get('instituteProposalId'), 10);
		this.instProposalData = this._dataStore.getData(['instProposal']).instProposal;
		this.$subscriptions.push(this._attachment.deleteAttachment({
			proposalId : ID, 
			attachmentId: this.deleteAttachmentObj.attachmentId,
			documentId: this.deleteAttachmentObj.documentId,
			proposalNumber: this.instProposalData.proposalNumber,
			sequenceNumber: this.instProposalData.sequenceNumber
		  })
			.subscribe(data => {
				this.attachments = this.attachments.filter(A => A.documentId !== this.deleteAttachmentObj.documentId);
				this.filterOutLatestAttachments();
				this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
			}, err => {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete Attachment. Please try again.');
			}));
	}

	sort(property: string) {
		this.order = this.order * -1;
		this.sortBy = property;
	}

	sortDevProposal(property: string) {
		this.orderDevProposal = this.orderDevProposal * -1;
		this.sortByDevProposal = property;
	}

	sortNull() { return 0; }
}
