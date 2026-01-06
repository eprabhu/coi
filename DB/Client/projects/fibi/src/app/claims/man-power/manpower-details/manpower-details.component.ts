import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { fadeDown } from '../../../common/utilities/animations';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { setFocusToElement, validatePercentage } from '../../../common/utilities/custom-utilities';
import { ManPowerService } from '../man-power.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { CommonService } from '../../../common/services/common.service';
import {CommonDataService} from '../../services/common-data.service';

@Component({
    selector: 'app-manpower-details',
    templateUrl: './manpower-details.component.html',
    styleUrls: ['./manpower-details.component.css']
})
export class ManpowerDetailsComponent implements OnInit, OnDestroy {
    @Input() claimManpowerObject: any = {};
    isManpowerDetailsOpen: boolean[] = [];
    isRowEditMode: boolean[] = [];
    isEditMode = false;
    currentEditEntry: any = {};
    progressPercentage = new Map();
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscription: Subscription[] = [];
    claimStartDate: any = null;
    claimEndDate: any = null;

    constructor(private _manPowerService: ManPowerService, private _commonService: CommonService, 
        private _commonDataService: CommonDataService) {
    }

    ngOnInit() {
        this.getClaimDetails();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscription);
    }

    getClaimDetails() {
        this.$subscription.push(this._commonDataService.$claimData.subscribe((data: any) => {
            if (data && data.claim) {
                this.setEditMode(data.claim.claimStatus.claimStatusCode);
                this.claimStartDate = data.claim.startDate;
                this.claimEndDate = data.claim.endDate;
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

    editManPowerDetails(index: number, manpower: any) {
        const tempIndexValue = this.isRowEditMode[index];
        this.isRowEditMode = [];
        this.isRowEditMode[index] = !tempIndexValue;
        this.progressPercentage.clear();
        if (!this.isManpowerDetailsOpen[index]) {
            this.isManpowerDetailsOpen = [];
            this.isManpowerDetailsOpen[index] = true;
        }
        this.populateCurrentEdit(manpower);
    }

    populateCurrentEdit(claimManpower) {
        this.currentEditEntry = {...claimManpower};
        this.currentEditEntry.dateOfApproval = parseDateWithoutTimestamp(this.currentEditEntry.dateOfApproval);
        this.currentEditEntry.percntgeTimeSpentOnProg = typeof(this.currentEditEntry.percntgeTimeSpentOnProg) === 'number' ?
            this.currentEditEntry.percntgeTimeSpentOnProg : null;
    }

    cancelEdit(index) {
        this.isRowEditMode[index] = !this.isRowEditMode[index];
        this.progressPercentage.clear();
    }

    toggleManualDetails(index, manpower) {
        const tempIndexValue = this.isManpowerDetailsOpen[index];
        this.isManpowerDetailsOpen = [];
        this.isManpowerDetailsOpen[index] = !tempIndexValue;
        this.populateCurrentEdit(manpower);
    }

    saveManpowerDetails(manpower: any, index: number) {
        this.limitKeypress(this.currentEditEntry.percntgeTimeSpentOnProg, 'percentage', this.progressPercentage);
       if (this.progressPercentage.size === 0) {
           this.$subscription.push(
               this._manPowerService.saveOrUpdateClaimManpower(this.createRequestObject()).subscribe((res: any) => {
                   if (res && res.claimManpower) {
                       manpower = res.claimManpower;
                       this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Manpower Saved Successfully');
                       this.populateCurrentEdit(manpower);
                       this.cancelEdit(index);
                   }
               }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save manpower! Please try again'))
           );
       }
    }

    createRequestObject() {
        this.currentEditEntry.claimId = this.claimManpowerObject.claimId;
        this.currentEditEntry.claimNumber = this.claimManpowerObject.claimNumber;
        this.currentEditEntry.dateOfApproval = parseDateWithoutTimestamp(this.currentEditEntry.dateOfApproval);
        return { claimManpower: this.currentEditEntry };
    }

    /**limitKeypress - limit the input field b/w 0 and 100 with 2 decimal points
     * @param {} value
     */
    limitKeypress(value, key, list) {
        list.delete(key);
        if (validatePercentage(value)) {
            list.set(key, validatePercentage(value));
        }
    }
}
