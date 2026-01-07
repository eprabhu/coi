import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';
import { DataStoreService } from '../../../services/data-store.service';
import { deepCloneObject, isEmptyObject, openCommonModal } from '../../../../common/utilities/custom-utilities';
import { DefineRelationshipService } from '../../services/define-relationship.service';
import { COI, CoiDisclEntProjDetail, CoiProjConflictStatusType, DefineRelationshipDataStore, ProjectSfiRelationConflictRO, ProjectSfiRelations } from '../../../coi-interface';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { PROJECT_CONFLICT_STATUS_BADGE, RISK_ICON_COLOR_MAPPING } from '../../../../app-constants';
import { DefineRelationshipDataStoreService } from '../../services/define-relationship-data-store.service';
import { COISortObj, DataStoreEvent, GlobalEventNotifier, LookUpClass } from '../../../../common/services/coi-common.interface';
import { CoiService } from '../../../services/coi.service';
import { slideInAnimation, scaleOutAnimation } from '../../../../common/utilities/animations';
import { environment } from '../../../../../environments/environment';
import { DYNAMIC_SELECT_LIMIT } from '../../../../shared-components/dynamic-select/dynamic-select.component';
import { ENGAGEMENT_LOCALIZE } from '../../../../app-locales';

@Component({
    selector: 'app-project-sfi-conflict',
    templateUrl: './project-sfi-conflict.component.html',
    styleUrls: ['./project-sfi-conflict.component.scss'],
    animations: [
        slideInAnimation('0','12px', 400, 'slideUp'),
        slideInAnimation('0','-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px','0', 200, 'scaleOut')
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectSfiConflictComponent implements OnInit, OnDestroy {

    @Input() projectSfiRelation = new ProjectSfiRelations();
    @Input() isShowEngagementRisk = false;

    readMore = {};
    sliceCount = 55;
    coiData = new COI();
    $subscriptions: Subscription[] = [];
    riskIconColor = RISK_ICON_COLOR_MAPPING;
    PROJECT_CONFLICT_STATUS_BADGE = PROJECT_CONFLICT_STATUS_BADGE;
    isDesc: Record<string, COISortObj | null> = { entityName: null, projectConflictStatusCode: null };
    applyAllHelpText = {
        PROJECTS: `Click 'Apply to All' to update the Conflict Status and Description for all engagements.`,
        ENGAGEMENTS: `Click 'Apply to All' to update the Conflict Status and Description for all project.`,
    };
    isShowFilter = false;
    isShowCommentButton = false;
    deployMap = environment.deployUrl;
    commentCounts: { [moduleId: string]: number } = {};
    showRelations: boolean[] = [];
    filteredProjectRelation = new ProjectSfiRelations();
    currentSortState = {
        key: null,
        order: null
    };
    ENGAGEMENT_LOCALIZE = ENGAGEMENT_LOCALIZE;
    DYNAMIC_SELECT_LIMIT = DYNAMIC_SELECT_LIMIT;

    constructor(public commonService: CommonService,
        private _coiService: CoiService,
        public defineRelationshipService: DefineRelationshipService,
        private _dataStore: DataStoreService, private _cdr: ChangeDetectorRef,
        private _defineRelationshipDataStore: DefineRelationshipDataStoreService) {
            this.setReadMoreSliceCount();
        }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    ngOnInit(): void {
        this.filteredProjectRelation = deepCloneObject(this.projectSfiRelation);
        this.updateRelationFromCache();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.listenAddConflictSliderChange();
        this.listenDataChangeFromRelationStore();
        this.checkIfAnyError();
        this.setStickyTop();
    }

    /**
     * Updates the in-memory relationship details for both `projectSfiRelation` and `filteredProjectRelation`
     * from the cached `relationshipMap` in `_defineRelationshipDataStore`.
     *
     * This ensures that any manually entered relationship data (not yet saved to the backend)
     * is restored when the component is recreated after being destroyed for performance optimization
     * (e.g., when it goes out of view and is removed from the DOM).
     */
    private updateRelationFromCache(): void {
        Object.entries(this._defineRelationshipDataStore.relationshipMap || {}).forEach(
            ([key, { projectConflictStatusCode, personEngagementDetails }]) => {
                const PROJECT_SFI_MATCH = this.projectSfiRelation?.coiDisclEntProjDetails
                    ?.find(engDetails => engDetails?.coiDisclProjectEntityRelId.toString() === key.toString());
                const FILTERED_PROJECT_MATCH = this.filteredProjectRelation?.coiDisclEntProjDetails
                    ?.find(engDetails => engDetails?.coiDisclProjectEntityRelId.toString() === key.toString());
                if (PROJECT_SFI_MATCH) {
                    PROJECT_SFI_MATCH.projectConflictStatusCode = projectConflictStatusCode;
                    PROJECT_SFI_MATCH.personEngagementDetails = personEngagementDetails;
                }
                if (FILTERED_PROJECT_MATCH) {
                    FILTERED_PROJECT_MATCH.projectConflictStatusCode = projectConflictStatusCode;
                    FILTERED_PROJECT_MATCH.personEngagementDetails = personEngagementDetails;
                }
            });
    }

    /**
     * Caches the given relationship details into `relationshipMap`
     * so that manually entered data can be restored later if the component
     * is destroyed (e.g., when removed from the view for performance reasons)
     * before the data is saved to the backend.
     */
    private cacheConflictRelation(sfiDetails: CoiDisclEntProjDetail): void {
        this._defineRelationshipDataStore.relationshipMap[sfiDetails.coiDisclProjectEntityRelId] = {
            personEngagementDetails: sfiDetails.personEngagementDetails,
            projectConflictStatusCode: sfiDetails.projectConflictStatusCode
        };
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((data: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private getDataFromStore(): void {
        const COI_DATA = this._dataStore.getData();
        if (isEmptyObject(COI_DATA)) { return; }
        this.coiData = COI_DATA;
        this.isShowCommentButton = this._dataStore.getCommentButtonVisibility();
        this.setCommentCount(this.projectSfiRelation.coiDisclEntProjDetails || []);
    }

    private listenDataChangeFromRelationStore(): void {
        this.$subscriptions.push(
            this._defineRelationshipDataStore.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes.projectId == 'ALL' || changes.projectId == this.projectSfiRelation.projectId || changes.personEntityId == this.projectSfiRelation.personEntityId) {
                    if (changes.coiDisclProjectEntityRelId) {
                        const SFI_DETAILS = this.projectSfiRelation?.coiDisclEntProjDetails?.find(sfiDetails => sfiDetails?.coiDisclProjectEntityRelId == changes.coiDisclProjectEntityRelId);
                        const SFI_DETAILS_FILTERED = this.filteredProjectRelation?.coiDisclEntProjDetails?.find(sfiDetails => sfiDetails?.coiDisclProjectEntityRelId == changes.coiDisclProjectEntityRelId);
                        if (SFI_DETAILS) {
                            SFI_DETAILS.prePersonEntityId = SFI_DETAILS.personEntityId;
                        }
                        if (SFI_DETAILS_FILTERED) {
                            SFI_DETAILS_FILTERED.prePersonEntityId = SFI_DETAILS_FILTERED.personEntityId;
                        }
                    }
                    this._cdr.markForCheck();
                }
            })
        );
    }

    private listenAddConflictSliderChange(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'COI_DISCLOSURE_ADD_CONFLICT_UPDATE' && event.content.projectSfiRelations.projectId === this.projectSfiRelation.projectId) {
                    this.updateSfiDetails(event.content.coiDisclEntProjDetail);
                }
            })
        );
    }

    private validateProjectSfiConflict(sfiDetails: CoiDisclEntProjDetail): boolean {
        const IS_VALID_CONFLICT_STATUS = this.validateConflictStatus(sfiDetails);
        const IS_VALID_CONFLICT_COMMENT = this.validateDescription(sfiDetails);
        return IS_VALID_CONFLICT_STATUS && IS_VALID_CONFLICT_COMMENT;
    }

    private validateConflictStatus(sfiDetails: CoiDisclEntProjDetail): boolean {
        this.defineRelationshipService.mandatoryList.delete('CONFLICT_STATUS_' + sfiDetails?.coiDisclProjectEntityRelId);
        if (!sfiDetails?.projectConflictStatusCode) {
            this.defineRelationshipService.mandatoryList.set('CONFLICT_STATUS_' + sfiDetails?.coiDisclProjectEntityRelId, 'Please select a conflict status.');
        }
        return !this.defineRelationshipService.mandatoryList.has('CONFLICT_STATUS_' + sfiDetails?.coiDisclProjectEntityRelId);
    }

    private validateDescription(sfiDetails: CoiDisclEntProjDetail): boolean {
        this.defineRelationshipService.mandatoryList.delete('CONFLICT_COMMENT_' + sfiDetails?.coiDisclProjectEntityRelId);
        if (!sfiDetails?.personEngagementDetails?.trim()) {
            this.defineRelationshipService.mandatoryList.set('CONFLICT_COMMENT_' + sfiDetails?.coiDisclProjectEntityRelId, 'Please enter the project - engagement relation.');
        }
        return !this.defineRelationshipService.mandatoryList.has('CONFLICT_COMMENT_' + sfiDetails?.coiDisclProjectEntityRelId);
    }

    private updateSfiDetails(sfiDetails: CoiDisclEntProjDetail, res?: ProjectSfiRelationConflictRO): void {
        const SFI_DETAILS = this.projectSfiRelation.coiDisclEntProjDetails?.find(details => details.coiDisclProjectEntityRelId === sfiDetails.coiDisclProjectEntityRelId);
        SFI_DETAILS.prePersonEntityId = SFI_DETAILS?.personEntityId;
        const STATUS_TYPE = this.defineRelationshipService.coiStatusList?.find((type: CoiProjConflictStatusType) =>
            type.projectConflictStatusCode === sfiDetails.projectConflictStatusCode
        );
        SFI_DETAILS.coiProjConflictStatusType = deepCloneObject(STATUS_TYPE);
        SFI_DETAILS.projectConflictStatusCode = deepCloneObject(STATUS_TYPE?.projectConflictStatusCode);
        const { conflictCount, conflictCompleted, conflictStatusCode, conflictStatus } = this.defineRelationshipService.getFormattedConflictData(this.projectSfiRelation.coiDisclEntProjDetails);
        this.projectSfiRelation.conflictCount = conflictCount;
        this.projectSfiRelation.conflictStatus = conflictStatus;
        this.projectSfiRelation.conflictCompleted = conflictCompleted;
        this.projectSfiRelation.conflictStatusCode = conflictStatusCode;
        this._defineRelationshipDataStore.updateOrReplaceProject(this.projectSfiRelation, ['conflictCount', 'conflictCompleted', 'conflictStatus', 'conflictStatusCode']);
        this._defineRelationshipDataStore.updateCoiDisclEntProjDetails(this.projectSfiRelation.projectId, SFI_DETAILS);
    }

    private checkIfAnyError(): void {
        this.projectSfiRelation?.coiDisclEntProjDetails?.forEach((sfiDetails: CoiDisclEntProjDetail) => {
            if (sfiDetails?.projectConflictStatusCode && !sfiDetails?.personEngagementDetails) {
                this.validateDescription(sfiDetails);
            }
        });
    }

    private onSortClick(sortKey?: 'entityName' | 'projectConflictStatusCode' | null, order?: 'ASC' | 'DESC' | null): void {
        this.currentSortState.key = sortKey;
        this.currentSortState.order = order;
        this.filteredProjectRelation = this.sortCoiDisclEntProjDetails(this.isDesc[sortKey]);
        this.updateRelationFromCache();
    }

    private sortCoiDisclEntProjDetails(sortOption: COISortObj | null): ProjectSfiRelations {
        const DATA = deepCloneObject(this.projectSfiRelation);

        // If sortOption is null, return original data without sorting
        if (!sortOption) return DATA;

        const { key, parentKey = '', order } = sortOption;

        DATA?.coiDisclEntProjDetails?.sort((a, b) => {
            let valueA = parentKey ? a[parentKey]?.[key] ?? '' : a[key] ?? '';
            let valueB = parentKey ? b[parentKey]?.[key] ?? '' : b[key] ?? '';

            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();

            if (valueA > valueB) return order === 'ASC' ? 1 : -1;
            if (valueA < valueB) return order === 'ASC' ? -1 : 1;

            return 0; // Maintain original order if values are equal
        });
        return DATA;
    }

    private setReadMoreSliceCount(): void {
        if (!this.defineRelationshipService.isEditMode) {
            switch (true) {
                case window.innerWidth >= 1800:
                    this.sliceCount = 110;
                    break;
                case window.innerWidth >= 1500:
                    this.sliceCount = 60;
                    break;
                case window.innerWidth >= 1400:
                    this.sliceCount = 50;
                    break;
                case window.innerWidth >= 1300:
                    this.sliceCount = 100;
                    break;
                case window.innerWidth >= 1200:
                    this.sliceCount = 85;
                    break;
                case window.innerWidth >= 1100:
                    this.sliceCount = 70;
                    break;
                case window.innerWidth >= 992:
                    this.sliceCount = 55;
                    break;
                case window.innerWidth >= 768:
                    this.sliceCount = 60;
                    break;
                default:
                    this.sliceCount = 40;
            }
        }
    }

    private setStickyTop(): void {
        const UNIQUE_ID = this.projectSfiRelation?.projectId || this.projectSfiRelation?.personEntityId;
        const STICKY_TOP = document.getElementById('project_relationship_card_' + UNIQUE_ID)?.clientHeight ?? 0;
        const STICKY_ELEMENT = document.getElementById('coi-relationship-' + UNIQUE_ID);
        if (STICKY_ELEMENT) {
            STICKY_ELEMENT.style.top = STICKY_TOP + 'px';
        }
    }

    openApplyToAllModal(): void {
        this.defineRelationshipService.applyToAllModal.isOpenModal = true;
        this.defineRelationshipService.applyToAllModal.coiDisclProjectId = this.projectSfiRelation.coiDisclProjectId;
        this.defineRelationshipService.applyToAllModal.selectedProject = {
            projectNumber: this.projectSfiRelation?.projectNumber,
            sponsorCode: this.projectSfiRelation?.sponsorCode,
            primeSponsorCode: this.projectSfiRelation?.primeSponsorCode,
            sponsorName: this.projectSfiRelation?.sponsorName,
            homeUnitName: this.projectSfiRelation?.homeUnitName,
            homeUnitNumber: this.projectSfiRelation?.homeUnitNumber,
            primeSponsorName: this.projectSfiRelation?.primeSponsorName,
            projectStatus: this.projectSfiRelation?.projectStatus,
            piName: this.projectSfiRelation?.piName,
            projectStartDate: this.projectSfiRelation?.projectStartDate,
            projectEndDate: this.projectSfiRelation?.projectEndDate,
            projectBadgeColour: this.projectSfiRelation?.projectBadgeColour,
            projectIcon: this.projectSfiRelation?.projectIcon,
            projectType: this.projectSfiRelation?.projectType,
            projectTypeCode: this.projectSfiRelation?.projectTypeCode,
            projectTitle: this.projectSfiRelation?.title,
            documentNumber: this.projectSfiRelation?.documentNumber,
            accountNumber: this.projectSfiRelation?.accountNumber,
            projectId: this.projectSfiRelation?.projectId,
            reporterRole: this.projectSfiRelation?.reporterRole,
        };
        this.defineRelationshipService.applyToAllModal.selectedEngagement = this.projectSfiRelation?.personEntity;
        setTimeout(() => {
            openCommonModal('coi-relation-modal');
        });
    }

    conflictStatusChanged(sfiDetails: CoiDisclEntProjDetail, fieldType: 'CONFLICT_STATUS' | 'DESCRIPTION', selectedConflict: LookUpClass): void {
        const STATUS_TYPE = this.defineRelationshipService.coiStatusList?.find((type: CoiProjConflictStatusType) =>
            type.projectConflictStatusCode.toString() === selectedConflict?.code?.toString()
        );
        sfiDetails.coiProjConflictStatusType = deepCloneObject(STATUS_TYPE);
        sfiDetails.projectConflictStatusCode = deepCloneObject(STATUS_TYPE?.projectConflictStatusCode);
        this.triggerAutoSave(sfiDetails, fieldType);
    }

    triggerAutoSave(sfiDetails: CoiDisclEntProjDetail, fieldType: 'CONFLICT_STATUS' | 'DESCRIPTION'): void {
        this.commonService.setChangesAvailable(true);
        if (fieldType === 'CONFLICT_STATUS') {
            const SELECTED_STATUS_CODE = sfiDetails?.projectConflictStatusCode?.toString();
            const SELECTED_CONFLICT_STATUS = this.defineRelationshipService.coiStatusList
                    ?.find(status => status.projectConflictStatusCode?.toString() === SELECTED_STATUS_CODE);
            const TRIMMED_CONTENT = SELECTED_CONFLICT_STATUS?.defaultConflictComment?.trim();
            sfiDetails.personEngagementDetails = TRIMMED_CONTENT || '';
        }
        this.cacheConflictRelation(sfiDetails);
        if (this.validateProjectSfiConflict(sfiDetails)) {
            const HAS_CONTAIN_SFI_INDEX = this.defineRelationshipService.autoSaveKeysList.findIndex(
                (details: CoiDisclEntProjDetail) => details.coiDisclProjectEntityRelId === sfiDetails.coiDisclProjectEntityRelId
            );
            if (HAS_CONTAIN_SFI_INDEX > -1) {
                // Replace the existing item
                this.defineRelationshipService.autoSaveKeysList[HAS_CONTAIN_SFI_INDEX] = sfiDetails;
            } else {
                // Add the new item
                this.defineRelationshipService.autoSaveKeysList.push(sfiDetails);
            }
            this.defineRelationshipService.$autoSaveDebounce.next();
        }
    }

    sortEntityName(): void {
        this.sortColumn('entityName', 'personEntity');
    }

    sortConflictStatus(): void {
        this.sortColumn('projectConflictStatusCode');
    }

    sortColumn(sortKey: 'entityName' | 'projectConflictStatusCode', parentKey: string = ''): void {
        const CURRENT_ORDER = this.isDesc[sortKey]?.order;
        const NEW_ORDER = !CURRENT_ORDER ? 'ASC' : CURRENT_ORDER === 'ASC' ? 'DESC' : null;

        this.isDesc = { entityName: null, projectConflictStatusCode: null };
        if (NEW_ORDER) {
            this.isDesc[sortKey] = { key: sortKey, parentKey, order: NEW_ORDER };
            this.onSortClick(sortKey, NEW_ORDER);
        } else {
            this.onSortClick();
        }
    }

    openReviewerComment(coiDisclEntProjDetail: CoiDisclEntProjDetail): void {
        this.defineRelationshipService.openReviewerComment(this.projectSfiRelation, 'SFI', coiDisclEntProjDetail);
    }

    openAddConflictSlider(coiDisclEntProjDetail: CoiDisclEntProjDetail): void {
        this.defineRelationshipService.addConflictSlider = {
            isOpenSlider: true,
            coiDisclEntProjDetail: coiDisclEntProjDetail,
            projectSfiRelations: this.projectSfiRelation
        }
    }

    private setCommentCount(relationDetails: CoiDisclEntProjDetail[]): void {
        relationDetails.forEach((item: CoiDisclEntProjDetail) => {
            const COMMENT_COUNT = this.getCommentCount(item?.coiDisclProjectEntityRelId);
            this.commentCounts[item?.coiDisclProjectEntityRelId] = COMMENT_COUNT;
        });
        this._cdr.detectChanges();
    }

    private getCommentCount(subModuleItemKey: string | number): number {
        const COI_DATA = this._dataStore.getData();
        const REVIEW_COMMENTS = COI_DATA?.disclosureCommentsCount?.reviewCommentsCount || [];
        const RELATIONSHIP_COMMENT_DETAILS = REVIEW_COMMENTS.find(item => String(item.subModuleItemKey) === String(subModuleItemKey));
        return RELATIONSHIP_COMMENT_DETAILS?.count ?? 0;
    }

    viewEntityDetails(entityId: string | number): void {
        this.commonService.openEntityDetailsModal(entityId);
    }

    openEngagementSlider(selectedEngagementId: string | number): void {
        this._coiService.openEngagementSlider(selectedEngagementId);
    }

    openProjectHierarchySlider(projectDetails: CoiDisclEntProjDetail): void {
        this.commonService.openProjectHierarchySlider(projectDetails.moduleCode, projectDetails.projectNumber);
    }

}
