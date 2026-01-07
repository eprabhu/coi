import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {subscriptionHandler} from '../../common/utilities/subscription-handler';
import {CommonDataService} from '../services/common-data.service';
import {convertToValidAmount, deepCloneObject, inputRestrictionForAmountField, setFocusToElement} from '../../common/utilities/custom-utilities';
import {DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../app-constants';
import {
    compareDates,
    compareDatesWithoutTimeZone,
    getDateObjectFromTimeStamp,
    getDuration,
    parseDateWithoutTimestamp
} from '../../common/utilities/date-utilities';
import {CommonService} from '../../common/services/common.service';
import {ClaimOverviewService} from './claim-overview.service';
import {Router} from '@angular/router';
import {ClaimsService} from '../services/claims.service';
import { AutoSaveService } from '../../common/services/auto-save.service';
declare var $: any;


@Component({
    selector: 'app-claim-overview',
    templateUrl: './claim-overview.component.html',
    styleUrls: ['./claim-overview.component.css']
})
export class ClaimOverviewComponent implements OnInit, OnDestroy {

    claimDetails: any = {};
    claimMap: Map<string, string> = new Map();
    isEditMode = false;
    isManualClaim = false;
    claimStartDate: any = null;
    claimEndDate: any = null;
    claimSubmissionDate: any = null;
    dateWarningList: any[] = [];
    lastClaimEndDate: any = null;
    $subscriptions: Subscription[] = [];
    claimData: any = null;
    isClaimDateChanged = false;
    setFocusToElement = setFocusToElement;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    enableClaimStartEndDate: true;

    constructor(public _commonDataService: CommonDataService,
                public commonService: CommonService,
                private _claimOverviewService: ClaimOverviewService,
                private router: Router,
                private _claimsService: ClaimsService,
                private _autoSaveService: AutoSaveService) {
    }

    ngOnInit() {
        this.getClaimDetails();
        this.saveClickListener();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    updateDateObjectFromTimeStamp(): void {
        this.claimStartDate = getDateObjectFromTimeStamp(this.claimDetails.startDate);
        this.claimEndDate = getDateObjectFromTimeStamp(this.claimDetails.endDate);
        this.claimSubmissionDate = getDateObjectFromTimeStamp(this.claimDetails.claimSubmissionDate);
    }

    getClaimDetails() {
        this.$subscriptions.push(this._commonDataService.$claimData.subscribe((data: any) => {
            if (data && data.claim) {
                this.claimDetails = deepCloneObject(data.claim);
                this.claimData = deepCloneObject(data);
                this.lastClaimEndDate = data.lastClaimEndDate;
                this.setClaimType(this.claimDetails.claimNumber);
                this.updateDateObjectFromTimeStamp();
                this.getDuration();
                this.setEditMode(this.claimDetails.claimStatus.claimStatusCode);
                this.enableClaimStartEndDate = data.enableClaimStartEndDate;
            }
        }));
    }

    /**
     * 1 = Pending
     * 2 = Revision Requested
     * 7 = Revision Requested by Funding Agency
     * @param claimStatusCode
     */
    setEditMode(claimStatusCode: string) {
        this.isEditMode = ['1', '2', '7'].includes(claimStatusCode) && this._commonDataService.isClaimModifiable();
    }

    /**
     * claimType 'D' => manual claim. 'S' => system generated claim.
     * @param claimNumber
     */
    setClaimType(claimNumber: string) {
        this.isManualClaim = claimNumber.charAt(0) === 'D';
    }

    claimValidation() {
        this.claimMap.clear();
        if (!this.claimDetails.title) {
            this.claimMap.set('title', 'title');
        }
        if (!this.claimStartDate) {
            this.claimMap.set('startDate', '* Please pick a Start Date.');
        }
        if (!this.claimEndDate) {
            this.claimMap.set('endDate', '* Please pick a End Date.');
        } else {
            this.validateEndDate();
        }
        if (this.isManualClaim) {
            if (!this.claimSubmissionDate) {
                this.claimMap.set('claimSubmissionDate', 'claimSubmissionDate');
            }
            if (!this.claimDetails.totalAmount || this.claimDetails.totalAmount === '0') {
                this.claimMap.set('totalAmount', 'totalAmount');
            }
        }
        this.claimCreateDateValidation();
        return this.claimMap.size > 0 ? false : true;
    }

    validateEndDate(startDate = null, endDate = null) {
        this.claimStartDate = startDate || this.claimStartDate;
        this.claimEndDate = endDate || this.claimEndDate;
        this.claimMap.delete('endDate');
        if (this.claimStartDate && this.claimEndDate) {
            if (compareDates(this.claimStartDate, this.claimEndDate) === 1) {
                this.claimMap.set('endDate', '* Please select an end date after start date');
            }
        }
    }

    claimCreateDateValidation() {
        this.dateWarningList = [];
        this.lastClaimEndDate ? this.validationBasedOnLastClaim() : this.validationBasedOnAwardDate();
        return this.dateWarningList.length > 0 ? false : true;
    }

    validationBasedOnAwardDate() {
        if (this.claimStartDate) {
            if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.claimDetails.award.beginDate),
                this.claimStartDate) === 1) {
                this.dateWarningList.push('* Choose a Start Date on or after the Award Start Date');
            }
        }
        if (this.claimEndDate) {
            if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.claimDetails.award.beginDate),
                this.claimEndDate) === 1) {
                this.dateWarningList.push('* Choose a End Date on or after the Award Start Date');
            }
        }
    }

    validationBasedOnLastClaim() {
        if (this.claimStartDate) {
            if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.lastClaimEndDate),
                this.claimStartDate) === 1) {
                this.dateWarningList.push('* Choose a Start Date on or after the Last Claimed Date');
            }
        }
        if (this.claimEndDate) {
            if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.lastClaimEndDate),
                this.claimEndDate) === 1) {
                this.dateWarningList.push('* Choose a End Date on or after the Last Claimed Date');
            }
        }
    }

    saveClickListener() {
        this.$subscriptions.push(
            this._commonDataService.$saveEndorsement.subscribe((clicked: boolean) => {
                if (clicked && this.router.url.includes('overview')) {
                    this.saveClaimDetails();
                }
            })
        );
    }

    saveClaimDetails() {
        if (this.claimValidation() && this.claimCreateDateValidation()) {
            if (!this.isManualClaim) {
                this.validateDateChange();
            }
            this.$subscriptions.push(this._claimOverviewService.saveOrUpdateClaim(this.generateRequestObject(this.claimDetails))
                .subscribe((res: any) => {
                    if ( this.isClaimDateChanged && !this.isManualClaim) {
                        document.getElementById('triggerDateChangeWarning').click();
                        this.isClaimDateChanged = false;
                    }
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Overview Saved Successfully');
                    this.setUnsavedChanges(false);
                    this.updateClaimData(res);
                }, err => {
                    if (err && err.status === 405) {
                        $('#SubmitClaimModal').modal('hide');
                        $('#invalidActionModal').modal('show');
                    } else {this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save overview! Please try again'); }
                }));
        }
    }

    generateRequestObject({claimStatus, award, ...originalClaimObject}) {
        return {
            claim: {
                ...originalClaimObject,
                startDate: parseDateWithoutTimestamp(this.claimStartDate),
                endDate: parseDateWithoutTimestamp(this.claimEndDate),
                duration: this.claimData.claim.duration,
                claimSubmissionDate: parseDateWithoutTimestamp(this.claimSubmissionDate)
            }
        };
    }

    updateClaimData(res) {
        this.claimData.claim.title = res.claim.title;
        this.claimData.claim.startDate = res.claim.startDate;
        this.claimData.claim.endDate = res.claim.endDate;
        this.claimData.claim.claimSubmissionDate = res.claim.claimSubmissionDate;
        this.claimData.claim.totalAmount = res.claim.totalAmount;
        this.claimData.claim.updateUserName = res.claim.updateUserName;
        this.claimData.claim.updateTimeStamp = res.claim.updateTimeStamp;
        this._commonDataService.setClaimData(deepCloneObject(this.claimData));
    }

    validateDateChange() {
        this.isClaimDateChanged =
            (parseDateWithoutTimestamp(this.claimStartDate) !== parseDateWithoutTimestamp(this.claimDetails.startDate)) ||
            (parseDateWithoutTimestamp(this.claimEndDate) !== parseDateWithoutTimestamp(this.claimDetails.endDate));
    }

    /* comparing claim end and start dates */
    getDuration() {
        if (this.claimStartDate != null && this.claimEndDate != null &&
            (compareDates(this.claimStartDate, this.claimEndDate, 'dateObject', 'dateObject') === -1 ||
                compareDates(this.claimStartDate, this.claimEndDate, 'dateObject', 'dateObject') === 0)) {
            this.differenceBetweenDates(this.claimStartDate, this.claimEndDate);
        }
    }

    /* finds duration between start date and end date */
    differenceBetweenDates(startDate, endDate) {
        const DATEOBJ = getDuration(startDate, endDate);
        this.claimData.claim.duration =
            DATEOBJ.durInYears + ' year(s), ' + DATEOBJ.durInMonths + ' month(s) & ' + DATEOBJ.durInDays + ' day(s)';
        this._claimsService.isDurationChangeTrigger.next(this.claimData.claim.duration);
    }

    amountValidation(fieldValue: number, fieldName: string): void {
        fieldValue = convertToValidAmount(fieldValue);
        this.claimMap.delete(fieldName);
        if (inputRestrictionForAmountField(fieldValue)) {
            this.claimMap.set(fieldName, 'true');
        }
    }

    setUnsavedChanges(flag: boolean) {
        this._commonDataService.isClaimDataChange = flag;
        this._autoSaveService.setUnsavedChanges('General Information', 'general-information', flag, true);
    }

}
