import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { EndorsementEditService } from './endorsement-edit.service';
import { Subscription } from 'rxjs';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { CommonService } from '../../../common/services/common.service';
import { CommonDataService } from '../../services/common-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { isValidEmailAddress, setFocusToElement } from '../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-endorsement-edit',
    templateUrl: './endorsement-edit.component.html',
    styleUrls: ['./endorsement-edit.component.css'],
    providers: [EndorsementEditService]
})
export class EndorsementEditComponent implements OnInit, OnChanges, OnDestroy {

    @Input() result: any = {};
    claim: any = {};
    claimDetails: any = {};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    rdoApprovalDate: any = null;
    claimSubmissionDate: any = null;
    foApprovalDate: any = null;
    rsoApprovalDate: any = null;
    isCollapsePayment = false;
    updateUser = this._commonService.getCurrentUserDetail('userName');
    claimValidationsMap = new Map();
    $subscriptions: Subscription[] = [];

    constructor(private _endorsementEditService: EndorsementEditService,
        private _commonService: CommonService,
        public _commonData: CommonDataService) {
    }

    ngOnInit() {
        this.getClaimDetails();
        this.checkSaveClicked();
    }

    ngOnChanges(): void {
        if (this.result) {
            this.rdoApprovalDate = getDateObjectFromTimeStamp(this.result.rdoApprovalDate);
            this.claimSubmissionDate = getDateObjectFromTimeStamp(this.result.claimSubmissionDate);
            this.foApprovalDate = getDateObjectFromTimeStamp(this.result.foApprovalDate);
            this.rsoApprovalDate = getDateObjectFromTimeStamp(this.result.rsoApprovalDate);
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    getClaimDetails() {
        this.$subscriptions.push(
            this._commonData.$claimData.subscribe((res: any) => {
                if (res) {
                    this.claimDetails = res;
                }
            })
        );
    }

    /**
     * listens to the click event from claim header SAVE button.
     */
    checkSaveClicked() {
        this.$subscriptions.push(
            this._commonData.$saveEndorsement.subscribe((clicked: boolean) => {
                if (clicked) {
                    this.saveClaim();
                }
            })
        );
    }

    /**
     * functionality to save or update endorsement form data
     */
    saveClaim() {
        this.validateForm();
        if (this.result.claimId && (this.claimValidationsMap.size === 0)) {
            this.$subscriptions.push(
                this._endorsementEditService.saveOrUpdateClaim(this.generateRequestObject(this.result)).subscribe((res: any) => {
                    if (res) {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Endorsement Saved Successfully');
                        this._commonData.isClaimDataChange = false;
                        this.setClaimDetails(res);
                        this._commonData.setClaimData(JSON.parse(JSON.stringify(this.claimDetails)));
                    }
                }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Save endorsement failed. Please try again.'))
            );
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS,
                'Saving endorsement failed .Please review whether fields are filled correctly.');
        }
    }

    /**
     * generates request object for save or update claim with only original claim object i.e without claim status and award details
     * all dates are parsed from javascript timestamp to "yyyy-mm-dd" format
     * @param claimsStatus
     * @param award
     * @param originalClaimObject
     */
    generateRequestObject({ claimsStatus, award, ...originalClaimObject }: any) {
        return {
            claim: {
                ...originalClaimObject,
                rdoApprovalDate: parseDateWithoutTimestamp(this.rdoApprovalDate),
                claimSubmissionDate: parseDateWithoutTimestamp(this.claimSubmissionDate),
                foApprovalDate: parseDateWithoutTimestamp(this.foApprovalDate),
                rsoApprovalDate: parseDateWithoutTimestamp(this.rsoApprovalDate),
                updateUser: this.updateUser,
            }
        };
    }

    /**
     * properties are individually updated since claim object response have different
     * OR null data on some properties than what we get from initial claim details.
     * @param claim
     */
    setClaimDetails({ claim }) {
        this.claimDetails.claim.fundingSchemeCertification1 = claim.fundingSchemeCertification1;
        this.claimDetails.claim.fundingSchemeCertification2 = claim.fundingSchemeCertification2;
        this.claimDetails.claim.fundingSchemeEndorsement = claim.fundingSchemeEndorsement;
        this.claimDetails.claim.rsoName = claim.rsoName;
        this.claimDetails.claim.rsoDesignation = claim.rsoDesignation;
        this.claimDetails.claim.rsoEmail = claim.rsoEmail;
        this.claimDetails.claim.rsoApprovalDate = claim.rsoApprovalDate;
        this.claimDetails.claim.rsoPhoneNumber = claim.rsoPhoneNumber;
        this.claimDetails.claim.foName = claim.foName;
        this.claimDetails.claim.foDesignation = claim.foDesignation;
        this.claimDetails.claim.foEmail = claim.foEmail;
        this.claimDetails.claim.foApprovalDate = claim.foApprovalDate;
        this.claimDetails.claim.foPhoneNumber = claim.foPhoneNumber;
        this.claimDetails.claim.rdoName = claim.rdoName;
        this.claimDetails.claim.rdoDesignation = claim.rdoDesignation;
        this.claimDetails.claim.rdoEmail = claim.rdoEmail;
        this.claimDetails.claim.rdoApprovalDate = claim.rdoApprovalDate;
        this.claimDetails.claim.rdoPhoneNumber = claim.rdoPhoneNumber;
        this.claimDetails.claim.claimSubmissionDate = claim.claimSubmissionDate;
        this.claimDetails.claim.auditorName = claim.auditorName;
        this.claimDetails.claim.externalAuditorName = claim.externalAuditorName;
        this.claimDetails.claim.payeeAccountName = claim.payeeAccountName;
        this.claimDetails.claim.payeeAccountNumber = claim.payeeAccountNumber;
        this.claimDetails.claim.payeeBank = claim.payeeBank;
        this.claimDetails.claim.updateUserName = claim.updateUserName;
        this.claimDetails.claim.updateTimeStamp = claim.updateTimeStamp;
    }

    validateForm() {
        ['rsoEmail', 'foEmail', 'rdoEmail'].forEach((phone: string) => this.validateEmailAddress(phone));
        ['rsoPhoneNumber', 'foPhoneNumber', 'rdoPhoneNumber'].forEach((phone: string) => this.phoneNumberValidation(phone));
        ['payeeAccountName', 'payeeAccountNumber', 'payeeBank'].forEach((fieldName: string) => this.validateFieldNotEmpty(fieldName));
    }

    validateFieldNotEmpty(fieldName: string) {
        const fieldValue: string = this.result[fieldName];
        !(fieldValue.trim()) ?
        this.claimValidationsMap.set(fieldName, fieldName)
        : this.claimValidationsMap.delete(fieldName);
    }

    validateEmailAddress(name: string) {
        const emailAddress: string = this.result[name];
        if (emailAddress && emailAddress.trim()) {
            if (!(isValidEmailAddress(emailAddress))) {
                this.claimValidationsMap.set(name, 'Please enter a valid email address');
            } else {
                this.claimValidationsMap.delete(name);
            }
        } else {
            this.claimValidationsMap.delete(name);
        }
    }

    phoneNumberValidation(name) {
        const phoneNumber: string = this.result[name];
        if (phoneNumber && phoneNumber.trim()) {
            // tslint:disable-next-line:max-line-length
            const pattern = (/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[0-9]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/);
            if (!pattern.test(phoneNumber)) {
                this.checkForInvalidPhoneNumber(phoneNumber, name);
            } else {
                this.claimValidationsMap.delete(name);
            }
        } else {
            this.claimValidationsMap.delete(name);
        }
    }

    checkForInvalidPhoneNumber(input, name) {
        if (/^([a-zA-Z]|[0-9a-zA-Z])+$/.test(input)) {
            this.claimValidationsMap.set(name, 'Alphabets cannot be added in Phone number field.');
        } else {
            this.claimValidationsMap.set(name, 'Please add a valid number');
        }
    }

}
