import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataStoreEvent, EntireEntityDetails, EntityDetails, EntitySponsor, EntityTabStatus, SponsorDetails, SponsorFields, SponsorType, SponsorUpdateClass } from '../../shared/entity-interface';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { interval, Subject, Subscription } from 'rxjs';
import { AutoSaveEvent, AutoSaveService } from '../../../common/services/auto-save.service';
import { canUpdateSponsorFeed, EntityManagementService } from '../../entity-management.service';
import { EntitySponsorService } from '../entity-sponsor.service';
import { CommonService } from '../../../common/services/common.service';
import { debounce } from 'rxjs/operators';
import { ENTITY_VERIFICATION_STATUS, AUTO_SAVE_DEBOUNCE_TIME } from '../../../app-constants';
import { COUNTRY_CODE_FOR_MANDATORY_CHECK, ENTITY_ADDRESS_FIELDS, ENTITY_SPONSOR_MANDATORY_DEFAULT_FIELD, ENTITY_SPONSOR_MANDATORY_SPECIFIC_FIELD, SPONSOR_DETAILS } from '../../shared/entity-constants';
import { closeCommonModal, deepCloneObject, inputRestrictionForNumberField, isEmptyObject, isValidEmailAddress, openCommonModal, phoneNumberValidation } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { Country, LookUpClass, State } from '../../../common/services/coi-common.interface';
import { getEndPointOptionsForCountry } from '../../../../../../fibi/src/app/common/services/end-point.config';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { getEndPointOptionsForStates } from '../../../common/services/end-point.config';
import { EndPointOptions } from '../../../shared-components/shared-interface';
import { SearchLengthValidatorOptions } from '../../../shared/common.interface';

@Component({
    selector: 'app-entity-sponsor-details',
    templateUrl: './entity-sponsor-details.component.html',
    styleUrls: ['./entity-sponsor-details.component.scss']
})
export class EntitySponsorDetailsComponent implements OnInit, OnDestroy {

    @Input() sectionName = '';
    @Input() sectionId: string | number = '';

    entityDetails = new EntityDetails();
    $subscriptions: Subscription[] = [];
    $debounceEvent = new Subject<any>();
    isEditMode = false;
    entityTabStatus = new EntityTabStatus();
    selectedSponsorType: SponsorType = { code: null, description: '' };
    sponsorUpdateObj = new SponsorUpdateClass();
    changeDetectionObj: Partial<Record<keyof SponsorFields, boolean>> = {};
    isSaving = false;
    isShowCommentButton = false;
    commentCount = 0;
    sponsorTypeLookup: LookUpClass[] = [];
    countrySearchOptions: EndPointOptions = {};
    stateSearchOptions: EndPointOptions = {};
    clearCountryField = new String('false');
    clearStateField = new String('false');
    selectedCountry: Country | null = null;
    selectedState: State | null = null;
    mandatoryList = new Map();
    CONFIRMATION_MODAL_ID = 'coi-entity-sponsor-confirm-modal';
    modalConfig = new CommonModalConfig(this.CONFIRMATION_MODAL_ID, 'Yes', 'No', 'lg');
    copyConfirmModalInfo = `This action will overwrite the following sponsor details with the corresponding entity details: Sponsor Name, Country, Sponsor Address, Phone Number, Email Address, DUNS Number, UEI Number, and CAGE Number.`;
    canEmitStateSearchText = false;
    stateSearchLimiterOptions = new SearchLengthValidatorOptions();

    constructor(private _dataStoreService: EntityDataStoreService,
        private _autoSaveService: AutoSaveService,
        public entitySponsorService: EntitySponsorService,
        public commonService: CommonService,
        public entityManagementService: EntityManagementService
    ) { }

