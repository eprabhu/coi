import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { ExternalReviewerRight, } from '../../reviewer-maintenance.interface';
import { ExtReviewerMaintenanceService } from '../../external-reviewer-maintenance-service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonService } from '../../../../common/services/common.service';

@Component({
    selector: 'app-user-access',
    templateUrl: './user-access.component.html',
    styleUrls: ['./user-access.component.css']
})
export class UserAccessComponent implements OnInit, OnDestroy {
    lookUpData: any;
    $subscriptions: Subscription[] = [];
    externalReviewerRight: ExternalReviewerRight = new ExternalReviewerRight();
    externalReviewerDetails: any = {};
    isSaving = false;


    constructor(public _extReviewerMaintenanceService: ExtReviewerMaintenanceService,
        private _commonService: CommonService) { }

    ngOnInit() {
        this.setInitialValues();
        this.getExternalReviewerData();
    }
    setInitialValues() {
        this.lookUpData = this._extReviewerMaintenanceService.lookUpData;
    }

    getExternalReviewerData(): void {
        this.$subscriptions.push(this._extReviewerMaintenanceService.$externalReviewerDetails.subscribe((data: any) => {
            if (data.extReviewer) {
                this.externalReviewerDetails = JSON.parse(JSON.stringify(data));
                if (this.externalReviewerDetails.externalReviewerRight) {
                    this.externalReviewerRight = this.externalReviewerDetails.externalReviewerRight;
                }
            }
        }));
    }

    setRights() {
        this.externalReviewerRight.reviewerRights = this.lookUpData.reviewerRights.find(right =>
            right.reviewerRightId === this.externalReviewerRight.reviewerRightId);
        this._extReviewerMaintenanceService.isDataChange = true;
    }

    setRequestObject() {
        this.externalReviewerRight.externalReviewerId = this.externalReviewerDetails.extReviewerId;
        const REQUESTREPORTDATA: any = {};
        REQUESTREPORTDATA.externalReviewerRight = this.externalReviewerRight;
        return REQUESTREPORTDATA;
    }

    saveResponseData(data) {
        this.externalReviewerDetails.externalReviewerRight = data.externalReviewerRight;
        this._extReviewerMaintenanceService.setExternalReviewerDetails(this.externalReviewerDetails);
        this._extReviewerMaintenanceService.isDataChange = false;
    }

    saveReviewerRights() {
        if (!this.isSaving && this._extReviewerMaintenanceService.isDataChange) {
            this.isSaving = true;
            const REQUESTREPORTDATA = this.setRequestObject();
            this.$subscriptions.push(this._extReviewerMaintenanceService.saveOrUpdateuserAccess(REQUESTREPORTDATA).subscribe(
                (data: any) => {
                    if (data.externalReviewerRight.reviewerRightId) {
                        this.saveResponseData(data);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
                        this.isSaving = false;
                    }
                },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'User access details updation failed. Please try again.');
                    this.isSaving = false;
                }
            ));
        }

    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
