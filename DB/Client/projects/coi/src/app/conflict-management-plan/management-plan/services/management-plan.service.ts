import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';
import { CommonModalConfig } from '../../../shared-components/common-modal/common-modal.interface';
import { FormBuilderEvent } from '../../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { ValidationConfig } from '../../../configuration/form-builder-create/shared/form-validator/form-validator.interface';
import { CMP_BASE_URL, CMP_CHILD_ROUTE_URL, CMP_MODULE_CONFIGURATION_CODE, CMP_STATUS, CMP_TYPE, COI_CMP_MODULE_CODE, COI_CMP_SUB_MODULE_CODE } from '../../shared/management-plan-constants';
import {
    CmpAttachmentReplaceRO,
    CmpAttachmentSaveRO,
    CmpBuilder, CmpBuilderComponent, CmpBuilderComponentRO, CmpBuilderRecipient, CmpBuilderRecipientRO,
    CmpBuilderSection, CmpBuilderSectionRO, CmpConfirmationModal, CmpEntity,
    CmpHeader, CmpLocationReviewType, CmpPlan, CmpProject, CmpReviewLocation, CmpRouteGuard, UpdateCmpStatusRO
} from '../../shared/management-plan.interface';
import { ScrollSpyConfiguration, ScrollSpyEvent } from '../../../shared-components/scroll-spy/scroll-spy.interface';
import { deepCloneObject, openCommonModal } from '../../../common/utilities/custom-utilities';
import { ManagementPlanDataStoreService } from './management-plan-data-store.service';
import { COIReviewCommentsSliderConfig, FetchReviewCommentRO } from '../../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COIReviewCommentsConfig } from '../../../shared-components/coi-review-comments/coi-review-comments.interface';
import {
    CMP_GENERAL_COMMENTS, CMP_REVIEW_COMMENTS_COMPONENT_GROUP,
    CMP_REVIEW_COMMENTS_COMPONENT_SORT, MANAGE_CMP_COMMENT, MANAGE_CMP_RESOLVE_COMMENTS,
    MANAGE_PRIVATE_CMP_COMMENT
} from '../../../shared-components/coi-review-comments/coi-review-comments-constants';
import { Router } from '@angular/router';
import { CMP_LOCALIZE } from '../../../app-locales';

export type ManagementPlanActionType = 'FORM_SUBMIT' | 'FORM_SAVE_COMPLETE' | 'CERTIFY_AND_SUBMIT' | 'ADD_NEW_SECTION' | 'REFRESH_CMP' | 'LOCATION_REVIEW_UPDATE'
    | 'TRIGGER_CREATE_TASK_MODAL' | 'TRIGGER_SCROLL_TO_TASK';

@Injectable()
export class ManagementPlanService {

    previousHomeUrl = '';
    previousRouteUrl = '';
    validationList = [];
    formBuilderId: number;
    answeredFormId: number;
    isAnyAutoSaveFailed = false;
    isShowOverallHistory = false;
    isFormBuilderDataChangePresent = false;
    validationConfig = new ValidationConfig();
    confirmationModal = new CmpConfirmationModal();
    formBuilderEvents = new Subject<FormBuilderEvent>();
    cmpTopTimeout: ReturnType<typeof setTimeout>;
    unSavedConfirmModalConfig = new CommonModalConfig('cmp-unsaved-confirm-modal', 'Stay On Page', 'Leave Page');
    elementVisiblePercentageList: number[] = [];
    scrollSpyConfiguration = new ScrollSpyConfiguration();
    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();
    isNavigateToTask = false;

    constructor(private _router: Router,
        private _http: HttpClient,
        private _commonService: CommonService,
        private _managementPlanDataStore: ManagementPlanDataStoreService) { }

    fetchEntireManagementPlan(cmpId: string | number): Observable<CmpRouteGuard> {
        const IS_SECTION_CONFIG_ALREADY_FETCHED = Object.keys(this._managementPlanDataStore.moduleSectionConfig)?.length > 0;
        return forkJoin({
            SECTION_CONFIG: IS_SECTION_CONFIG_ALREADY_FETCHED ? of(undefined) : this._commonService.getDashboardActiveModules(CMP_MODULE_CONFIGURATION_CODE),
            CMP_HEADER: this.fetchManagementPlanById(cmpId),
            ENTITY_DATA: this.fetchManagementPlanEntitiesById(cmpId),
            PROJECT_DATA: this.fetchManagementPlanProjectsById(cmpId),
            PERSON_TASK: this.getUserTask(cmpId),
            REVIEWERS_LIST: this.fetchCmpReviews(cmpId),
        });
    }

