// Last Updated By Ramlekshmy I on 10-08-2020
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { CommonService } from '../../../../common/services/common.service';
import { ProposalService } from '../../../services/proposal.service';
import { ProposalHomeService } from '../../proposal-home.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, DEFAULT_DATE_FORMAT } from '../../../../app-constants';
import { setFocusToElement, validatePercentage } from '../../../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp, getDateObjectFromTimeStamp, compareDates } from '../../../../common/utilities/date-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { DataStoreService } from '../../../services/data-store.service';
import { ActivatedRoute } from '@angular/router';
import { AutoSaveService } from '../../../../common/services/auto-save.service';

declare var $: any;
@Component({
    selector: 'app-declaration',
    templateUrl: './declaration.component.html',
    styleUrls: ['./declaration.component.css']
})
export class DeclarationComponent implements OnInit, OnDestroy {
    @Input() result: any = {};
    @Input() isEditMode: Boolean;
    @Input() helpText: any = {};

    sponsorObject: any = {
        sponsorType: null,
        fullName: null,
        proposalPersonRole: null,
        proposalFundingStatus: null,
        currency: null,
        amount: 0
    };
    deleteSponsorId = null;
    sponsorHttpOptions: any = {};
    clearSponsorSearchField: String;
    viewDeclarationObject: any = {};
    fundingMap = new Map();
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    isDeclarationWidgetOpen = true;
    proposalIdBackup = null;
    hasUnsavedChanges = false;
    editIndex: number = null;

    constructor(public _commonService: CommonService,
                private _proposalHomeService: ProposalHomeService,
                private _proposalService: ProposalService,
                private _dataStore: DataStoreService,
                private _activatedRoute: ActivatedRoute,
                private _autoSaveService: AutoSaveService) { }

