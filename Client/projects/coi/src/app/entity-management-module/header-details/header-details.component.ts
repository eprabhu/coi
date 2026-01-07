import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { closeCommonModal, combineAddress, deepCloneObject, isEmptyObject, openCoiSlider, openCommonModal, openInNewTab } from '../../common/utilities/custom-utilities';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { EntityDataStoreService } from '../entity-data-store.service';
import {
    CancelModificationReq,
    DataStoreEvent,
    DNBReqObj,
    DuplicateActionType,
    DuplicateCheckObj,
    EntireEntityDetails,
    EntityCardDetails,
    EntityDetails,
    EntityDupCheckConfig,
    EntityFamilyTreeRole,
    EntityTabStatus,
    EntityVersion,
    VerifyModalAction
} from '../shared/entity-interface';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { EntityManagementService, getEntityFullAddress, getMailingAddressString } from '../entity-management.service';
import { CommonService } from '../../common/services/common.service';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { COMMON_ERROR_TOAST_MSG, ENTITY_DOCUMENT_STATUS_TYPE,ENTITY_MANAGE_RIGHT, ENTITY_VERIFICATION_STATUS, FEED_STATUS_CODE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { BASIC_DETAILS, CHECK_FOR_DUNS_MATCHES_INFO, DUPLICATE_MARK_CONFIRMATION_TEXT, DUPLICATE_MARK_INFORMATION_TEXT, DUPLICATE_MARK_INFORMATION_TEXT_WITHOUT_VERIFY, ENTITY__STATUS_TYPE, ENTITY_VERSION_STATUS, GENERAL_COMMENTS, UNLINK_DUNS_MATCHES_INFO } from '../shared/entity-constants';
import { EntityDetailsCardConfig, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { getCurrentTime } from '../../common/utilities/date-utilities';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-header-details',
  templateUrl: './header-details.component.html',
  styleUrls: ['./header-details.component.scss'],
})
export class HeaderDetailsComponent implements OnInit, OnDestroy {

    @ViewChild('mainEntityHeaders', { static: true }) mainEntityHeaders: ElementRef;

    sliderElementId: any;
    isShowOptions = false;
    showSlider = false;
    isShowNavBarOverlay = false;
    $subscriptions: Subscription[] = [];
    entityDetails = new EntityDetails();
    entityFullAddress: string = '';
    latestPriorName: any;
    isEditMode = false;
    matchedEntities: any;
    confirmationModalConfig = {
        isOpenVerifyModal: false,
        modalType: null
    };
    isOpenEntityDuplicate = false;
    entityTabStatus = new EntityTabStatus();
    hasVerifyEntityRight = false;
    canManageEntity = false;
    ENTITY_DUNS_MATCH_CONFIRMATION_MODAL_ID: string = 'use_duns_match_entity_confirmation_modal';
    dunsMatchConfirmationModalConfig = new CommonModalConfig(this.ENTITY_DUNS_MATCH_CONFIRMATION_MODAL_ID, 'Use this', 'Cancel', '');
    selectedDUNSNumber: string;
    isSaving = false;
    cardDetails: EntityCardDetails[] = [];
    canModifyEntity = false;
    duplicateEntityDetails = new EntityCardDetails();
    badgeClass: string;
    originalEntityName: string;
    dupCheckPayload: DuplicateCheckObj;
    entityDupCheckConfig = new EntityDupCheckConfig();
    ENTITY_VERIFIED = ENTITY_VERIFICATION_STATUS.VERIFIED;
    ENTITY_UNVERIFIED = ENTITY_VERIFICATION_STATUS.UNVERIFIED;
    ENTITY_MODIFYING = ENTITY_VERIFICATION_STATUS.MODIFYING;
    ENTITY_DUNS_REFRESH_MODIFYING = ENTITY_VERIFICATION_STATUS.DUNS_REFRESH;
    ENTITY_DUPLICATE = ENTITY_DOCUMENT_STATUS_TYPE.DUPLICATE;
    $triggerModalOpen = new Subject<boolean>();
    isShowMoreActions = false;
    getCurrentTime = getCurrentTime;
    isShowNotesTab = false;
    CHECK_FOR_DUNS_MATCHES_INFO = CHECK_FOR_DUNS_MATCHES_INFO;
    UNLINK_DUNS_MATCHES_INFO = UNLINK_DUNS_MATCHES_INFO;
    isShowCheckForDuns = false;
    modificationIsInProgress = false;
    isShowCommentButton = false;
    commentCount = 0;
    selectedEntityId: number | string | null = null;
    entityVersionList: EntityVersion[] = [];
    selectedVersion: EntityVersion = null;
    deployMap = '';
    entityFamilyTreeRoles: EntityFamilyTreeRole[] = [];
    cancelModalId = 'cancel-modification-confirmation-modal';
    modifyConfirmationId = 'modification-confirmation-modal';
    cancelModificationModalConfig = new CommonModalConfig(this.cancelModalId, 'Yes', 'No', 'lg');
    modifyConfirmationConfig = new CommonModalConfig(this.modifyConfirmationId, 'Modify', 'Cancel');
    unlinkConfirmationId = 'coi-entity-unlink-confirm-modal';
    unlinkConfirmationConfig = new CommonModalConfig(this.unlinkConfirmationId, 'Confirm', 'Cancel');
    cancelModificationDesc = '';
    cancelModificationMandatoryList = new Map();
    cancelledVersion = ENTITY_VERSION_STATUS.CANCELLED;
    activeVersion = ENTITY_VERSION_STATUS.ACTIVE;
    archiveVersion = ENTITY_VERSION_STATUS.ARCHIVE;
    isShowChangeEntityStatusBtn = false;
    isShowGraph = false;
    isShowCancelModifyBtn = false;
    isShowComparisonBtn = true;
    isOpenComparisonSlider = false;
    dunsRefVersionIsInProgress = false;
    isDunsMatchedOnActiveVersion = false;
    isSelectedEntityConfirmed = false;
    isSelectedEntityActive = false;
    isShowDunsMatchSection = false;
    hasOverviewEditRight = false;
     
