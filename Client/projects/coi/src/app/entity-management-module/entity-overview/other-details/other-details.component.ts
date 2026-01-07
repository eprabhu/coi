import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataStoreEvent, EntityDetails, EntityTabStatus, OtherDetailsClass, OtherDetailsUpdate } from '../../shared/entity-interface';
import { getInvalidDateFormatMessage, getDateObjectFromTimeStamp, isValidDateFormat, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { CommonService } from '../../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, DATE_PLACEHOLDER, ENTITY_VERIFICATION_STATUS, HTTP_ERROR_STATUS, AUTO_SAVE_DEBOUNCE_TIME, DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { forkJoin, interval, Subject, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { EntityOverviewService } from '../entity-overview.service';
import { AutoSaveEvent, AutoSaveService } from '../../../common/services/auto-save.service';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, deepCloneObject, hideModal, inputRestrictionForNumberField, isEmptyObject, openCommonModal } from '../../../common/utilities/custom-utilities';
import { OTHER_DETAILS } from '../../shared/entity-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { LookUpClass } from '../../../common/services/coi-common.interface';
@Component({
    selector: 'app-other-details',
    templateUrl: './other-details.component.html',
    styleUrls: ['./other-details.component.scss']
})
export class OtherDetailsComponent implements OnInit, OnDestroy {

    @ViewChild('startDateInput', { static: false }) startDateInput?: ElementRef;
    @ViewChild('incorporateDateInput', { static: false }) incorporateDateInput?: ElementRef;

    entityForeignName: string;
    entityPriorName: string;
    startDate: any;
    incorporationDate: any;
    datePlaceHolder = DATE_PLACEHOLDER;
    $debounceEvent = new Subject<string>();
    $subscriptions: Subscription[] = [];
    entityDetails: EntityDetails = new EntityDetails();
    priorNames: any = [];
    foreignNames: any = [];
    coiCurrencyList: any = [];
    BUSINESS_TYPE_OPTIONS = 'entity_business_type#BUSINESS_TYPE_CODE#false#false';
    CONFIRMATIN_MODAL_ID = 'other-details-delete-confirm-modal';
    selectedCurrencyCode: number | string = null;
    selectedBusinessTypeList = [];
    isSavingForAutoSave = false;
    isSavingForForeign = false;
    isSavingForPrior = false;
    modalConfig = new CommonModalConfig(this.CONFIRMATIN_MODAL_ID, 'Delete', 'Cancel');
    deleteForgeinNameObj = null;
    isEditIndex: null | number = null; //updateIndex
    isEditMode = false;
    isShowForeignName = false;
    deletePriorNameObj = null;
    entityTabStatus: EntityTabStatus = new EntityTabStatus();
    otherDetailsObj: OtherDetailsUpdate = new OtherDetailsUpdate();
    changeDetectionObj = new OtherDetailsClass();
    OTHER_DETAILS = OTHER_DETAILS;
    isDunsViewMode = false;
    businessTypeLookup = null;
    dateValidationMap = new Map();

    constructor(public commonService: CommonService, private _entityOverviewService: EntityOverviewService,
        public dataStore: EntityDataStoreService, private _autoSaveService: AutoSaveService) {
            this.getBusinessTypeLookup();
         }

    ngOnInit() {
        this.getCurrencyList();
        this.triggerSingleSave();
        this.getDataFromStore(true);
        this.autoSaveSubscribe();
        this.listenDataChangeFromStore();
    }

    private getCurrencyList(): void {
        this.$subscriptions.push(this._entityOverviewService.fetchCurrencyDetails().subscribe((data: any) => {
            if (data?.length) {
                this.coiCurrencyList = data.map(ele => {
                    const LOOKUP = new LookUpClass();
                    LOOKUP.code = ele.currencyCode;
                    LOOKUP.description = ele.currency + '(' + ele.currencyCode + ')';
                    return LOOKUP;
                });
            }
        }));
    }

    private triggerSingleSave(): void {
        this.$subscriptions.push(this.$debounceEvent.pipe(debounce(() => interval(AUTO_SAVE_DEBOUNCE_TIME))).subscribe((data: any) => {
            if (data) {
                this._autoSaveService.commonSaveTrigger$.next({ action: 'SAVE' });
            }
        }
        ));
    }

