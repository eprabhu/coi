import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CMP_LOCALIZE } from "../../../../app-locales";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { SharedModule } from "../../../../shared/shared.module";
import { CommonService } from "../../../../common/services/common.service";
import { ManagementPlanService } from "../../services/management-plan.service";
import { getCodeDescriptionFormat, openCommonModal } from "../../../../common/utilities/custom-utilities";
import { subscriptionHandler } from "../../../../common/utilities/subscription-handler";
import { SharedComponentModule } from "../../../../shared-components/shared-component.module";
import { SharedBootstrapDropdownDetails } from "../../../../shared-components/shared-interface";
import { ManagementPlanDataStoreService } from "../../services/management-plan-data-store.service";
import { CommonModalConfig } from "../../../../shared-components/common-modal/common-modal.interface";
import { USER_DASHBOARD_CHILD_ROUTE_URLS } from "../../../../app-constants";
import { FetchReviewCommentRO } from "../../../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface";
import { CommonActionsDropDownComponent } from "../../../../shared-components/common-actions-drop-down/common-actions-drop-down.component";
import { CMP_GENERAL_COMMENTS } from "../../../../shared-components/coi-review-comments/coi-review-comments-constants";
import { AvailableDocumentActions, CoiProjectType, DataStoreEvent, PersonType } from "../../../../common/services/coi-common.interface";
import {
    ManagementPlanStoreData, CmpReviewLocation, CmpConfirmationModalFields, CmpProject,
    CmpConfirmationModal, CmpLocationReviewType, CmpCreationConfig, CmpCreationSliderConfig,
} from "../../../shared/management-plan.interface";
import {
    CMP_INITIAL_VERSION_NUMBER, CMP_STATUS, CMP_REVIEWER_STATUS,
    CMP_ADMIN_DASHBOARD_URL, CMP_CREATION_URL
} from "../../../shared/management-plan-constants";

@Component({
    selector: 'app-management-plan-header',
    templateUrl: './management-plan-header.component.html',
    styleUrls: ['./management-plan-header.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        SharedComponentModule,
        CommonActionsDropDownComponent
    ]
})
export class ManagementPlanHeaderComponent implements OnInit, OnDestroy {

    isSaving = false;
    CMP_LOCALIZE = CMP_LOCALIZE;
    initialVersionNumber = CMP_INITIAL_VERSION_NUMBER;
    actionBtnConfig = {
        isShowCommentsBtn: true,
        isShowActionsBtn: true,
        isShowEditCmpBtn: false,
        isShowStartReviewBtn: false,
        isShowCompleteReviewBtn: false,
    };
    actionDropDownConfig: SharedBootstrapDropdownDetails = {
        btnTitle: 'Click here to change management plan status',
        uniqueId: 'cmp-action-dropdown',
        dropdownBtnClass: 'btn btn-primary coi-btn-sm d-flex align-items-center gap-2 fs-14',
        dropdownMenuClass: 'fs-14',
        dropDownBtnLabel: 'Actions'
    };
    managementPlan = new ManagementPlanStoreData();
    availableActions: AvailableDocumentActions[] = [];
    projectTypes: Record<string, CoiProjectType> = this._commonService.getCoiProjectTypesMap();
    private $subscriptions: Subscription[] = [];

