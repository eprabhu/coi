import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { COMMON_ERROR_TOAST_MSG, DATE_PLACEHOLDER, ENTITY_SOURCE_TYPE_CODE, FINANCIAL_SUB_TYP_CODES,
    HTTP_SUCCESS_STATUS, RELATIONS_TYPE_SUMMARY, ENGAGEMENT_FLOW_TYPE, 
    ENGAGEMENT_REL_TYPE_ICONS} from '../../../src/app/app-constants';
import { environment } from '../../environments/environment';
import { HTTP_ERROR_STATUS } from '../app-constants';
import { CommonService } from '../common/services/common.service';
import { NavigationService } from '../common/services/navigation.service';
import { ElasticConfigService } from '../common/services/elastic-config.service';
import { setEntityObjectFromElasticResult } from '../common/utilities/elastic-utilities';
import { InformationAndHelpTextService } from '../common/services/informationAndHelpText.service';
import { getInvalidDateFormatMessage, compareDates, parseDateWithoutTimestamp } from '../common/utilities/date-utilities';
import { CommonModalConfig, ModalActionEvent } from '../shared-components/common-modal/common-modal.interface';
import { EntireEntityDetails, EntityRequestFields, EntityUpdateClass } from '../entity-management-module/shared/entity-interface';
import { EntityCreationModalConfig, COIValidationModalConfig, GlobalEventNotifier } from '../common/services/coi-common.interface';
import { ENTITY_MANDATORY_REPORTER_FIELDS } from '../entity-management-module/shared/entity-constants';
import { deepCloneObject, isEmptyObject, openModal } from '../common/utilities/custom-utilities';
import { AddSfiService } from './services/add-sfi.service';
import { MigratedEngagementsService } from '../migrated-engagements/migrated-engagements.service';
import { LegacyEngagement, SaveMatrixRO } from '../migrated-engagements/migrated-engagements-interface';
import { HeaderService } from '../common/header/header.service';
import { EntityDetailsModalService } from '../shared-components/entity-details-modal/entity-details-modal.service';
import { AddEngagementData } from './add-sfi.interface';
import { ENGAGEMENT_LOCALIZE } from '../app-locales';
import { SearchLengthValidatorOptions } from '../shared/common.interface';

declare const $: any;
export interface EndpointOptions {
    contextField: string;
    formatString: string;
    path: string;
    defaultValue: string;
    params: string;
}
@Component({
    selector: 'app-add-sfi',
    templateUrl: './add-sfi.component.html',
    styleUrls: ['./add-sfi.component.scss']
})
export class AddSfiComponent implements OnInit, OnDestroy {

    @ViewChild('startDateInput', { static: false }) startDateInput?: ElementRef;
    @ViewChild('endDateInput', { static: false }) endDateInput?: ElementRef;
    isSaving = false;
    entityDetails: any = {};
    additionalDetails = new AddEngagementData();
    ENGAGEMENT_FLOW_TYPE = ENGAGEMENT_FLOW_TYPE;
    deployMap = environment.deployUrl;
    isAddAttachment = false;
    isAddAssignee = false;
    dateTime: string;
    datePlaceHolder = DATE_PLACEHOLDER;
    isReadMore: false;
    clearField: any = false;
    entitySearchOptions: any = {};
    $subscriptions: Subscription[] = [];
    mandatoryList = new Map();
    emailWarningMsg: any;
    sfiLookUpList: any = {};
    isExpandedAdditionalDetails = true;
    isResultFromSearch = false;
    riskLevelLookup = [];
    heading: string;
    buttonName: string;
    btnTitle = '';
    isViewMode: any;
    sfiType: string;
    existingEntityDetails: any = {};
    addEntityConfirmation: any = null;
    isAddressReadMore: false;
    isChecked = {};
    relationLookup: any = [];
    concurrencyPersonEntityId = null;
    involvementDate = {
        involvementStartDate: null,
        involvementEndDate: null
    }
    $performAction = new Subject<'SAVE_AND_VALIDATE' | 'VALIDATE_ONLY'>();
    newlyCreatedEntityDetails = new EntityUpdateClass();
    CONFIRM_MODAL_ID = 'coi-sfi-confirm';
    modalConfig = new CommonModalConfig(this.CONFIRM_MODAL_ID, 'Create', 'Create as Deactivate', 'lg');
    newelyCreatedEntityDetails = new EntityUpdateClass();
    entityDetailsForCard = new EntityUpdateClass();
    isShowEntityDetailsCard = false;
    $saveCustomData = new Subject();
    createdEngagementResponse: any = {
        personEntityId: null,
        personEntityNumber: null
    };
    compMsg: 'compensated' | 'uncompensated' | '' = '';
    isCustomDataChanged = false;
    isMandatoryFieldsFilled = false;
    dateValidationMap = new Map();
    isFromEngMigration = false;
    migratedEngagementId = '';
    migEngagementDetails = new LegacyEngagement();
    isDisableFinancialToggle = false;
    relationshipIconMap = ENGAGEMENT_REL_TYPE_ICONS;
    entitySearchLimiterOptions = new SearchLengthValidatorOptions();
    // COMP_SWITCH_OFF_MODAL_ID = 'COMP_SWITCH_OFF_MODAL_ID';
    // compSwitchOffModalConfig = new CommonModalConfig(this.COMP_SWITCH_OFF_MODAL_ID, 'Yes', 'Cancel');
    // isProjectDisclosureAvailable = false;

