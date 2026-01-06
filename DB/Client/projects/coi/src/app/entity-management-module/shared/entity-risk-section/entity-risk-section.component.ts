import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EntireEntityDetails, EntityDetails, EntityRisk, EntityRiskProxyController, EntityRiskCategoryCode, EntityRiskModalDetails, EntityRiskRO, RiskType, RiskLevel, DataStoreEvent } from '../../shared/entity-interface';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { EntityRiskSectionService } from './entity-risk-section.service';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { closeCommonModal, deepCloneObject, isEmptyObject, openCommonModal } from '../../../common/utilities/custom-utilities';
import { EntityManagementService } from '../../entity-management.service';
import { SUB_AWARD_RISK, COMPLIANCE_RISK, SPONSOR_RISK, ENTITY_RISK } from '../entity-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-entity-risk-section',
    templateUrl: './entity-risk-section.component.html',
    styleUrls: ['./entity-risk-section.component.scss'],
    providers: [EntityRiskSectionService]
})
export class EntityRiskSectionComponent implements OnInit, OnDestroy {

    @Input() sectionId: any;
    @Input() sectionName: any;
    @Input() subSectionId: any;
    @Input() entityRiskList: EntityRisk[];
    @Input() riskCategoryCode: EntityRiskCategoryCode;

    @Output() riskUpdated: EventEmitter<EntityRisk[]> = new EventEmitter<EntityRisk[]>();

    isEditRisk = false;
    isEditMode = false;
    editIndex: number = -1;
    isOpenRiskModal = false;
    mandatoryList = new Map();
    entityRiskTypeList: RiskType[] = [];
    entityRiskLevelList: RiskLevel[] = [];
    entityDetails = new EntityDetails();
    $subscriptions: Subscription[] = [];
    entityRiskModalDetails = new EntityRiskModalDetails();
    entityRiskTypeOptions = 'ENTITY_RISK_TYPE#RISK_TYPE_CODE#false#false';
    entityRiskLevelOption = 'ENTITY_RISK_LEVEL#RISK_LEVEL_CODE#false#false'
    ENTITY_RISK_ADD_MODAL_ID: string = 'entity-risk-add-modal';
    entityRiskModalConfig = new CommonModalConfig(this.ENTITY_RISK_ADD_MODAL_ID, 'Add Risk', 'Cancel', 'lg');
    showSlider = false;
    currentRiskDetails : any;
    modificationIsInProgress = false;
    isShowCommentButton = false;
    commentCount = 0;

    constructor(private _dataStoreService: EntityDataStoreService, public entityManagementService: EntityManagementService,
        private _commonService: CommonService, private _entityRiskSectionService: EntityRiskSectionService) { }