    private autoSaveSubscribe(): void {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe((event: AutoSaveEvent) => this.addOtherDetailsAPI()));
    }

    private getDataFromStore(canUpdateOtherDetails: boolean = false): void {
        const ENTITY_DATA = this.dataStore.getData();
        if (!ENTITY_DATA || isEmptyObject(ENTITY_DATA)) {
            return;
        }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.priorNames = ENTITY_DATA.priorNames;
        this.foreignNames = ENTITY_DATA.foreignNames;
        this.entityTabStatus = ENTITY_DATA.entityTabStatus;
        this.isDunsViewMode = this.dataStore.checkDunsMatchedForSelectedVersion();
        this.checkUserHasRight();
        if(canUpdateOtherDetails) {
            this.updateSelectedLookupList();
            this.setOtherDetailsObject();
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this.dataStore.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore(dependencies.action === 'REFRESH');
            })
        );
    }

    private updateSelectedLookupList(): void {
        this.selectedBusinessTypeList = [];
        this.selectedCurrencyCode = this.entityDetails?.currencyCode || null ;
        if (this.entityDetails?.businessTypeCode) {
            this.selectedBusinessTypeList.push({ code: this.entityDetails?.entityBusinessType?.businessTypeCode, description: this.entityDetails?.entityBusinessType?.description });
        }
    }

    private setOtherDetailsObject(): void {
        if (!this.entityDetails) {
            return;
        }
        Object.keys(this.entityDetails).forEach(key => {
            this.otherDetailsObj.otherDetailsRequestFields[key] = this.entityDetails[key];
        });
        this.startDate = getDateObjectFromTimeStamp(this.entityDetails.startDate);
        this.incorporationDate = getDateObjectFromTimeStamp(this.entityDetails.incorporationDate);
    }

    private checkUserHasRight(): void {
        this.isEditMode = this.dataStore.getEditMode() && this.commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME') &&
            this.dataStore.getOverviewEditRight(OTHER_DETAILS.sectionId);
        this.clearValidationsOnViewMode();
    }

    private clearValidationsOnViewMode(): void {
        if (!this.isEditMode) {
            this.dateValidationMap.clear();
        }
    }

    onCurrencyLookupSelect(currencyCode: string | number): void {
        this.otherDetailsObj.otherDetailsRequestFields.currencyCode = currencyCode || null;
        this.changeEvent('currencyCode');
    }

    changeEvent(key: string): void {
        this.commonService.setChangesAvailable(true);
        this.changeDetectionObj[key] = true;
        this.$debounceEvent.next(key);
    }

    private getAutoSaveRO(): OtherDetailsUpdate {
        const AUTO_SAVE_PAYLOAD = new OtherDetailsUpdate();
        AUTO_SAVE_PAYLOAD.entityId = this.entityDetails.entityId;
        Object.keys(this.changeDetectionObj).forEach((ele) => {
            if (this.changeDetectionObj[ele]) {
                const VALUE = this.otherDetailsObj.otherDetailsRequestFields[ele];
                AUTO_SAVE_PAYLOAD.otherDetailsRequestFields[ele] = typeof VALUE === 'string' ? (VALUE?.trim() || null) : VALUE;
            }
        });
        return AUTO_SAVE_PAYLOAD;
    }

    private addOtherDetailsAPI(): void {
            const TEMP_AUTO_SAVE_RO: OtherDetailsUpdate = deepCloneObject(this.getAutoSaveRO());
            if (isEmptyObject(TEMP_AUTO_SAVE_RO) || isEmptyObject(TEMP_AUTO_SAVE_RO.otherDetailsRequestFields)) {
                return;
            }
            this.commonService.showAutoSaveSpinner();
            this.setChangesObject(TEMP_AUTO_SAVE_RO.otherDetailsRequestFields, false);
            this.commonService.setLoaderRestriction();
            this.$subscriptions.push(this._entityOverviewService.updateOtherDetails(TEMP_AUTO_SAVE_RO).subscribe((data) => {
                this.handleAPISuccess(TEMP_AUTO_SAVE_RO);
            }, err => {
                this.setChangesObject(TEMP_AUTO_SAVE_RO.otherDetailsRequestFields, true);
                this.commonService.isShowLoader.next(false);
                this.commonService.hideAutoSaveSpinner('ERROR');
            }));
            this.commonService.removeLoaderRestriction();
    }

    private handleAPISuccess(autoSaveReqObj: OtherDetailsUpdate): void {
        this.dataStore.enableModificationHistoryTracking();
        this.updateSponsorOrgFeed(this.entityDetails?.entityId, autoSaveReqObj);
        this.updateStoreData(autoSaveReqObj.otherDetailsRequestFields);
        this.commonService.setChangesAvailable(false);
        this.commonService.hideAutoSaveSpinner('SUCCESS');
    }

    private updateStoreData(otherDetailsRequestFields: OtherDetailsClass): void {
        if (!isEmptyObject(otherDetailsRequestFields)) {
            Object.keys(otherDetailsRequestFields).forEach((ele) => {
                this.entityDetails[ele] = otherDetailsRequestFields[ele];
            });
            if (otherDetailsRequestFields.businessTypeCode) {
                this.entityDetails.entityBusinessType = {
                    businessTypeCode: this.selectedBusinessTypeList[0]?.code,
                    description: this.selectedBusinessTypeList[0]?.description
                };
            }
            this.dataStore.updateStore(['entityDetails'], { 'entityDetails': this.entityDetails });
        }
    }

    private setChangesObject(autoSaveReqObj: OtherDetailsClass, isChangesAvailable: boolean): void {
        Object.keys(autoSaveReqObj).forEach((ele) => {
            this.changeDetectionObj[ele] = isChangesAvailable;
        });
    }

    private updateSponsorOrgFeed(entityId: any, reqObj: OtherDetailsUpdate): void {
        const FEED_API_CALLS = this.dataStore.getApiCalls(entityId, reqObj);
        if (FEED_API_CALLS.length && this.entityDetails.entityStatusType.entityStatusTypeCode == ENTITY_VERIFICATION_STATUS.VERIFIED) {
            this.$subscriptions.push(forkJoin(FEED_API_CALLS).subscribe((data: [] = []) => {
                this.dataStore.updateFeedStatus(this.entityTabStatus, 'BOTH');
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in updating feed status.');
            }
            ));
        }
    }

    checkForValidNumber(event: any): void {
        if (inputRestrictionForNumberField(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
    }

    private updatePriorName(): void {
        if (!this.isSavingForPrior) {
            this.isSavingForPrior = true;
            this.commonService.showAutoSaveSpinner();
            this.commonService.setLoaderRestriction();
            this.$subscriptions.push(this._entityOverviewService.updatePrioirNameDetails({
                'entityId': this.entityDetails?.entityId,
                'priorName': this.entityPriorName
            }).subscribe((data: any) => {
                this.priorNames.unshift({ 'priorNames': this.entityPriorName, 'id': data.id });
                this.updatePriorOrForeignName('priorNames');
            }, err => {
                this.isSavingForPrior = false;
                this.commonService.hideAutoSaveSpinner('ERROR');
            }));
        }
        this.commonService.removeLoaderRestriction();
    }

    private updateAlternateName(): void {
        if (!this.isSavingForForeign) {
            this.isSavingForForeign = true;
            this.commonService.showAutoSaveSpinner();
            this.commonService.setLoaderRestriction();
            this.$subscriptions.push(this._entityOverviewService.updateAlternateNameDetails({
                'entityId': this.entityDetails?.entityId,
                'foreignName': this.entityForeignName
            }).subscribe((data: any) => {
                this.foreignNames.unshift({ 'foreignName': this.entityForeignName, 'id': data.id });
                this.updatePriorOrForeignName('foreignNames');
            }, err => {
                this.isSavingForForeign = false;
                this.commonService.hideAutoSaveSpinner('ERROR');
            }));
            this.commonService.removeLoaderRestriction();
        }
    }

    private updatePriorOrForeignName(type: 'priorNames' | 'foreignNames'): void {
        if (type === 'priorNames') {
            this.entityPriorName = '';
            this.isSavingForPrior = false;
        } else if (type === 'foreignNames') {
            this.entityForeignName = '';
            this.isSavingForForeign = false;
        }
        this.dataStore.enableModificationHistoryTracking();
        this.dataStore.updateStore([type], { [type]: this[type] });
        this.commonService.hideAutoSaveSpinner('SUCCESS');
        this.commonService.setChangesAvailable(false);
    }

    addEntityName(name: 'FOREIGN' | 'PRIOR'): void {
        if (name === 'PRIOR') {
            this.entityPriorName = this.entityPriorName?.trim();
            if (!this.entityPriorName) { return; }
            this.updatePriorName();
        } else if (name === 'FOREIGN') {
            this.entityForeignName = this.entityForeignName?.trim();
            if (!this.entityForeignName) { return; }
            this.updateAlternateName();
        }
    }

    deleteEntityForeignName(foreignName: string, index: number): void {
        this.isEditIndex = index;
        this.deleteForgeinNameObj = foreignName;
        openCommonModal(this.CONFIRMATIN_MODAL_ID);
    }

    confirmPriorNameDelete(priorName: string, index: number): void {
        this.deletePriorNameObj = priorName;
        this.isEditIndex = index;
        hideModal('entityPriorNameVersionModal');
        openCommonModal(this.CONFIRMATIN_MODAL_ID);
    }

    onDateSelect(dateType: 'incorporationDate' | 'startDate'): void {
        this.commonService.setChangesAvailable(true);
        const SELECTED_DATE = dateType === 'incorporationDate' ? this.incorporationDate : this.startDate;
        this.otherDetailsObj.otherDetailsRequestFields[dateType] = parseDateWithoutTimestamp(SELECTED_DATE);
        this.changeEvent(dateType);
    }

    onBusinessTypeSelect(typeCode: string): void {
        if (typeCode) {
            this.selectedBusinessTypeList[0] = this.businessTypeLookup.find(data => data.code === typeCode);
        } else {
            this.selectedBusinessTypeList = [];
        }
        this.otherDetailsObj.otherDetailsRequestFields.businessTypeCode = typeCode || null;
        this.changeEvent('businessTypeCode');
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            if (this.deletePriorNameObj) {
                this.deletePriorName();
            } else {
                this.deleteForeignName();
            }
        } else {
            closeCommonModal(this.CONFIRMATIN_MODAL_ID);
            setTimeout(() => {
                this.deleteForgeinNameObj = null;
                this.deletePriorNameObj = null;
                this.isEditIndex = null;
            });
        }
    }

    private deleteForeignName(): void {
        this.commonService.showAutoSaveSpinner();
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(this._entityOverviewService.deleteForeignName(this.deleteForgeinNameObj.id).subscribe((res: any) => {
            this.foreignNames.splice(this.isEditIndex, 1);
            this.handleApiResponse('foreignNames', 'SUCCESS');
        }, err => {
            this.handleApiResponse('foreignNames', 'ERROR');
        }));
        this.commonService.removeLoaderRestriction();
    }

    private deletePriorName(): void {
        this.commonService.showAutoSaveSpinner();
        this.commonService.setLoaderRestriction();
        this.$subscriptions.push(this._entityOverviewService.deletePriorName(this.deletePriorNameObj.id).subscribe((res: any) => {
            this.priorNames.splice(this.isEditIndex, 1);
            this.handleApiResponse('priorNames', 'SUCCESS');
        }, err => {
            this.handleApiResponse('priorNames', 'ERROR');
        }));
        this.commonService.removeLoaderRestriction();
    }

    private handleApiResponse(type: 'priorNames' | 'foreignNames', status: 'SUCCESS' | 'ERROR'): void {
        if (status === 'SUCCESS') {
            this.commonService.hideAutoSaveSpinner('SUCCESS');
            this.dataStore.updateStore([type], { [type]: this[type] });
            closeCommonModal(this.CONFIRMATIN_MODAL_ID);
            type === 'foreignNames' ? this.deleteForgeinNameObj = null : this.deletePriorNameObj = null;
            this.isEditIndex = null;
        } else {
            setTimeout(() => {
                if (!this.commonService.loaderRestrictedUrls.length) {
                    this.commonService.autoSaveSavingSpinner = 'HIDE';
                }
            });
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
    
    private async getBusinessTypeLookup(): Promise<void> {
        this.businessTypeLookup = await this.commonService.getOrFetchLookup('ENTITY_BUSINESS_TYPE', 'BUSINESS_TYPE_CODE');
    }

    validateDateFormat(fieldName: 'startDate' | 'incorporationDate'): void {
        const INPUT_DATE_FIELD = fieldName === 'startDate' ? this.startDateInput : this.incorporateDateInput;
        if (!INPUT_DATE_FIELD) return;
        this.dateValidationMap.delete(fieldName);
        const DATE_VALUE = INPUT_DATE_FIELD.nativeElement.value?.trim();
        const ERROR_MESSAGE = getInvalidDateFormatMessage(DATE_VALUE);
        if (ERROR_MESSAGE) {
            this.dateValidationMap.set(fieldName, ERROR_MESSAGE);
        }
    }
}
