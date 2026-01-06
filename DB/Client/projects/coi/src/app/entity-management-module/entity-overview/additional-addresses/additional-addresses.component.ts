import {Component, OnDestroy, OnInit} from '@angular/core';
import {AdditionalAddress, DataStoreEvent, EntityDetails} from '../../shared/entity-interface';
import {getEndPointOptionsForCountry} from 'projects/fibi/src/app/common/services/end-point.config';
import {
    deepCloneObject,
    hideModal,
    isEmptyObject,
    openModal
} from 'projects/fibi/src/app/common/utilities/custom-utilities';
import {Subscription} from 'rxjs';
import {EntityDataStoreService} from '../../entity-data-store.service';
import {EntityOverviewService} from '../entity-overview.service';
import {CommonService} from '../../../common/services/common.service';
import {COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, ENTITY_ADDRESS_TYPE_CODE, HTTP_SUCCESS_STATUS} from '../../../app-constants';
import {CommonModalConfig, ModalActionEvent} from '../../../shared-components/common-modal/common-modal.interface';
import {closeCommonModal, openCommonModal} from '../../../common/utilities/custom-utilities';
import {subscriptionHandler} from '../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { getEntityFullAddress } from '../../entity-management.service';
import { ADDITIONAL_ADDRESS, ADDITIONAL_ADDRESS_FIELDS, COUNTRY_CODE_FOR_MANDATORY_CHECK } from '../../shared/entity-constants';
import { Country, LookUpClass, State } from '../../../common/services/coi-common.interface';
import { getEndPointOptionsForStates } from '../../../common/services/end-point.config';
import { EndPointOptions } from '../../../shared-components/shared-interface';
import { SearchLengthValidatorOptions } from '../../../shared/common.interface';

@Component({
    selector: 'app-additional-addresses',
    templateUrl: './additional-addresses.component.html',
    styleUrls: ['./additional-addresses.component.scss']
})
export class AdditionalAddressesComponent implements OnInit, OnDestroy {
    additionalAddressObj: AdditionalAddress = new AdditionalAddress();
    entityData: EntityDetails;
    clearCountryField = new String('true');
    clearStateField = new String('true');
    countrySearchOptions: EndPointOptions = {};
    stateSearchOption: EndPointOptions = {};
    mandatoryList = new Map();
    $subscriptions: Subscription[] = [];
    entityId: any;
    additionalAddresses: any = [];
    addressTypOptions = 'EMPTY_TYPE#EMPTY_TYPE#false#false';
    selectedAddressType = [];
    isEditIndex: null | number = null;
    isEditMode = false;
    addressTypeDefaultValue = '';
    selectAddressType = null;
    selectedCountry = null;
    selectedState: State | null = null;
    isSaving = false;
    deletePrimaryKey = null;
    addressTypeLookup: LookUpClass[] = [];
    CONFIRMATION_MODAL_ID = 'address-delete-confirm-modal';
    modalConfig = new CommonModalConfig(this.CONFIRMATION_MODAL_ID, 'Delete', 'Cancel');
    canManageEntity = false;
    ADDITIONAL_ADDRESS = ADDITIONAL_ADDRESS;
    isAddressMandatory = false;
    isDunsViewMode = false;
    MAILING_ADDRESS = ENTITY_ADDRESS_TYPE_CODE.MAILING_ADDRESS;
    canEmitStateSearchText = false;
    stateSearchLimiterOptions = new SearchLengthValidatorOptions();

    constructor(private _entityOverviewService: EntityOverviewService, private _dataStorService: EntityDataStoreService, private _commonService: CommonService) {
    }

    ngOnInit() {
        this.getAddressTypeLookup();
        this.setEndPointSearchOptions();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.setDefaultCountryValue();
        this.setDefaultStateValue();
    }

    private setEndPointSearchOptions(): void {
        this.countrySearchOptions = getEndPointOptionsForCountry(this._commonService.fibiUrl);
        this.stateSearchOption = getEndPointOptionsForStates(this._commonService.fibiUrl);
        this.setStateSearchLimiter();
    }