    ngOnInit(): void {
        this.getSponsorTypeLookup();
        this.triggerSingleSave();
        this.autoSaveSubscribe();
        this.listenDataChangeFromStore();
        this.getDataFromStore();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(SPONSOR_DETAILS);
        this.getValuesFromService(deepCloneObject(this.entitySponsorService.entitySponsorDetails?.sponsorDetailsResponseDTO));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private triggerSingleSave(): void {
        this.$subscriptions.push(this.$debounceEvent.pipe(debounce(() => interval(AUTO_SAVE_DEBOUNCE_TIME))).subscribe((data: any) => {
            if (data) {
                this._autoSaveService.commonSaveTrigger$.next({ action: 'SAVE' });
            }
        }));
    }

    private autoSaveSubscribe(): void {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe((event: AutoSaveEvent) => {
            this.autoSaveAPI();
        }));
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private async getSponsorTypeLookup(): Promise<void> {
        this.sponsorTypeLookup = await this.commonService.getOrFetchLookup('SPONSOR_TYPE', 'SPONSOR_TYPE_CODE');
    }

    private getValuesFromService(sponsorDetails: SponsorDetails): void {
        if (sponsorDetails?.sponsorType?.code) {
            this.selectedSponsorType = { code: sponsorDetails?.sponsorType?.code || null, description: sponsorDetails?.sponsorType?.description || '' };
            this.sponsorUpdateObj.entitySponsorFields.sponsorCode = sponsorDetails?.sponsorType?.code;
        }
        const FIELDS_TO_COPY = [
            'acronym', 'sponsorCode', 'phoneNumber', 'emailAddress', 'postCode', 'countryCode',
            'primaryAddressLine1', 'primaryAddressLine2', 'cageNumber', 'ueiNumber',
            'dunsNumber', 'translatedName', 'comments', 'sponsorName', 'state',
            'city', 'isCopy'
        ];
        FIELDS_TO_COPY.forEach(field => {
            this.sponsorUpdateObj.entitySponsorFields[field] = sponsorDetails?.[field];
        });
        this.selectedCountry = sponsorDetails?.country;
        this.selectedState = sponsorDetails?.stateDetails;
        this.countrySearchOptions = getEndPointOptionsForCountry(this.commonService.fibiUrl);
        this.countrySearchOptions.defaultValue = sponsorDetails?.country?.countryName;
        this.stateSearchOptions= getEndPointOptionsForStates(this.commonService.fibiUrl);
        this.stateSearchOptions.defaultValue = sponsorDetails?.stateDetails?.stateName || sponsorDetails?.state;
        this.stateSearchOptions.params.countryCode = sponsorDetails?.countryCode || '';
        this.canEmitStateSearchText = this.commonService?.canAllowStateFreeText(sponsorDetails?.countryCode);
        this.setStateSearchLimiter();
    }

    private setStateSearchLimiter(): void {
        this.stateSearchLimiterOptions.isShowLimiter = true;
        this.stateSearchLimiterOptions.limit = 30;
        this.stateSearchLimiterOptions.limiterStyle = 'position-absolute end-0 float-end word-count';
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA?.entityDetails;
        this.entityTabStatus = ENTITY_DATA?.entityTabStatus;
        this.commentCount = ENTITY_DATA.commentCountList?.[SPONSOR_DETAILS.sectionTypeCode] || 0;
        this.checkUserHasRight();
        if (!this.isEditMode) {
            this.mandatoryList.clear()
        }
    }

    private checkUserHasRight(): void {
        this.isEditMode = this._dataStoreService.getEditMode() && this.commonService.getAvailableRight(['MANAGE_ENTITY_SPONSOR'], 'SOME');
    }

    private autoSaveAPI(): void {
        if (!this.isSaving) {
            const TEMP_AUTO_SAVE_RO: SponsorUpdateClass = deepCloneObject(this.getAutoSaveRO());
            this.addFeedStatusInRO(TEMP_AUTO_SAVE_RO);
            if (isEmptyObject(TEMP_AUTO_SAVE_RO) || isEmptyObject(TEMP_AUTO_SAVE_RO.entitySponsorFields)) {
                return;
            }
            if (this.changeDetectionObj['isCopy'] && this.sponsorUpdateObj?.entitySponsorFields?.isCopy) {
                TEMP_AUTO_SAVE_RO.entitySponsorFields = { isCopy: true };
                this.syncSponsorWithEntity(TEMP_AUTO_SAVE_RO);
            } else if (!this.entitySponsorService.entitySponsorDetails?.sponsorDetailsResponseDTO?.id) {
                this.saveSponsorDetails(TEMP_AUTO_SAVE_RO);
            } else {
                this.updateSponsorDetails(TEMP_AUTO_SAVE_RO);
            }
        }
    }

    private getAutoSaveRO(): SponsorUpdateClass {
        const AUTO_SAVE_PAYLOAD = new SponsorUpdateClass();
        AUTO_SAVE_PAYLOAD.entityId = this.entityDetails.entityId;
        Object.keys(this.changeDetectionObj).forEach((ele) => {
            const IS_VALID_EMAIL = ele === 'emailAddress' && this.sponsorUpdateObj?.entitySponsorFields?.emailAddress && !isValidEmailAddress(this.sponsorUpdateObj.entitySponsorFields?.emailAddress);
            const IS_VALID_PHONE_NUMBER = ele === 'phoneNumber' && this.sponsorUpdateObj?.entitySponsorFields?.phoneNumber && phoneNumberValidation(this.sponsorUpdateObj?.entitySponsorFields?.phoneNumber);
            if (this.changeDetectionObj[ele] && !IS_VALID_EMAIL && !IS_VALID_PHONE_NUMBER) {
                const VALUE = this.sponsorUpdateObj?.entitySponsorFields[ele];
                // Assigns a trimmed string value or null if empty; for non-strings, assigns the value or null if it's undefined or null.
                AUTO_SAVE_PAYLOAD.entitySponsorFields[ele] = typeof VALUE === 'string' ? VALUE.trim() || null : VALUE ?? null;
                if(!AUTO_SAVE_PAYLOAD.isChangeInAddress) {
                    AUTO_SAVE_PAYLOAD.isChangeInAddress = ENTITY_ADDRESS_FIELDS.includes(ele);
                }
            }
        });
        return AUTO_SAVE_PAYLOAD;
    }

    changeEvent(key: string): void {
        this.commonService.setChangesAvailable(true);
        this.changeDetectionObj[key] = true;
        this.$debounceEvent.next(key);
    }

    private saveSponsorDetails(autoSaveReaObj: SponsorUpdateClass): void {
        this.commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveReaObj.entitySponsorFields, false);
        this.isSaving = true;
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.entitySponsorService.sponsorDetailsAutoSave(autoSaveReaObj)
                .subscribe((data: any) => {
                    this.entitySponsorService.entitySponsorDetails.sponsorDetailsResponseDTO ??= new SponsorDetails();
                    this.entitySponsorService.entitySponsorDetails.sponsorDetailsResponseDTO.entityId = this.entityDetails.entityId;
                    this.entitySponsorService.entitySponsorDetails.sponsorDetailsResponseDTO.id = data?.id;
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

    private addFeedStatusInRO(autoSaveReqObj: SponsorUpdateClass): void {
        if (this.canUpdateFeed(autoSaveReqObj.entitySponsorFields)) {
            autoSaveReqObj.entitySponsorFields.feedStatusCode = '2';
        }
    }

    private canUpdateFeed(entitySponsorFields: SponsorFields): boolean {
        return (this.entityDetails.entityStatusTypeCode === ENTITY_VERIFICATION_STATUS.VERIFIED && canUpdateSponsorFeed(entitySponsorFields)
            && (entitySponsorFields.sponsorTypeCode || this.entitySponsorService?.entitySponsorDetails?.sponsorDetailsResponseDTO?.sponsorType?.code));
    }

    private updateSponsorDetails(autoSaveReaObj: SponsorUpdateClass): void {
        this.commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveReaObj.entitySponsorFields, false);
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.entitySponsorService.updateSponsorDetails(autoSaveReaObj)
                .subscribe((data: any) => {
                    this.handleAPISuccess(autoSaveReaObj);
                }, (_error: any) => {
                    this.handleAPIError(autoSaveReaObj);
                })
        );
        this.commonService.removeLoaderRestriction();
    }

    private handleAPISuccess(autoSaveReqObj: SponsorUpdateClass): void {
        this._dataStoreService.enableModificationHistoryTracking();
        this.setServiceVariable(autoSaveReqObj.entitySponsorFields);
        this.updateCompletionFlag();
        this.updateEntireFeed(autoSaveReqObj);
        const HAS_TRUE_VALUE = Object.values(this.changeDetectionObj).some(value => value);
        this.commonService.setChangesAvailable(HAS_TRUE_VALUE);
        this.commonService.hideAutoSaveSpinner('SUCCESS');
    }

    private setServiceVariable(entitySponsorFields: SponsorFields): void {
        const SUB_AWARD_DTO = this.entitySponsorService?.entitySponsorDetails?.sponsorDetailsResponseDTO ?? new SponsorDetails();
        SUB_AWARD_DTO.sponsorType ??= new SponsorType();
        Object.entries(entitySponsorFields).forEach(([key, value]) => {
            switch(key) {
                case 'sponsorTypeCode':
                    SUB_AWARD_DTO.sponsorType.code = value;
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

    private handleAPIError(autoSaveReqObj: SponsorUpdateClass): void {
        this.setChangesObject(autoSaveReqObj.entitySponsorFields, true);
        this.commonService.isShowLoader.next(false);
        this.commonService.hideAutoSaveSpinner('ERROR');
    }

    private updateCompletionFlag(): void {
        const SPONSOR_DETAILS =  this.entitySponsorService?.entitySponsorDetails?.sponsorDetailsResponseDTO;
        const IS_MANDATORY_REQUIRED = (COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(SPONSOR_DETAILS.country?.countryCode) || COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(SPONSOR_DETAILS.country?.countryTwoCode));
        const ENTITY_CONFIRM_VALIDATION_FIELDS = IS_MANDATORY_REQUIRED ? ENTITY_SPONSOR_MANDATORY_SPECIFIC_FIELD : ENTITY_SPONSOR_MANDATORY_DEFAULT_FIELD;
        const IS_TAB_STATUS_ACTIVE = ENTITY_CONFIRM_VALIDATION_FIELDS.every(field => {
            return field === 'sponsorTypeCode'
                ? !!SPONSOR_DETAILS?.sponsorType?.code
                : !!SPONSOR_DETAILS?.[field];
        });
        this.entityTabStatus.entity_sponsor_info = IS_TAB_STATUS_ACTIVE;
        this._dataStoreService.updateStore(['entityTabStatus'], { 'entityTabStatus': this.entityTabStatus });
    }

    private setChangesObject(autoSaveReqObj: SponsorFields, isChangesAvailable: boolean): void {
        Object.keys(autoSaveReqObj).forEach((ele) => {
            this.changeDetectionObj[ele] = isChangesAvailable;
        });
    }

    private updateEntireFeed(autoSaveReqObj: SponsorUpdateClass): void {
        if (this.canUpdateFeed(autoSaveReqObj.entitySponsorFields)) {
            this._dataStoreService.updateFeedStatus(this.entityTabStatus, 'SPONSOR');
        }
    }

    private syncSponsorWithEntity(autoSaveReaObj: SponsorUpdateClass): void {
        this.commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveReaObj.entitySponsorFields, false);
        this.isSaving = true;
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.entitySponsorService.syncSponsorWithEntity(this.entityDetails?.entityId)
                .subscribe((data: EntitySponsor) => {
                    this.entitySponsorService.entitySponsorDetails = data;
                    this.getValuesFromService(deepCloneObject(this.entitySponsorService.entitySponsorDetails?.sponsorDetailsResponseDTO));
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
        this.sponsorUpdateObj.entitySponsorFields.state = null;
        this.sponsorUpdateObj.entitySponsorFields.stateDetails = null;
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

    onSponsorTypeSelect(sponsorTypeCode: string | number): void {
        this.sponsorUpdateObj.entitySponsorFields.sponsorTypeCode = sponsorTypeCode || null;
        const SELECTED_SPONSOR = this.sponsorTypeLookup?.find(data => data?.code === sponsorTypeCode);
        this.selectedSponsorType.description = SELECTED_SPONSOR?.description;
        this.changeEvent('sponsorTypeCode');
    }

    openReviewComments(): void {
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: SPONSOR_DETAILS.commentTypeCode,
            sectionTypeCode: SPONSOR_DETAILS.sectionTypeCode
        });
    }

    selectedCountryEvent(event: any, hasClearState = true): void {
        if (event) {
            this.stateSearchOptions.params.countryCode = event.countryCode;
            this.canEmitStateSearchText = this.commonService?.canAllowStateFreeText(event.countryCode);
        } else {
            delete this.stateSearchOptions?.params?.countryCode;
        }
        this.sponsorUpdateObj.entitySponsorFields.countryCode = event?.countryCode || null;
        this.selectedCountry = event || null
        this.changeEntityCopyEvent('countryCode');
        if (this.sponsorUpdateObj?.entitySponsorFields?.state) {
            this.changeEntityCopyEvent('state');
        }
        hasClearState && this.clearStateFieldValue();
    }

    selectedStateEvent(event: State | null): void {
        if(event) {
                this.sponsorUpdateObj.entitySponsorFields.stateCode = event.stateCode;
                this.sponsorUpdateObj.entitySponsorFields.state = event.stateCode || event.value;
                this.sponsorUpdateObj.entitySponsorFields.stateDetails = event;
                this.selectedState = event;
                this.changeEntityCopyEvent('state');
                this.setCountryField(event.country);
        } else {
            this.sponsorUpdateObj.entitySponsorFields.stateCode = '';
            this.sponsorUpdateObj.entitySponsorFields.state = '';
            this.sponsorUpdateObj.entitySponsorFields.stateDetails = null;
            this.changeEntityCopyEvent('state');
        }
    }

    changeEntityCopyEvent(key: string): void {
        this.sponsorUpdateObj.entitySponsorFields.isCopy = false;
        this.changeEvent('isCopy');
        this.changeEvent(key);
    }

    validateEmail(): void {
        const KEY = 'emailAddress';
        this.clearValidation(KEY);
        this.changeDetectionObj[KEY] = true;
        if (this.sponsorUpdateObj.entitySponsorFields?.emailAddress && !isValidEmailAddress(this.sponsorUpdateObj.entitySponsorFields?.emailAddress)) {
            this.commonService.setChangesAvailable(true);
            this.mandatoryList.set(KEY, 'Please enter valid email address.');
        } else {
            this.changeEvent(KEY);
        }
    }

    validateAndAddPhoneNumber(): void {
        const KEY = 'phoneNumber';
        this.clearValidation(KEY);
        this.changeDetectionObj[KEY] = true;
        if (this.sponsorUpdateObj?.entitySponsorFields?.phoneNumber && phoneNumberValidation(this.sponsorUpdateObj?.entitySponsorFields?.phoneNumber)) {
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

    copyEntityDetailsToSponsor(): void {
        if (this.sponsorUpdateObj?.entitySponsorFields?.isCopy) {
            openCommonModal(this.CONFIRMATION_MODAL_ID);
        } else {
            this.changeEvent('isCopy');
        }
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction?.action === 'PRIMARY_BTN') {
            this.changeEvent('isCopy');
        } else {
            this.sponsorUpdateObj.entitySponsorFields.isCopy = false;
        }
        closeCommonModal(this.CONFIRMATION_MODAL_ID);
    }

}
