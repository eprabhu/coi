import { COIFormValidation, COIValidationModalConfig, GlobalEventNotifier, PrintModalConfig,DocumentActionStorageEvent, DocumentTypes } from './../../../common/services/coi-common.interface';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { EntityDetailsService, FormValidationRO } from '../entity-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { subscriptionHandler } from '../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { Subject, Subscription, forkJoin, Observable } from 'rxjs';
import {
    ADMIN_DASHBOARD_URL, REPORTER_HOME_URL, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, SFI_ADDITIONAL_DETAILS_SECTION_NAME,
    COMMON_ERROR_TOAST_MSG, DISCLOSURE_TYPE, DISCLOSURE_REVIEW_STATUS, CREATE_DISCLOSURE_ROUTE_URL, POST_CREATE_DISCLOSURE_ROUTE_URL,
    OPA_CHILD_ROUTE_URLS, RELATIONS_TYPE_SUMMARY,
    FINANCIAL_SUB_TYP_CODES, ENGAGEMENT_SLIDER_ID, CREATE_DISCLOSURE_ENGAGEMENT_ROUTE_URL, ENTITY_DOCUMENT_STATUS_TYPE,
    COI_MODULE_CODE,
    RELATIONSHIP_DETAILS_SECTION_NAME, DATE_PLACEHOLDER, ENGAGMENT_HEADER_CARD_ORDER,
    RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME,
    FINANCIAL_DETAILS_SECTION_NAME,
    RISK_ICON_COLOR_MAPPING,
    ADMIN_DASHBOARD_RIGHTS,
    COI_DISCLOSURE_SUPER_ADMIN_RIGHTS,
    ENTITY_RIGHTS,
    OPA_DISCLOSURE_ADMIN_RIGHTS,
    OPA_DISCLOSURE_RIGHTS,
    ENGAGEMENT_SUB_MODULE_CODE,
    USER_DASHBOARD_CHILD_ROUTE_URLS,
    ENGAGEMENT_ROUTE_URL,
    ENGAGEMENT_SUB_ITEM_KEY,
    TRAVEL_DISCLOSURE_FORM_ROUTE_URL,
    DISCLOSURE_TYPE_CODE,
    ENGAGEMENT_TYPE_ICONS,
    ENGAGEMENT_FLOW_TYPE,
    OPA_VERSION_TYPE,
    SFI_TARGET_AMOUNT,
    TRAVEL_CREATE_BASE_URL
} from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { NavigationService } from '../../../common/services/navigation.service';
import { isEmptyObject, scrollIntoView } from '../../../../../../fibi/src/app/common/utilities/custom-utilities';
import { getInvalidDateFormatMessage, compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { HeaderService } from '../../../common/header/header.service';
import { CoiDisclosure } from '../../coi-interface';
import { DisclosureCreateModalService } from '../../../shared-components/disclosure-create-modal/disclosure-create-modal.service';
import { COIMatrix, CreateDisclosureModalDetails, EngagementVersion, MATRIX_TYPE, QUESTIONNAIRE_TYPE } from '../engagement-interface';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, deepCloneObject, openCommonModal, closeCoiSlider, openModal, restrictDecimalInput, hideAutoSaveToast, arrangeFormValidationList } from '../../../common/utilities/custom-utilities';
import { FCOIDisclosureCreateRO } from '../../../shared-components/shared-interface';
import { EntityComplianceDetails } from '../../../entity-management-module/shared/entity-interface';
import { TravelRO } from '../../../user-dashboard/user-home/user-home.interface';
import { CoiStepsNavActionType, CoiStepsNavConfig } from '../../../shared-components/coi-steps-navigation/coi-steps-navigation.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { checkAllAreUncomp, checkHasAnyLowRange, groupBy, isMatrixReadyForSubmission } from '../engagment-utilities';
import { MigratedEngagementsService } from '../../../migrated-engagements/migrated-engagements.service';
import { LegacyEngagement } from '../../../migrated-engagements/migrated-engagements-interface';
import { COMMON_DISCL_LOCALIZE, ENGAGEMENT_LOCALIZE } from '../../../app-locales';
import { AutoSaveEvent, AutoSaveService } from '../../../common/services/auto-save.service';
import { debounceTime } from 'rxjs/operators';
import { ValidationConfig } from '../../../configuration/form-builder-create/shared/form-validator/form-validator.interface';

@Component({
    selector: 'app-view-relationship-details',
    templateUrl: './view-relationship-details.component.html',
    styleUrls: ['./view-relationship-details.component.scss'],
    providers: [DisclosureCreateModalService]
})
export class ViewRelationshipDetailsComponent implements OnInit, OnDestroy {

    @Input() entityId: any;
    @Input() entityNumber: any;
    @Input() isTriggeredFromSlider = false;

    @Output() closeEntityInfoCard: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('startDateInput', { static: false }) startDateInput?: ElementRef;
    @ViewChild('endDateInput', { static: false }) endDateInput?: ElementRef;

    private dynamicTopTimeOut: any;
    isReadMoreBusinessArea = false;
    isReadMoreUniversity = false;
    isReadMoreRelationWith = false;
    isEnableActivateInactivateSfiModal = false;
    isEditMode = false;
    isCOIAdministrator = true;
    hasPendingFCOI = false;
    hasFCOIDisclosure = false;
    isShowSearchAndInfo = false;
    hasSubmittedDisclosure = false;

    datePlaceHolder = DATE_PLACEHOLDER;
    relationshipsDetails: any = {};
    $subscriptions: Subscription[] = [];
    allRelationQuestionnaires = [];
    updatedRelationshipStatus: string;
    mandatoryList = new Map();
    engagementVersionList: EngagementVersion[] = [];
    selectedVersion: EngagementVersion = null;
    changedEntityId: any;
    selectedVersionEntityId: any;
    entityDetails: any = {};
    involvementDate = {
        involvementStartDate: null,
        involvementEndDate: null
    }
    additionalDetails: any = {
        sponsorsResearch: false,
        isCompensated: false,
        isCommitment: false
    };
    isCardExpanded = true;
    isUserCollapse = false;
    canViewEntity = false;
    infoText = '';
    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    hasFinancialRelations = false;
    pendingInitialRevisionDiscl: CoiDisclosure = null;
    MATRIX_TYPE = MATRIX_TYPE;
    QUESTIONNAIRE_TYPE = QUESTIONNAIRE_TYPE;
    $saveCustomData = new Subject();
    unifiedPersonEntityRelationships = [];
    CREATE_OPA_MODAL = 'CREATE_OPA_MODAL_ID';
    modalConfig = new CommonModalConfig(this.CREATE_OPA_MODAL, 'Yes', 'No', 'lg');
    COMP_SWITCH_OFF_MODAL_ID = 'COMP_SWITCH_OFF_MODAL_ID';
    compSwitchOffModalConfig = new CommonModalConfig(this.COMP_SWITCH_OFF_MODAL_ID, 'Yes', 'Cancel');
    commitmentToggleModalConfig = new CommonModalConfig('commitment-toggle-modal', 'Yes', 'Cancel');
    compMsg: 'compensated' | 'uncompensated' | '' = '';
    disclosureModalDetails = new CreateDisclosureModalDetails();
    opaModalMessage: string;
    helptextForDiscModal = 'Please enter comments';
    disclMandatoryList = new Map();
    disclDescription = '';
    isCustomDataChanged = false;
    cardOrder = ENGAGMENT_HEADER_CARD_ORDER;
    entityFamilyTreeRoles = [];
    canShowEngLinkToFcoiInfo = false;
    entityDocumentStatusType = ENTITY_DOCUMENT_STATUS_TYPE;
    additionalBtns: { action: string, event: any }[] = [];
    opaDataAfterEvaluation: any;
    fcoiDataAfterEvaluation: any;
    COMMITMENT_TYPE = RELATIONS_TYPE_SUMMARY.COMMITMENT;
    FINANCIAL_TYPE = RELATIONS_TYPE_SUMMARY.FINANCIAL;
    TRAVEL_TYPE = RELATIONS_TYPE_SUMMARY.TRAVEL;
    isShowInfo = false;
    lastScrollTop = 0;
    scrollTop = 0;
    isManuallyExpanded = false;
    isScrolled = false;
    isSaving = false;
    isValidateFormSaving = false;
    isFormEvaluationSaving = false;
    DISCLOSUE_MODULE_CODE = COI_MODULE_CODE;
    relationshipDetailsSectionName = '';
    canCreateFCOI = false;
    canCreateOPA = false;
    isShowRiskLevel = false;
    riskIconColor = RISK_ICON_COLOR_MAPPING;
    complianceInfo = new EntityComplianceDetails();
    formList = [];
    formId: number | string;
    engagementsError: COIFormValidation[] = [];
    isFormEvaluationNeeded = false;
    isTravelDisclosureRequired = false;
    setValidationTimer: ReturnType<typeof setTimeout>;
    relatedDislcosures: any[] = [];
    isMatrixTypeAvailable = false;
    groupedRelations = {};
    matchDisclosurePaths = [
        '/coi/create-disclosure/sfi',
        '/coi/opa/form',
        '/coi/create-travel-disclosure',
        '/coi/create-disclosure/relationship'
    ];
    checkedRelationships = {};
    isDeleteButtonDisabled = false;
    engagementTypeIcons = ENGAGEMENT_TYPE_ICONS;
    dateValidationMap = new Map();
    isFromEngMigration = false;
    migratedEngagementId = '';
    migEngagementDetails = new LegacyEngagement();
    isFinancialTabViewed = false;
    deployMap = environment.deployUrl;
    compAmntModalId = 'COMP_AMOUNT_CAPTURING_MODAL';
    compAmntModalConfig = new CommonModalConfig(this.compAmntModalId, 'Confirm', 'Cancel');
    compensatedAmount = null;
    matrixSaveResponse = null;
    compAmountModalHeader = 'Add Total Compensated Income';
    isUpdateAmount = false;
    compAmountValidationMap = new Map();
    restrictDecimalInput = restrictDecimalInput;
    isFinancialAvailable = false;
    isTravelAvailable = false;
    isSystemDefinedAmount = false;
    isProceedButtonClicked = false;
    ENGAGEMENT_FLOW_TYPE = ENGAGEMENT_FLOW_TYPE;
    FINANCIAL_DETAILS_SECTION_NAME = FINANCIAL_DETAILS_SECTION_NAME;
    $debounceTimerForSave = new Subject();
    isAutoSaving = false;
    ENGAGEMENT_LOCALIZE = ENGAGEMENT_LOCALIZE;
    printModalConfig = new PrintModalConfig();
    validationConfig = new ValidationConfig();

    @HostListener('window:resize', ['$event'])
    listenScreenSize(event: Event) {
        if (!this.isTriggeredFromSlider) {
            if(!this.isUserCollapse) {
                this.isCardExpanded = window.innerWidth > 1399;
            }
            this.setTopForStickySections();
        }
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event: Event) {
        if (!this.isTriggeredFromSlider) {
            this.scrollTop = window.scrollY || document.documentElement.scrollTop;
            if (!this.isManuallyExpanded && !this.isScrolled) {
                if (this.scrollTop === 0 && !this.isCardExpanded) {
                    this.isCardExpanded = true;
                } else if (this.scrollTop > this.lastScrollTop && this.isCardExpanded) {
                    this.isScrolled = true;
                    this.isCardExpanded = false;
                }
                this.setTopForStickySections();
            }
            this.lastScrollTop = this.scrollTop <= 0 ? 0 : this.scrollTop;
            setTimeout(() => {
                this.isScrolled = false;
            }, 50);
        }
    }

    constructor(public entityDetailsServices: EntityDetailsService, private _router: Router,
        private _route: ActivatedRoute, public commonService: CommonService, private _navigationService: NavigationService,
        private _disclosureCreateModalService: DisclosureCreateModalService, private _headerService: HeaderService, private http: HttpClient,
        private _migratedEngagementService: MigratedEngagementsService, public autoSaveService: AutoSaveService) {
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        clearTimeout(this.dynamicTopTimeOut);
        clearTimeout(this.setValidationTimer);
        this.entityDetailsServices.clikcedTab = '';
        this.validationConfig = new ValidationConfig();
    }

    async ngOnInit() {
        this.isCardExpanded = !this.isTriggeredFromSlider;
        this.canViewRiskLevel();
        await this.checkForCreateAction();
        await this.setDefaultValues();
        this.isCOIAdministrator = this.commonService.getAvailableRight(['MANAGE_FCOI_DISCLOSURE', 'MANAGE_PROJECT_DISCLOSURE']);
        this.checkUserHasRight();
        this.listenToGlobalNotifier();
        this.listenForFormSaveComplete();
        this.updateStepsNavBtnConfig();
        this.getActiveDisclosure();
        this.checkEngagementsToMigrate();
        this.listenToDebounceTimer();
        this.autoSaveSubscribe();
        this.updateURL({ personEntityId: this.entityId, personEntityNumber: this.relationshipsDetails.personEntityNumber });
    }

    private checkEngagementsToMigrate(): void {
        this.migratedEngagementId = sessionStorage.getItem('migratedEngagementId');
        if (this.commonService.isEnableLegacyEngMig && this.migratedEngagementId) {
            this.isFromEngMigration = true;
            this._headerService.triggerMigrationEngagementCount();
            this.fetchMigEngagementDetails(this.migratedEngagementId);
        }
    }

    private isValidForEngMigration(): boolean {
        const IS_COMPENSATED = this.relationshipsDetails.isCompensated;
        const IS_FINANCIAL_TAB_VIEWED = !IS_COMPENSATED || (IS_COMPENSATED && this.isFinancialTabViewed);
        return !this.isFromEngMigration || (this.isFromEngMigration && IS_FINANCIAL_TAB_VIEWED);
    }

