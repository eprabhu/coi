import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ENGAGEMENT_TYPE_ICONS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { DefineRelationshipService } from './define-relationship.service';
import { deepCloneObject, isExistSearchWord } from '../../../common/utilities/custom-utilities';
import { ProjectSfiRelations, CoiDisclEntProjDetail, DefineRelationshipDataStore } from '../../coi-interface';

@Injectable()
export class DefineRelationshipDataStoreService {

    private projectSfiRelationsList: ProjectSfiRelations[] = [];
    private filteredProjectSfiRelationsList: ProjectSfiRelations[] = [];

    $relationsChanged = new Subject<DefineRelationshipDataStore>();
    relationshipMap: Record<number, { projectConflictStatusCode: string | null, personEngagementDetails: string | null }> = {};

    constructor(private _defineRelationshipService: DefineRelationshipService, private _commonService: CommonService) {}

    private getFilteredDisclosureListForSearchWord(payload: DefineRelationshipDataStore): void {
        this.processProjectsSFIDetails(this.projectSfiRelationsList);
        const FILTERED_LIST: ProjectSfiRelations[] = this.getRelationshipList(this.projectSfiRelationsList)?.filter((projectSfiRelations: ProjectSfiRelations) => {
            const { searchText, searchKeys } = this._defineRelationshipService;
            return isExistSearchWord(projectSfiRelations, searchText, searchKeys[this._defineRelationshipService.currentRelationSwitch], false);
        });
        this.filteredProjectSfiRelationsList = FILTERED_LIST ? deepCloneObject(FILTERED_LIST) : [];
        this._defineRelationshipService.isLoading = false;
        this.$relationsChanged.next(payload);
    }

    private getProjectData(relationshipList: ProjectSfiRelations[], projOrEngId?: string | number): any {
        if (!projOrEngId) {
            // If no projectId is provided, return the entire list
            return deepCloneObject(relationshipList);
        }
        // Find the specific project by projectId
        const IS_PROJECT_SWITCH = this._defineRelationshipService.currentRelationSwitch === 'PROJECTS';
        const PROJECT = relationshipList.find(p => {
            const ID = IS_PROJECT_SWITCH ? p?.projectId : p?.personEntityId;
            return ID === projOrEngId;
        });
        if (!PROJECT) {
            return undefined;
        }
        return deepCloneObject(PROJECT);
    }

    private processProjectsSFIDetails(ProjectSfiRelationsList: ProjectSfiRelations[]): void {
        ProjectSfiRelationsList.forEach((project: ProjectSfiRelations) => {
            const RELATION_TYPE_MAP: { [key: string]: any } = {};
            const ICON_MAP: { [key: string]: any } = {};
            project.coiDisclEntProjDetails?.forEach((coiDisclEntProjDetail: CoiDisclEntProjDetail) => {
                coiDisclEntProjDetail.projectConflictStatusCode = coiDisclEntProjDetail.projectConflictStatusCode || null;
                const PERSON_ENTITY = coiDisclEntProjDetail?.personEntity;
                const ENTITY_RELATION_TYPE = PERSON_ENTITY?.validPersonEntityRelType;
                if (!PERSON_ENTITY || !ENTITY_RELATION_TYPE) {
                    return;
                }
                // Fetch or create the personEntityRelations based on ENTITY_RELATION_TYPE
                if (!RELATION_TYPE_MAP[ENTITY_RELATION_TYPE]) {
                    RELATION_TYPE_MAP[ENTITY_RELATION_TYPE] = this._commonService.getEntityRelationTypePills(ENTITY_RELATION_TYPE);
                }
                const SEPARATED_RELATIONS = RELATION_TYPE_MAP[ENTITY_RELATION_TYPE];
                SEPARATED_RELATIONS?.forEach((entityRelation: any) => {
                    const RELATIONSHIP_TYPE = entityRelation.relationshipType;
                    // Fetch or create the icon for the RELATIONSHIP_TYPE
                    if (!ICON_MAP[RELATIONSHIP_TYPE]) {
                        ICON_MAP[RELATIONSHIP_TYPE] = ENGAGEMENT_TYPE_ICONS[RELATIONSHIP_TYPE];
                    }
                    entityRelation.icon = ICON_MAP[RELATIONSHIP_TYPE];
                });
                PERSON_ENTITY.personEntityRelations = this._commonService.convertRelationshipData(SEPARATED_RELATIONS);
            });
        });
    }

