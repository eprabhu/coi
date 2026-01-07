import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isEmptyObject, openCoiSlider } from '../../../../common/utilities/custom-utilities';
import { EntireEntityDetails, EntityRisk, EntityRiskCategoryCode, EntityRiskModalDetails, EntityRiskProxyController, EntityRiskRO, RiskLevel } from '../../entity-interface';
import { Subscription } from 'rxjs';
import { EntityRiskSectionService } from '../entity-risk-section.service';
import { CommonService } from '../../../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { EntityDataStoreService } from '../../../entity-data-store.service';
import { deepCloneObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EntityDetailsCardConfig } from '../../../../common/services/coi-common.interface';

@Component({
    selector: 'app-risk-edit-history-slider',
    templateUrl: './risk-edit-history-slider.component.html',
    styleUrls: ['./risk-edit-history-slider.component.scss']
})
export class RiskEditHistorySlider implements OnInit {

    @Output() closePage: EventEmitter<any> = new EventEmitter<any>();
    @Output() riskUpdated: EventEmitter<EntityRisk[]> = new EventEmitter<EntityRisk[]>();
    @Input() isEditRisk: any;
    @Input() riskCategoryCode: EntityRiskCategoryCode;
    @Input() currentRiskDetails: any;
    @Input() sectionName: any;
    @Input() sectionId: any;
    @Input() subSectionId: any;

    entityCardConfig = new EntityDetailsCardConfig();
    entityRiskModalDetails = new EntityRiskModalDetails();
    $subscriptions: Subscription[] = [];
    entityRiskLevelList: RiskLevel[] = [];
    entityRiskLevelOption = 'Empty#Empty#false#false';
    mandatoryList = new Map();
    riskHistory = [];
    coiEntityDetails: any = {};
    modificationIsInProgress = false;

