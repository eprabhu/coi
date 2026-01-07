import { Router } from '@angular/router';
import { COMMON_DISCL_LOCALIZE } from '../../app-locales';
import { heightAnimation } from '../../common/utilities/animations';
import { CommonService } from '../../common/services/common.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoiDashboardCardEventActionType, CoiDashboardDisclosureType } from '../../common/services/coi-common.interface';
import { COI_MODULE_CODE, CREATE_DISCLOSURE_ROUTE_URL, DASHBOARD_FCOI_DISCLOSURE_COLLAPSED_FIELD_ORDER,
    DASHBOARD_FCOI_DISCLOSURE_FIELD_ORDER, DASHBOARD_OPA_DISCLOSURE_COLLAPSED_FIELD_ORDER,
    DASHBOARD_OPA_DISCLOSURE_FIELD_ORDER, DASHBOARD_TRAVEL_DISCLOSURE_COLLAPSED_FIELD_ORDER,
    DASHBOARD_TRAVEL_DISCLOSURE_FIELD_ORDER, DISCLOSURE_MODULE_MAP, DISCLOSURE_TYPE,
    ENGAGEMENT_REL_TYPE_ICONS,
    FCOI_DISCLOSURE_EDIT_MODE_REVIEW_STATUS, OPA_CHILD_ROUTE_URLS, OPA_INITIAL_VERSION_NUMBER, POST_CREATE_DISCLOSURE_ROUTE_URL,
    POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, PROJECT_TYPE, REVIEWER_STATUS_MAP, TRAVEL_DISCLOSURE_FORM_ROUTE_URL} from '../../app-constants';
import { ExistingDisclosure } from '../shared-interface';
import { CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS, TRAVEL_DISCL_REVIEW_STATUS_TYPE, TRAVEL_DOCUMENT_STATUS_BADGE, TRAVEL_REVIEW_STATUS_BADGE } from '../../travel-disclosure/travel-disclosure-constants';

export type CoiDashboardCardEvent = { action: CoiDashboardCardEventActionType, cardType: CoiDashboardDisclosureType, disclosureDetails: any, content?: any; };

@Component({
    selector: 'app-coi-disclosure-dashboard-card',
    templateUrl: './coi-disclosure-dashboard-card.component.html',
    styleUrls: ['./coi-disclosure-dashboard-card.component.scss'],
    animations: [heightAnimation('0', '*', 300, 'heightAnimation')]
})
export class CoiDisclosureDashboardCardComponent implements OnInit {

    @Input() cardType: CoiDashboardDisclosureType = 'TRAVEL';
    @Input() disclosureDetails: any = null;
    @Input() cardOrder = {
        EXPAND_CONTENT: null,
        COLLAPSE_CONTENT: null
    };
    @Input() isShowAssignAdminBtn = false;
    @Input() isShowCommentButton = false;
    @Input() expandCollapseBtnType: 'EXPAND_CONTENT' | 'COLLAPSE_CONTENT' | 'HIDE_BTN' = 'HIDE_BTN';

    @Output() cardActions = new EventEmitter<CoiDashboardCardEvent>();

    canManageDisclosure = false;
    isShowCountries: boolean[] = [];
    disclosureId: string | number = null;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    PROJECT_TYPE = PROJECT_TYPE;
    REVIEWER_STATUS_MAP = REVIEWER_STATUS_MAP;
    isDisclOwnedByLoggedInPerson = false;
    unitDisplayName = '';
    viewDisclosureTooltip = '';
    engagementRelTypeIcons = ENGAGEMENT_REL_TYPE_ICONS;
    opaInitialVersion = OPA_INITIAL_VERSION_NUMBER;
    travelReviewStatusBadge = TRAVEL_REVIEW_STATUS_BADGE;
    travelDocumentStatusBadge = TRAVEL_DOCUMENT_STATUS_BADGE;
    constructor(public commonService: CommonService, private _router: Router) { }
    hasExistingDisclosures: boolean;
    existingDisclosures: ExistingDisclosure;

    ngOnInit(): void {
        this.hasExistingDisclosures = this.checkExistingDisclosuresExist();
        this.getExistingDisclosures();
        this.setCardFieldOrder();
        this.setDisclosureViewTooltip();
        this.isDisclOwnedByLoggedInPerson = this.isOwnedByCurrentUser();
        const { travelDisclosureId, coiDisclosureId, opaDisclosureId } = this.disclosureDetails || {};
        this.disclosureId = coiDisclosureId  || opaDisclosureId || travelDisclosureId;
        this.canManageDisclosure = !!this.getShowOrHideAssignAdminBtn();
        this.unitDisplayName = this.commonService.getPersonLeadUnitDetails(this.disclosureDetails?.unit);
    }

