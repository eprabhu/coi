import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { FormBuilderEvent } from '../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { COIEngagementSliderConfig } from '../../common/services/coi-common.interface';
import { closeCommonModal, openCoiSlider } from '../../common/utilities/custom-utilities';
import { OPA_MODULE_CODE } from '../../app-constants';
import { OpaDisclosure, OPAWorkFlow, OPAWorkFlowResponse } from '../opa-interface';
import { COIReviewCommentsSliderConfig, FetchReviewCommentRO } from '../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { MANAGE_OPA_DISCLOSURE_COMMENT, MANAGE_OPA_RESOLVE_COMMENTS, MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT, OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP, OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT, OPA_GENERAL_COMMENTS } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentsConfig } from '../../shared-components/coi-review-comments/coi-review-comments.interface';
import { CommonModalConfig } from '../../shared-components/common-modal/common-modal.interface';
import { DataStoreService } from './data-store.service';
import { ValidationConfig } from '../../configuration/form-builder-create/shared/form-validator/form-validator.interface';

@Injectable()
export class OpaService {
    previousHomeUrl = '';
    isReviewActionCompleted = false;
    isStartReview = false;
    isCompleteReview = false;
    isDisclosureReviewer = false;
    $SelectedReviewerDetails = new BehaviorSubject({});
    isShowCreateEngSlider = false;
    isEnableReviewActionModal = false;
    formBuilderEvents = new Subject<FormBuilderEvent>();
    actionButtonId = null;
    currentOPAReviewForAction: any;
    isFormBuilderDataChangePresent = false;
    triggerSaveComplete = new Subject<any>();
    triggerForApplicableForms: Subject<any> = new Subject<any>();
    triggerForSaveAndSubmit: Subject<any> = new Subject<any>();
    triggerFormId: Subject<any> = new Subject<any>();
    formStatusMap = new Map();
    answeredFormId: number;
    activeFormId = null;
    currentFormId = null;
    coiEngagementSliderConfig = new COIEngagementSliderConfig();
    engActivateInactivateModal = {
        personEntityId: null,
        entityName: null,
        personEntityNumber: null,
        relationshipDetails: null,
        updatedRelationshipStatus: null,
        isSignificantFinInterest: false
    };
    timeOut: ReturnType<typeof setTimeout>;
    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();
    previousOPARouteUrl = '';
    deleteEngagementModalDetails = {
        engagementDetails: null,
        engDeleteConfirmModalId: 'eng-delete-confirm-modal',
        engDeleteModalConfig: new CommonModalConfig('eng-delete-confirm-modal', 'Delete', 'Cancel', '')
    };
    $byPassValidationEvent = new Subject();
    isAnyAutoSaveFailed = false;
    opaDisclosureHeaderOffset: number;
    validationConfig = new ValidationConfig();

    constructor(private _http: HttpClient, private _commonService: CommonService, private _opaDataStore: DataStoreService) {
    }

    workFlowResponse(data: OPAWorkFlowResponse, workFlowResult: OPAWorkFlow, opaDisclosure: OpaDisclosure): { workFlowResult: OPAWorkFlow, opaDisclosure: OpaDisclosure } {
        workFlowResult.workflow = data?.workflow;
        workFlowResult.workflowList = data?.workflowList;
        workFlowResult.canApproveRouting = data?.canApproveRouting;
        workFlowResult.isFinalApprover = data?.isFinalApprover;
        workFlowResult.isFinalApprovalPending = data?.isFinalApprovalPending;
        if (data?.reviewStatusType?.reviewStatusCode) {
            opaDisclosure.reviewStatusType = data.reviewStatusType;
            opaDisclosure.reviewStatusCode = data.reviewStatusType.reviewStatusCode;
        }
        if (this._opaDataStore.isRoutingReview && data?.dispositionStatusType?.dispositionStatusCode) {
            opaDisclosure.dispositionStatusType = data.dispositionStatusType;
            opaDisclosure.dispositionStatusCode = data.dispositionStatusType.dispositionStatusCode;
        }
        opaDisclosure.updateUserFullName = data.updateUserFullName;
        opaDisclosure.updateTimestamp = data.updateTimestamp;
        return { workFlowResult, opaDisclosure };
    }

