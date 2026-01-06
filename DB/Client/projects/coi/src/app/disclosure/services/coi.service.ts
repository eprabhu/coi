import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ApplicableQuestionnaire, CertifyDisclosureRO, COI, CoiDisclosure, COIWorkFlow, COIWorkFlowResponse, DisclosureCompleteFinalReviewRO,
    ExpandCollapseSummaryBySection, getApplicableQuestionnaireData } from '../coi-interface';
import { COI_COEUS_SUB_MODULE, COI_MODULE_CODE, DISCLOSURE_TYPE, FCOI_SUB_MODULE_ITEM_KEY, URL_FOR_DISCLOSURE_PROJECT } from '../../app-constants';
import { COIReviewCommentsSliderConfig, FetchReviewCommentRO } from '../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COIReviewCommentsConfig } from '../../shared-components/coi-review-comments/coi-review-comments.interface';
import { COIEngagementSliderConfig, DisclosureReviewFetchType, EvaluateValidationRO, Method } from '../../common/services/coi-common.interface';
import { openCoiSlider } from '../../common/utilities/custom-utilities';
import { CA_COMMENTS, FCOI_ADMINISTRATOR_COMMENTS, FCOI_CERTIFICATION_COMMENTS, FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
    FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
    FCOI_ENGAGEMENT_COMMENTS, FCOI_GENERAL_COMMENTS, FCOI_PROJECT_COMMENTS, FCOI_QUESTIONNAIRE_COMMENTS, FCOI_RELATIONSHIP_COMMENTS,
    FCOI_REVIEW_COMMENTS, MAINTAIN_COI_RESOLVE_COMMENTS, MANAGE_FCOI_DISCLOSURE_COMMENT,
    MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { DataStoreService } from './data-store.service';
import { CoiStepsNavConfig } from '../../shared-components/coi-steps-navigation/coi-steps-navigation.component';
import { SafeHtml } from '@angular/platform-browser';

@Injectable()
export class CoiService {

    triggerReviewCommentDataUpdate$: Subject<any> = new Subject();
    unSavedModules = '';
    previousHomeUrl = '';
    isShowInfo = true;
    isShowSFIInfo = true;
    isShowCertifyInfo = true;
    isShowAttachmentInfo = true;
    stepTabName = '';
    isCertified = false;
    isReviewActionCompleted = false;
    $SelectedReviewerDetails = new BehaviorSubject<any>({});
    currentReviewForAction: any;
    isShowCommentNavBar = false;
    isCOIAdministrator = false;
    isStartReview = false;
    isCompleteReview = false;
    isDisclosureReviewer = false;
    isEnableReviewActionModal = false;
    actionButtonId = null;
    certificationResponseErrors = [];
    submitResponseErrors = [];
    concurrentUpdateAction = '';
    focusSFIId: any;
    focusModuleId: any;
    focusSFIRelationId: any;
    isRelationshipSaving = false;
    $isExpandSection = new Subject<{ section: string, isExpand: boolean }>();
    currentActiveQuestionnaire: any;
    isFromCertificationTab = false;
    isViewportVisibilityEnabled: any[] = [];
    isExpandSummaryBySection = new ExpandCollapseSummaryBySection();
    activeSectionId: 'COI801' | 'COI802' | 'COI803' | 'COI804' | 'COI805' = 'COI801';
    entityId = '';
    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();
    coiEngagementSliderConfig = new COIEngagementSliderConfig();
    isOpenEngagementCreateSlider = false;
    previousDisclosureRouteUrl = '';
    stepsNavBtnConfig = new CoiStepsNavConfig();
    FCOICertificationText: SafeHtml = '';
    $byPassValidationEvent = new Subject();

    constructor(
        private _http: HttpClient,
        private _commonService: CommonService,
        private _dataStore: DataStoreService
    ) { }

    openEngagementSlider(personEntityId: string | number, sliderElementId: string = 'coi-engagement-slider'): void {
        this.coiEngagementSliderConfig = { personEntityId, sliderElementId };
        openCoiSlider(sliderElementId);
    }

    closeEngagementSlider(): void {
        setTimeout(() => {
            this.coiEngagementSliderConfig = new COIEngagementSliderConfig();
        }, 500);
    }

    loadDisclosure(disclosureId: string) {
        return this._http.get(`${this._commonService.baseUrl}/fcoiDisclosure/fetch/${disclosureId}`);
    }

    getProjectDisclosureId(projectType: string, personId: string, moduleItemKey: string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/fcoiDisclosure/getProjectDisclosureId/${projectType}/${personId}/${moduleItemKey}`);
    }

    certifyDisclosure(params: CertifyDisclosureRO) {
        return this._http.patch(`${this._commonService.baseUrl}/fcoiDisclosure/certifyDisclosure`, params);
    }

    evaluateDisclosureQuestionnaire(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/evaluateDisclosureQuestionnaire`, params);
    }

    completeDisclosureReview(params: DisclosureCompleteFinalReviewRO): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/completeDisclosureReview`, params);
    }

    saveOrUpdateCoiReview(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/saveOrUpdateCoiReview`, params);
    }

    getCoiProjectTypes() {
        return this._http.get(`${this._commonService.baseUrl}/getCoiProjectTypes`);
    }

    getApplicableQuestionnaire(requestObject: any) {
        return this._http.post(`${this._commonService.fibiUrl}/getApplicableQuestionnaire`, requestObject);
    }

    getCoiReview(disclosureId: number, dispositionStatusCode: string) {
        return this._http.post(`${this._commonService.baseUrl}/getCoiReview`, {disclosureId, dispositionStatusCode});
    }

    startCOIReview(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/startCOIReview`, { coiReview: params });
    }

    completeReview(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/completeCOIReview`, { coiReview: params });
    }

    triggerStartOrCompleteCoiReview(modalType: string) {
        this.actionButtonId = modalType === 'START' ? 'coi-start-reviewer-review-modal-trigger' : 'coi-complete-reviewer-review-modal-trigger';
    }

    evaluateValidation(params: EvaluateValidationRO): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/evaluateValidation`, params);
    }

    withdrawDisclosure(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/withdrawDisclosure`, params);
    }

    withdrawRequest(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/requestWithdrawal`, params);
    }

    denyWithdrawRequest(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/requestWithdrawal/deny`, params);
    }

    returnDisclosure(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/returnDisclosure`, params);
    }

    disclosureHistory(disclosureId) {
        return this._http.get(`${this._commonService.baseUrl}/disclosureHistory/${disclosureId}`);
    }

    isAllReviewsCompleted(reviewerList): boolean {
        return reviewerList.every(value => value.reviewerStatusType && value.reviewerStatusType.reviewStatusCode === '2');
    }

    riskAlreadyModified(params: any) {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/riskStatus`, params);
    }

    getDisclosureProjectList(disclosureId: number) {
        return this._http.get(this._commonService.baseUrl + URL_FOR_DISCLOSURE_PROJECT.replace('{disclosureId}', disclosureId.toString()));
    }

    isEngagmentSynced(disclosureId: any, disclosurePersonId: any) {
        return this._http.get(`${this._commonService.baseUrl}/fcoiDisclosure/isDisclosureSynced/${disclosureId}/${disclosurePersonId}`);
    }

    addAwardCompletionHistory(disclosureId: any) {
        // return this._http.get(`${this._commonService.baseUrl}/project/recordCompletedDisclosuresInProjectHistory/${disclosureId}`).pipe(
        //     tap(data => {}));
        return this._http.get(`${this._commonService.baseUrl}/project/recordCompletedDisclosuresInProjectHistory/${disclosureId}`);
    }

    checkForFailedProjectsSync(personID: number | string): Observable<any> {
        return this._http.get(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/coi/persons/${personID}/projects/sync`);
    }

    fetchWorkFlowDetails(moduleCode: string | number, moduleItemKey: string | number): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/fetchWorkFlowDetails`, { moduleCode, moduleItemKey });
    }

    addTableBorder(projectList, headerElementId) {
        if (this.focusSFIRelationId) {
            const INDEX = projectList.findIndex(ele => ele.disclosureDetailsId == this.focusSFIRelationId);
            if (INDEX != -1) {
                if (INDEX == 0) {
                    const ELEMENT = document.getElementById(headerElementId);
                    ELEMENT.classList.add('border-bottom-0');
                } else {
                    const ELEMENT_ID = (projectList[INDEX - 1].disclosureDetailsId).toString();
                    const ELEMENT = document.getElementById(ELEMENT_ID);
                    ELEMENT.classList.add('border-bottom-0');
                }
            }
        }
    }

    setActiveSection(activeSectionId: 'COI801' | 'COI802' | 'COI803' | 'COI804' | 'COI805', isExpand = true): void {
        this.activeSectionId = activeSectionId;
        this.isExpandSummaryBySection[activeSectionId] = isExpand;
    }

    getDisclosureHistory(param) {
        return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/historyDashboard',param);
    }

    setReviewCommentSliderConfig(commentDetails: FetchReviewCommentRO, reviewCommentsCardConfig?: Partial<COIReviewCommentsConfig>): void {
        const COI_DATA: COI = this._dataStore.getData();
        const IS_COI_REVIEWER = this._commonService.isCoiReviewer;
        const CAN_MAINTAIN_PRIVATE_COMMENTS = this._commonService.getAvailableRight(MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT) || IS_COI_REVIEWER;
        const CAN_MAINTAIN_COMMENTS = this._commonService.getAvailableRight(MANAGE_FCOI_DISCLOSURE_COMMENT) || IS_COI_REVIEWER;
        const CAN_RESOLVE_COMMENTS = this._commonService.getAvailableRight(MAINTAIN_COI_RESOLVE_COMMENTS);
        const IS_COI_ADMINISTRATOR = this._commonService.getAvailableRight(['MANAGE_PROJECT_DISCLOSURE']);
        const IS_SHOW_CA_COMMENTS = IS_COI_ADMINISTRATOR && this._commonService.enableKeyPersonDisclosureComments;
        const IS_SHOW_ADMINISTRATIVE_COMMENT = COI_DATA?.coiDisclosure?.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT || (commentDetails?.componentTypeCode === FCOI_PROJECT_COMMENTS?.componentTypeCode);

        const DISCLOSURE_OWNER = commentDetails?.documentOwnerPersonId === this._commonService.getCurrentUserDetail('personID');
        const DEFAULT_CHECK_BOX_CONFIG = [];

        if (CAN_MAINTAIN_PRIVATE_COMMENTS) {
            DEFAULT_CHECK_BOX_CONFIG.push({
                label: 'Private',
                defaultValue: false,
                values: {
                    true: { isPrivate: true },
                    false: { isPrivate: false },
                },
                hideComponentTypes: [FCOI_ADMINISTRATOR_COMMENTS?.componentTypeCode],
            });
        }
        if (IS_SHOW_CA_COMMENTS) {
            DEFAULT_CHECK_BOX_CONFIG.push({
                label: 'CA Comments',
                defaultValue: false,
                values: {
                    true: { componentTypeCode: CA_COMMENTS?.componentTypeCode },
                    false: null,
                },
                hideComponentTypes: [CA_COMMENTS?.componentTypeCode, FCOI_QUESTIONNAIRE_COMMENTS?.componentTypeCode, FCOI_ENGAGEMENT_COMMENTS?.componentTypeCode,
                    FCOI_PROJECT_COMMENTS?.componentTypeCode, FCOI_RELATIONSHIP_COMMENTS?.componentTypeCode, FCOI_CERTIFICATION_COMMENTS?.componentTypeCode, FCOI_REVIEW_COMMENTS?.componentTypeCode, FCOI_ADMINISTRATOR_COMMENTS?.componentTypeCode]
            })
        }
        if (IS_COI_ADMINISTRATOR && IS_SHOW_ADMINISTRATIVE_COMMENT ) {
            const CONFIG = {
                label: 'Administrative Comment',
                defaultValue: false,
                values: {
                    true: {
                        componentTypeCode: FCOI_ADMINISTRATOR_COMMENTS?.componentTypeCode,
                        componentName : FCOI_ADMINISTRATOR_COMMENTS?.componentName,
                        commentTypeCode: FCOI_ADMINISTRATOR_COMMENTS?.commentTypeCode,
                        moduleItemKey: commentDetails?.projects?.[0]?.projectNumber,
                        moduleCode: commentDetails?.projects?.[0]?.projectModuleCode
                    },
                    false: null,
                },
                hideComponentTypes: [
                    CA_COMMENTS?.componentTypeCode, FCOI_QUESTIONNAIRE_COMMENTS?.componentTypeCode, FCOI_ENGAGEMENT_COMMENTS?.componentTypeCode,
                    FCOI_CERTIFICATION_COMMENTS?.componentTypeCode, FCOI_RELATIONSHIP_COMMENTS?.componentTypeCode, FCOI_REVIEW_COMMENTS?.componentTypeCode, FCOI_ADMINISTRATOR_COMMENTS?.componentTypeCode
                ]
            }
            if (commentDetails?.componentTypeCode === FCOI_GENERAL_COMMENTS?.commentTypeCode) {
                CONFIG.hideComponentTypes.push(FCOI_ADMINISTRATOR_COMMENTS?.componentTypeCode);
            }
            DEFAULT_CHECK_BOX_CONFIG.push(CONFIG);
        }
        this.reviewCommentsSliderConfig = {
            // for card config
            ...reviewCommentsCardConfig,
            checkboxConfig: reviewCommentsCardConfig?.hasOwnProperty('checkboxConfig') ? reviewCommentsCardConfig?.checkboxConfig : DEFAULT_CHECK_BOX_CONFIG,
            isEditMode: reviewCommentsCardConfig?.hasOwnProperty('isEditMode') ? reviewCommentsCardConfig?.isEditMode : true,
            reviewCommentsSections: commentDetails?.componentTypeCode === FCOI_PROJECT_COMMENTS.componentTypeCode ? { [FCOI_PROJECT_COMMENTS.componentTypeCode]: FCOI_PROJECT_COMMENTS } : FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
            // for payload
            ...commentDetails,
            moduleCode: COI_MODULE_CODE,
            isShowAllComments: commentDetails?.componentTypeCode === FCOI_GENERAL_COMMENTS?.commentTypeCode || commentDetails?.componentTypeCode == FCOI_PROJECT_COMMENTS.componentTypeCode,
            isOpenCommentSlider: true,
            canMaintainComments: CAN_MAINTAIN_COMMENTS,
            canMaintainPrivateComments: CAN_MAINTAIN_PRIVATE_COMMENTS,
            isDocumentOwner: DISCLOSURE_OWNER,
            sortOrder: FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
            canResolveComments: CAN_RESOLVE_COMMENTS,
            isReviewer: IS_COI_REVIEWER
        };
        this._commonService.openReviewCommentSlider(this.reviewCommentsSliderConfig);
    }

    getEvaluateValidationRO(coiDisclosure: CoiDisclosure): EvaluateValidationRO {
        const FCOI_TYPE_CODE = coiDisclosure?.coiDisclosureFcoiType?.fcoiTypeCode;
        const IS_PROJECT_DISCLOSURE = FCOI_TYPE_CODE?.toString() === DISCLOSURE_TYPE.PROJECT.toString();
        const EVALUATE_VALIDATION_RO: EvaluateValidationRO = {
            moduleCode: COI_MODULE_CODE,
            subModuleCode: IS_PROJECT_DISCLOSURE ? COI_COEUS_SUB_MODULE[coiDisclosure?.coiProjectType?.coiProjectTypeCode] : COI_COEUS_SUB_MODULE.ANNUAL_DISCLOSURE,
            moduleItemKey: coiDisclosure?.disclosureId,
            subModuleItemKey: FCOI_SUB_MODULE_ITEM_KEY,
            disclosureNumber: coiDisclosure?.disclosureNumber,
            disclosureId: coiDisclosure?.disclosureId
        };
        return EVALUATE_VALIDATION_RO;
    }

    triggerCoiReviewFetch(actionType: DisclosureReviewFetchType): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_DISCLOSURE_REVIEW_COMPONENT', content: { disclosureType: 'FCOI', actionType: actionType } });
    }

    workFlowResponse(data: COIWorkFlowResponse, workFlowResult: COIWorkFlow, coiDisclosure: CoiDisclosure): { workFlowResult: COIWorkFlow, coiDisclosure: CoiDisclosure } {
        workFlowResult.workflow = data?.workflow;
        workFlowResult.workflowList = data?.workflowList;
        workFlowResult.canApproveRouting = data?.canApproveRouting;
        workFlowResult.isFinalApprover = data?.isFinalApprover;
        workFlowResult.isFinalApprovalPending = data?.isFinalApprovalPending;
        if (data?.reviewStatusType?.reviewStatusCode) {
            coiDisclosure.coiReviewStatusType = data.reviewStatusType;
            coiDisclosure.reviewStatusCode = data.reviewStatusType.reviewStatusCode;
        }
        if (this._dataStore.isRoutingReview && data?.coiDispositionStatusType?.dispositionStatusCode) {
            coiDisclosure.coiDispositionStatusType = data.coiDispositionStatusType;
            coiDisclosure.dispositionStatusCode = data.coiDispositionStatusType.dispositionStatusCode;
        }
        coiDisclosure.updateUserFullName = data.updateUserFullName;
        coiDisclosure.updateTimestamp = data.updateTimestamp;
        return { workFlowResult, coiDisclosure };
    }

    approveOrRejectWorkflow(requestObject: any, uploadedFile: any[]): Observable<any> {
        const FORM_DATA = new FormData();
        if (uploadedFile?.length) {
            for (let i = 0; i < uploadedFile.length; i++) {
                FORM_DATA.append('files', uploadedFile[i], uploadedFile[i].name);
            }
        }
        FORM_DATA.append('formDataJson', JSON.stringify(requestObject));
        FORM_DATA.append('moduleCode', COI_MODULE_CODE.toString());
        FORM_DATA.append('subModuleCode', '0');
        return this._http.post(this._commonService.baseUrl + '/approveOrRejectWorkflow', FORM_DATA);
    }

    validateCOI(coiDisclosureId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/coi/validateCOI/${coiDisclosureId}`);
    }

}

export function certifyIfQuestionnaireCompleted(res: getApplicableQuestionnaireData,) {
    let errorArray = [];
    if (res && res.applicableQuestionnaire && res.applicableQuestionnaire.length) {
        if (isAllMandatoryQuestionnaireNotCompleted(res.applicableQuestionnaire)) {
            let questionnaire_error = { validationMessage: '', validationType: "VE", questionnaireComplete: "false" };
            questionnaire_error.validationMessage = 'Please complete the mandatory Questionnaire(s) in the “Screening Questionnaire” section.';
            errorArray.push(questionnaire_error);
        }
        if (!isAllNonMandatoryQuestionnaireCompleted(res.applicableQuestionnaire)) {
            let questionnaire_error = { validationMessage: '', validationType: "VW", questionnaireComplete: "false" };
            questionnaire_error.validationMessage = 'Please complete the Questionnaire(s) in the “Screening Questionnaire” section.';
            errorArray.push(questionnaire_error);
        }
    }
    return errorArray;
}

function isAllMandatoryQuestionnaireNotCompleted(questionnaires: ApplicableQuestionnaire[]) {
    return questionnaires.some((element) => element.IS_MANDATORY === 'Y' && element.QUESTIONNAIRE_COMPLETED_FLAG !== 'Y');
}

function isAllNonMandatoryQuestionnaireCompleted(questionnaires: ApplicableQuestionnaire[]) {
    return questionnaires.filter(questionnaire => questionnaire.IS_MANDATORY !== 'Y')
    .every(questionnaire => questionnaire.QUESTIONNAIRE_COMPLETED_FLAG === 'Y');
}