    @Input() isSlider = false;
    @Input() sfiSliderSectionConfig: any;
    @Input() entitySectionConfig: any;
    @Output() closeSlider = new EventEmitter();

    constructor(private _addSfiService: AddSfiService, private _activatedRoute: ActivatedRoute,
        public commonService: CommonService, private _router: Router, public _navigationService: NavigationService,
        private _elasticConfig: ElasticConfigService, private _informationAndHelpTextService: InformationAndHelpTextService,
        private _entityModalService: EntityDetailsModalService, private _migratedEngagementService: MigratedEngagementsService, private _headerService: HeaderService) { }

    ngOnInit(): void {
        this.checkForEngMigrationEntity();
        this.listenToGlobalNotifier();
        this.getSfiSliderSectionConfig();
        this.setHeader();
        this.getRelationshipLookUp();
        this.setEntitySearchConfig();
    }

    ngOnDestroy(): void {
        this.closeModalIfOpen();
    }

    private checkForEngMigrationEntity(): void {
        this._activatedRoute.queryParams.subscribe(params => {
            const ENTITY_ID = params['entityId'];
            this.migratedEngagementId = params['engagementId'];
            if (ENTITY_ID && this.migratedEngagementId) {
                this.isFromEngMigration = true;
                this.isViewMode = true;
                this.fetchEntityDetails(ENTITY_ID);
                this.fetchMigEngagementDetails(this.migratedEngagementId);
            }
        });
    }

    private setEntitySearchConfig(): void {
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
        this.entitySearchLimiterOptions.isShowLimiter = false;
        this.entitySearchLimiterOptions.limit = 500;
        this.entitySearchLimiterOptions.limiterStyle = 'text-end word-count';
    }