    openEngagementSlider(personEntityId: string | number, sliderElementId: string = 'coi-engagement-slider'): void {
        this.coiEngagementSliderConfig = { personEntityId, sliderElementId };
        openCoiSlider(sliderElementId);
    }

    closeEngagementSlider(): void {
        setTimeout(() => {
            this.coiEngagementSliderConfig = new COIEngagementSliderConfig();
        }, 500);
    }

    triggerEngagementDataChange(): void {
        const OPA_DISCLOSURE: OpaDisclosure = this._opaDataStore.getData()?.opaDisclosure
        const ENGAGEMENT_STATUS_CHANGE_RO = {
            opaDisclosureId: OPA_DISCLOSURE?.opaDisclosureId,
            documentOwnerPersonId: OPA_DISCLOSURE?.personId,
        };
        this.formBuilderEvents.next({eventType: 'EXTERNAL_ACTION', data: ENGAGEMENT_STATUS_CHANGE_RO});
    }

    openEngDeleteConfirmModal(engagementDetails: any): void {
        this.deleteEngagementModalDetails.engagementDetails = engagementDetails;
        openCoiSlider(this.deleteEngagementModalDetails.engDeleteConfirmModalId);
    }

    closeEngDeleteConfirmModal(): void {
        closeCommonModal(this.deleteEngagementModalDetails.engDeleteConfirmModalId);
        const TIME_OUT = setTimeout(() => {
            this.deleteEngagementModalDetails.engagementDetails = null;
            clearTimeout(TIME_OUT);
        }, 200);
    }

