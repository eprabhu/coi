import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ExpandCollapseSummaryBySection, TravelActionAfterSubmitRO, TravelDisclosure, TravelHistoryRO } from '../travel-disclosure.interface';
import { FormBuilderEvent } from '../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { EntityDetails } from '../../entity-management-module/shared/entity-interface';
import { COIReviewCommentsSliderConfig, FetchReviewCommentRO } from '../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COIReviewCommentsConfig } from '../../shared-components/coi-review-comments/coi-review-comments.interface';
import { TRAVEL_MODULE_CODE } from '../../app-constants';
import {
    MANAGE_PRIVATE_TRAVEL_DISCLOSURE_COMMENT,
    MANAGE_TRAVEL_DISCLOSURE_COMMENT,
    MANAGE_TRAVEL_RESOLVE_COMMENTS,
    TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
    TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
    TRAVEL_GENERAL_COMMENTS
} from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { COILeavePageModalConfig } from '../../common/services/coi-common.interface';
import { ScrollSpyConfiguration, ScrollSpyEvent } from '../../shared-components/scroll-spy/scroll-spy.interface';
import { deepCloneObject } from '../../common/utilities/custom-utilities';
import { CoiStepsNavConfig } from '../../shared-components/coi-steps-navigation/coi-steps-navigation.component';
import { SafeHtml } from '@angular/platform-browser';
import { ValidationConfig } from '../../configuration/form-builder-create/shared/form-validator/form-validator.interface';

@Injectable()
export class TravelDisclosureService {

    travelEntityDetails = new EntityDetails();
    coiTravelDisclosure = new TravelDisclosure();
    formBuilderEvents = new Subject<FormBuilderEvent>();

    isAdminDashboard = false;
    travelDataChanged = false;
    isAllowNavigation = false;
    isTravelCertified = false;
    isCreateNewTravelDisclosure = false;

    unSavedTabName = '';
    PREVIOUS_MODULE_URL = '';
    isShowCommentNavBar = false;
    isFormBuilderDataChangePresent = false;
    triggerSaveComplete = new Subject<any>();
    previousHomeUrl = '';
    isExternalFundingType = new Subject<boolean>();
    reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();
    //form related variables.
    triggerForApplicableForms: Subject<any> = new Subject<any>();
    triggerFormId: Subject<any> = new Subject<any>();
    formStatusMap = new Map();
    answeredFormId: number;
    activeFormId = null;
    currentFormId = null;
    activeSectionId: 'TD2401'|'TD2402' = 'TD2401';
    scrollSpyConfiguration = new ScrollSpyConfiguration();
    elementVisiblePercentageList: number[] = [];
    isExpandSummaryBySection = new ExpandCollapseSummaryBySection();
    stepsNavBtnConfig = new CoiStepsNavConfig();
    travelCertificationText: SafeHtml = '';
    previousTravelDisclRouteUrl = '';
    isAnyAutoSaveFailed = false;
    travelTopTimeout: ReturnType<typeof setTimeout>;
    validationConfig = new ValidationConfig();

    constructor(private _http: HttpClient,
        private _commonService: CommonService) { }

    setUnSavedChanges(dataChange: boolean, tabName: string): void {
        this.unSavedTabName = tabName;
        this.travelDataChanged = dataChange;
    }

    isCheckLoggedUser(personId: string): boolean {
        return personId === this._commonService.getCurrentUserDetail('personID');
    }

    submitTravelDisclosure(travelDisclosureRO: object) {
        return this._http.post(`${this._commonService.baseUrl}/travel/certify`, travelDisclosureRO);
    }

    loadTravelDisclosure(travelDisclosureId: number) {
        return this._http.get(`${this._commonService.baseUrl}/travel/load/${travelDisclosureId}`);
    }

    withdrawTravelDisclosure(travelDisclosureRO: TravelActionAfterSubmitRO) {
        return this._http.post(`${this._commonService.baseUrl}/travel/withdraw`, travelDisclosureRO);
    }

    approveTravelDisclosure(travelDisclosureRO: TravelActionAfterSubmitRO) {
        return this._http.post(`${this._commonService.baseUrl}/travel/approve`, travelDisclosureRO);
    }

    returnTravelDisclosure(travelDisclosureRO: TravelActionAfterSubmitRO) {
        return this._http.post(`${this._commonService.baseUrl}/travel/return`, travelDisclosureRO);
    }

    loadTravelDisclosureHistory(travelHistoryRO: TravelHistoryRO) {
        return this._http.get(`${this._commonService.baseUrl}/travel/relatedDisclosures/${travelHistoryRO.entityNumber}`);
    }

    getTravelDisclosureHistory(travelDisclosureId: number) {
        return this._http.get(`${this._commonService.baseUrl}/travel/history/${travelDisclosureId}`);
    }

    createTravelDisclosure(travelDisclosureRO: object) {
        return this._http.post(`${this._commonService.baseUrl}/travel/create`, travelDisclosureRO);
    }

    updateTravelDisclosure(travelDisclosureRO: object) {
        return this._http.put(`${this._commonService.baseUrl}/travel/update`, travelDisclosureRO);
    }

