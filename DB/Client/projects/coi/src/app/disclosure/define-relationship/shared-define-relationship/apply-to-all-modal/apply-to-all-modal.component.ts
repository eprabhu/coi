import { Component, OnDestroy, OnInit } from '@angular/core';
import { DefineRelationshipService } from '../../services/define-relationship.service';
import { ApplyToAllModal, CoiDisclEntProjDetail, ProjectSfiRelationConflictRO, ProjectSfiRelations, SaveProjectSfiConflict } from '../../../coi-interface';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG, ENGAGEMENT_TYPE_ICONS } from '../../../../app-constants';
import { closeCommonModal } from '../../../../common/utilities/custom-utilities';
import { ModalActionEvent } from '../../../../shared-components/common-modal/common-modal.interface';
import { Subscription } from 'rxjs';
import { DataStoreService } from '../../../services/data-store.service';
import { CommonService } from '../../../../common/services/common.service';
import { DefineRelationshipDataStoreService } from '../../services/define-relationship-data-store.service';
import { CoiService } from '../../../services/coi.service';
import { LookUpClass } from '../../../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { environment } from '../../../../../environments/environment';
import { ENGAGEMENT_LOCALIZE } from '../../../../../app/app-locales';

@Component({
    selector: 'app-apply-to-all-modal',
    templateUrl: './apply-to-all-modal.component.html',
    styleUrls: ['./apply-to-all-modal.component.scss']
})
export class ApplyToAllModalComponent implements OnInit, OnDestroy {

    isSaving = false;
    isShowingProjSwitch = true;
    isShowEngagementRisk = false;
    deployMap = environment.deployUrl;
    $subscriptions: Subscription[] = [];
    ENGAGEMENT_LOCALIZE = ENGAGEMENT_LOCALIZE;
    ENGAGEMENT_TYPE_ICONS = ENGAGEMENT_TYPE_ICONS;
    mandatoryList: Map<string, string> = new Map();

    constructor(private _coiService: CoiService,
                private _dataStore: DataStoreService,
                public commonService: CommonService,
                public defineRelationshipService: DefineRelationshipService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService) { }

    ngOnInit(): void {
        this.isShowingProjSwitch = this.defineRelationshipService.currentRelationSwitch === 'PROJECTS';
        this.isShowEngagementRisk = this._dataStore.isShowEngagementRisk;
    }

    ngOnDestroy(): void {
        this.clearApplyToAllModal();
        subscriptionHandler(this.$subscriptions);
    }

    private validateConflictStatus(): void {
        this.mandatoryList.delete('CONFLICT_STATUS');
        if (!this.defineRelationshipService.applyToAllModal.projectConflictStatusCode) {
            this.mandatoryList.set('CONFLICT_STATUS', 'Please select a conflict status.');
        }
    }

    conflictStatusChanged(selectedConflict: LookUpClass): void {
        this.defineRelationshipService.applyToAllModal.projectConflictStatusCode = selectedConflict?.code?.toString() || '';
        this.validateConflictStatus();
    }

    validateDescription(): void {
        this.mandatoryList.delete('CONFLICT_COMMENT');
        if (!this.defineRelationshipService.applyToAllModal.comment) {
            this.mandatoryList.set('CONFLICT_COMMENT', 'Please enter the project - engagements relation.');
        }
    }

    private validateApplyToAll(): boolean {
        this.validateConflictStatus();
        this.validateDescription();
        return this.mandatoryList.size === 0;
    }

    applyToAllModalAction(modalAction: ModalActionEvent): void {
        switch (modalAction.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN':
                return this.clearApplyToAllModal();
            case 'PRIMARY_BTN':
                return this.saveProjectSfiConflict();
            default: break;
        }
    }

    clearApplyToAllModal(): void {
        closeCommonModal('coi-relation-modal');
        setTimeout(() => {
            this.mandatoryList.clear();
            this.defineRelationshipService.applyToAllModal = new ApplyToAllModal();
        }, 200);
    }