    setReviewCommentSliderConfig(commentDetails: FetchReviewCommentRO, reviewCommentsCardConfig?: Partial<COIReviewCommentsConfig>): void {
        const DEFAULT_CHECK_BOX_CONFIG = [];
        const IS_OPA_REVIEWER = this._commonService.isOPAReviewer;
        const CAN_MAINTAIN_COMMENTS = this._commonService.getAvailableRight(MANAGE_OPA_DISCLOSURE_COMMENT) || IS_OPA_REVIEWER;
        const CAN_MAINTAIN_PRIVATE_COMMENTS = this._commonService.getAvailableRight(MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT) || IS_OPA_REVIEWER;
        const CAN_RESOLVE_OPA_COMMENTS = this._commonService.getAvailableRight(MANAGE_OPA_RESOLVE_COMMENTS);
        const DISCLOSURE_OWNER = commentDetails?.documentOwnerPersonId === this._commonService.getCurrentUserDetail('personID');
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
            checkboxConfig: reviewCommentsCardConfig?.hasOwnProperty('checkboxConfig') ? reviewCommentsCardConfig?.checkboxConfig : DEFAULT_CHECK_BOX_CONFIG,
            isEditMode: reviewCommentsCardConfig?.hasOwnProperty('isEditMode') ? reviewCommentsCardConfig?.isEditMode : true,
            reviewCommentsSections: OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
            // for payload
            ...commentDetails,
            moduleCode: OPA_MODULE_CODE,
            isShowAllComments: commentDetails?.componentTypeCode === OPA_GENERAL_COMMENTS?.commentTypeCode,
            isOpenCommentSlider: true,
            canMaintainComments: CAN_MAINTAIN_COMMENTS,
            canMaintainPrivateComments: CAN_MAINTAIN_PRIVATE_COMMENTS,
            isDocumentOwner: DISCLOSURE_OWNER,
            sortOrder: OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
            canResolveComments: CAN_RESOLVE_OPA_COMMENTS,
            isReviewer: IS_OPA_REVIEWER
        };
        this._commonService.openReviewCommentSlider(this.reviewCommentsSliderConfig);
    }

    setTopDynamically(): void {
        this.clearTimeOutIfExisting();
        this.timeOut = setTimeout(() => {
            const STICKY_HEADER = document.querySelector<HTMLElement>('.header-sticky');
            let finalTop = 0;
            if(STICKY_HEADER) {
                const headerHeight = STICKY_HEADER.offsetHeight;
                const elements = document.querySelectorAll('.form-builder-sticky-header');
                if(elements.length) {
                    finalTop = headerHeight + 50;
                    elements.forEach((element: HTMLElement) => {
                        element.style.top = `${finalTop}px`;
                    });
                }
                const TABLE_STICKY_HEADER = document.querySelectorAll('.form-builder-table-header');
                if(TABLE_STICKY_HEADER.length) {
                    finalTop = headerHeight + 101;
                    TABLE_STICKY_HEADER.forEach((element: HTMLElement) => {
                        element.style.top = `${finalTop}px`;
                    });
                }
                const OPA_PERSON_ENG_SEARCH_AND_FILTER_ELE = document.getElementById('opa-eng-pe-sticky-header');
                if (OPA_PERSON_ENG_SEARCH_AND_FILTER_ELE) {
                    finalTop = headerHeight + 102;
                    OPA_PERSON_ENG_SEARCH_AND_FILTER_ELE.style.top = `${finalTop}px`;
                }
            }
            this.validationConfig.headerOffSetValue = finalTop;
        }, 50)
    }

    clearTimeOutIfExisting(): void {
        if(this.timeOut){
            clearTimeout(this.timeOut);
        }
    }

    loadOPA(disclosureId) {
        return this._http.get(this._commonService.baseUrl + '/opa/getOPADisclosureHeader/' + disclosureId);
    }

    getOPAReview(disclosureId) {
        return this._http.get(this._commonService.baseUrl + '/opa/review/' + disclosureId);
    }

    getApplicableQuestionnaire(disclosureId) {
        return of({});
    }

    isAllReviewsCompleted(reviewerList) {
        return reviewerList.every(value => value.reviewerStatusType && value.reviewerStatusType.reviewStatusCode === '2');
    }

    triggerStartOrCompleteCoiReview(modalType) {
        this.actionButtonId = modalType === 'START' ? 'opa-start-reviewer-review-modal-trigger' : 'opa-complete-reviewer-review-modal-trigger';
    }

    disclosureHistory(disclosureId) {
        return this._http.get(`${this._commonService.baseUrl}/opa/opaDisclosureHistory/${disclosureId}`);
    }
    submitOPA(opaDisclosureId: number, opaDisclosureNumber: string, versionNumber: number): Observable<any>  {
        return this._http.patch(`${this._commonService.baseUrl}/opa/submit`, { opaDisclosureId, opaDisclosureNumber, versionNumber });
    }
    returnOPA(params) {
        return this._http.patch(this._commonService.baseUrl + '/opa/return', params);
    }
    withdrawOPA(params) {
        return this._http.patch(this._commonService.baseUrl + '/opa/withdraw', params);
    }

    completeOPAReview(opaDisclosureId: string | number, opaDisclosureNumber: string | number, description: string) {
        return this._http.patch(`${this._commonService.baseUrl}/opa/complete`, { opaDisclosureId, opaDisclosureNumber, description });
    }

    startReviewerReview(params: any) {
        return this._http.patch(`${this._commonService.baseUrl}/opa/review/start`, params);
    }

    completeReviewerReview(params: any) {
        return this._http.patch(`${this._commonService.baseUrl}/opa/review/complete`, params);
    }

    getEngagementDetails(personEntityId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/personEntity/${personEntityId}`);
    }

    modifyEngagement(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/personEntity/modify', params);
    }

    fetchWorkFlowDetails(moduleCode: string | number, moduleItemKey: string | number): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/fetchWorkFlowDetails`, { moduleCode, moduleItemKey });
    }

    validateOPA(opaDisclosureId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/opa/validateOPA/${opaDisclosureId}`);
    }

    approveOrRejectWorkflow(requestObject: any, uploadedFile: any[]): Observable<any> {
        const FORM_DATA = new FormData();
        if (uploadedFile?.length) {
            for (let i = 0; i < uploadedFile.length; i++) {
                FORM_DATA.append('files', uploadedFile[i], uploadedFile[i].name);
            }
        }
        FORM_DATA.append('formDataJson', JSON.stringify(requestObject));
        FORM_DATA.append('moduleCode', OPA_MODULE_CODE.toString());
        FORM_DATA.append('subModuleCode', '0');
        return this._http.post(this._commonService.baseUrl + '/approveOrRejectWorkflow', FORM_DATA);
    }

    getAttachmentTypes(): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/loadDisclAttachTypes`);
    }

}
