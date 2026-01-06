import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { DEFAULT_DATE_FORMAT, HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { ExtReviewer } from '../../reviewer-maintenance.interface';
import { getEndPointOptionsForCountry, getEndPointOptionsForAffiliationKeyWords } from '../../../../common/services/end-point.config';
import { ExtReviewerMaintenanceService } from '../../external-reviewer-maintenance-service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import {
    getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp
} from '../../../../common/utilities/date-utilities';
import { CommonService } from '../../../../common/services/common.service';

@Component({
    selector: 'app-extReviewer-details',
    templateUrl: 'reviewer-details.component.html',
    styleUrls: ['reviewer-details.component.css']
})
export class ReviewerDetailsComponent implements OnInit, OnDestroy {

    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    countrySearchHttpOptions: any;
    extReviewer: ExtReviewer = new ExtReviewer();
    map = new Map();
    primaryEmailWarningMsg: any;
    lookUpData: any = {};
    isMaintainReviewer: any;
    currentUserName = '';
    currentEmail = '';
    agreementStartDate: any;
    agreementEndDate: any;
    externalReviewerDetails: any = {};
    isSaving = false;
    clearCountryField: String;
    extReviewerAcademicSubArea: any;
    isReadMore: false;
    keywordHttpOptions: any = {};
    clearKeywordField: String;
    affiliationSearchHttpOptions: any;
    keywordWaringMsg = '';
    extReviewerAffiliation = [];

    constructor(public _extReviewerMaintenanceService: ExtReviewerMaintenanceService,
        private _commonService: CommonService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute) { }
        
    ngOnInit() {
        this.isMaintainReviewer = this._extReviewerMaintenanceService.getMaintainReviewerPermission();
        this.setQueryParams();
        this.getExternalReviewerData();
    }

    getExternalReviewerData(): void {
        this.$subscriptions.push(this._extReviewerMaintenanceService.$externalReviewerDetails.subscribe((data: any) => {
            if (data.extReviewer) {
                this.externalReviewerDetails = JSON.parse(JSON.stringify(data));
                this.extReviewer = this.externalReviewerDetails.extReviewer;
                this.extReviewer.isUsernameChange = false;
                this.currentUserName = this.extReviewer.principalName;
                this.currentEmail = this.extReviewer.primaryEmail;
                this.getSubAreaLookUp();
                if (this.extReviewer.agreementStartDate) {
                    this.agreementStartDate = getDateObjectFromTimeStamp(this.extReviewer.agreementStartDate);
                }
                if (this.extReviewer.agreementEndDate) {
                    this.agreementEndDate = getDateObjectFromTimeStamp(this.extReviewer.agreementEndDate);
                }
                if (this.extReviewer.countryDetails) {
                    this.countrySearchHttpOptions.defaultValue = this.extReviewer.countryDetails.countryName;
                }
                if (this.extReviewer.affiliationInstitution) {
                    this.affiliationSearchHttpOptions.defaultValue = this.extReviewer.affiliationInstitution.description;
                }
            }
        }));
    }

    setInitialValues() {
        this.lookUpData = this._extReviewerMaintenanceService.lookUpData;
    }

    getEndPointOptions() {
        this.countrySearchHttpOptions = getEndPointOptionsForCountry();
        this.affiliationSearchHttpOptions = getEndPointOptionsForAffiliationKeyWords();
    }

    constructName() {
        this.extReviewer.firstName = this.extReviewer.firstName.trim();
        this.extReviewer.middleName = this.extReviewer.middleName.trim();
        this.extReviewer.lastName = this.extReviewer.lastName.trim();
        let nameArray = [this.extReviewer.firstName, this.extReviewer.middleName, this.extReviewer.lastName];
        nameArray = nameArray.filter(Boolean);
        this.extReviewer.passportName = nameArray.join(' ');
    }