    private fetchMigEngagementDetails(engagementId: string): void {
        this.$subscriptions.push(this._migratedEngagementService.getLegacyEngagementDetails(engagementId).subscribe((data: LegacyEngagement) => {
            if (data) {
                this.migEngagementDetails = data;
            }
        }, (error) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    viewEngagementDetails(): void {
            this._migratedEngagementService.openEngagementSlider(this.migEngagementDetails);
    }

    // Updates the status of the current migrated engagement from 'In Progress' to 'Complete' when the engagement is complete
    private updateMigratedEngStatus(status: 'COMPLETED', engagementID: number | string): void {
        const ENG_ID_ARRAY = [];
        if(engagementID){
            ENG_ID_ARRAY.push(engagementID);
        }
        const ENG_STATUS_RO = {
            migrationStatus: status,
            engagementIds: ENG_ID_ARRAY
        };
        this.$subscriptions.push(
            this._migratedEngagementService.updateEngagementStatus(ENG_STATUS_RO)
                .subscribe({
                    next: () => {
                        this._headerService.triggerMigrationEngagementCount();
                    },
                    error: () => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                })
        );
    }

    private statusChangeIfEngagementCompleted(isCompleted: boolean): void {
        if (this.isFromEngMigration && isCompleted) {
            this.updateMigratedEngStatus('COMPLETED', this.migratedEngagementId);
        }
    }

    private canViewRiskLevel(): void {
        const FCOI_ADMIN_RIGHTS = this.commonService.getAvailableRight(COI_DISCLOSURE_SUPER_ADMIN_RIGHTS) || this.commonService.getAvailableRight(ADMIN_DASHBOARD_RIGHTS);
        const OPA_ADMIN_RIGHTS = this.commonService.getAvailableRight(OPA_DISCLOSURE_ADMIN_RIGHTS) || this.commonService.getAvailableRight(OPA_DISCLOSURE_RIGHTS);
        const ENTITY_ADMIN_RIGHTS = this.commonService.getAvailableRight(ENTITY_RIGHTS);
        this.isShowRiskLevel = FCOI_ADMIN_RIGHTS || OPA_ADMIN_RIGHTS || ENTITY_ADMIN_RIGHTS;
    }

    setTopForStickySections() {
        this.dynamicTopTimeOut && clearTimeout(this.dynamicTopTimeOut);
        this.dynamicTopTimeOut = setTimeout(() => {
            const ELEMENTS = {
                INFO_TEXT : document.getElementById('coi-engagement-info-text'),
                HEADER_CARD : document.getElementById('coi-engagement-header-card'),
                MAIN_NAV : document.getElementById('coi-main-engagement-nav'),
                SUB_NAV : document.getElementById('coi-engagement-sub-nav'),
                TABLE_HEADER : document.getElementById('coi-engagement-matrix-table-thead-tr')
            }
            const OFFSET = this.isTriggeredFromSlider ? -20 : 40;
            const TABLE_OFFSET = this.isTriggeredFromSlider ? -22 : 38;

            const getHeight = (element) => element ? element.offsetHeight : 0;
            let topPosition = getHeight(ELEMENTS.HEADER_CARD);
            if (ELEMENTS?.INFO_TEXT) {
                ELEMENTS.INFO_TEXT.style.top = `${topPosition + (this.isTriggeredFromSlider ? -20 : 50)}px`;
                topPosition += getHeight(ELEMENTS?.INFO_TEXT);
            }
            if (ELEMENTS.MAIN_NAV) {
                ELEMENTS.MAIN_NAV.style.top = `${topPosition + OFFSET}px`;
            }
            topPosition += getHeight(ELEMENTS?.MAIN_NAV);
            if (ELEMENTS?.SUB_NAV) {
                ELEMENTS.SUB_NAV.style.top = `${topPosition + OFFSET}px`;
                topPosition += getHeight(ELEMENTS.SUB_NAV);
            }
            if (ELEMENTS?.TABLE_HEADER) {
                ELEMENTS.TABLE_HEADER.style.top = `${topPosition + TABLE_OFFSET}px`;
            }
            this.validationConfig.headerOffSetValue = topPosition;
        });
    }

    private async setDefaultValues() {
        this.infoText = '';
        await this.getEntityDetails(this.entityId);
        this.setTotalCompAmount();
        this.isEditMode = this.checkForEditMode();
        await this.getApplicableForms();
        this.selectedVersionEntityId = this.entityId;
        this.updateRelationshipDetailsStatus();
        this.getSfiVersion();
        this.listenForQuestionnaireSave();
        this.updatePersonEntityRelationships();
        await this.isMandatoryComponentAvailable();
        this.getRelatedDisclosures();
    }

    /**
     * Determines whether engagement meets the criteria for FCOI creation based on the configured
     * engagement type and presence of financial relationship or significant financial interest.
     *
     * Logic:
     * - 'ALL_SFI': Requires both a financial relationship and significant financial interest.
     * - 'ALL_FIN': Requires only a financial relationship.
     * - 'ALL_ENG': Always allowed regardless of financial.
     * - Default: Not allowed.
     */
    private getEngagementSfiOrAllFinancial(): boolean {
        switch (this.commonService.engagementTypeForCoiDisclosure) {
            case 'ALL_SFI':
                return this.hasFinancialRelationship() && this.relationshipsDetails?.isSignificantFinInterest;
            case 'ALL_FIN':
                return this.hasFinancialRelationship();
            case 'ALL_ENG':
                return true;
            default:
                return false;
        }
    }

    async getQueryParams() {
        this.$subscriptions.push(this._route.queryParams.subscribe(async (params: any) => {
            if (this.entityId != params['personEntityId']) {
                this.entityId = params['personEntityId'];
                await this.setDefaultValues();
            }
        }));
    }

    checkForEditMode() {
        if (this._route.snapshot.queryParamMap.get('mode') == 'E' && this.entityDetailsServices.canMangeSfi) {
            return true;
        } else if (this.isTriggeredFromSlider) {
            return false;
        } else if (this.entityDetailsServices.canMangeSfi && !this.relationshipsDetails.isFormCompleted && this.relationshipsDetails.versionStatus != 'INACTIVE') {
            return true;
        } else {
            return false;
        }
    }

    private getSfiVersion(): void {
        if (!isEmptyObject(this.relationshipsDetails)) {
            this.$subscriptions.push(this.entityDetailsServices.getSfiVersion(this.relationshipsDetails.personEntityNumber).subscribe((data: EngagementVersion[]) => {
                this.engagementVersionList = data || [];
                this.selectedVersion = this.engagementVersionList?.find((version: EngagementVersion) => version?.personEntityId == this.selectedVersionEntityId) || null;
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in opening selected version, please try again');
            }));
        }
    }

    updatePersonEntityRelationships() {
        this.$subscriptions.push(this.entityDetailsServices.$addOrDeleteRelation.subscribe((data: any) => {
            this.getGroupedTabs();
            this.entityDetailsServices.uniqueTabDetials = this.setUniqueDisclosureType();
            this.relationshipsDetails.updateTimestamp = data?.updateTimestamp;
            this.relationshipsDetails.isFormCompleted = data?.isFormCompleted;
            this.setEngagementStatusInService();
            this.updateEditMode();
            this.updateRelationshipDetailsStatus(true);
            this.openQuestionnaireOrMatrix(data?.element[0]?.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode, data?.element[0]);
            this.openNonUnifiedSuccessModal();
        }));
    }

    private getGroupedTabs(): void {
        this.isMatrixTypeAvailable = this.entityDetailsServices.definedRelationships.find(ele => ele?.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode === MATRIX_TYPE);
        this.groupedRelations = this.gropuByRelationType(this.entityDetailsServices.definedRelationships, "validPersonEntityRelType" , "coiDisclosureType", "description");
    }

    private openNonUnifiedSuccessModal(): void {
        if(this.relationshipsDetails.isFormCompleted) {
            this.openEngSuccessModal();
        }
    }

    versionChange(version: EngagementVersion): void {
        this.entityDetailsServices.isVersionChange = true;
        this.selectedVersion = version;
        this.changedEntityId = version.personEntityId;
        this.entityDetailsServices.validationList = [];
        if (!this.isTriggeredFromSlider) {
            this.updateURL({ 'personEntityId': this.getEntityId(), 'personEntityNumber': this.getEntityNumber() });
        }
        this.updateDropDownValue();
        if (this.entityDetailsServices.isRelationshipQuestionnaireChanged || this.entityDetailsServices.isAdditionalDetailsChanged || this.entityDetailsServices.isMatrixChanged || this.entityDetailsServices.isFormDataChanged) {
            this.entityDetailsServices.$emitUnsavedChangesModal.next();
        } else {
            this.loadCurrentVersion();
        }
    }

    updateDropDownValue() {
        const ENTITY_ID = this.selectedVersionEntityId;
        this.selectedVersionEntityId = null;
        setTimeout(() => {
            this.selectedVersionEntityId = ENTITY_ID;
        });
    }

    async loadCurrentVersion() {
        this.entityDetailsServices.currentRelationshipQuestionnaire = {};
        await this.getEntityDetails(this.changedEntityId);
        this.entityId = this.changedEntityId;
        this.selectedVersionEntityId = this.changedEntityId;
        this.updateEditMode();
        await this.fetchRelationTypes();
        if(this.entityDetailsServices.activeTab === 'RELATION_DETAILS') {
            await this.getApplicableForms();
        }
        if(this.entityDetailsServices.activeTab === 'QUESTIONNAIRE') {
            if (this.commonService.isUnifiedQuestionnaireEnabled) {
                this.fetchDisclosureQuestionType();
            } else {
                this.updateRelationshipDetailsStatus();
            }
        }
    }

    fetchRelationTypes(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.$subscriptions.push(this.entityDetailsServices.fetchDisclosureQuestionType(this.entityId).subscribe((data: any) => {
                this.entityDetailsServices.selectedDisclosureTypes = data;
                this.isMulptipleRelationAvailable();
                resolve(true);
            }, async _error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                resolve(false);
            }))
        });
    }

    fetchDisclosureQuestionType() {
        if (this.commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.isShowRelationshipDetailsTab) {
            this.$subscriptions.push(this.entityDetailsServices.fetchDisclosureQuestionType(this.entityId).subscribe((data: any) => {
                this.entityDetailsServices.selectedDisclosureTypes = data;
                this.isMulptipleRelationAvailable();
                if (this.entityDetailsServices.isShowRelationshipDetailsTab) {
                    const SELECTED_TYPE = this.entityDetailsServices?.selectedDisclosureTypes?.find(item => item.dataCapturingTypeCode);
                    this.openIfUnifiedQuestionnaire(SELECTED_TYPE);
                } else {
                    this.openRelationShipSection();
                }
            }));
        }
    }

    setTabName(): void {
        const HAS_TRAVEL_DATA_CAPTURING = this.entityDetailsServices?.definedRelationships.some(ITEM => ITEM?.validPersonEntityRelType?.coiDisclosureType?.disclosureTypeCode === RELATIONS_TYPE_SUMMARY.TRAVEL.toString() && ITEM?.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode != null);
        const SHOULD_SHOW_FINANCIAL = this.commonService.isCompensatedFlow && this.isFinancialAvailable &&
                                      (!this.isTravelAvailable || (this.isTravelAvailable && !HAS_TRAVEL_DATA_CAPTURING));
        this.relationshipDetailsSectionName = SHOULD_SHOW_FINANCIAL ? FINANCIAL_DETAILS_SECTION_NAME : RELATIONSHIP_DETAILS_SECTION_NAME;
    }

    isMulptipleRelationAvailable(): void {
        this.entityDetailsServices.isCommitmentTabAvailable = !!this.entityDetailsServices?.selectedDisclosureTypes?.find(ele => ele?.dataCapturingTypeCode === QUESTIONNAIRE_TYPE || ele?.dataCapturingTypeCode === MATRIX_TYPE)
        this.canShowRelationTab();
    }

    getEntityId() {
        return this._route.snapshot.queryParamMap.get('personEntityId');
    }

    getEntityNumber() {
        return this._route.snapshot.queryParamMap.get('personEntityNumber');
    }