    private setStateSearchLimiter(): void {
        this.stateSearchLimiterOptions.isShowLimiter = true;
        this.stateSearchLimiterOptions.limit = 30;
        this.stateSearchLimiterOptions.limiterStyle = 'float-end word-count';
    }

    private setDefaultCountryValue(): void {
        if (this.additionalAddressObj?.country && this.additionalAddressObj?.country?.countryName) {
          this.clearCountryField = new String('false');
          this.countrySearchOptions.defaultValue = this.additionalAddressObj.country?.countryName;
        } else {
          this.countrySearchOptions.defaultValue = '';
        }
    }

    private setDefaultStateValue(): void {
        this.clearStateField = new String('false');
        this.stateSearchOption.defaultValue = this.additionalAddressObj?.stateDetails?.stateName || '';
        this.stateSearchOption.params.countryCode = this.additionalAddressObj?.countryCode || '';
        this.canEmitStateSearchText = this._commonService?.canAllowStateFreeText(this.additionalAddressObj?.countryCode);
    }

    private setMandatoryList(countryDetails: Country): void {
        const { countryCode, countryTwoCode } = countryDetails || {};
        this.isAddressMandatory = [countryCode, countryTwoCode].some(code => COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(code));
    }

    private getHasDuplicateTypeCode(addressTypeCode: string, entityMailingAddressId: number | null): boolean {
        const IS_NON_DUPLICATE_ADDRESS  = [ENTITY_ADDRESS_TYPE_CODE.ORGANIZATION, ENTITY_ADDRESS_TYPE_CODE.SPONSOR, ENTITY_ADDRESS_TYPE_CODE?.MAILING_ADDRESS].includes(addressTypeCode);
        if (!IS_NON_DUPLICATE_ADDRESS) {
            return false;
        }
        return this.additionalAddresses?.some((addressType: any) => addressType?.addressTypeCode === addressTypeCode && addressType?.entityMailingAddressId !== entityMailingAddressId);
    }

    private async getAddressTypeLookup(): Promise<void> {
        this.addressTypeLookup = await this._commonService.getOrFetchLookup('ENTITY_ADDRESS_TYPE', 'ADDRESS_TYPE_CODE', 'Y');
    }

    selectedCountryEvent(event: any, hasClearState = true): void {
        if (event) {
            this.mandatoryList.clear();
            this.setMandatoryList(event);
            this.additionalAddressObj.countryCode = event.countryCode;
            this.canEmitStateSearchText = this._commonService?.canAllowStateFreeText(event.countryCode);
            this.selectedCountry = event;
            this.stateSearchOption.params.countryCode = event.countryCode;
        } else {
            this.additionalAddressObj.countryCode = '';
            this.selectedCountry = null;
            delete this.stateSearchOption?.params?.countryCode;
        }
        hasClearState && this.clearStateFields(); 
    }

    private clearStateFields(): void {
        this.additionalAddressObj.state = null;
        this.clearStateField = new String('true');
    }

    selectedStateEvent(event: State | null): void {
        if (event) {
            this.additionalAddressObj.state = event.stateCode || event.value;
            this.selectedState = event;
            this.setCountryField(event.country);
        } else {
            this.additionalAddressObj.state = '';
            this.selectedState = null;
        }
        this.stateSearchOption.params.countryCode = this.selectedCountry?.countryCode || '';
    }

    private setCountryField(countryDetail: Country): void {
        if (!this.additionalAddressObj?.country) {
            this.clearCountryField = new String('false');
            this.countrySearchOptions.defaultValue = countryDetail?.countryName || this.selectedCountry?.countryName;
            const COUNTRY_DETAILS = countryDetail || this.selectedCountry;
            this.selectedCountryEvent(COUNTRY_DETAILS, false);
        }
    }