    triggerManagementPlanSave(): void {
        this.formBuilderEvents.next({ eventType: 'SAVE' });
    }

    triggerManagementPlanActions(actionType: ManagementPlanActionType, data?: any) {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_USER_CMP_ACTIONS', content: { actionType: actionType, ...data } });
    }

    fetchManagementPlanById(cmpId: string | number): Observable<CmpPlan> {
        return this._http.get<CmpPlan>(`${this._commonService.baseUrl}/cmp/plan/${cmpId}`);
    }

    fetchManagementPlanEntitiesById(cmpId: string | number): Observable<CmpEntity[]> {
        return this._http.get<CmpEntity[]>(`${this._commonService.baseUrl}/cmp/plan/${cmpId}/entity/rel`);
    }

    fetchManagementPlanProjectsById(cmpId: string | number): Observable<CmpProject[]> {
        return this._http.get<CmpProject[]>(`${this._commonService.baseUrl}/cmp/plan/${cmpId}/project/rel`);
    }

    fetchCmpBuilderSections(cmpId: string | number): Observable<CmpBuilder> {
        return this._http.get<CmpBuilder>(`${this._commonService.baseUrl}/cmp/plan/${cmpId}/section/hierarchy`);
    }

    saveCmpBuilderSection(params: CmpBuilderSectionRO): Observable<CmpBuilderSection> {
        return this._http.post<CmpBuilderSection>(`${this._commonService.baseUrl}/cmp/plan/section/rel`, params);
    }

    updateCmpBuilderSection(params: CmpBuilderSectionRO): Observable<CmpBuilderSection> {
        return this._http.put<CmpBuilderSection>(`${this._commonService.baseUrl}/cmp/plan/section/rel`, params);
    }

    deleteCmpBuilderSection(cmpSectionRelId: string | number): Observable<any> {
        return this._http.delete<any>(`${this._commonService.baseUrl}/cmp/plan/section/rel/${cmpSectionRelId}`);
    }

    saveCmpBuilderComponent(params: CmpBuilderComponentRO): Observable<CmpBuilderComponent> {
        return this._http.post<CmpBuilderComponent>(`${this._commonService.baseUrl}/cmp/plan/section/comp`, params);
    }

    updateCmpBuilderComponent(params: CmpBuilderComponentRO): Observable<CmpBuilderComponent> {
        return this._http.put<CmpBuilderComponent>(`${this._commonService.baseUrl}/cmp/plan/section/comp`, params);
    }

    deleteCmpBuilderComponent(secCompId: string | number): Observable<any> {
        return this._http.delete<any>(`${this._commonService.baseUrl}/cmp/plan/section/comp/${secCompId}`);
    }

    getCmpSectionHistory(cmpSectionRelId: string | number): Observable<any> {
        return this._http.get<any>(`${this._commonService.baseUrl}/cmp/plan/section/rel/${cmpSectionRelId}/history`);
    }

    getCmpComponentHistory(secCompId: string | number): Observable<any> {
        return this._http.get<any>(`${this._commonService.baseUrl}/cmp/plan/section/comp/${secCompId}/history`);
    }

    fetchCmpBuilderRecipients(cmpId: string | number): Observable<CmpBuilderRecipient[]> {
        return this._http.get<CmpBuilderRecipient[]>(`${this._commonService.baseUrl}/cmp/plan/recipient/${cmpId}`);
    }

    saveCmpBuilderRecipients(params: CmpBuilderRecipientRO): Observable<CmpBuilderRecipient> {
        return this._http.post<CmpBuilderRecipient>(`${this._commonService.baseUrl}/cmp/plan/recipient`, params);
    }

    updateCmpBuilderRecipients(params: CmpBuilderRecipientRO): Observable<CmpBuilderRecipient> {
        return this._http.put<CmpBuilderRecipient>(`${this._commonService.baseUrl}/cmp/plan/recipient`, params);
    }

    deleteCmpBuilderRecipients(cmpRecipientId: string | number): Observable<any> {
        return this._http.delete<any>(`${this._commonService.baseUrl}/cmp/plan/recipient/${cmpRecipientId}`);
    }

