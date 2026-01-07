import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { MigratedEngagementsService } from './migrated-engagements.service';
import { Router } from '@angular/router';
import { CommonService } from '../common/services/common.service';
import { of, Subject } from 'rxjs';
import { COIEngagementActionModal, EngagementCardActionEvent, EngagementsMigDashboard, EngagementStatusRO } from './migrated-engagements-interface';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../app-constants';
import { EngagementMigrationCount } from '../common/services/coi-common.interface';
import { closeCommonModal, openCommonModal } from '../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../shared-components/common-modal/common-modal.interface';
import { EXCLUDE_MODAL_TEXT, MIG_ENG_HELP_TEXT, REVERT_MODAL_TEXT } from './migrated-engagement-constants';
import { HeaderService } from '../common/header/header.service';
import { ENGAGEMENT_LOCALIZE } from '../app-locales';

@Component({
    selector: 'app-migrated-engagements',
    templateUrl: './migrated-engagements.component.html',
    styleUrls: ['./migrated-engagements.component.scss']
})
export class MigratedEngagementsComponent implements OnInit, OnDestroy {

    $subscriptions = [];
    $fetchSFI = new Subject();
    engagementStatusRO: EngagementStatusRO;
    filteredEntityArray = [];
    showBanner: boolean = true;
    isLoading = false;
    result = new EngagementsMigDashboard();
    isTriggeredFromSlider = false;
    engagementActionModalID = 'coi-engagement-action-modal'
    isShowEngagementActionModal = false;
    engagementActionModalConfig = new CommonModalConfig(this.engagementActionModalID, 'Confirm', 'Cancel', 'lg');
    engagementActionModal = new COIEngagementActionModal();
    engagementIDArr: number[] = [];
    selectedEngagementModalAction: string;
    helpText: string = MIG_ENG_HELP_TEXT.TO_DO_TEXT;
    isShowFooter = true;
    filterString = 'TO REVIEW';
    redirectModalConfig = new CommonModalConfig('coi-redirect-modal', 'Proceed', 'Cancel', 'lg');
    isShowRedirectModal = false;
    isShowExcludedEngagements = false; // Set to false as exclude and revert are not needed currently; may be used in future
    ENGAGEMENT_LOCALIZE = ENGAGEMENT_LOCALIZE;

    constructor(public migratedEngagementService: MigratedEngagementsService, private _router: Router, private _commonService: CommonService, public headerService: HeaderService) {
    }

