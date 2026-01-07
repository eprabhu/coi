import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { setFocusToElement, validatePercentage } from '../../../common/utilities/custom-utilities';
import { compareDates, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ProposalService } from '../../services/proposal.service';
import { CurrentPendingService } from '../current-pending.service';
declare var $: any;

@Component({
    selector: 'app-declaration-section',
    templateUrl: './declaration-section.component.html',
    styleUrls: ['./declaration-section.component.css']
})
export class DeclarationSectionComponent implements OnInit, OnChanges, OnDestroy {

    isPersonViewData = false;
    @Input() sponsorObject: any = {};
    deleteSponsorId = null;
    sponsorHttpOptions: any = {};
    clearSponsorSearchField: String;
    fundingMap = new Map();
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    isDeclarationWidgetOpen = true;
    @Input() personDetails: any = {};
    @Output() externalResponse: EventEmitter<any> = new EventEmitter();


    constructor(public _commonService: CommonService, private _cpService: CurrentPendingService,
        private _proposalService: ProposalService) { }

    ngOnInit() {
        this.setFundingAgencyEndPointSearchOptions('');
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
    ngOnChanges() {
        // SMU SPECIFIC change - sponsorTypeCode == '5' ie, When funding type is 'Other',
        // funding source will be text box instead of end point search
        this.sponsorObject.currency = this.sponsorObject.currencyCode ? this.personDetails.currencyDetails.find(currency =>
            currency.currencyCode === this.sponsorObject.currencyCode) : null;
        if (this.sponsorObject.cpReportProjectDetailId && this.sponsorObject.sponsorTypeCode !== '5') {
            this.setFundingAgencyEndPointSearchOptions(this.sponsorObject.sponsorTypeCode);
            this.clearSponsorSearchField = new String('false');
            this.sponsorHttpOptions.defaultValue = this.sponsorObject.sponsor ? this.sponsorObject.sponsor.sponsorName : '';
        }
    }

    /**
     * fetches sponsors according to sponsor type
     */
    sponsorTypeChange() {
        this.clearFundingSource();
        if (this.sponsorObject.sponsorTypeCode === 'null' || !this.sponsorObject.sponsorTypeCode) {
            this.clearFundingType();
        } else {
            // SMU SPECIFIC change - sponsorTypeCode == '5' ie, When funding type is 'Other',
            // funding source will be text box instead of end point search
            if (this.sponsorObject.sponsorTypeCode !== '5') {
                this.setFundingAgencyEndPointSearchOptions(this.sponsorObject.sponsorTypeCode);
            } else {
                this.sponsorObject.sponsorName = null;
            }
        }
    }

    setFundingAgencyEndPointSearchOptions(sponsorTypeCode) {
        const sponsorName = this.sponsorObject.sponsor ?
            this.sponsorObject.sponsor.sponsorName : null;
        this.sponsorHttpOptions = this._proposalService.setHttpOptions('sponsorName', 'sponsorName', 'fetchSponsorsBySponsorType',
            sponsorName, { 'sponsorTypeCode': sponsorTypeCode });
    }

    validateEndDate() {
        this.fundingMap.delete('endDate');
        if (this.sponsorObject.startDate && this.sponsorObject.endDate) {
            if (compareDates(this.sponsorObject.startDate, this.sponsorObject.endDate) === 1) {
                this.fundingMap.set('endDate', 'Please select an end date after start date');
            }
        }
    }

    /**
     * while selecting 'select' option from drop down, the value of this.sponsorObject.currency is 'null',
     * this.sponsorObject.currency is set to null
     */
    setCurrencyCode() {
        this.sponsorObject.currency = this.sponsorObject.currency && this.sponsorObject.currency !== 'null' ?
            this.sponsorObject.currency : null;
        this.sponsorObject.currencyCode = this.sponsorObject.currency ? this.sponsorObject.currency.currencyCode : null;
    }

    prepareRequest() {
        this.sponsorObject.startDate = parseDateWithoutTimestamp(this.sponsorObject.startDate);
        this.sponsorObject.endDate = parseDateWithoutTimestamp(this.sponsorObject.endDate);
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

    sponsorSelect(event) {
        if (!event) {
            this.clearFundingSource();
        } else {
            if (!this.sponsorObject.sponsorTypeCode) {
                this.sponsorObject.sponsorTypeCode = event.sponsorTypeCode;
            }
            this.sponsorObject.sponsorCode = event.sponsorCode;
        }
    }

    clearFundingSource() {
        this.sponsorObject.sponsor = null;
        this.sponsorObject.sponsorCode = null;
        this.clearSponsorSearchField = new String('true');
    }

    clearFundingType() {
        this.sponsorObject.sponsorType = null;
        this.sponsorObject.sponsorTypeCode = null;
    }

    checkMandatoryFieldsFilled() {
        this.fundingMap.clear();
        if (!this.sponsorObject.linkedModuleCode || this.sponsorObject.linkedModuleCode === 'null') {
            this.fundingMap.set('external-type', '* Please select an external type');
        }
        this.limitKeypress(this.sponsorObject.percentageOfEffort);
        this.validateEndDate();
        this.amountValidation();
    }

    clearDeclarationDetails() {
        this.sponsorObject = {};
        this.clearSponsorSearchField = new String('true');
        this.sponsorObject.currency = null;
        this.sponsorHttpOptions.defaultValue = '';
        this.fundingMap.clear();
        $('#addExternalProjectsModal').modal('hide');
    }

    amountValidation() {
        this.fundingMap.delete('amount');
        const pattern = /^(?:[0-9][0-9]{0,9}(?:\.\d{0,2})?|9999999999|9999999999.00|9999999999.99)$/;
        if (this.sponsorObject.amount && !pattern.test(this.sponsorObject.amount)) {
            this.fundingMap.set('amount', 'Enter a valid amount as 10 digits up to 2 decimal places.');
        }
    }

    addExternalDetails() {
        this.checkMandatoryFieldsFilled();
        if (this.fundingMap.size < 1) {
            this.prepareRequest();
            this.$subscriptions.push(this._cpService.addExternalFundingSupport(this.sponsorObject)
                .subscribe((data: any) => {
                    const externalObject: any = {};
                    externalObject.type = this.sponsorObject.cpReportProjectDetailId ? 'U' : 'I';
                    externalObject.result = data;
                    this.externalResponse.emit(externalObject);
                },
                    err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 
                            (!this.sponsorObject.cpReportProjectDetailId ? 'Adding' : 'Updating') + 'External Funding Support failed. Please try again.');
                    },
                    () => {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'External Funding Support ' +
                            (!this.sponsorObject.cpReportProjectDetailId ? 'added' : 'updated') + ' successfully.');
                        this.clearDeclarationDetails();
                    }));
        }
    }
}
