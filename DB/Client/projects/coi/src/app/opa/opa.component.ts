import { COI_REVIEW_COMMENTS_IDENTIFIER, OPA_GENERAL_COMMENTS } from './../shared-components/coi-review-comments/coi-review-comments-constants';
import { Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { FormBuilderEvent} from '../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { Subject} from 'rxjs';
import { OpaService} from './services/opa.service';
import { DataStoreService} from './services/data-store.service';
import { CommonService} from '../common/services/common.service';
import { environment} from '../../environments/environment';
import { REPORTER_HOME_URL, HTTP_ERROR_STATUS, OPA_MODULE_CODE, OPA_SUB_MODULE_CODE, COMMON_ERROR_TOAST_MSG, HTTP_SUCCESS_STATUS, OPA_REVIEW_STATUS,
    OPA_CHILD_ROUTE_URLS, USER_DASHBOARD_CHILD_ROUTE_URLS, OPA_DASHBOARD_ROUTE_URL, OPA_VERSION_TYPE, OPA_DISPOSITION_STATUS, OPA_INITIAL_VERSION_NUMBER, 
    OPA_REVIEW_RIGHTS,
    OPA_DISCLOSURE_RIGHTS,
    OPA_DISPOSITION_STATUS_BADGE,
    OPA_REVIEW_STATUS_BADGE,
    OPA_MAINTAIN_REVIEWER_RIGHT,
    OPA_DEPT_ADMIN_RIGHT} from '../app-constants';
import { OPA, OPAApproveOrRejectWorkflowRO, OpaDisclosure } from './opa-interface';
import { DefaultAssignAdminDetails, PersonProjectOrEntity } from '../shared-components/shared-interface';
import { ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { Location} from '@angular/common';
import { ModalType} from '../disclosure/coi-interface';
import { NavigationService} from "../common/services/navigation.service";
import { AutoSaveEvent, AutoSaveService } from '../common/services/auto-save.service';
import { arrangeFormValidationList, closeCommonModal, hideModal, openCommonModal, openModal } from "../common/utilities/custom-utilities";
import { subscriptionHandler } from "../common/utilities/subscription-handler";
import { COIValidationModalConfig, DataStoreEvent, DisclosureCommentsCountRO, DisclosureCommentsCounts, DocumentActionStorageEvent, GlobalEventNotifier, OPADisclosureDetails, PersonEntityDto, PrintModalConfig } from "../common/services/coi-common.interface";
import { CommonModalConfig, ModalActionEvent } from '../shared-components/common-modal/common-modal.interface';
import { FetchReviewCommentRO } from '../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { SfiService } from '../disclosure/sfi/sfi.service';
import { HeaderService } from '../common/header/header.service';
import { BypassValidateAction } from '../shared-components/workflow-engine2/workflow-engine.component';
import { WorkFlowAction, WorkflowDetail } from '../shared-components/workflow-engine2/workflow-engine-interface';
import { ValidationConfig } from '../configuration/form-builder-create/shared/form-validator/form-validator.interface';
import { REVIEWER_ADMIN_DASHBOARD_BASE_URL, REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS } from '../reviewer-dashboard/reviewer-dashboard-constants';
import { extractAllApprovers } from '../shared-components/workflow-engine2/workflow-engine-utility';

export class RoutingBypassRO {
    workflow: WorkFlowAction; 
    flag: string; 
    allApprovers: WorkflowDetail[];
}

@Component({
    selector: 'app-opa',
    templateUrl: './opa.component.html',
    styleUrls: ['./opa.component.scss']
})
export class OpaComponent implements OnInit, OnDestroy {
    isCardExpanded = true;
    formBuilderEvents = new Subject<FormBuilderEvent>();
    opa: OPA = new OPA();
    deployMap = environment.deployUrl;
    isAddAssignModalOpen = false;
    defaultAdminDetails = new DefaultAssignAdminDetails();
    personProjectDetails = new PersonProjectOrEntity();
    helpTexts = '';
    primaryBtnName = '';
    descriptionErrorMsg = '';
    textAreaLabelName = '';
    withdrawErrorMsg = 'Please provide the reason for Recalling the disclosure.';
    returnErrorMsg = 'Please provide the reason for returning the disclosure.';
    completeReviewHelpText = 'You are about to complete the disclosure\'s final review.'
    confirmationHelpTexts = '';
    returnHelpTexts = 'Please provide the reason for return.';
    withdrawHelpTexts = 'Please provide the reason for Recall.';
    submitHelpTexts = 'You are about to submit the OPA disclosure.';
    returnModalHelpText = 'You are about to return the OPA disclosure.';
    withdrawModalHelpText = 'You are about to Recall the OPA disclosure.';
    description: any;
    showSlider = false;
    selectedType: string;
    $subscriptions = [];
    commentsRight: {
        canViewPrivateComments: boolean;
        canMaintainPrivateComments: boolean;
    };
    isHomeClicked = false;
    isSubmitClicked = false;
    isUserCollapse = false;
    validationList = [];
    lastScrollTop = 0;
    scrollTop = 0;
    isManuallyExpanded = false;
    isScrolled = false;
    isShowCompleteDisclHistory = false;
    isOpaAdministrator = false;
    isDisclosureOwner = false;
    isShowApproveDisapproveBtn = false;
    isShowReviewTab = false;
    isShowCommentBtn = false;
    isShowRouteLogTab = false;
    isShowAssignAdminBtn = false;
    isShowReAssignAdminBtn = false;
    isShowWithdrawBtn = false;
    isShowReturnBtn = false;
    isShowReviseButton = false;
    isShowAdminDetails = false;
    isActionPerforming = false;
    formList: any[] = [];
    formId: number | string;
    disclosureCommentsCountRO = new DisclosureCommentsCountRO();
    OPA_REVIEW_STATUS = OPA_REVIEW_STATUS;
    OPA_CHILD_ROUTE_URLS = OPA_CHILD_ROUTE_URLS;
    workFlowMandatoryList = new Map();
    attachmentErrorMsg = '';
    reviewDescription = '';
    WorkflowUploadedFiles: any[] = [];
    approveOrRejectWorkflowRO = new OPAApproveOrRejectWorkflowRO();
    opaValidationModalConfig = new CommonModalConfig('opa-validation-modal', '');
    workFlowConfirmModalId = 'work-flow-approve-return-confirm-modal';
    workFlowConfirmModalConfig = new CommonModalConfig(this.workFlowConfirmModalId, '', 'Cancel', 'lg');
    opaVersionType = OPA_VERSION_TYPE;
    opaDispositionStatus = OPA_DISPOSITION_STATUS;
    opaInitialVersion = OPA_INITIAL_VERSION_NUMBER;
    isOpaReviewer = false;
    validationAction: 'BYPASS' | 'APPROVE' | null;
    routingBypassRO = new RoutingBypassRO();
    isShowStartReviewBtn = false;
    isShowCompleteReviewBtn = false;
    isShowCompleteFinalReviewBtn = false;
    isShowOverAllHistory  = false;
    printModalConfig = new PrintModalConfig();
    opaDispositionStatusBadge = OPA_DISPOSITION_STATUS_BADGE;
    opaReviewStatusBadge = OPA_REVIEW_STATUS_BADGE;
    
    @HostListener('window:resize', ['$event'])
    listenScreenSize(event: Event) {
        if (!this.dataStore.isFormEditable()) {
            if(!this.isUserCollapse) {
                this.isCardExpanded = window.innerWidth > 1399;
            }
        }
        this.opaService.setTopDynamically();
        this.commonService.$globalEventNotifier.next({uniqueId: 'COI_OPA_HEADER', content: { isCardExpanded: this.isCardExpanded }});
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event: Event) {
        if (!this.dataStore.isFormEditable()) {
            this.scrollTop = window.scrollY || document.documentElement.scrollTop;
            if (!this.isManuallyExpanded && !this.isScrolled) {
                if (this.scrollTop === 0 && !this.isCardExpanded) {
                    this.isCardExpanded = true;
                } else if (this.scrollTop > this.lastScrollTop && this.isCardExpanded) {
                    this.isScrolled = true;
                    this.isCardExpanded = false;
                }
                this.opaService.setTopDynamically();
            }
            this.lastScrollTop = this.scrollTop <= 0 ? 0 : this.scrollTop;
            this.commonService.$globalEventNotifier.next({ uniqueId: 'COI_OPA_HEADER', content: { isCardExpanded: this.isCardExpanded }});
            setTimeout(() => {
                this.isScrolled = false;
            }, 50);
        }
    }

    constructor(public opaService: OpaService,
                public router: Router,
                public location: Location,
                public commonService: CommonService,
                private _activatedRoute: ActivatedRoute,
                private _navigationService: NavigationService,
                public dataStore: DataStoreService,
                private _sfiService: SfiService,
                public autoSaveService: AutoSaveService,
                private _headerService: HeaderService) {
    }

    async ngOnInit(): Promise<void> {
        this.isOpaReviewer = this.commonService.isOPAReviewer;
        this.autoSaveService.initiateAutoSave();
        this.checkForOPAAdmin();
        this.getDataFromStore();
        this.listenUrlChanges();
        this.listenToGlobalEventEmitter();
        this.listenDataChangeFromStore();
        this.subscribeSaveComplete();
        this.subscribeSaveAndSubmit();
        this.opaService.setTopDynamically();
        this.getApplicableForms();
        this.getCommentsCounts();
        this.fetchWorkFlowDetails([OPA_CHILD_ROUTE_URLS.ROUTE_LOG, OPA_CHILD_ROUTE_URLS.REVIEW]);
        this.isCardExpanded = !this.dataStore.isFormEditable();
        this.getDeptLevelAvailableRights();
        this.listenToOpenBypassModal();
        this.autoSaveSubscribe();
        this.openModalBasedOnActions();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
        this.autoSaveService.stopAutoSaveEvent();
        this.opaService.clearTimeOutIfExisting();
        this.opaService.isShowCreateEngSlider = false;
        this.commonService.clearReviewCommentsSlider();
        this.opaService.validationConfig = new ValidationConfig();
    }

    private listenUrlChanges(): void {
        this.$subscriptions.push(
            this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.handleUrlChange();
                }
            })
        );
    }

    private handleUrlChange(): void {
        const DISCLOSURE_ID = this._activatedRoute.snapshot.queryParams['disclosureId'];
        const OPA_DATA: OPA = this.dataStore.getData();
        if (!DISCLOSURE_ID) {
            this.router.navigate([], { queryParams: { disclosureId: OPA_DATA.opaDisclosure.opaDisclosureId } });
        } else if (DISCLOSURE_ID != OPA_DATA.opaDisclosure.opaDisclosureId) {
            this.fetchNewOpaAndUpdateStore(DISCLOSURE_ID);
        } else {
            this.rerouteIfWrongPath();
        }
    }

    private rerouteIfWrongPath(): void {
        let reRoutePath = '';
        if (this.router.url.includes(OPA_CHILD_ROUTE_URLS.REVIEW) && !this.isShowReviewTab) {
            reRoutePath = OPA_CHILD_ROUTE_URLS.FORM;
        }
        if (this.router.url.includes(OPA_CHILD_ROUTE_URLS.ROUTE_LOG) && !this.isShowRouteLogTab) {
            reRoutePath = OPA_CHILD_ROUTE_URLS.FORM;
        }
        if (reRoutePath) {
            this.router.navigate([reRoutePath], { queryParams: { disclosureId: this.opa?.opaDisclosure?.opaDisclosureId } });
        }
    }

    private fetchNewOpaAndUpdateStore(opaDisclosureId: number): void {
        this.$subscriptions.push(this.opaService.loadOPA(opaDisclosureId).subscribe((opaDisclosure: OpaDisclosure) => {
            this.opa.opaDisclosure = opaDisclosure;
            this.dataStore.setStoreData({ opaDisclosure });
            this.getFormAndRouteLog();
            this.getCommentsCounts();
        }, (error) => {
            if (error?.status !== 403) {
                this.goToHomeUrl();
            }
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private getCommentsCounts(): void {
        this.disclosureCommentsCountRO.moduleCode = OPA_MODULE_CODE;
        this.disclosureCommentsCountRO.documentOwnerPersonId = this.opa?.opaDisclosure?.personId;
        this.disclosureCommentsCountRO.moduleItemKey = this.opa?.opaDisclosure?.opaDisclosureId;
        this.$subscriptions.push(
            this.commonService.getDisclosureCommentsCount(this.disclosureCommentsCountRO)
                .subscribe((response: DisclosureCommentsCounts) => {
                    this.dataStore.updateStore(['disclosureCommentsCount'], { disclosureCommentsCount: response });
                }, (error: any) => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            )
        );
    }

    private getFormAndRouteLog(): void {
        this.fetchWorkFlowDetails([OPA_CHILD_ROUTE_URLS.ROUTE_LOG]);
        this.opaService.triggerForApplicableForms.next(true);
    }

    private fetchWorkFlowDetails(restrictedUrls: string[] = []): void {
        if (this.isShowRouteLogTab && (restrictedUrls.length === 0 || !restrictedUrls.some(url => this.router.url.includes(url)))) {
            this.$subscriptions.push(
                this.opaService.fetchWorkFlowDetails(OPA_MODULE_CODE, this.opa?.opaDisclosure?.opaDisclosureId)
                    .subscribe((workFlowResult: any) => {
                        workFlowResult.opaDisclosure = this.opa?.opaDisclosure;
                        this.dataStore.updateStore(['workFlowResult'], { workFlowResult });
                        this.rerouteIfWrongPath();
                    }, (error: any) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching route log.');
                    }));
        }
    }

    private getDataFromStore(): void {
        this.opa = this.dataStore.getData();
        if (!this.opa) return;
        this.setPersonProjectDetails();
        this.isDisclosureOwner = this.isLoggedInUser(this.opa.opaDisclosure?.personId);
        const IS_LOGGED_PERSON_ADMIN = this.isLoggedInUser(this.opa.opaDisclosure?.adminPersonId);
        const IS_ADMIN_PERSON_ADDED = !!this.opa?.opaDisclosure?.adminPersonId;
        const REVIEW_STATUS_CODE = this.opa.opaDisclosure?.reviewStatusType?.reviewStatusCode?.toString();
        const IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL = this.dataStore.getIsAdminOrCanManageAffiliatedDiscl();
        const CAN_MANAGE_DISCLOSURE = this.isOpaAdministrator && IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL;
        const { PENDING, SUBMITTED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED, ROUTING_IN_PROGRESS, COMPLETED } = OPA_REVIEW_STATUS;
        this.isShowRouteLogTab = REVIEW_STATUS_CODE !== PENDING.toString() && (['ROUTING_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.opaApprovalFlowType));
        this.isShowAdminDetails = ['ADMIN_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.opaApprovalFlowType);
        this.isShowApproveDisapproveBtn = REVIEW_STATUS_CODE === ROUTING_IN_PROGRESS.toString() && this.opa.workFlowResult?.canApproveRouting?.toString() === '1';
        this.isShowReviewTab = this.isReviewTabVisible();
        this.isShowAssignAdminBtn = CAN_MANAGE_DISCLOSURE && !IS_ADMIN_PERSON_ADDED && REVIEW_STATUS_CODE === SUBMITTED.toString();
        this.isShowReAssignAdminBtn = CAN_MANAGE_DISCLOSURE && IS_ADMIN_PERSON_ADDED && [REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED].map(status => status.toString()).includes(REVIEW_STATUS_CODE);
        this.isShowWithdrawBtn = [SUBMITTED, ROUTING_IN_PROGRESS].map(status => status.toString()).includes(REVIEW_STATUS_CODE) && this.isDisclosureOwner;
        this.isShowReturnBtn = IS_LOGGED_PERSON_ADMIN && [REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED].map(status => status.toString()).includes(REVIEW_STATUS_CODE);
        this.isShowCommentBtn = this.dataStore.getCommentButtonVisibility();
        this.isShowReviseButton = this.canShowReviseButton();
        const IS_REVIEW_ASSIGNED_IN_ROUTING_REVIEW = this.dataStore.isRoutingReview && [COMPLETED, ROUTING_IN_PROGRESS].map(status => status.toString()).includes(REVIEW_STATUS_CODE);
        this.isShowStartReviewBtn = this.opaService.isStartReview && (REVIEW_STATUS_CODE === REVIEW_ASSIGNED || IS_REVIEW_ASSIGNED_IN_ROUTING_REVIEW);
        this.isShowCompleteReviewBtn = this.opaService.isCompleteReview && (REVIEW_STATUS_CODE === REVIEW_ASSIGNED || IS_REVIEW_ASSIGNED_IN_ROUTING_REVIEW);
        this.isShowCompleteFinalReviewBtn = CAN_MANAGE_DISCLOSURE && IS_LOGGED_PERSON_ADMIN && [SUBMITTED, REVIEW_IN_PROGRESS, ASSIGNED_REVIEW_COMPLETED].map(status => status.toString()).includes(REVIEW_STATUS_CODE);
        this.isShowOverAllHistory = this.isDisclosureOwner || this.isShowReviewTab || this.commonService.getAvailableRight(OPA_DISCLOSURE_RIGHTS);
        this.rerouteIfWrongPath();
    }

    private isReviewTabVisible(): boolean {
        const { PENDING, SUBMITTED, WITHDRAWN, RETURNED, ROUTING_IN_PROGRESS } = OPA_REVIEW_STATUS;
        const IS_REVIEW_TAB_ALLOWED = this.commonService.getAvailableRight(OPA_REVIEW_RIGHTS);
        const STATUS_CODE = this.opa.opaDisclosure?.reviewStatusType?.reviewStatusCode?.toString();
        const DISALLOWED_STATUSES = [PENDING, ROUTING_IN_PROGRESS, WITHDRAWN, RETURNED, SUBMITTED].map(status => status.toString());
        const IS_STATUS_ALLOWED = !DISALLOWED_STATUSES.includes(STATUS_CODE) || (this.dataStore.isRoutingReview && STATUS_CODE === ROUTING_IN_PROGRESS.toString());
        const IS_ROUTE_LOG_PERSON = extractAllApprovers(this.opa?.workFlowResult)?.approverPersonIds?.includes(this.commonService.getCurrentUserDetail('personID'));
        const HAS_ROUTING = (['ROUTING_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this.commonService.opaApprovalFlowType));
        const CAN_ROUTE_LOG_PERSON_REVIEW = HAS_ROUTING && this.commonService.enableRouteLogUserAddOpaReviewer && IS_ROUTE_LOG_PERSON;
        const IS_USER_ALLOWED = IS_REVIEW_TAB_ALLOWED || this.opa?.isDepLevelAdmin || this.isOpaReviewer || this.opa?.hasDeptLevelReviewerRight || CAN_ROUTE_LOG_PERSON_REVIEW;
        const IS_FLOW_ELIGIBLE = this.commonService.opaApprovalFlowType !== 'NO_REVIEW';
        return IS_FLOW_ELIGIBLE && IS_USER_ALLOWED && IS_STATUS_ALLOWED;
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this.dataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private setAssignAdminModalDetails(): void {
        this.defaultAdminDetails.adminGroupId = this.opa.opaDisclosure.adminGroupId;
        this.defaultAdminDetails.adminGroupName = this.opa.opaDisclosure.adminGroupName;
        this.defaultAdminDetails.adminPersonId = this.opa.opaDisclosure.adminPersonId;
        this.defaultAdminDetails.adminPersonName = this.opa.opaDisclosure.adminPersonName;
    }

   private setPersonProjectDetails(): void {
        this.personProjectDetails.personFullName = this.opa?.opaDisclosure?.personName;
        this.personProjectDetails.homeUnit = this.opa?.opaDisclosure?.homeUnit;
        this.personProjectDetails.homeUnitName = this.opa?.opaDisclosure?.homeUnitName;
        this.personProjectDetails.personEmail = this.opa?.opaDisclosure?.personEmail;
        this.personProjectDetails.personPrimaryTitle = this.opa?.opaDisclosure?.opaPerson?.jobTitle;
        this.personProjectDetails.unitDisplayName = this.opa?.opaDisclosure?.unitDisplayName;
        this.personProjectDetails = { ...this.personProjectDetails };
    }

    private listenToGlobalEventEmitter(): void {
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data.uniqueId === 'ACTIVATE_DEACTIVATE_ENG_MODAL' && data.content?.action === 'ACTIVATE_DEACTIVATE_SUCCESS') {
                this.opaService.triggerEngagementDataChange();
            }
            if (data.uniqueId === 'TRIGGER_OPA_FORM_ACTIONS') {
                if (data?.content?.triggeredFrom === 'ACTIVATE_DEACTIVATE_ENGAGEMENT') {
                    this.openActivateDeactivateEngModal(data.content.engagementDetails);
                }
                if (data?.content?.triggeredFrom === 'MODIFY_ENGAGEMENT') {
                    this.modifyEngagementDetails(data.content.engagementDetails.personEntityId, data.content.engagementDetails.personEntityNumber);
                }
            }
            // This emitter will be triggered either when the comment slider closes or when the API request fails.
            if (data?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(data?.content?.action)) {
                    this.getCommentsCounts();
                    this.commonService.clearReviewCommentsSlider();
                }
            }
            // This emitter is for validation modal action.
            if (data.uniqueId === 'OPA_VALIDATION_MODAL') {
                switch (data.content.modalAction.action) {
                    case 'CLOSE_BTN':
                    case 'CANCEL_BTN':
                    case 'SECONDARY_BTN':
                        this.commonService.closeCOIValidationModal();
                        break;
                    case 'PRIMARY_BTN':
                        this.openApproveOrByPassModal();
                        break;
                    default:
                        break;
                }
            }
            // This emitter will open the recalll/return modal based on action.
            if (data?.uniqueId === 'DOC_ACTION_STORAGE_EVENT') {
                this.openModalBasedOnActions();
            }
        }));
    }

    private openActivateDeactivateEngModal(engagementDetails: any): void {
        if (!this.isActionPerforming) {
            this.isActionPerforming = true;
            this.$subscriptions.push(this.opaService.getEngagementDetails(engagementDetails?.personEntityId)
                .subscribe((res: any) => {
                    this.isActionPerforming = false;
                    this.opaService.engActivateInactivateModal = {
                        entityName: res?.personEntity?.entityName,
                        relationshipDetails: this.getRelationshipDetails(res?.personEntity?.personEntityRelationships),
                        updatedRelationshipStatus: res?.personEntity?.versionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                        personEntityNumber: res?.personEntity?.personEntityNumber,
                        personEntityId: res?.personEntity?.personEntityId,
                        isSignificantFinInterest: res?.personEntity?.isSignificantFinInterest
                    }
                }, _err => {
                    this.isActionPerforming = false;
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
        }
    };

    private getRelationshipDetails(personEntityRelationships: any): any[] {
        const a = [];
        if (personEntityRelationships?.length) {
            personEntityRelationships.forEach((ele) => {
                a.push(ele.validPersonEntityRelType);
            })
        }
        return a;
    }

    private modifyEngagementDetails(personEntityId: number | string, personEntityNumber: number | string): void {
        if (!this.isActionPerforming) {
            this.isActionPerforming = true;
            this.$subscriptions.push(
                this.opaService.modifyEngagement({ personEntityId, personEntityNumber })
                    .subscribe((res: any) => {
                        this.isActionPerforming = false;
                        this.router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: res.personEntityId, personEntityNumber: res.personEntityNumber, mode: 'E' } });
                    }, (error: any) => {
                        this.isActionPerforming = false;
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to modify engagement. Please try again');
                    }));
        }
    }

    private opaSubmissionModal(): void {
        this.isSubmitClicked = true;
        this.validationList = [];
        this.validateForm();
    }

    private subscribeSaveAndSubmit(): void {
        this.$subscriptions.push(this.opaService.triggerForSaveAndSubmit.subscribe((data: any) => {
            this.opaSubmissionModal();
        }))
    }

    private setApproveOrRejectWorkflowRO(): void {
        this.approveOrRejectWorkflowRO.opaDisclosureId = this.opa.opaDisclosure.opaDisclosureId;
        this.approveOrRejectWorkflowRO.opaDisclosureNumber = this.opa.opaDisclosure.opaDisclosureNumber;
        this.approveOrRejectWorkflowRO.personId = this.commonService.getCurrentUserDetail('personID');
        this.approveOrRejectWorkflowRO.workFlowPersonId = this.commonService.getCurrentUserDetail('personID');
        this.approveOrRejectWorkflowRO.updateUser = this.commonService.getCurrentUserDetail('userName');
        this.approveOrRejectWorkflowRO.approverStopNumber = null;
    }

    private approveOrRejectWorkflow(): void {
        this.setApproveOrRejectWorkflowRO();
        if (this.validateWorkFlowApproveReject()) {
            this.$subscriptions.push(
                this.opaService.approveOrRejectWorkflow(this.approveOrRejectWorkflowRO, this.WorkflowUploadedFiles)
                    .subscribe((res: any) => {
                        this.commonService.showToast(HTTP_SUCCESS_STATUS, `OPA ${ this.approveOrRejectWorkflowRO.actionType === 'A' ? 'approved' : 'returned' } successfully.`);
                        if (this.approveOrRejectWorkflowRO.actionType === 'R') {
                            this.goToHomeUrl();
                        } else {
                            const WOK_FLOW_RESPONSE = this.opaService.workFlowResponse(res, this.opa.workFlowResult, this.opa.opaDisclosure);
                            this.dataStore.updateStore(['opaDisclosure', 'workFlowResult'], WOK_FLOW_RESPONSE);
                        }
                        this.closeWorkFlowModal();
                    }, (error: any) => {
                        if (error?.status === 405) {
                            closeCommonModal(this.workFlowConfirmModalId);
                            this.commonService.concurrentUpdateAction = 'OPA disclosure';
                        } else {
                            this.commonService.showToast(HTTP_ERROR_STATUS, `Error in ${ this.approveOrRejectWorkflowRO.actionType === 'A' ? 'approving' : 'returning' } disclosure.`);
                        }
                    }));
        }
    }

    private closeWorkFlowModal(): void {
        closeCommonModal(this.workFlowConfirmModalId);
        const TIME_OUT = setTimeout(() => {
            this.approveOrRejectWorkflowRO = new OPAApproveOrRejectWorkflowRO();
            this.workFlowConfirmModalConfig.namings.primaryBtnName = '';
            this.attachmentErrorMsg = null;
            this.WorkflowUploadedFiles = [];
            this.workFlowMandatoryList.clear();
            clearTimeout(TIME_OUT);
        }, 200);
    }

    private deleteSFI(): void {
        if (!this.isActionPerforming) {
            this.isActionPerforming = true;
            this.$subscriptions.push(
                this._sfiService.deleteSFI(this.opaService.deleteEngagementModalDetails?.engagementDetails?.personEntityId)
                    .subscribe((data: PersonEntityDto) => {
                        this.isActionPerforming = false;
                        this.opaService.triggerEngagementDataChange();
                        this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Engagement deleted successfully.');
                    }, (error: any) => {
                        this.isActionPerforming = false;
                        if (error.status === 405) {
                            this.opaService.closeEngDeleteConfirmModal();
                            this.commonService.concurrentUpdateAction = 'engagement delete';
                        } else {
                            this.commonService.showToast(HTTP_ERROR_STATUS, 'Engagement deletion canceled.');
                        }
                    }
                ));
        }
    }

    private async getDeptLevelAvailableRights(): Promise<void> {
        const IS_DEPT_LEVEL_ADMIN: Record<string, boolean> = await this.commonService.getDeptLevelAvailableRights(this.opa?.opaDisclosure?.homeUnit, [OPA_DEPT_ADMIN_RIGHT, OPA_MAINTAIN_REVIEWER_RIGHT]);
        this.dataStore.updateStore(['isDepLevelAdmin', 'hasDeptLevelReviewerRight'], { 
            isDepLevelAdmin: IS_DEPT_LEVEL_ADMIN?.[OPA_DEPT_ADMIN_RIGHT] || false,
            hasDeptLevelReviewerRight: IS_DEPT_LEVEL_ADMIN?.[OPA_MAINTAIN_REVIEWER_RIGHT] || false
        });
    }

    private validateOPA(): void {
        if (this.dataStore.isRoutingReview && this.opa.workFlowResult.isFinalApprovalPending) {
            this.$subscriptions.push(this.opaService.validateOPA(this.opa.opaDisclosure.opaDisclosureId).subscribe((data: any[]) => {
                (data?.length) ? this.openCreateConfirmationModal(data) : this.openApproveOrByPassModal();
            }, error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in validating OPA.');
            }));
        } else {
            this.openApproveOrByPassModal();
        }
    }

    private openApproveOrByPassModal(): void {
        this.commonService.closeCOIValidationModal();
        this.validationAction === 'APPROVE' ? this.approveOPARouting() : this.opaService.$byPassValidationEvent.next({actiontype: 'OPEN_BYPASS_MODAL', content: this.routingBypassRO});
    }

    private openCreateConfirmationModal(validations): void {
        const CONFIG = new COIValidationModalConfig();
        CONFIG.triggeredFrom = 'OPA_VALIDATION_MODAL';
        CONFIG.errorMsgHeader = 'Attention';
        CONFIG.validationType = 'ACTIONABLE';
        CONFIG.errorList = validations?.filter(item => item.validationType === 'VE')?.map(item => item.validationMessage);
        CONFIG.warningList = validations?.filter(item => item.validationType === 'VW')?.map(item => item.validationMessage);
        if (!CONFIG.errorList.length) {
            CONFIG.modalConfig.namings.primaryBtnName = `Continue to ${this.validationAction === 'APPROVE' ? 'Approve' : 'Bypass'}`;
        }
        CONFIG.modalConfig.styleOptions.closeBtnClass = 'invisible';
        this.commonService.openCOIValidationModal(CONFIG);
    }

    private listenToOpenBypassModal(): void {
        this.validationAction = null;
        this.routingBypassRO = new RoutingBypassRO();
        this.$subscriptions.push(this.opaService.$byPassValidationEvent.subscribe((data: BypassValidateAction) => {
            if (data?.actiontype === 'BYPASS_STOP') {
                this.routingBypassRO = data?.content;
                this.routingAction('BYPASS');
            }
        }));
    }

    certifyAndSubmit(): void {
        this.opaService.triggerForSaveAndSubmit.next('CERTIFY_AND_SUBMIT');
    }

    saveAndSubmit() {
        this.submitOPA();
    }

    subscribeSaveComplete() {
        this.$subscriptions.push(this.opaService.triggerSaveComplete.subscribe((data: any) => {
            this.commonService.setChangesAvailable(false);
            if (Array.isArray(data?.result)) {
                this.opa.opaDisclosure.updateTimestamp = data?.result?.[0]?.updateTimestamp;
            } else {
                this.opa.opaDisclosure.updateTimestamp = data?.result?.updateTimestamp;
            }
            this.dataStore.updateStore(['opaDisclosure'], {opaDisclosure: this.opa.opaDisclosure});
            this.opaService.isFormBuilderDataChangePresent = false;
            this.autoSaveService.updatedLastSaveTime(this.opa.opaDisclosure.updateTimestamp, true);
            if(this.opaService.isAnyAutoSaveFailed) {
                this.autoSaveService.commonSaveTrigger$.next({ action: 'RETRY' });
            }
        }));
    }

    submitOPA() {
        if (!this.isActionPerforming) {
            this.isActionPerforming = true;
            this.$subscriptions.push(
                this.opaService.submitOPA(this.opa.opaDisclosure.opaDisclosureId, this.opa.opaDisclosure.opaDisclosureNumber, this.opa.opaDisclosure.versionNumber)
                    .subscribe((res: any) => {
                        this.isActionPerforming = false;
                        this.opa.opaDisclosure = res;
                        this.isSubmitClicked = false;
                        this.dataStore.updateStore(['opaDisclosure'], {opaDisclosure: this.opa.opaDisclosure});
                        this.getFormAndRouteLog();
                        this.getCommentsCounts();
                        this.commonService.showToast(HTTP_SUCCESS_STATUS, `OPA submitted successfully.`);
                        this.router.navigate([OPA_CHILD_ROUTE_URLS.FORM], { queryParams: { disclosureId: this.opa?.opaDisclosure?.opaDisclosureId } });
                    }, err => {
                        this.isSubmitClicked = false;
                        this.isActionPerforming = false;
                        if (err?.status === 405) {
                            this.commonService.concurrentUpdateAction = 'OPA disclosure';
                        } else if (err?.status === 406) {
                            this._headerService.triggerDisclosureValidationModal(err?.error);
                        } else {
                            const MSG = 'Failed to submit OPA disclosure. Please try again later.';
                            this.commonService.showToast(HTTP_ERROR_STATUS, MSG);
                        }
                    }));
        }
    }

    openAddAssignModal(): void {
        this.isAddAssignModalOpen = true;
        this.setAssignAdminModalDetails();
    }

    closeAssignAdministratorModal(event) {
        if (event && (event.adminPersonId || event.adminGroupId)) {
            // this.getCoiReview();
            this.opa.opaDisclosure = event;
            this.dataStore.updateStore(['opaDisclosure'], this.opa);
        }
        this.isAddAssignModalOpen = false;
    }

    openConfirmationModal(actionBtnName: string, helpTexts: string = '', descriptionErrorMsg: string = '', modalHelpText: string = ''): void {
        this.primaryBtnName = actionBtnName;
        this.descriptionErrorMsg = descriptionErrorMsg;
        this.textAreaLabelName = actionBtnName === 'Recall' ? ' Recall' : 'Return';
        this.setPersonProjectDetails();
        this.confirmationHelpTexts = '';
        this.helpTexts = '';
        setTimeout(() => {
            this.confirmationHelpTexts = modalHelpText;
            this.helpTexts = helpTexts;
            document.getElementById('disclosure-confirmation-modal-trigger-btn').click();
        });
    }

    performDisclosureAction(event): void {
        this.description = event;
        switch (this.primaryBtnName) {
            case 'Return':
                return this.returnDisclosure(event);
            case 'Recall':
                return this.withdrawDisclosure(event);
            default:
                return;
        }
    }

    returnDisclosure(event) {
        if (!this.isActionPerforming) {
            this.isActionPerforming = true;
            this.$subscriptions.push(
                this.opaService.returnOPA(this.getRequestObj(event))
                    .subscribe((res: any) => {
                        this.opa.opaDisclosure = res;
                        this.isActionPerforming = false;
                        this.dataStore.updateStore(['opaDisclosure'], this.opa);
                        this.commonService.showToast(HTTP_SUCCESS_STATUS, `OPA returned successfully.`);
                        this.goToHomeUrl();
                    }, _err => {
                        this.isActionPerforming = false;
                        this.commonService.showToast(HTTP_ERROR_STATUS, `Error in returning OPA.`);
                    }));
        }
    }

    goToHomeUrl() {
        // TODO admin/reviewer/pi based redirect once rights are implemented.
        this.isHomeClicked = true;
        const reRouteUrl = this.opaService.previousHomeUrl || REPORTER_HOME_URL;
        this.router.navigate([reRouteUrl]);
    }

    withdrawDisclosure(event) {
        if (!this.isActionPerforming) {
            this.isActionPerforming = true;
            this.$subscriptions.push(
                this.opaService.withdrawOPA(this.getRequestObj(event))
                    .subscribe((res: any) => {
                        this.opa.opaDisclosure = res;
                        this.isActionPerforming = false;
                        this.dataStore.updateStore(['opaDisclosure'], this.opa);
                        this.commonService.showToast(HTTP_SUCCESS_STATUS, `OPA Recalled successfully.`);
                        this.getFormAndRouteLog();
                        this.router.navigate([OPA_CHILD_ROUTE_URLS.FORM], { queryParams: { disclosureId: this.opa?.opaDisclosure?.opaDisclosureId } });
                    }, err => {
                        this.isActionPerforming = false;
                        if (err.status === 405) {
                            hideModal('disclosure-confirmation-modal');
                            this.commonService.concurrentUpdateAction = 'OPA disclosure';
                        } else {
                            this.commonService.showToast(HTTP_ERROR_STATUS, `Error in Recalling disclosure.`);
                        }
                    }));
        }
    }

    getRequestObj(description) {
        return {
            'opaDisclosureId' : this.opa.opaDisclosure.opaDisclosureId,
            'opaDisclosureNumber' : this.opa.opaDisclosure.opaDisclosureNumber,
            'comment': description
        }
    }

    openPersonDetailsModal(): void {
        this.commonService.openPersonDetailsModal(this.opa.opaDisclosure.personId)
    }

    completeDisclosureReview(): void {
        this.$subscriptions.push(this.opaService
            .completeOPAReview(this.opa?.opaDisclosure?.opaDisclosureId, this.opa?.opaDisclosure?.opaDisclosureNumber, this.reviewDescription)
            .subscribe((res: any) => {
                this.opa.opaDisclosure.reviewStatusType = res.reviewStatusType;
                this.opa.opaDisclosure.dispositionStatusType = res.dispositionStatusType;
                this.opa.opaDisclosure.reviewStatusCode = res.reviewStatusCode;
                this.dataStore.updateStore(['opaDisclosure'], {opaDisclosure: this.opa.opaDisclosure});
                this.commonService.showToast(HTTP_SUCCESS_STATUS, `Review completed successfully.`);
            }, _err => {
                // if (_err.error.text === 'REVIEW_STATUS_NOT_COMPLETE') {
                //     document.getElementById('reviewPendingCompleteReviewErrorModalTrigger').click();
                // } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error in completing review.`);
                // }
            }));
        this.clearCompleteReviewModal();
    }

    clearCompleteReviewModal(): void {
        this.reviewDescription = '';
    }

    updateOpaReview(modalType: ModalType) {
        const reviewerInfo = this.opa.opaReviewerList.find(ele =>
            ele.assigneePersonId === this.commonService.currentUserDetails.personID && ele.reviewStatusTypeCode != '3');
        if (reviewerInfo) {
            this.opaService.$SelectedReviewerDetails.next(reviewerInfo);
            this.opaService.triggerStartOrCompleteCoiReview(modalType);
            this.opaService.isEnableReviewActionModal = true;
        }
    }

    checkForOPAAdmin() {
        this.isOpaAdministrator =  this.commonService.getAvailableRight(['MANAGE_OPA_DISCLOSURE']);
    }

    isLoggedInUser(personId: string): boolean {
        return this.commonService.getCurrentUserDetail('personID') === personId;
    }

    openSlider(type, count) {
        if(count) {
            this.showSlider = true;
            this.selectedType = type;
        }
    }

    closeHeaderSlider(event: any): void {
        if (event?.concurrentUpdateAction) {
            this.commonService.concurrentUpdateAction = event.concurrentUpdateAction;
        } else {
            this.showSlider = false;
            this.selectedType = '';
        }
    }

    openReviewComment(): void {
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: OPA_GENERAL_COMMENTS.componentTypeCode,
            moduleItemKey: this.opa?.opaDisclosure?.opaDisclosureId,
            moduleItemNumber: this.opa?.opaDisclosure?.opaDisclosureNumber,
            subModuleCode: null,
            subModuleItemKey: null,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: this.opa?.opaDisclosure?.personId,
        };
        this.opaService.setReviewCommentSliderConfig(REQ_BODY);
    }

    leavePageClicked() {
        this.opaService.isFormBuilderDataChangePresent = false;
        if (this.isHomeClicked) {
           this.goToHomeUrl();
        } else {
            this.router.navigateByUrl(this._navigationService.navigationGuardUrl);
        }
    }

    collapseHeader(): void {
        this.isCardExpanded=!this.isCardExpanded;
        this.isUserCollapse=!this.isUserCollapse;
        this.isManuallyExpanded = this.isCardExpanded;
        this.opaService.setTopDynamically();
        setTimeout (() => {
            this.commonService.$globalEventNotifier.next({uniqueId: 'COI_OPA_HEADER', content: { isCardExpanded: this.isCardExpanded }});
        });
    }

    private validateForm(): void {
        const formBuilderId = [];
        formBuilderId.push(this.formId);
        this.commonService.validateForm({
            formBuilderIds: formBuilderId,
            moduleItemCode: '23',
            moduleSubItemCode: '0',
            moduleItemKey: this.opa.opaDisclosure.opaDisclosureId.toString(),
            moduleSubItemKey: '0',
        }).subscribe((data: any) => {
            this.validationList = [...arrangeFormValidationList(data)];
            this._headerService.$globalPersistentEventNotifier.$formValidationList.next(this.validationList);
            if (!this.validationList.length && this.isSubmitClicked) {
                openModal('opa-submit-confirm-modal');
            }
        }, err => {
            this.commonService.showToast(HTTP_ERROR_STATUS, `Error occurred during form validation.`);
        });
    }

    openHistorySlider (): void {
        this.isShowCompleteDisclHistory = true;
    }

    closeCompleteDisclosureHistorySlider (): void {
        this.isShowCompleteDisclHistory = false;
    }

    private getApplicableForms(): void {
        this.$subscriptions.push(this.opaService.triggerForApplicableForms.subscribe((data: any) => {
            const REQ_OBJ = this.commonService.getApplicableFormRO(OPA_MODULE_CODE.toString(), OPA_SUB_MODULE_CODE.toString(), this.opa?.opaDisclosure?.personId, this.opa?.opaDisclosure?.opaDisclosureId?.toString());
            this.commonService.getApplicableForms(REQ_OBJ).subscribe((data: any) => {
                this.formList = data || [];
                this.setFormStatus();
                this.getFormId(this.formList[0]);
            },err => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            });
        }));
    }

    private setFormStatus(): void {
        this.formList.forEach((form: any) => {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                this.opaService.formStatusMap.set(form?.answeredFormId, 'N');
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                this.opaService.answeredFormId = form?.answeredFormId;
                this.opaService.formStatusMap.set(form?.activeFormId, 'Y');
            } else {
                this.opaService.formStatusMap.set(form?.activeFormId, 'N');
            }
        });
    }

    private getFormId(form: any): void {
        if (this.dataStore.isFormEditable()) {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                this.formId = form?.answeredFormId;
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                this.formId = form?.activeFormId;
            } else {
                this.formId = form?.activeFormId;
            }
        } else {
            this.formId = form?.answeredFormId || form?.activeFormId;
        }
        this.opaService.triggerFormId.next(this.formId);
    }

    /**
     * Opens action modals based on document actions stored in  sessionStorage.
     */
    private openModalBasedOnActions(): void {
        const DOCUMENT_ACTION: DocumentActionStorageEvent = this._headerService.getDocActionStorageEvent();
        if (DOCUMENT_ACTION?.targetModule === 'OPA_DISCLOSURE') {
            if (this.isShowWithdrawBtn && DOCUMENT_ACTION.action === 'REVISE' ) {
                if (DOCUMENT_ACTION.isModalRequired) {
                    this.openConfirmationModal('Recall', this.withdrawHelpTexts, this.withdrawErrorMsg, this.withdrawModalHelpText);
                } else {
                    this.withdrawDisclosure('');
                }
            }
            this._headerService.removeDocActionStorageEvent();
        }
    }
    
    closeActivateInactivateSfiModal(event) {
        this.opaService.engActivateInactivateModal = {
            personEntityId: null,
            entityName: null,
            personEntityNumber: null,
            relationshipDetails: null,
            updatedRelationshipStatus: null,
            isSignificantFinInterest: false
        };
    }

    approveOPARouting(): void {
        this.approveOrRejectWorkflowRO.actionType = 'A';
        this.workFlowConfirmModalConfig.namings.primaryBtnName = 'Approve';
        openCommonModal(this.workFlowConfirmModalId);
    }

    disapproveOPARouting(): void {
        this.approveOrRejectWorkflowRO.actionType = 'R';
        this.workFlowConfirmModalConfig.namings.primaryBtnName = 'Return';
        openCommonModal(this.workFlowConfirmModalId);
    }

    postWorkFlowConfirmation(modalActions: ModalActionEvent): void {
        if (modalActions.action === 'PRIMARY_BTN') {
            this.approveOrRejectWorkflow();
        } else {
            this.closeWorkFlowModal();
        }
    }

    validateWorkFlowApproveReject(): boolean {
        this.workFlowMandatoryList.clear();
        this.approveOrRejectWorkflowRO.approveComment = this.approveOrRejectWorkflowRO.approveComment?.trim();
        if (!this.approveOrRejectWorkflowRO.approveComment) {
            this.workFlowMandatoryList.set('COMMENT', `Please enter the reason for ${this.approveOrRejectWorkflowRO.actionType === 'A' ? 'approval' : 'return'}.`)
        }
        return this.workFlowMandatoryList.size === 0;
    }

    /**
     * @param  {} files
     * Check file duplication ,if no duplication insert it into an array
     */
    fileDrop(files: any): void {
        this.attachmentErrorMsg = null;
        let dupCount = 0;
        for (let index = 0; index < files?.length; index++) {
            if (this.WorkflowUploadedFiles.find(dupFile => dupFile?.name === files[index]?.name) != null) {
                dupCount = dupCount + 1;
                this.attachmentErrorMsg = '* ' + dupCount + ' File(s) already added';
            } else {
                this.WorkflowUploadedFiles.push(files[index]);
            }
        }
    }

    deleteFromUploadedFileList(index: number): void {
        this.WorkflowUploadedFiles.splice(index, 1);
        this.attachmentErrorMsg = null;
    }

    navigateToDashboard(){
        this.router.navigate(['/coi/user-dashboard']);
    }

    routeToOpaOrUserDashboard(): void {
        if(this.opaService.previousOPARouteUrl.includes(OPA_DASHBOARD_ROUTE_URL)) {
            this.router.navigate([OPA_DASHBOARD_ROUTE_URL]);
        } else if(this.opaService.previousOPARouteUrl.includes(REVIEWER_ADMIN_DASHBOARD_BASE_URL)) {
            this.router.navigate([REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS.DISCLOSURE_LIST]);
        }
        else {
            this.router.navigate([USER_DASHBOARD_CHILD_ROUTE_URLS.MY_DISCLOSURES_ROUTE_URL]);
        }
    }

    postEngDeleteConfirmation(modalActions: ModalActionEvent): void {
        if (modalActions.action === 'PRIMARY_BTN') {
            this.deleteSFI();
        } else {
            this.opaService.closeEngDeleteConfirmModal();
        }
    }

    reviseOPA(): void {
        this._headerService.triggerOPACreation('REVISION');
    }

    private canShowReviseButton(): boolean{
        const IS_PERIODIC_FREQUENCY = this.commonService.opaFrequency === 'PERIODIC';
        const IS_DATE_BETWEEN_PERIOD = this.commonService.getDateIsBetweenPeriod(this.opa?.opaDisclosure);
        const IS_APPROVED = this.opa?.opaDisclosure?.dispositionStatusType?.dispositionStatusCode === this.opaDispositionStatus?.APPROVED;
        const IS_REPORTER = this.opa?.opaDisclosure?.personId === this.commonService.getCurrentUserDetail('personID');
        const IS_ACTIVE = this.opa?.opaDisclosure?.versionStatus === 'ACTIVE';
        const CAN_CREATE_OPA = this.commonService.canCreateOPA;
        return CAN_CREATE_OPA && IS_REPORTER && IS_APPROVED && IS_ACTIVE &&((IS_PERIODIC_FREQUENCY && IS_DATE_BETWEEN_PERIOD) || !IS_PERIODIC_FREQUENCY);
    }

    routingAction(action: 'APPROVE' | 'BYPASS'): void {
        this.validationAction = action;
        this.validateOPA();
    }

    private autoSaveSubscribe(): void {
        this.$subscriptions.push(this.autoSaveService.autoSaveTrigger$.subscribe((event: AutoSaveEvent) => {
                this.isSubmitClicked = false;
                this.opaService.formBuilderEvents.next({ eventType: 'SAVE' });
            }
        ));
    }

    openPrintDisclosureModal(): void {
        const { opaDisclosureId,  opaDisclosureNumber, versionNumber, personName } = this.opa?.opaDisclosure || {};
        const DISCLOSURE_NAME = versionNumber === OPA_INITIAL_VERSION_NUMBER ? 'OPA - Initial' : 'OPA - Revision';
        this.printModalConfig = new PrintModalConfig();
        this.printModalConfig.moduleItemKey = opaDisclosureId;
        this.printModalConfig.moduleItemCode = OPA_MODULE_CODE;
        this.printModalConfig.moduleItemNumber = opaDisclosureNumber;
        this.printModalConfig.moduleSubItemCode = OPA_SUB_MODULE_CODE;
        this.printModalConfig.modalConfig.namings.modalName = 'opa-discl-print-modal';
        this.printModalConfig.modalHeaderText = 'Print ' + DISCLOSURE_NAME + ' Disclosure';
        this.printModalConfig.helpTextConfig = { subSectionId: '232', elementId: 'opa-print-modal-header' };
        this.printModalConfig.templateLabel = 'Choose a template to print ' + DISCLOSURE_NAME + ' disclosure';
        this.printModalConfig.fileName = DISCLOSURE_NAME + '-disclosure-' + opaDisclosureId + '-' + personName;
        this.printModalConfig.isOpenPrintModal = true;
    }

    printModalClosed(): void {
        this.printModalConfig = new PrintModalConfig();
    }

}