    getAvailableCmpActions(cmpId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/cmp/plan/getAvailableActions/${cmpId}`);
    }

    updateCmpStatus(updateCmpStatusRO: UpdateCmpStatusRO): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/cmp/plan/updateCmpstatus`, updateCmpStatusRO);
    }

    startLocationReview(cmpReviewId: string | number, description: string): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/cmp/review/start/${cmpReviewId}`, { description });
    }

    completeLocationReview(cmpReviewId: string | number, params: { endDate: string, description: string }): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/cmp/review/complete/${cmpReviewId}`, params);
    }

    fetchAllCmpAttachments(cmpId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/cmp/attachment/getAttachmentsByCmpId/${cmpId}`);
    }

    generateManagementPlan(cmpId: string | number, payload = {}): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/cmp/plan/${cmpId}/document/generate`, payload);
    }

    regenerateManagementPlan(cmpId: string | number, payload = {}): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/cmp/plan/${cmpId}/document/regenerate`, payload);
    }

    saveAttachment(params: CmpAttachmentSaveRO | CmpAttachmentReplaceRO, uploadedFile: any[]): Observable<any> {
        const FORM_DATA = new FormData();
        for (const file of uploadedFile) {
            FORM_DATA.append('files', file, file.name);
        }
        FORM_DATA.append('formDataJson', JSON.stringify(params));
        return this._http.post(`${this._commonService.baseUrl}/cmp/attachment/save`, FORM_DATA);
    }

    getManagementPlanHistory(cmpId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/cmp/plan/history/${cmpId}`);
    }

    getUserTask(cmpId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/cmp/tasks/myTask/${cmpId}`);
    }

    fetchCmpReviews(cmpId: string | number): Observable<CmpReviewLocation[]> {
        return this._http.get<CmpReviewLocation[]>(`${this._commonService.baseUrl}/cmp/review/${cmpId}`);
    }

    clearManagementPlanServiceData(): void {
        this.validationList = [];
        this.formBuilderId = null;
        this.answeredFormId = null;
        this.validationConfig = new ValidationConfig();
    }

    setTopForManagementPlan(): void {
        this.cmpTopTimeout && clearTimeout(this.cmpTopTimeout);
        this.cmpTopTimeout = setTimeout(() => {
            const HEADER = document.getElementById('coi-user-cmp-header');
            const getHeight = (element: HTMLElement | null) => element ? element.offsetHeight + 20 : 0;
            const TOP_POSITION = getHeight(HEADER);
            this.validationConfig.headerOffSetValue = TOP_POSITION;
        }, 0);
    }

    getApplicableForms(cmp: CmpHeader): Observable<any> {
        const { cmpId, person } = cmp || {};
        const REQUEST_OBJECT = this._commonService.getApplicableFormRO(
            COI_CMP_MODULE_CODE.toString(),
            COI_CMP_SUB_MODULE_CODE.toString(),
            person?.personId,
            cmpId?.toString()
        );
        return this._commonService.getApplicableForms(REQUEST_OBJECT);
    }

    setFormStatus(formList: any[]): Map<number, 'Y' | 'N'> {
        const FORM_STATUS_MAP = new Map<number, 'Y' | 'N'>();
        formList.forEach((form: any) => {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                FORM_STATUS_MAP.set(Number(form?.answeredFormId), 'N');
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                this.answeredFormId = form?.answeredFormId;
                FORM_STATUS_MAP.set(Number(form?.activeFormId), 'Y');
            } else {
                FORM_STATUS_MAP.set(Number(form?.activeFormId), 'N');
            }
        });
        return FORM_STATUS_MAP;
    }

    setFormBuilderId(form: any, isEditable: boolean): number | null {
        let FORM_BUILDER_ID: number | null = null;
        if (isEditable) {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                FORM_BUILDER_ID = form?.answeredFormId;
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                FORM_BUILDER_ID = form?.activeFormId;
            } else {
                FORM_BUILDER_ID = form?.activeFormId;
            }
        } else {
            FORM_BUILDER_ID = form?.answeredFormId || form?.activeFormId;
        }
        this.formBuilderId = FORM_BUILDER_ID;
        return FORM_BUILDER_ID;
    }

    // scrollspy services
    configureScrollSpy(): void {
        this.scrollSpyConfiguration.activeCounter = 0;
        this.scrollSpyConfiguration.isActiveKeyNavigation = false;
        this.scrollSpyConfiguration.navItemClass = 'coi-scrollspy-right';
        this.scrollSpyConfiguration.contentItemClass = 'coi-scrollspy-left';
        this.scrollSpyConfiguration.dynamicMaxWidth = 991;
        this.scrollSpyConfiguration.scrollLeftCustomClass = 'col overflow-y-auto scrollbar-sm rounded-3 ps-0 pe-1 scroll-snap-y-mandatory';
        this.scrollSpyConfiguration.scrollRightCustomClass = 'col-xl-3 col-4 overflow-y-auto scrollbar-sm rounded-3 ps-2 pe-0 pe-xxl-1 scroll-snap-y-mandatory coi-bg-body d-xxl-block';
        this.setHeight();
    }

    updateScrollSpyConfig(event: { isVisible: boolean; observerEntry: IntersectionObserverEntry; }, scrollSpyIndex: number): void {
        this.elementVisiblePercentageList[scrollSpyIndex] = event.observerEntry.intersectionRatio;
        this.elementVisiblePercentageList = deepCloneObject(this.elementVisiblePercentageList);
    }

    setHeight(): void {
        setTimeout(() => {
            const HEIGHT = this.getHeaderNavHeight();
            this.scrollSpyConfiguration.scrollLeftHeight = HEIGHT;
            this.scrollSpyConfiguration.activeCounter = 0;
            this.scrollSpyConfiguration.rightOffsetTop = this.getNavOffsetTop();
            this.scrollSpyConfiguration.scrollRightHeight = HEIGHT;
        });
    }

    private getHeaderNavHeight(): string {
        const COI_DISCLOSURE_HEADER = document.getElementById('coi-management-plan-header')?.getBoundingClientRect();
        const COI_DISCLOSURE_HEADER_HEIGHT = COI_DISCLOSURE_HEADER?.height;
        const APPLICATION_HEADER_HEIGHT = 65;
        const BOTTOM_ACTION_PADDING = 0;
        const COI_DISCLOSURE_HEADER_BOTTOM = COI_DISCLOSURE_HEADER_HEIGHT + APPLICATION_HEADER_HEIGHT + BOTTOM_ACTION_PADDING;
        const PADDING = '10px';
        const FOOTER_HEIGHT = 0;
        const TOTAL_HEIGHT = `${COI_DISCLOSURE_HEADER_BOTTOM}px - ${FOOTER_HEIGHT}px - ${PADDING}`;
        return `calc(100vh - ${TOTAL_HEIGHT})`;
    }

    private getNavOffsetTop(): number {
        const element = document.getElementById('COI_DEFINE_RELATIONSHIP_NAV_HEADER');
        if (element) {
            const OFFSET_TOP = 0;
            return element.getBoundingClientRect().height + 15 + OFFSET_TOP;
        }
        return 0;
    }

    scrollSpyCounterChanged(event: ScrollSpyEvent): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'SCROLL_SPY', content: event });
    }

    resetElementVisiblePercentageList(): void {
        this.elementVisiblePercentageList = [];
        this.elementVisiblePercentageList = deepCloneObject(this.elementVisiblePercentageList);
    }

    openReviewConfirmationModal(action: CmpLocationReviewType, reviewerDetails: CmpReviewLocation): void {
        const IS_START_REVIEW = action === 'START_LOCATION_REVIEW';
        const DESCRIPTION_LABEL = IS_START_REVIEW ? 'Description' : 'Please provide your assessment of the disclosure';
        const PLACE_HOLDER = IS_START_REVIEW ? 'Please provide the description' : 'Please provide your assessment of the disclosure';
        const MODAL_HEADER = IS_START_REVIEW ? `Start at ${reviewerDetails?.locationType?.description}`
            : `Complete Review at ${reviewerDetails?.locationType?.description}`;
        this.confirmationModal = new CmpConfirmationModal();
        this.confirmationModal.action = action;
        this.confirmationModal.description = '';
        this.confirmationModal.visibleFieldsList = ['CMP_ACTION_DESCRIPTION'];
        this.confirmationModal.mandatoryFieldsList = [];
        this.confirmationModal.descriptionLabel = DESCRIPTION_LABEL;
        this.confirmationModal.textAreaPlaceholder = PLACE_HOLDER;
        this.confirmationModal.modalHeader = MODAL_HEADER;
        this.confirmationModal.modalBody = '';
        this.confirmationModal.selectedReviewLocation = reviewerDetails;
        this.confirmationModal.modalConfig = IS_START_REVIEW
            ? new CommonModalConfig('cmp-start-review-confirm-modal', 'Start Review', 'Cancel', 'xl')
            : new CommonModalConfig('cmp-complete-review-confirm-modal', 'Complete', 'Cancel', 'xl');
        this.confirmationModal.modalHelpTextConfig = { subSectionId: '2904', elementId: `cmp-review-modal-header` };
        this.confirmationModal.descriptionHelpTextConfig = { subSectionId: '2904', elementId: `cmp-review-modal-desc` };
        setTimeout(() => {
            openCommonModal(this.confirmationModal.modalConfig.namings.modalName);
        });
    }

    setReviewCommentSliderConfig(commentDetails: FetchReviewCommentRO, reviewCommentsCardConfig?: Partial<COIReviewCommentsConfig>): void {
        const IS_CMP_PERSON = this._managementPlanDataStore.isLoggedCmpPerson();
        const IS_LOGGED_PERSON_REVIEWER = this._managementPlanDataStore.isLoggedPersonReviewer();
        const MANAGEMENT_PLAN = this._managementPlanDataStore.getData();
        const DEFAULT_CHECK_BOX_CONFIG = [];
        const IS_CMP_REVIEWER = IS_LOGGED_PERSON_REVIEWER || MANAGEMENT_PLAN?.loggedPersonTaskList?.length > 0;
        const CAN_MAINTAIN_COMMENTS = this._commonService.getAvailableRight(MANAGE_CMP_COMMENT);
        const CAN_MAINTAIN_PRIVATE_COMMENTS = this._commonService.getAvailableRight(MANAGE_PRIVATE_CMP_COMMENT) || IS_CMP_REVIEWER;
        const CAN_RESOLVE_CMP_COMMENTS = this._commonService.getAvailableRight(MANAGE_CMP_RESOLVE_COMMENTS);
        if (CAN_MAINTAIN_PRIVATE_COMMENTS) {
            DEFAULT_CHECK_BOX_CONFIG.push({
                label: 'Private',
                defaultValue: false,
                values: {
                    true: { isPrivate: true },
                    false: { isPrivate: false },
                },
            });
        }
        this.reviewCommentsSliderConfig = {
            // for card config
            ...reviewCommentsCardConfig,
            sliderHeader: `${CMP_LOCALIZE.TERM_CMP} Comments`,
            checkboxConfig: reviewCommentsCardConfig?.hasOwnProperty('checkboxConfig') ? reviewCommentsCardConfig?.checkboxConfig : DEFAULT_CHECK_BOX_CONFIG,
            isEditMode: reviewCommentsCardConfig?.hasOwnProperty('isEditMode') ? reviewCommentsCardConfig?.isEditMode : true,
            reviewCommentsSections: CMP_REVIEW_COMMENTS_COMPONENT_GROUP,
            // for payload
            ...commentDetails,
            moduleCode: COI_CMP_MODULE_CODE,
            isShowAllComments: commentDetails?.componentTypeCode === CMP_GENERAL_COMMENTS?.commentTypeCode,
            isOpenCommentSlider: true,
            canMaintainComments: CAN_MAINTAIN_COMMENTS,
            canMaintainPrivateComments: CAN_MAINTAIN_PRIVATE_COMMENTS,
            isDocumentOwner: IS_CMP_PERSON,
            sortOrder: CMP_REVIEW_COMMENTS_COMPONENT_SORT,
            canResolveComments: CAN_RESOLVE_CMP_COMMENTS,
            isReviewer: IS_CMP_REVIEWER
        };
        this._commonService.openReviewCommentSlider(this.reviewCommentsSliderConfig);
    }

    rerouteIfWrongPath(currentPath: string, planDetails: CmpHeader): void {
        const IS_UNIVERSITY_TYPE = String(planDetails?.cmpType?.cmpTypeCode) === String(CMP_TYPE.UNIVERSITY);
        const STATUS_CODE = String(planDetails?.statusType?.statusCode);
        const { ATTACHMENT, DETAILS, MANAGEMENT_PLAN, HISTORY, REVIEW, TASK } = CMP_CHILD_ROUTE_URL;
        let rerouteUrl = ''
        const ALLOWED_PATHS: string[] = IS_UNIVERSITY_TYPE
            ? [DETAILS, MANAGEMENT_PLAN, REVIEW, TASK, ATTACHMENT, HISTORY]
            : [ATTACHMENT, HISTORY];
        const CURRENT_CHILD_PATH = currentPath.split('/').pop() || '';
        if (!ALLOWED_PATHS.includes(CURRENT_CHILD_PATH)) {
            rerouteUrl = ALLOWED_PATHS[0];
        }
        if (REVIEW.includes(CURRENT_CHILD_PATH) && STATUS_CODE === String(CMP_STATUS.INPROGRESS)) {
            rerouteUrl = ALLOWED_PATHS[0];
        }
        if (rerouteUrl) {
            this._router.navigate([CMP_BASE_URL, String(planDetails?.cmpId), rerouteUrl]);
        }
    }

}