    ngOnInit(): void {
        this.fetchEngagementCount();
        this.fetchMigratedEngagements();
        this.$fetchSFI.next();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
    // Fetches migrated engagement list and resets pagination if current page exceeds available pages
    private fetchMigratedEngagements(): void {
        this.$subscriptions.push(
            this.$fetchSFI.pipe(
                switchMap(() => {
                    this.isLoading = true;
                    this.result = new EngagementsMigDashboard();
                    this.filteredEntityArray = [];
                    return this.migratedEngagementService.getEngagementDashboard(this.headerService.migratedEngagementDashboardRO).pipe(
                        catchError((error) => {
                            this.isLoading = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching engagement details.');
                            return of(null);
                        })
                    );
                })
            ).subscribe(
                (data: EngagementsMigDashboard) => {
                    if (data) {
                        const TOTAL_ITEMS = data.count || 0;
                        const ITEMS_PER_PAGE = this.headerService.migratedEngagementDashboardRO.pageLimit;
                        const LAST_PAGE_NUMBER = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE) || 1;
                        if (this.headerService.migratedEngagementDashboardRO.pageNumber > LAST_PAGE_NUMBER) {
                            this.headerService.migratedEngagementDashboardRO.pageNumber = LAST_PAGE_NUMBER;
                            this.$fetchSFI.next();
                        }
                        this.result = data;
                        this.isLoading = false;
                        this.filteredEntityArray = data.legacyEngagements || [];
                    }
                }
            )
        );
    }
    // Retrieves engagement count; if no items are pending review, triggers redirect modal and disables the pending migration flag.
    private fetchEngagementCount(): void {
        this.$subscriptions.push(this.migratedEngagementService.fetchMigratedEngagementCount()
            .subscribe((engagementMigrationCount: EngagementMigrationCount) => {
                this.headerService.migratedEngagementsCount = engagementMigrationCount;
                if (engagementMigrationCount.toReviewCount === 0 && engagementMigrationCount.inProgressCount === 0) {
                    this.openRedirectToHomeModal('coi-redirect-modal');
                    this.headerService.hasPendingMigrations = false;
                }
            }, (error: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
    }
    //Sets help text based on migration status
    private helpTextMap: { [key: string]: string } = {
        'TO REVIEW': MIG_ENG_HELP_TEXT.TO_DO_TEXT,
        'EXCLUDED': MIG_ENG_HELP_TEXT.EXCLUDED_TEXT,
        'COMPLETED': MIG_ENG_HELP_TEXT.TRANSFERRED_TEXT,
        'IN PROGRESS': MIG_ENG_HELP_TEXT.IN_PROGRESS
    };
    // Opens the engagement action modal and sets content based on whether 'EXCLUDE' or 'REVERT' is selected.
    private openEngagementActionModal(modalID: string, engagementID: number, action: string): void {
        this.isShowEngagementActionModal = true;
        this.selectedEngagementModalAction = action;
        const MODAL_CONTENT = action === 'EXCLUDE' ? EXCLUDE_MODAL_TEXT : REVERT_MODAL_TEXT;
        this.engagementActionModal = {
            header: MODAL_CONTENT.header,
            message: MODAL_CONTENT.message,
            confirmationText: MODAL_CONTENT.confirmationText,
            closingText: MODAL_CONTENT.closingText
        };
        this.engagementIDArr.push(engagementID);
        setTimeout(() => openCommonModal(modalID), 50);
    }
    // Closes the engagement action modal, resets modal data and selected action
    private closeEngagementActionModal(): void {
        this.engagementIDArr = [];
        this.engagementStatusRO = {
            migrationStatus: '',
            engagementIds: []
        };
        this.selectedEngagementModalAction = '';
        closeCommonModal(this.engagementActionModalID);
        const TIMEOUT_REF = setTimeout(() => {
            this.isShowEngagementActionModal = false;
            this.engagementActionModal = new COIEngagementActionModal();
            clearTimeout(TIMEOUT_REF);
        }, 200);
    }
    // Updates the engagement status based on the selected action, refreshes the engagement list and count
    private updateEngagementStatus(status: 'EXCLUDED' | 'TOREVIEW', successMsg: string): void {
        this.engagementStatusRO = {
            migrationStatus: status,
            engagementIds: this.engagementIDArr
        };
        this.$subscriptions.push(
            this.migratedEngagementService.updateEngagementStatus(this.engagementStatusRO)
                .subscribe({
                    next: () => {
                        this.closeEngagementActionModal();
                        this.$fetchSFI.next();
                        this.fetchEngagementCount();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, successMsg);
                    },
                    error: () => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                })
        );
    }
    //Opens modal to redirect to home
    private openRedirectToHomeModal(modalID): void {
        this.isShowRedirectModal = true;
        setTimeout(() => openCommonModal(modalID), 50);
    }
    //Closes modal to redirect to home
    private closeRedirectToHomeModal(): void {
        closeCommonModal('coi-redirect-modal');
        const TIMEOUT_REF = setTimeout(() => {
            this.isShowRedirectModal = false;
            clearTimeout(TIMEOUT_REF);
        }, 200);
    }

    actionsOnPageChangeEvent(event): void {
        if (this.headerService.migratedEngagementDashboardRO.pageNumber !== event) {
            this.headerService.migratedEngagementDashboardRO.pageNumber = event;
            this.$fetchSFI.next();
        }
    }
    // Sets filters for engagement list based on type and tab, resets pagination, updates help text and fetches engagement list based on filter.
    setFilter(type = 'N', tab = 'TO REVIEW'): void {
        this.filteredEntityArray = [];
        this.headerService.migratedEngagementDashboardRO.filter = type;
        this.headerService.migratedEngagementDashboardRO.tab = tab;
        this.headerService.migratedEngagementDashboardRO.pageNumber = 1;
        this.filterString = tab;
        this.helpText = this.helpTextMap[tab] || '';
        this.isShowFooter = tab !== 'COMPLETED';
        this.$fetchSFI.next();
    }
    // Handles card action events like VIEW, EXCLUDE, REVERT, and PROCEED by triggering corresponding operations such as opening slider, modal, or navigation.
    cardActions(event: EngagementCardActionEvent): void {
        const ACTION_TYPE = event?.action;
        const ENGAGEMENT_ID = event?.engagementDetails?.engagementId;
        if (!ACTION_TYPE || !ENGAGEMENT_ID) return;
        switch (ACTION_TYPE) {
            case 'VIEW':
                this.migratedEngagementService.openEngagementSlider(event.engagementDetails);
                break;
            case 'EXCLUDE':
            case 'REVERT':
                this.openEngagementActionModal(this.engagementActionModalID, ENGAGEMENT_ID, ACTION_TYPE);
                break;
            case 'PROCEED':
                if(event?.engagementDetails?.migrationStatus === 'IN PROGRESS') {
                    sessionStorage.setItem('migratedEngagementId', ENGAGEMENT_ID.toString());
                    this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: event?.engagementDetails?.coiEngagementId, personEntityNumber: event?.engagementDetails?.coiEntityId } });
                } else {
                    this._router.navigate(['/coi/migrated-engagements/engagement-details'], { queryParams: { engagementId: ENGAGEMENT_ID } });
                }
                break;
            default:
                break;
        }
    }
    // Handles modal confirmation and updates engagement status or closes the modal based on user action.
    postConfirmation(event: ModalActionEvent): void {
        if (event.action === 'PRIMARY_BTN') {
            if (this.selectedEngagementModalAction === 'EXCLUDE') {
                this.updateEngagementStatus('EXCLUDED', 'Engagement excluded successfully.');
            } else {
                this.updateEngagementStatus('TOREVIEW', 'Engagement successfully moved back to To Do.');
            }
        } else {
            this.closeEngagementActionModal();
        }
    }
    // Redirects to user dashboard if confirmed, otherwise just closes the modal.
    redirectToHome(event: ModalActionEvent): void {
        if (event.action === 'PRIMARY_BTN') {
            this._router.navigate(['/coi/user-dashboard']);
            this.closeRedirectToHomeModal();
        } else {
            this.closeRedirectToHomeModal();
        }
    }

}
