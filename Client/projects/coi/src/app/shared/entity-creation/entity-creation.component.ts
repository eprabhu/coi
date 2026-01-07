import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { isValidEmailAddress, inputRestrictionForNumberField, phoneNumberValidation, openModal, isEmptyObject, isValidWebsite, deepCloneObject } from '../../common/utilities/custom-utilities';
import { interval, Subject, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { EntityCreationService, EntityCreationUniqueFieldServices } from './entity-creation.service';
import { getEndPointOptionsForCountry } from './../../../../../fibi/src/app/common/services/end-point.config';
import {
    AdditionalAddress,
    CoiEntityType,
    EntityDetails,
    EntityFields,
    EntityNumberFields,
    EntityOwnerShip,
    EntityOwnershipType,
    EntityRequestFields,
    EntityUpdateClass,
} from '../../entity-management-module/shared/entity-interface';
import { AutoSaveEvent, AutoSaveService } from '../../common/services/auto-save.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, AUTO_SAVE_DEBOUNCE_TIME, ENTITY_ADDRESS_TYPE_CODE, ENTITY_SOURCE_TYPE_CODE, COMMON_ERROR_TOAST_MSG } from '../../app-constants';
import { Country, EntityCreationConfig, GlobalEventNotifier, LookUpClass, State } from '../../common/services/coi-common.interface';
import { ADDITIONAL_ADDRESS_REQUIRED_FIELDS_DEFAULT, ADDITIONAL_ADDRESS_REQUIRED_FIELDS_SPECIFIC, COUNTRY_CODE_FOR_MANDATORY_CHECK, COUNTRY_SPECIFIC_REPORTER_FIELDS, ENTITY_ADDRESS_FIELDS, ENTITY_MANDATORY_FIELDS, ENTITY_MANDATORY_REPORTER_FIELDS, ENTITY_MANDATORY_WITHOUT_ADDRESS } from '../../entity-management-module/shared/entity-constants';
import { getEndPointOptionsForStates } from '../../common/services/end-point.config';
import { EndPointOptions } from '../../shared-components/shared-interface';
import { SearchLengthValidatorOptions } from '../common.interface';

@Component({
    selector: 'app-entity-creation',
    templateUrl: './entity-creation.component.html',
    styleUrls: ['./entity-creation.component.scss'],
    providers: [EntityCreationService]
})
export class EntityCreationComponent implements OnInit, OnDestroy, OnChanges {

    clearCountryField: any;
    clearStateField = new String('false');
    mandatoryList = new Map();
    $subscriptions: Subscription[] = [];
    countrySearchOption: EndPointOptions = {};
    stateSearchOption: EndPointOptions = {};
    $debounceEvent = new Subject<string>();
    $debounceEventForNumber = new Subject<EntityNumberFields>();
    entityUpdateObj = new EntityUpdateClass();
    changeDetectionObj: Partial<Record<keyof EntityFields, boolean>> = {};
    isDunsViewMode = false;
    selectedCountry = null;
    addressLookups = null;
    isSaving = false;
    isDisableCheckBox = true;
    isShowAddressCheckBox = false;
    primaryAddressType = {
        [ENTITY_ADDRESS_TYPE_CODE.SPONSOR]: {
            isChecked: false,
            addressTypeCode: ENTITY_ADDRESS_TYPE_CODE.SPONSOR,
            description: 'Sponsor'
        },
        [ENTITY_ADDRESS_TYPE_CODE.ORGANIZATION]: {
            isChecked: false,
            addressTypeCode: ENTITY_ADDRESS_TYPE_CODE.ORGANIZATION,
            description: 'Organization'
        }
    }
    primaryAddressTypeList = Object.values(this.primaryAddressType);
    selectedOwnerShipType: EntityOwnershipType = { ownershipTypeCode: null, description: '' };
    addressRequiredFields = ADDITIONAL_ADDRESS_REQUIRED_FIELDS_DEFAULT;
    ownershipTypeLookup: LookUpClass[] = [];
    isManageEntityScreen = false;
    coiEntityTypeLookup: LookUpClass[] = [];
    selectedCoiEntityType = new LookUpClass();
    canEmitStateSearchText = false;
    stateSearchLimiterOptions = new SearchLengthValidatorOptions();

    @Input() $performAction = new Subject<'SAVE_AND_VALIDATE' | 'VALIDATE_ONLY'>();
    @Input() entityCreationConfig = new EntityCreationConfig();
    @Output() emitAutoSaveObj = new EventEmitter<any>();
    @Output() isChangeDetected = new EventEmitter<any>();
    @Output() emitEntityDetails = new EventEmitter<any>();
    @Output() emitMandatoryResponse = new EventEmitter<EntityUpdateClass>();

    constructor(private _entityCreateService: EntityCreationService, private _router: Router,
        public commonService: CommonService, private _autoSaveService: AutoSaveService, private _activatedRoute: ActivatedRoute) {
        this.getAddressLookup();
    }

    ngOnInit(): void {
        this.setEndPointSearchOptions();
        this.getOwnershipTypeLookup();
        this.getCoiEntityTypeLookup();
        this.setCommonChangesFlag();
        this.listenDebounceEvent();
        this.autoSaveSubscribe();
        this.listenNumberDebounceEvent();
        this.listenMandatoryCheck();
        this.listenQueryParamsChanges();
        this.listenToGlobalNotifier();
        this.isManageEntityScreen = this._router.url.includes('/manage-entity/');
        this.setDefaultCountryValue();
        this.setDefaultStateValue();
    }

    ngOnChanges(): void {
        if (this.entityCreationConfig?.dataType === 'MANUAL_UPDATE') {
            this.setLocalEntityUpdateObj();
            this.validateCopyPrimaryAddress();
        }
        this.updateIsChecked();
        this.setDunsViewMode();
        this.setCheckBoxState();
        this.setStateSearchLimiter();
        if (!this.entityCreationConfig?.isEditMode && this.mandatoryList.size > 0) {
            this.mandatoryList.clear();
        }
        if (this.entityCreationConfig?.isShowCoiEntityType) {
            this.entityCreationConfig.fieldCustomClass.ENTITY_NAME = 'col-12';
            this.entityCreationConfig.fieldCustomClass.ENTITY_TYPE = 'col-md-12 col-lg-4';
            this.entityCreationConfig.fieldCustomClass.OWNERSHIP_TYPE = 'col-md-12 col-lg-4';
            this.entityCreationConfig.fieldCustomClass.COUNTRY = 'col-md-12 col-lg-4';
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private setEndPointSearchOptions(): void {
        this.countrySearchOption = getEndPointOptionsForCountry(this.commonService.fibiUrl);
        this.stateSearchOption = getEndPointOptionsForStates(this.commonService.fibiUrl);
        this.setStateSearchLimiter();
    }

    private setStateSearchLimiter(): void {
        this.stateSearchLimiterOptions.isShowLimiter = !this.isDunsViewMode
        this.stateSearchLimiterOptions.limit = 30;
        this.stateSearchLimiterOptions.limiterStyle = 'position-absolute end-0 float-end word-count';
    }

    private setDefaultCountryValue(): void {
        if (this.entityCreationConfig?.entityDetails?.country && this.entityCreationConfig?.entityDetails?.country?.countryName) {
          this.clearCountryField = new String('false');
          this.countrySearchOption.defaultValue = this.entityCreationConfig?.entityDetails?.country?.countryName;
        } else {
          this.countrySearchOption.defaultValue = '';
        }
    }

    private setDefaultStateValue():void {
        this.clearStateField = new String('false');
        this.stateSearchOption.defaultValue = this.entityCreationConfig?.entityDetails?.stateDetails?.stateName || this.entityCreationConfig?.entityDetails?.state;
        this.stateSearchOption.params.countryCode = this.entityCreationConfig?.entityDetails?.countryCode || '';
        this.canEmitStateSearchText = this.commonService?.canAllowStateFreeText(this.entityCreationConfig?.entityDetails?.countryCode);
    }

    private listenQueryParamsChanges(): void {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            const MODULE_ID = params['entityManageId'];
            if (MODULE_ID && MODULE_ID != this.entityCreationConfig?.entityDetails?.entityId) {
                this.mandatoryList.clear();
                this.changeDetectionObj = {};
            }
        }));
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data.uniqueId === 'TRIGGER_ENTITY_MANDATORY_VALIDATION') {
                this.entityMandatoryValidation();
            }
        }));
    }

    private async getOwnershipTypeLookup(): Promise<void> {
        this.ownershipTypeLookup = await this.commonService.getOrFetchLookup('ENTITY_OWNERSHIP_TYPE', 'OWNERSHIP_TYPE_CODE');
    }

    private async getCoiEntityTypeLookup(): Promise<void> {
        this.coiEntityTypeLookup = await this.commonService.getOrFetchLookup('COI_ENTITY_TYPE', 'ENTITY_TYPE_CODE');
    }

    private validateCopyPrimaryAddress(): void {
        this.updateIsChecked();
        const ENTITY_ADDRESS_DETAILS = {
            city: this.entityCreationConfig?.entityDetails?.city,
            state: this.entityCreationConfig?.entityDetails?.state,
            postCode: this.entityCreationConfig?.entityDetails?.postCode,
            countryCode: this.entityCreationConfig?.entityDetails?.countryCode,
            addressLine1: this.entityCreationConfig?.entityDetails?.primaryAddressLine1,
            addressLine2: this.entityCreationConfig?.entityDetails?.primaryAddressLine2,
        };

        this.entityCreationConfig?.entityMailingAddresses?.forEach((addressDetails: AdditionalAddress) => {
            const MATCHING_ADDRESS = this.primaryAddressType[addressDetails?.addressTypeCode];
            if (MATCHING_ADDRESS && addressDetails?.isCopy === true) {
                const { city, state, postCode, countryCode, addressLine1, addressLine2, entityId, entityMailingAddressId, addressTypeCode } = addressDetails || {};
                const IS_DIFFERENT_ADDRESS = Object.keys(ENTITY_ADDRESS_DETAILS).some(key =>
                    (ENTITY_ADDRESS_DETAILS[key] || '').trim() !== (addressDetails[key] || '').trim()
                );
                if (IS_DIFFERENT_ADDRESS) {
                    const UPDATE_ADDRESS: AdditionalAddress = {
                        entityId,
                        countryCode,
                        isCopy: false,
                        addressTypeCode,
                        entityMailingAddressId,
                        city: (city || '').trim(),
                        state: (state || '').trim(),
                        postCode: (postCode || '').trim(),
                        addressLine1: (addressLine1 || '').trim(),
                        addressLine2: (addressLine2 || '').trim(),
                    };

                    this.updatePrimaryAddress(UPDATE_ADDRESS, 'SHOW_LOADER');
                }
            }
        });
    }

    private setDunsViewMode(): void {
        this.isDunsViewMode = this.entityCreationConfig?.isDunsMatchedOnSelectedVersion;
    }

    private setLocalEntityUpdateObj(): void {
        if (!isEmptyObject(this.entityCreationConfig?.entityDetails)) {
            Object.keys(this.entityCreationConfig?.entityDetails).forEach((ele: string) => {
                this.entityUpdateObj.entityRequestFields[ele] = deepCloneObject(this.entityCreationConfig?.entityDetails[ele]);
            });
            this.selectedCountry = this.entityCreationConfig?.entityDetails?.country || null;
            this.countrySearchOption = getEndPointOptionsForCountry(this.commonService.fibiUrl);
            this.countrySearchOption.defaultValue = this.entityCreationConfig?.entityDetails?.country?.countryName;
            this.clearCountryField = new String('false');
            this.stateSearchOption = getEndPointOptionsForStates(this.commonService.fibiUrl);
            this.stateSearchOption.defaultValue = this.entityCreationConfig?.entityDetails?.stateDetails?.stateName ? this.entityCreationConfig?.entityDetails?.stateDetails?.stateName : this.entityCreationConfig?.entityDetails?.state;
            this.clearStateField = new String('false');
            const OWNERSHIP_OBJ = this.entityCreationConfig?.entityDetails?.entityOwnershipType;
            this.selectedOwnerShipType = { ownershipTypeCode: OWNERSHIP_OBJ?.ownershipTypeCode || null, description: OWNERSHIP_OBJ?.description || '' };
            const ENTITY_OBJ: CoiEntityType = deepCloneObject(this.entityCreationConfig?.coiEntityType) || new CoiEntityType();
            if (ENTITY_OBJ?.entityTypeCode) {
                this.selectedCoiEntityType = { code: ENTITY_OBJ.entityTypeCode || null, description: ENTITY_OBJ.description || '' };
                this.entityUpdateObj.complianceRequestDTO = { entityTypeCode: ENTITY_OBJ.entityTypeCode };
                this.entityUpdateObj.entityRequestFields.coiEntityType = ENTITY_OBJ;
            }
        }
    }

    private autoSaveSubscribe(): void {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe((event: AutoSaveEvent) => {
            if (!this.entityCreationConfig?.isCreateView && !this.entityCreationConfig?.isCreateEntityFromEngagement) {
                this.checkMandatoryAndSave();
            }
        }
    ));
    }

    private listenNumberDebounceEvent(): void {
        this.$subscriptions.push(this.$debounceEventForNumber.pipe(debounce(() => interval(500))).subscribe((data: EntityNumberFields) => {
            if (data) {
                this.numberChangeEvent(data);
            }
        }
        ));
    }

    private listenDebounceEvent(): void {
        this.$subscriptions.push(this.$debounceEvent.pipe(debounce(() => interval(AUTO_SAVE_DEBOUNCE_TIME))).subscribe((data: any) => {
            if (data) {
                this._autoSaveService.commonSaveTrigger$.next({ action: 'SAVE' });
            }
        }
        ));
    }

    private listenMandatoryCheck(): void {
        this.$subscriptions.push(this.$performAction.subscribe((data: 'SAVE_AND_VALIDATE' | 'VALIDATE_ONLY') => {
            this.entityMandatoryValidation();
            if (!this.mandatoryList.size) {
                data === 'VALIDATE_ONLY' ? this.emitMandatoryCheckResponse(this.entityUpdateObj) : this.saveEntity();
            }
        }));
    }

    private emitMandatoryCheckResponse(entityUpdateObj: EntityUpdateClass): void {
        this.emitMandatoryResponse.emit(entityUpdateObj);
    }

    private saveEntity(): void {
        this.entityUpdateObj.entityId = null;
        const MODIFIED_PAYLOAD = this.getModifiedPayload(this.entityUpdateObj);
        MODIFIED_PAYLOAD.entityRequestFields.entitySourceTypeCode = this.getEntitySourceType();
        this.$subscriptions.push(this.commonService.createEntity(MODIFIED_PAYLOAD).subscribe(async (data: any) => {
            this.setCommonChangesFlag();
            await this.setAndSavePrimaryAddress(data);
            if (this.entityCreationConfig?.canNavigateToEntity) {
                this.isChangeDetected.next(false); // Emit `false` to set `isEntityChangesAvailable` to `false`, indicating that the entity has been saved and the user can navigate.
                this._router.navigate(['/coi/manage-entity/entity-overview'], { queryParams: { entityManageId: data.entityId } });
            } else {
                this.emitEntityDetails.emit({
                    entityId: data.entityId,
                    entityName: MODIFIED_PAYLOAD.entityRequestFields.entityName
                });
            }
        }, (error: any) => {
            this.isChangeDetected.next(true);  // Emit `true` to set `isEntityChangesAvailable` to `true`, indicating that the entity is not saved, changes are still present, and a leave page modal will be displayed when attempting to navigate.
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
        ));
    }

    private async setAndSavePrimaryAddress(entityDetails: any): Promise<void> {
        if (this.isManageEntityScreen) {
            const ENTITY_DETAILS: EntityDetails = {
                entityId: entityDetails.entityId,
                city: this.entityUpdateObj.entityRequestFields.city,
                state: this.entityUpdateObj.entityRequestFields.state,
                postCode: this.entityUpdateObj.entityRequestFields.postCode,
                countryCode: this.entityUpdateObj.entityRequestFields.countryCode,
                primaryAddressLine1: this.entityUpdateObj.entityRequestFields.primaryAddressLine1,
                primaryAddressLine2: this.entityUpdateObj.entityRequestFields.primaryAddressLine2,
            };

            // Process each checked primary address type sequentially
            for (const value of this.primaryAddressTypeList) {
                if (value.isChecked) {
                    await this.saveAsPrimaryAddress(value.addressTypeCode, ENTITY_DETAILS, 'SHOW_LOADER');
                }
            }
        }
    }

    private numberChangeEvent(type: EntityNumberFields): void {
        switch (type) {
            case 'ueiNumber':
                this.checkForDuplicate(type, 'validateUEI');
                break;
            case 'dunsNumber':
                this.checkForDuplicate(type, 'validateDUNS');
                break;
            case 'cageNumber':
                this.checkForDuplicate(type, 'validateCAGE');
                break;
            default:
                break;
        }
    }

    private autoSaveAPI(): void {
        const AUTO_SAVE_RO: EntityUpdateClass = this.getModifiedPayload(this.getAutoSaveRO());
        if (isEmptyObject(AUTO_SAVE_RO) || isEmptyObject(AUTO_SAVE_RO.entityRequestFields) || !Object.keys(AUTO_SAVE_RO.entityRequestFields).length) {
            return;
        }
        this.autoSaveAPICall(AUTO_SAVE_RO);
    }

    private checkMandatoryAndSave(): void {
        this.entityMandatoryValidation();
        const MANDATORY_NOT_FILLED = this.entityCreationConfig?.mandatoryFieldsList?.some((ele: string) => this.mandatoryList.has(ele));
        if (MANDATORY_NOT_FILLED) {
            this.commonService.isShowLoader.next(false);
            return;
        }
        this.autoSaveAPI();
    }

    private emitStoreDataUpdateDetails(updatedFields: EntityRequestFields): void {
        if(this.entityUpdateObj?.entityRequestFields?.entityOwnershipTypeCode) {
            updatedFields.entityOwnershipType = this.entityUpdateObj?.entityRequestFields?.entityOwnershipType;
        }
        if(this.entityUpdateObj?.entityRequestFields?.countryCode) {
            updatedFields.country = this.entityUpdateObj?.entityRequestFields?.country;
        }
        if(this.entityUpdateObj?.entityRequestFields?.state) {
            updatedFields.stateDetails = this.entityUpdateObj?.entityRequestFields?.stateDetails;
        }

        if(updatedFields.hasOwnProperty('ueiNumber')) {
            this.entityCreationConfig.entityDetails.ueiNumber = updatedFields?.ueiNumber;
        }
        if(updatedFields.hasOwnProperty('cageNumber')) {
            this.entityCreationConfig.entityDetails.cageNumber = updatedFields?.cageNumber;
        }
        if(updatedFields.hasOwnProperty('dunsNumber')) {
            this.entityCreationConfig.entityDetails.dunsNumber = updatedFields?.dunsNumber;
        }

        this.emitAutoSaveObj.emit({ 'autoSaveRO': updatedFields });
    }

    private getModifiedPayload(entityRequestFields: EntityUpdateClass): EntityUpdateClass {
        const MODIFIED_PAYLOAD: EntityUpdateClass = { ...entityRequestFields };
        delete MODIFIED_PAYLOAD.entityRequestFields?.stateDetails;
        delete MODIFIED_PAYLOAD.entityRequestFields?.country;
        delete MODIFIED_PAYLOAD.entityRequestFields?.entityOwnershipType;
        return MODIFIED_PAYLOAD;
    }

    private setChangesObject(autoSaveReqObj: EntityRequestFields, isChangesAvailable: boolean): void {
        Object.keys(autoSaveReqObj).forEach((ele) => {
            if (!this.mandatoryList.has(ele)) {
                this.changeDetectionObj[ele] = isChangesAvailable;
            }
        });
    }

    private getAutoSaveRO(): EntityUpdateClass {
        const AUTO_SAVE_PAYLOAD = new EntityUpdateClass();
        AUTO_SAVE_PAYLOAD.entityId = this.entityCreationConfig?.entityDetails.entityId;
        Object.keys(this.changeDetectionObj).forEach((ele) => {
            if (this.changeDetectionObj[ele] && !this.mandatoryList.has(ele)) {
                const VALUE = this.entityUpdateObj.entityRequestFields[ele];
                AUTO_SAVE_PAYLOAD.entityRequestFields[ele] = typeof VALUE === 'string' ? (VALUE?.trim() || null) : VALUE;
            }
        });
        return AUTO_SAVE_PAYLOAD;
    }

    private setupBeforeAPICall(AUTO_SAVE_RO: EntityUpdateClass): void {
        this.commonService.showAutoSaveSpinner();
        this.setChangesObject(AUTO_SAVE_RO.entityRequestFields, false);
    }

    private setCommonChangesFlag(): void {
        const HAS_TRUE_VALUE = Object.values(this.changeDetectionObj).some(value => value);
        this.isChangeDetected.next(HAS_TRUE_VALUE);
        this.commonService.setChangesAvailable(this.entityCreationConfig?.isCreateView ? false : HAS_TRUE_VALUE);
    }

    private checkForDuplicate(type: EntityNumberFields, apiName: EntityCreationUniqueFieldServices): void {
        this.clearValidation(type);
        const CURRENT_VAL = this.entityUpdateObj.entityRequestFields[type]?.trim() || null;
        const SAVED_VAL = this.entityCreationConfig?.entityDetails?.[type];
        this.changeDetectionObj[type] = true;
        this.setCommonChangesFlag();
        CURRENT_VAL ? this.triggerDuplicateCheckAPICall(apiName, CURRENT_VAL, SAVED_VAL, type) :  this.saveNumber(type, CURRENT_VAL);
    }

    private triggerDuplicateCheckAPICall(apiName: EntityCreationUniqueFieldServices, CURRENT_VAL: string | null, SAVED_VAL: string | null, type: EntityNumberFields) {
        this.commonService.setLoaderRestriction();
        const ENTITY_DETAILS = {
            entityId: this.entityCreationConfig?.entityDetails?.entityId,
            entityNumber: this.entityCreationConfig?.entityDetails?.entityNumber
        }
        this.$subscriptions.push(this._entityCreateService[apiName](CURRENT_VAL, ENTITY_DETAILS).subscribe((data: any) => {
            data && CURRENT_VAL !== SAVED_VAL ? this.handleDuplicateNumber(type, CURRENT_VAL) : this.saveNumber(type, CURRENT_VAL);
        }));
        this.commonService.removeLoaderRestriction();
    }

    private saveNumber(type: EntityNumberFields, CURRENT_VAL: any): void {
        this.entityUpdateObj.entityRequestFields[type] = this.entityUpdateObj.entityRequestFields[type].trim() || null;
        if(CURRENT_VAL == this.entityUpdateObj.entityRequestFields[type]) {
            this.entityMandatoryValidation();
            const MANDATORY_NOT_FILLED = this.entityCreationConfig?.mandatoryFieldsList.some((ele: string) => this.mandatoryList.has(ele));
            if (MANDATORY_NOT_FILLED) {
                this.commonService.isShowLoader.next(false);
                return;
            }
            const AUTO_SAVE_RO: EntityUpdateClass = {entityId: this.entityCreationConfig?.entityDetails?.entityId, entityRequestFields: {[type]: CURRENT_VAL}};
            if (type === 'dunsNumber') {
                this.entityUpdateObj.entityRequestFields.isDunsMatched = false;
                AUTO_SAVE_RO.entityRequestFields.isDunsMatched = false;
                this.changeDetectionObj['isDunsMatched'] = true;
            }
            if (!this.entityCreationConfig?.isCreateView && !this.entityCreationConfig?.isCreateEntityFromEngagement) {
                this.autoSaveAPICall(AUTO_SAVE_RO);
            }
        }
    }

    autoSaveAPICall(AUTO_SAVE_RO: EntityUpdateClass) {
        this.setupBeforeAPICall(AUTO_SAVE_RO);
        AUTO_SAVE_RO.modificationIsInProgress = this.entityCreationConfig.modificationIsInProgress;
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(this._entityCreateService.autoSaveService(AUTO_SAVE_RO).subscribe((data: any) => {
            this.emitStoreDataUpdateDetails(AUTO_SAVE_RO.entityRequestFields);
            this.commonService.hideAutoSaveSpinner('SUCCESS');
            this.setCommonChangesFlag();
        }, error => {
            this.setChangesObject(AUTO_SAVE_RO.entityRequestFields, true);
            this.commonService.hideAutoSaveSpinner('ERROR');
        }
        ));
        this.commonService.removeLoaderRestriction();
    }

    private handleDuplicateNumber(type: EntityNumberFields, CURRENT_VAL: any): void {
        this.entityUpdateObj.entityRequestFields[type] = this.entityUpdateObj.entityRequestFields[type].trim() || null;
        if(CURRENT_VAL == this.entityUpdateObj.entityRequestFields[type] && CURRENT_VAL != this.entityCreationConfig?.entityDetails[type]) {
            const NUM_TYPE = type === 'dunsNumber' ? 'DUNS' : type === 'cageNumber' ? 'CAGE' : 'UEI';
            this.mandatoryList.set(type, `An entity with this ${NUM_TYPE} number already exists`);
            this.commonService.autoSaveSavingSpinner = 'HIDE';
            if (this.commonService.hasChangesAvailable && this.commonService.isNavigationStopped) {
                this.commonService.isShowLoader.next(false);
                openModal('coi-entity-confirmation-modal');
            }
        }
    }

    private entityMandatoryValidation(): void {
        this.entityCreationConfig?.mandatoryFieldsList?.forEach((field: string) => {
            this.clearValidation(field);
            if(typeof this.entityUpdateObj.entityRequestFields[field] === 'string') {
                this.entityUpdateObj.entityRequestFields[field] = this.entityUpdateObj?.entityRequestFields[field]?.trim();
            }
            if (!this.entityUpdateObj.entityRequestFields[field]) {
                let message = '';
                switch (field) {
                    case 'entityName':
                        message = 'Please enter the entity name.';
                        break;
                    case 'primaryAddressLine1':
                        message = 'Please enter the address line 1.';
                        break;
                    case 'countryCode':
                        message = 'Please select a country.';
                        break;
                    case 'postCode':
                        message = 'Please enter the postal code.';
                        break;
                    case 'entityOwnershipTypeCode':
                        message = 'Please select an ownership type.';
                        break;
                    default:
                        message = `Please enter the ${field}.`;
                        break;
                }
                this.mandatoryList.set(field, message);
            }
        });
    }

    private clearValidation(type): void {
        this.mandatoryList.delete(type);
    }

    private async getAddressLookup(): Promise<void> {
        this.addressLookups = await this.commonService.getOrFetchLookup('ENTITY_ADDRESS_TYPE', 'ADDRESS_TYPE_CODE');
    }

    private clearStateFieldValue(): void {
        this.entityUpdateObj.entityRequestFields.state = null;
        this.clearStateField = new String('true');
    }

    private setCountryField(countryDetail: Country): void {
        const COUNTRY_FIELD = this.entityUpdateObj?.entityRequestFields?.country;
        if (!COUNTRY_FIELD || !Object.keys(COUNTRY_FIELD).length) {
            this.clearCountryField = new String('false');
            this.countrySearchOption.defaultValue = countryDetail?.countryName;
            this.selectedCountryEvent(countryDetail, false);
        }
    }

    onOwnerShipTypeSelect(typeCode: string): void {
        const SELECTED_OWNERSHIP = this.ownershipTypeLookup?.find(data => data?.code === typeCode);
        this.entityUpdateObj.entityRequestFields.entityOwnershipTypeCode = typeCode || null;
        this.entityUpdateObj.entityRequestFields.entityOwnershipType = new EntityOwnerShip();
        this.entityUpdateObj.entityRequestFields.entityOwnershipType.ownershipTypeCode = typeCode;
        this.selectedOwnerShipType.description = SELECTED_OWNERSHIP?.description;
        this.entityUpdateObj.entityRequestFields.entityOwnershipType.description = SELECTED_OWNERSHIP?.description;
        this.changeEvent('entityOwnershipTypeCode');
    }

    changeEvent(key: string): void {
        this.changeDetectionObj[key] = true;
        this.setCommonChangesFlag();
        this.checkAddressAndSave(key);
        this.$debounceEvent.next(key);
    }

    private checkAddressAndSave(key: string): void {
        this.setCheckBoxState();
        if (ENTITY_ADDRESS_FIELDS.includes(key)) {
            if (!this.entityCreationConfig?.isCreateView) {
                this.isDisableCheckBox = true;
            }
            const HAS_ANY_CHECKED_ADDRESS = this.primaryAddressTypeList.some((value) => value.isChecked);
            if (HAS_ANY_CHECKED_ADDRESS) {
                this.primaryAddressTypeList.forEach((value) => {
                    if (value.isChecked) {
                        this.isSaving = false;
                        value.isChecked = false;
                        this.saveAsPrimaryAddress(value.addressTypeCode);
                    }
                });
            }
        }
    }

    private getEntitySourceType(): string {
        if (this.commonService.getAvailableRight(['MANAGE_ENTITY_SPONSOR', 'MANAGE_ENTITY_ORGANIZATION'])) {
            return ENTITY_SOURCE_TYPE_CODE.DST;
        }
        if (this.commonService.getAvailableRight(['MANAGE_ENTITY_COMPLIANCE'])) {
            return ENTITY_SOURCE_TYPE_CODE.COMPLIANCE;
        }
        return ENTITY_SOURCE_TYPE_CODE.ENTITY_ADMIN;
    }

    checkForValidPhoneNumber(event: any): void {
        if (inputRestrictionForNumberField(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
    }

    validateEmail(): void {
        this.clearValidation('certifiedEmail');
        this.changeDetectionObj['certifiedEmail'] = true;
        this.setCommonChangesFlag();
        if (this.entityUpdateObj?.entityRequestFields?.certifiedEmail && !isValidEmailAddress(this.entityUpdateObj?.entityRequestFields?.certifiedEmail)) {
            this.mandatoryList.set('certifiedEmail', 'Please enter valid email address.');
        } else if (this.entityUpdateObj?.entityRequestFields?.certifiedEmail != this.entityCreationConfig?.entityDetails.certifiedEmail) {
            this.$debounceEvent.next('certifiedEmail');
        }
    }

    validateAndAddPhoneNumber(): void {
        this.clearValidation('phoneNumber');
        this.changeDetectionObj['phoneNumber'] = true;
        this.setCommonChangesFlag();
        if (this.entityUpdateObj?.entityRequestFields?.phoneNumber && phoneNumberValidation(this.entityUpdateObj?.entityRequestFields?.phoneNumber)) {
            this.mandatoryList.set('phoneNumber', 'Please enter valid phone.');
        } else if (this.entityUpdateObj?.entityRequestFields?.phoneNumber != this.entityCreationConfig?.entityDetails.phoneNumber) {
            this.$debounceEvent.next('phoneNumber');
        }
    }

    validateAndSaveNumber(key: EntityNumberFields) {
        this.$debounceEventForNumber.next(key);
    }

    selectedCountryEvent(event: any, hasClearState = true): void {
        if (event) {
            const { countryCode: COUNTRY_CODE, countryTwoCode: COUNTRY_TWO_CODE } = event;
            const IS_TRIGGERED_VIA_OTHER_FORMS = ['ENGAGEMENT_ADD', 'ENGAGEMENT_EDIT', 'CONSULTING_ADD', 'CONSULTING_EDIT', 'CMP_ADD', 'CMP_EDIT'].includes(this.entityCreationConfig.triggeredFrom);
            const IS_MANDATORY_REQUIRED = (COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(COUNTRY_CODE) || COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(COUNTRY_TWO_CODE));
            if (!IS_TRIGGERED_VIA_OTHER_FORMS) {
                this.entityCreationConfig.mandatoryFieldsList = IS_MANDATORY_REQUIRED ? ENTITY_MANDATORY_FIELDS : ENTITY_MANDATORY_WITHOUT_ADDRESS;
                this.addressRequiredFields = IS_MANDATORY_REQUIRED ? ADDITIONAL_ADDRESS_REQUIRED_FIELDS_SPECIFIC : ADDITIONAL_ADDRESS_REQUIRED_FIELDS_DEFAULT;
                if (!IS_MANDATORY_REQUIRED) {
                    const FIELDS_TO_CLEAR = ['primaryAddressLine1', 'city', 'state', 'postCode'];
                    FIELDS_TO_CLEAR.forEach((field) => this.clearValidation(field));
                }
            } else {
                this.entityCreationConfig.mandatoryFieldsList = IS_MANDATORY_REQUIRED ? COUNTRY_SPECIFIC_REPORTER_FIELDS : ENTITY_MANDATORY_REPORTER_FIELDS;
                if (!IS_MANDATORY_REQUIRED) {
                    const FIELDS_TO_CLEAR = ['city', 'state'];
                    FIELDS_TO_CLEAR.forEach((field) => this.clearValidation(field));
                }
            }
            this.stateSearchOption.params.countryCode = COUNTRY_CODE;
            this.canEmitStateSearchText = this.commonService?.canAllowStateFreeText(COUNTRY_CODE);
        } else {
            delete this.stateSearchOption?.params?.countryCode;
            const IS_TRIGGERED_VIA_OTHER_FORMS = ['ENGAGEMENT_ADD', 'ENGAGEMENT_EDIT', 'CONSULTING_ADD', 'CONSULTING_EDIT'].includes(this.entityCreationConfig.triggeredFrom);
            if (IS_TRIGGERED_VIA_OTHER_FORMS) {
                const ENTITY_UPDATE_OBJECT: EntityUpdateClass = deepCloneObject(this.entityUpdateObj);
                delete ENTITY_UPDATE_OBJECT.entityRequestFields.entityName;
                this.emitMandatoryCheckResponse(ENTITY_UPDATE_OBJECT);
            }
        }
        this.entityUpdateObj.entityRequestFields.countryCode = event?.countryCode || null;
        this.selectedCountry = event || null
        this.entityUpdateObj.entityRequestFields.country = event || null;
        this.changeEvent('countryCode');
        if (this.entityUpdateObj?.entityRequestFields?.state) {
            this.changeEvent('state');
        }
        hasClearState && this.clearStateFieldValue();
    }

    selectedStateEvent(event: State | null): void {
        if (event) {
            this.entityUpdateObj.entityRequestFields.state = event.stateCode || event.value;
            this.entityUpdateObj.entityRequestFields.stateDetails = event;
            this.changeEvent('state');
            this.setCountryField(event.country);
        } else {
            this.entityUpdateObj.entityRequestFields.state = '';
            this.entityUpdateObj.entityRequestFields.stateDetails = null;
            this.changeEvent('state');
        }
    }

    validateWebsite(): void {
        this.clearValidation('websiteAddress');
        this.changeDetectionObj['websiteAddress'] = true;
        this.setCommonChangesFlag();
        if (this.entityUpdateObj?.entityRequestFields?.websiteAddress && !isValidWebsite(this.entityUpdateObj?.entityRequestFields?.websiteAddress)) {
            this.mandatoryList.set('websiteAddress', 'Please enter valid website address, http://www.example.com, www.example.com or example.com')
        } else if (this.entityUpdateObj?.entityRequestFields?.websiteAddress != this.entityCreationConfig?.entityDetails.websiteAddress) {
            this.$debounceEvent.next('websiteAddress');
        }
    }

    private updateIsChecked(): void {
        if (!this.isSaving) {
            this.resetAddressType();
            this.entityCreationConfig?.entityMailingAddresses?.forEach((address: AdditionalAddress) => {
                const MATCHING_ADDRESS = this.primaryAddressType[address.addressTypeCode];
                if (MATCHING_ADDRESS && address.isCopy === true) {
                    MATCHING_ADDRESS.isChecked = true;
                }
            });
        }
    }

    private updateAndArrangeData(primaryAddress: AdditionalAddress): void {
        const UPDATED_ADDRESS_INDEX = this.entityCreationConfig?.entityMailingAddresses?.findIndex((address: AdditionalAddress) => address.addressTypeCode === primaryAddress?.addressTypeCode);
        if (UPDATED_ADDRESS_INDEX > -1) {
            this.entityCreationConfig?.entityMailingAddresses?.splice(UPDATED_ADDRESS_INDEX, 1);
            const UPDATED_ADDRESS = deepCloneObject(primaryAddress);
            UPDATED_ADDRESS.country = this.selectedCountry;
            UPDATED_ADDRESS.entityAddressType = this.addressLookups?.find((lookup: any) => lookup.code == primaryAddress?.addressTypeCode);
            this.entityCreationConfig?.entityMailingAddresses.unshift(UPDATED_ADDRESS);
            this.emitAutoSaveObj.emit({ entityMailingAddresses: this.entityCreationConfig?.entityMailingAddresses });
        }
    }

    private getPrimaryAddressRO(addressTypeCode: string, entityDetails: EntityDetails): AdditionalAddress {
        const PRIMARY_ADDRESS = new AdditionalAddress();
        const SAVED_ADDRESS: AdditionalAddress = this.entityCreationConfig?.entityMailingAddresses?.find((address: AdditionalAddress) => address.addressTypeCode === addressTypeCode);
        PRIMARY_ADDRESS.addressTypeCode = addressTypeCode;
        PRIMARY_ADDRESS.entityId = entityDetails?.entityId;
        PRIMARY_ADDRESS.countryCode = entityDetails?.countryCode;
        PRIMARY_ADDRESS.city = (entityDetails?.city || '').trim();
        PRIMARY_ADDRESS.state = (entityDetails?.state || '').trim();
        PRIMARY_ADDRESS.addressLine1 = (entityDetails?.primaryAddressLine1 || '').trim();
        PRIMARY_ADDRESS.addressLine2 = (entityDetails?.primaryAddressLine2 || '').trim();
        PRIMARY_ADDRESS.postCode = (entityDetails?.postCode || '').trim();
        PRIMARY_ADDRESS.isCopy = this.primaryAddressType[addressTypeCode].isChecked;
        PRIMARY_ADDRESS.entityMailingAddressId = SAVED_ADDRESS?.entityMailingAddressId ? SAVED_ADDRESS?.entityMailingAddressId : undefined;
        return PRIMARY_ADDRESS
    }

    async saveAsPrimaryAddress(addressTypeCode: string, entityDetails = this.entityCreationConfig?.entityDetails, loaderType: 'HIDE_LOADER' | 'SHOW_LOADER' = 'HIDE_LOADER'): Promise<void> {
        if (entityDetails?.entityId) {
            const PRIMARY_ADDRESS_RO = this.getPrimaryAddressRO(addressTypeCode, entityDetails);
            if (this.validatePrimaryAddress(PRIMARY_ADDRESS_RO) && !this.isSaving) {
                this.isSaving = true;
                if (PRIMARY_ADDRESS_RO.entityMailingAddressId) {
                    await this.updatePrimaryAddress(PRIMARY_ADDRESS_RO, loaderType);
                } else {
                    await this.addPrimaryAddress(PRIMARY_ADDRESS_RO, loaderType);
                }
                this.commonService.hideAutoSaveSpinner('SUCCESS');
            }
        }
    }

    private updatePrimaryAddress(primaryAddress: AdditionalAddress, loaderType: 'HIDE_LOADER' | 'SHOW_LOADER'): Promise<void> {
        this.setLoaderRestriction(loaderType);
        return new Promise((resolve, reject) => {
            this.$subscriptions.push(
                this._entityCreateService.updateAdditionalAddresses(primaryAddress).subscribe({
                    next: () => {
                        this.updateAndArrangeData(primaryAddress);
                        this.isSaving = false;
                        resolve();
                    },
                    error: (error: any) => {
                        this.handleAddressAPIError(primaryAddress, resolve);
                    },
                })
            );
        });
    }

    private handleAddressAPIError(primaryAddress: AdditionalAddress, resolve: (value: void | PromiseLike<void>) => void) {
        this.isSaving = false;
        const ADDRESS_TYPE = this.primaryAddressType[primaryAddress.addressTypeCode]?.description;
        this.commonService.showToast(HTTP_ERROR_STATUS, `Error in saving ${ADDRESS_TYPE?.toLowerCase()} address.`);
        resolve();
    }

    private addPrimaryAddress(primaryAddress: AdditionalAddress, loaderType: 'HIDE_LOADER' | 'SHOW_LOADER'): Promise<void> {
        this.setLoaderRestriction(loaderType);
        return new Promise((resolve, reject) => {
            this.$subscriptions.push(
                this._entityCreateService.addAdditionalAddress(primaryAddress).subscribe({
                    next: (data: any) => {
                        const NEW_ADDRESS = deepCloneObject(primaryAddress);
                        NEW_ADDRESS.entityMailingAddressId = data.entityMailingAddressId;
                        NEW_ADDRESS.country = this.selectedCountry;
                        NEW_ADDRESS.entityAddressType = this.addressLookups.find(
                            (lookup: any) => lookup.code == primaryAddress?.addressTypeCode
                        );
                        this.entityCreationConfig?.entityMailingAddresses.unshift(NEW_ADDRESS);
                        this.emitAutoSaveObj.emit({ entityMailingAddresses: this.entityCreationConfig?.entityMailingAddresses });
                        this.isSaving = false;
                        resolve();
                    },
                    error: (error: any) => {
                        this.handleAddressAPIError(primaryAddress, resolve);
                    },
                })
            );
        });
    }

    private setLoaderRestriction(loaderType: string): void {
        if (loaderType === 'HIDE_LOADER') {
            this.commonService.showAutoSaveSpinner();
            this.commonService.setLoaderRestriction();
            setTimeout(() => {
                this.commonService.removeLoaderRestriction();
            }, 50);
        }
    }

    private resetAddressType(): void {
        this.primaryAddressTypeList.forEach((value) => {
            value.isChecked = false;
        });
    }

    private validatePrimaryAddress(primaryAddress: AdditionalAddress): boolean {
        return this.addressRequiredFields.every(field => !!primaryAddress?.[field]);
    }

    private setCheckBoxState(): void {
        const PRIMARY_ADDRESS = new AdditionalAddress();
        PRIMARY_ADDRESS.city = this.entityUpdateObj.entityRequestFields.city;
        PRIMARY_ADDRESS.state = this.entityUpdateObj.entityRequestFields.state;
        PRIMARY_ADDRESS.postCode = this.entityUpdateObj.entityRequestFields.postCode;
        PRIMARY_ADDRESS.countryCode = this.entityUpdateObj.entityRequestFields.countryCode;
        PRIMARY_ADDRESS.addressLine1 = this.entityUpdateObj.entityRequestFields.primaryAddressLine1;
        this.isDisableCheckBox = !this.validatePrimaryAddress(PRIMARY_ADDRESS);
    }

    onCoiEntityTypeSelect(entityTypeCode: string): void {
        if (entityTypeCode) {
            const SELECTED_TYPE = this.coiEntityTypeLookup?.find(data => data?.code === entityTypeCode);
            this.selectedCoiEntityType.description = SELECTED_TYPE?.description;
            this.entityUpdateObj.complianceRequestDTO = { entityTypeCode };
            this.entityUpdateObj.entityRequestFields.coiEntityType = new CoiEntityType();
            this.entityUpdateObj.entityRequestFields.coiEntityType.entityTypeCode = entityTypeCode;
            this.entityUpdateObj.entityRequestFields.coiEntityType.description = SELECTED_TYPE?.description;
        } else {
            this.selectedCoiEntityType = new LookUpClass();
            delete this.entityUpdateObj.complianceRequestDTO;
            delete this.entityUpdateObj.entityRequestFields.coiEntityType;
        }
        this.changeEvent('entityTypeCode');
    }

}