    private setCardFieldOrder(): void {
        this.cardOrder.EXPAND_CONTENT = this.cardOrder.EXPAND_CONTENT ? this.cardOrder.EXPAND_CONTENT : this.getExpandedCardOrder();
        this.cardOrder.COLLAPSE_CONTENT = this.cardOrder.COLLAPSE_CONTENT ? this.cardOrder.COLLAPSE_CONTENT : this.getCollapsedCardOrder();
    }

    private checkExistingDisclosuresExist(): boolean {
        return this.disclosureDetails?.existingDisclosures?.some(disclosure => disclosure.isExists);
    }

    private getExistingDisclosures(): void {
        this.existingDisclosures = this.disclosureDetails?.existingDisclosures?.filter(disclosure => disclosure?.isExists) || [];
    }

    private getExpandedCardOrder(): string[] {
        switch (this.cardType) {
            case 'FCOI':
                return this.getFCOICardOrder(DASHBOARD_FCOI_DISCLOSURE_FIELD_ORDER);
            case 'OPA':
                return this.getOPACardOrder(DASHBOARD_OPA_DISCLOSURE_FIELD_ORDER);
            case 'TRAVEL':
                return DASHBOARD_TRAVEL_DISCLOSURE_FIELD_ORDER;
            default:
                return [];
        }
    }

    private getCollapsedCardOrder(): string[] {
        switch (this.cardType) {
            case 'FCOI':
                return this.getFCOICardOrder(DASHBOARD_FCOI_DISCLOSURE_COLLAPSED_FIELD_ORDER);
            case 'OPA':
                return this.getOPACardOrder(DASHBOARD_OPA_DISCLOSURE_COLLAPSED_FIELD_ORDER);
            case 'TRAVEL':
                return DASHBOARD_TRAVEL_DISCLOSURE_COLLAPSED_FIELD_ORDER;
            default:
                return [];
        }
    }

