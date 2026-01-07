import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { PersonTrainingService } from '../person-training.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { CommonService } from '../../../common/services/common.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { fileDownloader, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { EndpointOptions, PersonTrainingComments, Training } from '../person-training.interface';
import { getEndPointOptionsForTraining } from '../../../common/services/end-point.config';
import { Subscription } from 'rxjs';
import {
    compareDatesWithoutTimeZone,
    getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp,
    isValidDateFormat
} from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-training-details',
    templateUrl: './training-details.component.html',
    styleUrls: ['./training-details.component.css']
})
export class TrainingDetailsComponent implements OnInit, OnDestroy {

    trainingSearchOptions: EndpointOptions;
    personSearchOptions: any = {};
    elasticSelectedPerson: any = {};
    personnelTrainingInfo: any;
    elasticPlaceHolder: string;
    userName = this._commonService.getCurrentUserDetail('userName');
    clearField: any = 'false';
    personType = 'employee';
    personTrainingId;
    hasFromParameter = false;
    attachmentDeleteObj = {fileDataId: null, trainingAttachmentId: null, index: null};
    isEditMode = false;
    commentSelectedRow = null;
    showPersonElasticBand = false;
    noFileChosen = false;
    isCommentEdit = false;
    showPopup = false;
    isCommentDelete = false;
    commentDeleteIndex = null;
    showCommentDiv = false;
    multipleFile = false;
    personnelTrainingComments: PersonTrainingComments[] = [];
    personnelTrainingAttachments = [];
    uploadedFile: File[] | any[] = [];
    attachmentList: any[] = [];
    requestObject = {
        personTrainingId: null
    };
    personTraining = {
        personID: null,
        nonEmployee: 'N',
    };
    personTrainingComments = new PersonTrainingComments();
    attachmentModal = {
        acType: null,
        attachmentId: null,
        personTrainingId: null,
        description: null,
        fileName: null,
        mimeType: null,
        updateUser: null
    };
    invalidData = {
        invalidPersonData: false,
        invalidCommentData: false,
        invalidAttachmentData: false,
        dateAcknowledged: false,
        followupDate: false,
        invalidDateAcknowledgedMessage: '',
        invalidFollowupDateMessage: ''
    };
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    validationMap = new Map();
    personTrainingDetails: any = {};
    score: string;
    $subscriptions: Subscription[] = [];

    constructor(private _elasticConfig: ElasticConfigService,
                private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _location: Location,
                private _personTrainingService: PersonTrainingService,
                private _commonService: CommonService) {
    }