    setStoreData(data: ProjectSfiRelations[]): void {
        this.relationshipMap = {};
        this.projectSfiRelationsList = deepCloneObject(data);
        const PAY_LOAD: DefineRelationshipDataStore = {
            projectId: 'ALL',
            personEntityId: 'ALL',
            searchChanged: true,
            updatedKeys: [] // No specific keys updated for full data reset
        };
        this.getFilteredDisclosureListForSearchWord(PAY_LOAD);
    }

    getRelationshipList(projectSfiRelationsList: ProjectSfiRelations[]): any {
        const IS_PROJECT_SWITCH = this._defineRelationshipService.currentRelationSwitch === 'PROJECTS';
        return IS_PROJECT_SWITCH ? projectSfiRelationsList : this.flipProjectsToEngagements(projectSfiRelationsList);
    }

    getBaseStoreData(projectId?: string): any {
        return this.getProjectData(this.projectSfiRelationsList, projectId);
    }

    getActualStoreData(projOrEngId?: string | number): any {
        return this.getProjectData(this.getRelationshipList(this.projectSfiRelationsList), projOrEngId);
    }

    getFilteredStoreData(projOrEngId?: string | number): any {
        return this.getProjectData(this.filteredProjectSfiRelationsList, projOrEngId);
    }

    searchTextChanged(): void {
        const PAY_LOAD: DefineRelationshipDataStore = {
            searchChanged: true,
            projectId: 'ALL',
            personEntityId: 'ALL',
            updatedKeys: [] // No specific keys updated for full data reset
        };
        this.getFilteredDisclosureListForSearchWord(PAY_LOAD);
    }

    // Update or replace a ProjectSfiRelations object in the list
    updateOrReplaceProject(update: ProjectSfiRelations | Partial<ProjectSfiRelations>, keysToUpdate?: Array<keyof ProjectSfiRelations>): void {
        const IS_FULL_UPDATE = 'projectId' in update && Object.keys(update).length === Object.keys(new ProjectSfiRelations()).length;
        let PAY_LOAD = new DefineRelationshipDataStore();
        this.projectSfiRelationsList = this.projectSfiRelationsList?.map(projectSfiRelations => {
            if (projectSfiRelations.projectId === update.projectId) {
                if (keysToUpdate) {
                    // Partial update: only update specified keys
                    const UPDATED_KEYS: string[] = [];
                    const UPDATED_ITEMS: any = { ...projectSfiRelations };
                    keysToUpdate.forEach(key => {
                        if (key in update) {
                            UPDATED_ITEMS[key] = deepCloneObject(update[key]);
                            UPDATED_KEYS.push(key as string);
                        }
                    });
                    // Emit details about the partial update
                    PAY_LOAD = {
                        searchChanged: false,
                        updatedKeys: UPDATED_KEYS,
                        projectId: update.projectId,
                        personEntityId: UPDATED_KEYS.includes('coiDisclEntProjDetails') ? 'ALL' : null
                    };
                    return UPDATED_ITEMS;
                } else {
                    // Full update: replace the entire projectSfiRelations
                    const UPDATED_ITEMS = IS_FULL_UPDATE
                        ? deepCloneObject(update as ProjectSfiRelations)
                        : deepCloneObject({ ...projectSfiRelations, ...update });

                    // Emit details about the full update
                    const ALL_KEYS = Object.keys(UPDATED_ITEMS) as Array<keyof ProjectSfiRelations>;
                    PAY_LOAD = {
                        searchChanged: false,
                        updatedKeys: ALL_KEYS,
                        projectId: update.projectId,
                        personEntityId: ALL_KEYS.includes('coiDisclEntProjDetails') ? 'ALL' : null
                    };
                    return UPDATED_ITEMS;
                }
            }
            return projectSfiRelations;
        });
        this.getFilteredDisclosureListForSearchWord(PAY_LOAD);
    }

