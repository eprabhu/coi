import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DATE_PLACEHOLDER, ENTITY_VERIFICATION_STATUS, AUTO_SAVE_DEBOUNCE_TIME, FEED_STATUS_CODE } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { getInvalidDateFormatMessage, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { AutoSaveEvent, AutoSaveService } from '../../../common/services/auto-save.service';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { canUpdateOrgFeed, EntityManagementService } from '../../entity-management.service';
import { interval, Subject, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { DataStoreEvent, EntireEntityDetails, EntityDetails, EntityOrganizationType, EntityTabStatus,
    SubAwardOrganization, SubAwardOrganizationDetails, SubawardOrgFields, SubAwardOrgUpdateClass } from '../../shared/entity-interface';
import { EntitySubAwardService, isOrganizationConditionSatisfied } from '../entity-subaward.service';
import { ENTITY_ADDRESS_FIELDS, SUB_AWARD_ORGANIZATION } from '../../shared/entity-constants';
import { closeCommonModal, deepCloneObject, inputRestrictionForNumberField, isEmptyObject,
    openCommonModal, phoneNumberValidation } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { Country, LookUpClass, State } from '../../../common/services/coi-common.interface';
import { getEndPointOptionsForCountry } from '../../../../../../fibi/src/app/common/services/end-point.config';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { getEndPointOptionsForStates } from '../../../common/services/end-point.config';
import { EndPointOptions } from '../../../shared-components/shared-interface';
import { SearchLengthValidatorOptions } from '../../../shared/common.interface';

@Component({
    selector: 'app-entity-subaward-details',
    templateUrl: './entity-subaward-details.component.html',
    styleUrls: ['./entity-subaward-details.component.scss']
})
export class EntitySubawardDetailsComponent implements OnInit, OnDestroy {

    @Input() sectionName = '';
    @Input() sectionId: string | number = '';
    @ViewChild('incorporationDateInput', { static: false }) incorporationDateInput?: ElementRef;
    @ViewChild('samExpirationDateInput', { static: false }) samExpirationDateInput?: ElementRef;
    @ViewChild('subAwdRiskAssmtDateInput', { static: false }) subAwdRiskAssmtDateInput?: ElementRef;

    DATE_PLACEHOLDER = DATE_PLACEHOLDER;
    samExpirationDate: Date;
    subAwdRiskAssmtDate: Date;
    incorporatedDate: Date;
    $debounceEvent = new Subject<any>();
    $subscriptions: Subscription[] = [];
    entityDetails: EntityDetails;
    isSaving = false;
    isEditMode = false;
    entityTabStatus: EntityTabStatus = new EntityTabStatus();
    subAwardOrg = new SubAwardOrgUpdateClass();
    changeDetectionObj: Partial<Record<keyof SubawardOrgFields, boolean>> = {};
    isShowCommentButton = false;
    commentCount = 0;
    organizationLookup: LookUpClass[] = [];
    selectedOrganizationType: EntityOrganizationType = { organizationTypeCode: null, description: '' };
    countrySearchOptions: EndPointOptions = {};
    stateSearchOptions: EndPointOptions = {};
    clearCountryField = new String('false');
    clearStateField = new String('false');
    mandatoryList = new Map();
    selectedCountry: Country | null = null;
    selectedState: State | null = null;
    CONFIRMATION_MODAL_ID = 'coi-entity-org-confirm-modal';
    modalConfig = new CommonModalConfig(this.CONFIRMATION_MODAL_ID, 'Yes', 'No', 'lg');
    copyConfirmModalInfo = `This action will overwrite the following organization details with the corresponding entity details: Organization Name, Country,  DUNS Number, UEI Number, CAGE Number, Human Sub Assurance, Animal Welfare Assurance, AAALAC (Animal Accreditation), Phone Number, Incorporation Date, Incorporation In, Congressional District, Federal Employer ID and Number of Employees.`;
    canEmitStateSearchText = false;
    isOrgAddressViewMode = false;
    dateValidationMap = new Map();
    stateSearchLimiterOptions = new SearchLengthValidatorOptions();

    constructor(public commonService: CommonService,
        private _dataStoreService: EntityDataStoreService,
        private _autoSaveService: AutoSaveService,
        public entitySubAwardService: EntitySubAwardService,
        public entityManagementService: EntityManagementService
    ) { }

    ngOnInit(): void {
        this.getOrganizationTypeLookup();
        this.triggerSingleSave();
        this.listenAutoSave();
        this.getDataFromStore();
        this.getValuesFromService(deepCloneObject(this.entitySubAwardService.entitySubAwardOrganization?.subAwdOrgDetailsResponseDTO));
        this.listenDataChangeFromStore();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(SUB_AWARD_ORGANIZATION);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    triggerSingleSave(): void {
        this.$subscriptions.push(this.$debounceEvent.pipe(debounce(() => interval(AUTO_SAVE_DEBOUNCE_TIME))).subscribe((data: any) => {
            if (data) {
                this._autoSaveService.commonSaveTrigger$.next({ action: 'SAVE' });
            }
        }
        ));
    }

    listenAutoSave(): void {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe((event: AutoSaveEvent) => {
            this.autoSaveAPI();
        }));
    }

    private async getOrganizationTypeLookup(): Promise<void> {
        this.organizationLookup = await this.commonService.getOrFetchLookup('entity_organization_type', 'ORGANIZATION_TYPE_CODE');
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.entityTabStatus = ENTITY_DATA?.entityTabStatus;
        this.commentCount = ENTITY_DATA.commentCountList?.[SUB_AWARD_ORGANIZATION.sectionTypeCode] || 0;
        this.checkUserHasRight();
        this.checkOrgAddressViewMode();
        if (!this.isEditMode) {
            this.mandatoryList.clear()
        }
    }

    private checkUserHasRight(): void {
        this.isEditMode = this._dataStoreService.getEditMode() && this.commonService.getAvailableRight(['MANAGE_ENTITY_ORGANIZATION'], 'SOME');
    }

    private checkOrgAddressViewMode(): void {
        const IS_CREATED_FROM_IMPORT_ENTITY = this.entitySubAwardService?.entitySubAwardOrganization?.subAwdOrgDetailsResponseDTO?.isCreatedFromImportEntity;
        const IS_SPONSOR_READY_TO_FEED = this.entityTabStatus?.sponsor_feed_status_code?.toString() !== FEED_STATUS_CODE.NOT_READY_TO_FEED;
        this.isOrgAddressViewMode = (!IS_CREATED_FROM_IMPORT_ENTITY || (IS_CREATED_FROM_IMPORT_ENTITY && IS_SPONSOR_READY_TO_FEED));
        this.setStateSearchLimiter();
    }

    private getValuesFromService(subAwardOrgService: SubAwardOrganizationDetails): void {
        if (subAwardOrgService?.entityOrganizationType?.organizationTypeCode) {
            this.selectedOrganizationType = subAwardOrgService?.entityOrganizationType;
            this.subAwardOrg.subAwardOrgFields.organizationTypeCode = subAwardOrgService.entityOrganizationType?.organizationTypeCode;
        }
        if (subAwardOrgService?.samExpirationDate) {
            this.samExpirationDate = getDateObjectFromTimeStamp(subAwardOrgService?.samExpirationDate);
            this.subAwardOrg.subAwardOrgFields.samExpirationDate = subAwardOrgService?.samExpirationDate;
        }
        if (subAwardOrgService?.subAwdRiskAssmtDate) {
            this.subAwdRiskAssmtDate = getDateObjectFromTimeStamp(subAwardOrgService?.subAwdRiskAssmtDate);
            this.subAwardOrg.subAwardOrgFields.subAwdRiskAssmtDate = subAwardOrgService?.subAwdRiskAssmtDate;
        }
        if (subAwardOrgService?.incorporatedDate) {
            this.incorporatedDate = getDateObjectFromTimeStamp(subAwardOrgService?.incorporatedDate);
            this.subAwardOrg.subAwardOrgFields.incorporatedDate = subAwardOrgService?.incorporatedDate;
        }
        const FIELDS_TO_COPY = [
            'countryCode', 'phoneNumber', 'postCode', 'primaryAddressLine1',
            'primaryAddressLine2', 'cageNumber', 'ueiNumber', 'dunsNumber',
            'state', 'city', 'isCopy', 'animalAccreditation', 'animalWelfareAssurance',
            'congressionalDistrict', 'federalEmployerId', 'humanSubAssurance',
            'incorporatedIn', 'numberOfEmployees', 'organizationName'
        ];
        FIELDS_TO_COPY.forEach(field => {
            this.subAwardOrg.subAwardOrgFields[field] = subAwardOrgService?.[field];
        });
        this.selectedCountry = subAwardOrgService?.country;
        this.selectedState = subAwardOrgService?.stateDetails;
        this.setDefaultCountrySearchOption(subAwardOrgService);
        this.setDefaultStateSearchOptions(subAwardOrgService);
    }

    private setDefaultCountrySearchOption(subAwardOrgService: SubAwardOrganizationDetails): void {
        this.countrySearchOptions = getEndPointOptionsForCountry(this.commonService.fibiUrl);
        this.countrySearchOptions.defaultValue = subAwardOrgService?.country?.countryName;
    }

    private setDefaultStateSearchOptions(subAwardOrgService: SubAwardOrganizationDetails): void {
        this.stateSearchOptions= getEndPointOptionsForStates(this.commonService.fibiUrl);
        this.stateSearchOptions.defaultValue = subAwardOrgService?.stateDetails?.stateName || subAwardOrgService?.state;
        this.stateSearchOptions.params.countryCode = subAwardOrgService?.countryCode || '';
        this.canEmitStateSearchText = this.commonService?.canAllowStateFreeText(subAwardOrgService?.countryCode);
        this.setStateSearchLimiter();
    }

    private setStateSearchLimiter(): void {
        this.stateSearchLimiterOptions.isShowLimiter = !this.isOrgAddressViewMode;
        this.stateSearchLimiterOptions.limit = 30;
        this.stateSearchLimiterOptions.limiterStyle = 'position-absolute end-0 float-end word-count';
    }

    private autoSaveAPI(): void {
        if (!this.isSaving) {
            const TEMP_AUTO_SAVE_RO: SubAwardOrgUpdateClass = deepCloneObject(this.getAutoSaveRO());
            this.addFeedStatusInRO(TEMP_AUTO_SAVE_RO);
            if (isEmptyObject(TEMP_AUTO_SAVE_RO) || isEmptyObject(TEMP_AUTO_SAVE_RO.subAwardOrgFields)) {
                return;
            }
            if (this.changeDetectionObj['isCopy'] && this.subAwardOrg?.subAwardOrgFields?.isCopy) {
                TEMP_AUTO_SAVE_RO.subAwardOrgFields = { isCopy: true };
                this.syncOrganizationWithEntity(TEMP_AUTO_SAVE_RO);
            } else if (!this.entitySubAwardService.entitySubAwardOrganization?.subAwdOrgDetailsResponseDTO?.id) {
                this.saveSubAwardOrganizationDetails(TEMP_AUTO_SAVE_RO);
            } else {
                this.updateSubAwardOrganizationDetails(TEMP_AUTO_SAVE_RO);
            }
        }
    }

    private getAutoSaveRO(): SubAwardOrgUpdateClass {
        const AUTO_SAVE_PAYLOAD = new SubAwardOrgUpdateClass();
        AUTO_SAVE_PAYLOAD.entityId = this.entityDetails.entityId;
        Object.keys(this.changeDetectionObj).forEach((ele) => {
            const IS_VALID_PHONE_NUMBER = ele === 'phoneNumber' && this.subAwardOrg?.subAwardOrgFields?.phoneNumber && phoneNumberValidation(this.subAwardOrg?.subAwardOrgFields?.phoneNumber);
            if (this.changeDetectionObj[ele] && !IS_VALID_PHONE_NUMBER) {
                const VALUE = this.subAwardOrg.subAwardOrgFields[ele];
                // Assigns a trimmed string value or null if empty; for non-strings, assigns the value or null if it's undefined or null.
                AUTO_SAVE_PAYLOAD.subAwardOrgFields[ele] = typeof VALUE === 'string' ? VALUE.trim() || null : VALUE ?? null;
                if(!AUTO_SAVE_PAYLOAD.isChangeInAddress) {
                    AUTO_SAVE_PAYLOAD.isChangeInAddress = ENTITY_ADDRESS_FIELDS.includes(ele);
                }
            }
        });
        return AUTO_SAVE_PAYLOAD;
    }

    private saveSubAwardOrganizationDetails(autoSaveReaObj: SubAwardOrgUpdateClass): void {
        this.commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveReaObj.subAwardOrgFields, false);
        this.isSaving = true;
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.entitySubAwardService.organizationDetailsAutoSave(autoSaveReaObj)
                .subscribe((data: any) => {
                    this.entitySubAwardService.entitySubAwardOrganization.subAwdOrgDetailsResponseDTO.entityId = this.entityDetails.entityId;
                    this.entitySubAwardService.entitySubAwardOrganization.subAwdOrgDetailsResponseDTO.id = data?.id;
                    this.isSaving = false;
                    this.autoSaveAPI();
                    this.handleAPISuccess(autoSaveReaObj);
                }, (_error: any) => {
                    this.isSaving = false;
                    this.handleAPIError(autoSaveReaObj);
                })
        );
        this.commonService.removeLoaderRestriction();
    }

    private updateSubAwardOrganizationDetails(autoSaveReaObj: SubAwardOrgUpdateClass): void {
        this.commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveReaObj.subAwardOrgFields, false);
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.entitySubAwardService.updateOrganizationDetails(autoSaveReaObj)
                .subscribe((data: any) => {
                    this.handleAPISuccess(autoSaveReaObj);
                }, (_error: any) => {
                    this.handleAPIError(autoSaveReaObj);
                })
        );
        this.commonService.removeLoaderRestriction();
    }

    private handleAPISuccess(autoSaveReqObj: SubAwardOrgUpdateClass): void {
        this._dataStoreService.enableModificationHistoryTracking();
        this.setServiceVariable(autoSaveReqObj.subAwardOrgFields);
        this.updateCompletionFlag();
        this.updateEntireFeed(autoSaveReqObj);
        const HAS_TRUE_VALUE = Object.values(this.changeDetectionObj).some(value => value);
        this.commonService.setChangesAvailable(HAS_TRUE_VALUE);
        this.commonService.hideAutoSaveSpinner('SUCCESS');
    }

    private handleAPIError(autoSaveReqObj: SubAwardOrgUpdateClass): void {
        this.setChangesObject(autoSaveReqObj.subAwardOrgFields, true);
        this.commonService.isShowLoader.next(false);
        this.commonService.hideAutoSaveSpinner('ERROR');
    }

    private setChangesObject(autoSaveReqObj: SubawardOrgFields, isChangesAvailable: boolean): void {
        Object.keys(autoSaveReqObj).forEach((ele) => {
            this.changeDetectionObj[ele] = isChangesAvailable;
        });
    }

    private setServiceVariable(subAwardOrgFields: SubawardOrgFields): void {
        const SUB_AWARD_DTO = this.entitySubAwardService.entitySubAwardOrganization.subAwdOrgDetailsResponseDTO;
        SUB_AWARD_DTO.entityOrganizationType ??= new EntityOrganizationType();
        Object.entries(subAwardOrgFields).forEach(([key, value]) => {
            switch(key) {
                case 'organizationTypeCode':
                    SUB_AWARD_DTO.entityOrganizationType.organizationTypeCode = value;
                    break;
                case 'countryCode':
                    SUB_AWARD_DTO.countryCode = value;
                    SUB_AWARD_DTO.country = this.selectedCountry;
                    break;
                default:
                    SUB_AWARD_DTO[key] = value;
                    break;
            }
        });
    }

    private addFeedStatusInRO(autoSaveReqObj: SubAwardOrgUpdateClass): void {
        if (this.canUpdateFeed(autoSaveReqObj.subAwardOrgFields)) {
            autoSaveReqObj.subAwardOrgFields.feedStatusCode = '2';
        }
    }

    private updateEntireFeed(autoSaveReqObj: SubAwardOrgUpdateClass): void {
        if (this.canUpdateFeed(autoSaveReqObj.subAwardOrgFields)) {
            this._dataStoreService.updateFeedStatus(this.entityTabStatus, 'ORG');
        }
    }

    private canUpdateFeed(subAwardOrgFields: SubawardOrgFields): boolean {
        return this.entityDetails.entityStatusTypeCode === ENTITY_VERIFICATION_STATUS.VERIFIED && canUpdateOrgFeed(subAwardOrgFields) &&
        (isOrganizationConditionSatisfied(this.entitySubAwardService.entitySubAwardOrganization) || (this.entitySubAwardService.entitySubAwardOrganization.entityRisks.length && subAwardOrgFields.organizationTypeCode));
    }

    private changeEvent(key: string): void {
        this.commonService.setChangesAvailable(true);
        this.changeDetectionObj[key] = true;
        this.$debounceEvent.next(key);
    }

    private updateCompletionFlag(): void {
        this.entityTabStatus.entity_sub_org_info = isOrganizationConditionSatisfied(this.entitySubAwardService.entitySubAwardOrganization);
        this._dataStoreService.updateStore(['entityTabStatus'], { 'entityTabStatus': this.entityTabStatus });
    }

    private syncOrganizationWithEntity(autoSaveReaObj: SubAwardOrgUpdateClass): void {
        this.commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveReaObj.subAwardOrgFields, false);
        this.isSaving = true;
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.entitySubAwardService.syncOrganizationWithEntity(this.entityDetails?.entityId)
                .subscribe((data: SubAwardOrganization) => {
                    this.entitySubAwardService.entitySubAwardOrganization = data;
                    this.getValuesFromService(deepCloneObject(this.entitySubAwardService.entitySubAwardOrganization?.subAwdOrgDetailsResponseDTO));
                    this.isSaving = false;
                    this.handleAPISuccess(autoSaveReaObj);
                }, (_error: any) => {
                    this.isSaving = false;
                    this.handleAPIError(autoSaveReaObj);
                }
            )
        );
        this.commonService.removeLoaderRestriction();
    }

    private clearValidation(type): void {
        this.mandatoryList.delete(type);
    }

    private clearStateFieldValue(): void {
        this.subAwardOrg.subAwardOrgFields.state = null;
        this.subAwardOrg.subAwardOrgFields.stateDetails = null;
        this.clearStateField = new String('true');
    }

    private setCountryField(countryDetail: Country): void {
        const COUNTRY_FIELD = this.selectedCountry;
        if (!COUNTRY_FIELD || !Object.keys(COUNTRY_FIELD).length) {
            this.clearCountryField = new String('false');
            this.countrySearchOptions.defaultValue = countryDetail?.countryName;
            this.selectedCountryEvent(countryDetail, false);
        }
    }

    onDateSelect(dateType: 'samExpirationDate' | 'subAwdRiskAssmtDate' | 'incorporatedDate', fieldType: 'ENTITY_COPY_FIELD' | 'ORGANIZATION_ONLY_FIELD' = 'ORGANIZATION_ONLY_FIELD'): void {
        const SELECTED_DATE = this[dateType];
        this.subAwardOrg.subAwardOrgFields[dateType] = parseDateWithoutTimestamp(SELECTED_DATE);
        fieldType === 'ORGANIZATION_ONLY_FIELD' ? this.changeEvent(dateType) : this.changeEntityCopyEvent(dateType);
    }

    onOrganizationTypeSelect(organizationTypeCode: number | string): void {
        this.subAwardOrg.subAwardOrgFields.organizationTypeCode = organizationTypeCode || null;
        const SELECTED_ORGANIZATION = this.organizationLookup?.find(data => data?.code === organizationTypeCode);
        this.selectedOrganizationType.description = SELECTED_ORGANIZATION?.description;
        this.changeEvent('organizationTypeCode');
    }

    openReviewComments(): void {
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: SUB_AWARD_ORGANIZATION.commentTypeCode,
            sectionTypeCode: SUB_AWARD_ORGANIZATION.sectionTypeCode
        });
    }

    selectedCountryEvent(event: any, hasClearState = true): void {
        const COUNTRY_CODE = event?.countryCode || null;
        if (COUNTRY_CODE) {
            this.stateSearchOptions.params.countryCode = COUNTRY_CODE;
            this.canEmitStateSearchText = this.commonService?.canAllowStateFreeText(COUNTRY_CODE);
        } else {
            delete this.stateSearchOptions?.params?.countryCode;
        }
        this.subAwardOrg.subAwardOrgFields.countryCode = COUNTRY_CODE || null;
        this.selectedCountry = event || null;
        this.changeEntityCopyEvent('countryCode');
        if (this.subAwardOrg?.subAwardOrgFields?.state) {
            this.changeEntityCopyEvent('state');
        }
        hasClearState && this.clearStateFieldValue();
    }

    selectedStateEvent(event: State | null): void {
        if(event) {
            this.subAwardOrg.subAwardOrgFields.stateCode = event.stateCode;
            this.subAwardOrg.subAwardOrgFields.state = event.stateCode || event.value;
            this.subAwardOrg.subAwardOrgFields.stateDetails = event;
            this.selectedState = event;
            this.changeEntityCopyEvent('state');
            this.setCountryField(event.country);
        } else {
            this.subAwardOrg.subAwardOrgFields.stateCode = '';
            this.subAwardOrg.subAwardOrgFields.state = '';
            this.subAwardOrg.subAwardOrgFields.stateDetails = null;
            this.changeEntityCopyEvent('state');
        }
    }

    changeEntityCopyEvent(key: string): void {
        this.subAwardOrg.subAwardOrgFields.isCopy = false;
        this.changeEvent('isCopy');
        this.changeEvent(key);
    }

    validateAndAddPhoneNumber(): void {
        const KEY = 'phoneNumber';
        this.clearValidation(KEY);
        this.changeDetectionObj[KEY] = true;
        if (this.subAwardOrg?.subAwardOrgFields?.phoneNumber && phoneNumberValidation(this.subAwardOrg?.subAwardOrgFields?.phoneNumber)) {
            this.commonService.setChangesAvailable(true);
            this.mandatoryList.set(KEY, 'Please enter valid phone.');
        } else {
            this.$debounceEvent.next(KEY);
        }
    }

    checkForValidNumber(event: any): void {
        if (inputRestrictionForNumberField(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
    }

    copyEntityDetailsToOrganization(): void {
        if (this.subAwardOrg.subAwardOrgFields.isCopy) {
            openCommonModal(this.CONFIRMATION_MODAL_ID);
        } else {
            this.changeEvent('isCopy');
        }
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction?.action === 'PRIMARY_BTN') {
            this.changeEvent('isCopy');
        } else {
            this.subAwardOrg.subAwardOrgFields.isCopy = false;
        }
        closeCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    validateDateFormat(fieldName: 'incorporationDate' | 'samExpirationDate' | 'subAwdRiskAssmtDate'): void {
        const DATE_FIELDS = {
            incorporationDate: this.incorporationDateInput,
            samExpirationDate: this.samExpirationDateInput,
            subAwdRiskAssmtDate: this.subAwdRiskAssmtDateInput
        };
        const INPUT_DATE_FIELD = DATE_FIELDS[fieldName];
        if (!INPUT_DATE_FIELD) return;
        this.dateValidationMap.delete(fieldName);
        const DATE_VALUE = INPUT_DATE_FIELD.nativeElement.value?.trim();
        const ERROR_MESSAGE = getInvalidDateFormatMessage(DATE_VALUE);
        if (ERROR_MESSAGE) {
            this.dateValidationMap.set(fieldName, ERROR_MESSAGE);
        }
    }
}