    private getFCOICardOrder(cardOrder: string[]): string[] {
        const IS_SHOW_ADMIN_DETAILS = ['ADMIN_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.coiApprovalFlowType);
        return cardOrder.filter(field => {
            // Remove admin fields if admin details should not be shown
            if (!IS_SHOW_ADMIN_DETAILS && ['ADMINISTRATOR', 'ADMIN_GROUP'].includes(field)) {
                return false;
            }
            // Remove expiration date for project disclosures that are not awards
            if (this.disclosureDetails?.fcoiTypeCode?.toString() === this.DISCLOSURE_TYPE.PROJECT &&
                this.disclosureDetails?.coiProjectTypeCode?.toString() !== PROJECT_TYPE.AWARD &&
                field === 'EXPIRATION_DATE') {
                return false;
            }
            return true;
        });
    }

    private getOPACardOrder(cardOrder: string[]): string[] {
        const IS_SHOW_ADMIN_DETAILS = ['ADMIN_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.opaApprovalFlowType);
        return cardOrder.filter(field => {
            // Remove admin fields if admin details should not be shown
            if (!IS_SHOW_ADMIN_DETAILS && ['ADMINISTRATOR', 'ADMIN_GROUP'].includes(field)) {
                return false;
            }
            return true;
        });
    }

    /**
     * Set tooltip and aria-label text for View button.
     */
    private setDisclosureViewTooltip(): void {
        const { TERM_OPA, TERM_TRAVEL, TERM_CONSULTING, PROJECT_BADGE_PREFIX, TERM_COI } = COMMON_DISCL_LOCALIZE;
        switch (this.cardType) {
            case 'OPA':
                this.viewDisclosureTooltip = `Click here to view ${TERM_OPA} Disclosure`;
                break;
            case 'TRAVEL':
                this.viewDisclosureTooltip = `Click here to view ${TERM_TRAVEL} Disclosure`;
                break;
            case 'CONSULTING':
                this.viewDisclosureTooltip = `Click here to view ${TERM_CONSULTING} Disclosure`;
                break;
            case 'FCOI':
                const IS_PROJECT = this.disclosureDetails?.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT;
                const PROJECT_LABEL = `${PROJECT_BADGE_PREFIX}${this.disclosureDetails?.projectType}`;
                const ANNUAL_LABEL = `${TERM_COI} ${this.disclosureDetails?.fcoiType}`;
                const DISCLOSURE_LABEL = IS_PROJECT ? PROJECT_LABEL : ANNUAL_LABEL;
                this.viewDisclosureTooltip = `Click here to view ${DISCLOSURE_LABEL} Disclosure`;
                break;
            default:
                this.viewDisclosureTooltip = 'Click here to view disclosure';
                break;
        }
    }

    private isOwnedByCurrentUser(): boolean {
        const LOGGED_IN_USER_ID = this.commonService.getCurrentUserDetail('personID');
        const DISCLOSURE_OWNER_ID = this.disclosureDetails?.personId;
        return LOGGED_IN_USER_ID === DISCLOSURE_OWNER_ID;
    }

    private getShowOrHideAssignAdminBtn(): boolean {
        const IS_TRAVEL_ADMINISTRATOR = this.commonService.getAvailableRight('MANAGE_TRAVEL_DISCLOSURE');
        if (this.cardType === 'TRAVEL' && this.disclosureDetails?.reviewStatusCode?.toString() === TRAVEL_DISCL_REVIEW_STATUS_TYPE.SUBMITTED?.toString() && IS_TRAVEL_ADMINISTRATOR) {
            return true;
        }
    }

    redirectToDisclosure(): void {
        sessionStorage.setItem('previousUrl', this._router.url);
        if(this.disclosureDetails.travelDisclosureId) {
            const IS_TRAVEL_DISCLOSURE_EDIT_PAGE = CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS.includes(this.disclosureDetails.reviewStatusCode);
            const REDIRECT_URL = IS_TRAVEL_DISCLOSURE_EDIT_PAGE && this.isDisclOwnedByLoggedInPerson ? TRAVEL_DISCLOSURE_FORM_ROUTE_URL : POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL;
            this._router.navigate([REDIRECT_URL], { queryParams: { disclosureId: this.disclosureDetails.travelDisclosureId } });
        }
        if(this.disclosureDetails.coiDisclosureId) {
            const IS_FCOI_DISCLOSURE_EDIT_PAGE = FCOI_DISCLOSURE_EDIT_MODE_REVIEW_STATUS.includes(this.disclosureDetails.reviewStatusCode);
            const REDIRECT_URL = IS_FCOI_DISCLOSURE_EDIT_PAGE && this.isDisclOwnedByLoggedInPerson ? CREATE_DISCLOSURE_ROUTE_URL : POST_CREATE_DISCLOSURE_ROUTE_URL;
            this._router.navigate([REDIRECT_URL], { queryParams: { disclosureId: this.disclosureDetails.coiDisclosureId } });
        }
        if(this.disclosureDetails.opaDisclosureId) {
            const REDIRECT_URL = OPA_CHILD_ROUTE_URLS.FORM;
            this._router.navigate([REDIRECT_URL], { queryParams: { disclosureId: this.disclosureDetails.opaDisclosureId } });
        }
    }

    viewEntityDetails(): void {
        this.commonService.openEntityDetailsModal(this.disclosureDetails?.entityId);
    }

    openPersonDetailsModal(): void {
        this.commonService.openPersonDetailsModal(this.disclosureDetails?.personId);
    }

    assignAdmin(): void {
        this.cardActions.emit({
            action: 'ASSIGN_ADMIN',
            cardType: this.cardType,
            disclosureDetails: this.disclosureDetails
        });
    }

    openReviewComment(): void {
        this.cardActions.emit({
            action: 'COMMENTS',
            cardType: this.cardType,
            disclosureDetails: this.disclosureDetails
        });
    }

    openEngagementsModal(): void {
        if (this.disclosureDetails?.noOfSfi > 0) {
            this.cardActions.emit({
                action: 'ENGAGEMENTS_MODAL',
                cardType: this.cardType,
                disclosureDetails: this.disclosureDetails,
                content: {
                    count: this.disclosureDetails.noOfSfi,
                    moduleCode: DISCLOSURE_MODULE_MAP[this.cardType],
                    inputType: 'DISCLOSURE_TAB'
                }
            });
        }
    }

    openProjectsModal(projectCount: any): void {
        if (projectCount?.projectCount > 0) {
            this.cardActions.emit({
                action: 'PROJECT_MODAL',
                cardType: this.cardType,
                disclosureDetails: this.disclosureDetails,
                content: {
                    count: projectCount.projectCount,
                    moduleCode: projectCount.moduleCode,
                    inputType: 'DISCLOSURE_TAB'
                }
            });
        }
    }

    openAttachmentsModal(): void {
        if (this.disclosureDetails?.disclosureAttachmentCount > 0) {
            this.cardActions.emit({
                action: 'ATTACHMENTS_MODAL',
                cardType: this.cardType,
                disclosureDetails: this.disclosureDetails,
                content: {
                    count: this.disclosureDetails.disclosureAttachmentCount,
                    moduleCode: COI_MODULE_CODE,
                    inputType: 'DISCLOSURE_ATTACHMENT'
                }
            });
        }
    }

    toggleDisclosureCard(): void {
        if (this.expandCollapseBtnType !== 'HIDE_BTN') {
            this.expandCollapseBtnType = this.expandCollapseBtnType === 'EXPAND_CONTENT' ? 'COLLAPSE_CONTENT' : 'EXPAND_CONTENT';
        }
    }

}
