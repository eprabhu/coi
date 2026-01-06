import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GraphDetail } from 'projects/shared/src/lib/graph/interface';
import { Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { COMMON_ERROR_TOAST_MSG, ENTITY_DASHBOARD_ADVANCED_SEARCH_ORDER, DASHBOARD_ENTITY_DETAILS_CARD_ORDER, ENTITY_DOCUMENT_STATUS_TYPE, ENTITY_VERIFICATION_STATUS, HTTP_ERROR_STATUS, ADVANCE_SEARCH_CRITERIA_IN_ENTITY_DASHBOARD, IMPORT_ENTITY_RIGHTS } from '../app-constants';
import { CommonService } from '../common/services/common.service';
import { ElasticConfigService } from '../common/services/elastic-config.service';
import { NavigationService } from '../common/services/navigation.service';
import { getEndPointOptionsForCountry } from '../configuration/form-builder-create/shared/form-builder-view/search-configurations';
import { EntityDashboardService } from './entity-dashboard.service';
import { listAnimation, topSlideInOut, fadeInOutHeight, slideInAnimation, scaleOutAnimation } from '../common/utilities/animations';
import { Country, EntityBatchDetails, EntityDetailsCardConfig, SharedEntityCardEvents, State } from '../common/services/coi-common.interface';
import { ImportEntityRO } from './entity-batch/services/entity-batch.interface';
import { calculateFilledProperties, closeCommonModal, deepCloneObject, inputNumberRestriction, isEmptyObject, openCommonModal } from '../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../shared-components/common-modal/common-modal.interface';
import { EntityDashboardTabs, DashboardEntityDetails, EntityDashboardSearchRequest, DashboardEntity, EntityDashDefaultValues } from './entity-dashboard.interface';
import { EntireEntityDetails } from '../entity-management-module/shared/entity-interface';
import { InformationAndHelpTextService } from '../common/services/informationAndHelpText.service';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { ENTITY_VERSION_STATUS } from '../entity-management-module/shared/entity-constants';
import { EndPointOptions } from '../shared-components/shared-interface';
import { getEndPointOptionsForStates } from '../common/services/end-point.config';

@Component({
    selector: 'app-entity-dashboard-component',
    templateUrl: './entity-dashboard.component.html',
    styleUrls: ['./entity-dashboard.component.scss'],
    animations: [listAnimation, topSlideInOut, fadeInOutHeight,
        slideInAnimation('0', '12px', 400, 'slideUp'),
        slideInAnimation('0', '-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px', '0', 200, 'scaleOut'),
    ],
})

export class EntityDashboardComponent implements OnInit, OnDestroy {

    activeTabName: EntityDashboardTabs;
    isViewAdvanceSearch = false;
    isShowEntityList = false;
    clearEntityCountry: String;
    stateClearField = new String('false');
    entitySearchOptions: any = {};
    countrySearchOptions: any = {};
    stateSearchOption: EndPointOptions = {};
    lookupValues = [];
    $entityList = new Subject();
    entityList: DashboardEntityDetails[] = [];
    $subscriptions: Subscription[] = [];
    resultCount = 0;
    canViewEntity: boolean;
    isActiveDisclosureAvailable: boolean;
    isLoading = false;
    isShowGraph = false;
    isManageEntity = false;
    sortSectionsList = [
        { variableName: 'PRIMARY_NAME', fieldName: 'Name' },
        { variableName: 'COUNTRY', fieldName: 'Country' },
        { variableName: 'OWNERSHIP_TYPE', fieldName: 'Ownership Type' },
        { variableName: 'ENTITY_STATUS', fieldName: 'Entity Status' },
        { variableName: 'UPDATE_TIMESTAMP', fieldName: 'Last Updated' }
    ];
    sortMap: any = {};
    sortCountObj: any = {};
    tempEntitySearchRequestObject = new EntityDashboardSearchRequest();
    clearEntityName: String;
    isSearchFormInvalid = false;
    hasModifyEntityRight = false;
    isEnableEntityDunsMatch = false;
    canShowImportTab = false;
    ENTITY_ACTIVE = ENTITY_DOCUMENT_STATUS_TYPE.ACTIVE;
    ENTITY_DUPLICATE = ENTITY_DOCUMENT_STATUS_TYPE.DUPLICATE;
    ENTITY_INACTIVE = ENTITY_DOCUMENT_STATUS_TYPE.INACTIVE;
    ENTITY_VERIFIED = ENTITY_VERIFICATION_STATUS.VERIFIED;
    ENTITY_UNVERIFIED = ENTITY_VERIFICATION_STATUS.UNVERIFIED;
    DASHBOARD_ENTITY_DETAILS_CARD_ORDER = DASHBOARD_ENTITY_DETAILS_CARD_ORDER;
    ENTITY_DASHBOARD_ADVANCED_SEARCH_ORDER = ENTITY_DASHBOARD_ADVANCED_SEARCH_ORDER;
    isAdvanceSearchMade = false;
    advancedSearchCriteriaCount: number = 0;
    singleInputFieldKeys = [
        'PRIMARY_NAME',
        'PRIMARY_ADDRESS',
        'CITY',
        'STATE',
        'COUNTRY',
        'DUNS_NUMBER',
        'UEI_NUMBER',
        'CAGE_NUMBER',
        'WEBSITE_ADDRESS',
        'FOREIGN_NAME',
        'PRIOR_NAME',
        'ORGANIZATION_ID',
        'SPONSOR_CODE',
        'TRANSLATED_NAME'
    ];
    multipleInputFieldKeys = [
        'ENTITY_STATUS_TYPE_CODE',
        'VERIFICATION_STATUS',
        'ENTITY_SOURCE_TYPE_CODE',
        'OWNERSHIP_TYPE_CODE'
    ];

    // import entities variables
    batchList: EntityBatchDetails[] = [];
    importEntityRO = new ImportEntityRO();
    lookupOptions = {
        statusTypeOptions: 'entity_document_status_type#DOCUMENT_STATUS_TYPE_CODE#true#true#true#true',
        verificationTypeOptions: 'entity_status_type#ENTITY_STATUS_TYPE_CODE#true#true',
        ownershipTypeOptions: 'entity_ownership_type#OWNERSHIP_TYPE_CODE#true#true',
        sourceTypeOptions: 'ENTITY_SOURCE_TYPE#ENTITY_SOURCE_TYPE_CODE#true#true',
        batchTypeOptions: 'ENTITY_STAGE_BATCH_STATUS_TYPE#BATCH_STATUS_CODE#true#true',
        reviewTypeOptions: 'ENTITY_STAGE_REVIEW_STATUS_TYPE#REVIEW_STATUS_CODE#true#true',
    }
    showForeignName: boolean[] = [];
    inputNumberRestriction = inputNumberRestriction;
    modifyConfirmationId = 'dashboard-modification-confirmation-modal';
    modifyConfirmationConfig = new CommonModalConfig(this.modifyConfirmationId, 'Modify', 'Cancel');
    currentModifiedEntity = new DashboardEntityDetails();

    // version modal
    entityVersionsList: { activeVersion: EntityDetailsCardConfig, pendingVersion: EntityDetailsCardConfig } = { activeVersion: null, pendingVersion: null };
    VERSION_MODAL_ID = 'coi-entity-versions';
    versionModalConfig = new CommonModalConfig(this.VERSION_MODAL_ID, '', 'Close', 'lg');
    advanceSearchTimeOut: any;

    constructor(private _router: Router,
        public entityDashboardService: EntityDashboardService,
        private _navigationService: NavigationService,
        private _commonService: CommonService,
        private _elasticConfig: ElasticConfigService,
        private _informationAndHelpTextService: InformationAndHelpTextService,
        private _activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.getModuleConfiguration();
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveEntity();
        this.setEndPointSearchOptions();
        this.checkUserHasRight();
        this.setDashboardTab();
        this.setAdvanceSearch();
        this.viewListOfEntity();
        this.checkForAdvanceSearch();
        this.isShowGraph = this._commonService.enableGraph;
        this.isEnableEntityDunsMatch = this._commonService.isEnableEntityDunsMatch;
    }

    private setEndPointSearchOptions(): void {
        this.countrySearchOptions = getEndPointOptionsForCountry(this._commonService.fibiUrl);
        this.stateSearchOption = getEndPointOptionsForStates(this._commonService.fibiUrl);
    }

    private getModuleConfiguration(): void {
        this._informationAndHelpTextService.moduleConfiguration = this._commonService.getSectionCodeAsKeys(this._activatedRoute.snapshot.data.entitySectionConfig);
    }

    private checkForAdvanceSearch(): void {
        if (!this.checkForPreviousURL()) {
            this.entityDashboardService.isAdvanceSearch = false;
            this.entityDashboardService.isViewAdvanceSearch = this.activeTabName === 'ALL_ENTITY';
            this.entityDashboardService.isAdvanceSearchMade = false;
            this.entityDashboardService.entitySearchRequestObject = new EntityDashboardSearchRequest();
            this.entityDashboardService.entitySearchRequestObject.entityDashboardData.TAB_TYPE = this.activeTabName;
            this.entityDashboardService.importEntitySearchRO = new ImportEntityRO();
            this.resetAdvanceSearchFields();
        }
        this.setAdvancedSearchDetails();
        this.checkForSort();
        this.setSortProperties();
        this.showEntities();
    }

    private setDashboardTab(): void {
        const DEFAULT_TAB = this.getDefaultDashboard() as EntityDashboardTabs;
        const CURRENT_TAB = sessionStorage.getItem('currentEntityDashboardTab') as EntityDashboardTabs || DEFAULT_TAB;
        const VALID_TAB = this.isTabAccessible(CURRENT_TAB) ? CURRENT_TAB : DEFAULT_TAB;
        this.activeTabName = VALID_TAB;
        this.entityDashboardService.entitySearchRequestObject.entityDashboardData.TAB_TYPE = VALID_TAB;
        sessionStorage.setItem('currentEntityDashboardTab', VALID_TAB);
    }

    private getDefaultDashboard(): string {
        switch (true) {
            case this.canViewEntity:
                return 'ALL_ENTITY';
            case this.canShowImportTab:
                return 'IMPORT';
            default:
                return '';
        }
    }

    private isTabAccessible(tabName: string | null): boolean {
        const TAB_ACCESS_MAP: { [key: string]: boolean } = {
            ALL_ENTITY: this.canViewEntity,
            UNVERIFIED: this.canViewEntity,
            IMPORT: this.canShowImportTab,
            DUNS_REFRESH_ENTITIES: this.canViewEntity
        };
        return TAB_ACCESS_MAP[tabName || ''] ?? false;
    }

    private setAdvanceSearch(): void {
        sessionStorage.setItem('currentEntityDashboardTab' , this.entityDashboardService.entitySearchRequestObject.entityDashboardData.TAB_TYPE)
        this.isViewAdvanceSearch = false;
    }

    private setAdvancedSearchDetails(): void {
        this.isViewAdvanceSearch = this.entityDashboardService.isViewAdvanceSearch;
        this.isAdvanceSearchMade = this.entityDashboardService.isAdvanceSearchMade;
        const ENTITY_DASHBOARD_DATA = deepCloneObject(this.entityDashboardService.entitySearchRequestObject.entityDashboardData);
        this.importEntityRO = deepCloneObject(this.entityDashboardService.importEntitySearchRO);
        this.activeTabName = ENTITY_DASHBOARD_DATA.TAB_TYPE;
        this.setTempSearchRO(ENTITY_DASHBOARD_DATA);
        this.setDefaultValuesFromService();
        this.stateSearchOption.params.countryCode = ENTITY_DASHBOARD_DATA.COUNTRY;
        this.generateLookupArrayForDropdown();
    }

    private setDefaultValuesFromService(): void {
        this.entitySearchOptions.defaultValue = this.entityDashboardService.entityDashDefaultValues.entitySearch;
        this.countrySearchOptions.defaultValue = this.entityDashboardService.entityDashDefaultValues.countrySearch;
        this.stateSearchOption.defaultValue = this.entityDashboardService?.entityDashDefaultValues?.stateSearch;
        this.tempEntitySearchRequestObject.state = this.entityDashboardService?.entityDashDefaultValues?.stateSearch;
        this.tempEntitySearchRequestObject.countryName = this.entityDashboardService.entityDashDefaultValues.countrySearch;
    }

    private getCardEntityList(entity: EntireEntityDetails): EntityDetailsCardConfig {
        const CARD_CONFIG = new EntityDetailsCardConfig();
        CARD_CONFIG.entireDetails = entity;
        CARD_CONFIG.sharedEntityDetails = {
            entityId: entity?.entityDetails?.entityId,
            entityName: entity?.entityDetails?.entityName,
            dunsNumber: entity?.entityDetails?.dunsNumber,
            ueiNumber: entity?.entityDetails?.ueiNumber,
            cageNumber: entity?.entityDetails?.cageNumber,
            primaryAddressLine1: entity?.entityDetails?.primaryAddressLine1,
            primaryAddressLine2: entity?.entityDetails?.primaryAddressLine2,
            state: entity?.entityDetails?.state,
            city: entity?.entityDetails?.city,
            postCode: entity?.entityDetails?.postCode,
            country: entity?.entityDetails?.country,
            website: entity?.entityDetails?.websiteAddress,
            foreignName: entity?.foreignNames?.[0]?.foreignName,
            foreignNames: entity?.foreignNames,
            priorName: entity?.priorNames?.[0]?.priorNames,
            ownershipType: entity?.entityDetails?.entityOwnershipType?.description,
            organizationId: entity?.organizationId,
            sponsorCode: entity?.sponsorCode,
            isForeign: entity?.entityDetails?.isForeign,
            businessEntityType: {
                description: entity?.entityDetails?.entityBusinessType?.description,
                typeCode: entity?.entityDetails?.entityBusinessType?.businessTypeCode
            },
            entityFamilyTreeRoles: entity?.entityFamilyTreeRoles?.map(role => ({
                description: role.familyRoleType?.description,
                typeCode: role.familyRoleTypeCode,
            })),
        };
        CARD_CONFIG.uniqueId = entity?.entityDetails.entityId;
        CARD_CONFIG.displaySections = [];
        CARD_CONFIG.cardOrder.DB_ENTITY = [];
        CARD_CONFIG.cardType = 'DB_ENTITY';
        CARD_CONFIG.customClass = 'coi-card-none';
        CARD_CONFIG.inputOptions = {};
        return CARD_CONFIG;
    }

    private openEntityVersionModal(entityListData: DashboardEntityDetails): void {
        this.$subscriptions.push(this.entityDashboardService.getEntityVersions(entityListData.entityNumber)
            .subscribe((entityVersionsList: EntireEntityDetails[]) => {
                entityVersionsList?.forEach((entireEntityDetails: EntireEntityDetails) => {
                    const ENTITY_VERIFICATION_STATUS_CODE = entireEntityDetails?.entityDetails?.entityStatusType?.entityStatusTypeCode;
                    if ([ENTITY_VERIFICATION_STATUS.MODIFYING, ENTITY_VERIFICATION_STATUS.DUNS_REFRESH].includes(ENTITY_VERIFICATION_STATUS_CODE)) {
                        this.entityVersionsList.pendingVersion = this.getCardEntityList(entireEntityDetails)
                    } else {
                        this.entityVersionsList.activeVersion = this.getCardEntityList(entireEntityDetails)
                    }
                });
                setTimeout(() => {
                    openCommonModal(this.VERSION_MODAL_ID);
                });
            }, (error: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
    }

    private setTempSearchRO(entityDashboardData: any): void {
        // Initialize tempEntitySearchRequestObject with the entityDashboardData property
        this.tempEntitySearchRequestObject = { entityDashboardData } as EntityDashboardSearchRequest;
        // Add other fields to tempEntitySearchRequestObject
        this.singleInputFieldKeys.forEach(field => {
            this.tempEntitySearchRequestObject[field] = entityDashboardData[field] || undefined;
        });
    }

    private closeModificationConfirmationModal(): void {
        closeCommonModal(this.modifyConfirmationId);
        setTimeout(() => {
           this.currentModifiedEntity = new DashboardEntityDetails();
       }, 200);
    }

    private modifyEntity(): void {
        this.$subscriptions.push(this.entityDashboardService.modifyEntity(this.currentModifiedEntity.entityId, this.currentModifiedEntity.entityNumber).subscribe((data: { copiedEntityId: number }) => {
            if (data.copiedEntityId) {
                this.navigateToEntity(data.copiedEntityId);
            }
            this.closeModificationConfirmationModal();
        }, (error: any) => {
            if(error?.status === 405) {
                this._commonService.concurrentUpdateAction = 'entity modification';
            } else {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Entity modification failed.');
            }
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        if (this.advanceSearchTimeOut) {
            clearTimeout(this.advanceSearchTimeOut);
        }
        this.entityDashboardService.isShowEntityNavBar = false;
    }

    entityTabName(tabName: EntityDashboardTabs) {
        sessionStorage.setItem('currentEntityDashboardTab', tabName);
        this.tempEntitySearchRequestObject = new EntityDashboardSearchRequest();
        this.resetAdvanceSearchFields();
        this.entityList = [];
        this.showForeignName = [];
        this.isShowEntityList = false;
        this.resultCount = null;
        this.activeTabName = tabName;
        this.entityDashboardService.entitySearchRequestObject.entityDashboardData.TAB_TYPE = this.activeTabName;
        this.entityDashboardService.isAdvanceSearch = false;
        this.entityDashboardService.isAdvanceSearchMade = false;
        this.isViewAdvanceSearch = this.activeTabName === 'ALL_ENTITY';
        this.entityDashboardService.isViewAdvanceSearch = this.isViewAdvanceSearch;
        if (!this.isViewAdvanceSearch) {
            this.$entityList.next();
        }
    }

    fetchBatches(tabName: string): void {
        this.activeTabName = 'IMPORT';
        sessionStorage.setItem('currentEntityDashboardTab',  tabName);
        this.entityList = [];
        this.showForeignName = [];
        this.isViewAdvanceSearch = false;
        this.resetAdvanceSearchFields();
        this.entityDashboardService.entitySearchRequestObject.entityDashboardData.TAB_TYPE = this.activeTabName;
        this.triggerImportEntities();
    }

    private triggerImportEntities(): void {
        this.entityDashboardService.importEntitySearchRO = deepCloneObject(this.importEntityRO);
        this.advancedSearchCriteriaCount = calculateFilledProperties(this.entityDashboardService.importEntitySearchRO, ADVANCE_SEARCH_CRITERIA_IN_ENTITY_DASHBOARD);
        this.isLoading = true;
        this.batchList = [];
        this.$subscriptions.push(
            this.entityDashboardService.fetchBatches(this.importEntityRO)
                .subscribe((res: EntityBatchDetails[]) => {
                    this.batchList = res || [];
                    this.isLoading = false;
                }, (error: any) => {
                    this.isLoading = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching batches.');
                }));
    }

    private checkForPreviousURL() {
        return ['coi/entity-dashboard/batch', 'coi/manage-entity'].some((url) => this._navigationService.previousURL.includes(url));
    }

    private showEntities(): void {
        if (this.activeTabName === 'IMPORT') {
            this.triggerImportEntities();
        } else if (this.activeTabName === 'UNVERIFIED' || this.activeTabName === 'DUNS_REFRESH_ENTITIES' || this.entityDashboardService.isAdvanceSearch) {
            this.$entityList.next();
        }
    }

    redirectToEntity(coi: any) {
        this._router.navigate(['/coi/entity-management/entity-details'], { queryParams: { entityManageId: coi.id } });
    }

    viewListOfEntity() {
        this.$subscriptions.push(this.$entityList.pipe(
            switchMap(() => {
                this.isLoading = true;
                this.entityDashboardService.isAdvanceSearch = true;
                this.entityList = [];
                this.showForeignName = [];
                return this.entityDashboardService.getAllSystemEntityList(this.getDashboardRO());
            })).subscribe((res: DashboardEntity) => {
                this.entityList = this.getFormattedEntityList(res.dashboardResponses);
                this.resultCount = res.totalEntityResponse;
                this.isLoading = false;
                this.isShowEntityList = true;
                this.advancedSearchCriteriaCount = calculateFilledProperties(this.entityDashboardService.entitySearchRequestObject.entityDashboardData, ADVANCE_SEARCH_CRITERIA_IN_ENTITY_DASHBOARD);
            }, _error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isLoading = false;
                this.isShowEntityList = true;
            }));
    }

    private getFormattedEntityList(batchEntityDetails: DashboardEntityDetails[]): DashboardEntityDetails[] {
        return batchEntityDetails?.map(entity => {
            entity.foreignNameList = entity.foreignName?.split('||');
            entity.entityFamilyTreeRolesList = entity.familyTreeRoleTypes?.split('||');
            return entity;
        }) || [];
    }

    getDashboardRO() {
        let RO: any = deepCloneObject(this.entityDashboardService.entitySearchRequestObject);
        if (!Object.keys(RO.entityDashboardData.SORT_TYPE).length) {
            delete RO.entityDashboardData.SORT_TYPE;
        } else {
            RO.entityDashboardData.SORT_TYPE = this.getSortType(RO.entityDashboardData.SORT_TYPE);
        }
        return RO;
    }

    getSortType(obj): string {
        const keyValuePairs = Object.entries(obj)
            .map(([key, value]) => `${key} ${value}`)
            .join(', ');
        return keyValuePairs;
    }

    addNewEntity() {
        this._router.navigate(['/coi/manage-entity/create-entity']);
    }

    setEntityNameForAdvanceSearch(event: any): void {
        if (event) {
            this.tempEntitySearchRequestObject.PRIMARY_NAME = event['value_source'] === 'DEFAULT_SEARCH_TEXT' ? event.value : event.entity_name;
        } else {
            delete this.tempEntitySearchRequestObject.PRIMARY_NAME;
        }
    }

    private clearEntityNameForAdvanceSearch(): void {
        delete this.entityDashboardService.entitySearchRequestObject.PRIMARY_NAME;
    }

    private clearCountryForAdvanceSearch(): void {
        delete this.entityDashboardService.entitySearchRequestObject.countryCode;
    }

    private clearStateFromAdvanceSearch(): void {
        delete this.entityDashboardService?.entitySearchRequestObject?.stateCode;
    }

    private onSelectEntityCountry(countryDetails: Country) {
        if (countryDetails?.countryCode) {
            this.tempEntitySearchRequestObject.COUNTRY = countryDetails.countryCode;
            this.tempEntitySearchRequestObject.countryName = countryDetails?.countryName;
            this.stateSearchOption.params.countryCode = countryDetails.countryCode;
        } else {
            delete this.tempEntitySearchRequestObject?.COUNTRY;
            delete this.tempEntitySearchRequestObject?.countryName;
            delete this.stateSearchOption?.params?.countryCode;
        }
    }

    onSelectEntityState(result: State | null): void {
        if (result) {
            this.tempEntitySearchRequestObject.STATE = result.stateCode || result.value;
            this.tempEntitySearchRequestObject.stateCode = result.stateCode || null;
            this.tempEntitySearchRequestObject.state = result.stateName || null;
            this.stateSearchOption.defaultValue = result.stateName;
            this.setCountryFieldFromState(result.country);
        } else {
            delete this.tempEntitySearchRequestObject?.STATE;
            delete this.tempEntitySearchRequestObject?.state;
            delete this.tempEntitySearchRequestObject?.stateCode;
        }
        this.stateSearchOption.params.countryCode = this.tempEntitySearchRequestObject?.COUNTRY || '';
    }

    private setCountryFieldFromState(countryDetails: Country): void {
        if (!this.tempEntitySearchRequestObject.COUNTRY) {
            this.clearEntityCountry = new String('false');
            this.countrySearchOptions.defaultValue = countryDetails?.countryName;
            this.onSelectEntityCountry(countryDetails);
        }
    }

    onLookupSelect(data, template) {
        this.lookupValues[template] = data;
        if (data.length) {
            this.tempEntitySearchRequestObject[template] = data.map(d => d.code);
        } else {
            delete this.tempEntitySearchRequestObject[template];
        }
    }

    onBatchLookupSelect(data: any, template: 'batchStatusCodes' | 'reviewStatusCodes'): void {
        this.lookupValues[template] = data;
        if (data.length) {
            this.importEntityRO[template] = data.map(d => d.code);
        } else {
            delete this.importEntityRO[template];
        }
    }

    resetAdvanceSearchFields() {
        this.clearEntityNameForAdvanceSearch();
        this.clearCountryForAdvanceSearch();
        this.clearStateFromAdvanceSearch();
        this.entityDashboardService.entityDashDefaultValues = new EntityDashDefaultValues();
        this.entityDashboardService.importEntitySearchRO = new ImportEntityRO();
        this.importEntityRO = new ImportEntityRO();
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveEntity();
        this.countrySearchOptions = getEndPointOptionsForCountry(this._commonService.fibiUrl);
        this.stateSearchOption = getEndPointOptionsForStates(this._commonService.fibiUrl);
        this.lookupValues = [];
        this.tempEntitySearchRequestObject = new EntityDashboardSearchRequest();
        this.entityDashboardService.entitySearchRequestObject = new EntityDashboardSearchRequest();
        this.entityDashboardService.entitySearchRequestObject.entityDashboardData.TAB_TYPE = sessionStorage.getItem('currentEntityDashboardTab');
        this.isSearchFormInvalid = false;
        this.resetSortObjects();
        this.isAdvanceSearchMade = false;
        this.entityDashboardService.isAdvanceSearchMade = false;
    }

    clearAdvancedSearch() {
        this.resetAdvanceSearchFields();
        this.entityDashboardService.entitySearchRequestObject.entityDashboardData.TAB_TYPE = this.activeTabName;
        this.entityList = [];
        if (this.activeTabName === 'IMPORT') {
            this.triggerImportEntities();
        } else {
            this.$entityList.next();
        }
    }

    advancedSearch(): void {
        this.advanceSearchTimeOut = setTimeout(() => {
            if (this.isSearchFormInvalid) {
                return;
            }
            this.tempEntitySearchRequestObject.entityDashboardData.PAGED = 0;
            this.entityDashboardService.entitySearchRequestObject.entityDashboardData.PAGED = 0;
            this.entityDashboardService.isAdvanceSearch = true;
            this.isViewAdvanceSearch = false;
            this.entityDashboardService.isViewAdvanceSearch = false;
            this.isAdvanceSearchMade = true;
            this.entityDashboardService.isAdvanceSearchMade = true
            if (this.activeTabName !== 'IMPORT') {
                this.switchAdvanceSearchProperties();
                this.$entityList.next();
            } else {
                this.triggerImportEntities();
            }
        }, 100);
    }

    private switchAdvanceSearchProperties(): void {
        const TEMP_RO = deepCloneObject(this.tempEntitySearchRequestObject);
        // Update single input fields directly on entitySearchRequestObject.entityDashboardData
        this.singleInputFieldKeys.forEach(property => {
            this.entityDashboardService.entitySearchRequestObject.entityDashboardData[property] = TEMP_RO[property]?.trim() || undefined;
            if (!this.entityDashboardService.entitySearchRequestObject.entityDashboardData[property]) {
                delete this.entityDashboardService.entitySearchRequestObject.entityDashboardData[property];
            }
        });
        // Update multiple input fields directly on entitySearchRequestObject.entityDashboardData
        this.multipleInputFieldKeys.forEach(property => {
            this.entityDashboardService.entitySearchRequestObject.entityDashboardData[property] = TEMP_RO[property]?.join(', ') || undefined;
            if (!this.entityDashboardService.entitySearchRequestObject.entityDashboardData[property]) {
                delete this.entityDashboardService.entitySearchRequestObject.entityDashboardData[property];
            }
        });
        this.entityDashboardService.entityDashDefaultValues.countrySearch = TEMP_RO.countryName;
        this.entityDashboardService.entityDashDefaultValues.entitySearch = TEMP_RO.PRIMARY_NAME;
        this.entityDashboardService.entityDashDefaultValues.stateSearch = TEMP_RO.state;
    }

    generateLookupArrayForDropdown() {
        const entityDashboardData = this.entityDashboardService.entitySearchRequestObject.entityDashboardData;
        if (entityDashboardData.ENTITY_STATUS_TYPE_CODE && entityDashboardData.ENTITY_STATUS_TYPE_CODE.length !== 0) {
            this.tempEntitySearchRequestObject['ENTITY_STATUS_TYPE_CODE'] = this.changeStringToArrayForLookups(entityDashboardData.ENTITY_STATUS_TYPE_CODE);
            this.generateLookupArray(entityDashboardData.ENTITY_STATUS_TYPE_CODE, 'ENTITY_STATUS_TYPE_CODE');
        }
        if (entityDashboardData.VERIFICATION_STATUS && entityDashboardData.VERIFICATION_STATUS.length !== 0) {
            this.tempEntitySearchRequestObject['VERIFICATION_STATUS'] = this.changeStringToArrayForLookups(entityDashboardData.VERIFICATION_STATUS);
            this.generateLookupArray(entityDashboardData.VERIFICATION_STATUS, 'VERIFICATION_STATUS');
        }
        if (entityDashboardData.ENTITY_SOURCE_TYPE_CODE && entityDashboardData.ENTITY_SOURCE_TYPE_CODE.length !== 0) {
            this.tempEntitySearchRequestObject['ENTITY_SOURCE_TYPE_CODE'] = this.changeStringToArrayForLookups(entityDashboardData.ENTITY_SOURCE_TYPE_CODE);
            this.generateLookupArray(entityDashboardData.ENTITY_SOURCE_TYPE_CODE, 'ENTITY_SOURCE_TYPE_CODE');
        }
        if (entityDashboardData.OWNERSHIP_TYPE_CODE && entityDashboardData.OWNERSHIP_TYPE_CODE.length !== 0) {
            this.tempEntitySearchRequestObject['OWNERSHIP_TYPE_CODE'] = this.changeStringToArrayForLookups(entityDashboardData.OWNERSHIP_TYPE_CODE);
            this.generateLookupArray(entityDashboardData.OWNERSHIP_TYPE_CODE, 'OWNERSHIP_TYPE_CODE');
        }
        // for batch
        this.setBatchAdvancedSearchLookup();
    }

    private setBatchAdvancedSearchLookup() {
        const STATUS_CODE_KEYS = ['reviewStatusCodes', 'batchStatusCodes'];
        STATUS_CODE_KEYS.forEach(key => {
            const STATUS_CODE = this.entityDashboardService.importEntitySearchRO[key];
            if (STATUS_CODE && STATUS_CODE.length > 0) {
                this.lookupValues[key] = STATUS_CODE.map(code => ({ code }));
            }
        });
    }

    /**Since we get string as resultant if advance search is made we are changing string to array*/
    changeStringToArrayForLookups(property) {
        let str_arr = [];
        let result_arr = [];
        str_arr = property.split(', ');
        if (str_arr.length) {
            str_arr.forEach(element => {
                result_arr.push(element);
            });
        } else {
            result_arr.push(property);
        }
        return result_arr;
    }

    generateLookupArray(property, propertyNumber) {
        this.lookupValues[propertyNumber] = [];
        let str_arr = [];
        str_arr = property.split(',');
        if (str_arr.length) {
            str_arr.forEach(element => {
                this.lookupValues[propertyNumber].push({ code: element });
            });
        } else {
            this.lookupValues[propertyNumber] = { code: property }
        }
    }

    navigateToEntity(entityId: number | string): void {
        this._router.navigate(['/coi/manage-entity/entity-overview'], { queryParams: { entityManageId: entityId } });
    }

    viewDetails(entityListData: DashboardEntityDetails): void {
        if ((entityListData.modificationIsInProgress || entityListData?.dunsRefVersionIsInProgress) && this.hasModifyEntityRight) {
            this.openEntityVersionModal(entityListData);
        } else {
            this.navigateToEntity(entityListData.entityId);
        }
    }

    reviewChanges(entityListData: DashboardEntityDetails): void {
        this.$subscriptions.push(
            this.entityDashboardService.getEntityVersions(entityListData.entityNumber).subscribe(
                (entityVersionsList: EntireEntityDetails[]) => {
                    const DUNS_REFRESHED_ENTITY = (entityVersionsList || []).find(entireEntityDetails =>
                        entireEntityDetails?.entityDetails?.entityStatusType?.entityStatusTypeCode?.toString() === ENTITY_VERIFICATION_STATUS.DUNS_REFRESH?.toString());
                    if (DUNS_REFRESHED_ENTITY) {
                        sessionStorage.setItem('isShowComparisonBtn', 'true');
                        this.navigateToEntity(DUNS_REFRESHED_ENTITY.entityDetails?.entityId);
                    } else {
                        this._commonService.concurrentUpdateAction = 'entity';
                    }
                }, (error: any) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    actionsOnPageChange(event) {
        if (event - 1 !== this.entityDashboardService.entitySearchRequestObject.entityDashboardData.PAGED) {
            this.entityDashboardService.entitySearchRequestObject.entityDashboardData.PAGED = event - 1;
            this.$entityList.next();
        }
    }

    checkUserHasRight(): void {
        const IS_MANAGE_ENTITY = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME');
        this.hasModifyEntityRight = this._commonService.getAvailableRight(['MANAGE_ENTITY', 'MANAGE_ENTITY_SPONSOR', 'MANAGE_ENTITY_ORGANIZATION', 'MANAGE_ENTITY_COMPLIANCE'], 'SOME');
        this.canViewEntity = (this.hasModifyEntityRight || this._commonService.getAvailableRight(['VIEW_ENTITY', 'VERIFY_ENTITY'], 'SOME'));
        this.isManageEntity = IS_MANAGE_ENTITY;
        this.canShowImportTab = this._commonService.getAvailableRight(IMPORT_ENTITY_RIGHTS) && this._commonService.isShowEntityMigrationPhase;
    }

    checkForSort() {
        const entityDashboardData = this.entityDashboardService.entitySearchRequestObject.entityDashboardData;
        if (!isEmptyObject(entityDashboardData.SORT_TYPE) &&
            this._navigationService.previousURL.includes('manage-entity/create-entity')) {
            this.sortCountObj = deepCloneObject(this.entityDashboardService.sortCountObject);
        } else {
            this.resetSortObjects();
        }
    }

    toggleAdvanceSearch() {
        this.isViewAdvanceSearch = !this.isViewAdvanceSearch;
        this.entityDashboardService.isViewAdvanceSearch = this.isViewAdvanceSearch;
    }

    openGraph(entityListData: DashboardEntityDetails): void {
        this.$subscriptions.push(
            this.entityDashboardService.getEntityVersions(entityListData.entityNumber).subscribe(
                (entityVersionsList: EntireEntityDetails[]) => {
                    const ACTIVE_ENTITY = entityVersionsList?.find((entireEntityDetails) => entireEntityDetails?.entityDetails?.versionStatus?.toString() === ENTITY_VERSION_STATUS.ACTIVE?.toString());
                    if (ACTIVE_ENTITY?.entityDetails) {
                        const TRIGGERED_FROM = 'ENTITY_DASHBOARD';
                        this._commonService.openEntityGraphModal(ACTIVE_ENTITY.entityDetails.entityId, ACTIVE_ENTITY.entityDetails.entityName, TRIGGERED_FROM);
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                }, (error: any) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    sortResult(sortFieldBy) {
        this.sortCountObj[sortFieldBy]++;
        if (this.sortCountObj[sortFieldBy] < 3) {
            this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'ASC' : 'DESC';
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.sortMap[sortFieldBy];
        }
        this.entityDashboardService.entitySearchRequestObject.entityDashboardData.SORT_TYPE = deepCloneObject(this.sortMap);
        this.entityDashboardService.sortCountObj = deepCloneObject(this.sortCountObj);
        this.$entityList.next();
    }

    setSortProperties() {
        this.resetSortObjects();
        const SORT_COUNT_OBJ = deepCloneObject(this.entityDashboardService.sortCountObj);
        this.sortCountObj = (Object.entries(SORT_COUNT_OBJ)?.length === 0) ? this.sortCountObj : SORT_COUNT_OBJ;
        this.sortMap = deepCloneObject(this.entityDashboardService.entitySearchRequestObject.entityDashboardData.SORT_TYPE);
    }

    resetSortObjects() {
        this.sortMap = { UPDATE_TIMESTAMP: 'DESC' };
        this.sortCountObj = {
            'PRIMARY_NAME': 0, 'COUNTRY': 0, 'OWNERSHIP_TYPE': 0, 'ENTITY_STATUS': 0, 'UPDATE_TIMESTAMP': 2
        };
    }

    isActive(colName) {
        if (!isEmptyObject(this.sortMap) && colName in this.sortMap) {
            return true;
        } else {
            return false;
        }
    }

    entityVersionModalActions(modalAction: ModalActionEvent): void {
        if (modalAction.action) {
            this.closeEntityVersionModal();
        }
    }

    closeEntityVersionModal(): void {
        closeCommonModal(this.VERSION_MODAL_ID);
        setTimeout(() => {
            this.entityVersionsList = { activeVersion: null, pendingVersion: null };
        }, 200);
    }

    sharedEntityCardActions(event: SharedEntityCardEvents): void {
        if (event.action === 'VIEW') {
            this.closeEntityVersionModal();
            setTimeout(()=> {
                this.navigateToEntity(event.content.sharedEntityDetails.entityId);
            }, 200);
        }
    }

    openModifyConfirmationModal(entityListData: DashboardEntityDetails) {
        this.modifyConfirmationConfig.ADAOptions.primaryBtnTitle = 'Click here to modify entity';
        this.modifyConfirmationConfig.ADAOptions.secondaryBtnTitle = 'Click here to cancel modification';
        this.currentModifiedEntity = entityListData;
        openCommonModal(this.modifyConfirmationId);
    }

    modifyPostConfirmation(modalActionEvent: ModalActionEvent) {
        if(modalActionEvent.action === 'PRIMARY_BTN') {
            this.modifyEntity();
        } else {
            this.closeModificationConfirmationModal();
        }
    }

}