    ngOnInit() {
        this.getProposalDetailsFromRoute();
        this.setFundingAgencyEndPointSearchOptions('');
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getProposalDetailsFromRoute() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            if (this.proposalIdBackup != this.result.proposal.proposalId) {
                this.proposalIdBackup = params['proposalId'];
                this.clearDeclarationDetails();
            }
        }));
    }

    /* fetches sponsors according to sponsor type */
    sponsorTypeChange() {
        this.sponsorObject.sponsorName = null;
        this.clearFundingSource();
        if (this.sponsorObject.sponsorType === 'null' || !this.sponsorObject.sponsorType) {
            this.clearFundingType();
            this.setFundingAgencyEndPointSearchOptions('');
        } else {
            this.sponsorObject.sponsorTypeCode = this.sponsorObject.sponsorType.code;
            // SMU SPECIFIC change - sponsorTypeCode == '5' ie, When funding type is 'Other',
            // funding source will be text box instead of end point search
            if (this.sponsorObject.sponsorTypeCode !== '5') {
                this.setFundingAgencyEndPointSearchOptions(this.sponsorObject.sponsorTypeCode);
            }
        }
        this.setUnsavedChanges(true);
    }

    validateEndDate() {
        this.fundingMap.delete('endDate');
        if (this.sponsorObject.startDate && this.sponsorObject.endDate) {
            if (compareDates(this.sponsorObject.startDate, this.sponsorObject.endDate) === 1) {
                this.fundingMap.set('endDate', 'Please select an end date after start date');
            }
        }
    }

    /* adds declaration details */
    addSponsor() {
        this.checkDeclarationMandatoryFieldsFilled();
        if (this.fundingMap.size < 1) {
            this.prepareRequest();
            this.$subscriptions.push(this._proposalHomeService.addFundingSupport({
                'updateUser': this._commonService.getCurrentUserDetail('userName'),
                'proposalId': this.result.proposal.proposalId,
                'proposalSponsor': this.sponsorObject,
            }).subscribe((data: any) => {
                this.result.proposalSponsors = data;
                this._dataStore.updateStore(['proposalSponsors'], this.result);
                $('#add-declaration-modal').modal('hide');
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, (!this.sponsorObject.sponsorId ? 'Adding' : 'Updating') +
                        ' Funding Support failed. Please try again.');
                },
                () => {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Funding support ' + (this.editIndex == null ? 'added' : 'updated') +
                    ' successfully.');
                    this.clearDeclarationDetails();
                    this.editIndex = null;
                }));
        }
    }

    prepareRequest() {
        this.setRoleId();
        this.setStatusCode();
        this.setCurrencyCode();
        this.sponsorObject.startDate = parseDateWithoutTimestamp(this.sponsorObject.startDate);
        this.sponsorObject.endDate = parseDateWithoutTimestamp(this.sponsorObject.endDate);
        this.sponsorObject.proposalId = this.result.proposal.proposalId;
        this.sponsorObject.updateTimeStamp = (new Date()).getTime();
        this.sponsorObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    }

    /**limitKeypress - limit the input field b/w 0 and 100 with 2 decimal points
     * @param {} value
     */
    limitKeypress(value) {
        this.fundingMap.delete('percentageOfEffort');
        if (validatePercentage(value)) {
            this.fundingMap.set('percentageOfEffort', validatePercentage(value));
        }
    }

    /* deletes funding agency details */
    deleteSponsor() {
        this.$subscriptions.push(this._proposalHomeService.deleteProposalSponsor({
            'proposalId': this.result.proposal.proposalId,
            'sponsorId': this.deleteSponsorId
        })
            .subscribe((data: any) => {
                this.result.proposalSponsors = data.proposalSponsors;
                this._dataStore.updateStore(['proposalSponsors'], this.result);
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Funding Support failed. Please try again.');
                },
                () => {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Funding Support deleted successfully.');
                }));
    }

    setFundingAgencyEndPointSearchOptions(sponsorTypeCode) {
        const sponsorName = this.sponsorObject.sponsor ? this.sponsorObject.sponsor.sponsorName : null;
        this.sponsorHttpOptions = this._proposalService.setHttpOptions('sponsorName', 'sponsorName', 'fetchSponsorsBySponsorType',
            sponsorName, { 'sponsorTypeCode': sponsorTypeCode });
    }

    sponsorSelect(event) {
        this.clearFundingType();
        if (!event) {
            this.clearFundingSource();
        } else {
            if (!this.sponsorObject.sponsorType) {
                this.sponsorObject.sponsorType = this.setSponsorType(event.sponsorType.code);
                this.sponsorObject.sponsorTypeCode = event.sponsorTypeCode;
            }
            this.sponsorObject.sponsor = event;
            this.sponsorObject.sponsorCode = event.sponsorCode;
        }
    }

    clearFundingSource() {
        this.sponsorObject.sponsor = null;
        this.sponsorObject.sponsorCode = null;
    }

    clearFundingType() {
        this.sponsorObject.sponsorType = null;
        this.sponsorObject.sponsorTypeCode = null;
    }

    checkDeclarationMandatoryFieldsFilled() {
        this.fundingMap.clear();
        if (this.sponsorObject.fullName === null || this.sponsorObject.fullName === 'null') {
            this.fundingMap.set('person', '* Please select a team member');
        }
        this.limitKeypress(this.sponsorObject.percentageOfEffort);
        this.validateEndDate();
        this.amountValidation();
        this.setUnsavedChanges(true);
    }

    /* while selecting 'select' option from drop down, the value of this.sponsorObject.proposalPersonRole is 'null',
     this.sponsorObject.proposalPersonRole is set to null */
    setRoleId() {
        this.sponsorObject.proposalPersonRole = this.sponsorObject.proposalPersonRole &&
            this.sponsorObject.proposalPersonRole !== 'null' ? this.sponsorObject.proposalPersonRole : null;
        this.sponsorObject.personRoleId = this.sponsorObject.proposalPersonRole ? this.sponsorObject.proposalPersonRole.id : null;
    }

    /* while selecting 'select' option from drop down, the value of this.sponsorObject.proposalFundingStatus is 'null',
      this.sponsorObject.proposalFundingStatus is set to null */
    setStatusCode() {
        this.sponsorObject.proposalFundingStatus = this.sponsorObject.proposalFundingStatus &&
            this.sponsorObject.proposalFundingStatus !== 'null' ? this.sponsorObject.proposalFundingStatus : null;
        this.sponsorObject.fundingStatusCode = this.sponsorObject.proposalFundingStatus ?
            this.sponsorObject.proposalFundingStatus.fundingStatusCode : null;
    }

    /* while selecting 'select' option from drop down, the value of this.sponsorObject.currency is 'null',
       this.sponsorObject.currency is set to null */
    setCurrencyCode() {
        this.sponsorObject.currency = this.sponsorObject.currency && this.sponsorObject.currency !== 'null' ?
            this.sponsorObject.currency : null;
        this.sponsorObject.currencyCode = this.sponsorObject.currency ? this.sponsorObject.currency.currencyCode : null;
    }

    /* edits declaration details */
    editDeclaration(index) {
        this.fundingMap.clear();
        this.editIndex = index;
        this.sponsorObject = JSON.parse(JSON.stringify(this.result.proposalSponsors[index]));
        this.sponsorObject.fullName = this.result.proposalSponsors[index].fullName ? this.result.proposalSponsors[index].fullName : null;
        this.sponsorObject.sponsorType = this.result.proposalSponsors[index].sponsorType ?
            this.setSponsorType(this.result.proposalSponsors[index].sponsorType.code) : null;
        this.sponsorObject.startDate = this.sponsorObject.startDate ? getDateObjectFromTimeStamp(this.sponsorObject.startDate) : null;
        this.sponsorObject.endDate = this.sponsorObject.endDate ? getDateObjectFromTimeStamp(this.sponsorObject.endDate) : null;
        this.setLookupFields(index);
        // SMU SPECIFIC change - sponsorTypeCode == '5' ie, When funding type is 'Other',
        // funding source will be text box instead of end point search
        if (this.sponsorObject.sponsorTypeCode !== '5') {
            this.setFundingAgencyEndPointSearchOptions(this.sponsorObject.sponsorTypeCode);
            this.clearSponsorSearchField = new String('false');
            this.sponsorHttpOptions.defaultValue = this.sponsorObject.sponsor ? this.sponsorObject.sponsor.sponsorName : '';
        }
    }

    setLookupFields(index) {
        this.sponsorObject.proposalPersonRole = this.result.proposalSponsors[index].proposalPersonRole ?
            this.result.proposalPersonRoles.find(role => role.id === this.result.proposalSponsors[index].proposalPersonRole.id) : null;
        this.sponsorObject.currency = this.result.proposalSponsors[index].currency ? this.result.currencyDetails.find(currency =>
            currency.currencyCode === this.result.proposalSponsors[index].currency.currencyCode) : null;
        this.sponsorObject.proposalFundingStatus = this.result.proposalSponsors[index].proposalFundingStatus ?
            this.result.proposalFundingStatus.find(status =>
                status.fundingStatusCode === this.result.proposalSponsors[index].proposalFundingStatus.fundingStatusCode) : null;
    }

    clearDeclarationDetails() {
        this.sponsorObject = {};
        this.sponsorObject.sponsorName = null;
        this.setFundingAgencyEndPointSearchOptions('');
        this.clearSponsorSearchField = new String('true');
        this.sponsorObject.proposalFundingStatus = null;
        this.sponsorObject.proposalPersonRole = null;
        this.sponsorObject.currency = null;
        this.sponsorObject.amount = 0;
        this.sponsorObject.fullName = null;
        this.sponsorObject.sponsorType = null;
        this.sponsorHttpOptions.defaultValue = '';
        this.fundingMap.clear();
        this.setUnsavedChanges(false);
        this.editIndex = null;
    }

    viewDeclarationDetails(proposalSponsor) {
        this.viewDeclarationObject = {};
        this.viewDeclarationObject = JSON.parse(JSON.stringify(proposalSponsor));
    }

    setSponsorType(sponsorTypeCode) {
        return this.result.sponsorTypes.find(sponsorType =>
            sponsorType.code === sponsorTypeCode);
    }

    amountValidation() {
        this.fundingMap.delete('amount');
        const pattern = /^(?:[0-9][0-9]{0,9}(?:\.\d{0,2})?|9999999999|9999999999.00|9999999999.99)$/;
        if (this.sponsorObject.amount && !pattern.test(this.sponsorObject.amount)) {
            this.fundingMap.set('amount', 'Enter a valid amount as 10 digits up to 2 decimal places.');
        }
    }

    setUnsavedChanges(flag: boolean) {
        if (this.hasUnsavedChanges !== flag) {
            this._autoSaveService.setUnsavedChanges('Funding Support', 'fundingSupport', flag);
        }
        this.hasUnsavedChanges = flag;
    }

}