    private fetchEntityDetails(entityId: string): void {
        this.$subscriptions.push(this._entityModalService.getEntityDetails(entityId).subscribe((data: EntireEntityDetails) => {
            if (data) {
                this.addEntityConfirmation = data.entityDetails;
                this.setEntityDetails(this.addEntityConfirmation.entityId, this.addEntityConfirmation);
                this.checkIsMandatoryFieldsFilled();
            }
        }, (error) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private fetchMigEngagementDetails(engagementId: string): void {
        this.isDisableFinancialToggle = false;
        this.$subscriptions.push(this._migratedEngagementService.getLegacyEngagementDetails(engagementId).subscribe((data: LegacyEngagement) => {
            if (data) {
                this.migEngagementDetails = data;
                if (this.migEngagementDetails?.relationshipType?.includes(ENGAGEMENT_LOCALIZE.TERM_FINANCIAL_FOR_REL_PILLS)) {
                    this.additionalDetails.isCompensated = true;
                    this.isDisableFinancialToggle = true;
                }
            }
        }, (error) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private saveLegacyMigrationValues(data: any): void {
        const SAVE_MATRIX_RO: SaveMatrixRO = {
            legacyEngagementId: this.migratedEngagementId,
            personEntityId: data.personEntityId,
            personEntityNumber: data.personEntityNumber
        };
        this._migratedEngagementService.saveMigrationAnswer(SAVE_MATRIX_RO).subscribe({
            next: () => {
                this.setAndNavigateToEngagement();
                this._headerService.triggerMigrationEngagementCount();
            },
            error: () => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.setAndNavigateToEngagement();
            }
        });
    }

    viewEngagementDetails(): void {
            this._migratedEngagementService.openEngagementSlider(this.migEngagementDetails);
    }

    private closeModalIfOpen(): void {
        this.commonService.closeCOIValidationModal();
        this.commonService.closeNewEntityCreateModal();
    }

    private leavePageModalAction(modalAction: ModalActionEvent): void {
        this.closeModalIfOpen();
        this.commonService.closeCOILeavePageModal();
        if (modalAction.action === 'SECONDARY_BTN') {
            this.commonService.isEngagementChangesAvailable = false;
            if(this.isFromEngMigration) {
                this._router.navigate(['/coi/migrated-engagements/engagement-details'], { queryParams: { engagementId: this.migratedEngagementId }});
            } else {
                this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
            }
        }
    }

    private clearSFIFields(): void {
        this.entityDetails = {};
        this.additionalDetails = new AddEngagementData();
        this.clearDates();
        this.isChecked = {};
        this.entityDetailsForCard = new EntityUpdateClass();
        this.isShowEntityDetailsCard = false;
        this.isResultFromSearch = false;
        this.mandatoryList.clear();
    }

    private clearDates(): void {
        this.involvementDate = {
            involvementStartDate: null,
            involvementEndDate: null
        }
    }

    private checkMandatoryFilled(): boolean {
        this.mandatoryList.clear();
        const ELEMENT_ID_LIST = [];
        const IS_FLOW_3 = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3;
        if (!this.entityDetails?.entityName) {
            this.mandatoryList.set('entityName', 'Please enter the Entity Name.');
            ELEMENT_ID_LIST.push('coi-add-sfi-entity-name');
        }
        if (this.commonService.isStartDateOfInvolvementMandatory && !this.involvementDate.involvementStartDate) {
            this.mandatoryList.set('date', 'Please enter the Start Date.');
            ELEMENT_ID_LIST.push('coi-add-sfi-start-date');
        }
        if (this.additionalDetails.sponsorsResearch === null) {
            this.mandatoryList.set('sponsorsResearch', ENGAGEMENT_LOCALIZE.ENG_SPONSOR_REQUIRED_MSG);
            ELEMENT_ID_LIST.push('coi-add-sfi-sponsor-research-container');
        }
        if (this.additionalDetails.isCompensated === null) {
            this.mandatoryList.set('compensated', ENGAGEMENT_LOCALIZE.ENG_COMPENSATED_REQUIRED_MSG);
            ELEMENT_ID_LIST.push('coi-add-sfi-compensated-container');
        }
        if (IS_FLOW_3 && this.additionalDetails.isCommitment === null) {
            this.mandatoryList.set('commitment', ENGAGEMENT_LOCALIZE.ENG_COMMITMENT_REQUIRED_MSG);
            ELEMENT_ID_LIST.push('coi-add-sfi-commitment-container');
        }
        this.endDateValidation(ELEMENT_ID_LIST);
        this.validateRelationship(ELEMENT_ID_LIST);
        this.focusValidationField(ELEMENT_ID_LIST);
        return this.mandatoryList.size !== 0 ? false : true;
    }

    private endDateValidation(elementIdList = []): void {
        this.mandatoryList.delete('endDate');
        if (this.involvementDate.involvementStartDate && this.involvementDate.involvementEndDate &&
            (compareDates(this.involvementDate.involvementStartDate, this.involvementDate.involvementEndDate) === 1)) {
            this.mandatoryList.set('endDate', 'Please provide a valid end date.');
            elementIdList.push('end-date-involvement')
        }
    }

    private checkIfSFIAlreadyAdded(entityId, event): void {
        this.mandatoryList.delete('entityAlreadyAdded');
        this.addEntityConfirmation = null;
        this.$subscriptions.push(this._addSfiService.isEntityAdded(entityId).subscribe((res: any) => {
            if (res) {
                this.existingEntityDetails = res;
                if (this.existingEntityDetails.personEntityRelationships.length) {
                    this.existingEntityDetails.personEntityRelationships = this.groupByDisclosureType(deepCloneObject(this.existingEntityDetails.personEntityRelationships), "coiDisclosureType", "description", "validPersonEntityRelType");
                } else {
                    this.existingEntityDetails.personEntityRelationships = {};
                }
                this.setChangesFlag(false);
                this.mandatoryList.set('entityAlreadyAdded', 'An Engagement has already been created against the entity you are trying to add. To view the Engagement, please click on the View button on the Engagement card.');
            } else {
                this.addEntityConfirmation = event;
                if (this.entityDetails.entityId) {
                    this.confirmEntityDetails();
                    this.newlyCreatedEntityDetails = null;
                } else {
                    openModal('entity-details');
                }
            }
        }, err => {
            this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Entity selection failed, please try again.');
        }));
    }

    private setDateValues(): void {
        this.additionalDetails.involvementStartDate = this.involvementDate.involvementStartDate ? parseDateWithoutTimestamp(this.involvementDate.involvementStartDate) : '';
        this.additionalDetails.involvementEndDate = this.involvementDate.involvementEndDate ? parseDateWithoutTimestamp(this.involvementDate.involvementEndDate) : '';
        this.setChangesFlag(true);
    }

    private saveAdditionalDetails(saveType: 'SAVE' | 'MARK_AS_VOID_AND_SAVE' | 'SAVE_AS_DEACTIVATE' = 'SAVE'): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const SELECTED_TYPES = this.getSelectedRelationTypeCodes().map(typeCode => Number(typeCode));
            let RO: any = {
                entityId: this.entityDetails.entityId,
                entityNumber: this.entityDetails.entityNumber,
                ...this.additionalDetails,
            };
            if (this.commonService.isUnifiedQuestionnaireEnabled) {
                RO.perEntDisclTypeSelection = [];
                if(this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3) {
                    if (this.additionalDetails.isCommitment) {
                        RO.perEntDisclTypeSelection.push(RELATIONS_TYPE_SUMMARY.COMMITMENT);
                    }
                    if(this.additionalDetails.isCompensated) {
                        RO.perEntDisclTypeSelection.push(RELATIONS_TYPE_SUMMARY.FINANCIAL);
                    }
                    if(this._router.url.includes('create-travel-disclosure')) {
                        RO.perEntDisclTypeSelection.push(RELATIONS_TYPE_SUMMARY.TRAVEL);
                    }
                } else {
                    RO.perEntDisclTypeSelection = SELECTED_TYPES;
                }
            } else {
                RO.validPersonEntityRelTypeCodes = SELECTED_TYPES;
            }
            if (saveType === 'SAVE_AS_DEACTIVATE') {
                RO.versionStatus = 'INACTIVE';
                RO.revisionReason = 'The engagement has been created with a deactivated status due to a pending project disclosure.'
            }
            this.createNewEngagement(RO, saveType);
        }
    }

    private createNewEngagement(RO: any, saveType: 'SAVE' | 'MARK_AS_VOID_AND_SAVE' | 'SAVE_AS_DEACTIVATE' = 'SAVE'): void {
        this.$subscriptions.push(this._addSfiService.createSFI(RO)
            .subscribe((data: any) => {
                this.isSaving = false;
                this.setChangesFlag(false);
                this.createdEngagementResponse = data;
                if (saveType === 'MARK_AS_VOID_AND_SAVE') {
                    this.markProjectDisclosureAsVoid();
                } else if (data) {
                    if (this.isCustomDataChanged) {
                        this.$saveCustomData.next(data.personEntityId);
                    } else if(!this.isFromEngMigration) {
                        this.setAndNavigateToEngagement();
                    }
                }
                if (this.isFromEngMigration) {
                    this.saveLegacyMigrationValues(data);
                }
            }, _err => {
                this.isSaving = false;
                if (_err.status === 405) {
                    this.concurrencyPersonEntityId = _err.error.personEntityId;
                    openModal('coi-add-sfi-concurrency-modal');
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in saving Engagement, please try again.');
                }
            }));
    }

    private setAndNavigateToEngagement(): void {
        this.navigateToSFI();
        this.commonService.closeCOIValidationModal();
        this.commonService.isFromAddSFIPage = true;
        this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Engagement saved successfully.');
    }

    /** 
     * For checking whether financial relation exist
    */
    private validateFinancialRelationship (): boolean {
        return this.getSelectedRelationTypeCodes()?.some((validPersonEntityRelTypeCode: any) =>
            FINANCIAL_SUB_TYP_CODES.includes(validPersonEntityRelTypeCode)
        ) || false;
    }

    private markProjectDisclosureAsVoid(): void {
        this.$subscriptions.push(
            this.commonService.markProjectDisclosureAsVoid()
                .subscribe((data: any) => {
                    this.setAndNavigateToEngagement();
                },  (error: any) => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    private openCreateConfirmationModal(): void {
        const CONFIG = new COIValidationModalConfig();
        CONFIG.triggeredFrom = 'ADD_ENGAGEMENT_VALIDATION';
        CONFIG.errorMsgHeader = 'Attention';
        CONFIG.validationType = 'ACTIONABLE';
        CONFIG.errorList = [this.commonService.getEngagementDisclosureVoidMessage('AFTER_SAVE_COMPLETE')];
        CONFIG.modalConfig.namings.primaryBtnName = 'Confirm and Create Engagement';
        CONFIG.modalConfig.namings.secondaryBtnName = 'Create Engagement as Deactivate';
        CONFIG.additionalBtns = [{ action: 'CANCEL_BTN', event: { buttonName: 'Cancel' , btnClass: 'btn-outline-secondary'}}];
        this.commonService.openCOIValidationModal(CONFIG);
    }

    private validateRelationship(elementIdList): void {
        if (!this.commonService.isUnifiedQuestionnaireEnabled && !this.getSelectedRelationTypeCodes().length) {
            this.mandatoryList.set('relationRadio', 'Please select at least one relationship.');
            elementIdList.push('relation-radio-btn');
        }
        this.validateRelationshipToggle(elementIdList);
    }

    private validateRelationshipToggle(elementIdList: string[]): void {
        this.mandatoryList.delete('relationShipToggle');
        const IS_FLOW_3 = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3;
        const HAS_ANY_OTHER_ERROR = this.mandatoryList.size > 0;
        const IS_FROM_TRAVEL_DISCLOSURE = this._router.url.includes('create-travel-disclosure');
        if (IS_FLOW_3 && !this.additionalDetails.isCompensated && !this.additionalDetails.isCommitment && !IS_FROM_TRAVEL_DISCLOSURE) {
            const ERROR_MESSAGE = ENGAGEMENT_LOCALIZE.ENG_REL_TOGGLE_VALIDATION_MSG;
            this.mandatoryList.set('relationShipToggle', ERROR_MESSAGE);
            elementIdList.push('coi-add-sfi-commitment-container');
            if (!HAS_ANY_OTHER_ERROR) {
                this.openValidationModal([ERROR_MESSAGE]);
            }
        }
    }

    private openValidationModal(errorList: string[]): void {
        const CONFIG = new COIValidationModalConfig();
        CONFIG.triggeredFrom = 'CREATE_ENGAGEMENT_VALIDATION';
        CONFIG.modalHeader = 'Attention';
        CONFIG.errorMsgHeader = '';
        CONFIG.validationType = 'VIEW_ONLY';
        CONFIG.errorList = errorList;
        CONFIG.modalConfig.namings.secondaryBtnName = 'Close';
        this.commonService.openCOIValidationModal(CONFIG);
    }

    private setHeader(): void {
        this.heading = 'Engagement';
        this.buttonName = 'Save';
        this.btnTitle = 'Click here to save Engagement';
    }

    private getSelectedRelationTypeCodes() {
        return Object.keys(this.isChecked).filter(key => this.isChecked[key]);
    }

    private getRelationshipLookUp(): void {
        this.$subscriptions.push(this._addSfiService.addSFILookUp().subscribe((res: any) => {
            if (res) {
                this.relationLookup = this.commonService.isUnifiedQuestionnaireEnabled ? res.coiDisclosureTypes : this.groupBy(res.validPersonEntityRelTypes,"coiDisclosureType", "description");
            }
        }));
    }

    private groupBy(jsonData, key, innerKey) {
        return jsonData.reduce((relationsTypeGroup, item) => {
            if (item?.isActive) {
                const GROUP_KEY = item[key]?.[innerKey];
                if (GROUP_KEY !== null) {
                    (relationsTypeGroup[GROUP_KEY] = relationsTypeGroup[GROUP_KEY] || []).push(item);
                }
            }
            return relationsTypeGroup;
        }, {});
    }

    private groupByDisclosureType(jsonData: any, coiDisclosureType: any, description: any, validPersonEntityRelType: any): {} {
        return jsonData.reduce((relationsTypeGroup, item) => {
            (relationsTypeGroup[item[validPersonEntityRelType][coiDisclosureType][description]] = relationsTypeGroup[item[validPersonEntityRelType][coiDisclosureType][description]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

    private navigateToSFI(): void {
        document.body.removeAttribute("style");
        if (this.isFromEngMigration) {
            sessionStorage.setItem('migratedEngagementId', this.migratedEngagementId); 
        }
        const { personEntityId, personEntityNumber } = this.createdEngagementResponse;
        this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId, personEntityNumber } });
    }

    private focusValidationField(elementList): void {
        if (elementList.length) {
            const ELEMENT: HTMLElement = document.getElementById(elementList[0]);
            const OFFSET_HEADER = document.getElementById('create-sfi-header')?.clientHeight;
            const SECTION_HEIGHT = ELEMENT?.offsetTop - OFFSET_HEADER;
            if (document.activeElement.id != elementList[0]) {
                this.isSlider ? document.getElementById('add-sfi').scrollTo({ behavior: 'smooth', top: SECTION_HEIGHT }) : window.scrollTo({ behavior: 'smooth', top: SECTION_HEIGHT });
            }
            if(ELEMENT) {
                ELEMENT.focus();
            }
        }
    }

    private getSfiSliderSectionConfig(): void {
        const SFI_CONFIG = this.commonService.getSectionCodeAsKeys(
            this.isSlider ? this.sfiSliderSectionConfig : this._activatedRoute.snapshot.data.moduleConfig
        );
        const ENTITY_CONFIG = this.commonService.getSectionCodeAsKeys(this.isSlider ? this.entitySectionConfig :
            this._activatedRoute.snapshot.data.entityConfig);
        this._informationAndHelpTextService.moduleConfiguration = { ...SFI_CONFIG, ...ENTITY_CONFIG };
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data.uniqueId === 'ENTITY_CREATION_MODAL') {
                if (['ENGAGEMENT_ADD', 'ENGAGEMENT_EDIT'].includes(data.content.triggeredFrom) && data?.content?.entityDetails) {
                    this.newlyCreatedEntityDetails = deepCloneObject(data.content.entityDetails);
                    this.clearSFIFields();
                    this.setEntityDetails(this.newlyCreatedEntityDetails?.entityId, data?.content?.entityDetails?.entityRequestFields);
                    this.setChangesFlag(true);
                    if (this.entityDetails.entityId) {
                        this.checkIfSFIAlreadyAdded(this.entityDetails.entityNumber, { ...this.newlyCreatedEntityDetails, ...this.newlyCreatedEntityDetails?.entityRequestFields });
                    } else {
                        this.entityDetailsForCard = deepCloneObject(data?.content?.entityDetails?.entityRequestFields);
                        this.isShowEntityDetailsCard = !!data.content.entityDetails;
                    }
                }
                if (data.content.triggeredFrom === 'ENGAGEMENT_ADD' && !data?.content?.entityDetails) {
                    this.clearSFIFields();
                }
            }
            if (data.uniqueId === 'ADD_ENGAGEMENT_VALIDATION' && !this.commonService.isUnifiedQuestionnaireEnabled) {
                switch (data.content.modalAction.action) {
                    case 'CLOSE_BTN':
                        this.commonService.closeCOIValidationModal();
                        break;
                    case 'CANCEL_BTN':
                        this.commonService.closeCOIValidationModal();
                        break;
                    case 'SECONDARY_BTN': // create as deactivate
                        this.saveAdditionalDetails('SAVE_AS_DEACTIVATE');
                        break;
                    case 'PRIMARY_BTN': // mark as void and save
                    this.saveAdditionalDetails('MARK_AS_VOID_AND_SAVE');
                        break;
                    default: break;
                }
            }
            if(data.uniqueId === 'ADD_SFI_LEAVE_PAGE') {
                this.leavePageModalAction(data?.content?.modalActionEvent)
            }
        }));
    }

    private saveNewEntity(): void {
        this.newlyCreatedEntityDetails.entityId = null;
        const MODIFIED_PAYLOAD = this.getCreateEntityPayload(this.newlyCreatedEntityDetails);
        this.$subscriptions.push(this.commonService.createEntity(MODIFIED_PAYLOAD).subscribe((data: any) => {
            if (data) {
                this.entityDetails.entityId = data.entityId;
                this.entityDetails.entityNumber = data.entityNumber;
            }
            this.saveAdditionalDetails();
        },
            (error) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
    }

    private getCreateEntityPayload(entityRequestFields: EntityUpdateClass): EntityUpdateClass {
        const MODIFIED_PAYLOAD: EntityUpdateClass = { ...entityRequestFields };
        delete MODIFIED_PAYLOAD.entityRequestFields?.country;
        delete MODIFIED_PAYLOAD.entityRequestFields?.stateDetails;
        delete MODIFIED_PAYLOAD.entityRequestFields?.coiEntityType;
        delete MODIFIED_PAYLOAD.entityRequestFields?.entityOwnershipType;
        MODIFIED_PAYLOAD.entityRequestFields.entitySourceTypeCode = ENTITY_SOURCE_TYPE_CODE.DISCLOSURE_REPORTER;
        return MODIFIED_PAYLOAD;
    }

    private setChangesFlag(flag) : void{
        this.commonService.isEngagementChangesAvailable = flag;
        this.commonService.$globalEventNotifier.next({
            uniqueId: 'SFI_CHANGES_AVAILABLE',
            content: {isChangesAvailable: this.commonService.isEngagementChangesAvailable}
        });
    }

    private setEntityDetails(entityId: string | number,  source: any): void {
        this.entityDetails.entityId = entityId ?? null;
        this.entityDetails.entityName = source?.entityName;
        this.entityDetails.entityNumber = source?.entityNumber ?? null;
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
        this.entitySearchOptions.defaultValue = source?.entityName;
        this.checkIsMandatoryFieldsFilled();
    }

    checkForNotEmpty(val) {
        return !isEmptyObject(val);
    }

    selectedEvent(event): void {
        this.clearSFIFields();
        if (event) {
            this.clearField = new String('false');
            event = setEntityObjectFromElasticResult(event);
            this.setChangesFlag(true);
            this.checkIfSFIAlreadyAdded(event.entityNumber, event);
        }
        this.checkIsMandatoryFieldsFilled();
    }

    checkIsMandatoryFieldsFilled(): void {
        const IS_RELATION_SELECTED = this.commonService.isUnifiedQuestionnaireEnabled ? true : !!this.getSelectedRelationTypeCodes().length;
        const IS_ENTITY_NAME_FILLED = !!this.entityDetails?.entityName;
        const IS_START_DATE_MANDATORY = this.commonService.isStartDateOfInvolvementMandatory;
        const IS_START_DATE_FILLED = !!this.involvementDate.involvementStartDate;
        const IS_SPONSOR_FILLED = this.additionalDetails.sponsorsResearch !== null;
        const IS_COMPENSATED_FILLED = this.additionalDetails.isCompensated !== null;
        const IS_FLOW_3 = this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3;
        const IS_COMMITMENT_FILLED = !IS_FLOW_3 || this.additionalDetails.isCommitment !== null;
        this.isMandatoryFieldsFilled = IS_START_DATE_MANDATORY 
            ? IS_ENTITY_NAME_FILLED && IS_START_DATE_FILLED && IS_RELATION_SELECTED && IS_SPONSOR_FILLED && IS_COMPENSATED_FILLED && IS_COMMITMENT_FILLED
            : IS_ENTITY_NAME_FILLED && IS_RELATION_SELECTED && IS_SPONSOR_FILLED && IS_COMPENSATED_FILLED && IS_COMMITMENT_FILLED;
    }

    onDateSelect() {
        this.endDateValidation();
        this.setDateValues();
    }

    submitEntity(): void {
        if (this.mandatoryList.has('entityAlreadyAdded')) {
            return;
        }
        this.checkMandatoryFilled();
        if (!this.mandatoryList.size) {
            this.entityDetails.entityId ? this.saveAdditionalDetails() : this.saveNewEntity();
        } else {
            this.$performAction.next('VALIDATE_ONLY');
        }
    }

    backToPreviousPage(): void {
        if (this._navigationService.previousURL) {
            this._router.navigateByUrl(this._navigationService.previousURL);
        } else {
            this._router.navigate(['/coi/user-dashboard']);
        }
    }

    viewSfiDetails() {
        this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: this.existingEntityDetails.personEntityId, personEntityNumber: this.existingEntityDetails.entityNumber } });
    }

    editSfiDetails(personEntityId) {
        this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: personEntityId, mode: 'E', personEntityNumber: this.existingEntityDetails.entityNumber } });
    }