    ngOnInit(): void {
        this.listenDataChangeFromStore();
        this.getDataFromStore();
        this.fetchRiskTypes();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(this.getSectionDetails(this.riskCategoryCode))
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.modificationIsInProgress = ENTITY_DATA.modificationIsInProgress;
        this.isEditMode = this._dataStoreService.getEditMode();
        this.commentCount = ENTITY_DATA.commentCountList?.[this.getSectionDetails(this.riskCategoryCode)?.sectionTypeCode] || 0;
        this.checkUserHasRight();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            }));
    }

    private fetchRiskLevels(riskTypeCode: string): void {
        if (!riskTypeCode) {
            this.entityRiskLevelList = [];
            return;
        }

        this.$subscriptions.push(
            this._entityRiskSectionService.fetchRiskLevels(riskTypeCode).subscribe(
                (riskLevelList: RiskLevel[]) => {
                    this.entityRiskLevelList = riskLevelList;
                },
                (err) => {
                    this.entityRiskLevelList = [];
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            )
        );
    }


    private fetchRiskTypes(): void {
        this.$subscriptions.push(
            this._entityRiskSectionService.fetchRiskTypes(this.riskCategoryCode)
                .subscribe((riskTypeList: RiskType[]) => {
                    this.entityRiskTypeList = riskTypeList;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    private clearRiskDetails(): void {
        closeCommonModal(this.ENTITY_RISK_ADD_MODAL_ID);
        setTimeout(() => {
            this.mandatoryList.clear();
            this.entityRiskLevelList = [];
            this.entityRiskModalDetails = new EntityRiskModalDetails();
        }, 200);
    }

    private saveEntityRisk(): void {
        if (this.entityMandatoryValidation()){
            this.entityRiskModalDetails.entityRisk.entityId = this.entityDetails.entityId;
            this.$subscriptions.push(this._entityRiskSectionService.saveEntityRisk(this.getEntityRO(), this.getProxyController()).subscribe((data: any) => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Risk added successfully.');
                this._dataStoreService.enableModificationHistoryTracking();
                this.addNewRiskDetails(data.entityRiskId);
                this.clearRiskDetails();
            },
            (_err) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in Save Risk. Please try again.');
            }));
        }
    }

    private addNewRiskDetails(entityRiskId: number): void {
        this.entityRiskModalDetails.entityRisk.entityRiskId = entityRiskId;
        const NEW_ENTITY_RISK = deepCloneObject(this.entityRiskModalDetails.entityRisk);
        this.entityRiskList.unshift(NEW_ENTITY_RISK);
        this.riskUpdated.emit(this.entityRiskList);
    }

    private getProxyController(): EntityRiskProxyController {
        switch (this.riskCategoryCode) {
            case 'OR': return '/organization';
            case 'CO': return '/compliance';
            case 'SP': return '/sponsor';
            case 'EN': return '';
            default: return;
        }
    }

    private getSectionDetails(riskCategoryCode: EntityRiskCategoryCode): any {
        switch (riskCategoryCode) {
            case 'OR': return SUB_AWARD_RISK;
            case 'CO': return COMPLIANCE_RISK;
            case 'SP': return SPONSOR_RISK;
            case 'EN': return ENTITY_RISK;
            default: return;
        }
    }

    private getEntityRO(): EntityRiskRO {
        return {
            description: this.entityRiskModalDetails.entityRisk.description,
            entityId: this.entityRiskModalDetails.entityRisk.entityId,
            riskTypeCode: this.entityRiskModalDetails.entityRisk.riskTypeCode,
            entityRiskId: this.entityRiskModalDetails.entityRisk.entityRiskId,
            riskType: this.entityRiskModalDetails.entityRisk.riskType.description,
            riskLevel: this.entityRiskModalDetails.entityRisk.riskLevel.description,
            riskLevelCode: this.entityRiskModalDetails.entityRisk.riskLevelCode,
            modificationIsInProgress: this.modificationIsInProgress
        };
    }

    private entityMandatoryValidation(): boolean {
        this.mandatoryList.clear();
        const { riskLevelCode, riskTypeCode, description, entityRiskId } = this.entityRiskModalDetails.entityRisk;
        if (!riskTypeCode) {
            this.mandatoryList.set('riskType', 'Please select risk type.');
        } else if (this.getHasDuplicateTypeCode(riskTypeCode, entityRiskId)) {
            this.mandatoryList.set('riskType', 'The risk type has already been added. Please update the existing type to make any changes.');
        }
        if (!riskLevelCode) {
            this.mandatoryList.set('riskLevel', 'Please select risk level.');
        }
        if (!description) {
            this.mandatoryList.set('riskDescription', 'Please enter risk description.');
        }

        return this.mandatoryList.size === 0;
    }

    private getHasDuplicateTypeCode(riskTypeCode: string, entityRiskId: number | null): boolean {
        return this.entityRiskList?.some((risk: EntityRisk) => risk?.riskTypeCode === riskTypeCode && risk?.entityRiskId !== entityRiskId);
    }

    onRiskTypeSelected(event: any[] | null): void {
        this.entityRiskModalDetails.entityRisk.riskLevel = null;
        this.entityRiskModalDetails.entityRisk.riskLevelCode = null;
        this.entityRiskModalDetails.selectedRiskLevelLookUpList = [];
        this.entityRiskModalDetails.entityRisk.riskType = event ? event[0] : null;
        this.entityRiskModalDetails.entityRisk.riskTypeCode = event ? event[0]?.riskTypeCode : null;
        this.fetchRiskLevels(this.entityRiskModalDetails.entityRisk.riskTypeCode);
    }

    onRiskLevelSelected(event: any[] | null): void {
        this.entityRiskModalDetails.entityRisk.riskLevel = event ? event[0] : null;
        this.entityRiskModalDetails.entityRisk.riskLevelCode = event ? event[0]?.riskLevelCode : null;
    }

    riskModalActions(modalAction: ModalActionEvent): void {
        switch (modalAction.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN':
                return this.clearRiskDetails();
            case 'PRIMARY_BTN':
                return this.saveEntityRisk();
            default: break;
        }
    }

    openAddEntityRiskModal(): void {
        this.isOpenRiskModal = true;
        this.entityRiskModalConfig.namings.primaryBtnName =  'Add Risk';
        setTimeout(() => {
            openCommonModal(this.ENTITY_RISK_ADD_MODAL_ID);
        }, 100);
    }

    async editOrHistorySlider(risk: EntityRisk, editIndex: number , isEditRisk: boolean): Promise<any>{
        this.editIndex = editIndex;
        this.isEditRisk = isEditRisk;
        this.currentRiskDetails = deepCloneObject(risk);
        this.showSlider = true;
    }

    checkUserHasRight(): void {
        const CAN_MANAGE_ENTITY_SPONSOR = this._commonService.getAvailableRight(['MANAGE_ENTITY_SPONSOR'], 'SOME') && this.riskCategoryCode == 'SP';
        const CAN_MANAGE_ENTITY_ORGANIZATION = this._commonService.getAvailableRight(['MANAGE_ENTITY_ORGANIZATION'], 'SOME') && this.riskCategoryCode == 'OR';
        const CAN_MANAGE_ENTITY_COMPLIANCE = this._commonService.getAvailableRight(['MANAGE_ENTITY_COMPLIANCE'], 'SOME') && this.riskCategoryCode == 'CO';
        const CAN_MANAGE_ENTITY_RISK = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME') && this.riskCategoryCode == 'EN';
        if (!CAN_MANAGE_ENTITY_SPONSOR && !CAN_MANAGE_ENTITY_ORGANIZATION && !CAN_MANAGE_ENTITY_COMPLIANCE && !CAN_MANAGE_ENTITY_RISK ) {
            this.isEditMode = false;
        }
        this.isEditMode = this.isEditMode;
        if (this.isEditMode) {
            this.isEditMode = this._dataStoreService.getOverviewEditRight(this.sectionId)
        }
    }

    closeHeaderSlider(): void {
        this.showSlider = false;
    }

    onRiskUpdated(updatedRisk: any): void {
        if (this.editIndex > -1) {
            this.entityRiskList.splice(this.editIndex, 1);
            this.entityRiskList.unshift(updatedRisk);
            this.editIndex = 0;
            this.riskUpdated.emit(this.entityRiskList);
        }
    }

    openReviewComments(): void {
        const SECTION_DETAILS = this.getSectionDetails(this.riskCategoryCode);
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: SECTION_DETAILS.commentTypeCode,
            sectionTypeCode: SECTION_DETAILS.sectionTypeCode
        });
    }
}