    setReviewCommentSliderConfig(commentDetails: FetchReviewCommentRO, reviewCommentsCardConfig?: Partial<COIReviewCommentsConfig>): void {
        const CAN_MAINTAIN_PRIVATE_COMMENTS = this._commonService.getAvailableRight(MANAGE_PRIVATE_TRAVEL_DISCLOSURE_COMMENT);
        const CAN_MAINTAIN_COMMENTS = this._commonService.getAvailableRight(MANAGE_TRAVEL_DISCLOSURE_COMMENT);
        const CAN_RESOLVE_COMMENTS = this._commonService.getAvailableRight(MANAGE_TRAVEL_RESOLVE_COMMENTS);
        const DISCLOSURE_OWNER = this.isCheckLoggedUser(commentDetails?.documentOwnerPersonId);
        const DEFAULT_CHECK_BOX_CONFIG = [];

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
            reviewCommentsSections: TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP,
            // for payload
            ...commentDetails,
            moduleCode: TRAVEL_MODULE_CODE,
            isShowAllComments: commentDetails?.componentTypeCode === TRAVEL_GENERAL_COMMENTS?.commentTypeCode,
            isOpenCommentSlider: true,
            canMaintainComments: CAN_MAINTAIN_COMMENTS,
            canMaintainPrivateComments: CAN_MAINTAIN_PRIVATE_COMMENTS,
            isDocumentOwner: DISCLOSURE_OWNER,
            sortOrder: TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT,
            canResolveComments: CAN_RESOLVE_COMMENTS,
            isReviewer: false
        };
        this._commonService.openReviewCommentSlider(this.reviewCommentsSliderConfig);
    }

    openTravelDisclosureLeaveModal(): void {
        const CONFIG = new COILeavePageModalConfig();
        CONFIG.triggeredFrom = 'TRAVEL_DISCLOSURE_LEAVE_PAGE';
        CONFIG.unsavedChangesPageName = 'Travel details';
        this._commonService.openCOILeavePageModal(CONFIG);
    }

    setActiveSection(activeSectionId: 'TD2401' | 'TD2402', isExpand = true): void {
        this.activeSectionId = activeSectionId;
        this.isExpandSummaryBySection[activeSectionId] = isExpand;
    }

    configureScrollSpy(): void {
        this.scrollSpyConfiguration.activeCounter = 0;
        this.scrollSpyConfiguration.isActiveKeyNavigation = false;
        this.scrollSpyConfiguration.navItemClass = 'coi-scrollspy-right';
        this.scrollSpyConfiguration.contentItemClass = 'coi-scrollspy-left';
        this.setHeight();
    }

    setHeight(): void {
        const HEIGHT = this.getRightNavHeight();
        this.scrollSpyConfiguration.scrollLeftHeight = HEIGHT;
        this.scrollSpyConfiguration.activeCounter = 0;
        this.scrollSpyConfiguration.scrollRightHeight = HEIGHT;
        this.scrollSpyConfiguration.rightOffsetTop = 0;
    }

    getRightNavHeight(): string {
        const COI_DISCLOSURE_HEADER = document.getElementById('TRAVEL-DISCLOSURE-HEADER')?.getBoundingClientRect();
        const COI_DISCLOSURE_HEADER_HEIGHT = COI_DISCLOSURE_HEADER?.height;
        const APPLICATION_HEADER_HEIGHT = 65;
        const COI_DISCLOSURE_HEADER_BOTTOM = COI_DISCLOSURE_HEADER_HEIGHT + APPLICATION_HEADER_HEIGHT;
        const PADDING = '10px';
        const FOOTER_HEIGHT = 0;
        const TOTAL_HEIGHT = `${COI_DISCLOSURE_HEADER_BOTTOM}px - ${FOOTER_HEIGHT}px - ${PADDING}`;
        return `calc(100vh - ${TOTAL_HEIGHT})`;
    }

    updateScrollSpyConfig(event: { isVisible: boolean; observerEntry: IntersectionObserverEntry; }, scrollSpyIndex: number): void {
        this.elementVisiblePercentageList[scrollSpyIndex] = event.observerEntry.intersectionRatio;
        this.elementVisiblePercentageList = deepCloneObject(this.elementVisiblePercentageList);
    }

    clearAllServiceData(): void {
        this.elementVisiblePercentageList = [];
        this.scrollSpyConfiguration = new ScrollSpyConfiguration();
    }

    scrollSpyCounterChanged(event: ScrollSpyEvent): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'SCROLL_SPY', content: event });
    }

    setTopForTravelDisclosure(): void {
        this.travelTopTimeout && clearTimeout(this.travelTopTimeout);
        this.travelTopTimeout = setTimeout(() => {
            const HEADER = document.getElementById('TRAVEL-DISCLOSURE-HEADER');
            const getHeight = (element: HTMLElement | null) => element ? element.offsetHeight + 20 : 0;
            const TOP_POSITION = getHeight(HEADER);
            this.validationConfig.headerOffSetValue = TOP_POSITION;
        },0);
    }

}