    viewEntityDetails(event) {
        this._router.navigate(['/coi/entity-management/entity-details'], { queryParams: { entityManageId: event } });
    }

    confirmEntityDetails(): void {
        this.isResultFromSearch = true;
        this.entityDetails.entityName = this.addEntityConfirmation.entityName;
        this.entityDetails.entityId = this.addEntityConfirmation.entityId;
        this.entityDetails.entityNumber = this.addEntityConfirmation.entityNumber;
        this.checkIsMandatoryFieldsFilled();
    }

    clearEntityDetails(): void {
        this.clearField = new String('true');
        this.addEntityConfirmation = null;
    }

    goToHome(): void {
        this._router.navigate(['/coi/user-dashboard']);
    }

    navigateBack(navigationType: 'CANCEL_BTN' | 'BACK_BTN'): void {
        if (!this.isFromEngMigration) {
            this._router.navigateByUrl(this._navigationService.previousURL);
            return;
        }
        if (navigationType === 'BACK_BTN') {
            this._router.navigate(['/coi/migrated-engagements/engagement-details'], { queryParams: { engagementId: this.migratedEngagementId } });
        } else {
            this._router.navigate(['/coi/migrated-engagements']);
        }
    }

    addNewEntity(entityName: string): void {
        this.entitySearchOptions.defaultValue = entityName;
        this.clearSFIFields();
        this.entityDetails.entityName = entityName;
        this.newlyCreatedEntityDetails = this.entityDetails;
        const NEW_ENTITY_DETAILS = new EntityRequestFields();
        NEW_ENTITY_DETAILS.entityName = entityName.trim();
        const ENTITY_CREATION_MODAL = new EntityCreationModalConfig();
        ENTITY_CREATION_MODAL.triggeredFrom = 'ENGAGEMENT_ADD';
        ENTITY_CREATION_MODAL.entityDetails = NEW_ENTITY_DETAILS;
        ENTITY_CREATION_MODAL.mandatoryFieldsList = ENTITY_MANDATORY_REPORTER_FIELDS;
        this.commonService.openNewEntityCreateModal(ENTITY_CREATION_MODAL);
    }