    constructor(private _router: Router,
        private _commonService: CommonService,
        public managementPlanService: ManagementPlanService,
        private _managementPlanDataStore: ManagementPlanDataStoreService) {}

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenDataChangeFromStore();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        this.managementPlan = this._managementPlanDataStore.getData();
        this.availableActions = this.managementPlan?.availableActions;
        this.setOrganizationDisplayName();
        this.setButtonVisibility();
    }

    private setOrganizationDisplayName(): void {
        if (this.managementPlan?.plan?.organization) {
            const { organizationId, organizationName } = this.managementPlan.plan.organization;
            this.managementPlan.plan.organization = {
                ...this.managementPlan.plan.organization,
                organizationDisplayName: getCodeDescriptionFormat(organizationId, organizationName)
            };
        }
    }

    private setButtonVisibility(): void {
        const IS_FORM_EDITABLE_STATUS = this._managementPlanDataStore.isFormEditableStatus();
        const HAS_MAINTAIN_CMP_RIGHTS = this._managementPlanDataStore.getHasMaintainCmp();
        const IS_CMP_PERSON = this._managementPlanDataStore.isLoggedCmpPerson();
        const ACTIVE_REVIEWER_DETAILS: CmpReviewLocation = this._managementPlanDataStore.getActiveLoggedInReviewer();
        this.actionBtnConfig.isShowActionsBtn = HAS_MAINTAIN_CMP_RIGHTS && this.availableActions?.length > 0;
        this.actionBtnConfig.isShowEditCmpBtn = IS_FORM_EDITABLE_STATUS && (IS_CMP_PERSON || HAS_MAINTAIN_CMP_RIGHTS);
        this.actionBtnConfig.isShowStartReviewBtn = String(ACTIVE_REVIEWER_DETAILS?.reviewStatusTypeCode) === String(CMP_REVIEWER_STATUS.ASSIGNED);
        this.actionBtnConfig.isShowCompleteReviewBtn = String(ACTIVE_REVIEWER_DETAILS?.reviewStatusTypeCode) === String(CMP_REVIEWER_STATUS.INPROGRESS);
        this.actionBtnConfig.isShowCommentsBtn = this._managementPlanDataStore.getCommentButtonVisibility();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private getMandatoryList(actionTypeCode: string | number): CmpConfirmationModalFields[] {
        switch (actionTypeCode) {
            case CMP_STATUS.INPROGRESS: return [];
            case CMP_STATUS.DRAFT: return [];
            case CMP_STATUS.FINAL_DRAFT: return this.getWarningText(actionTypeCode) ? ['ATTACHMENT'] : [];
            case CMP_STATUS.FULLY_EXECUTED_ACTIVE: return ['APPROVAL_DATE', 'EXPIRATION_DATE'];
            case CMP_STATUS.FULLY_EXECUTED_CLOSED: return [];
            case CMP_STATUS.NOT_EXECUTED_CLOSED: return [];
            case CMP_STATUS.VOID: return [];
            default: return [];
        }
    }

    private getWarningText(actionTypeCode: string | number): string {
        switch (actionTypeCode) {
            case CMP_STATUS.INPROGRESS: return '';
            case CMP_STATUS.DRAFT: return '';
            case CMP_STATUS.FINAL_DRAFT: {
                const HAS_UPLOADED = this.managementPlan?.cmpAttachmentsList?.find((attachment) => attachment?.attaTypeCode == '1');
                if (!HAS_UPLOADED?.attachmentId) {
                    return `You haven’t generated or uploaded a CMP Plan yet. To proceed, please add the required document. You can generate a new CMP Plan after closing this window, or upload one directly here.`;
                }
                return '';
            };
            case CMP_STATUS.FULLY_EXECUTED_ACTIVE: return '';
            case CMP_STATUS.FULLY_EXECUTED_CLOSED: return '';
            case CMP_STATUS.NOT_EXECUTED_CLOSED: return '';
            case CMP_STATUS.VOID: return '';
            default: return '';
        }
    }

    private getInfoText(actionTypeCode: string | number): string {
        switch (actionTypeCode) {
            case CMP_STATUS.INPROGRESS: return '';
            case CMP_STATUS.DRAFT: return '';
            case CMP_STATUS.FINAL_DRAFT: return '';
            case CMP_STATUS.FULLY_EXECUTED_ACTIVE: return '';
            case CMP_STATUS.FULLY_EXECUTED_CLOSED: return '';
            case CMP_STATUS.NOT_EXECUTED_CLOSED: return '';
            case CMP_STATUS.VOID: return '';
            default: return '';
        }
    }

    private getVisibleFieldsList(actionTypeCode: string | number): CmpConfirmationModalFields[] {
        switch (actionTypeCode) {
            case CMP_STATUS.INPROGRESS: return ['CMP_ACTION_DESCRIPTION'];
            case CMP_STATUS.DRAFT: return ['CMP_ACTION_DESCRIPTION'];
            case CMP_STATUS.FINAL_DRAFT: return this.getWarningText(actionTypeCode) ? ['CMP_ACTION_DESCRIPTION', 'ATTACHMENT'] : ['CMP_ACTION_DESCRIPTION'];
            case CMP_STATUS.FULLY_EXECUTED_ACTIVE: return ['APPROVAL_DATE', 'EXPIRATION_DATE', 'CMP_ACTION_DESCRIPTION', 'ATTACHMENT'];
            case CMP_STATUS.FULLY_EXECUTED_CLOSED: return ['CMP_ACTION_DESCRIPTION'];
            case CMP_STATUS.NOT_EXECUTED_CLOSED: return ['CMP_ACTION_DESCRIPTION'];
            case CMP_STATUS.VOID: return ['CMP_ACTION_DESCRIPTION'];
            default: return ['CMP_ACTION_DESCRIPTION'];
        }
    }

    openPersonDetailsModal(): void {
        const { person, rolodex } = this.managementPlan?.plan || {};
        const PERSON_TYPE: PersonType = rolodex?.rolodexId ? 'ROLODEX' : 'PERSON';
        const PERSON_OR_ROLODEX_ID = PERSON_TYPE === 'PERSON' ? person?.personId : rolodex?.rolodexId
        this._commonService.openPersonDetailsModal(PERSON_OR_ROLODEX_ID, PERSON_TYPE);
    }

    openEntityDetailsModal(entityId: string | number): void {
        this._commonService.openEntityDetailsModal(entityId);
    }

    openProjectHierarchySlider(cmpProject: CmpProject): void {
        this._commonService.openProjectHierarchySlider(cmpProject.moduleCode, cmpProject.moduleItemKey);
    }

    openReviewComment(): void {
        const { cmpId, cmpNumber, personId } = this.managementPlan?.plan || {}
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: CMP_GENERAL_COMMENTS.componentTypeCode,
            moduleItemKey: cmpId,
            moduleItemNumber: cmpNumber,
            subModuleCode: null,
            subModuleItemKey: null,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: personId,
        };
        this.managementPlanService.setReviewCommentSliderConfig(REQ_BODY);
    }


    closeManagementPlan(): void {
        if (this.managementPlanService.previousRouteUrl.includes(CMP_ADMIN_DASHBOARD_URL) || this.managementPlanService.previousRouteUrl.includes(CMP_CREATION_URL)) {
            this._router.navigate([CMP_ADMIN_DASHBOARD_URL]);
        } else {
            this._router.navigate([USER_DASHBOARD_CHILD_ROUTE_URLS.MY_DISCLOSURES_ROUTE_URL]);
        }
    }

    selectedDocAction(selectedAction: AvailableDocumentActions): void {
        this.openActionConfirmationModal(selectedAction);
    }

    openActionConfirmationModal(selectedAction: AvailableDocumentActions): void {
        this.managementPlanService.confirmationModal = new CmpConfirmationModal();
        this.managementPlanService.confirmationModal.action = 'CONFIRMATION';
        this.managementPlanService.confirmationModal.actionTypeCode = selectedAction?.resultingStatus || null;
        this.managementPlanService.confirmationModal.description = '';
        this.managementPlanService.confirmationModal.visibleFieldsList = this.getVisibleFieldsList(selectedAction?.resultingStatus);
        this.managementPlanService.confirmationModal.mandatoryFieldsList = this.getMandatoryList(selectedAction?.resultingStatus);
        this.managementPlanService.confirmationModal.selectedAction = selectedAction;
        this.managementPlanService.confirmationModal.descriptionLabel = `Description`;
        this.managementPlanService.confirmationModal.textAreaPlaceholder = `Please provide the description.`;
        this.managementPlanService.confirmationModal.modalHeader = selectedAction?.actionDescription;
        this.managementPlanService.confirmationModal.modalBody = '';
        if (String(selectedAction.actionTypeCode) === '21') {
            this.managementPlanService.confirmationModal.approvalDateLabel = 'Revision Approval Date';
            this.managementPlanService.confirmationModal.InfoText = `If there are any changes to the ${CMP_LOCALIZE.TERM_CMP} plan, please upload the updated document.`;
        }
        this.managementPlanService.confirmationModal.warningText = this.getWarningText(selectedAction?.resultingStatus);
        this.managementPlanService.confirmationModal.modalConfig = new CommonModalConfig('cmp-confirm-modal', 'Confirm', 'Cancel', 'xl');
        this.managementPlanService.confirmationModal.modalHelpTextConfig = { subSectionId: '2904', elementId: `cmp-confirm-modal-header-${selectedAction?.resultingStatus}` };
        this.managementPlanService.confirmationModal.descriptionHelpTextConfig = { subSectionId: '2904', elementId: `cmp-confirm-modal-desc-${selectedAction?.resultingStatus}` };
        setTimeout(() => {
            openCommonModal(this.managementPlanService.confirmationModal.modalConfig.namings.modalName);
        });
    }

    openReviewConfirmationModal(action: CmpLocationReviewType): void {
        const REVIEW_DETAILS: CmpReviewLocation = this._managementPlanDataStore.getActiveLoggedInReviewer();
        this.managementPlanService.openReviewConfirmationModal(action, REVIEW_DETAILS);
    }

    openCmpModifySlider(): void {
        const CMP_CONFIG = new CmpCreationConfig();
        const { person, academicDepartment, cmpType, labCenter, organization, rolodex, cmpId, cmpNumber } = this.managementPlan?.plan || {}
        CMP_CONFIG.cmpDetails.cmpId = cmpId;
        CMP_CONFIG.cmpDetails.cmpNumber = cmpNumber;
        CMP_CONFIG.cmpDetails.person = person;
        CMP_CONFIG.cmpDetails.academicDepartment = academicDepartment;
        CMP_CONFIG.cmpDetails.cmpEntityList = this.managementPlan?.cmpEntityList;
        CMP_CONFIG.cmpDetails.cmpProjectList = this.managementPlan?.cmpProjectList;
        CMP_CONFIG.cmpDetails.cmpType = cmpType;
        CMP_CONFIG.cmpDetails.labCenter = labCenter;
        CMP_CONFIG.cmpDetails.organization = organization;
        CMP_CONFIG.cmpDetails.rolodex = rolodex;
        CMP_CONFIG.disabledFields = {
            LAB_CENTER: false,
            ACADEMIC_DEPARTMENT: false,
            PERSON_SEARCH: true,
            CMP_TYPE: true,
            TEMPLATE: true,
            SUB_AWARD_INSTITUTE: true,
            ENTITY_SEARCH: true,
            SUB_AWARD_INVESTIGATOR: true,
            PROJECT: this.managementPlan?.cmpProjectList.length > 0,
            PROJECT_TYPE: this.managementPlan?.cmpProjectList.length > 0,
            PROJECT_SEARCH: this.managementPlan?.cmpProjectList.length > 0
        };
        const SLIDER_CONFIG = new CmpCreationSliderConfig();
        SLIDER_CONFIG.sliderHeader = 'Update CMP Details'
        this._commonService.openCmpCreationSlider(CMP_CONFIG);
    }

}