    bindUName() {
        if (this._extReviewerMaintenanceService.mode === 'create') {
            this.extReviewer.principalName = this.extReviewer.primaryEmail.trim();
        }
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    countryChangeFunction(event) {
        this.extReviewer.countryCode = null;
        this.extReviewer.countryDetails = null;
        if (event) {
            const countryCode = event.countryCode;
            const countryName = event.countryName;
            const countryDetails = {
                countryCode,
                countryName
            };
            this.extReviewer.countryCode = event.countryCode;
            this.extReviewer.countryDetails = countryDetails;
        }
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    setAcademicRank() {
        this.extReviewer.academicRank = this.lookUpData.extReviewerAcademicRank.find(rank =>
            rank.academicRankCode === this.extReviewer.academicRankCode);
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    setPrimaryAcademicArea() {
        this.extReviewer.academicAreaPrimary = this.lookUpData.extReviewerAcademicArea.find(area =>
            area.academicAreaCode === this.extReviewer.academicAreaCodePrimary);
        this._extReviewerMaintenanceService.isDataChange = true;
        this.extReviewer.academicAreaSecondary = null;
        this.extReviewer.academicAreaCodeSecondary = null;
        this.getSubAreaLookUp();
    }

    private getSubAreaLookUp(): void {
        this.extReviewerAcademicSubArea =
        this.lookUpData.extReviewerAcademicSubArea.filter(ele => ele.academicAreaCode === this.extReviewer.academicAreaCodePrimary);
        this.extReviewerAcademicSubArea = this.extReviewerAcademicSubArea.length ? this.extReviewerAcademicSubArea  : [];
    }

    setSecondaryAcademicArea() {
        this.extReviewer.academicAreaSecondary = this.lookUpData.extReviewerAcademicSubArea.find(area =>
            area.academicSubAreaCode === this.extReviewer.academicAreaCodeSecondary);
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    isUsernameChange() {
        if (this.currentUserName && this.currentUserName !== this.extReviewer.principalName) {
            this.extReviewer.isUsernameChange = true;
        } else {
            this.extReviewer.isUsernameChange = false;
        }
    }

    isEmailChange() {
        this.extReviewer.isEmailChange = (this.currentEmail && this.currentEmail !== this.extReviewer.primaryEmail) ? 
             true : false;
    }

    extReviewerValidation() {
        this.emailValidation();
        this.map.clear();
        if (!this.extReviewer.firstName) {
            this.map.set('firstName', 'firstname');
        }
        if (!this.extReviewer.lastName) {
            this.map.set('lastName', 'lastname');
        }
        if (!this.extReviewer.passportName) {
            this.map.set('passportName', 'passportname');
        }
        if (!this.extReviewer.primaryEmail) {
            this.map.set('primaryEmail', 'primaryemail');
        }
        if (!this.extReviewer.principalName) {
            this.map.set('principalName', 'principalName');
        }
    }

    emailValidation() {
        this.primaryEmailWarningMsg = null;
        if (this.extReviewer.primaryEmail) {
            this.extReviewer.primaryEmail = this.extReviewer.primaryEmail.trim();
            if (this.extReviewer.primaryEmail !== undefined && this.extReviewer.primaryEmail !== '') {
                const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)| (".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!(email.test(String(this.extReviewer.primaryEmail).toLowerCase()))) {
                    this.primaryEmailWarningMsg = 'Please select a valid email address.';
                } else {
                    this.primaryEmailWarningMsg = null;
                }
            }
        }
    }

    setExtReviewerData() {
        this.extReviewer.firstName = this.extReviewer.firstName.trim();
        this.extReviewer.lastName = this.extReviewer.lastName.trim();
        this.extReviewer.passportName = this.extReviewer.passportName.trim();
        this.extReviewer.primaryEmail = this.extReviewer.primaryEmail.trim();
        this.extReviewer.principalName = this.extReviewer.principalName.trim();
        this.isUsernameChange();
        this.isEmailChange();
        if (this.extReviewer.middleName) {
            this.extReviewer.middleName = this.extReviewer.middleName.trim();
        }
        if (this.extReviewer.department) {
            this.extReviewer.department = this.extReviewer.department.trim();
        }
        this.extReviewer.agreementStartDate = parseDateWithoutTimestamp(this.agreementStartDate);
        this.extReviewer.agreementEndDate = parseDateWithoutTimestamp(this.agreementEndDate);
    }

    setRequestObject() {
        const REQUESTREPORTDATA: any = {};
        REQUESTREPORTDATA.extReviewer = this.extReviewer;
        if (this.externalReviewerDetails.extReviewerId) {
            REQUESTREPORTDATA.extReviewerId = this.externalReviewerDetails.extReviewerId;
        }
        return REQUESTREPORTDATA;
    }

    saveResponseData(data) {
        this.extReviewer = data.extReviewer;
        this.externalReviewerDetails.extReviewerId = data.extReviewer.externalReviewerId;
        this.externalReviewerDetails.extReviewer = this.extReviewer;
        this._extReviewerMaintenanceService.setExternalReviewerDetails(this.externalReviewerDetails);
        if (this.extReviewer.agreementStartDate) {
            this.agreementStartDate = getDateObjectFromTimeStamp(this.extReviewer.agreementStartDate);
        }
        if (this.extReviewer.agreementEndDate) {
            this.agreementEndDate = getDateObjectFromTimeStamp(this.extReviewer.agreementEndDate);
        }
        if (data.externalReviewerRight) {
            this.externalReviewerDetails.externalReviewerRight = data.externalReviewerRight;
        }
        this._extReviewerMaintenanceService.setExternalReviewerDetails(this.externalReviewerDetails);
        this._extReviewerMaintenanceService.isDataChange = false;
    }

    saveReviewer() {
        if (!this.isSaving && this._extReviewerMaintenanceService.isDataChange) {
            this.setExtReviewerData();
            this.extReviewerValidation();
            if ((this.map.size < 1) && (this.primaryEmailWarningMsg === null || this.primaryEmailWarningMsg === undefined)) {
                this.isSaving = true;
                const REQUESTREPORTDATA = this.setRequestObject();
                this.$subscriptions.push(this._extReviewerMaintenanceService.saveOrUpdateExtReviewer(REQUESTREPORTDATA)
                    .subscribe((data: any) => {
                        if (data.extReviewer) {
                            this.saveResponseData(data);
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
                            this._router.navigate(['/fibi/maintain-external-reviewer/external-reviewer-details/overview'],
                                { queryParams: { 'externalReviewerId': data.extReviewer.externalReviewerId, 'mode': 'edit' } });
                            this.isSaving = false;
                        } else {
                            let messageParts = data.message.split(' && ').map(part => part.trim());
                            const userNameErrorMessage = messageParts[0];
                            const emailErrorMessage = messageParts[1];
                            const errorMessage = userNameErrorMessage && emailErrorMessage ? 
                                                 "Username and Primary Email already exists" 
                                                 : userNameErrorMessage || emailErrorMessage;
                            this._commonService.showToast(HTTP_ERROR_STATUS, errorMessage);
                            this.map.set('userName', userNameErrorMessage);
                            this.map.set('emailAddress', emailErrorMessage);
                            this.isSaving = false;
                        }  
                    }
                    ));
            }
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    addKeywordToDatabase(event): void {
        this.$subscriptions.push(
            this._extReviewerMaintenanceService.addAffiliationInstitution({ 'affiliationInstitution': event.searchString }).subscribe((data: any) => {
                if (data && data.affiliationInstitutionCode) {
                    this.keywordChangeHandler(data);
                    this.externalReviewerDetails.extReviewer.affiliationInstitution = data;
                } else {
                    this.setKeywordErrorMessage();
                }
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in adding new Affiliated Institution.');
            }));
        this._extReviewerMaintenanceService.setExternalReviewerDetails(this.externalReviewerDetails);
    }

    keywordChangeHandler(data) {
        this.map.delete('keywords');
        if (data) {
            this.extReviewer.affiliationInstitutionCode = data.affiliationInstitutionCode;
            this.extReviewer.affiliationInstitution = data;
        } else {
            this.extReviewer.affiliationInstitutionCode = null;
            this.extReviewer.affiliationInstitution = {};
        }
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    private setKeywordErrorMessage(): void {
        this.keywordWaringMsg = 'Affiliated Institution already added';
        setTimeout(() => this.keywordWaringMsg = '', 4000);
        this.keywordHttpOptions = getEndPointOptionsForAffiliationKeyWords();
        this.extReviewer.affiliationInstitutionCode = null;
        this.extReviewer.affiliationInstitution = null;
        this.clearKeywordField = new String('true');
    }

    private setQueryParams() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            this.getEndPointOptions();
            this.setInitialValues();
            this._extReviewerMaintenanceService.isDataChange = false;
        }));
    }

}