    afterCustomDataSave(event) {
        this.setChangesFlag(false);
        if(!this.isFromEngMigration) {
            this.setAndNavigateToEngagement();
        }
    }

    setCustomDatachange(event) {
        this.isCustomDataChanged = event;
        this.setChangesFlag(true);
    }

    canShowRelationTypes() {
        return this.commonService.engagementFlowType != ENGAGEMENT_FLOW_TYPE.FLOW_3;
    }

    setSponsorResearch(flag: boolean): void {
        this.additionalDetails.sponsorsResearch = flag;
        this.setChangesFlag(true);
    }


    openIsCompConfirmation(flag) {
        this.additionalDetails.isCompensated = flag;
        this.setChangesFlag(true);
    }

    toggleIsCommitment(flag: boolean): void {
        this.additionalDetails.isCommitment = flag;
        this.setChangesFlag(true);
    }

    onRadioBtnChange(flag: boolean, field: 'SPONSOR_RESEARCH' | 'COMPENSATED' | 'COMMITMENT'): void {
        switch(field) {
            case 'SPONSOR_RESEARCH': this.setSponsorResearch(flag);
                break;
            case 'COMPENSATED': this.additionalDetails.isCompensated = flag;
                break;
            case 'COMMITMENT': this.additionalDetails.isCommitment = flag;
                break;
            default: break;
        }
    }