    private saveProjectSfiConflict(): void {
        if (!this.isSaving && this.validateApplyToAll()) {
            this.isSaving = true;
            this.commonService.showAutoSaveSpinner();
            this.$subscriptions.push(
                this.defineRelationshipService.saveProjectSfiConflict(this.getProjectSfiRelationConflictRO())
                    .subscribe((res: SaveProjectSfiConflict) => {
                        this.updateApplyToAllResponse(res.conflictDetails);
                        this.commonService.hideAutoSaveSpinner('SUCCESS');
                        this.defineRelationshipService.updateDisclosureConflictStatus(res);
                        this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Conflict status saved successfully.');
                        this.isSaving = false;
                    }, (error: any) => {
                        this.commonService.autoSaveSavingSpinner = 'HIDE';
                        if (error.status === 405) {
                            this.clearApplyToAllModal();
                            this._coiService.concurrentUpdateAction = 'Disclosure';
                        } else {
                            this.isSaving = false;
                            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                        }
                    }));
        }
    }

    private getProjectSfiRelationConflictRO(): ProjectSfiRelationConflictRO {
        const COI_DATA = this._dataStore.getData();
        return new ProjectSfiRelationConflictRO({
            applyAll: true,
            relationshipSFIMode: !this.isShowingProjSwitch,
            personId: COI_DATA.coiDisclosure.person.personId,
            disclosureId: COI_DATA.coiDisclosure.disclosureId,
            projectEngagementDetails: this.defineRelationshipService.applyToAllModal.comment,
            disclosureNumber: COI_DATA.coiDisclosure.disclosureNumber,
            personEntityId: this.isShowingProjSwitch ? undefined : this.defineRelationshipService.applyToAllModal?.selectedEngagement?.personEntityId,
            coiDisclProjectId: this.isShowingProjSwitch ? this.defineRelationshipService.applyToAllModal.coiDisclProjectId : undefined,
            projectConflictStatusCode: this.defineRelationshipService.applyToAllModal.projectConflictStatusCode
        });
    }

    private updateApplyToAllResponse(response: ProjectSfiRelationConflictRO[]): void {
        const PROJECT_SFI_RELATIONS_LIST: ProjectSfiRelations[] = this._defineRelationshipDataStore.getBaseStoreData();
        const MAP: Record<string | number, boolean> = {};
        const MAP_KEY = this.isShowingProjSwitch ? 'coiDisclProjectId' : 'personEntityId';
        PROJECT_SFI_RELATIONS_LIST.forEach((projectSfiRelations: ProjectSfiRelations) => {
            projectSfiRelations?.coiDisclEntProjDetails?.forEach((coiDisclEntProjDetail: CoiDisclEntProjDetail) => {
                const UPDATE_DATA = response?.find((res: ProjectSfiRelationConflictRO) => res.coiDisclProjectEntityRelId === coiDisclEntProjDetail.coiDisclProjectEntityRelId);
                if (UPDATE_DATA) {
                    MAP[MAP_KEY] = true;
                    coiDisclEntProjDetail.personEngagementDetails = UPDATE_DATA?.projectEngagementDetails;
                    coiDisclEntProjDetail.prePersonEntityId = coiDisclEntProjDetail?.personEntityId;
                    coiDisclEntProjDetail.projectConflictStatusCode = UPDATE_DATA?.projectConflictStatusCode;
                    delete this._defineRelationshipDataStore.relationshipMap[coiDisclEntProjDetail.coiDisclProjectEntityRelId];
                    this._defineRelationshipDataStore.updateCoiDisclEntProjDetails(projectSfiRelations.projectId, coiDisclEntProjDetail);
                }
            });
            if (MAP[MAP_KEY]) {
                const { conflictCount, conflictCompleted, conflictStatus, conflictStatusCode } = this.defineRelationshipService.getFormattedConflictData(projectSfiRelations.coiDisclEntProjDetails);
                projectSfiRelations.conflictCount = conflictCount;
                projectSfiRelations.conflictStatus = conflictStatus;
                projectSfiRelations.conflictCompleted = conflictCompleted;
                projectSfiRelations.conflictStatusCode = conflictStatusCode;
                this._defineRelationshipDataStore.updateOrReplaceProject(projectSfiRelations, ['conflictCount', 'conflictCompleted', 'conflictStatus', 'conflictStatusCode']);
            }
        });
        this._defineRelationshipDataStore.$relationsChanged.next({
            searchChanged: false,
            projectId: this.defineRelationshipService.applyToAllModal?.selectedProject?.projectId || null,
            personEntityId: this.defineRelationshipService.applyToAllModal?.selectedEngagement?.personEntityId || null,
            updatedKeys: ['coiDisclEntProjDetails'] // apply to all works based on update key "coiDisclEntProjDetails".
        });
        this.clearApplyToAllModal();
    }

}
