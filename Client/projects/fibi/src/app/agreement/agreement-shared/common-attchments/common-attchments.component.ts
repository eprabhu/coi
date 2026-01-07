import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { CommonAttachmentService } from './common-attachment.service';
import { Attachment } from './common-attachments-interface';
declare var $: any;

@Component({
	selector: 'app-common-attchments',
	templateUrl: './common-attchments.component.html',
	styleUrls: ['./common-attchments.component.css']
})
export class CommonAttchmentsComponent implements OnInit {

	@Input() result: any = {};
	@Input() isReplaceAttachment = false;
	@Input() replaceIndex = -1;
	@Output() attachmentSave = new EventEmitter<any>();

	attachmentWarningMsg = null;
	uploadedFile = [];
	agreementAttachmentTypes: any = [];
	$subscriptions: Subscription[] = [];
	newAttachment: Array<Attachment> = [];

	constructor(private _attachmentsService: CommonAttachmentService, private _commonService: CommonService) { }

	ngOnInit() {
		console.log(this.result)
		$('#addAgreementAttachment').modal('show');
	}

	ngOnChanges() {
		this.clearAttachmentDetails();
	}

	clearAttachmentDetails() {
		setTimeout(() => {
			this.attachmentWarningMsg = null;
			this.uploadedFile = [];
			this.newAttachment = [];
		});
	}

	fileDrop(files) {
		this.attachmentWarningMsg = null;
		for (let index = 0; index < files.length; index++) {
			this.isReplaceAttachment ? this.updateReplaceAttachmentDetails(files, files[index], files[index].name) :
				this.updateAddAttachmentDetails(files[index], files[index].name);
		}
	}

	updateAddAttachmentDetails(file, filename) {
		this.uploadedFile.push(file);
		let attachment = new Attachment();
		attachment.fileName = filename;
		this.newAttachment.push(attachment);
	}

	updateReplaceAttachmentDetails(files, file, filename) {
		if (files.length === 1) {
			this.uploadedFile = [];
			this.uploadedFile.push(file);
			let attachment: Attachment = JSON.parse(JSON.stringify(this.result.agreementAttachments[this.replaceIndex]))
			attachment.fileName = filename;
			this.newAttachment.push(attachment);
		} else {
			this.attachmentWarningMsg = '* Choose only one document to replace';
		}
	}

	addAttachments() {
		const ID = this.result.agreementHeader.agreementRequestId;
		this.checkMandatoryFilled();
		if (!this.attachmentWarningMsg) {
			this.$subscriptions.push(
				this._attachmentsService.addAgreementAttachment(ID, this.newAttachment, this.uploadedFile).subscribe((data: any) => {
					this.emitAttachmentDetails(data.agreementAttachments);
					$('#addAgreementAttachment').modal('hide');
					this.clearAttachmentDetails();
					this.showSuccessToast();
				},
					error => {
						this.showErrorToast();
						this.clearAttachmentDetails();
					}));
		}
	}

	emitAttachmentDetails(attachments) {
		this.attachmentSave.emit({ data: attachments, isShowAddAttachmentModal: false });
	}

	checkMandatoryFilled() {
		this.attachmentWarningMsg = null;
		if (this.uploadedFile.length === 0) {
			this.attachmentWarningMsg = '* Please choose atleast one document';
		}
		this.uploadedFile.forEach((ele, uploadIndex) => {
			if (this.newAttachment[uploadIndex].agreementAttachmentTypeCode == 'null' || !this.newAttachment[uploadIndex].agreementAttachmentTypeCode) {
				this.attachmentWarningMsg = '* Please select Document Type';
			}
		});
	}

	onAttachmentTypeChange(index: number, typeCode: number | string) {
		const TYPE = this.result.agreementAttachmentTypes.find(attchmentType => attchmentType.agreementAttachmentTypeCode == typeCode);
		this.newAttachment[index].agreementAttachmentType = TYPE;
	}

	showSuccessToast() {
		const toastMsg = this.isReplaceAttachment ? 'Attachment replaced successfully.' : 'Attachment added successfully.';
		this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
	}

	showErrorToast() {
		const toastMsg = this.isReplaceAttachment ? 'Failed to replace attachment.' : 'Failed to add attachment.';
		this._commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
	}

	deleteFromUploadedFileList(index: number) {
		this.uploadedFile.splice(index, 1);
		this.attachmentWarningMsg = null;
		this.newAttachment.splice(index, 1);
	}
}