    @HostListener('window:resize', ['$event'])
    listenScreenSize(event: Event) {
        this.closeHeaderMenuBar();
    }

    constructor(public router: Router,
                public commonService: CommonService,
                public autoSaveService: AutoSaveService,
                private _activatedRoute: ActivatedRoute,
                public dataStore: EntityDataStoreService,
                public entityManagementService: EntityManagementService) { }

    ngOnInit(): void {
        this.dunsMatchConfirmationModalConfig.dataBsOptions.focus = false;
        this.dunsMatchConfirmationModalConfig.dataBsOptions.keyboard = true;
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.listenQueryParamsChanges();
        this.listenToGlobalNotifier();
        this.getAllEntityVersion(this.entityDetails.entityNumber);
        this.getReviewCommentsCounts(this.entityDetails?.entityNumber);
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(GENERAL_COMMENTS);
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(data?.content?.action)) {
                    this.getReviewCommentsCounts(this.entityDetails?.entityNumber);
                    this.entityManagementService.clearReviewCommentsSlider();
                }
            }
            if (data?.uniqueId === 'RELOAD_GLOBAL_ENTITY' && data?.content?.entityId) {
                this.fetchNewEntityAndUpdateStore(data?.content?.entityId, 'RELOAD');
            }
        }));
    }

    private getAllEntityVersion(entityNumber: number | string) {
        this.$subscriptions.push(this.entityManagementService.getAllEntityVersion(entityNumber).subscribe((entityVersionList: any[]) => {
            this.dataStore.updateStore(['entityVersionList'], { entityVersionList });
            this.canOpenComparisonSlider();
        }, (error) => {
            this.dataStore.updateStore(['entityVersionList'], { entityVersionList: [] });
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching entity version');
        }));
    }

    private getReviewCommentsCounts(entityNumber: number | string) {
        this.$subscriptions.push(this.entityManagementService.getReviewCommentsCounts(entityNumber).subscribe((commentCountList: any) => {
            this.dataStore.updateStore(['commentCountList'], { commentCountList });
        }, (error) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private listenQueryParamsChanges(): void {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            const MODULE_ID = params['entityManageId'];
            const ENTITY = this.dataStore.getData();
            if (!MODULE_ID) {
                this.router.navigate([], { queryParams: { entityManageId: ENTITY.entityDetails.entityId }, queryParamsHandling: 'merge', });
            } else if (MODULE_ID != ENTITY.entityDetails.entityId) {
                this.fetchNewEntityAndUpdateStore(MODULE_ID, 'RELOAD');
            }
        }));
    }

    private fetchNewEntityAndUpdateStore(entityId: number | string, triggeredFrom: 'RELOAD' | 'FEED_UPDATE'): void {
        this.$subscriptions.push(this.entityManagementService.getEntityDetails(entityId).subscribe((data: EntireEntityDetails) => {
            this.dataStore.setStoreData(data);
            this.getAllEntityVersion(data?.entityDetails?.entityNumber);
            this.getReviewCommentsCounts(data?.entityDetails?.entityNumber);
            if (triggeredFrom === 'RELOAD') {
                this.resetAutoSaveLoader();
            }
        }, (error) => {
            if (error?.status !== 403) {
                this.navigateToBack();
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }
        }));
    }

    private resetAutoSaveLoader(): void {
        this.commonService.setChangesAvailable(false);
        setTimeout(() => {
            this.commonService.hideSuccessErrorToast();
        }, 100);
    }

    viewSlider(event) {
        this.cardDetails = [];
        this.$subscriptions.push(this.entityManagementService.getDunsMatch(this.getReqObj()).subscribe((data: any) => {
        this.matchedEntities = data?.matchCandidates?.length ? data?.matchCandidates : [];
        if(this.matchedEntities.length) {
            this.matchedEntities.forEach((ele: any) => {
                this.cardDetails.push(this.formatResponse(ele));
            });
        }
        this.showSlider = event;
        this.sliderElementId = 'duns-match-slider';
        setTimeout(() => {
            openCoiSlider(this.sliderElementId);
        });
    }))
    }

    getReqObj(): any {
        let reqObj = new DNBReqObj();
        reqObj.sourceDataName = this.entityDetails.entityName;
        reqObj.sourceDunsNumber = this.entityDetails.dunsNumber || '';
        reqObj.addressLine1 = this.entityDetails.primaryAddressLine1;
        reqObj.addressLine2 = this.entityDetails.primaryAddressLine2 || '';
        reqObj.countryCode = this.entityDetails?.country?.countryTwoCode;
        reqObj.state = '';
        reqObj.postalCode = this.entityDetails.postCode || '';
        reqObj.emailAddress = this.entityDetails.certifiedEmail || '';
        reqObj.entityId = this.entityDetails.entityId || null;
        reqObj.entityNumber = this.entityDetails.entityNumber || null;
        return reqObj;
    }

    validateSliderClose() {
        closeCommonModal(this.ENTITY_DUNS_MATCH_CONFIRMATION_MODAL_ID);
        setTimeout(() => {
            this.showSlider = false;
            this.isOpenEntityDuplicate = false;
            this.sliderElementId = '';
		}, 500);
	  }

    onClickMenuBar() {
        this.updateFeedStatus();
        const NAV_ELEMENT = document.getElementById('coi-entity-responsive-nav');
        const IS_MENU_SHOW = NAV_ELEMENT.classList.contains('show-menu');
        const IS_SCREEN = window.innerWidth <= 1400;

        if (IS_MENU_SHOW) {
            NAV_ELEMENT.classList.remove('show-menu');
            if (IS_SCREEN) {
                this.isShowNavBarOverlay = false;
            }
        } else {
            if (IS_SCREEN) {
                this.isShowNavBarOverlay = true;
                setTimeout(() => {
                    NAV_ELEMENT?.focus();
                }, 50);
            }
            NAV_ELEMENT.classList.toggle('show-menu', IS_SCREEN);
        }
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this.dataStore.getData();
        if (!ENTITY_DATA || isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.entityFamilyTreeRoles = ENTITY_DATA.entityFamilyTreeRoles;
        this.entityVersionList = ENTITY_DATA.entityVersionList || this.entityVersionList;
        this.selectedEntityId = this.entityDetails?.entityId;
        this.selectedVersion = this.entityVersionList?.find((version: EntityVersion) => version.entityId == this.selectedEntityId) || null;
        this.latestPriorName = ENTITY_DATA?.priorNames?.[0]?.priorNames;
        this.entityTabStatus = ENTITY_DATA.entityTabStatus;
        this.commentCount = Object.values(ENTITY_DATA?.commentCountList || {}).reduce((sum: number, count: number) => sum + count, 0) || 0;
        this.modificationIsInProgress = ENTITY_DATA.modificationIsInProgress;
        this.dunsRefVersionIsInProgress = ENTITY_DATA?.dunsRefVersionIsInProgress;
        this.entityTabStatus.entity_overview = this.dataStore.getIsEntityOverviewGreenTick();
        this.entityFullAddress = getEntityFullAddress(this.entityDetails);
        this.isEditMode = this.dataStore.getEditMode();
        this.isShowCheckForDuns = !this.dataStore.checkDunsMatchedForSelectedVersion();
        this.isDunsMatchedOnActiveVersion = ENTITY_DATA.isDunsMatchedOnActiveVersion;
        this.isSelectedEntityConfirmed = this.entityDetails?.entityStatusType?.description === ENTITY__STATUS_TYPE?.CONFIRMED;
        this.isSelectedEntityActive = this.entityDetails?.versionStatus === this.activeVersion;
        this.isShowDunsMatchSection = (!this.isDunsMatchedOnActiveVersion && !this.isSelectedEntityConfirmed) || (this.isDunsMatchedOnActiveVersion && !this.isSelectedEntityConfirmed && this.isSelectedEntityActive);
        this.canModifyEntity = this.getCanModifyEntity();
        this.isShowCancelModifyBtn = this.getCanCancelModification();
        this.hasOverviewEditRight = this.dataStore.getOverviewEditRight(BASIC_DETAILS.sectionId);
        this.badgeClass = this.getBadgeClass();
        this.dupCheckPayload = this.dataStore.getDuplicateCheckRO();
        this.originalEntityName = ENTITY_DATA?.originalName;
        this.checkUserHasRight();
        this.canShowMoreActions();
    }

    private getCanCancelModification(): boolean {
        const HAS_MANAGE_RIGHTS = this.commonService.getAvailableRight(ENTITY_MANAGE_RIGHT, 'SOME');
        const IS_MODIFYING = this.entityDetails?.entityStatusType?.entityStatusTypeCode === ENTITY_VERIFICATION_STATUS.MODIFYING;
        const IS_NOT_CANCELLED_VERSION = this.entityDetails?.versionStatus !== this.cancelledVersion;
        return this.isEditMode && HAS_MANAGE_RIGHTS && IS_MODIFYING && IS_NOT_CANCELLED_VERSION;
    }

    private getBadgeClass(): string {
        switch (this.entityDetails?.entityDocumentStatusType?.documentStatusTypeCode) {
            case ENTITY_DOCUMENT_STATUS_TYPE?.DUPLICATE:
              return 'text-bg-warning';
            case ENTITY_DOCUMENT_STATUS_TYPE?.ACTIVE:
              return 'text-bg-success';
            default:
              return 'text-bg-secondary';
          }
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this.dataStore.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private canOpenComparisonSlider(): void {
        this.isOpenComparisonSlider = sessionStorage.getItem('isShowComparisonBtn') === 'true';
        sessionStorage.removeItem('isShowComparisonBtn');
    }

    formatResponse(entity: any) {
        let entityDetails: EntityCardDetails = new EntityCardDetails();
        entityDetails.entityName = entity.organization.primaryName || '';
        entityDetails.state = entity.organization?.primaryAddress?.addressRegion?.name || '';
        entityDetails.dunsNumber = entity.organization.duns;
        entityDetails.primaryAddress = combineAddress(entity.organization?.primaryAddress?.streetAddress?.line1, entity.organization?.primaryAddress?.streetAddress?.line2);
        entityDetails.city = entity.organization?.primaryAddress?.addressLocality?.name || '';
        entityDetails.country = entity.organization?.primaryAddress?.addressCountry?.name || '';
        entityDetails.phone = entity?.organization?.telephone ? (entity?.organization?.telephone[0]?.telephoneNumber || '') : '';
        entityDetails.postalCode = entity.organization?.primaryAddress?.postalCode || '';
        entityDetails.matchQualityInformation = entity?.matchQualityInformation?.confidenceCode;
        entityDetails.duplicateEntityDetails = entity?.entity ? deepCloneObject(entity?.entity) : null;
        entityDetails.cageNumber = entity.organization?.cageNumber;
        entityDetails.ueiNumber = entity.organization?.uei;
        entityDetails.ownershipType = entity.organization?.ownershipTypeDescription;
        entityDetails.website = entity.organization?.websiteAddress?.[0]?.url;
        entityDetails.entityFamilyTreeRoles = entity.organization?.corporateLinkage.familytreeRolesPlayed;
        entityDetails.businessEntityType = entity.organization?.businessEntityType;
        entityDetails.isForeign = entity?.organization?.isForeign;
        entityDetails.mailingAddress = getMailingAddressString(entity?.organization?.mailingAddress);
        return entityDetails;
    }

    openVerifyEntityModal(modalType: 'CONFIRM' | 'VALIDATION', hasConfirmedNoDuplicate = false): void {
        this.confirmationModalConfig.modalType = modalType;
        this.confirmationModalConfig.isOpenVerifyModal = true;
        this.entityDupCheckConfig.hasConfirmedNoDuplicate = hasConfirmedNoDuplicate;
    }

    verifyModalAction(modalAction: VerifyModalAction): void {
        this.confirmationModalConfig.isOpenVerifyModal = false;
        this.entityDupCheckConfig = new EntityDupCheckConfig();
        if (modalAction.action === 'VIEW_DUPLICATE') {
            this.entityDupCheckConfig.duplicateView = 'SLIDER_VIEW';
            this.entityDupCheckConfig.primaryButton = '';
            this.entityDupCheckConfig.confirmationText = this.confirmationModalConfig.modalType === 'CONFIRM' ? DUPLICATE_MARK_CONFIRMATION_TEXT : '';
            this.entityDupCheckConfig.infoText = this.confirmationModalConfig.modalType === 'CONFIRM' ? DUPLICATE_MARK_INFORMATION_TEXT : DUPLICATE_MARK_INFORMATION_TEXT_WITHOUT_VERIFY;
            this.entityDupCheckConfig.header = 'Potential Entity Duplicates'
            this.entityDupCheckConfig.hasConfirmedNoDuplicate = modalAction.event?.hasConfirmedNoDuplicate;
            this.entityDupCheckConfig.triggeredFrom = 'ENTITY_VERIFY';
            this.entityDupCheckConfig.entityActions = {
                VIEW: { visible: true },
                SET_AS_ORIGINAL: {visible: true, inputType: 'BUTTON'}
            };
            this.entityDupCheckConfig.entityIdToFilter = this.entityDetails.entityId;
            this.isOpenEntityDuplicate = true;
        } else {
            this.confirmationModalConfig.modalType = null;
        }
    }

    duplicateModalAction(event) {
        this.entityDupCheckConfig = new EntityDupCheckConfig();
        this.entityDupCheckConfig.duplicateView = 'SLIDER_VIEW';
        this.entityDupCheckConfig.primaryButton = '';
        this.entityDupCheckConfig.infoText = DUPLICATE_MARK_INFORMATION_TEXT_WITHOUT_VERIFY;
        this.entityDupCheckConfig.header = 'Potential Entity Duplicates'
        this.entityDupCheckConfig.triggeredFrom = 'ENTITY_DUPLICATE';
        this.entityDupCheckConfig.entityActions = {
            VIEW: { visible: true },
            SET_AS_ORIGINAL: {visible: true, defaultValue: false, inputType: 'TOGGLE'}
        };
        this.entityDupCheckConfig.entityIdToFilter = this.entityDetails.entityId;
        this.entityDupCheckConfig.entityCardDetails = event.entityCardDetails;
        this.isOpenEntityDuplicate = true;
    }

    navigateToBack() {
        this.router.navigate(['/coi/entity-dashboard']);
    }

    checkUserHasRight(): void {
        this.hasVerifyEntityRight = this.commonService.getAvailableRight(['VERIFY_ENTITY'], 'SOME');
        this.canManageEntity = this.commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME');
        this.isShowNotesTab = this.commonService.getAvailableRight(['MANAGE_ENTITY_OVERVIEW_NOTES', 'VIEW_ENTITY_OVERVIEW_NOTES']);
    }

    getCanModifyEntity(): boolean {
        return this.commonService.getAvailableRight(ENTITY_MANAGE_RIGHT, 'SOME') &&
        this.entityDetails?.entityStatusType?.entityStatusTypeCode == ENTITY_VERIFICATION_STATUS.VERIFIED && !this.isEditMode &&
        this.entityDetails?.entityDocumentStatusType?.documentStatusTypeCode === ENTITY_DOCUMENT_STATUS_TYPE.ACTIVE && !this.modificationIsInProgress &&
        this.entityDetails?.versionStatus !== this.archiveVersion && !this.dunsRefVersionIsInProgress;
    }

    openConfirmationModal(event: 'USE' | 'OPEN_MODAL',entity: EntityCardDetails) {
        if(event === 'USE') {
            this.selectedDUNSNumber = entity.dunsNumber;
            openCommonModal(this.ENTITY_DUNS_MATCH_CONFIRMATION_MODAL_ID);
        } else if(event === 'OPEN_MODAL') {
            this.duplicateEntityDetails = deepCloneObject(entity.duplicateEntityDetails);
        }
    }

    openDuplicateConfirmationModal(event: {action: 'OPEN_MODAL', event: any}) {
        if(event.action === 'OPEN_MODAL') {
            this.duplicateEntityDetails = deepCloneObject(event.event);
        }
    }

    callEnrichAPI(event) {
        if (event.action === 'PRIMARY_BTN') {
            this.validateSliderClose();
            this.triggerEnrichAPICall();
        }
        closeCommonModal(this.ENTITY_DUNS_MATCH_CONFIRMATION_MODAL_ID);
    }

    triggerEnrichAPICall() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this.entityManagementService.triggerEnrichAPI({
                duns: this.selectedDUNSNumber,
                entityId: this.entityDetails.entityId,
                actionPersonId: this.commonService.getCurrentUserDetail('personID')
            }).subscribe((data: any) => {
                if (data?.httpStatusCode == '200') {
                    this.updateEntityDetails();
                } else {
                    this.validateAndShowErrorToast();
                }
            }, error => {
                this.validateAndShowErrorToast();
            }
            ));
        }
    }

    private validateAndShowErrorToast(): void {
        this.isSaving = false;
        this.entityManagementService.triggerEntityMandatoryValidation();
        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }

    updateEntityDetails() {
        this.$subscriptions.push(forkJoin(this.generateHTTPRequest()).subscribe((response: any) => {
            if (response.length) {
                this.isSaving = false;
                if (response[0]) {
                    this.dataStore.setStoreData(response[0]);
                }
                if (response[1]) {
                    const ENTITY_DATA: EntireEntityDetails = this.dataStore.getData();
                    ENTITY_DATA.entityDetails.isDunsMatched = true;
                    this.dataStore.setStoreData(ENTITY_DATA);
                }
                this.getAllEntityVersion(this.dataStore.getData()?.entityDetails?.entityNumber);
            }
        }, error => {
            this.isSaving = false;
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    generateHTTPRequest() {
        const httpRequest = [];
        httpRequest.push(this.entityManagementService.getEntityDetails(this.entityDetails.entityId));
        httpRequest.push(this.entityManagementService.updateIsDUNSMatchFlag({
            entityId: this.entityDetails.entityId,
            entityRequestFields: {isDunsMatched: true},
            modificationIsInProgress: this.modificationIsInProgress
        }));
        return httpRequest;
    }

    leaveSlider() {
        this.commonService.hideSuccessErrorToast();
        this.commonService.setChangesAvailable(false);
    }

    resetNavigationStop() {
        this.commonService.isNavigationStopped = false;
        this.commonService.attemptedPath = '';
    }

    private modifyEntity(): void {
        this.$subscriptions.push(this.entityManagementService.modifyEntity(this.entityDetails?.entityId, this.entityDetails?.entityNumber).subscribe((data: any) => {
            if (data.copiedEntityId) {
                this.updateFeedStatus();
                this.versionChange({versionNumber: this.selectedVersion?.versionNumber + 1, entityId: data.copiedEntityId});
            }
            closeCommonModal(this.modifyConfirmationId);
        }, (error: any) => {
            if(error?.status === 405) {
                this.commonService.concurrentUpdateAction = 'entity modification';
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }
        }));
    }

    openEntity(): void{
        openInNewTab('manage-entity/entity-overview?', ['entityManageId'], [this.entityDetails?.originalEntityId]);
    }

    duplicateCheckResponse(data: {action: DuplicateActionType, event?: any, entityCardDetails?: EntityDetailsCardConfig}): void {
        this.isOpenEntityDuplicate = false;
        this.entityDupCheckConfig.duplicateView = '';
        if (this.entityDupCheckConfig.triggeredFrom === 'ENTITY_VERIFY') {
           this.openVerifyEntityModal(this.confirmationModalConfig.modalType, data.event?.hasConfirmedNoDuplicate);
        } else if (this.entityDupCheckConfig.triggeredFrom === 'ENTITY_DUPLICATE') {
            this.openStatusChangeModal(data?.entityCardDetails);
        }
    }

    openStatusChangeModal(entityCardDetails:EntityDetailsCardConfig = null) {
        this.entityDupCheckConfig.entityCardDetails = entityCardDetails?.inputOptions?.SET_AS_ORIGINAL?.defaultValue === false ? null : entityCardDetails;
        this.$triggerModalOpen.next(true);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    updateFeedStatus() {
        if((this.entityTabStatus.sponsor_feed_status_code === FEED_STATUS_CODE.READY_TO_FEED || this.entityTabStatus.organization_feed_status_code === FEED_STATUS_CODE.READY_TO_FEED ) &&
          this.entityDetails?.entityStatusType?.entityStatusTypeCode == ENTITY_VERIFICATION_STATUS.VERIFIED) {
            this.fetchNewEntityAndUpdateStore(this.entityDetails.entityId, 'FEED_UPDATE');
        }
    }

    canShowMoreActions() {
        const IS_NOT_DUPLICATE = this.entityDetails?.entityDocumentStatusType?.documentStatusTypeCode !== ENTITY_DOCUMENT_STATUS_TYPE.DUPLICATE && this.entityDetails?.documentStatusTypeCode !== ENTITY_DOCUMENT_STATUS_TYPE.DUPLICATE;
        const IS_VERSION_ACTIVE = this.entityDetails?.versionStatus === this.activeVersion;
        this.isShowComparisonBtn = this.entityVersionList?.length > 1;
        this.isShowGraph = this.commonService.enableGraph && IS_VERSION_ACTIVE;
        this.isShowChangeEntityStatusBtn = this.canManageEntity && IS_NOT_DUPLICATE && IS_VERSION_ACTIVE && !this.modificationIsInProgress && this.hasOverviewEditRight;
        this.isShowMoreActions =  this.isShowComparisonBtn || this.isShowGraph || this.isShowChangeEntityStatusBtn;
    }

    versionChange(selectedVersion: any): void {
        this.selectedVersion = selectedVersion;
        this.selectedEntityId = selectedVersion?.entityId;
        this.router.navigate(['/coi/manage-entity/entity-overview'], { queryParams: { entityManageId: this.selectedEntityId }, queryParamsHandling: 'merge', });
    }

    openAllReviewComment(): void {
        this.entityManagementService.openReviewCommentsSlider({
            sectionTypeCode: GENERAL_COMMENTS.sectionTypeCode,
            commentTypeCode: GENERAL_COMMENTS.commentTypeCode
        });
    }

    triggerClickForId(elementId: string): void {
        if (elementId) {
            document.getElementById(elementId).click();
        }
    }

    closeHeaderMenuBar(): void {
        setTimeout(() => {
            const NAV_ELEMENT = document.getElementById('coi-entity-responsive-nav');
            NAV_ELEMENT.classList.remove('show-menu');
            this.isShowNavBarOverlay = false;
        });
    }

    cancelModificationPostConfirmation(modalActionEvent: ModalActionEvent) {
        if (modalActionEvent.action === 'PRIMARY_BTN') {
            this.cancelModification();
        } else {
            this.cancelModificationDesc = '';
            this.cancelModificationMandatoryList.clear();
            closeCommonModal(this.cancelModalId)
        }
    }

    private cancelModification(): void {
        this.validateDescription();
        if (!this.cancelModificationMandatoryList.size) {

            this.$subscriptions.push(this.entityManagementService.cancelModification(this.getRequestObject()).subscribe((data: any) => {
                this.cancelModificationDesc = '';
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Entity modification cancelled successfully.');
                this.router.navigate(['/coi/manage-entity/entity-overview'], { queryParams: { entityManageId: data?.activeEntityId }, queryParamsHandling: 'merge' });
                closeCommonModal(this.cancelModalId);
            }, err => {
                if (err.status === 405) {
                    closeCommonModal(this.cancelModalId);
                    this.commonService.concurrentUpdateAction = 'cancel modification';
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            }));
        }
    }

    private getRequestObject(): CancelModificationReq {
        const REQ_OBJ = new CancelModificationReq();
        REQ_OBJ.entityId = this.entityDetails.entityId;
        REQ_OBJ.entityNumber = this.entityDetails.entityNumber;
        REQ_OBJ.description = this.cancelModificationDesc;
        return REQ_OBJ;
    }

    private validateDescription(): void {
        this.cancelModificationMandatoryList.delete('CANCEL_MODIFICATION_DESC');
        if (!this.cancelModificationDesc) {
            this.cancelModificationMandatoryList.set('CANCEL_MODIFICATION_DESC', 'Please enter the description.');
        }
    }

    openCancelConfirmtaionModal() {
        this.cancelModificationModalConfig.ADAOptions.primaryBtnTitle = 'Click here to Cancel Modification';
        this.cancelModificationModalConfig.ADAOptions.secondaryBtnTitle = 'Click here to discard';
        openCommonModal(this.cancelModalId);
    }

    openModifyConfirmationModal() {
        this.modifyConfirmationConfig.ADAOptions.primaryBtnTitle = 'Click here to modify entity';
        this.modifyConfirmationConfig.ADAOptions.secondaryBtnTitle = 'Click here to cancel modification';
        openCommonModal(this.modifyConfirmationId);
    }

    modifyPostConfirmation(modalActionEvent: ModalActionEvent) {
        if (modalActionEvent.action === 'PRIMARY_BTN') {
            this.modifyEntity();
        } else {
            closeCommonModal(this.modifyConfirmationId);
        }
    }

    openGraph(entityId, entityName) {
        const TRIGGERED_FROM = 'ENTITY_PAGE_MORE_OPTION';
        this.commonService.openEntityGraphModal(entityId, entityName, TRIGGERED_FROM);
    }

    comparisonSliderActions(event: any): void {
        if (event?.action === 'SLIDER_CLOSE' && (event?.content?.closeType === 'MANUAL' || !event?.content?.isOpenSlider)) {
            this.isOpenComparisonSlider = false;
        }
    }

    openUnlinkConfirmationModal(): void {
        this.modifyConfirmationConfig.ADAOptions.primaryBtnTitle = 'Click here to unlink selected D&B associated with this entity';
        this.modifyConfirmationConfig.ADAOptions.secondaryBtnTitle = 'Click here to cancel';
        openCommonModal(this.unlinkConfirmationId);
    }

    unlinkPostConfirmation(modalActionEvent: ModalActionEvent): void {
        if (modalActionEvent.action === 'PRIMARY_BTN') {
            this.unlinkEntityDunsMatch();
        } else {
            closeCommonModal(this.unlinkConfirmationId);
        }
    }

    private unlinkEntityDunsMatch(): void {
        this.$subscriptions.push(this.entityManagementService.unlinkDnbMatchDetails(this.entityDetails.entityId).subscribe((data) => {
            closeCommonModal(this.unlinkConfirmationId);
            this.fetchNewEntityAndUpdateStore(this.entityDetails.entityId, 'RELOAD');
        },
        error => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }))
    }

}