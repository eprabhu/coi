import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CommonService } from '../../common/services/common.service';
import { ClaimSummaryService } from './claim-summary.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonDataService } from '../services/common-data.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';

declare var $: any;

@Component({
    selector: 'app-claim-summary',
    templateUrl: './claim-summary.component.html',
    styleUrls: ['./claim-summary.component.css']
})
export class ClaimSummaryComponent implements OnInit, OnDestroy {
    result = {awardAttachmentTypes: []};
    uploadedFile: any = [];
    description: any = null;
    isUploadShown = false;
    isAdvancedTab = false;
    isTemplateUploadable = false;
    forecastAttachment: any = {};
    isEditMode = true;
    updateUser = this._commonService.getCurrentUserDetail('userName');
    $subscriptions: Subscription[] = [];
    isSaving = false;

    constructor(private _route: ActivatedRoute,
                public _commonService: CommonService,
                public _commonData: CommonDataService,
                private _claimSummaryService: ClaimSummaryService,
                private _router: Router) {
        this.trackCurrentUrlChange();
    }

    ngOnInit() {
        this.$subscriptions.push(this._commonData.$claimData.subscribe((data: any) => {
            if (data && data.claim) {
                this.setUploadRights(data.availableRights);
                this.checkEditMode(data.claim.claimStatus.claimStatusCode);
            }
        }));
        this.getForecastAttachment();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    setUploadRights(availableRights: any[]) {
        this.isTemplateUploadable = availableRights.includes('UPLOAD_CLAIM_FORECAST_REPORT');
    }

    checkEditMode(claimStatusCode: string) {
        this.isEditMode = ['1', '2', '7'].includes(claimStatusCode) && this._commonData.isClaimModifiable();
        this.recheckShowAdvanceTabButtons();
    }

    recheckShowAdvanceTabButtons() {
        this.isAdvancedTab = this._router.url.includes('advance');
        this.isUploadShown = this.isAdvancedTab && this.isEditMode && this.isTemplateUploadable;
    }

    /**
     * to identify route change / tab switch between summary and advance.
     */
    trackCurrentUrlChange() {
        this.$subscriptions.push(
            this._router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.recheckShowAdvanceTabButtons();
                }
            })
        );
    }

    clearAttachmentDetails() {
        this.uploadedFile = [];
        $('#claim-excel-modal').modal('hide');
    }

    fileDrop(files) {
        if (files && files.length > 0) {
            this.updateAddAttachmentDetails(files);
        }
    }

    /**updateAddAttachmentDetails - clears attachment details for Adding attachments
     */
    updateAddAttachmentDetails(files) {
        this.uploadedFile[0] = files[0];
    }

    deleteFromUploadedFileList(index) {
        this.uploadedFile.splice(index, 1);
    }

    addAttachment() {
        if (this.uploadedFile.length > 0) {
            this.$subscriptions.push(
                this._claimSummaryService.saveOrUpdateClaimAttachment(this.prepareAttachmentRequestObject(), this.uploadedFile)
                    .subscribe((res: any) => {
                            if (res) {
                                this._commonData.$claimAdvanceData.next(res);
                                this._claimSummaryService.setForecastAttachment(res.claimAttachment);
                                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment added successfully');
                            }
                        }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to add attachment! Please try again.')
                    ));
        }
    }

    /**
     * 'R' / Replace if forecast attachment present
     * 'I' / Insert if forecast attachment not present
     * Type code always 1 since we only upload budget template / forecast report from this section.
     */
    prepareAttachmentRequestObject() {
        return {
            claimAttachments: [{
                typeCode: 1,
                description: this.description,
                documentId: this.forecastAttachment.documentId || null,
                fileDataId: this.forecastAttachment.fileDataId || null,
                claimAttachmentId: this.forecastAttachment.claimAttachmentId || null,
                versionNumber: this.forecastAttachment.versionNumber || null,
                fileName: this.uploadedFile[0].name,
                mimeType: this.uploadedFile[0].type || null,
                claimId: this._route.snapshot.queryParams['claimId'],
                updateUser: this.updateUser
            }],
            acType: this.forecastAttachment.claimAttachmentId ? 'R' : 'I',
            updateUser: this.updateUser
        };
    }

    /**
     * Functionality to check if forecast report already present, data is stored in service by advanced module.
     * typeCode == 1 => means budget template type aka forecast template. only 1 budget template is allowed in a claim.
     * in case attachment (budget template) present , on next file upload it would REPLACE else it should only ADD the attachment.
     */
    getForecastAttachment() {
        this.$subscriptions.push(
            this._claimSummaryService.$forecastAttachment.subscribe((attachment: any) => {
                if (attachment && attachment.typeCode === '1') {
                    this.forecastAttachment = attachment;
                }
            })
        );
    }

    downloadClaimForcastTemplate() {
       if (!this.isSaving) {
        this.isSaving = true;
        this.$subscriptions.push(this._claimSummaryService.downloadClaimForcastTemplate().subscribe(
            data => {
                fileDownloader(data, 'Claim Forecast Template', 'xlsx');
                this.isSaving = false;
            },
            err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading attachment failed. Please try again.');
                this.isSaving = false;
            }
        ));
       }
    }
}
