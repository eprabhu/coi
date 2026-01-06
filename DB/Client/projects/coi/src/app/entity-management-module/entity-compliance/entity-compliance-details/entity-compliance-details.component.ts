import { debounce } from 'rxjs/operators';
import { interval, Subject, Subscription } from 'rxjs';
import { AUTO_SAVE_DEBOUNCE_TIME } from '../../../app-constants';
import { COMPLIANCE_DETAILS } from '../../shared/entity-constants';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EntityComplianceService } from '../entity-compliance.service';
import { CommonService } from '../../../common/services/common.service';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { EntityManagementService } from '../../entity-management.service';
import { LookUpClass } from '../../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { AutoSaveEvent, AutoSaveService } from '../../../common/services/auto-save.service';
import { deepCloneObject, isEmptyObject } from '../../../common/utilities/custom-utilities';
import { EntityComplianceFields, ComplianceUpdateClass, DataStoreEvent, EntireEntityDetails, EntityComplianceDetails, CoiEntityType, EntityDetails, ComplianceSaveUpdateRO } from '../../shared/entity-interface';

@Component({
    selector: 'app-entity-compliance-details',
    templateUrl: './entity-compliance-details.component.html',
    styleUrls: ['./entity-compliance-details.component.scss']
})
export class EntityComplianceDetailsComponent implements OnInit, OnDestroy {

    @Input() sectionName = '';
    @Input() sectionId: string | number = null;

    commentCount = 0;
    isEditMode = false;
    isShowCommentButton = false;
    entityDetails: EntityDetails = null;
    coiEntityTypeLookup: LookUpClass[] = [];
    selectedCoiEntityType = new LookUpClass();

    private isSaving = false;
    private $subscriptions: Subscription[] = [];
    private $autoSaveDebounceEvent = new Subject<string>();
    private complianceUpdateObj = new ComplianceUpdateClass();
    private changeDetectionObj = new EntityComplianceFields();

    constructor(private _commonService: CommonService,
                private _autoSaveService: AutoSaveService,
                private _dataStoreService: EntityDataStoreService,
                public entityComplianceService: EntityComplianceService,
                public entityManagementService: EntityManagementService) {}

    ngOnInit(): void {
        this.getCoiEntityTypeLookup();
        this.triggerSingleSave();
        this.autoSaveSubscribe();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.fetchComplianceDetails();
    }

    private triggerSingleSave(): void {
        this.$subscriptions.push(this.$autoSaveDebounceEvent.pipe(debounce(() => interval(AUTO_SAVE_DEBOUNCE_TIME))).subscribe((data: string) => {
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

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private async getCoiEntityTypeLookup(): Promise<void> {
        this.coiEntityTypeLookup = await this._commonService.getOrFetchLookup('COI_ENTITY_TYPE', 'ENTITY_TYPE_CODE');
    }

    private fetchComplianceDetails(): void {
        const COMPLIANCE_DETAILS: EntityComplianceDetails = deepCloneObject(this.entityComplianceService.entityCompliance?.complianceInfo);
        if (COMPLIANCE_DETAILS?.coiEntityType?.entityTypeCode) {
            this.selectedCoiEntityType = { code: COMPLIANCE_DETAILS?.coiEntityType?.entityTypeCode || null, description: COMPLIANCE_DETAILS?.coiEntityType?.description || '' };
            this.complianceUpdateObj.entityComplianceFields.entityTypeCode = COMPLIANCE_DETAILS?.coiEntityType?.entityTypeCode;
        }
    }
    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.commentCount = ENTITY_DATA.commentCountList?.[COMPLIANCE_DETAILS.sectionTypeCode] || 0;
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(COMPLIANCE_DETAILS);
        this.checkUserHasRight();
    }

    private checkUserHasRight(): void {
        this.isEditMode = this._dataStoreService.getEditMode() && this._commonService.getAvailableRight(['MANAGE_ENTITY_COMPLIANCE'], 'SOME');
    }

    private autoSaveAPI(): void {
        if (!this.isSaving) {
            const TEMP_AUTO_SAVE_RO: ComplianceUpdateClass = deepCloneObject(this.getAutoSaveRO());
            if (isEmptyObject(TEMP_AUTO_SAVE_RO) || isEmptyObject(TEMP_AUTO_SAVE_RO.entityComplianceFields)) {
                return;
            }
            if (!this.entityComplianceService.entityCompliance?.complianceInfo?.id) {
                this.saveComplianceDetails(TEMP_AUTO_SAVE_RO);
            } else if (!TEMP_AUTO_SAVE_RO.entityComplianceFields.entityTypeCode) {
                this.deleteComplianceEntityType(TEMP_AUTO_SAVE_RO);
            } else {
                this.updateComplianceDetails(TEMP_AUTO_SAVE_RO);
            }
        }
    }

    private getAutoSaveRO(): ComplianceUpdateClass {
        const AUTO_SAVE_PAYLOAD = new ComplianceUpdateClass();
        AUTO_SAVE_PAYLOAD.entityId = this.entityDetails.entityId;
        Object.keys(this.changeDetectionObj).forEach((ele) => {
            if (this.changeDetectionObj[ele]) {
                AUTO_SAVE_PAYLOAD.entityComplianceFields[ele] = this.complianceUpdateObj?.entityComplianceFields[ele]?.trim() || null;
            }
        });
        return AUTO_SAVE_PAYLOAD;
    }

    private saveComplianceDetails(autoSaveRO: ComplianceUpdateClass): void {
        this._commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveRO.entityComplianceFields, false);
        this.isSaving = true;
        this._commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.entityComplianceService.saveComplianceDetails({ entityId: autoSaveRO?.entityId, entityTypeCode: autoSaveRO?.entityComplianceFields?.entityTypeCode })
                .subscribe((complianceDetails: any) => {
                    this.entityComplianceService.entityCompliance.complianceInfo ??= new EntityComplianceDetails();
                    this.entityComplianceService.entityCompliance.complianceInfo.entityId = this.entityDetails?.entityId;
                    this.entityComplianceService.entityCompliance.complianceInfo.id = complianceDetails?.id;
                    this.handleAPISuccess(autoSaveRO);
                }, (error: any) => {
                    this.handleAPIError(autoSaveRO);
                })
        );
        this._commonService.removeLoaderRestriction();
    }

    private updateComplianceDetails(autoSaveRO: ComplianceUpdateClass): void {
        this._commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveRO.entityComplianceFields, false);
        this.isSaving = true;
        this._commonService.setLoaderRestriction();
        const UPDATE_RO: ComplianceSaveUpdateRO = {
            entityId: this.entityDetails?.entityId,
            id: this.entityComplianceService.entityCompliance?.complianceInfo?.id,
            entityTypeCode: autoSaveRO?.entityComplianceFields?.entityTypeCode
        };
        this.$subscriptions.push(
            this.entityComplianceService.updateComplianceDetails(UPDATE_RO)
                .subscribe((complianceDetails: any) => {
                    this.handleAPISuccess(autoSaveRO);
                }, (error: any) => {
                    this.handleAPIError(autoSaveRO);
                })
        );
        this._commonService.removeLoaderRestriction();
    }