    ngOnInit() {
        this.setElasticOptions();
        this.getPathVariablesAndLoadData();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    populateFieldData() {
        if (this.personnelTrainingInfo.personDetails && this.personnelTrainingInfo.personTraining) {
            this.personTrainingDetails.dateAcknowledged =
                getDateObjectFromTimeStamp(this.personnelTrainingInfo.personTraining.dateAcknowledged);
            this.personTrainingDetails.followupDate = getDateObjectFromTimeStamp(this.personnelTrainingInfo.personTraining.followupDate);
            this.clearField = false;
            this.personSearchOptions.defaultValue = this.personnelTrainingInfo.personDetails.name;
            this.personTraining.personID = this.personnelTrainingInfo.personTraining.personId;
            this.personTraining.nonEmployee = this.personnelTrainingInfo.personTraining.nonEmployee ? 'Y' : 'N';
            this.personType = this.personnelTrainingInfo.personTraining.nonEmployee ? 'non-employee' : 'employee';
            this.trainingSearchOptions.defaultValue = this.personnelTrainingInfo.personTraining.training.description;
            this.personTrainingDetails.training = this.personnelTrainingInfo.personTraining.training;
            this.personTrainingDetails.trainingCode = this.personnelTrainingInfo.personTraining.trainingCode;
            this.personTrainingDetails.personTrainingId = this.personnelTrainingInfo.personTraining.personTrainingId;
        }
    }

    /**
     * @param  {} type- Change the elastic based on type
     */
    changePersonType(type) {
        this.clearField = new String('false');
        this.personSearchOptions.defaultValue = '';
        this.personTraining.personID = null;
        if (type === 'employee') {
            this.elasticPlaceHolder = 'Search for an Employee Name';
            this.personTraining.nonEmployee = 'N';
            this.personSearchOptions = this._elasticConfig.getElasticForPerson();
        } else {
            this.elasticPlaceHolder = 'Search for an Non-Employee Name';
            this.personTraining.nonEmployee = 'Y';
            this.personSearchOptions = this._elasticConfig.getElasticForRolodex();
        }
    }

    /**
     * @param  {} personDetails - person choosen from the elastic search
     */
    selectPersonElasticResult(personDetails) {
        this.elasticSelectedPerson = personDetails;
        this.showPersonElasticBand = personDetails != null;
        if (personDetails != null) {
            this.validationMap.set('personID', false);
            this.setDetailsFromElastic(personDetails);
            this.personSearchOptions.defaultValue = personDetails.full_name;
            this.personTraining.personID = this.personSearchOptions.type === 'person' ?
                personDetails.prncpl_id : personDetails.rolodex_id;
        } else {
            this.personSearchOptions.defaultValue = '';
            this.personTraining.personID = null;
        }
    }

    setDetailsFromElastic(value: any) {
        this.elasticSelectedPerson.fullName = value.full_name;
        this.elasticSelectedPerson.organization = value.organization;
        this.elasticSelectedPerson.designation = this.personType === 'non-employee' ? value.primary_title : value.designation;
        this.elasticSelectedPerson.email = value.email_addr ? value.email_addr : (value.email_address ? value.email_address : null);
        this.elasticSelectedPerson.phoneNumber = value.phone_nbr ? value.phone_nbr : (value.phone_number ? value.phone_number : null);
        this.elasticSelectedPerson.isExternalUser = value.external === 'Y' ? true : false;
        this.elasticSelectedPerson.homeUnit = value.unit_name;
    }

    /** Push the unique files choosen to uploaded file
     * @param files- files choosen
     */
    fileDrop(files) {
        this.uploadedFile = [];
        for (let index = 0; index < files.length; index++) {
            this.uploadedFile.push(files[index]);
        }
    }

    /**Remove an item from the uploded file
     * @param item-item to be removed
     */
    deleteFromUploadedFileList(item) {
        for (let i = 0; i < this.uploadedFile.length; i++) {
            if (this.uploadedFile[i].name === item.name) {
                this.uploadedFile.splice(i, 1);
            }
        }
    }

    dismissAttachmentModal() {
        this.uploadedFile = [];
        this.attachmentModal.description = '';
        document.getElementById('cancelbtn').click();
    }

    /**
     * @param training
     */
    selectedTraining(training: Training) {
        if (training && training.trainingCode) {
            this.validationMap.set('trainingCode', false);
            this.personTrainingDetails.training = training;
            return this.personTrainingDetails.trainingCode = training.trainingCode;
        }
        this.personTrainingDetails.training = null;
        this.personTrainingDetails.trainingCode = null;
    }

    isFormValid(): boolean {
        this.validationMap.clear();
        if (!this.personTrainingDetails.trainingCode) {
            this.validationMap.set('trainingCode', true);
        }
        if (!this.personTraining.personID) {
            this.validationMap.set('personID', true);
            this.invalidData.invalidPersonData = true;
        }
        return Boolean(!this.validationMap.size && !this.invalidData.dateAcknowledged && !this.invalidData.followupDate);
    }

    generateSavePersonTrainingRO() {
        const {trainingCode, training, followupDate, dateAcknowledged, personTrainingId} = this.personTrainingDetails;
        return {
            personTraining: {
                nonEmployee: this.personTraining.nonEmployee === 'Y',
                personId: this.personTraining.personID,
                personTrainingId,
                trainingCode,
                training,
                score: this.score,
                followupDate: parseDateWithoutTimestamp(followupDate),
                dateAcknowledged: parseDateWithoutTimestamp(dateAcknowledged)
            }
        };
    }

    /* save the training basic details */
    savePersonTrainingDetails() {
        if (this.isFormValid()) {
            this.$subscriptions.push(this._personTrainingService
                .saveOrUpdatePersonTraining(this.generateSavePersonTrainingRO())
                .subscribe((res: any) => {
                    this.personnelTrainingInfo = res;
                    this._router.navigate(['/fibi/training-maintenance/person-detail'],
                        {queryParams: {personTrainingId: this.personnelTrainingInfo.personTraining.personTrainingId, E: 'T'}});
                    this.successMessage('Training saved successfully.');
                }, _err => this.errorMessage('Save Training Action failed. Please try again.')));
        }
    }

    /**
     * @param  {} attachment - object of the attachment to be downloaded
     */
    downloadTrainingAttachment(attachment) {
        this.$subscriptions.push(this._personTrainingService
            .downloadTrainingAttachment(attachment.trainingAttachmentId)
            .subscribe((data: any) => {
                fileDownloader(data.body, attachment.fileName);
            }, error => console.log('Error downloading the file.', error)));
    }

    /**
     * @param  {} attachment - object of the attachment to be deleted
     */
    setDeleteAttachmentObj({fileDataId, trainingAttachmentId}, index) {
        this.attachmentDeleteObj = {fileDataId, trainingAttachmentId, index};
        this.isCommentDelete = false;
        this.showPopup = true;
    }

    /* add the training attachment */
    addTrainingAttachment() {
        if (this.uploadedFile.length === 0) {
            this.noFileChosen = true;
        } else {
            this.noFileChosen = false;
            if (this.uploadedFile.length > 1) {
                this.multipleFile = true;
            } else {
                this.processAttachment();
            }
        }
    }

    getUploadAttachmentRO() {
        return {
            acType: 'I', personTrainingAttachment: {
                trainingAttachmentId: null, fileDataId: null,
                description: this.attachmentModal.description,
                fileName: this.uploadedFile[0].name,
                mimeType: this.uploadedFile[0].type,
                personTraining: {personTrainingId: this.personTrainingId}
            }
        };
    }

    /* Save the attachment */
    processAttachment() {
        this.$subscriptions.push(this._personTrainingService
            .saveOrUpdateTrainingAttachment(this.uploadedFile[0], this.getUploadAttachmentRO())
            .subscribe((data: any) => {
                this.personnelTrainingAttachments.push(data.personTrainingAttachment);
                this.successMessage('Attachment added successfully.');
                this.dismissAttachmentModal();
            }, _err => this.errorMessage('Something went wrong. Please try again.')));
    }

    deleteTrainingAttachments() {
        this.$subscriptions.push(this._personTrainingService
            .deleteTrainingAttachment(this.attachmentDeleteObj.trainingAttachmentId)
            .subscribe((_res) => {
                this.personnelTrainingAttachments.splice(this.attachmentDeleteObj.index, 1);
                this.attachmentDeleteObj = null;
                this.successMessage('Attachment deleted successfully.');
            }, _err => this.errorMessage('Something went wrong. Please try again.')));
    }

    /**
     * @param  {} comment - comment object edited
     * @param  {} index - index of the comment object edited
     */
    editTrainingComment(comment, index) {
        this.commentSelectedRow = index;
        this.showCommentDiv = true;
        this.isCommentEdit = true;
        this.personTrainingComments = {...comment};
    }

    /**
     * @param  {} comment- comment object deleted
     */
    deleteTrainingComment(comment, index) {
        this.resetCommentInput();
        this.showPopup = true;
        this.isCommentDelete = true;
        this.commentDeleteIndex = index;
        this.personTrainingComments.trainingCommentId = comment.trainingCommentId;
    }

    getCommentsRO() {
          return  {personTrainingComment: this.personTrainingComments};
    }

    isCommentsValid(): boolean {
        if (!this.personTrainingComments.comment) {
            this.invalidData.invalidCommentData = true;
            return false;
        }
        this.invalidData.invalidCommentData = false;
        return true;
    }

    /* save the training comment */
    saveTrainingComment() {
        if (this.isCommentsValid()) {
            this.$subscriptions.push(this._personTrainingService
                .saveOrUpdateTrainingComments(this.getCommentsRO())
                .subscribe((data: any) => {
                    if (this.isCommentEdit) {
                        this.personnelTrainingComments[this.commentSelectedRow] = {...this.personTrainingComments};
                        this.isCommentEdit = false;
                        this.commentSelectedRow = null;
                        this.showCommentDiv = false;
                    } else {
                        this.personnelTrainingComments.push(data.personTrainingComment);
                    }
                    this.successMessage('Comment saved successfully.');
                    this.personTrainingComments.personTrainingId = this.personTrainingId;
                    this.personTrainingComments.comment = null;
                    this.personTrainingComments.trainingCommentId = null;
                }, _err => this.errorMessage('Something went wrong. Please try again.')));
        }
    }

    deleteComment() {
        this.$subscriptions.push(this._personTrainingService
            .deleteTrainingComments(this.personTrainingComments.trainingCommentId)
            .subscribe((_res) => {
                this.personnelTrainingComments.splice(this.commentDeleteIndex, 1);
                this.personTrainingComments.personTrainingId = this.personTrainingId;
                this.isCommentDelete = false;
                this.commentDeleteIndex = null;
                this.personTrainingComments.trainingCommentId = null;
                this.successMessage('Comment deleted successfully.');
            }, _err => this.errorMessage('Something went wrong. please try again.')));
    }

    resetCommentInput() {
      this.personTrainingComments.personTrainingId = this.personTrainingId;
        if (this.isCommentEdit) {
            this.isCommentEdit = false;
            this.commentSelectedRow = null;
            this.showCommentDiv = false;
        }
        this.invalidData.invalidCommentData = false;
    }

    /* validation for the acknowledgement date and expiration dates */
    validateAcknowledgementDate(event): void {
        this.clearInvalidDateMap('ACKNOWLEDGE');
        if (!this.checkDateFieldEmpty('complete-date')) {
            if (isValidDateFormat(event)) {
                if (this.personTrainingDetails.followupDate && this.personTrainingDetails.dateAcknowledged) {
                    if (compareDatesWithoutTimeZone(this.personTrainingDetails.followupDate,
                            this.personTrainingDetails.dateAcknowledged) === -1) {
                        this.invalidData.dateAcknowledged = true;
                        this.invalidData.invalidDateAcknowledgedMessage = 'Completion Date should be before Expiration Date';
                    }
                }
            } else {
                this.invalidData.dateAcknowledged = true;
                this.invalidData.invalidDateAcknowledgedMessage = 'Entered date format is invalid. Please use '
                                                                    + DEFAULT_DATE_FORMAT + ' format.';
            }
        }
    }

    /* validation for the acknowledgement date and expiration dates */
    validateExpirationDate(event): void {
        this.clearInvalidDateMap('FOLLOWUP');
        if (!this.checkDateFieldEmpty('exp-date')) {
            if (isValidDateFormat(event)) {
                if (this.personTrainingDetails.dateAcknowledged && this.personTrainingDetails.followupDate) {
                    if (compareDatesWithoutTimeZone(this.personTrainingDetails.dateAcknowledged,
                        this.personTrainingDetails.followupDate) === 1) {
                        this.invalidData.followupDate = true;
                        this.invalidData.invalidFollowupDateMessage = 'Expiration Date should be after Completion Date';
                    }
                }
            } else {
                this.invalidData.followupDate = true;
                this.invalidData.invalidFollowupDateMessage = 'Entered date format is invalid. Please use '
                                                                + DEFAULT_DATE_FORMAT + ' format.';
            }
        }
    }

    clearInvalidDateMap(dateType: string): void {
        if (dateType === 'ACKNOWLEDGE') {
            this.invalidData.dateAcknowledged = false;
            this.invalidData.invalidDateAcknowledgedMessage = '';
        } else {
            this.invalidData.followupDate = false;
            this.invalidData.invalidFollowupDateMessage = '';
        }
    }

    checkDateFieldEmpty(elementId: string): boolean {
        const ELEMENT = <HTMLInputElement>document.getElementById(elementId);
        return(ELEMENT.value !== '' ? false : true);
    }

    /* link back to te protocol from which it is taken */
    locationBack() {
        if (this.hasFromParameter) {
            return this._location.back();
        }
        this._router.navigate(['/fibi/training-maintenance']);
    }

    clearAttachmentsModal() {
        this.uploadedFile = [];
        this.attachmentModal.description = '';
        this.noFileChosen = false;
        this.multipleFile = false;
    }

    private getPathVariablesAndLoadData() {
        this._activatedRoute.queryParams.subscribe(async (params) => {
            this.hasFromParameter = params['from'] ? params['from'] : false;
            this.personTrainingId = params['personTrainingId'] ? Number(params['personTrainingId']) : null;
            this.personTrainingComments.personTrainingId = this.personTrainingId;
            if (this.personTrainingId) {
                this.fetchPersonTrainingDetails();
            }
        });
    }

    private fetchPersonTrainingDetails() {
        this.$subscriptions.push(this._personTrainingService
            .getPersonTrainingDetails(this.personTrainingId)
            .subscribe(async (data: any) => { // edit mode is checked using async hence used.
                this.personnelTrainingInfo = data;
                this.score = data.personTraining.score;
                this.personnelTrainingComments = data.personTraining.personTrainingComments == null ?
                    [] : data.personTraining.personTrainingComments;
                this.personnelTrainingAttachments = data.personTraining.personTrainingAttachments == null ?
                    [] : data.personTraining.personTrainingAttachments;
                await this.setEditMode(data.personId);
                if (this.isEditMode) { this.populateFieldData(); }
            }, _err => this.errorMessage('Something went wrong. Please try again.')));
    }

    private async setEditMode(personId: string) {
        this.isEditMode = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
    }

    private setElasticOptions() {
        this.personSearchOptions = this._elasticConfig.getElasticForPerson();
        this.trainingSearchOptions = getEndPointOptionsForTraining();
        this.elasticPlaceHolder = 'Search for an Employee Name';
    }

    private successMessage(message: string) {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, message);
    }

    private errorMessage(message: string) {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }
}