    clearAndGoBack() {
        if(this.isSlider) {
            this.clearField = new String('true');
            this.clearSFIFields();
            this.closeSlider.emit();
        } else {
            this.navigateBack('CANCEL_BTN');
        }
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

    // openIsCompConfirmation(flag) {
    //     if (this.commonService.engagementFlowType === ENGAGEMENT_FLOW_TYPE.FLOW_3) {
    //         this.isProjectDisclosureAvailable = false;
    //         this.compMsg = '';
    //         this.checkForProjectAndOpen(flag);
    //     } else {
    //         this.additionalDetails.isCompensated = flag;
    //         this.setChangesAvailable(flag);
    //     }
    // }

    // checkForProjectAndOpen(flag) {
    //     if(flag) {
    //         this.$subscriptions.push(this.commonService.checkFcoiUnlinkedProjDiscl().subscribe((hasPendingProjDiscl: boolean)=> {
    //             this.isProjectDisclosureAvailable = hasPendingProjDiscl;
    //             this.compMsg = 'compensated';
    //             openModal(this.COMP_SWITCH_OFF_MODAL_ID);
    //         }, err => {
    //             this.compMsg = 'compensated';
    //             openModal(this.COMP_SWITCH_OFF_MODAL_ID);
    //         }));
    //     } else {
    //         this.compMsg = 'uncompensated';
    //         openModal(this.COMP_SWITCH_OFF_MODAL_ID);
    //     }
    // }

    // compModalPostconfrimation(action: 'YES'|'NO') {
    //     if(action === 'YES') {
    //         this.additionalDetails.isCompensated = this.compMsg === 'compensated';
    //     } else {
    //         this.additionalDetails.isCompensated =  this.compMsg === 'compensated' ? false : true;
    //         this.compMsg = '';
    //     }
    //     hideModal(this.COMP_SWITCH_OFF_MODAL_ID);
    // }

}
