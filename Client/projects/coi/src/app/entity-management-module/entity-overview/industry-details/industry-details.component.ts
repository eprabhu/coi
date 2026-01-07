import { forkJoin, Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityOverviewService } from '../entity-overview.service';
import { CommonService } from '../../../common/services/common.service';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { INDUSTRY_CATEGORY_DESCRIPTION_FORMAT, INDUSTRY_CATEGORY_TYPE_FORMAT, INDUSTRY_CATEGORY_TYPE_SOURCE, INDUSTRY_DETAILS } from '../../shared/entity-constants';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { DataStoreEvent, EntityIndustryClassifications, IndustryCategoryDescription, IndustryCategoryType, IndustryCategoryTypeSource, IndustryDetails } from '../../shared/entity-interface';
import { closeCommonModal, deepCloneObject, getCodeDescriptionFormat, hideModal, isEmptyObject, openCommonModal, openModal } from '../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-industry-details',
  templateUrl: './industry-details.component.html',
  styleUrls: ['./industry-details.component.scss']
})
export class IndustryDetailsComponent implements OnInit, OnDestroy {

    industryDetails: IndustryDetails = new IndustryDetails();
    industryCategoryTypeOptions = 'EMPTY_TYPE#EMPTY_TYPE#false#true';
    industryCategoryDescriptionOptions = 'EMPTY#EMPTY#true#true';
    mandatoryList = new Map();
    $subscriptions: Subscription[] = [];
    industryCategoryTypeCode: any;
    entityIndustryCategories: IndustryCategoryDescription[] = [];
    industryAllCategoryTypeList: IndustryCategoryType[] = [];
    industrySystemCategoryTypeList: IndustryCategoryType[] = [];
    industryCategoryDescriptionsList: IndustryCategoryDescription[] = [];
    entityId: any;
    entityIndustryClassifications: any[] = [];
    entityIndustryClassificationsGrouping: any[] = [];
    selectedCategoryDescriptionList = [];
    selectedCategoryTypeList: IndustryCategoryType[] = [];
    deleteCatCodeList = [];
    deleteClassList = [];
    addedEntityIndustryCatIds = [];
    removedEntityIndustryClassIds = [];
    isEditIndex = null;
    isEditMode = false;
    selectedIndustry = null;
    isSaving = false;
    isDunsViewMode = false;
    addedCategoryIds: Set<number> = new Set();
    INDUSTRY_DETAILS = INDUSTRY_DETAILS;
    IndustryCategoryTypeSource = INDUSTRY_CATEGORY_TYPE_SOURCE;
    CONFIRMATION_MODAL_ID = 'industry-delete-confirm-modal';
    modalConfig = new CommonModalConfig(this.CONFIRMATION_MODAL_ID, 'Delete', 'Cancel');

    constructor(private _entityOverviewService: EntityOverviewService,
                private _dataStoreService: EntityDataStoreService,
                private _commonService: CommonService) {}

