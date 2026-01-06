import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ProjectSfiRelations, CoiDisclEntProjDetail, DefineRelationshipDataStore } from '../../coi-interface';
import { deepCloneObject, isExistSearchWord } from '../../../common/utilities/custom-utilities';
import { CommonService } from '../../../common/services/common.service';
import { ExtendedProjectRelationService } from './extended-project-relation.service';
import { ENGAGEMENT_TYPE_ICONS } from '../../../app-constants';

@Injectable()
export class ExtendedProjRelDataStoreService {

    private projectSfiRelationsList: ProjectSfiRelations[] = [];
    private filteredProjectSfiRelationsList: ProjectSfiRelations[] = [];
    $relationsChanged = new Subject<DefineRelationshipDataStore>();

    constructor(private _extendedProjRelService: ExtendedProjectRelationService, private _commonService: CommonService) { }

    private getFilteredDisclosureListForSearchWord(payload: DefineRelationshipDataStore): void {
        this.processProjectsSFIDetails(this.projectSfiRelationsList);
        const FILTERED_LIST: ProjectSfiRelations[] = this.projectSfiRelationsList?.filter((projectSfiRelations: ProjectSfiRelations) => {
            const { searchText, searchKeys } = this._extendedProjRelService;
            return isExistSearchWord(projectSfiRelations, searchText, searchKeys, false);
        });
        this.filteredProjectSfiRelationsList = FILTERED_LIST ? deepCloneObject(FILTERED_LIST) : [];
        this._extendedProjRelService.isLoading = false;
        this.$relationsChanged.next(payload);
    }

    private getProjectData(projectList: ProjectSfiRelations[], projectId?: string, keys?: Array<keyof ProjectSfiRelations>): any {
        if (!projectId) {
            // If no projectId is provided, return the entire list
            return deepCloneObject(projectList);
        }

        // Find the specific project by projectId
        const PROJECT = projectList.find(p => p.projectId === projectId);
        if (!PROJECT) {
            return undefined;
        }

        // If no keys are specified, return the entire project
        if (!keys) {
            return deepCloneObject(PROJECT);
        }

        // Retrieve only the specified keys
        const DATA: any = {};
        keys.forEach(key => {
            if (key in PROJECT) {
                DATA[key] = deepCloneObject(PROJECT[key]);
            }
        });
        return DATA;
    }

    setStoreData(data: ProjectSfiRelations[]): void {
        this.projectSfiRelationsList = deepCloneObject(data);
        const PAY_LOAD: DefineRelationshipDataStore = {
            projectId: 'ALL',
            personEntityId: 'ALL',
            searchChanged: true,
            updatedKeys: [] // No specific keys updated for full data reset
        };
        this.getFilteredDisclosureListForSearchWord(PAY_LOAD);
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

    getActualStoreData(projectId?: string, keys?: Array<keyof ProjectSfiRelations>): ProjectSfiRelations[] {
        return this.getProjectData(this.projectSfiRelationsList, projectId, keys);
    }

    getFilteredStoreData(projectId?: string, keys?: Array<keyof ProjectSfiRelations>): ProjectSfiRelations[] {
        return this.getProjectData(this.filteredProjectSfiRelationsList, projectId, keys);
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

}
