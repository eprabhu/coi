import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { SharedModule } from '../../../shared/shared.module';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ReviewerDashboardService } from '../../services/reviewer-dashboard.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { closeCommonModal, openCommonModal } from '../../../common/utilities/custom-utilities';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { ModalActionEvent, ModalActionType } from '../../../shared-components/common-modal/common-modal.interface';
import { DeptReviewModalConfig, DisclosureReviewData, ReviewerDashboardRo } from '../../reviewer-dashboard.interface';
import {
    ReviewerOverviewCardEvent, SharedDisclReviewOverviewCardComponent
} from '../../shared/shared-discl-review-overview-card/shared-discl-review-overview-card.component';
import { REVIEWER_DASHBOARD_DISCLOSURE_TAB_TYPE } from '../../reviewer-dashboard-constants';

export type DeptOverviewModalActionType = ModalActionType | 'API_FAILED' | 'AUTO_CLOSE';
export type DeptOverviewModalEvent = { action: DeptOverviewModalActionType, content: any };

@Component({
    selector: 'app-dept-overview-details-modal',
    templateUrl: './dept-overview-details-modal.component.html',
    styleUrls: ['./dept-overview-details-modal.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, SharedDisclReviewOverviewCardComponent]
})
export class DeptOverviewDetailsModalComponent implements OnInit, OnDestroy {

    isModalOpen = false;
    private $subscriptions: Subscription[] = [];

    @Input() deptReviewDetailsModalConfig = new DeptReviewModalConfig();
    @Output() closeModal = new EventEmitter<DeptOverviewModalEvent>();

    constructor(private _commonService: CommonService, private _reviewerDashboardService: ReviewerDashboardService) { }

    ngOnInit(): void {
        this.loadReviewStatData();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private loadReviewStatData(): void {
        this.$subscriptions.push(
            this._reviewerDashboardService.getCOIReviewerDashboard(this.getReviewerDashboardRO())
                .subscribe((res: { dashboardData: DisclosureReviewData[], totalCount: number | null }) => {
                    this.deptReviewDetailsModalConfig.departmentReviewDetails = this.formatDashboardData(res?.dashboardData || []);
                    this.openOverviewModal();
                }, (error: any) => {
                    this.clearModalData('API_FAILED');
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching overview details.');
                }));
    }

    private formatDashboardData(dashboardData: DisclosureReviewData[]): DisclosureReviewData[] {
        return dashboardData
            .sort((a, b) => (a.ORDER_NUMBER || 0) - (b.ORDER_NUMBER || 0))
            .map(item => ({
                ...item,
                COUNT_DETAILS: item.COUNT_DETAILS
                    ? item.COUNT_DETAILS.sort((x, y) => (x.ORDER_NUMBER || 0) - (y.ORDER_NUMBER || 0))
                    : []
            }));
    }

    private getReviewerDashboardRO(): ReviewerDashboardRo {
        const REVIEWER_DASHBOARD_RO = new ReviewerDashboardRo();
        REVIEWER_DASHBOARD_RO.fetchType = 'HEADER';
        REVIEWER_DASHBOARD_RO.dashboardData = {
            HOME_UNIT: this.deptReviewDetailsModalConfig.revDashDeptOverview.unitNumber,
            PERSON: this.deptReviewDetailsModalConfig.personId
        };
        return REVIEWER_DASHBOARD_RO;
    }

    private openOverviewModal(): void {
        if (!this.isModalOpen) {
            this.isModalOpen = true;
            setTimeout(() => {
                openCommonModal(this.deptReviewDetailsModalConfig.modalConfig.namings.modalName);
            });
        }
    }

    deptReviewOverviewModalAction(modalAction: ModalActionEvent, cardActionEvent?: ReviewerOverviewCardEvent): void {
        closeCommonModal(this.deptReviewDetailsModalConfig.modalConfig.namings.modalName);
        setTimeout(() => {
            if (cardActionEvent?.action === 'VIEW_LIST') {
                const { selectedCountDetails, reviewStatDetails } = cardActionEvent.content || {};
                this._reviewerDashboardService.viewReviewerDashboardList({
                    unitNumber: this.deptReviewDetailsModalConfig.revDashDeptOverview.unitNumber,
                    uniqueId: selectedCountDetails?.UNIQUE_ID,
                    moduleCode: reviewStatDetails?.MODULE_CODE,
                    moduleName: reviewStatDetails?.MODULE_NAME,
                    isIncludeChildUnits: false,
                    unitDisplayName: this.deptReviewDetailsModalConfig.revDashDeptOverview.displayName,
                    personId: this.deptReviewDetailsModalConfig.personId,
                    personFullName: this.deptReviewDetailsModalConfig.personName,
                    tabType: REVIEWER_DASHBOARD_DISCLOSURE_TAB_TYPE[selectedCountDetails?.UNIQUE_ID]
                });
            }
            this.clearModalData(modalAction.action);
        }, 200);
    }

    private clearModalData(actionType: DeptOverviewModalActionType): void {
        this.isModalOpen = false;
        this.deptReviewDetailsModalConfig = new DeptReviewModalConfig();
        this.closeModal.emit({
            action: actionType,
            content: {
                deptReviewDetailsModalConfig: this.deptReviewDetailsModalConfig
            }
        });
    }

    overviewCardActions(cardActionEvent: ReviewerOverviewCardEvent): void {
        if (cardActionEvent.action === 'VIEW_LIST') {
            this.deptReviewOverviewModalAction({ action: 'CLOSE_BTN' }, cardActionEvent);
        }
    }

}