    clearAdditionalAddress() {
        this.mandatoryList.clear();
        this.additionalAddressObj = new AdditionalAddress();
        this.setEndPointSearchOptions();
        this.isEditIndex = null;
        this.addressTypeDefaultValue = '';
        this.selectAddressType = null;
        this.selectedState = null;
        this.selectedCountry = null;
        this.selectedAddressType = [];
        this.deletePrimaryKey = null;
        hideModal('addAdditionalAddress');
    }

    addIndustry() {
        this.entityMandatoryValidation();
        if (!this.mandatoryList.size) {
            this.additionalAddressObj.entityId = this.entityId;
            this.$subscriptions.push(this._entityOverviewService.addAdditionalAddress(this.additionalAddressObj).subscribe((data: any) => {
                const newAddress = deepCloneObject(this.additionalAddressObj);
                newAddress.entityMailingAddressId = data.entityMailingAddressId;
                newAddress.country = this.selectedCountry;
                newAddress.stateDetails = this.selectedState;
                newAddress.entityAddressType = this.selectAddressType;
                this.additionalAddresses.unshift(newAddress);
                this._dataStorService.enableModificationHistoryTracking();
                this.updateDataStore();
                this.clearAdditionalAddress();
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Additional address added successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        }
    }

    onAddressTypeSelect(event) {
        if (event) {
            this.additionalAddressObj.addressTypeCode = event[0]?.code;
            this.selectAddressType = event[0];
        } else {
            this.additionalAddressObj.addressTypeCode = null;
            this.selectAddressType = null;
        }
    }

    addIndustryDetails() {
        this.setMandatoryList(this.entityData?.country);
        openModal('addAdditionalAddress');
    }

    entityMandatoryValidation(): void {
        this.mandatoryList.clear();
        const IS_ADDRESS_TYPE_FROM_DUNS  = [ENTITY_ADDRESS_TYPE_CODE?.MAILING_ADDRESS].includes(this.additionalAddressObj.addressTypeCode);
        if (!this.additionalAddressObj.countryCode) {
            this.mandatoryList.set('countryCode', 'Please select a country.');
        }
        if (!this.additionalAddressObj.addressLine1) {
            this.mandatoryList.set('addressLine1', 'Please enter the address Line 1.');
        }
        if (!this.additionalAddressObj.addressTypeCode) {
            this.mandatoryList.set('addressTypeCode', 'Please select an addressType.');
        } else if (this.isDunsViewMode && IS_ADDRESS_TYPE_FROM_DUNS) {
            this.mandatoryList.set('addressTypeCode', `The ${this.selectAddressType?.description} cannot be added because the entity matches with D&B.`); 
        } else if (this.getHasDuplicateTypeCode(this.additionalAddressObj.addressTypeCode, this.additionalAddressObj.entityMailingAddressId)) {
            this.mandatoryList.set('addressTypeCode', `The ${this.selectAddressType?.description} has already been added. Please update the existing address to make any changes.`);
        }
        if (!this.additionalAddressObj.city) {
            this.mandatoryList.set('city', 'Please enter the city.');
        }
        if(this.isAddressMandatory){
            if (!this.additionalAddressObj.state) {
                this.mandatoryList.set('state', 'Please enter the state.');
            }
            if (!this.additionalAddressObj.postCode) {
                this.mandatoryList.set('postCode', 'Please enter the postCode.');
            }
        }
    }

    private getDataFromStore() {
        const entityData = this._dataStorService.getData();
        if (isEmptyObject(entityData)) {
            return;
        }
        this.entityData = entityData?.entityDetails;
        this.entityId = entityData?.entityDetails?.entityId;
        this.additionalAddresses = entityData.entityMailingAddresses;
        this.isEditMode = this._dataStorService.getEditMode();
        this.isDunsViewMode = this._dataStorService.checkDunsMatchedForSelectedVersion();
        this.checkUserHasRight();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStorService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    getEntityFullAddress(entityOtherAddress): string {
        return getEntityFullAddress(entityOtherAddress, ADDITIONAL_ADDRESS_FIELDS);
    }

    confirmDelete(address, index: number) {
        this.isEditIndex = index;
        this.deletePrimaryKey = address.entityMailingAddressId;
        this.addressTypeDefaultValue = address.entityAddressType.description;
        openCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    editAddress(address, index: number) {
        this.isEditIndex = index;
        this.setAddressDetails(address);
        this.setMandatoryList(address?.country);
        openModal('addAdditionalAddress');
    }

    setAddressDetails(address) {
        this.addressTypeDefaultValue = address.entityAddressType.description;
        this.additionalAddressObj.addressTypeCode = address.addressTypeCode;
        this.selectAddressType = address.entityAddressType;
        this.additionalAddressObj.entityId = address.entityId;
        this.additionalAddressObj.entityMailingAddressId = address.entityMailingAddressId;
        this.additionalAddressObj.addressLine1 = address.addressLine1;
        this.additionalAddressObj.addressLine2 = address.addressLine2;
        this.additionalAddressObj.countryCode = address.countryCode;
        this.selectedCountry = address.country;
        this.selectedState = address?.stateDetails || address?.state;
        this.setEndPointSearchOptions();
        this.countrySearchOptions.defaultValue = address.country.countryName;
        this.stateSearchOption.defaultValue = address?.stateDetails?.stateName || address?.state;
        this.stateSearchOption.params.countryCode = address?.countryCode;
        this.canEmitStateSearchText = this._commonService?.canAllowStateFreeText(address?.countryCode);
        this.additionalAddressObj.city = address?.city;
        this.additionalAddressObj.state = address?.state;
        this.additionalAddressObj.postCode = address.postCode;
    }

    editIndustry() {
        this.entityMandatoryValidation();
        if (!this.mandatoryList.size && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._entityOverviewService.updateAdditionalAddresses(this.additionalAddressObj).subscribe((res: any) => {
                this.updateAndArrangeData();
                this._dataStorService.enableModificationHistoryTracking();
                this.updateDataStore();
                this.clearAdditionalAddress();
                this.isSaving = false;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Additional address updated successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isSaving = false;
            }));
        }
    }

    private updateAndArrangeData(): void {
        const UPDATED_ADDRESS = this.additionalAddresses.splice(this.isEditIndex, 1)[0];
        UPDATED_ADDRESS.addressTypeCode = this.additionalAddressObj.addressTypeCode;
        UPDATED_ADDRESS.addressLine1 = this.additionalAddressObj.addressLine1;
        UPDATED_ADDRESS.addressLine2 = this.additionalAddressObj.addressLine2;
        UPDATED_ADDRESS.countryCode = this.additionalAddressObj.countryCode;
        UPDATED_ADDRESS.country = this.selectedCountry;
        UPDATED_ADDRESS.stateDetails = this.selectedState;
        UPDATED_ADDRESS.entityAddressType = this.selectAddressType;
        UPDATED_ADDRESS.city = this.additionalAddressObj.city;
        UPDATED_ADDRESS.state = this.additionalAddressObj.state;
        UPDATED_ADDRESS.postCode = this.additionalAddressObj.postCode;
        UPDATED_ADDRESS.isCopy = false;
        this.additionalAddresses.unshift(UPDATED_ADDRESS);
    }

    postConfirmation(modalAction: ModalActionEvent) {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.deleteAddress();
        } else {
            this.clearAdditionalAddress();
        }
        closeCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    deleteAddress() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._entityOverviewService.deleteAdditionalAddress(this.deletePrimaryKey).subscribe((res: any) => {
                this.additionalAddresses.splice(this.isEditIndex, 1);
                this._dataStorService.enableModificationHistoryTracking();
                this.updateDataStore();
                this.clearAdditionalAddress();
                this.isSaving = false;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Additional address deleted successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isSaving = false;
            }));
        }
    }

    updateDataStore() {
        this._dataStorService.updateStore(['entityMailingAddresses'], {'entityMailingAddresses': this.additionalAddresses});
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    checkUserHasRight(): void {
        const hasRight = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME') && this._dataStorService.getOverviewEditRight(ADDITIONAL_ADDRESS.sectionId);
        if (!hasRight) {
            this.isEditMode = false;
        }
    }

}