    private deleteComplianceEntityType(autoSaveRO: ComplianceUpdateClass): void {
        this._commonService.showAutoSaveSpinner();
        this.setChangesObject(autoSaveRO.entityComplianceFields, false);
        this.isSaving = true;
        this._commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.entityComplianceService.deleteComplianceEntityType(this.entityComplianceService.entityCompliance.complianceInfo.id)
                .subscribe((complianceDetails: any) => {
                    this.entityComplianceService.entityCompliance.complianceInfo = new EntityComplianceDetails();
                    this.handleAPISuccess(autoSaveRO);
                }, (error: any) => {
                    this.handleAPIError(autoSaveRO);
                })
        );
        this._commonService.removeLoaderRestriction();
    }

    private handleAPISuccess(autoSaveRO: ComplianceUpdateClass): void {
        this.isSaving = false;
        this.autoSaveAPI();
        this._dataStoreService.enableModificationHistoryTracking();
        this.setServiceVariable(autoSaveRO.entityComplianceFields);
        this._commonService.setChangesAvailable(false);
        this._commonService.hideAutoSaveSpinner('SUCCESS');
    }

    private setServiceVariable(entityComplianceFields: EntityComplianceFields): void {
        const COMPLIANCE_DTO = this.entityComplianceService?.entityCompliance?.complianceInfo;
        COMPLIANCE_DTO.coiEntityType ??= new CoiEntityType();
        Object.entries(entityComplianceFields).forEach(([key, value]) => {
            key === 'entityTypeCode' ? COMPLIANCE_DTO.coiEntityType.entityTypeCode = value : COMPLIANCE_DTO[key] = value;
        });
    }

    private handleAPIError(autoSaveRO: ComplianceUpdateClass): void {
        this.isSaving = false;
        this.setChangesObject(autoSaveRO.entityComplianceFields, true);
        this._commonService.isShowLoader.next(false);
        this._commonService.hideAutoSaveSpinner('ERROR');
    }

    private setChangesObject(entityComplianceFields: EntityComplianceFields, isChangesAvailable: boolean): void {
        Object.keys(entityComplianceFields).forEach((ele) => {
            this.changeDetectionObj[ele] = isChangesAvailable;
        });
    }

    onCoiEntityTypeSelect(entityTypeCode: string): void {
        this.complianceUpdateObj.entityComplianceFields.entityTypeCode = entityTypeCode || null;
        const SELECTED_TYPE = this.coiEntityTypeLookup?.find(data => data?.code === entityTypeCode);
        this.selectedCoiEntityType.description = SELECTED_TYPE?.description || '';
        this.changeEvent('entityTypeCode');
    }

    openReviewComments(): void {
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: COMPLIANCE_DETAILS.commentTypeCode,
            sectionTypeCode: COMPLIANCE_DETAILS.sectionTypeCode
        });
    }

    changeEvent(key: string): void {
        this._commonService.setChangesAvailable(true);
        this.changeDetectionObj[key] = true;
        this.$autoSaveDebounceEvent.next(key);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

}
