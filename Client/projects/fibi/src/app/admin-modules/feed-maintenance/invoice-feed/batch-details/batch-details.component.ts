import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { fileDownloader, openInNewTab, pageScroll, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { BatchDetails, InvoiceAdvanceSearch, InvoiceFeedDetails } from '../invoice-feed';
import { InvoiceFeedService } from '../invoice-feed.service';
declare var $: any;

@Component({
    selector: 'app-batch-details',
    templateUrl: './batch-details.component.html',
    styleUrls: ['./batch-details.component.css']
})
export class BatchDetailsComponent implements OnInit, OnDestroy {

    batchDetailsSearchParam: InvoiceAdvanceSearch = new BatchDetails();
    batchDetails: InvoiceFeedDetails;
    isCommented;
    $subscriptions: Subscription[] = [];
    setFocusToElement = setFocusToElement;
    startDateSearch: any;
    endDateSearch: any;
    searchFeedStatus: any = 'E';
    isFeedExpand = [];
    isViewMore = [];
    checkAll = false;
    isChecked = {};
    selectedFeeds = [];
    selectedAction = null;
    actionComment = null;
    pageScroll = pageScroll;
    selectableFeeds: any;
    selectedBatchId = null;
    invoiceDetails: any = {};
    selectedInvoice = null;
    claimInvoiceFeedDto: any;
    invoiceValidationList: any = [];
    sapResponses: any = [];
    isReInterface = false;
    isMaintainInvoiceFeed = false;
    isDesc = false;
    isSaving = false;

    constructor(private _invoiceFeedService: InvoiceFeedService, public _commonService: CommonService,
        private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.batchDetailsSearchParam.batchId = this.route.snapshot.queryParams['batchId'] || null;
        this.getBatchDetails();
        this.sapProcessingTrigger();
        this.getPermission();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    async getPermission() {
        this.isMaintainInvoiceFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_FEED');
    }

    private sapProcessingTrigger() {
        this.$subscriptions.push(this._invoiceFeedService.$invoiceFileProcess.subscribe((data: any) => {
            if (data) {
                this.getBatchDetails();
            }
        }));
    }

    public getBatchDetails(): void {
        this.batchDetailsSearchParam.property4 = [this.searchFeedStatus];
        this.batchDetailsSearchParam.property10 = this.startDateSearch ? parseDateWithoutTimestamp(this.startDateSearch) : null;
        this.batchDetailsSearchParam.property11 = this.endDateSearch ? parseDateWithoutTimestamp(this.endDateSearch) : null;
        this.$subscriptions.push(this._invoiceFeedService.getInvoiceClaimFeedDashboard(this.batchDetailsSearchParam)
            .subscribe((res: InvoiceFeedDetails) => {
                if (res) {
                    this.batchDetails = res;
                    this.checkForReInterfacePermission(this.batchDetails);
                    this._invoiceFeedService.invoiceFileProcessInfoText(this.batchDetails.sapFeedUserActions);
                }
            })
        );
    }

    public resetAllProperties(): void {
        this.isFeedExpand = [];
        this.isViewMore = [];
        this.checkAll = false;
        this.isChecked = {};
        this.selectedFeeds = [];
        this.selectedAction = null;
        this.actionComment = null;
    }

    public resetAndSearch(): void {
        this.searchFeedStatus = 'E';
        this.startDateSearch = null;
        this.endDateSearch = null;
        this.batchDetailsSearchParam = new BatchDetails();
        this.getBatchDetails();
    }

    /**
     * @param userActionCode
     * Set the object for user action based on user action code. 1 - Status Updated, 2 - Notified PI, 3 - Re-Interface, 4 - ReTrigger, 9 - Download
     */
    public setAction(userActionCode) {
        this.selectedAction = this.batchDetails.sapFeedUserActions && this.batchDetails.sapFeedUserActions.length ?
            this.batchDetails.sapFeedUserActions.find(action => action.userActionCode === userActionCode) : null;
        this.actionComment = this.selectedAction ? this.selectedAction.comment : null;
    }

    public actionsOnPageChange(event) {
        this.batchDetailsSearchParam.currentPage = event;
        this.getBatchDetails();
        pageScroll('pageScrollToTop');
    }


    public checkOrUncheckBatches() {
        this.checkAll ? this.checkAllBatches() : this.unCheckAllBatches();
    }

    private checkAllBatches() {
        this.selectedFeeds = [];
        this.batchDetails.claimInvoiceFeedDtoList.forEach(element => {
            if (element.feedStatus === 'E') {
                this.isChecked[element.feedId] = true;
                this.selectedFeeds.push(element);
            }
        });
    }

    private unCheckAllBatches() {
        this.batchDetails.claimInvoiceFeedDtoList.forEach(element => {
            this.isChecked[element.feedId] = false;
        });
        this.selectedFeeds = [];
    }

    /**
    * @param feed
    * This function is triggered if a user check/uncheck a feed from list
    * and calls appropriate function to add/remove that feed in temporary list accordingly.
    */
    public toggleFromList(feed) {
        this.isChecked[feed.feedId] ? this.addToFeeds(feed) : this.removeFromFeeds(feed);
    }

    public addToFeeds(feed) {
        this.selectedFeeds.push(feed);
        this.checkAll = this.selectedFeeds.length === this.selectableFeeds ? true : false;
    }

    private removeFromFeeds(feed) {
        const removeFeedIndex = this.selectedFeeds.findIndex(element => element.feedId === feed.feedId);
        this.selectedFeeds.splice(removeFeedIndex, 1);
        this.checkAll = false;
    }

    /**
    * This function is used to divert to appropriate functions that process the action based on the action
    * that user takes once confirmed from modal. 1 - Status Updated, 2 - Notified PI, 3 - Re-Interface, 4 - ReTrigger, 9 - Download
    */
    public proceedAction() {
        if (this.selectedAction.userActionCode === '4' || this.selectedAction.userActionCode === '9' || this.checkIfCommented()) {
            switch (this.selectedAction.userActionCode) {
                case '11': this.invoiceRevision();
                    break;
                case '3': this.reInterface();
                    break;
            }
        }
    }

    /**
   * Function to validate if comment given by user for action Update Status, Notify PI and Re-Interface.
   * Comment is mandatory for these actions.
   */
    public checkIfCommented() {
        this.isCommented = this.actionComment ? true : false;
        return this.isCommented;
    }
    /**
     * This function is used to notify the PI based on list of error feeds that the user selected as Mail.
     */
    private invoiceRevision() {
        $('#modal-invoice-basic-details').modal('hide');
        if (!this.isSaving) {
        this.isSaving = true;
        this.$subscriptions.push(
            this._invoiceFeedService.invoiceRevision(
                {...{
                    'sapFeedUserAction': this.selectedAction,
                    'userComment': this.actionComment,
                    'claimInvoiceFeedDtoList': this.selectedFeeds
                }, ...this.batchDetailsSearchParam }).subscribe((data: InvoiceFeedDetails) => {
                if (data && data.message == "SUCCESS") {
                    this.batchDetails = data;
                    this.isSaving = false;
                    this.checkForReInterfacePermission(this.batchDetails);
                    this.resetAllProperties();
                    this.triggerFailedCasePopUp(data);
                    if (!data.claimNumbers.length) {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully Notified.');
                    }
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Invoice Revision failed. Please click Invoice Revision again.');
                    this.isSaving = false;
                }
            }, err => { 
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Invoice Revision failed. Please click Invoice Revision again.');
                this.isSaving = false;
             }
            ));
        }
    }

    /**
     * This function will sent list of given error feeds to create a copy of it that will be sent to SAP again.
     */
    private reInterface() {
        $('#modal-invoice-basic-details').modal('hide');
        if (!this.isSaving) {
        this.isSaving = true;
        this.$subscriptions.push(
            this._invoiceFeedService.reInterfaceClaimSapFeed({
                ...{
                    'sapFeedUserAction': this.selectedAction,
                    'userComment': this.actionComment,
                    'claimInvoiceFeedDtoList': this.selectedFeeds
                }, ...this.batchDetailsSearchParam
            }).subscribe((data: InvoiceFeedDetails) => {
                if (data && data.message === "SUCCESS") {
                    this.batchDetails = data;
                    this.isSaving = false;
                    this.checkForReInterfacePermission(this.batchDetails);
                    this.resetAllProperties();
                    this.triggerFailedCasePopUp(data);
                    if (this.selectedFeeds.length !== data.claimNumbers.length) {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully Re-Interfaced.');
                    }
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error for Re-Interfacing. Please try again.');
                    this.isSaving = false;
                }
            }, err => { 
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error for Re-Interfacing. Please try again.');
                this.isSaving = false;
             }
            ));
        }
    }

    private triggerFailedCasePopUp(data) {
        if (data.claimNumbers && data.claimNumbers.length) {
            $('#failedClaimsModal').modal('show');
        }
    }

    /**
    * Function for calling API to get invoice details belongs to particular feed data when the ser expands the feed to view invoice messages.
    * This will not call API if the data already loaded.
    */

    public expandInvoice(invoiceId, batchId, index) {
        this.isFeedExpand[index] = !this.isFeedExpand[index];
        if (this.isFeedExpand[index]) {
            this.getInvoiceDetails(invoiceId, batchId, index);
        }
    }

    getInvoiceDetails(invoiceId, batchId, index, selectAction = false): any {
        return new Promise((resolve, reject) => {
            this.$subscriptions.push(
                this._invoiceFeedService.getInvoiceDetails(invoiceId, batchId).subscribe((data: any) => {
                    this.invoiceDetails[index] = data.claimInvoiceLog;
                    this.sapResponses = data.sapClaimFeedResponseMessage;
                    this.selectedInvoice = selectAction ? this.invoiceDetails[index] : null;
                    resolve(true);
                }));
        });   
    }

    public async setInvoiceDetails(invoice, index, isInvoiceView = false) {
        this.selectedInvoice = null;
        this.actionComment = null;
        this.isCommented = true;
        this.setAction('1');
        this.claimInvoiceFeedDto = invoice;
        this.invoiceValidationList = [];
        await this.getInvoiceDetails(invoice.invoiceId, invoice.batchId, index, true);
        isInvoiceView ? $('#invoice-view').modal('show') : $('#invoice-update').modal('show');
    }

    updateFeedStatus() {
        if (this.invoiceValidation() && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._invoiceFeedService.updateClaimInvoiceFeedStatus(this.setInvoiceStatusUpdateObject())
                    .subscribe((data: InvoiceFeedDetails) => {
                        if (data && data.message == "SUCCESS") {
                            this.batchDetails = data;
                            this.isSaving = false;
                            this.checkForReInterfacePermission(this.batchDetails);
                            this.resetAllProperties();
                            this.triggerFailedCasePopUp(data);
                            if (!data.claimNumbers.length) {
                                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully updated Feed Status.');
                                this.getBatchDetails();
                            }
                            $('#invoice-update').modal('hide');
                        } else {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error for updating Feed Status. Please try again.');
                            $('#invoice-update').modal('hide');
                            this.isSaving = false;
                        }
                    }, err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error for updating Feed Status. Please try again.');
                        $('#invoice-update').modal('hide');
                        this.isSaving = false;
                    }));
        }
    }

    invoiceValidation() {
        this.invoiceValidationList = [];
        this.selectedInvoice.forEach((invoice, index) => {
            this.invoiceValidationList[index] = {};
            if(invoice.status === 'E') {
                if (!invoice.outputDocumentNumber) {
                    this.invoiceValidationList[index].outputDocumentNumber = 'Please enter a Doc No. From SAP.';
                }
                if (!invoice.fiscalYear) {
                    this.invoiceValidationList[index].fiscalYear = 'Please enter a Fiscal Year';
                } else if (invoice.fiscalYear.toString().length > 4) {
                    this.invoiceValidationList[index].fiscalYear = 'Please enter a valid Fiscal Year(YYYY)';
                }
            }
        });
        return this.invoiceValidationList.every(item => this.checkObjectHasValues(item));
    }

    checkObjectHasValues(item) {
        return Object.values(item).filter(Boolean).length === 0 ? true : false;
    }

    setInvoiceStatusUpdateObject() {
        return {
            ...{
                'sapFeedUserAction': this.selectedAction,
                'userComment': this.actionComment,
                'claimInvoiceLogs': this.selectedInvoice,
                'feedId': this.claimInvoiceFeedDto.feedId
            }, ...this.batchDetailsSearchParam
        }
    }
    
    public routeToClaimId(claimId) {
        openInNewTab('claims/invoice/summary?', ['claimId'], [claimId]);
    }

    public getInvoiceIdBasedMessages(claimInvoiceLogId: number): any {
        const filteredInvoiceMessages = this.sapResponses.filter(response => response.claimInvoiceLogId === claimInvoiceLogId);
        return filteredInvoiceMessages;
    }

    private checkForReInterfacePermission(feedList) {
        this.isReInterface = Boolean(feedList.claimInvoiceFeedDtoList.find((e: any )=> e.feedStatusCode === 'E' && !e.userAction));
    }

    public sortResult(sortFieldBy) {
        this.isDesc = this.batchDetailsSearchParam.sortBy === sortFieldBy ? !this.isDesc : true;
        this.batchDetailsSearchParam.reverse = this.isDesc === false ? ' DESC ' : ' ASC ';
        this.batchDetailsSearchParam.sortBy = sortFieldBy;
        this.getBatchDetails();
    }

    exportAsTypeDoc(docType: string) {
        const exportObject: any = {
            ...this.batchDetailsSearchParam,
            documentHeading: 'Batch Details',
            sortBy: this.batchDetailsSearchParam.sortBy,
            sort: this.batchDetailsSearchParam.sort
        };
        this.$subscriptions.push(this._invoiceFeedService.exportInvoiceFeedReport(exportObject).subscribe(
            data => {
                const fileName = exportObject.documentHeading;
                exportObject.exportType = docType === 'excel' ? 'xlsx' : '';
                fileDownloader(data.body, fileName, exportObject.exportType);
            }));
    }

}