    ngOnInit() {
        this.fetchIndustryCategoryTypeBySource('A');
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private fetchIndustryCategoryTypeBySource(sourceType: IndustryCategoryTypeSource): void {
        this.$subscriptions.push(
            this._entityOverviewService.fetchIndustryCategoryTypeBySource(sourceType)
                .subscribe((industryCategoryTypeList: IndustryCategoryType[]) => {
                    if (industryCategoryTypeList) {
                        this.industryAllCategoryTypeList = industryCategoryTypeList.map((item: IndustryCategoryType) => ({
                            ...item,
                            code: item?.industryCategoryTypeCode,
                            actualDescription: item?.description,
                            description: item?.industryCategoryTypeCode ? getCodeDescriptionFormat(item?.industryCategoryTypeCode, item?.description, INDUSTRY_CATEGORY_TYPE_FORMAT) : item?.description
                        }));
                        this.industrySystemCategoryTypeList = this.industryAllCategoryTypeList?.filter((type: IndustryCategoryType) => type?.source !== this.IndustryCategoryTypeSource.DUNS);
                    }
            }, (error: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
    }

    private openIndustryDetailsModal(): void {
        openModal('addIndustryDetails-modal', {
            backdrop: 'static',
            keyboard: false,
            focus: false
        });
    }

    private getMappedCategory(industry: EntityIndustryClassifications[]): IndustryCategoryDescription[] {
        if (!industry) return [];
    
        return industry.map(({ industryCategoryCode, entityIndustryClassId }: EntityIndustryClassifications) => ({
            ...industryCategoryCode,
            actualDescription: industryCategoryCode?.description,
            description: getCodeDescriptionFormat(industryCategoryCode?.industryCategoryCode, industryCategoryCode?.description, INDUSTRY_CATEGORY_DESCRIPTION_FORMAT),
            entityIndustryClassId
        }));
    }

    clearIndustryDetails() {
        hideModal('addIndustryDetails-modal');
        setTimeout(() => {
            this.mandatoryList.clear();
            this.industryDetails = new IndustryDetails();
            this.selectedCategoryTypeList = [];
            this.selectedCategoryDescriptionList = [];
            this.industryCategoryDescriptionsList = [];
            this.industryCategoryTypeCode = null;
            this.entityIndustryCategories = [];
            this.deleteClassList  = [];
            this.deleteCatCodeList = [];
            this.addedEntityIndustryCatIds = [];
            this.removedEntityIndustryClassIds = [];
            this.isEditIndex = null;
            this.selectedIndustry = null;
            this.isSaving = false;
        }, 200);
    }

    addIndustry() {
        if (!this.isSaving && this.validateEntityindustry()) {
            this.isEditIndex != null ? this.updateIndustryDetails() : this.saveIndustryDetails();
        }
    }

    onIndustryCategoryTypeSelect(event) {
        this.entityIndustryCategories = [];
        this.industryCategoryDescriptionsList = [];
        if (event && event.length) {
            this.industryCategoryTypeCode = event[0].code;
            this.fetchIndustryDescription();
        } else {
            this.industryCategoryTypeCode = null;
        }
    }

    async fetchIndustryDescription() {
        try {
            const data: any = await this._entityOverviewService.fetchIndustryCategoryCode(this.industryCategoryTypeCode);
            if (data) {
                this.industryCategoryDescriptionsList = this.isEditIndex == null ? data.filter(item => !this.addedCategoryIds.has(item?.industryCategoryId)) : data;
                this.industryCategoryDescriptionsList = this.industryCategoryDescriptionsList?.map(item => ({
                    ...item,
                    code: item?.industryCategoryId,
                    actualDescription: item?.description,
                    description: getCodeDescriptionFormat(item?.industryCategoryCode, item?.description, INDUSTRY_CATEGORY_DESCRIPTION_FORMAT)
                }));
            }
        } catch (err) {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
    }


    validateEntityindustry(): boolean {
        this.mandatoryList.clear();
        if (!this.industryCategoryTypeCode || !this.industryCategoryTypeCode.length) {
            this.mandatoryList.set('industryCategoryTypeCode', 'Please select industry classification.');
        } else if (this.isEditIndex === null && this.getHasDuplicateTypeCode()) {
            this.mandatoryList.set('industryCategoryTypeCode', 'The industry classification has already been added. Please update the existing type to make any changes.');
        }
        if (!this.entityIndustryCategories || !this.entityIndustryCategories.length) {
            this.mandatoryList.set('industryCategoryDescription', 'Please select industry category.');
        }
        return this.mandatoryList.size === 0;
    }

    private getHasDuplicateTypeCode(): boolean {
        const INDUSTRY_TYPE_CODE_GROUP = this.groupBy(this.entityIndustryClassifications, 'industryCategoryCode', 'industryCategoryType', 'industryCategoryTypeCode');
        return this.industryCategoryTypeCode && INDUSTRY_TYPE_CODE_GROUP?.hasOwnProperty(this.industryCategoryTypeCode);
    }

    onIndustryCategoryDescriptionSelect(event) {
        if (event && event.length) {
            this.entityIndustryCategories = event;
            const fullDataCatIds = this.entityIndustryClassifications.map(it => it.industryCategoryId);
            this.addedEntityIndustryCatIds = this.entityIndustryCategories?.filter((item: any) => !fullDataCatIds.includes(item?.industryCategoryId));
            const newAddedCatIds = this.entityIndustryCategories.map(it => it.industryCategoryId);
            this.removedEntityIndustryClassIds = this.selectedIndustry?.[1]?.filter((item: any) => !newAddedCatIds.includes(item?.industryCategoryId));
        } else {
            this.entityIndustryCategories = [];
        }
    }

    saveIndustryDetails() {
        this.setReqObj();
        this.isSaving = true;
        this.$subscriptions.push(this._entityOverviewService.saveIndustryDetails(this.industryDetails).subscribe((data: any) => {
            this._dataStoreService.enableModificationHistoryTracking();
            this._dataStoreService.updateStore(['entityIndustryClassifications'], { 'entityIndustryClassifications':  data });
            this.isSaving = false;
            this.clearIndustryDetails();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Industry details added successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            this.isSaving = false;
        }));
    }

    setReqObj() {
        this.industryDetails.entityIndustryCatIds = [];
        this.industryDetails.entityId = this.entityId;
        this.entityIndustryCategories.forEach((ele) => {
            this.industryDetails.entityIndustryCatIds.push(ele.industryCategoryId);
        });
    }

    private getDataFromStore() {
        const entityData = this._dataStoreService.getData();
        if (isEmptyObject(entityData)) { return; }
        this.entityId = entityData?.entityDetails?.entityId;
        this.entityIndustryClassifications = entityData.entityIndustryClassifications || [];
        if (this.entityIndustryClassifications.length) {
            const GROUP_BY = this.groupByMap(this.entityIndustryClassifications, 'industryCategoryCode', 'industryCategoryType', 'description');
            this.entityIndustryClassificationsGrouping = Array.from(GROUP_BY.entries());
        }
        this.isEditMode = this._dataStoreService.getEditMode();
        this.isDunsViewMode = this._dataStoreService.checkDunsMatchedForSelectedVersion();
        this.checkUserHasRight();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    groupBy(jsonData: any[], key: string, innerKey: string, secondInnerKey: string) {
        return jsonData?.reduce((relationsTypeGroup, item) => {
            (relationsTypeGroup[item[key][innerKey][secondInnerKey]] = relationsTypeGroup[item[key][innerKey][secondInnerKey]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

    private groupByMap(jsonData: any[], key: string, innerKey: string, secondInnerKey: string): Map<string, any[]> {
        return jsonData?.reduce((relationsTypeGroup, item) => {
            const GROUP_KEY = item[key][innerKey][secondInnerKey];
            if (!relationsTypeGroup.has(GROUP_KEY)) {
                relationsTypeGroup.set(GROUP_KEY, []);
            }
            relationsTypeGroup.get(GROUP_KEY).push({
                ...item,
                source: item?.industryCategoryCode?.industryCategoryType?.source,
                industryCategoryCode: {
                    ...item?.industryCategoryCode,
                    formattedIndustryCategoryDescription: getCodeDescriptionFormat(item?.industryCategoryCode?.industryCategoryCode, item?.industryCategoryCode?.description, INDUSTRY_CATEGORY_DESCRIPTION_FORMAT),
                    industryCategoryType: {
                        ...item?.industryCategoryCode?.industryCategoryType,
                        formattedIndustryCategoryType: getCodeDescriptionFormat(item?.industryCategoryCode?.industryCategoryType?.industryCategoryTypeCode, item?.industryCategoryCode?.industryCategoryType?.description, INDUSTRY_CATEGORY_TYPE_FORMAT)
                    }
                },
            });
            return relationsTypeGroup;
        }, new Map<string, any[]>());
    }

    async editIndustry(industry, index: number) {
        this.selectedIndustry = deepCloneObject(industry);
        this.isEditIndex = index;
        this.selectedCategoryTypeList = this.getCategoryType(industry);
        this.industryCategoryTypeCode = this.selectedCategoryTypeList[0].code;
        await this.fetchIndustryDescription();
        this.selectedCategoryDescriptionList = this.getCategoryDescription(industry);
        this.entityIndustryCategories = this.getMappedCategory(industry?.[1]);
        this.openIndustryDetailsModal();
    }

    getCategoryType(industry) {
        return [{code: industry?.[1][0]?.industryCategoryCode?.industryCategoryTypeCode}];
    }

    getCategoryDescription(industry) {
        if (!industry || !industry[1]) { return []; }
        return industry[1].map((categoryCode) => {
            if (categoryCode?.isPrimary) {
                this.industryDetails.primaryCatId = categoryCode?.industryCategoryId;
            }
            return {
                code: categoryCode?.industryCategoryId,
                entityIndustryClassId: categoryCode?.entityIndustryClassId,
                industryCategoryId: categoryCode?.industryCategoryId,
                description: categoryCode?.industryCategoryCode.description,
                isPrimary: categoryCode?.isPrimary
            };
        });
    }

    confirmDeleteIndustry(industry, index) {
        this.selectedIndustry = industry;
        this.deleteCatCodeList = industry[1].map((ind) => Number(ind.industryCategoryCode.industryCategoryCode));
        this.deleteClassList = industry[1].map((ind) => ind.entityIndustryClassId);
        this.isEditIndex = index;
        openCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    postConfirmation(modalAction: ModalActionEvent) {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.deleteIndustryClass();
        }
        closeCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    deleteIndustryClass() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(forkJoin(this.deleteClassList.map(catCode => this._entityOverviewService
                .deleteIndustryDetailsByClassId(catCode))).subscribe((res) => {
                delete this.entityIndustryClassificationsGrouping[this.selectedIndustry?.[0]];
                this.entityIndustryClassifications = this.entityIndustryClassifications
                    .filter(items => !this.deleteClassList.includes(items.entityIndustryClassId));
                this._dataStoreService.enableModificationHistoryTracking();
                this.updateDataStore();
                this.clearIndustryDetails();
                this.isSaving = false;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Industry details deleted successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isSaving = false;
            }));
        }
    }

    updateIndustryDetails() {
        this.isSaving = true;
        this.$subscriptions.push(this._entityOverviewService.updateIndustryDetails(this.generateUpdateObj()).subscribe((res: any) => {
            this.entityIndustryClassifications = res;
            this._dataStoreService.enableModificationHistoryTracking();
            this.updateDataStore();
            this.clearIndustryDetails();
            this.isSaving = false;
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Industry details updated successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            this.isSaving = false;
        }));
    }

    generateUpdateObj() {
        return {
            entityId: this.entityId,
            removedEntityIndustryClassIds: this.removedEntityIndustryClassIds.map(item => item.entityIndustryClassId),
            addedEntityIndustryCatIds: this.addedEntityIndustryCatIds.map(item => item.industryCategoryId),
            primaryCatId: this.getPrimaryCatId(),
            updatePrimaryCatId: this.industryDetails.updatePrimaryCatId
        };
    }

    getPrimaryCatId() {
        return this.industryDetails.primaryCatId ? this.industryDetails.primaryCatId : null;
    }

    updateDataStore() {
        this._dataStoreService.updateStore(['entityIndustryClassifications'],
            { 'entityIndustryClassifications':  this.entityIndustryClassifications });
    }

    clearPrimaryFlag() {
        this.industryDetails.primaryCatId = '';
        this.industryDetails.updatePrimaryCatId = true;
    }

    setPrimaryCatId(industryCategoryId) {
        this.industryDetails.primaryCatId = industryCategoryId;
        this.industryDetails.updatePrimaryCatId = true;
    }

    checkUserHasRight(): void {
        const hasRight = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME') &&
            this._dataStoreService.getOverviewEditRight(this.INDUSTRY_DETAILS.sectionId);
        if (!hasRight) {
            this.isEditMode = false;
        }
    }

    async addIndustryDetails(): Promise<void> {
        this.openIndustryDetailsModal();
    }

}