    // Update or replace coiDisclEntProjDetails within a ProjectSfiRelations object
    updateCoiDisclEntProjDetails(projectId: string, update: Partial<CoiDisclEntProjDetail> | CoiDisclEntProjDetail, keysToUpdate?: Array<keyof CoiDisclEntProjDetail>): void {
        const UPDATED_KEYS: string[] = [];
        const ENTITY_ID: number | string = update.personEntityId;
        this.projectSfiRelationsList = this.projectSfiRelationsList?.map(project => {
            if (project.projectId === projectId) {
                const updatedDetails = project.coiDisclEntProjDetails?.map(detail => {
                    if (update instanceof Array) {
                        // If update is an array, handle it by replacing matching items
                        return update.find(u => u.personEntityId === detail.personEntityId) || detail;
                    } else if ('personEntityId' in update && update.personEntityId === detail.personEntityId) {
                        if (keysToUpdate) {
                            // Partial update of a specific detail
                            const updatedDetail: CoiDisclEntProjDetail = { ...detail };
                            keysToUpdate.forEach((key: any) => {
                                if (key in update) {
                                    updatedDetail[key] = deepCloneObject(update[key]);
                                    UPDATED_KEYS.push(key as string);
                                }
                            });
                            return updatedDetail;
                        } else {
                            // Full update of a specific detail
                            const updatedDetail = deepCloneObject({ ...detail, ...update });
                            UPDATED_KEYS.push(...Object.keys(updatedDetail));
                            return updatedDetail;
                        }
                    }
                    return detail;
                });
                return { ...project, coiDisclEntProjDetails: updatedDetails };
            }
            return project;
        });
        // Notify listeners about the changes
        const PAY_LOAD: DefineRelationshipDataStore = {
            personEntityId: ENTITY_ID,
            searchChanged: false,
            projectId: projectId,
            updatedKeys: UPDATED_KEYS,
            coiDisclProjectEntityRelId: update?.coiDisclProjectEntityRelId,
        };
        this.getFilteredDisclosureListForSearchWord(PAY_LOAD);
    }

    // Function to flip projects -> engagements, putting projects in coiDisclProjDetails using spread
    flipProjectsToEngagements(projectSfiRelationsList: ProjectSfiRelations[]): ProjectSfiRelations[] {
        const ENGAGEMENTS_MAP = new Map<number, ProjectSfiRelations>();
        projectSfiRelationsList.forEach(project => {
            const { conflictStatus, conflictStatusCode, conflictCount, conflictCompleted, coiDisclEntProjDetails, ...REMAINING_PROJECT_FIELDS } = project;
            (project.coiDisclEntProjDetails || []).forEach(engagement => {
                const ENGAGEMENT_ID = engagement?.personEntityId!;
                const { personEngagementDetails, projectConflictStatusCode, coiProjConflictStatusType, coiDisclProjectEntityRelId, updateTimestamp, updatedBy, coiDisclProjectId, ...REMAINING_ENG_FIELDS } = engagement;
                if (!ENGAGEMENTS_MAP.has(ENGAGEMENT_ID)) {
                    ENGAGEMENTS_MAP.set(ENGAGEMENT_ID, {
                        ...REMAINING_ENG_FIELDS,
                        coiDisclEntProjDetails: [], // here we will put all associated projects
                    });
                }
                // Push project info using spread operator
                ENGAGEMENTS_MAP.get(ENGAGEMENT_ID).coiDisclEntProjDetails.push({
                    ...REMAINING_PROJECT_FIELDS,
                    personEngagementDetails,
                    projectConflictStatusCode,
                    coiProjConflictStatusType,
                    coiDisclProjectEntityRelId,
                    updateTimestamp,
                    updatedBy,
                    personEntityId: engagement?.personEntityId,
                    prePersonEntityId: engagement?.prePersonEntityId
                });
                const { conflictCount, conflictCompleted, conflictStatusCode, conflictStatus } = this._defineRelationshipService.getFormattedConflictData(ENGAGEMENTS_MAP.get(ENGAGEMENT_ID).coiDisclEntProjDetails);
                ENGAGEMENTS_MAP.get(ENGAGEMENT_ID).conflictCount = conflictCount;
                ENGAGEMENTS_MAP.get(ENGAGEMENT_ID).conflictCompleted = conflictCompleted;
                ENGAGEMENTS_MAP.get(ENGAGEMENT_ID).conflictStatusCode = conflictStatusCode;
                ENGAGEMENTS_MAP.get(ENGAGEMENT_ID).conflictStatus = conflictStatus;
            });
        });
        return Array.from(ENGAGEMENTS_MAP.values());
    }

    getProjEngCounts(): { projectCount: number, engagementCount: number } {
        return {
            projectCount: this.projectSfiRelationsList?.length || 0,
            engagementCount: this.projectSfiRelationsList?.[0]?.coiDisclEntProjDetails?.length || 0
        }
    }

}