    getEntityDetails(personEntityId, canLoadFirstRelation = true) {
        return new Promise<boolean>((resolve) => {
            this.$subscriptions.push(this.entityDetailsServices.getRelationshipEntityDetails(personEntityId).subscribe(async (res: any) => {
                this.relationshipsDetails = res?.personEntity;
                this.setTotalCompAmount();
                this.setEngagementStatusInService();
                this.entityDetailsServices.definedRelationships = res?.personEntityRelationships;
                this.getGroupedTabs();
                this.entityDetailsServices.uniqueTabDetials = this.setUniqueDisclosureType();
                this.entityDetailsServices.perEntDisclTypeSelections = res?.perEntDisclTypeSelections;
                this.canShowEngLinkToFcoiInfo = res?.canShowEngLinkToFcoiInfo;
                this.getUnifiedPersonEntityRelationships();
                this.getFinancialRelations();
                this.entityDetailsServices.currentVersionDetails = {
                    versionNumber: this.relationshipsDetails?.versionNumber,
                    personEntityNumber: this.relationshipsDetails?.personEntityNumber,
                    personEntityId: this.relationshipsDetails?.personEntityId
                };
                this.setAdditionalDetails(res.personEntity);
                this.entityDetailsServices.canMangeSfi = this.relationshipsDetails.personId === this.commonService.currentUserDetails.personID ? true : false;
                this.updatedRelationshipStatus = this.relationshipsDetails?.versionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                if (canLoadFirstRelation) {
                    if (this.commonService.isUnifiedQuestionnaireEnabled) {
                        if (this.entityDetailsServices?.currentRelationshipQuestionnaire?.dataCapturingTypeCode === QUESTIONNAIRE_TYPE) {
                            this.triggerOpenQuestionnaire(this.entityDetailsServices?.selectedDisclosureTypes[0]);
                        }
                    } else {
                        const SELECTED_TYPE = this.entityDetailsServices?.selectedDisclosureTypes?.find(item => item.dataCapturingTypeCode);
                        this.entityDetailsServices.currentRelationshipQuestionnaire = SELECTED_TYPE;
                        this.triggerOpenQuestionnaire(this.entityDetailsServices.definedRelationships[0]);
                    }
                }
                this.infoText = '';
                if (this.canShowEngLinkToFcoiInfo && this.hasFinancialRelations) {
                    this.getActiveDisclosure();
                }
                this.getSfiEntityDetails();
                if(res?.perEntFormBuilderDetails?.length) {
                    this.entityDetailsServices.formBuilderId = res?.perEntFormBuilderDetails[0]?.formBuilderId;
                }
                this.isFinancialAvailable = this.entityDetailsServices.perEntDisclTypeSelections?.some(ele => ele?.disclosureTypeCode == this.FINANCIAL_TYPE) || this.entityDetailsServices.definedRelationships?.find(ele => ele?.validPersonEntityRelType?.disclosureTypeCode.toString() === this.FINANCIAL_TYPE.toString());
                this.isTravelAvailable = this.entityDetailsServices.definedRelationships?.find(ele => ele?.validPersonEntityRelType?.disclosureTypeCode.toString() === this.TRAVEL_TYPE.toString());
                this.setTabName();
                resolve(true);
            }, async _error => {
                if (_error.status != 403) {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
                resolve(false);
            }));
        });
    }

    private setTotalCompAmount(): void {
        if (this.relationshipsDetails?.isSignificantFinInterest && this.commonService.isSfiEvaluationEnabled && isMatrixReadyForSubmission(this.entityDetailsServices.matrixResponse)) {
            this.relationshipsDetails.compensationAmount = `>= ${this.commonService.currencySymbol}${SFI_TARGET_AMOUNT}`;
            this.isSystemDefinedAmount = true;
        } else {
            this.isSystemDefinedAmount = false;
        }
    }

    private gropuByRelationType(jsonData, outkey, key, innerKey): any {
        return jsonData.reduce((relationsTypeGroup, item) => {
            (relationsTypeGroup[item[outkey][key][innerKey]] = relationsTypeGroup[item[outkey][key][innerKey]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

    private setUniqueDisclosureType(): any[] {
        const DISCLSOURE_TYPES = new Set<string>();
        const RESULT: any[] = [];
        for (const ITEM of this.entityDetailsServices.definedRelationships) {
            const TYPE_CODE = ITEM?.validPersonEntityRelType?.coiDisclosureType?.disclosureTypeCode;
            if (TYPE_CODE === DISCLOSURE_TYPE_CODE.FINANCIAL_DISCLOSURE_TYPE_CODE && DISCLSOURE_TYPES.has(DISCLOSURE_TYPE_CODE.FINANCIAL_DISCLOSURE_TYPE_CODE)) {
                continue;
            }
            if (TYPE_CODE === DISCLOSURE_TYPE_CODE.FINANCIAL_DISCLOSURE_TYPE_CODE) {
                DISCLSOURE_TYPES.add(DISCLOSURE_TYPE_CODE.FINANCIAL_DISCLOSURE_TYPE_CODE);
            }
            RESULT.push(ITEM);
        }
        return RESULT;
    }

    getUnifiedPersonEntityRelationships() {
        if(this.commonService.isUnifiedQuestionnaireEnabled) {
            this.unifiedPersonEntityRelationships = [];
            const DISCLOSURE_TYPE_CODES = new Set(
                this.entityDetailsServices.definedRelationships
                    .map((item) => item.validPersonEntityRelType?.disclosureTypeCode)
                    .filter((code) => code !== null && code !== undefined)
            );
            if (DISCLOSURE_TYPE_CODES.size) {
                this.unifiedPersonEntityRelationships = this.entityDetailsServices.perEntDisclTypeSelections?.filter(
                    (item) => !DISCLOSURE_TYPE_CODES.has(item.disclosureTypeCode)
                );
            } else {
                this.unifiedPersonEntityRelationships = this.entityDetailsServices.perEntDisclTypeSelections;
            }
        }
    }

    private getFinancialRelations(): void {
        this.hasFinancialRelations = this.getRelationshipDetails()?.some((relations: any) => relations.disclosureTypeCode == '1') // for financial;
    }

    private getActiveDisclosure(): void {
        this.$subscriptions.push(this._headerService.getActiveDisclosure().subscribe((response: any) => {
            this._headerService.setActiveDisclosures(response);
            this.setFCOITypeCode(this._headerService.activeDisclosures);
        }, (error: any) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    async navigateBack() {
        if(this.isEditMode) {
            await this.isMandatoryComponentAvailable();
        }
        if (this.isFromEngMigration) {
            if (this._headerService.hasPendingMigrations) {
                this._router.navigate(['/coi/migrated-engagements']);
            } else {
                this._router.navigate(['/coi/user-dashboard']);
            }
        } else if (this.commonService.previousUrlBeforeActivate === '' && (this._navigationService.previousURL.includes('personEntityId') || this._navigationService.previousURL.includes('manage-entity') ||
            this._navigationService.previousURL.includes('create-sfi/create') || this._navigationService.previousURL === '')) {
            this._router.navigate([USER_DASHBOARD_CHILD_ROUTE_URLS.MY_ENGAGEMENTS_ROUTE_URL]);
        } else {
            this.matchDisclosurePaths?.some(path =>
                this.commonService.previousUrlBeforeActivate.includes(path)
            ) ? this._router.navigateByUrl(this.commonService.previousUrlBeforeActivate) : this._router.navigateByUrl(this._navigationService.previousURL);
        }
        sessionStorage.removeItem('migratedEngagementId');
    }

    viewDisclosure(): void {
        this.emitCloseAndRemoveStyle();
        this.navigateToDisclosure(POST_CREATE_DISCLOSURE_ROUTE_URL, this.pendingInitialRevisionDiscl?.disclosureId);
    }

    private checkMandatoryFilled(): boolean {
        this.engagementsError = [];
        this.mandatoryList.clear();
        if (this.commonService.isStartDateOfInvolvementMandatory && !this.involvementDate.involvementStartDate) {
            this.engagementsError.push(this.createValidationError('start-date-involvement', 'Please enter a start date.'));
        }
        if (this.involvementDate.involvementEndDate) {
            this.endDateValidation();
        }
        return this.mandatoryList.size === 0;
    }

    endDateValidation(): void {
        this.mandatoryList.delete('endDate');
        if (this.involvementDate.involvementStartDate && this.involvementDate.involvementEndDate &&
            (compareDates(this.involvementDate.involvementStartDate, this.involvementDate.involvementEndDate) === 1)) {
            this.mandatoryList.set('endDate', 'Please provide a valid date.');
        }
    }

    setAdditionalDetails(details) {
        this.involvementDate.involvementStartDate = getDateObjectFromTimeStamp(details.involvementStartDate);
        this.involvementDate.involvementEndDate = getDateObjectFromTimeStamp(details.involvementEndDate);
        this.additionalDetails.sponsorsResearch = details.sponsorsResearch;
        this.additionalDetails.isCompensated = details.isCompensated;
        this.additionalDetails.isCommitment = details.isCommitment;
        this.additionalDetails.personEntityId = this.entityId;
        this.additionalDetails.personEntityNumber = this.entityNumber;
    }

    activateInactivateSfi() {
        if ((this.relationshipsDetails.isFormCompleted && (this.entityDetailsServices.isAdditionalDetailsChanged ||
            this.entityDetailsServices.isRelationshipQuestionnaireChanged || this.entityDetailsServices.isMatrixChanged || this.entityDetailsServices.isFormDataChanged
        ))) {
            // this.saveRelationship();
        }
        this.isEnableActivateInactivateSfiModal = true;
    }

    async saveRelationship() {
        const { isAdditionalDetailsChanged, isFormDataChanged, isMatrixChanged, isRelationshipQuestionnaireChanged, formBuilderEvents, globalSave$ } = this.entityDetailsServices;
        if (this.checkMandatoryFilled() && !this.engagementsError?.length && isAdditionalDetailsChanged) {
            this.triggerEngSave();
        }
        if (this.isCustomDataChanged) {
            this.$saveCustomData.next(this.entityId);
        }
        if (isFormDataChanged) {
            formBuilderEvents.next({ eventType: 'SAVE' });
        }
        if (isMatrixChanged || isRelationshipQuestionnaireChanged) {
            globalSave$.next();
        }
        if (isRelationshipQuestionnaireChanged) {
            this.removeFromUnsavedSections(this.relationshipDetailsSectionName);
        }
    }

    updateURL(event) {
        if (this.matchDisclosurePaths?.some(path => this._navigationService.previousURL.includes(path))) {
            this.commonService.previousUrlBeforeActivate = '';
            this.commonService.previousUrlBeforeActivate = this._navigationService.previousURL;
        }
        if (!this.isTriggeredFromSlider) {
            this._router.navigate(['/coi/entity-details/entity'],
                { queryParams: { personEntityId: event.personEntityId, personEntityNumber: event.personEntityNumber } });
        }
    }

    goToHome() {
        const reRouteUrl = this.isCOIAdministrator ? ADMIN_DASHBOARD_URL : REPORTER_HOME_URL;
        this._router.navigate([reRouteUrl]);
    }

    closeActivateInactivateSfiModal(event) {
        if (event) {
            if (this.entityId != event.personEntityId) {
                this.updateLatestModifiedVersion(event);
                this.updatedRelationshipStatus = event.versionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            } else {
                this.updateNewStatus(event);
            }
            this.clearUnSaveChangesFlag();
            this.isEnableActivateInactivateSfiModal = false;
        } else {
            this.isEnableActivateInactivateSfiModal = false;
        }
        this.updateHistoryTab();
    }

    async updateLatestModifiedVersion(event: any) {
        if (this.commonService.isUnifiedQuestionnaireEnabled) {
            this.entityId = new Number(event.personEntityId);
            this.isEditMode = event?.versionStatus === 'ACTIVE';
            this.selectedVersionEntityId = this.entityId;
            await this.getEntityDetails(this.entityId);
            this.getSfiVersion();
            this.updateEditMode();
            await this.getApplicableForms();
            this.updateURL({ 'personEntityId': this.entityId, 'personEntityNumber': this.relationshipsDetails.personEntityNumber });
        } else {
            this.updateModifiedVersion(event);
            this.updateEditMode();
        }
    }

    updateHistoryTab() {
        if (this.entityDetailsServices.activeTab === 'HISTORY') {
            this.entityDetailsServices.$updateHistory.next(true);
        }
    }

    updateNewStatus(event) {
        if (event.versionStatus) {
            this.relationshipsDetails.versionStatus = event.versionStatus;
            this.updateURL(event);
        }
        this.relationshipsDetails.updateTimestamp = event.updateTimestamp;
        this.updatedRelationshipStatus = event.versionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        this.updateEditMode();
        this.updateRelationshipDetailsStatus();
        this.triggerOpenQuestionnaire(!isEmptyObject(this.entityDetailsServices.currentRelationshipQuestionnaire) ? this.entityDetailsServices.currentRelationshipQuestionnaire : this.entityDetailsServices.definedRelationships[0]);
    }

    updateEditMode() {
        this.isEditMode = !this.isTriggeredFromSlider && this.entityDetailsServices.canMangeSfi && !this.relationshipsDetails.isFormCompleted && !['INACTIVE', 'ARCHIVE'].includes(this.relationshipsDetails.versionStatus);
    }

    triggerOpenQuestionnaire(questionnaire) {
        setTimeout(() => {
            this.entityDetailsServices.$openQuestionnaire.next(questionnaire);
        })
    }

    updateRelationshipDetailsStatus(canShowSuccessModal = false) {
        if (!this.commonService.isUnifiedQuestionnaireEnabled) {
            const QUEST_REQ_OBJ_LIST = [];
            this.entityDetailsServices.definedRelationships.forEach(rel => {
                this.setQuestionnaireRequestObject(rel.validPersonEntityRelTypeCode, QUEST_REQ_OBJ_LIST);
            });
            if (QUEST_REQ_OBJ_LIST.length) {
                this.checkQuestionnaireCompleted(QUEST_REQ_OBJ_LIST, canShowSuccessModal)
            }
        }
    }

    setQuestionnaireRequestObject(subItemCode, list) {
        list.push(this.getApplicableQuestionnaire({
            moduleItemCode: 8,
            moduleSubItemCode: 801,
            moduleSubItemKey: subItemCode,
            moduleItemKey: this.entityId,
            actionUserId: this.commonService.getCurrentUserDetail('personID'),
            actionPersonName: this.commonService.getCurrentUserDetail('fullName'),
            questionnaireNumbers: [],
            questionnaireMode: this.isEditMode ? 'ACTIVE_ANSWERED_UNANSWERED' : this.relationshipsDetails.isFormCompleted ? 'ANSWERED' : 'ACTIVE_ANSWERED_UNANSWERED'
        }));
    }

    getApplicableQuestionnaire(requestObject) {
        requestObject = JSON.parse(JSON.stringify(requestObject));
        return this.entityDetailsServices.getApplicableQuestionnaire(requestObject);
    }

    checkQuestionnaireCompleted(questionList, canShowSuccessModal = false) {
        this.$subscriptions.push(forkJoin(...questionList).subscribe(async data => {
            this.allRelationQuestionnaires = [];
            data.forEach((d: any) => {
                if (d.applicableQuestionnaire.length) {
                    this.entityDetailsServices.relationshipCompletedObject[d.moduleSubItemKey] = d.applicableQuestionnaire.every(questionnaire => questionnaire.QUESTIONNAIRE_COMPLETED_FLAG === 'Y');
                    this.allRelationQuestionnaires = [...this.allRelationQuestionnaires, ...d.applicableQuestionnaire];
                } else {
                    this.entityDetailsServices.relationshipCompletedObject[d.moduleSubItemKey] = true;
                }
            });
            await this.triggerFormCompleted(canShowSuccessModal);
            this.isAllQuestionnaireCompleted(this.allRelationQuestionnaires);
            this.entityDetailsServices.isRelationshipQuestionnaireChanged = false;
        }, err => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    async triggerFormCompleted(canShowSuccessModal = false) {
        if (!this.isTriggeredFromSlider && await this.canCallFormCompleted(canShowSuccessModal) && canShowSuccessModal && this.engagementCompletionConditionMet()) {
            this.$subscriptions.push(this.entityDetailsServices.checkFormCompleted(this.entityId).subscribe(async (data: any) => {
                this.relationshipsDetails.isFormCompleted = data.isFormCompleted;
                this.statusChangeIfEngagementCompleted(data?.isFormCompleted);
                this.setEngagementStatusInService();
                this.updateURL(this.relationshipsDetails);
                const RELATIONSHIP = this.entityDetailsServices?.definedRelationships?.find(ele => ele?.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode);
                this.triggerOpenQuestionnaire(!isEmptyObject(this.entityDetailsServices.currentRelationshipQuestionnaire) ? this.entityDetailsServices.currentRelationshipQuestionnaire : RELATIONSHIP);
                this.updateEditMode();
                this.openNonUnifiedSuccessModal();
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        } else {
            this.canOpenCompAmountModal();
        }
    }

    isCompModalNeedAgain(): boolean {
        const MATRIX_RESPONSE = this.entityDetailsServices.matrixResponse;
        const IS_FORM_COMPLETED = this.relationshipsDetails.isFormCompleted;
        const IS_MIN_RANGE_SELECTED = this.entityDetailsServices.isSFIMinRangeSelected;
        const IS_MATRIX_COMPLETE_CONDITION_SATISFIED = !isMatrixReadyForSubmission(MATRIX_RESPONSE) && !checkAllAreUncomp(this.entityDetailsServices.matrixResponse);
        return IS_FORM_COMPLETED && IS_MIN_RANGE_SELECTED && IS_MATRIX_COMPLETE_CONDITION_SATISFIED;
    }

    private async canCallFormCompleted(isShowValidationModal = false): Promise<boolean> {
        isShowValidationModal ? await this.validateForm() : await this.isMandatoryComponentAvailable();
        return (!this.entityDetailsServices.isMandatoryComponentAvailable && (this.isAllQuestionnaireCompleted(this.allRelationQuestionnaires) != this.relationshipsDetails.isFormCompleted)
            || (this.entityDetailsServices.isRelationshipQuestionnaireChanged && this.isAllQuestionnaireCompleted(this.allRelationQuestionnaires)));
    }

    isAllQuestionnaireCompleted(questionnaireList) {
        this.entityDetailsServices.isAllQuestionnaireCompleted = !questionnaireList?.length || questionnaireList?.every(questionnaire => questionnaire.QUESTIONNAIRE_COMPLETED_FLAG === 'Y');
        return this.entityDetailsServices.isAllQuestionnaireCompleted;
    }

    updatePersonEntityAdditionalDetails() {
         if (this.checkMandatoryFilled() && !this.engagementsError?.length && this.entityDetailsServices.isAdditionalDetailsChanged) {
            this.additionalDetails.involvementStartDate = parseDateWithoutTimestamp(this.involvementDate.involvementStartDate);
            if (this.involvementDate.involvementEndDate) {
                this.additionalDetails.involvementEndDate = parseDateWithoutTimestamp(this.involvementDate.involvementEndDate);
            }
            this.$subscriptions.push(this.entityDetailsServices.updateAdditionalDetails(this.additionalDetails).subscribe((res: any) => {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Engagement updated successfully.');
                this.relationshipsDetails.updateTimestamp = res?.updateTimestamp;
                this.relationshipsDetails.involvementStartDate = res?.involvementStartDate;
                this.relationshipsDetails.involvementEndDate = res?.involvementEndDate;
                this.relationshipsDetails.sponsorsResearch = res?.sponsorsResearch;
                this.relationshipsDetails.isCompensated = res?.isCompensated;
                this.relationshipsDetails.isCommitment = res?.isCommitment;
                this.afterAdditionalDetailsChange();
            }, error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
         }
    }

    autoSaveEngagmentDetails() {
        if (this.checkMandatoryFilled() && !this.engagementsError?.length && !this.dateValidationMap.size) {
            this.commonService.setChangesAvailable(true);
            this.$debounceTimerForSave.next();
        }
    }

    listenToDebounceTimer() {
        this.$subscriptions.push(
            this.$debounceTimerForSave.pipe(debounceTime(500)).subscribe(() => {
                this.triggerEngSave();
            })
        );
    }

    triggerEngSave() {
            this.additionalDetails.involvementStartDate = parseDateWithoutTimestamp(this.involvementDate.involvementStartDate);
            this.additionalDetails.involvementEndDate = this.involvementDate.involvementEndDate ? parseDateWithoutTimestamp(this.involvementDate.involvementEndDate) : null;
            this.commonService.setLoaderRestriction();
            this.commonService.showAutoSaveSpinner();
            this.$subscriptions.push(this.entityDetailsServices.updateAdditionalDetails(this.additionalDetails).subscribe((res: any) => {
                this.relationshipsDetails.updateTimestamp = res?.updateTimestamp;
                this.relationshipsDetails.isCompensated = res?.isCompensated;
                this.relationshipsDetails.isCommitment = res?.isCommitment;
                this.entityDetailsServices.isAdditionalDetailsChanged = false;
                this.autoSaveService.updatedLastSaveTime(this.relationshipsDetails.updateTimestamp, true);
                this.commonService.hideAutoSaveSpinner('SUCCESS');
                this.commonService.setChangesAvailable(false);
                this.openAfterAutoSave();
            }, error => {
                this.commonService.hideAutoSaveSpinner('ERROR');
                this.commonService.setChangesAvailable(false);
                this.openAfterAutoSave();
            }));
            this.commonService.removeLoaderRestriction();
    }

    async afterAdditionalDetailsChange() {
        this.updateEditMode();
        this.entityDetailsServices.isAdditionalDetailsChanged = false;
        this.removeUnSavedSections();
        if (this.isCustomDataChanged || this.entityDetailsServices.isFormDataChanged) {
            if(this.isCustomDataChanged) {
                this.$saveCustomData.next(this.entityId);
            } else {
                this.entityDetailsServices.formBuilderEvents.next({ eventType: 'SAVE' });
            }
        } else {
            this.updateURL(this.relationshipsDetails);
            await this.validateForm();
            if (!this.isFormEvaluationNeeded && this.isValidForEngMigration()) {
                this.checkFormCompleted();
            }
        }
        if (this.isProceedButtonClicked && !this.entityDetailsServices.isMandatoryComponentAvailable) {
            this.proceedToNextStepAndUpdateConfig();
        }
    }

    private removeUnSavedSections(): void {
        if (!this.entityDetailsServices.isAdditionalDetailsChanged && !this.entityDetailsServices.isFormDataChanged) {
            const INDEX = this.entityDetailsServices.unSavedSections?.findIndex(ele => ele.includes(SFI_ADDITIONAL_DETAILS_SECTION_NAME));
            if (INDEX >= 0) {
                this.entityDetailsServices.unSavedSections?.splice(INDEX, 1);
            }
        }
    }

    async afterAdditionalSectionSave(response) {
        this.entityDetailsServices.isFormDataChanged = false;
        this.commonService.setChangesAvailable(false);
        this.removeUnSavedSections();
        // this.updateURL(this.relationshipsDetails);
        this.isFormEvaluationNeeded = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_1;
        if (Array.isArray(response)) {
            this.relationshipsDetails.updateTimestamp = response?.[0]?.updateTimestamp;
        } else {
            this.relationshipsDetails.updateTimestamp = response?.updateTimestamp
        }        
        // await this.validateForm();
        // if (!this.isFormEvaluationNeeded && this.isValidForEngMigration()) {
            // this.formEvaluation();
        // }
        // this.commonService.isShowLoader.next(false);
        this.autoSaveService.updatedLastSaveTime(this.relationshipsDetails.updateTimestamp, true);
        // if (this.isProceedButtonClicked && !this.entityDetailsServices.isMandatoryComponentAvailable) {
        //     this.proceedToNextStepAndUpdateConfig();
        // }
        this.openAfterAutoSave();
    }

    private formEvaluation(isSFIBlockingCompletion = false): void {
        this.isTravelDisclosureRequired = false;
        if (this.commonService.engagementFlowType !== ENGAGEMENT_FLOW_TYPE.FLOW_1) {
            if (this.formId) {
                if (!this.isFormEvaluationSaving) {
                    this.isFormEvaluationSaving = true;
                    this.commonService.setLoaderRestriction();
                    this.$subscriptions.push(this.entityDetailsServices.evaluateFormResponse(this.getFormEvaluationRO()).subscribe(async (data: any) => {
                        this.isFormEvaluationSaving = false;
                        this.isTravelDisclosureRequired = data?.isTravelDisclosureRequired;
                        if (this.isTravelDisclosureRequired) {
                            await this.getEntityDetails(this.entityId, false);
                            this.updateEditMode();
                            this.updateRelationTab();
                        }
                        // if (this.relationshipsDetails?.isFormCompleted) {
                        //     this.evaluationAPIcalls();
                        // }
                        // if (isSFIBlockingCompletion) {
                        //     this.canOpenCompAmountModal()
                        // }
                    }, err => {
                        this.isFormEvaluationSaving = false;
                        // if (this.relationshipsDetails?.isFormCompleted) {
                        //     this.evaluationAPIcalls();
                        // }
                    }));
                    this.commonService.removeLoaderRestriction();
                }
            } else {
                // if (this.relationshipsDetails?.isFormCompleted) {
                //     this.evaluationAPIcalls();
                // }
            }
        } else if (this.relationshipsDetails?.isFormCompleted) {
            this.openEngSuccessModal();
        }
    }

    listenForQuestionnaireSave() {
        this.$subscriptions.push(this.entityDetailsServices.$saveQuestionnaireAction.subscribe((params: any) => {
            if (params) {
                if (this.commonService.isUnifiedQuestionnaireEnabled) {
                    this.evaluateForm(true);
                } else {
                    this.updateRelationshipDetailsStatus(true);
                }
                this.relationshipsDetails.updateTimestamp = params.ANS_UPDATE_TIMESTAMP;
                this.commonService.showToast(HTTP_SUCCESS_STATUS, `Relationship saved successfully `);
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, `Error in saving relationship. Please try again.`);
            }
        }));
    }

    viewEntityDetails() {
        this.commonService.openEntityDetailsModal(this.entityDetails.entityId);
    }

    private emitCloseAndRemoveStyle(): void {
        this.closeEntityInfoCard.emit(false);
        document.body.removeAttribute("style");
    }

    modifySfi() {
        this.$subscriptions.push(this.entityDetailsServices.modifyPersonEntity({ personEntityId: this.entityId, personEntityNumber: this.entityNumber }).subscribe((res: any) => {
            if (this.isTriggeredFromSlider) {
                this.emitCloseAndRemoveStyle();
                closeCoiSlider(ENGAGEMENT_SLIDER_ID + this.entityId);
                setTimeout(() => {
                    this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: res.personEntityId, personEntityNumber: res.personEntityNumber, mode: 'E' } });
                }, 500);
            } else {
                this.isEditMode = true;
                this.updateModifiedVersion(res, false);
            }
        }));
    }

    async updateModifiedVersion(res, canLoadFirstRelation = true) {
        this.entityId = new Number(res.personEntityId);
        this.selectedVersionEntityId = this.entityId;
        await this.getEntityDetails(this.entityId, canLoadFirstRelation);
        await this.getApplicableForms();
        this.getSfiVersion();
        this.updateRelationshipDetailsStatus();
        if (!canLoadFirstRelation) {
            this.triggerOpenQuestionnaire(isEmptyObject(this.entityDetailsServices.currentRelationshipQuestionnaire) ? this.entityDetailsServices.definedRelationships[0] : this.entityDetailsServices.currentRelationshipQuestionnaire);
        }
        this.updateURL({ 'personEntityId': this.entityId, 'personEntityNumber': this.relationshipsDetails.personEntityNumber });
    }

    addUnSavedChanges() {
        this.entityDetailsServices.isAdditionalDetailsChanged = true;
        if (!this.entityDetailsServices.unSavedSections?.some(ele => ele.includes(SFI_ADDITIONAL_DETAILS_SECTION_NAME))) {
            this.entityDetailsServices.unSavedSections.push(SFI_ADDITIONAL_DETAILS_SECTION_NAME);
        }
    }

    openRelationshipQuestionnaire(coiFinancialEntityDetail) {
        if (this.entityDetailsServices.isAdditionalDetailsChanged || this.entityDetailsServices.isFormDataChanged) {
            this.entityDetailsServices.$emitUnsavedChangesModal.next();
            this.entityDetailsServices.toBeActiveTab = 'QUESTIONNAIRE';
        } else {
            this.entityDetailsServices.currentRelationshipQuestionnaire = coiFinancialEntityDetail;
            this.entityDetailsServices.activeTab = 'QUESTIONNAIRE';
            this.triggerOpenQuestionnaire(coiFinancialEntityDetail);
            this.isFinancialTabViewed = true;
            hideAutoSaveToast('ERROR');
        }
        this.updateStepsNavBtnConfig();
    }

    openQuestionnaireTab() {
        if(this.entityDetailsServices.activeTab === 'QUESTIONNAIRE') {
            return;
        }
        this.setTopForStickySections();
        if (this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3) {
            this.fetchDisclosureQuestionType();
        } else {
            const SELECTED_TYPE = this.entityDetailsServices.selectedDisclosureTypes?.find(item => item.dataCapturingTypeCode);
            if (this.commonService.isUnifiedQuestionnaireEnabled) {
                this.openIfUnifiedQuestionnaire(SELECTED_TYPE);
            } else if (this.isMatrixTypeAvailable) {
                this.openIfQuestionnaireOrMatrix(this.entityDetailsServices.definedRelationships[0])
            } else {
                this.openRelationshipQuestionnaire(this.entityDetailsServices.definedRelationships[0])
            }
        }
    }

    openIfUnifiedQuestionnaire(selectedType: any): void {
        this.entityDetailsServices.currentRelationshipQuestionnaire = selectedType;
        if (this.entityDetailsServices.isAdditionalDetailsChanged || this.entityDetailsServices.isFormDataChanged || this.entityDetailsServices.isMatrixChanged || this.entityDetailsServices.isRelationshipQuestionnaireChanged) {
            this.entityDetailsServices.$emitUnsavedChangesModal.next();
            this.entityDetailsServices.toBeActiveTab = 'QUESTIONNAIRE';
        } else {
            this.proceedToNextTab(selectedType);
        }
        this.updateStepsNavBtnConfig();
    }

    private proceedToNextTab(selectedType: any): void {
        this.entityDetailsServices.activeRelationship = selectedType?.disclosureTypeCode;
        this.entityDetailsServices.canShowMatrixForm = false;
        this.entityDetailsServices.isNoFormType = false;
        this.entityDetailsServices.activeTab = 'QUESTIONNAIRE';
        hideAutoSaveToast('ERROR');
        // this.entityDetailsServices.validationList = [];
        if (selectedType?.dataCapturingTypeCode === this.QUESTIONNAIRE_TYPE && this.entityDetailsServices.isCommitmentTabAvailable) {
            this.triggerOpenQuestionnaire(selectedType);
        } else if (selectedType?.dataCapturingTypeCode === MATRIX_TYPE) {
            this.entityDetailsServices.toBeActiveTab = 'QUESTIONNAIRE';
            this.entityDetailsServices.canShowMatrixForm = true;
        } else {
            this.entityDetailsServices.isNoFormType = true;
        }
        this.isFinancialTabViewed = true;
    }

    proceedButtonAction(): void {
        this.isProceedButtonClicked = true;
        if (!this.entityDetailsServices.isAdditionalDetailsChanged && !this.entityDetailsServices.isFormDataChanged && !this.isCustomDataChanged && !this.entityDetails.isMandatoryComponentAvailable) {
            this.proceedToNextStepAndUpdateConfig();
        } 
        // else {
        //     this.saveEngagement();
        // }
    }

    private proceedToNextStepAndUpdateConfig(): void {
        const SELECTED_TYPE = this.entityDetailsServices.selectedDisclosureTypes?.find(item => item.dataCapturingTypeCode);
        this.proceedToNextTab(SELECTED_TYPE);
        this.updateStepsNavBtnConfig();
        this.isProceedButtonClicked = false;
    }

     openIfQuestionnaireOrMatrix(selectedType: any): void {
        this.entityDetailsServices.currentRelationshipQuestionnaire = selectedType;
        if (this.entityDetailsServices.isAdditionalDetailsChanged || this.entityDetailsServices.isFormDataChanged || this.entityDetailsServices.isMatrixChanged || this.entityDetailsServices.isRelationshipQuestionnaireChanged) {
            this.entityDetailsServices.$emitUnsavedChangesModal.next();
            this.entityDetailsServices.toBeActiveTab = 'QUESTIONNAIRE';
        } else {
            this.entityDetailsServices.activeRelationship = selectedType?.validPersonEntityRelType?.validPersonEntityRelTypeCode;
            this.entityDetailsServices.canShowMatrixForm = false;
            this.entityDetailsServices.isNoFormType = false;
            this.entityDetailsServices.activeTab = 'QUESTIONNAIRE';
            hideAutoSaveToast('ERROR');
            // this.entityDetailsServices.validationList = [];
            if (selectedType?.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode === this.QUESTIONNAIRE_TYPE) {
                this.triggerOpenQuestionnaire(selectedType);
            } else if (selectedType?.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode === MATRIX_TYPE) {
                this.entityDetailsServices.toBeActiveTab = 'QUESTIONNAIRE';
                this.entityDetailsServices.canShowMatrixForm = true;
            } else {
                this.entityDetailsServices.isNoFormType = true;
                this.triggerOpenQuestionnaire(selectedType);
            }
            this.isFinancialTabViewed = true;
        }
        this.updateStepsNavBtnConfig();
    }

    scrollPosition(event) {
        if (event) {
            scrollIntoView('focusQuestionnaire');
        }
    }

    openNextTab(id) {
        if((this.entityDetailsServices.validationList.length === 1 && this.entityDetailsServices.validationList?.[0]?.componentId === 'coi-engagement-matrix' && this.entityDetailsServices.activeTab !== 'QUESTIONNAIRE') || id === 'coi-engagement-matrix'){
            this.openQuestionnaireTab();
        } else {
            this.openRelationShipSection();
        }
    }

    async openRelationShipSection() {
        if(this.entityDetailsServices.activeTab === 'RELATION_DETAILS') {
            return;
        }
        this.entityDetailsServices.toBeActiveTab = 'RELATION_DETAILS';
        if (this.entityDetailsServices.isRelationshipQuestionnaireChanged || this.entityDetailsServices.isMatrixChanged) {
            this.entityDetailsServices.$emitUnsavedChangesModal.next({ details: null, isLeaveFromRelationTab: true });
        } else {
            this.entityDetailsServices.activeTab = 'RELATION_DETAILS';
            hideAutoSaveToast('ERROR');
            await this.getEntityDetails(this.entityId);
            await this.getApplicableForms();
            if(this.entityDetailsServices.validationList?.length) {
                //we need timeout to set validation in form if already triggererd based on API call.
                this.setValidationTimer = setTimeout(async () => {
                    await this.validateForm();
                }, 500);
            }
            this.mandatoryList.clear();
        }
        this.updateStepsNavBtnConfig();
    }

    openRelatedDislcousresSection(): void {
        if (this.entityDetailsServices.activeTab === 'RELATED_DISCLOSURES') {
            return;
        }
        this.entityDetailsServices.toBeActiveTab = 'RELATED_DISCLOSURES';
        if (this.entityDetailsServices.isRelationshipQuestionnaireChanged || this.entityDetailsServices.isAdditionalDetailsChanged || this.entityDetailsServices.isFormDataChanged || this.entityDetailsServices.isMatrixChanged) {
            this.entityDetailsServices.$emitUnsavedChangesModal.next({ details: null, isLeaveFromRelationTab: true });
        } else {
            this.entityDetailsServices.validationList = [];
            this.entityDetailsServices.activeTab = 'RELATED_DISCLOSURES';
            hideAutoSaveToast('ERROR');
        }
    }

    openHistorySection() {
        if(this.entityDetailsServices.activeTab === 'HISTORY') {
            return;
        }
        this.entityDetailsServices.toBeActiveTab = 'HISTORY';
        if (this.entityDetailsServices.isRelationshipQuestionnaireChanged || this.entityDetailsServices.isAdditionalDetailsChanged || this.entityDetailsServices.isFormDataChanged || this.entityDetailsServices.isMatrixChanged) {
            this.entityDetailsServices.$emitUnsavedChangesModal.next({ details: null, isLeaveFromRelationTab: true });
        } else {
            this.entityDetailsServices.validationList = [];
            this.entityDetailsServices.activeTab = 'HISTORY';
            hideAutoSaveToast('ERROR');
        }
    }

    saveOrAddRelationshipModal() {
        this.entityDetailsServices.$triggerAddRelationModal.next({ 'openModal': true, 'entityDetails': this.entityDetails });
    }

    checkForNoRelationsAdded() {
        const IS_RELATIONS_AVAILABLE = this.commonService.isUnifiedQuestionnaireEnabled ? !this.entityDetailsServices.selectedDisclosureTypes?.length : !this.entityDetailsServices.definedRelationships?.length;
        return IS_RELATIONS_AVAILABLE && !this.canAddRelationship();
    }

    canAddRelationship() {
        const IS_REMAINING_RELATION_AVAIL = (!this.commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.remainingRelationships.length) || (this.commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.remainingSelectedDisclosureTypes.length);
        return this.isEditMode && this.entityDetailsServices.canMangeSfi && IS_REMAINING_RELATION_AVAIL;
    }

    isRelationshipDetailsFetched() {
        return !isEmptyObject(this.relationshipsDetails);
    }

    canShowMoreActions() {
        return this.relationshipsDetails.versionStatus != 'ARCHIVE' && this.entityDetailsServices.canMangeSfi;
    }

    private getSfiEntityDetails(): void {
        this.$subscriptions.push(this.entityDetailsServices.getCoiEntityDetails(this.entityId).subscribe((res: any) => {
            this.entityDetails = res?.coiEntity;
            this.complianceInfo = res?.complianceInfo;
            this.entityFamilyTreeRoles = res?.entityFamilyTreeRoles;
            this.setTopForStickySections();
        }, _error => {
            this.setTopForStickySections();
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    collapseHeader() {
        this.isCardExpanded = !this.isCardExpanded;
        this.isUserCollapse = !this.isUserCollapse;
        this.isManuallyExpanded = this.isCardExpanded;
        this.setTopForStickySections();
    }

    getRelationshipDetails() {
        const a = [];
        if (this.entityDetailsServices.definedRelationships.length) {
            this.entityDetailsServices.definedRelationships.forEach((ele) => {
                a.push(ele.validPersonEntityRelType);
            })
        }
        return a;
    }

    checkUserHasRight(): void {
        this.canViewEntity = this.commonService.getAvailableRight(['MANAGE_ENTITY', 'VIEW_ENTITY', 'MANAGE_ENTITY_SPONSOR', 'MANAGE_ENTITY_ORGANIZATION', 'MANAGE_ENTITY_COMPLIANCE', 'VERIFY_ENTITY'], 'SOME');
    }

    linkEngagementToDisclosure(): void {
        this.$subscriptions.push(
            this._disclosureCreateModalService.syncFCOIDisclosure(this.pendingInitialRevisionDiscl?.disclosureId, this.pendingInitialRevisionDiscl?.disclosureNumber)
                .subscribe((response: any) => {
                    this.emitCloseAndRemoveStyle();
                    this._headerService.triggerProjectsTabCount();
                    this.navigateToDisclosure(CREATE_DISCLOSURE_ENGAGEMENT_ROUTE_URL, this.pendingInitialRevisionDiscl?.disclosureId);
                }, (error: any) => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    private navigateToDisclosure(routeUrl: string, disclosureId: string | number): void {
        this._router.navigate([routeUrl], { queryParams: { disclosureId } });
    }

    canShowAddRelationsBtn() {
        const IS_REMAINING_RELATION_AVAIL = (!this.commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.remainingRelationships.length) || (this.commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.remainingSelectedDisclosureTypes.length);
        const NO_NEW_RELATION_NEEDED = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3;
        return this.isEditMode && this.entityDetailsServices.canMangeSfi && IS_REMAINING_RELATION_AVAIL && !NO_NEW_RELATION_NEEDED;
    }

    postConfirmation(modalAction: ModalActionEvent) {
        if (modalAction.action === 'PRIMARY_BTN') {
            if (this.isFromEngMigration) {
                if (this._headerService.hasPendingMigrations) {
                    this._router.navigate(['/coi/migrated-engagements']);
                } else {
                    this._router.navigate(['/coi/user-dashboard']);
                }
                sessionStorage.removeItem('migratedEngagementId');
            } else {
                this.checkForDisclosureTypes() ? this.openDisclCreateModal() : this.clearUnSaveChanges();
            }
        } else if (modalAction.action === 'SECONDARY_BTN') {
            this.disclMandatoryList.clear();
            this._router.navigate(['/coi/create-sfi/create'], { queryParams: { type: 'SFI' } });
        } else if (modalAction.action === 'CLOSE_BTN') {
            this.clearUnSaveChanges();
        }
    }

    isRelationAvailableInFlow1(relationType: string): boolean {
        return !!this.entityDetailsServices.definedRelationships.find(ele => ele?.validPersonEntityRelType?.coiDisclosureType?.disclosureTypeCode === relationType);
    }

    opaActions() {
        this.disclosureModalDetails.id ? this.redirectToOPA() : this.createOPA();
    }

    reviseFCOI() {
        if (!this.disclMandatoryList.size) {
            let revisionReqObj: any = {};
            revisionReqObj.disclosureId = this.disclosureModalDetails.id;
            revisionReqObj.comment = this.disclDescription;
            revisionReqObj.homeUnit = this.commonService.currentUserDetails.unitNumber;
            this.$subscriptions.push(this._headerService.reviseFcoiDisclosure(revisionReqObj).subscribe((data: any) => {
                this.disclMandatoryList.clear();
                this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: data.disclosureId } });
            }));
        }
    }

    withdrawFCOI() {
        if (!this.disclMandatoryList.size) {
            let withdrawReqObj: any = {};
            withdrawReqObj.disclosureId = this.disclosureModalDetails.id;
            withdrawReqObj.comment = this.disclDescription;
            this.$subscriptions.push(this.entityDetailsServices.withdrawDisclosure(withdrawReqObj).subscribe((data: any) => {
                this.disclMandatoryList.clear();
                this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: this.disclosureModalDetails.id } });
            }));
        }
    }

    createFCOI() {
        if (!this.disclMandatoryList.size) {
            const FCOI_DISCLOSURE_RO: FCOIDisclosureCreateRO = {
                fcoiTypeCode: DISCLOSURE_TYPE.INITIAL,
                homeUnit: this.commonService.currentUserDetails.unitNumber,
                revisionComment: this.disclDescription,
                personId: this.commonService.getCurrentUserDetail('personID')
            };
            this.$subscriptions.push(this._headerService.createInitialDisclosure(FCOI_DISCLOSURE_RO).subscribe((data: any) => {
                this.disclMandatoryList.clear();
                this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: data.disclosureId } });
            }, err => {
                this.disclMandatoryList.clear();
                closeCommonModal(this.CREATE_OPA_MODAL);
                if (err?.status === 405) {
                    this.commonService.concurrentUpdateAction = `${COMMON_DISCL_LOCALIZE.TERM_COI} disclosure`;
                } else if (err?.status === 406) {
                    this._headerService.triggerDisclosureValidationModal(err?.error); 
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to create disclosure. Please try again later.');
                }
            }));
        }
    }

    requestWithdrawForFCOI() {
        if (!this.disclMandatoryList.size) {
            let withdrawReqObj: any = {};
            withdrawReqObj.disclosureId = this.disclosureModalDetails.id;
            withdrawReqObj.description = this.disclDescription;
            this.$subscriptions.push(this.entityDetailsServices.withdrawRequest(withdrawReqObj).subscribe((data: any) => {
                this.disclMandatoryList.clear();
                this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: this.disclosureModalDetails.id } });
            }));
        }
    }

    disclMandatoryCheck() {
        this.disclMandatoryList.clear();
        if (this.disclosureModalDetails?.message && !this.disclDescription) {
            this.disclMandatoryList.set('description', 'Please enter description');
        }
    }

    redirectToOPA() {
        this.clearUnSaveChanges();
        this._router.navigate([OPA_CHILD_ROUTE_URLS.FORM], { queryParams: { disclosureId: this.disclosureModalDetails.id } });
    }

    createOPA(): void {
        this._headerService.triggerOPACreation('INITIAL');
    }

    clearUnSaveChanges() {
        this.disclosureModalDetails = new CreateDisclosureModalDetails();
        this.entityDetailsServices.clearServiceVariable();
        closeCommonModal(this.CREATE_OPA_MODAL);
        if(this.entityDetailsServices.navigateUrl) {
            this._router.navigateByUrl(this.entityDetailsServices.navigateUrl);
        }
    }

    // async afterMatrixSave() {
    //     if (this.relationshipsDetails.compensationAmount && !String(this.relationshipsDetails?.compensationAmount)?.includes('>=')) {
    //         this.compensatedAmount = null;
    //         this.saveTotalAmount(true);
    //     } else {
    //         await this.evaluateSFI();
    //         this.updateEditMode();
    //         this.openEngCompletionModal();
    //     }
    // }

    async openEngCompletionModal() {
        this.updateURL({ 'personEntityId': this.entityId, 'personEntityNumber': this.relationshipsDetails.personEntityNumber });
        this.checkFormCompleteAndOpenModal();
        // this.isFormEvaluationNeeded = true;
        // await this.validateForm();
    }

    private engagementCompletionConditionMet(): boolean {
        const MATRIX_RESPONSE = this.entityDetailsServices.matrixResponse;
        const IS_MATRIX_VALID = isMatrixReadyForSubmission(MATRIX_RESPONSE);
        const ALL_UNCOMP = checkAllAreUncomp(MATRIX_RESPONSE);
        const HAS_MID_RANGE = checkHasAnyLowRange(MATRIX_RESPONSE);
        return (IS_MATRIX_VALID || ALL_UNCOMP || (!IS_MATRIX_VALID && !ALL_UNCOMP && (!HAS_MID_RANGE || (HAS_MID_RANGE && this.relationshipsDetails.compensationAmount))));
    }

    evaluateForm(isSaveQuestionnaire = false) {
        if (!this.entityDetailsServices.validationList?.length && this.engagementCompletionConditionMet()) {
            this.$subscriptions.push(this.entityDetailsServices.checkFormCompleted(this.entityId).subscribe(async (data: any) => {
                this.relationshipsDetails.isFormCompleted = data.isFormCompleted;
                this.statusChangeIfEngagementCompleted(data?.isFormCompleted);
                this.updateEditMode();
                this.setEngagementStatusInService();
                this.isFormEvaluationNeeded = false;
                if (isSaveQuestionnaire) {
                    if (this.entityDetailsServices.currentRelationshipQuestionnaire.dataCapturingTypeCode === this.QUESTIONNAIRE_TYPE) {
                        this.entityDetailsServices.isRelationshipQuestionnaireChanged = false;
                        this.triggerOpenQuestionnaire(this.entityDetailsServices.currentRelationshipQuestionnaire);
                    }
                }
                this.formEvaluation();
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        } else {
            this.formEvaluation(true);
        }
    }

    private async canOpenCompAmountModal(): Promise<void> {
        if (this.commonService.isSfiEvaluationEnabled) {
            if(this.entityDetailsServices.definedRelationships.length) {
                await this.checkIfQuestionnaireCompleted();
            }
            const NO_FORM_VALIDATION = !this.entityDetailsServices.validationList?.length;
            const IS_MATRIX_COMPLETE = this.entityDetailsServices.isMatrixComplete;
            const IS_QUEST_COMPLETE = (this.entityDetailsServices.definedRelationships.length && this.entityDetailsServices.isAllQuestionnaireCompleted) || !this.entityDetailsServices.definedRelationships.length;
            const MATRIX_RESPONSE = this.entityDetailsServices.matrixResponse;
            const IS_MATRIX_COMPLETE_CONDITION_SATISFIED = !isMatrixReadyForSubmission(MATRIX_RESPONSE) && !checkAllAreUncomp(this.entityDetailsServices.matrixResponse);
            const ATLEAST_ONE_ANSWER_BELOW_RANGE = checkHasAnyLowRange(MATRIX_RESPONSE);
            const CAN_OPEN_MODAL = NO_FORM_VALIDATION && IS_MATRIX_COMPLETE && IS_QUEST_COMPLETE &&
                IS_MATRIX_COMPLETE_CONDITION_SATISFIED && ATLEAST_ONE_ANSWER_BELOW_RANGE;
            if (CAN_OPEN_MODAL) {
                this.openTotalAmountModal();
            }
        }
    }

    checkIfQuestionnaireCompleted(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const QUEST_REQ_OBJ_LIST = [];
            let allQuestionnaires = [];
            this.entityDetailsServices.definedRelationships.forEach(rel => {
                this.setQuestionnaireRequestObject(rel.validPersonEntityRelTypeCode, QUEST_REQ_OBJ_LIST);
            });
            if (QUEST_REQ_OBJ_LIST.length) {
                this.$subscriptions.push(forkJoin(...QUEST_REQ_OBJ_LIST).subscribe(async data => {
                    data.forEach((d: any) => {
                        if (d.applicableQuestionnaire.length) {
                            allQuestionnaires = [...this.allRelationQuestionnaires, ...d.applicableQuestionnaire];
                        }
                    });
                    this.isAllQuestionnaireCompleted(allQuestionnaires);
                    resolve(true);
                }, err => {
                    resolve(false);
                }));
            } else {
                resolve(true);
            }
        });
    }

    // async evaluationAPIcalls(): Promise<void> {
    //     this.fcoiDataAfterEvaluation = null;
    //     this.opaDataAfterEvaluation = null;
    //     await this.evaluateEngagementDisclosureRelation();
    //     this.openValidationOrSuccessModal();
    // }

    /** 
     * Evaluates disclosure requirements based on engagement relationships.
     * - evaluateOPAQuestionnaire: Evaluates OPA disclosure and relation requirements.
     * - evaluateFCOIMatrix: Evaluates FCOI disclosure and relation requirements.
    */
    // private async evaluateEngagementDisclosureRelation(): Promise<void> {
    //     if (this.entityDetailsServices.isCommitmentTabAvailable) {
    //         await this.evaluateOPAQuestionnaire();
    //     }
    //     if (this.entityDetailsServices.perEntDisclTypeSelections?.some(ele => ele.disclosureTypeCode === DISCLOSURE_TYPE_CODE.FINANCIAL_DISCLOSURE_TYPE_CODE)) {
    //         await this.evaluateFCOIMatrix();
    //     }
    // }

    // private evaluateFCOIMatrix(): Promise<boolean> {
    //     return new Promise<boolean>((resolve) => {
    //         this.$subscriptions.push(
    //             this.entityDetailsServices.evaluateFCOIMatrix(this.entityId)
    //                 .subscribe((data: any) => {
    //                     this.fcoiDataAfterEvaluation = data;
    //                     resolve(true);
    //                 }, err => {
    //                     this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in evaluating matrix');
    //                     resolve(false);
    //                 }));
    //     });
    // }

    // private evaluateOPAQuestionnaire(): Promise<boolean> {
    //     return new Promise<boolean>((resolve) => {
    //         this.$subscriptions.push(
    //             this.entityDetailsServices.evaluateOPAQuestionnaire(this.entityId)
    //                 .subscribe((data: any) => {
    //                     this.opaDataAfterEvaluation = data;
    //                     resolve(true);
    //                 }, err => {
    //                     this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in evaluating questionnaire');
    //                     resolve(false);
    //                 }));
    //     });
    // }

    private checkForCreateAction(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.$subscriptions.push(this._headerService.isDisclosureCreationAllowed().subscribe((data: { isFcoiRequired: boolean, isOpaRequired: boolean }) => {
                this.canCreateFCOI = data?.isFcoiRequired && this.commonService.isDisclosureRequired && this.commonService.isShowFinancialDisclosure;
                this.canCreateOPA = data?.isOpaRequired;
                resolve(true);
            }, err => {
                resolve(false);
            }));
        });
    }

    private openValidationOrSuccessModal(): void {
        if (this.relationshipsDetails.isFormCompleted) {
            this.openEngSuccessModal();
        }
    }

    openEngSuccessModal(): void {
        if (!this.isEditMode) {
            this.additionalBtns = [];
            if (this.isFromEngMigration) {
                this.setMigrationModalDetails();
            } else {
                this.openCompletionFinalModal();
            }
            this.isFinancialTabViewed = false;
            setTimeout(() => {
                openCommonModal(this.CREATE_OPA_MODAL);
            }, 50);
        }
    }

    private openCompletionFinalModal(): void {
        const IS_TRAVEL_RELATION_ADDED = this.entityDetailsServices.selectedDisclosureTypes.some(ele => ele?.coiDisclosureType?.disclosureTypeCode.toString() === this.TRAVEL_TYPE.toString());
        const CAME_FROM_TRAVEL_DISCLOSURE = this.commonService.previousUrlBeforeActivate.includes(TRAVEL_CREATE_BASE_URL);
        const IS_ONLY_TRAVEL_AVAILABLE = this.entityDetailsServices.selectedDisclosureTypes.length === 1;
        if (CAME_FROM_TRAVEL_DISCLOSURE && IS_ONLY_TRAVEL_AVAILABLE && IS_TRAVEL_RELATION_ADDED) {
            this.openDisclCreateModal();
        } else {
            this.setStandardEngagementModalDetails();
        }
    }

    private setMigrationModalDetails(): void {
        const HAS_PENDING = this._headerService.hasPendingMigrations;
        const ENTITY_NAME = this.entityDetails?.entityName;
        const CONFIRMATION_MSG = HAS_PENDING ? 'You can continue transferring the remaining engagements.' : 'All engagements have now been transferred.';
        this.disclosureModalDetails.message = `${ENTITY_NAME} has been successfully transferred to MyCOI-OPA+. ${CONFIRMATION_MSG}`;
        this.disclosureModalDetails.modalHeader = HAS_PENDING ? 'Engagement Transferred' : 'All Engagements Transferred';
        this.modalConfig.namings.primaryBtnName = HAS_PENDING ? 'Continue' : 'Okay';
        const PRIMARY_BTN_TEXT = HAS_PENDING ? 'Click here to proceed to migrated engagements listing' : 'Click here to proceed to home page';
        this.modalConfig.ADAOptions.primaryBtnTitle = PRIMARY_BTN_TEXT;
        this.modalConfig.ADAOptions.primaryBtnAriaLabel = PRIMARY_BTN_TEXT;
        this.modalConfig.styleOptions.secondaryBtnClass = 'invisible';
    }

    private setStandardEngagementModalDetails(): void {
        this.disclosureModalDetails.message = 'Engagement completed successfully! Would you like to add another engagement?';
        this.disclosureModalDetails.modalHeader = 'Engagement Completed Successfully';
        this.modalConfig.namings.primaryBtnName = 'No';
        this.modalConfig.namings.secondaryBtnName = 'Create Another';
        this.modalConfig.ADAOptions.primaryBtnTitle = 'Click here to remain on the current engagement details';
        this.modalConfig.ADAOptions.primaryBtnAriaLabel = 'Click here to remain on the current engagement details';
        this.modalConfig.ADAOptions.secondaryBtnAriaLabel = 'Click here to add another engagement';
        this.modalConfig.ADAOptions.secondaryBtnTitle = 'Click here to add another engagement';
    }

    private openDisclCreateModal(): void {
        this.resetCreateModal();
        this.commonService.isUnifiedQuestionnaireEnabled ? this.setMsgForAllDisclsFlow3() : this.setMsgForAllDisclFlow1();
    }

    private setMsgForAllDisclFlow1(): void {
        const IS_OPA_ENABLED = this.canAllowOPACreation() && this.commonService?.isShowOpaDisclosure;
        const IS_TRAVEL_AVAILABLE_IN_FLOW1 = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_1 && this.isRelationAvailableInFlow1(this.TRAVEL_TYPE.toString());
        const IS_TRAVEL_ENABLED = this.commonService?.isShowTravelDisclosure && (IS_TRAVEL_AVAILABLE_IN_FLOW1 || this.isTravelDisclosureRequired);
        const IS_FINANCIAL_ENABLED = this.canAllowFCOICreation() && this.commonService.isShowFinancialDisclosure && this.commonService.isDisclosureRequired;
        const IS_OPA_TRAVEL_AVAILABLE = this.canAllowOPACreation() || IS_TRAVEL_AVAILABLE_IN_FLOW1 || this.isTravelDisclosureRequired
        const IS_FINANCIAL_BY_DEFAULT = IS_OPA_TRAVEL_AVAILABLE && this.commonService.engagementTypeForCoiDisclosure === 'ALL_ENG' && this.canCreateFCOI;
        // Trigger modal messages
        if (IS_OPA_ENABLED) {
            this.getModalOPAMessage();
        }
        if (IS_FINANCIAL_ENABLED || IS_FINANCIAL_BY_DEFAULT) {
            this.getModalFCOIMessage();
        }
        if (IS_TRAVEL_ENABLED) {
            this.disclosureModalDetails.isTravelMessage = true;
            this.appendButtonsToModal('BTN_TYPE', `Create ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL}`, 'btn-primary');
        }
        this.setModalMsgForFlow1();
    }

    private setMsgForAllDisclsFlow3(): void {
        const IS_OPA_AVAILABLE = this.canAllowOPACreation() && this.commonService?.isShowOpaDisclosure;
        const IS_TRAVEL_RELATION_ADDED = this.entityDetailsServices.selectedDisclosureTypes.some(ele => ele?.coiDisclosureType?.disclosureTypeCode.toString() === this.TRAVEL_TYPE.toString());
        const IS_TRAVEL_AVAILABLE = (this.isTravelDisclosureRequired || IS_TRAVEL_RELATION_ADDED) && this.commonService.isShowTravelDisclosure;
        const IS_FINANCIAL_AVAILABLE = this.canAllowFCOICreation() && this.commonService.isShowFinancialDisclosure && this.commonService.isDisclosureRequired;
        const IS_FINANCIAL_BY_DEFAULT = ( this.canAllowOPACreation() || (this.isTravelDisclosureRequired || IS_TRAVEL_RELATION_ADDED)) && this.commonService.engagementTypeForCoiDisclosure === 'ALL_ENG'  && this.canCreateFCOI
        if (IS_OPA_AVAILABLE) {
            this.getModalOPAMessage();
        }
        if (IS_FINANCIAL_AVAILABLE || IS_FINANCIAL_BY_DEFAULT) {
            this.getModalFCOIMessage();
        }
        if (IS_TRAVEL_AVAILABLE || IS_TRAVEL_RELATION_ADDED) {
            this.disclosureModalDetails.isTravelMessage = true;
            if (this.commonService.previousUrlBeforeActivate.includes(TRAVEL_CREATE_BASE_URL)) {
                this.appendButtonsToModal('BTN_TYPE', `Go To ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL}`, 'btn-primary');
            } else if(this.isTravelDisclosureRequired) {
                this.appendButtonsToModal('BTN_TYPE', `Create ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL}`, 'btn-primary');
            }
        }
        this.setModalMsgForFlow3();
    }

    private checkForDisclosureTypes(): boolean {
        const IS_FCOI_ACTIVE = this.canAllowFCOICreation() && this.commonService.isShowFinancialDisclosure && this.commonService.isDisclosureRequired;
        const IS_OPA_ACTIVE = this.canAllowOPACreation() && (this.commonService?.isShowOpaDisclosure || (this.commonService.engagementTypeForCoiDisclosure === 'ALL_ENG' && this.canCreateFCOI));
        const IS_TRAVEL_ACTIVE = this.isTravelDisclosureRequired && (this.commonService?.isShowTravelDisclosure || (this.commonService.engagementTypeForCoiDisclosure === 'ALL_ENG' && this.canCreateFCOI));
        const IS_TRAVEL_AVAILABLE_FLOW1 = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_1 && this.isRelationAvailableInFlow1(this.TRAVEL_TYPE.toString());
        const IS_PREVIOUS_FROM_TRAVEL = this.commonService.previousUrlBeforeActivate.includes(TRAVEL_CREATE_BASE_URL);
        const IS_TRAVEL_AVAILABLE_FLOW3 = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3 && IS_PREVIOUS_FROM_TRAVEL && this.entityDetailsServices.selectedDisclosureTypes.some(ele => ele?.coiDisclosureType?.disclosureTypeCode.toString() === this.TRAVEL_TYPE.toString());
        const ENABLE_TRAVEL_DISCLOSURE_FLOW = ((IS_TRAVEL_AVAILABLE_FLOW1 || IS_TRAVEL_AVAILABLE_FLOW3) && (this.commonService?.isShowTravelDisclosure || this.commonService.engagementTypeForCoiDisclosure === 'ALL_ENG'));
        return (IS_FCOI_ACTIVE || IS_OPA_ACTIVE || (IS_TRAVEL_ACTIVE || ENABLE_TRAVEL_DISCLOSURE_FLOW));
    }

    private setModalMsgForFlow1(): void {
        const { OPAMessage, fcoiMessage, isTravelMessage } = this.disclosureModalDetails;
        if (!(OPAMessage || fcoiMessage || isTravelMessage)) return;
        const IS_ALL_SFI_FLOW = this.commonService.engagementTypeForCoiDisclosure === 'ALL_SFI';
        const { TERM_TRAVEL_FOR_REL_PILLS, TERM_COMMITMENT_FOR_REL_PILLS, TERM_FINANCIAL_FOR_REL_PILLS, TERM_SIGNIFICANT_FINANCIAL } = ENGAGEMENT_LOCALIZE;
         const RELATIONSHIPS = [
            OPAMessage && TERM_COMMITMENT_FOR_REL_PILLS,
            fcoiMessage && IS_ALL_SFI_FLOW && TERM_SIGNIFICANT_FINANCIAL,
            fcoiMessage && !IS_ALL_SFI_FLOW && TERM_FINANCIAL_FOR_REL_PILLS,
            isTravelMessage && TERM_TRAVEL_FOR_REL_PILLS
        ].filter(Boolean)?.join(', ')?.replace(/,([^,]*)$/, ' and$1')?.toLowerCase();
        const ACTIONS = [
            OPAMessage === 'REVISE' && this.canCreateOPA && `Revise the OPA Disclosure`,
            OPAMessage === 'CREATE' && this.canCreateOPA && `Create the OPA Initial Disclosure`,
            fcoiMessage === 'REVISE' && this.canCreateFCOI && `Revise the ${COMMON_DISCL_LOCALIZE.TERM_COI} Disclosure`,
            fcoiMessage === 'CREATE' && this.canCreateFCOI && `Create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL}`,
            isTravelMessage && `Create the ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL} Disclosure`
        ].filter(Boolean)?.map(action => `<li>${action}</li>`).join('');
        this.disclosureModalDetails.message = `Your engagement(s) have been identified as having ${RELATIONSHIPS} relationship.` +
            (ACTIONS ? ` <span class="text-nowrap">You are required to:</span><ul class="mb-0">${ACTIONS}</ul>` : '');
    }

    private appendButtonsToModal(type: string, buttonName: string, btnClass: string): void {
        this.additionalBtns.push({ action: type, event: { buttonName: buttonName, btnClass: btnClass} });
    }

    private canAllowFCOICreation(): boolean {
        if ((this.commonService.engagementTypeForCoiDisclosure === 'ALL_SFI' && this.relationshipsDetails.isSignificantFinInterest) || this.commonService.engagementTypeForCoiDisclosure !== 'ALL_SFI') {
            if (this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_1) {
                return !!this.isRelationAvailableInFlow1(this.FINANCIAL_TYPE.toString());
            } else {
                return this.canCreateFCOI;
            }
        } else {
            return false;
        }
    }

    private canAllowOPACreation(): boolean {
        const IS_OPA_RELATION_AVAILABLE_FLOW1 = this.isRelationAvailableInFlow1(this.COMMITMENT_TYPE.toString());
        const IS_OPA_RELATION_AVAILABLE_FLOW3 = this.entityDetailsServices.selectedDisclosureTypes.some(ele => ele?.coiDisclosureType?.disclosureTypeCode.toString() === this.COMMITMENT_TYPE.toString());
        // const NO_COMMITMENT_TAB = !this.entityDetailsServices.isCommitmentTabAvailable;
        return (this.canCreateOPA && (IS_OPA_RELATION_AVAILABLE_FLOW1 || IS_OPA_RELATION_AVAILABLE_FLOW3));
    }

    private resetCreateModal() : void {
        this.additionalBtns = [];
        this.modalConfig.namings.primaryBtnName = '';
        this.modalConfig.namings.secondaryBtnName = '';
        this.disclosureModalDetails.modalHeader = 'Create Disclosures' ;
        this.disclosureModalDetails.message = '';
        this.disclosureModalDetails.fcoiMessage = null;
        this.disclosureModalDetails.OPAMessage = null;
        this.disclosureModalDetails.isTravelMessage = false;
        this.appendButtonsToModal('BTN_TYPE', 'Cancel', 'btn-outline-secondary');
    }

    private setModalMsgForFlow3(): void {
        const { OPAMessage, fcoiMessage, isTravelMessage } = this.disclosureModalDetails;
        const IS_TRAVEL_RELATION_ADDED = this.entityDetailsServices.selectedDisclosureTypes.some(ele => ele?.coiDisclosureType?.disclosureTypeCode.toString() === this.TRAVEL_TYPE.toString());
        const IS_PREVIOUS_FROM_TRAVEL = this.commonService.previousUrlBeforeActivate.includes(TRAVEL_CREATE_BASE_URL);
        const IS_ALL_SFI_FLOW = this.commonService.engagementTypeForCoiDisclosure === 'ALL_SFI';
        if (!(OPAMessage || fcoiMessage || isTravelMessage)) return;
        const { TERM_TRAVEL_FOR_REL_PILLS, TERM_COMMITMENT_FOR_REL_PILLS, TERM_FINANCIAL_FOR_REL_PILLS, TERM_SIGNIFICANT_FINANCIAL } = ENGAGEMENT_LOCALIZE;
        const RELATIONSHIPS = [
            OPAMessage && TERM_COMMITMENT_FOR_REL_PILLS,
            fcoiMessage && IS_ALL_SFI_FLOW && TERM_SIGNIFICANT_FINANCIAL,
            fcoiMessage && !IS_ALL_SFI_FLOW && TERM_FINANCIAL_FOR_REL_PILLS,
            (isTravelMessage && ((IS_TRAVEL_RELATION_ADDED && IS_PREVIOUS_FROM_TRAVEL) || this.isTravelDisclosureRequired)) && TERM_TRAVEL_FOR_REL_PILLS
        ].filter(Boolean)?.join(', ')?.replace(/,([^,]*)$/, ' and$1')?.toLowerCase();
        const ACTIONS = [
            OPAMessage === 'REVISE' && this.canCreateOPA && `Revise the OPA Disclosure`,
            OPAMessage === 'CREATE' && this.canCreateOPA && `Create the OPA Initial Disclosure`,
            fcoiMessage === 'REVISE' && this.canCreateFCOI && `Revise the ${COMMON_DISCL_LOCALIZE.TERM_COI} Disclosure`,
            fcoiMessage === 'CREATE' && this.canCreateFCOI && `Create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL}`,
            isTravelMessage && this.isTravelDisclosureRequired && `Create the ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL} Disclosure`,
            isTravelMessage && (IS_PREVIOUS_FROM_TRAVEL || IS_TRAVEL_RELATION_ADDED) && IS_PREVIOUS_FROM_TRAVEL && `Continue with ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL} Disclosure`
        ].filter(Boolean)?.map(action => `<li>${action}</li>`).join('');
        this.disclosureModalDetails.message = `Your engagement(s) have been identified as having ${RELATIONSHIPS} relationship.` +
            (ACTIONS ? ` <span class="text-nowrap">You are required to:</span><ul class="mb-0">${ACTIONS}</ul>` : '');
    }

    validationModalActions(act: any): void {
        this.disclMandatoryList.clear();
        const BUTTON_NAME = act.event.buttonName;
        switch (BUTTON_NAME) {
            case `Create ${COMMON_DISCL_LOCALIZE.FCOI_REVISE_BTN}`:
                this.reviseFCOI();
                break;
            case `Create ${COMMON_DISCL_LOCALIZE.TERM_COI} Initial`:
                this.createFCOI();
                break;
            case `Go To ${COMMON_DISCL_LOCALIZE.TERM_COI}`:
                this.viewDisclosure();
                break;
            case `${COMMON_DISCL_LOCALIZE.FCOI_REVISE_BTN}`:
                this.setReviseDocumentAction('FCOI_DISCLOSURE');
                this.viewDisclosure();
                break;
            case 'Create OPA Initial':
                this.createOPA();
                break;
            case `Create ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL}`:
                this.createTravelAPI();
                break;
            case 'Cancel':
                this.clearUnSaveChanges();
                break;
            case 'Create OPA Revision':
                this.reviseOPA();
                break;
            case 'Revise OPA':
                this.setReviseDocumentAction('OPA_DISCLOSURE');
                this.viewOPA();
                break;
            case 'Go To OPA':
                this.viewOPA();
                break;
            case `Go To ${COMMON_DISCL_LOCALIZE.TERM_TRAVEL}`:
                this._router.navigateByUrl(this.commonService.previousUrlBeforeActivate);
            default:
                break;
        }
    }

    private viewOPA(): void {
        const PENDING_OPA = this._headerService.activeOPAs.find((disclosure: any) => disclosure?.versionStatus === OPA_VERSION_TYPE.PENDING);
        if (PENDING_OPA?.opaDisclosureId) {
            this.clearUnSaveChanges();
            sessionStorage.setItem('previousUrl', this._router.url);
            const REDIRECT_URL = OPA_CHILD_ROUTE_URLS.FORM;
            this._router.navigate([REDIRECT_URL], { queryParams: { disclosureId: PENDING_OPA?.opaDisclosureId } });
        }
    }

    private reviseOPA(): void {
        this._headerService.triggerOPACreation('REVISION');
    }

    private createTravelAPI(): void {
        this.$subscriptions.push(this.entityDetailsServices.createTravelDisclosure(this.getCreateTravelRO()).subscribe((data: any) => {
            if (data) {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Travel Disclosure Saved Successfully.');
                this._router.navigate([TRAVEL_DISCLOSURE_FORM_ROUTE_URL],
                    { queryParams: { disclosureId: data.travelDisclosureId } });
            }
        }));
    }

    private getCreateTravelRO(): TravelRO {
        const TRAVEL_RO = new TravelRO();
        TRAVEL_RO.personEntityId = this.relationshipsDetails?.personEntityId;
        TRAVEL_RO.personEntityNumber = this.relationshipsDetails?.personEntityNumber;
        TRAVEL_RO.entityId = this.relationshipsDetails?.entityId;
        TRAVEL_RO.entityNumber = this.relationshipsDetails?.entityId;
        TRAVEL_RO.travelerFundingTypeCode = '2';
        TRAVEL_RO.travelDisclosureId = null;
        return TRAVEL_RO;
    }

    private getModalFCOIMessage(): void {
        const IS_COMPLETED_AVAILABLE = !!this._headerService.activeDisclosures?.find((disclosure: any) => [DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode) && disclosure?.reviewStatusCode === DISCLOSURE_REVIEW_STATUS.COMPLETED);
        const IS_PENDING_AVAILABLE = !!this._headerService.activeDisclosures?.find((disclosure: any) => [DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode) && disclosure?.reviewStatusCode !== DISCLOSURE_REVIEW_STATUS.COMPLETED);
        if (!IS_PENDING_AVAILABLE && IS_COMPLETED_AVAILABLE) {
            if (this.canCreateFCOI) {
                this.appendButtonsToModal('BTN_TYPE', `Create ${COMMON_DISCL_LOCALIZE.FCOI_REVISE_BTN}`, 'btn-primary');
            }
            this.disclosureModalDetails.fcoiMessage = 'REVISE';
            const COMPLETED_DISCLSOURE = this._headerService.activeDisclosures?.find((disclosure: any) => [DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode) && disclosure?.reviewStatusCode === DISCLOSURE_REVIEW_STATUS.COMPLETED);
            this.disclosureModalDetails.id = COMPLETED_DISCLSOURE?.disclosureId;
        } else if (!IS_COMPLETED_AVAILABLE && !IS_PENDING_AVAILABLE) {
            this.disclosureModalDetails.fcoiMessage = 'CREATE';
            if (this.canCreateFCOI) {
                this.appendButtonsToModal('BTN_TYPE', `Create ${COMMON_DISCL_LOCALIZE.TERM_COI} Initial`, 'btn-primary');
            }
        } else {
            this.disclosureModalDetails.fcoiMessage = 'REVISE';
            if (this.canCreateFCOI) {
                if(this.commonService.previousUrlBeforeActivate.includes('coi/create-disclosure/sfi') || this.commonService.previousUrlBeforeActivate.includes('/coi/create-disclosure/relationship')) {
                    this.appendButtonsToModal('BTN_TYPE', `Go To ${COMMON_DISCL_LOCALIZE.TERM_COI}`, 'btn-primary');
                } else {
                    this.appendButtonsToModal('BTN_TYPE', `${COMMON_DISCL_LOCALIZE.FCOI_REVISE_BTN}`, 'btn-primary');
                }
            }
        }
    }

    private getModalOPAMessage(): void {
        const IS_COMPLETED_AVAILABLE = !!this._headerService.activeOPAs.find((disclosure: any) => disclosure?.versionStatus === OPA_VERSION_TYPE.ACTIVE);
        const IS_PENDING_AVAILABLE = !!this._headerService.activeOPAs.find((disclosure: any) => disclosure?.versionStatus === OPA_VERSION_TYPE.PENDING);
        if (!IS_PENDING_AVAILABLE && IS_COMPLETED_AVAILABLE) {
            if (this.canCreateOPA && this.commonService.canCreateOPA) {
                this.appendButtonsToModal('BTN_TYPE', 'Create OPA Revision', 'btn-primary');
            }
            this.disclosureModalDetails.OPAMessage = 'REVISE';
        } else if (!IS_COMPLETED_AVAILABLE && !IS_PENDING_AVAILABLE && this.commonService.canCreateOPA) {
            this.disclosureModalDetails.OPAMessage = 'CREATE';
            if (this.canCreateOPA) {
                this.appendButtonsToModal('BTN_TYPE', 'Create OPA Initial', 'btn-primary');
            }
        } else {
            this.disclosureModalDetails.OPAMessage = 'REVISE';
            if (this.canCreateOPA) {
                if(this.commonService.previousUrlBeforeActivate.includes('coi/opa/form')) {
                    this.appendButtonsToModal('BTN_TYPE', 'Go To OPA', 'btn-primary');
                } else {
                    this.appendButtonsToModal('BTN_TYPE', 'Revise OPA', 'btn-primary');
                }
            }
        }
    }

    private getFormEvaluationRO(): FormValidationRO {
        const RO = new FormValidationRO();
        RO.moduleItemCode = COI_MODULE_CODE;
        RO.moduleSubItemCode = ENGAGEMENT_SUB_MODULE_CODE;
        RO.moduleSubItemKey = 0;
        RO.moduleItemKey = this.entityId;
        return RO;
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe(async (data: GlobalEventNotifier) => {
            switch (data.uniqueId) {
                case 'ADD_ENGAGEMENT_VALIDATION':
                    switch (data.content.modalAction.action) {
                    case 'CLOSE_BTN':
                        this.commonService.closeCOIValidationModal();
                        break;
                    case 'CANCEL_BTN':
                        this.commonService.closeCOIValidationModal();
                        break;
                    case 'SECONDARY_BTN':
                        this.deactivateEngagement();
                        break;
                    case 'PRIMARY_BTN': // mark as void and save
                        this.markProjectDisclosureAsVoid();
                        break;
                    default: break;
                    }
                    break;
                case 'MATRIX_COMPLETED':
                    this.afterMatrixAutoSaveComplete(data?.content);
                    // if (this.isCompModalNeedAgain()) {
                    //     await this.getEntityDetails(this.entityId);
                    //     this.openSFIAmountModal();
                    // } else {
                    //     this.afterMatrixSave();
                    // }
                    break;
                default: break;
            }
        }));
    }

    private deactivateEngagement() {
        const REQ_BODY = {
            personEntityId: this.entityId,
            versionStatus: 'INACTIVE',
            revisionReason: 'The engagement has been created with a deactivated status due to a pending project disclosure',
            personEntityNumber: this.relationshipsDetails?.personEntityNumber
        };
        this.$subscriptions.push(this.entityDetailsServices.activateAndInactivateSfi(REQ_BODY).subscribe((res: any) => {
            this.updateModifiedVersion(res);
            this.updatedRelationshipStatus = 'ACTIVE';
            this.updateEditMode();
            this.commonService.closeCOIValidationModal();
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Engagement deactivated successfully');
        }));
    }

    private markProjectDisclosureAsVoid(): void {
        this.$subscriptions.push(
            this.commonService.markProjectDisclosureAsVoid()
                .subscribe((data: any) => {
                    this.commonService.closeCOIValidationModal();
                    this.openEngSuccessModal();
                }, (error: any) => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    private hasFinancialRelationship(): boolean {
        const HAS_VALID_RELATIONSHIP = this.entityDetailsServices.definedRelationships?.some(
            (rel: any) => FINANCIAL_SUB_TYP_CODES.includes(rel.validPersonEntityRelTypeCode)
        );
        const HAS_VALID_DISCLOSURE_TYPE = this.entityDetailsServices.selectedDisclosureTypes?.some(
            (type: any) => type?.disclosureTypeCode?.toString() === this.FINANCIAL_TYPE.toString()
        );
        return !!(HAS_VALID_RELATIONSHIP || HAS_VALID_DISCLOSURE_TYPE);
    }

    deleteRelationship() {
        this.commonService.isUnifiedQuestionnaireEnabled ? this.deleteRelationshipForUnifiedFlag() : this.deleteRelationshipForNonUnified();
    }

    deleteRelationshipForUnifiedFlag() {
        const DELETED_RELATION = this.entityDetailsServices.perEntDisclTypeSelections?.find(ele => ele.disclosureTypeCode === this.entityDetailsServices.currentRelationshipQuestionnaire.disclosureTypeCode);
        const DELETED_RELATION_INDEX = this.entityDetailsServices.perEntDisclTypeSelections?.findIndex(ele => ele.disclosureTypeCode === this.entityDetailsServices.currentRelationshipQuestionnaire.disclosureTypeCode);
        if (DELETED_RELATION_INDEX > -1) {
            this.$subscriptions.push(this.entityDetailsServices.deletePersonEntityIfUnifiedQuestionnaire
                (DELETED_RELATION.id, this.entityDetailsServices.currentRelationshipQuestionnaire.personEntityId).subscribe(async (res: any) => {
                    this.entityDetailsServices.perEntDisclTypeSelections?.splice(DELETED_RELATION_INDEX, 1);
                    let delIndex = this.entityDetailsServices.definedRelationships.findIndex(ele => ele.validPersonEntityRelType.disclosureTypeCode === this.entityDetailsServices.currentRelationshipQuestionnaire.disclosureTypeCode);
                    if (delIndex > -1) {
                        this.entityDetailsServices.definedRelationships.splice(delIndex, 1);
                    }
                    this.getUnifiedPersonEntityRelationships();
                    this.updateSelectedRelations();
                    if (!this.entityDetailsServices.definedRelationships?.some(ele => ele.validPersonEntityRelType.disclosureTypeCode == 1)) {
                        this.infoText = '';
                    }
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Relationship deleted successfully.');
                    this.setTopForStickySections();
                    this.entityDetailsServices.isRelationshipQuestionnaireChanged = false;
                    this.entityDetailsServices.isMatrixChanged = false;
                    this.removeFromUnsavedSections(RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME);
                    this.removeFromUnsavedSections(FINANCIAL_DETAILS_SECTION_NAME);
                }, _err => {
                    if (_err.status === 405) {
                        this.entityDetailsServices.concurrentUpdateAction = 'Delete Relationship'
                    } else {
                        this.commonService.showToast(HTTP_ERROR_STATUS, `Error in deleting relationship.`);
                    }
                }));
        }
    }

    updateSelectedRelations() {
        this.entityDetailsServices.isNoFormType = false;
        this.entityDetailsServices.canShowMatrixForm = false;
        this.$subscriptions.push(this.entityDetailsServices.fetchDisclosureQuestionType(this.entityId).subscribe((data: any) => {
            this.entityDetailsServices.selectedDisclosureTypes = data;
            this.isMulptipleRelationAvailable();
            this.checkFormCompleted();
            this.entityDetailsServices.remainingSelectedDisclosureTypes = this.entityDetailsServices.allAvailableRelationships.filter(a =>
                !this.entityDetailsServices.selectedDisclosureTypes?.some(b => b.disclosureTypeCode === a.disclosureTypeCode));
        }, err => {
            this.checkFormCompleted();
        }));
    }

    setCurrentRelationshipQuestionnaire() {
        this.$subscriptions.push(this.entityDetailsServices.fetchDisclosureQuestionType(this.entityId).subscribe((data: any) => {
            this.entityDetailsServices.selectedDisclosureTypes = data;
            this.isMulptipleRelationAvailable();
            const SELECTED = this.entityDetailsServices.selectedDisclosureTypes;
            if (SELECTED.length) {
                const current = SELECTED?.find(item => item.dataCapturingTypeCode);
                this.entityDetailsServices.currentRelationshipQuestionnaire = current;
                this.entityDetailsServices.activeRelationship = current?.disclosureTypeCode;
                switch (current?.dataCapturingTypeCode) {
                    case MATRIX_TYPE:
                        this.entityDetailsServices.canShowMatrixForm = true;
                        break;
                    case QUESTIONNAIRE_TYPE:
                        this.triggerOpenQuestionnaire(current);
                        break;
                    case undefined:
                        this.entityDetailsServices.isNoFormType = true;
                        break;
                    default:
                        break;
                }
            }
        }));
    }

    checkFormCompleted() {
        if(!this.entityDetailsServices.validationList?.length && this.engagementCompletionConditionMet()) {
            this.$subscriptions.push(this.entityDetailsServices.checkFormCompleted(this.entityId).subscribe(async (data: any) => {
                this.relationshipsDetails.isFormCompleted = data?.isFormCompleted;
                this.statusChangeIfEngagementCompleted(data?.isFormCompleted);
                this.formEvaluation();
                this.setEngagementStatusInService();
                this.updateEditMode();
                this.setCurrentRelationshipQuestionnaire();
            }, err => {
                this.formEvaluation();
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        } else {
            this.formEvaluation(true);
        }
    }

    deleteRelationshipForNonUnified() {
        this.$subscriptions.push(this.entityDetailsServices.deletePersonEntityRelationship
            (this.entityDetailsServices.currentRelationshipQuestionnaire.personEntityRelId, this.entityDetailsServices.currentRelationshipQuestionnaire.personEntityId).subscribe(async (res: any) => {
                this.updateDefinedRelationships(res);
                this.setTopForStickySections();
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Relationship deleted successfully.');
                this.checkFormCompleteAndOpenModal();
            }, _err => {
                if (_err.status === 405) {
                    this.entityDetailsServices.concurrentUpdateAction = 'Delete Relationship'
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error in deleting relationship.`);
                }
            }));
    }

    updateDefinedRelationships(res) {
        this.addToAvailableRelation();
        if (this.entityDetailsServices.currentRelationshipQuestionnaire.validPersonEntityRelTypeCode in this.entityDetailsServices.relationshipCompletedObject) {
            delete this.entityDetailsServices.relationshipCompletedObject[this.entityDetailsServices.currentRelationshipQuestionnaire.validPersonEntityRelTypeCode];
        }
        this.relationshipsDetails.updateTimestamp = res.updateTimestamp;
        this.relationshipsDetails.isFormCompleted = res.isFormCompleted;
        this.setEngagementStatusInService();
        this.updateEditMode();
        this.updateRelationshipDetailsStatus(true);
        this.entityDetailsServices.isRelationshipQuestionnaireChanged = false;
        this.removeUnsavedDetailsChanges();
        this.entityDetailsServices.activeRelationship = this.entityDetailsServices.currentRelationshipQuestionnaire?.validPersonEntityRelType?.disclosureTypeCode;
        this.isMatrixTypeAvailable = this.entityDetailsServices.definedRelationships.find(ele => ele?.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode === MATRIX_TYPE);
        this.entityDetailsServices.uniqueTabDetials = this.setUniqueDisclosureType();
    }

    removeUnsavedDetailsChanges() {
        let delIndex = this.entityDetailsServices.definedRelationships.findIndex(ele => ele.personEntityRelId === this.entityDetailsServices.currentRelationshipQuestionnaire.personEntityRelId);
        if (delIndex > -1) {
            this.entityDetailsServices.definedRelationships.splice(delIndex, 1);
        }
        this.groupedRelations = this.gropuByRelationType(this.entityDetailsServices.definedRelationships, "validPersonEntityRelType" , "coiDisclosureType", "description");
        if (this.entityDetailsServices.definedRelationships.length) {
            this.openQuestionnaireOrMatrix(this.entityDetailsServices.definedRelationships[0].validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode, this.entityDetailsServices.definedRelationships[0]);
            if (this.commonService.isUnifiedQuestionnaireEnabled) {
                this.entityDetailsServices.currentRelationshipQuestionnaire = this.entityDetailsServices.selectedDisclosureTypes[0];
            } else {
                this.entityDetailsServices.currentRelationshipQuestionnaire = this.entityDetailsServices.definedRelationships[0];
            }
        } else {
            this.entityDetailsServices.currentRelationshipQuestionnaire = {};
        }
        this.removeFromUnsavedSections(RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME);
    }

    private openQuestionnaireOrMatrix(dataCapturingTypeCode: number, relationship: any): void {
        this.entityDetailsServices.activeRelationship = relationship?.validPersonEntityRelType?.disclosureTypeCode;
        if (dataCapturingTypeCode === MATRIX_TYPE) {
            this.entityDetailsServices.canShowMatrixForm = true;
            this.entityDetailsServices.isNoFormType = false;
        } else {
            this.entityDetailsServices.isNoFormType = true;
            this.entityDetailsServices.canShowMatrixForm = false;
            this.triggerOpenQuestionnaire(relationship);
        }
    }

    private removeFromUnsavedSections(sectionName: string) : void{
        const INDEX = this.entityDetailsServices.unSavedSections.findIndex(ele => ele.includes(sectionName));
        if (INDEX >= 0) {
            this.entityDetailsServices.unSavedSections.splice(INDEX, 1);
        }
    }

    addToAvailableRelation() {
        const RELATION_INDEX = this.entityDetailsServices.allAvailableRelationships.findIndex(ele => ele.validPersonEntityRelTypeCode == this.entityDetailsServices.currentRelationshipQuestionnaire.validPersonEntityRelTypeCode);
        this.entityDetailsServices.groupedRelations = {};
        if (this.entityDetailsServices.remainingRelationships.length && this.entityDetailsServices.remainingRelationships[RELATION_INDEX] && this.entityDetailsServices.remainingRelationships[RELATION_INDEX].validPersonEntityRelTypeCode == this.entityDetailsServices.currentRelationshipQuestionnaire.validPersonEntityRelTypeCode) {
            this.entityDetailsServices.remainingRelationships.splice(RELATION_INDEX, 1);
        }
        this.entityDetailsServices.remainingRelationships.splice(RELATION_INDEX, 0, this.entityDetailsServices.currentRelationshipQuestionnaire.validPersonEntityRelType);
        if (this.entityDetailsServices.remainingRelationships.length) {
            this.entityDetailsServices.groupedRelations = groupBy(deepCloneObject(this.entityDetailsServices.remainingRelationships), "coiDisclosureType", "description");
        }
    }

    canShowDeleteRelation() {
        const IS_RELATION_AVAILABLE = (!this.commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.definedRelationships.length) || (this.commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.selectedDisclosureTypes.length);
        const NO_DELETE_NEEDED = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3;
        return IS_RELATION_AVAILABLE && this.isEditMode && this.entityDetailsServices.canMangeSfi && !NO_DELETE_NEEDED;
    }

    setCustomDatachange(event) {
        this.isCustomDataChanged = event;
        this.addUnSavedChanges();
    }

    async openIsCompConfirmation(flag) {
        if (this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3) {
            this.compMsg = '';
            this.isShowInfo = false;
            if (this.checkMandatoryFilled() && !this.engagementsError?.length) {
                this.checkForProjectAndOpen(flag);
            } else if(this.engagementsError?.length) {
                await this.validateForm();
            }
        } else {
            this.additionalDetails.isCompensated = flag;
            this.addUnSavedChanges();
        }
    }

    checkForProjectAndOpen(flag) {
        if (flag && this.getEngagementSfiOrAllFinancial()) {
            if (!this.isSaving) {
                this.isSaving = true;
                this.$subscriptions.push(this.commonService.checkFcoiUnlinkedProjDiscl().subscribe((hasPendingProjDiscl: boolean) => {
                    this.isShowInfo = hasPendingProjDiscl;
                    this.isSaving = false;
                    this.openCompensatedConfimationModal('compensated');
                }, err => {
                    this.isSaving = false;
                    this.openCompensatedConfimationModal('compensated');
                }));
            }
        }
        else {
            this.openCompensatedConfimationModal(flag ? 'compensated' : 'uncompensated');
        }
    }

    openCompensatedConfimationModal(message: 'uncompensated'|'compensated') {
        this.compMsg = message;
        setTimeout(() => {
            openCommonModal(this.COMP_SWITCH_OFF_MODAL_ID);
        });
    }

    compModalPostconfrimation(event) {
        if (event.action === 'PRIMARY_BTN') {
            this.additionalDetails.isCompensated = this.compMsg === 'compensated';
            this.compensatedAddDeleteFinancial();
        } else {
            this.additionalDetails.isCompensated = this.compMsg === 'compensated' ? false : true;
            this.compMsg = '';
            closeCommonModal(this.COMP_SWITCH_OFF_MODAL_ID);
        }
    }

    canShowRelationTab() {
        this.entityDetailsServices.isShowRelationshipDetailsTab = (this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3 && this.entityDetailsServices.isCommitmentTabAvailable) || this.commonService.engagementFlowType !== ENGAGEMENT_FLOW_TYPE.FLOW_3;
        if (!this.entityDetailsServices.isShowRelationshipDetailsTab && this.entityDetailsServices.activeTab === 'QUESTIONNAIRE') {
            this.entityDetailsServices.activeTab = 'RELATION_DETAILS';
        }
        if (!this.entityDetailsServices.isShowRelationshipDetailsTab && this.entityDetailsServices.activeTab === 'QUESTIONNAIRE') {
            this.openEngSuccessModal();
        }
    }

    async compensatedAddDeleteFinancial() {
        let reqObj: any = {};
        await this.isMandatoryComponentAvailable();
        this.additionalDetails.involvementStartDate = parseDateWithoutTimestamp(this.involvementDate.involvementStartDate);
        if (this.involvementDate.involvementEndDate) {
            this.additionalDetails.involvementEndDate = parseDateWithoutTimestamp(this.involvementDate.involvementEndDate);
        }
        if (this.additionalDetails.isCompensated) {
            reqObj.isEngagementCompensated = this.additionalDetails.isCompensated;
            reqObj.personEntityRelationship = {
                'questionnaireAnsHeaderId': null,
                'personEntityId': this._route.snapshot.queryParamMap.get('personEntityId'),
                'disclTypeCodes': [RELATIONS_TYPE_SUMMARY.FINANCIAL]
            };
            reqObj.updatePersonEntityDto = deepCloneObject(this.additionalDetails);
            reqObj.isMandatoryFieldsComplete = !this.entityDetailsServices.isMandatoryComponentAvailable;
        } else {
            const DELETED_RELATION = this.entityDetailsServices.perEntDisclTypeSelections?.find(ele => ele.disclosureTypeCode == RELATIONS_TYPE_SUMMARY.FINANCIAL);
            const DELETED_RELATION_INDEX = this.entityDetailsServices.perEntDisclTypeSelections?.findIndex(ele => ele.disclosureTypeCode == RELATIONS_TYPE_SUMMARY.FINANCIAL);
            if (DELETED_RELATION_INDEX > -1) {
                reqObj.isEngagementCompensated = this.additionalDetails.isCompensated;
                reqObj.perEntDisclTypeSelectedId = DELETED_RELATION.id;
                reqObj.personEntityId = this.entityId;
                reqObj.updatePersonEntityDto = deepCloneObject(this.additionalDetails);
                reqObj.isMandatoryFieldsComplete = !this.entityDetailsServices.isMandatoryComponentAvailable;
            } else {
                closeCommonModal(this.COMP_SWITCH_OFF_MODAL_ID);
                this.additionalDetails.isCompensated = true;
            }
        }
        this.updateEngRelation(reqObj);
    }

    async commitmentRelAddDelete(): Promise<void> {
        const reqObj: any = {};
        // await this.isMandatoryComponentAvailable();
        this.additionalDetails.involvementStartDate = parseDateWithoutTimestamp(this.involvementDate.involvementStartDate);
        if (this.involvementDate.involvementEndDate) {
            this.additionalDetails.involvementEndDate = parseDateWithoutTimestamp(this.involvementDate.involvementEndDate);
        }
        if (this.additionalDetails.isCommitment) {
            reqObj.isModifyingCommitmentRel = true;
            reqObj.isCommitment = this.additionalDetails.isCommitment;
            reqObj.personEntityRelationship = {
                'questionnaireAnsHeaderId': null,
                'personEntityId': this._route.snapshot.queryParamMap.get('personEntityId'),
                'disclTypeCodes': [RELATIONS_TYPE_SUMMARY.COMMITMENT]
            };
            reqObj.updatePersonEntityDto = deepCloneObject(this.additionalDetails);
            reqObj.isMandatoryFieldsComplete = !this.entityDetailsServices.isMandatoryComponentAvailable;
        } else {
            const DELETED_RELATION_INDEX = this.entityDetailsServices.perEntDisclTypeSelections?.findIndex(ele => ele.disclosureTypeCode == RELATIONS_TYPE_SUMMARY.COMMITMENT);
            if (DELETED_RELATION_INDEX > -1) {
                const DELETED_RELATION = this.entityDetailsServices.perEntDisclTypeSelections[DELETED_RELATION_INDEX];
                reqObj.isModifyingCommitmentRel = true;
                reqObj.isCommitment = this.additionalDetails.isCommitment;
                reqObj.perEntDisclTypeSelectedId = DELETED_RELATION.id;
                reqObj.personEntityId = this.entityId;
                reqObj.updatePersonEntityDto = deepCloneObject(this.additionalDetails);
                reqObj.isMandatoryFieldsComplete = !this.entityDetailsServices.isMandatoryComponentAvailable;
            } else {
                this.closeCommitmentToggleModal(true);
            }
        }
        this.updateEngRelation(reqObj);
    }

    private updateEngRelation(reqObj: any): void {
        if (!isEmptyObject(reqObj)) {
            this.$subscriptions.push(this.entityDetailsServices.updateEngRelation(reqObj).subscribe(async (data: any) => {
                reqObj.isModifyingCommitmentRel ? this.closeCommitmentToggleModal(this.additionalDetails.isCommitment) : closeCommonModal(this.COMP_SWITCH_OFF_MODAL_ID);
                this.entityDetailsServices.matrixResponse = [];
                this.entityDetailsServices.isAdditionalDetailsChanged = false;
                this.setTopForStickySections();
                this.removeUnSavedSections();
                if (reqObj.isModifyingCommitmentRel) {
                    await this.getApplicableForms();
                }
                await this.fetchMatrixComplete();
                if (this.entityDetailsServices.validationList?.length) {
                    //we need timeout to set validation in form if already triggererd based on API call.
                    this.setValidationTimer = setTimeout(async () => {
                        await this.validateForm();
                    }, 200);
                }
                // if(!this.entityDetailsServices.isMandatoryComponentAvailable) {
                    // this.checkFormCompleted();
                // } else {
                    await this.getEntityDetails(this.entityId);
                    this.updateEditMode();
                    // this.formEvaluation();
                // }
                this.updateRelationTab();
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        } else {
            reqObj.isModifyingCommitmentRel ? this.closeCommitmentToggleModal(true) : closeCommonModal(this.COMP_SWITCH_OFF_MODAL_ID);
        }
    }

    updateRelationTab() {
        this.$subscriptions.push(this.entityDetailsServices.fetchDisclosureQuestionType(this.entityId).subscribe((data: any) => {
            this.entityDetailsServices.selectedDisclosureTypes = data;
            this.isMulptipleRelationAvailable();
        }));
    }

    canShowQuestionnaireTab(disclosureTypeCode) {
        return (this.entityDetailsServices?.isCommitmentTabAvailable && disclosureTypeCode == this.COMMITMENT_TYPE) || (disclosureTypeCode == RELATIONS_TYPE_SUMMARY.TRAVEL && this.commonService.engagementFlowType !== ENGAGEMENT_FLOW_TYPE.FLOW_3) || (disclosureTypeCode == RELATIONS_TYPE_SUMMARY.FINANCIAL);
    }

    onMatrixLoaded(): void {
        this.setTopForStickySections()
    }

    triggerClickForId(elementId: string): void {
        if (elementId) {
            document.getElementById(elementId).click();
        }
    }

    listenForFormSaveComplete() {
        this.$subscriptions.push(this.entityDetailsServices.triggerSaveComplete.subscribe(response => {
            this.afterAdditionalSectionSave(response);
        }));
    }

    getApplicableForms(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const REQ_OBJ = this.commonService.getApplicableFormRO(COI_MODULE_CODE.toString(), ENGAGEMENT_SUB_MODULE_CODE.toString(), this.commonService.getCurrentUserDetail('personID'), this.entityId);
            this.$subscriptions.push(this.commonService.getApplicableForms(REQ_OBJ).subscribe((data: any) => {
                this.entityDetailsServices.formListData = data || [];
                this.formList = data || [];
                this.setFormStatus();
                this.getFormId(this.formList[0]);
                resolve(true);
            }, async _error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                resolve(false);
            }))
        });
    }

    private setFormStatus(): void {
        this.formList.forEach((form: any) => {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                this.entityDetailsServices.formStatusMap.set(form?.answeredFormId, 'N');
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                this.entityDetailsServices.answeredFormId = form?.answeredFormId;
                this.entityDetailsServices.formStatusMap.set(form?.activeFormId, 'Y');
            } else {
                this.entityDetailsServices.formStatusMap.set(form?.activeFormId, 'N');
            }
        });
    }

    private getFormId(form: any): void {
        if (this.isEditMode) {
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
        this.entityDetailsServices.triggerFormId.next({ 'formId': this.formId, 'engagementId': this.entityId?.toString() });
    }

    validateForm(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (this.formId && !this.isValidateFormSaving) {
                this.isValidateFormSaving = true;
                this.$subscriptions.push(this.validateFormAPI().subscribe(async (data: any) => {
                    this.validateRelationshipToggle();
                    this.isValidateFormSaving = false;
                    const VALIDATION_LIST = [...data, ...this.engagementsError];
                    if (VALIDATION_LIST.length) {
                        VALIDATION_LIST.forEach(ele => ele.navigationURL = ENGAGEMENT_ROUTE_URL);
                        this.entityDetailsServices.isMandatoryComponentAvailable = true;
                        this.isProceedButtonClicked = false;
                    } else {
                        this.entityDetailsServices.isMandatoryComponentAvailable = false;
                    }
                    this.entityDetailsServices.validationList = [...arrangeFormValidationList(VALIDATION_LIST)];
                    this._headerService.$globalPersistentEventNotifier.$formValidationList.next(this.entityDetailsServices.validationList);
                    resolve(true);
                }, err => {
                    this.isValidateFormSaving = false;
                    this.entityDetailsServices.validationList = [... this.engagementsError];
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error occurred during form validation. Please try again.`);
                    resolve(false);
                }));
            } else {
                this.entityDetailsServices.validationList = [... this.engagementsError];
                resolve(true);
            }
        });
    }

    private isMandatoryComponentAvailable(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (this.isEditMode) {
                this.$subscriptions.push(this.validateFormAPI().subscribe((data: any) => {
                    this.validateRelationshipToggle();
                    const HAS_UNFILLED_MANDATORY_FIELDS = data?.length > 0 || this.engagementsError.length > 0;
                    this.entityDetailsServices.isMandatoryComponentAvailable = HAS_UNFILLED_MANDATORY_FIELDS;
                    resolve(true);
                }, (err) => {
                    this.entityDetailsServices.isMandatoryComponentAvailable = false;
                    resolve(false);
                }
                ));
            } else {
                this.entityDetailsServices.isMandatoryComponentAvailable = false;
                resolve(false);
            }
        });
    }


    private validateFormAPI(): Observable<any> {
        return this.commonService.validateForm({
            formBuilderIds: [this.formId],
            moduleItemCode: COI_MODULE_CODE,
            moduleSubItemCode: ENGAGEMENT_SUB_MODULE_CODE,
            moduleItemKey: this.entityId,
            moduleSubItemKey: ENGAGEMENT_SUB_ITEM_KEY.toString(),
        });
    }

    private setEngagementStatusInService() : void {
        this.entityDetailsServices.isFormCompleted = (this.relationshipsDetails.isFormCompleted && this.relationshipsDetails.versionStatus === 'ACTIVE') || this.relationshipsDetails.versionStatus !== 'ACTIVE';
        if(this.relationshipsDetails.versionStatus !== 'ACTIVE') {
            this.entityDetailsServices.isMandatoryComponentAvailable = false;
        }
    }

    private createValidationError(componentId: string, message: string): COIFormValidation {
        return {
            componentId,
            formBuilderId: this.formId,
            validationMessage: message,
            validationType: 'VM'
        };
    }

    private clearUnSaveChangesFlag(): void{
        this.entityDetailsServices.isRelationshipQuestionnaireChanged = false;
        this.entityDetailsServices.isAdditionalDetailsChanged = false;
        this.entityDetailsServices.isMatrixChanged = false;
        this.entityDetailsServices.isFormDataChanged = false;
        this.entityDetailsServices.isMandatoryComponentAvailable = false;
        this.entityDetailsServices.isFormCompleted = true;
    }

    private getRelatedDisclosures(): void {
        this.$subscriptions.push(this.entityDetailsServices.relatedTravelDisclosure(this.relationshipsDetails.personEntityNumber).subscribe((data: any) => {
            this.relatedDislcosures = data;
        }));
    }

    deleteSelectedRelationshipType() {
        const SELECTED_TYPE = this.getSelectedRelationTypeCodes();
        const REQ_ARR = []
        SELECTED_TYPE.forEach(ele => {
            REQ_ARR.push({ personEntityRelId: ele, personEntityId: this.relationshipsDetails.personEntityId });
        });
        this.$subscriptions.push(
            forkJoin(
                REQ_ARR.map(param => this.entityDetailsServices.deletePersonEntityRelationship(param.personEntityRelId, param.personEntityId))
            ).subscribe(async (data: any) => {
                const CURRENT_QUESTIONNAIRE = this.entityDetailsServices.currentRelationshipQuestionnaire;
                await this.getEntityDetails(this.entityId);
                this.commonService.$globalEventNotifier.next({ uniqueId: 'ENGAGEMENT_GROUP_DELETE' });
                this.checkedRelationships = {};
                if (this.entityDetailsServices.definedRelationships?.find(ele => ele?.validPersonEntityRelType?.disclosureTypeCode === CURRENT_QUESTIONNAIRE.validPersonEntityRelType.disclosureTypeCode)) {
                    this.entityDetailsServices.currentRelationshipQuestionnaire = CURRENT_QUESTIONNAIRE;
                } else {
                    this.entityDetailsServices.currentRelationshipQuestionnaire = this.entityDetailsServices.definedRelationships[0];
                }
                this.openQuestionnaireOrMatrix(this.entityDetailsServices.currentRelationshipQuestionnaire.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode, this.entityDetailsServices.currentRelationshipQuestionnaire);
                this.checkFormCompleteAndOpenModal();
            })
        );
    }

    checkFormCompleteAndOpenModal() {
        if(!this.entityDetailsServices.validationList?.length && this.engagementCompletionConditionMet()) {
            this.$subscriptions.push(this.entityDetailsServices.checkFormCompleted(this.entityId).subscribe(async (data: any) => {
                await this.getEntityDetails(this.entityId);
                this.updateEditMode();
                this.statusChangeIfEngagementCompleted(data?.isFormCompleted);
                if(this.relationshipsDetails.isFormCompleted) {
                    this.openValidationOrSuccessModal();
                }
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        } else {
            this.canOpenCompAmountModal();
        }
    }

    getSelectedRelationTypeCodes(): string[] {
        return Object.keys(this.checkedRelationships).filter(key => this.checkedRelationships[key]);
    }

    openDeleteModal() {
        this.checkedRelationships = {};
        openModal('deleteRelationModal');
        this.isDeleteButtonDisabled = true;
    }

    checkDeleteButtonDisabled() {
        this.isDeleteButtonDisabled = !this.getSelectedRelationTypeCodes().length;
    }

    stepNavAction(event: any): void {
        switch (event?.actionType as CoiStepsNavActionType) {
            case 'PREVIOUS':
                this.executeEngagementActions('openRelationShipSection');
                break;
            case 'PROCEED':
                // this.proceedButtonAction();
                this.executeEngagementActions('openQuestionnaireTab')
                break;
            case 'COMPLETE_ENGAGEMENT':
                this.completeEngagement();
                break;
            default: break;
        }
    }

    updateStepsNavBtnConfig(): void {
        this.entityDetailsServices.stepsNavBtnConfig = new CoiStepsNavConfig();
        switch (true) {
            case (this.entityDetailsServices.activeTab === 'RELATION_DETAILS'):
                this.entityDetailsServices.stepsNavBtnConfig = this.setStepConfig(true, true);
                break;
            case (this.entityDetailsServices.activeTab === 'QUESTIONNAIRE'):
                this.entityDetailsServices.stepsNavBtnConfig = this.setStepConfig(false, false);
                break;
            default: break;
        }
    }

    setStepConfig(prev_disable: boolean = false, showProceedBtn: boolean = true) {
        const CONFIG = new CoiStepsNavConfig();
        CONFIG.previousBtnConfig.isDisabled = prev_disable;
        CONFIG.previousBtnConfig.isShowBtn = true;
        CONFIG.previousBtnConfig.title = prev_disable ? 'The button is disabled' : CONFIG.previousBtnConfig.title;
        CONFIG.previousBtnConfig.ariaLabel = CONFIG.previousBtnConfig.title;
        CONFIG.proceedBtnConfig.btnName = 'Proceed';
        CONFIG.proceedBtnConfig.isShowBtn = showProceedBtn;
        CONFIG.proceedBtnConfig.ariaLabel = CONFIG.proceedBtnConfig.title;
        if (this.entityDetailsServices.activeTab === 'QUESTIONNAIRE') {
            CONFIG.primaryBtnConfig.isShowBtn = this.entityDetailsServices.canMangeSfi && this.isEditMode;
            CONFIG.primaryBtnConfig = {
                btnName: 'Complete Engagement',
                matIcon: 'done',
                ariaLabel: 'Click here to complete engagement',
                title: 'Click here to complete engagement',
                isDisabled: false,
                isShowBtn: true,
                actionType: 'COMPLETE_ENGAGEMENT'
            };
        }
        return CONFIG;
    }

    validateDateFormat(fieldName: 'startDate' | 'endDate'): void {
        const INPUT_DATE_FIELD = fieldName === 'startDate' ? this.startDateInput : this.endDateInput;
        if (!INPUT_DATE_FIELD) return;
        this.dateValidationMap.delete(fieldName);
        const DATE_VALUE = INPUT_DATE_FIELD.nativeElement.value?.trim();
        const ERROR_MESSAGE = getInvalidDateFormatMessage(DATE_VALUE);
        if (ERROR_MESSAGE) {
            this.dateValidationMap.set(fieldName, ERROR_MESSAGE);
        }
    }

    private evaluateSFI(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.$subscriptions.push(this.entityDetailsServices.evaluateSFI(this.relationshipsDetails.personEntityId).subscribe((data: any) => {
                this.relationshipsDetails.isSignificantFinInterest = data;
                resolve(true);
            }, (err) => {
                this.relationshipsDetails.isSignificantFinInterest = false;
                resolve(false);
            }
            ));
        });
    }

    openSFIAmountModal() {
        this.compAmountModalHeader = 'Update Total Compensated Income';
        this.compAmntModalConfig.namings.primaryBtnName = 'Update';
        this.isUpdateAmount = true;
        this.openTotalAmountModal();
    }

    private async openTotalAmountModal(): Promise<void> {
        this.compAmountValidationMap.clear();
        this.compensatedAmount = String(this.relationshipsDetails?.compensationAmount)?.includes('>=') ? null : this.relationshipsDetails.compensationAmount;
        setTimeout(() => {
            openCommonModal(this.compAmntModalId);
        }, 50);
    }
 
    compAmntModalPostConfirmation(event: ModalActionEvent) {
        if (event?.action === 'PRIMARY_BTN') {
            this.saveTotalAmount();
        } else {
            this.isUpdateAmount = false;
            closeCommonModal(this.compAmntModalId);
        }
    }

    private saveTotalAmount(isDeleteAction = false): void {
        if (this.checkForValidCompAmount() || isDeleteAction) {
            this.$subscriptions.push(this.entityDetailsServices.saveCompensatedAmount(this.relationshipsDetails.personEntityId, this.compensatedAmount).subscribe((data: any) => {
                if(!isDeleteAction) { 
                    closeCommonModal(this.compAmntModalId); 
                }
                setTimeout(async () => {
                    this.relationshipsDetails.compensationAmount = this.compensatedAmount;
                    this.entityDetailsServices.isChangeinMatrix = false;
                    // await this.evaluateSFI();
                    if (!this.isUpdateAmount) {
                        this.updateEditMode();
                        this.openEngCompletionModal();
                    }
                    this.isUpdateAmount = false;
                }, 200);
                this.commonService.showToast(HTTP_SUCCESS_STATUS, "Total compensated amount saved successfully.");
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, "Error in saving total compensated amount, please try again");
            }));
        }
    }

    private checkForValidCompAmount(): boolean{
        this.compAmountValidationMap.clear();
        if(!this.compensatedAmount || this.compensatedAmount === 0) {
            this.compAmountValidationMap.set('validCompAmount', 'Please enter a valid amount.');
        }
        return this.compAmountValidationMap.size === 0;
    }

    private setFCOITypeCode(coiDisclosures: any): void {
        this.hasPendingFCOI = false;
        this.hasFCOIDisclosure = false;
        this.hasSubmittedDisclosure = false;
        this.pendingInitialRevisionDiscl = null;
        coiDisclosures?.forEach((disclosure: any) => {
            // checking whether any initial or revision disclosure.
            if ([DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode)) {
                this.hasFCOIDisclosure = true;
                // checking whether the disclosure version is pending. (note: only one disclosure will be in pending state.)
                if (disclosure?.versionStatus == 'PENDING') {
                    this.hasPendingFCOI = true;
                    this.pendingInitialRevisionDiscl = disclosure;
                    const { SUBMITTED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED } = DISCLOSURE_REVIEW_STATUS;
                    this.hasSubmittedDisclosure = [SUBMITTED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED].includes(disclosure?.reviewStatusCode);
                }
            }
        });
    }

    private closeCommitmentToggleModal(isCommitment: boolean): void {
        closeCommonModal(this.commitmentToggleModalConfig.namings.modalName);
        setTimeout(() => {
            this.additionalDetails.isCommitment = isCommitment;
        }, 200);
    }

    async toggleIsCommitment(flag: boolean): Promise<void> {
        if (this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3) {
            if (this.checkMandatoryFilled() && !this.engagementsError?.length) {
                this.additionalDetails.isCommitment = flag;
                openCommonModal(this.commitmentToggleModalConfig.namings.modalName);
            } else if(this.engagementsError?.length) {
                await this.validateForm();
            }
        } else {
            this.additionalDetails.isCommitment = flag;
            this.addUnSavedChanges();
        }
    }

    commitmentToggleModalAction(event: ModalActionEvent): void {
        if (event.action === 'PRIMARY_BTN') {
            this.commitmentRelAddDelete();
        } else {
            this.closeCommitmentToggleModal(!this.additionalDetails.isCommitment);
        }
    }

    async completeEngagement() {
        this.entityDetailsServices.validationList = [];
        await this.validateForm();
        const MATRIX_RESPONSE = this.entityDetailsServices.matrixResponse;
        const IS_MATRIX_COMPLETE_CONDITION_SATISFIED = isMatrixReadyForSubmission(MATRIX_RESPONSE) || checkAllAreUncomp(this.entityDetailsServices.matrixResponse);
        if (this.relationshipsDetails.compensationAmount && IS_MATRIX_COMPLETE_CONDITION_SATISFIED) {
            this.compensatedAmount = null;
            await this.deleteCompAmount();
        }
        if(!this.entityDetailsServices.validationList?.length) {
            this.canOpenCompAmountModalForComplete();
        }
    }

    private async canOpenCompAmountModalForComplete(): Promise<void> {
        if (this.commonService.isSfiEvaluationEnabled) {
            if(this.entityDetailsServices.definedRelationships.length) {
                await this.checkIfQuestionnaireCompleted();
            }
            const NO_FORM_VALIDATION = !this.entityDetailsServices.validationList?.length;
            const IS_MATRIX_COMPLETE = this.entityDetailsServices.isMatrixComplete;
            const IS_QUEST_COMPLETE = (this.entityDetailsServices.definedRelationships.length && this.entityDetailsServices.isAllQuestionnaireCompleted) || !this.entityDetailsServices.definedRelationships.length;
            const MATRIX_RESPONSE = this.entityDetailsServices.matrixResponse;
            const IS_MATRIX_COMPLETE_CONDITION_SATISFIED = !isMatrixReadyForSubmission(MATRIX_RESPONSE) && !checkAllAreUncomp(this.entityDetailsServices.matrixResponse);
            const ATLEAST_ONE_ANSWER_BELOW_RANGE = checkHasAnyLowRange(MATRIX_RESPONSE);
            const TOTAL_COMP_AMOUNT = (this.relationshipsDetails.compensationAmount && !String(this.relationshipsDetails?.compensationAmount)?.includes('>='));
            const CAN_OPEN_MODAL = NO_FORM_VALIDATION && IS_MATRIX_COMPLETE && IS_QUEST_COMPLETE &&
                IS_MATRIX_COMPLETE_CONDITION_SATISFIED && ATLEAST_ONE_ANSWER_BELOW_RANGE && this.entityDetailsServices.isChangeinMatrix;
            if (CAN_OPEN_MODAL) {
                if (TOTAL_COMP_AMOUNT) {
                    this.compAmountModalHeader = 'Update Total Compensated Income';
                    this.compAmntModalConfig.namings.primaryBtnName = 'Update';
                } else {
                    this.compAmountModalHeader = 'Add Total Compensated Income';
                    this.compAmntModalConfig.namings.primaryBtnName = 'Confirm';
                }
                this.openTotalAmountModal();
            } else {
                this.openEngCompletionModal();
            }
        }
    }

    private validateRelationshipToggle(): void {
        this.engagementsError = [];
        const IS_FLOW_3 = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3;
        if (IS_FLOW_3 && this.commonService.isUnifiedQuestionnaireEnabled && !this.entityDetailsServices.selectedDisclosureTypes?.length) {
            const ERROR_MESSAGE = ENGAGEMENT_LOCALIZE.ENG_REL_TOGGLE_VALIDATION_MSG;
            this.engagementsError.push(this.createValidationError('comp-commit-toggle', ERROR_MESSAGE));
        }
        if(this.entityDetailsServices.isShowRelationshipDetailsTab && !this.entityDetailsServices.isMatrixComplete) {
            this.engagementsError.push(this.createValidationError('coi-engagement-matrix', `${this.relationshipDetailsSectionName} are required. Please complete this section.`));
        }
    }

    afterMatrixAutoSaveComplete(content: any) {
        this.openAfterAutoSave();
        this.relationshipsDetails.updateTimestamp = content;
        this.autoSaveService.updatedLastSaveTime(content, true);
    }

    openAfterAutoSave() {
         if(this.entityDetailsServices.clikcedTab) {
            (this as any)[this.entityDetailsServices.clikcedTab](); // Call by method name
            this.entityDetailsServices.clikcedTab = '';
        }
    }

    executeEngagementActions(functionName: string): void {
        if (this.commonService.hasChangesAvailable) {
            this.entityDetailsServices.clikcedTab = functionName;
        } else {
            (this as any)[functionName]();
        }
    }

    private autoSaveSubscribe(): void {
            this.$subscriptions.push(this.autoSaveService.autoSaveTrigger$.subscribe((event: AutoSaveEvent) => {
                this.saveRelationship();
            }
        ));
    }

    deleteCompAmount(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.$subscriptions.push(
                this.entityDetailsServices.saveCompensatedAmount(this.relationshipsDetails.personEntityId, this.compensatedAmount).subscribe((data: any) => {
                    setTimeout(() => {
                        this.relationshipsDetails.compensationAmount = this.compensatedAmount;
                        resolve(true);
                    }, 200);
                },
                    (err) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                        resolve(false);
                    }
                ));
        });
    }

    onRadioBtnChange(flag: boolean, field: 'SPONSOR_RESEARCH' | 'COMPENSATED' | 'COMMITMENT'): void {
        switch(field) {
            case 'SPONSOR_RESEARCH':
                this.additionalDetails.sponsorsResearch = flag;
                this.addUnSavedChanges();
                this.autoSaveEngagmentDetails();
                break;
            case 'COMPENSATED':
                this.additionalDetails.isCompensated = flag;
                this.openIsCompConfirmation(flag);
                break;
            case 'COMMITMENT':
                this.additionalDetails.isCommitment = flag;
                this.toggleIsCommitment(flag);
                break;
            default: break;
        }
    }

    private fetchMatrixComplete(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.$subscriptions.push(this.entityDetailsServices.fetchMatrixJSON(this.entityId).subscribe((data: { coiMatrixResponse: COIMatrix[], matrixComplete: boolean }) => {
                this.entityDetailsServices.isMatrixComplete = data?.matrixComplete;
                this.entityDetailsServices.matrixResponse = data?.coiMatrixResponse;
                resolve(true);
            }, async _error => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                resolve(false);
            }))
        });
    }

    openPrintEngagementModal(): void {
        const { personEntityId, personEntityNumber, updateUserFullName } = this.relationshipsDetails || {};
        this.printModalConfig = new PrintModalConfig();
        this.printModalConfig.moduleItemKey = personEntityId;
        this.printModalConfig.moduleItemCode = COI_MODULE_CODE;
        this.printModalConfig.moduleItemNumber = personEntityNumber;
        this.printModalConfig.moduleSubItemCode = ENGAGEMENT_SUB_MODULE_CODE;
        this.printModalConfig.modalConfig.namings.modalName = 'coi-eng-print-modal';
        this.printModalConfig.modalHeaderText = 'Print Engagement';
        this.printModalConfig.templateLabel = 'Choose a template to print engagement';
        this.printModalConfig.fileName = `engagement-${personEntityId}-${updateUserFullName}`;
        this.printModalConfig.isOpenPrintModal = true;
    }

    printModalClosed(): void {
        this.printModalConfig = new PrintModalConfig();
    }

    private setReviseDocumentAction(targetModule: DocumentTypes): void {
        const DOCUMENT_ACTION: DocumentActionStorageEvent = { action: 'REVISE', triggeredFrom: 'ENGAGEMENT', targetModule: targetModule, isModalRequired: false };
        this._headerService.setDocActionStorageEvent(DOCUMENT_ACTION);
    }
    
}