    constructor(private _entityRiskSectionService: EntityRiskSectionService, private _commonService: CommonService,
        private _dataStoreService: EntityDataStoreService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.loadRiskHistory();
        this.setDefaultEntityValues();
        setTimeout(() => {
            openCoiSlider('risk-edit-history-slider');
        });
    }
    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) {
            return;
        }
        this.modificationIsInProgress = ENTITY_DATA.modificationIsInProgress;
        this.coiEntityDetails = ENTITY_DATA.entityDetails;
        this.setEntityCardDetails(ENTITY_DATA);
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.pipe(debounceTime(200), distinctUntilChanged()).subscribe(() => {
                this.getDataFromStore();
            })
        );
    }

    private setEntityCardDetails(entireEntityDetails: EntireEntityDetails): void {
        this.entityCardConfig = new EntityDetailsCardConfig();
        this.entityCardConfig.entireDetails = entireEntityDetails?.entityDetails;
        this.entityCardConfig.sharedEntityDetails = {
            entityId: entireEntityDetails?.entityDetails?.entityId,
            entityName: entireEntityDetails?.entityDetails?.entityName,
            primaryAddressLine1: entireEntityDetails?.entityDetails?.primaryAddressLine1,
            primaryAddressLine2: entireEntityDetails?.entityDetails?.primaryAddressLine2,
            state: entireEntityDetails?.entityDetails?.state,
            city: entireEntityDetails?.entityDetails?.city,
            postCode: entireEntityDetails?.entityDetails?.postCode,
            country: entireEntityDetails?.entityDetails?.country,
            website: entireEntityDetails?.entityDetails?.websiteAddress,
            dunsNumber: entireEntityDetails?.entityDetails?.dunsNumber,
            foreignName: entireEntityDetails?.foreignNames?.[0]?.foreignName,
            ueiNumber: entireEntityDetails?.entityDetails?.ueiNumber,
            priorName: entireEntityDetails?.priorNames?.[0]?.priorNames,
            cageNumber: entireEntityDetails?.entityDetails?.cageNumber,
            organizationId: entireEntityDetails?.organizationId,
            sponsorCode: entireEntityDetails?.sponsorCode,
            ownershipType: entireEntityDetails?.entityDetails?.entityOwnershipType?.description,
            businessEntityType: {
                description: entireEntityDetails?.entityDetails?.entityBusinessType?.description,
                typeCode: entireEntityDetails?.entityDetails?.entityBusinessType?.businessTypeCode
            },
            entityFamilyTreeRoles: entireEntityDetails?.entityFamilyTreeRoles?.map(role => ({
                description: role.familyRoleType?.description,
                typeCode: role.familyRoleTypeCode,
            })),
            foreignNames: entireEntityDetails?.foreignNames
        };
        this.entityCardConfig.uniqueId = 'risk-slider';
        this.entityCardConfig.cardType = 'DB_ENTITY';
    }

    private setDefaultEntityValues(): void {
        this.entityRiskModalDetails.entityRisk = deepCloneObject(this.currentRiskDetails);
        this.fetchRiskLevels(this.entityRiskModalDetails.entityRisk.riskTypeCode);
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
                (_err) => {
                    this.entityRiskLevelList = [];
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            )
        );
    }

    onRiskLevelSelected(event: any[] | null): void {
        this.entityRiskModalDetails.entityRisk.riskLevel = event ? event[0] : null;
        this.entityRiskModalDetails.entityRisk.riskLevelCode = event ? event[0]?.riskLevelCode : null;
        this.entityRiskModalDetails.entityRisk.description = '';
    }

    updateEntityRisk(): void {
        if (this.entityMandatoryValidation()) {
            this.$subscriptions.push(this._entityRiskSectionService.updateEntityRisk(this.getUpdateRiskRO(), this.getProxyController()).subscribe((data: any) => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Risk updated successfully.');
                this._dataStoreService.enableModificationHistoryTracking();
                this.currentRiskDetails = deepCloneObject(this.entityRiskModalDetails.entityRisk);
                this.riskUpdated.emit(this.currentRiskDetails);
                this.mandatoryList.clear();
                this.loadRiskHistory();
            }, (_err) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in updating risk, please try again.');
            }));
        }
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

    hideConflictNavBar(): void {
        setTimeout(() => {
            this.closePage.emit();
        }, 500);
    }

    private getUpdateRiskRO(): EntityRiskRO {
        const NEW_RISK_DETAILS = this.entityRiskModalDetails.entityRisk;
        const OLD_RISK_DETAILS = this.currentRiskDetails;
        const ENTITY_RO: any = {
            description: NEW_RISK_DETAILS.description,
            entityId: NEW_RISK_DETAILS.entityId,
            riskTypeCode: NEW_RISK_DETAILS.riskTypeCode,
            entityRiskId: NEW_RISK_DETAILS.entityRiskId,
            riskType: NEW_RISK_DETAILS.riskType.description,
            modificationIsInProgress: this.modificationIsInProgress
        };

        // This condition checks whether the risk level has changed between the new (NEW_RISK_DETAILS) and old (OLD_RISK_DETAILS) risk details.
        if (NEW_RISK_DETAILS.riskLevelCode !== OLD_RISK_DETAILS.riskLevelCode) {
            ENTITY_RO.riskLevel = NEW_RISK_DETAILS.riskLevel.description;
            ENTITY_RO.riskLevelCode = NEW_RISK_DETAILS.riskLevelCode;
            ENTITY_RO.oldRiskLevelCode = OLD_RISK_DETAILS.riskLevelCode;
            ENTITY_RO.oldRiskLevel = OLD_RISK_DETAILS.riskLevel.description;
        }
        
        // This condition checks whether the risk description has changed between the new and old risk details.
        if (NEW_RISK_DETAILS.description !== OLD_RISK_DETAILS.description) {
            ENTITY_RO.oldDescription = OLD_RISK_DETAILS.description;
        }

        return ENTITY_RO;
    }

    private entityMandatoryValidation(): boolean {
        this.mandatoryList.clear();
        const { riskLevelCode, riskTypeCode, description } = this.entityRiskModalDetails.entityRisk;
        if (!riskTypeCode) {
            this.mandatoryList.set('riskType', 'Please select risk type.');
        }
        if (!riskLevelCode) {
            this.mandatoryList.set('riskLevel', 'Please select risk level.');
        }
        if (!description) {
            this.mandatoryList.set('riskDescription', 'Please enter risk description.');
        }
        if ((this.entityRiskModalDetails.entityRisk.description === this.currentRiskDetails.description &&
            this.entityRiskModalDetails.entityRisk.riskLevel.description === this.currentRiskDetails.riskLevel.description)) {
            this.mandatoryList.set('duplicateStatus', 'You are trying to update the Risk Description with the current Risk Description of the Entity.');
        }
        return this.mandatoryList.size === 0;
    }

    private loadRiskHistory(): void {
        this.$subscriptions.push(
            this._entityRiskSectionService.loadRiskHistory(this.currentRiskDetails.entityRiskId).subscribe((data: any) => {
                this.riskHistory = data;
            }, (_err) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching conflict status history. Please try again.');
            }));
    }

    clearRiskSlider(): void {
        setTimeout(() => {
            this.mandatoryList.clear();
            this.entityRiskModalDetails.entityRisk.description = '';
            this.entityRiskModalDetails.entityRisk.riskLevel = null;
            this.entityRiskModalDetails.entityRisk.riskLevelCode = null;
            this.entityRiskModalDetails.selectedRiskLevelLookUpList = [];
        }, 100);
    }
}
