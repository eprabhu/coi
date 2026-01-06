import { Component, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { BudgetDataService } from '../../services/budget-data.service';
import { CommonService } from '../../../common/services/common.service';
import { BudgetService } from '../budget.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { getDateObjectFromTimeStamp } from '../../../common/utilities/date-utilities';
import { ProposalService } from '../../services/proposal.service';
import {
    checkDatesAreNotEqual, checkIfDatesOverlapped, checkPeriodDatesOutside,
    setProposalDateChange, toggleErrorToast
} from '../budget-validations';
import { NavigationService } from '../../../common/services/navigation.service';
import { WebSocketService } from '../../../common/services/web-socket.service';

@Component({
    selector: 'app-budget-versions-list',
    templateUrl: './budget-versions-list.component.html',
    styleUrls: ['./budget-versions-list.component.css']
})
export class BudgetVersionsListComponent implements OnDestroy, OnChanges {

    @Input() proposalStatusCode: number;
    @Input() dataVisibilityObj: any = {};
    $subscriptions: Subscription[] = [];
    budgetData: any = {};
    isCreateApprovedBudget = false;
    isCreateBudgetVersion = false;
    isBudgetVersionWdgtOpen = false;
    isCopyDeleteAllowed = false;
    tempVersion: any = {};
    budgetHeaderDetails = [];
    isShowPeriodsChangeModal = false;
    selectedBudget: any;

    constructor(public _budgetDataService: BudgetDataService, public _commonService: CommonService,
        private _budgetService: BudgetService, private _proposalService: ProposalService, private _navigateService: NavigationService,
        private _websocket: WebSocketService) { }

    ngOnChanges() {
        this.subscribeBudgetData();
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? Object.assign({}, data) : {};
            this.setUpdatedHeaderDetails();
            if (this.budgetData.budgetHeaderDetails) {
                this.budgetHeaderDetails = JSON.parse(JSON.stringify(this.budgetData.budgetHeaderDetails));
                this.convertDatesInVersionList();
                this.setApprovedBudgetFlag();
                this.setCreateBudgetVersionFlag();
                this.setCopyDeleteFlag();
            }
        }));
    }

    setUpdatedHeaderDetails() {
        // tslint:disable-next-line: triple-equals
        const budgetHeader = this.budgetData.budgetHeaderDetails.find(ele => ele.budgetId == this.budgetData.budgetHeader.budgetId);
        budgetHeader.startDate = this.budgetData.budgetHeader.startDate;
        budgetHeader.endDate = this.budgetData.budgetHeader.endDate;
        budgetHeader.costSharingAmount = this.budgetData.budgetHeader.costSharingAmount;
        budgetHeader.totalCost = this.budgetData.budgetHeader.totalCost;
        budgetHeader.totalDirectCost = this.budgetData.budgetHeader.totalDirectCost;
        budgetHeader.totalFundRequested = this.budgetData.budgetHeader.totalFundRequested;
        budgetHeader.totalInKind = this.budgetData.budgetHeader.totalInKind;
        budgetHeader.totalIndirectCost = this.budgetData.budgetHeader.totalIndirectCost;
        budgetHeader.totalModifiedDirectCost = this.budgetData.budgetHeader.totalModifiedDirectCost;
        budgetHeader.totalOfTotalCost = this.budgetData.budgetHeader.totalOfTotalCost;
        budgetHeader.underrecoveryAmount = this.budgetData.budgetHeader.underrecoveryAmount;
        budgetHeader.versionNumber = this.budgetData.budgetHeader.versionNumber;
    }

    setBudgetHeaderDetails(budgetId) {
        // tslint:disable-next-line: triple-equals
        const budgetHeader = this.budgetData.budgetHeaderDetails.find(ele => ele.budgetId == budgetId);
        budgetHeader.startDate = this._proposalService.proposalStartDate;
        budgetHeader.endDate = this._proposalService.proposalEndDate;
    }


    /* Proposal Status Code: 11-Awarded, 12-Withdrawn, 29-unsuccessful, 30-Not Submitted, 35-Inactive,
    1-In Progress, 9-Revision Requested, 20,24 - Pending Revision By PIs */
    setApprovedBudgetFlag() {
        const APPROVEDBUDGET = this.budgetData.budgetHeaderDetails.find(detail => detail.isApprovedBudget === true);
        this.isCreateApprovedBudget =
            this.dataVisibilityObj.mode === 'view' &&
            this._budgetDataService.departmentLevelRightsForProposal.isDefineApprovedBudget &&
            !APPROVEDBUDGET && !([11, 12, 29, 30, 35, 1, 9, 20, 24].includes(this.proposalStatusCode));
        if (this.isCreateApprovedBudget) {
            this.isCreateApprovedBudget = this._websocket.isLockAvailable('Proposal' + '#' + this.budgetData.proposalId);
        }
    }

    /* Proposal Status Code: 1-In Progress,  9-Revision Requested, 22-ORT Director Review Completed, 20,24 - Pending Revision By PIs
     * 'this.proposalStatusCode !== 2' is added to hide create budget version button in admincheckinprogress status.
    */
    setCreateBudgetVersionFlag() {
        this.isCreateBudgetVersion = (!this._budgetDataService.isBudgetViewMode && this.proposalStatusCode !== 2) ||
            (this._budgetDataService.departmentLevelRightsForProposal.isMaintainProposalBudget &&
                this.dataVisibilityObj.mode === 'view' && [1, 9, 20, 22, 24, 12].includes(this.proposalStatusCode));
        if (this.isCreateBudgetVersion) {
            this.isCreateBudgetVersion = this._websocket.isLockAvailable('Proposal' + '#' + this.budgetData.proposalId);
        }
    }

    /* Proposal Status Code: 1-In Progress,  9-Revision Requested, 22-ORT Director Review Completed, 20,24 - Pending Revision By PIs */
    setCopyDeleteFlag() {
        this.isCopyDeleteAllowed = this._budgetDataService.departmentLevelRightsForProposal.isMaintainProposalBudget &&
            this.dataVisibilityObj.mode === 'view' && [1, 9, 20, 22, 24, 12].includes(this.proposalStatusCode);
        if (this.isCopyDeleteAllowed) {
            this.isCopyDeleteAllowed = this._websocket.isLockAvailable('Proposal' + '#' + this.budgetData.proposalId);
        }
    }

    copyBudgetVersion() {
        this.$subscriptions.push(this._budgetService.copyBudgetVersion({
            'budgetId': this.tempVersion.budgetId,
            'proposalId': this.budgetData.proposalId,
            'userName': this._commonService.getCurrentUserDetail('userName'),
            'userFullName': this._commonService.getCurrentUserDetail('fullName'),
            'activityTypeCode': this._budgetDataService.activityTypeCode
        }).subscribe((data: any) => {
            this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
            this.setBudgetData(data);
            if (this.budgetData.isPeriodTotalEnabled &&
                this._proposalService.proposalSectionConfig['308'].isActive) {
                toggleErrorToast(this.budgetData, this._proposalService);
            }
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Version copied successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Copying Budget Version failed. Please try again.');
        }));
    }

    deleteBudgetVersion() {
        this.$subscriptions.push(this._budgetService.deleteBudgetVersion({
            'budgetId': this.tempVersion.budgetId,
            'proposalId': this.budgetData.proposalId
        }).subscribe((data: any) => {
            this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
            this.setBudgetData(data);
            if (this.budgetData.isPeriodTotalEnabled &&
                this._proposalService.proposalSectionConfig['308'].isActive) {
                toggleErrorToast(this.budgetData, this._proposalService);
            }
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Selected Budget Version deleted successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Budget Version failed. Please try again.');
        }));
    }

    loadBudgetByBudgetId(budget) {
        this.tempVersion = budget;
        this._proposalService.$isShowDateWarning.next(false);
        this.$subscriptions.push(this._budgetService.loadBudgetByBudgetId({ 'budgetId': budget.budgetId })
            .subscribe((data: any) => {
                this.budgetData.isSysGeneratedCostElementEnabled = data.isSysGeneratedCostElementEnabled;
                this.budgetData.isAutoCalculateEnabled = data.isAutoCalculateEnabled;
                this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
                this.setBudgetData(data);
                if (this.budgetData.isPeriodTotalEnabled && this._proposalService.proposalSectionConfig['308'].isActive &&
                    this.dataVisibilityObj.isBudgetHeaderFound &&
                    (!this.budgetData.budgetHeader.isApprovedBudget && !this._budgetDataService.isBudgetViewMode)) {
                    this.checkIfDateChanged();
                }
            }));
    }

    setBudgetData(data) {
        this.budgetData.budgetHeader = data.budgetHeader;
        this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
        this._budgetDataService.setProposalBudgetData(this.budgetData);
    }

    checkIfDateChanged(): void {
        const PERIODS_ARRAY = this.budgetData && this.budgetData.budgetHeader ? this.budgetData.budgetHeader.budgetPeriods : [];
        if (checkPeriodDatesOutside(PERIODS_ARRAY, this._proposalService.proposalStartDate, this._proposalService.proposalEndDate)) {
            this.openModal(PERIODS_ARRAY);
        } else if (checkIfDatesOverlapped(this.budgetData)) {
            this.showErrorToast();
        } else {
            this.isShowPeriodsChangeModal = false;
            this._proposalService.$isPeriodOverlapped.next(false);
        }
    }

    openModal(PERIODS_ARRAY) {
        // tslint:disable-next-line: triple-equals
        this.selectedBudget = this.budgetData.budgetHeaderDetails.find(ele => ele.budgetId == this.budgetData.budgetHeader.budgetId);
        if (checkDatesAreNotEqual(this._proposalService, this.selectedBudget.startDate, this.selectedBudget.endDate)) {
            const DATE_OBJECT: any = {
                'proposalStartDate': this._proposalService.proposalStartDate,
                'proposalEndDate': this._proposalService.proposalEndDate,
                'budgetStartDate': PERIODS_ARRAY ? PERIODS_ARRAY[0].startDate : null,
                'budgetEndDate': PERIODS_ARRAY ? PERIODS_ARRAY[PERIODS_ARRAY.length - 1].endDate : null
            };
            this.isShowPeriodsChangeModal = true;
            setProposalDateChange(DATE_OBJECT, this._proposalService);
        } else {
            this.showErrorToast();
        }
    }

    showErrorToast() {
        setTimeout(() => {
            toggleErrorToast(this.budgetData, this._proposalService);
        });
        this._navigateService.navigateToDocumentRoutePath('periodsAndTotal', 'proposal-periods-total', this.budgetData.proposalId);
        this.selectedBudget = null;
    }

    closeModal(event): void {
        if (event) {
            const PERIODS_ARRAY = this.budgetData && this.budgetData.budgetHeader ? this.budgetData.budgetHeader.budgetPeriods : [];
            this.isShowPeriodsChangeModal = false;
            if (event.selectedOption === 'Y' &&
                !checkPeriodDatesOutside(PERIODS_ARRAY, this._proposalService.proposalStartDate, this._proposalService.proposalEndDate) &&
                !checkIfDatesOverlapped(this.budgetData)) {
                this.selectedBudget.startDate = this._proposalService.proposalStartDate;
                this.selectedBudget.endDate = this._proposalService.proposalEndDate;
                this.setBudgetHeaderDetails(this.budgetData.budgetHeader.budgetId);
            } else {
                this.showErrorToast();
            }
        }
        this.selectedBudget = null;
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    convertDatesInVersionList() {
        if (this.budgetHeaderDetails && this.budgetHeaderDetails.length) {
            this.budgetHeaderDetails.map(version => {
                version.startDate = getDateObjectFromTimeStamp(version.startDate);
                version.endDate = getDateObjectFromTimeStamp(version.endDate);
            });
        }
    }

}
