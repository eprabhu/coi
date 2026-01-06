import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CommonService } from "../../../common/services/common.service";
import { FetchReviewCommentRO } from "../../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface";
import { FCOI_RELATIONSHIP_COMMENTS, FCOI_PROJECT_COMMENTS } from "../../../shared-components/coi-review-comments/coi-review-comments-constants";
import { COIReviewCommentsConfig } from "../../../shared-components/coi-review-comments/coi-review-comments.interface";
import { AddConflictSlider, RelationshipConflictType, CoiDisclEntProjDetail, ProjectSfiRelations,
    COI, CoiConflictStatusType, ProjectSfiRelationLoadRO } from "../../coi-interface";
import { CoiService } from "../../services/coi.service";
import { DataStoreService } from "../../services/data-store.service";
import { Observable } from "rxjs";

@Injectable()
export class ExtendedProjectRelationService {

    searchText = '';
    isLoading = true;
    isEditMode = false;
    searchKeys: Array<string> = [
        'piName',
        'projectId',
        'reporterRole',
        'projectStatus',
        '[projectNumber - title]',
        '[sponsorCode - sponsorName]',
        '[homeUnitNumber - homeUnitName]',
        '[primeSponsorCode - primeSponsorName]'
    ];
    addConflictSlider = new AddConflictSlider();
    relationshipConflictType: RelationshipConflictType[] = [];

    constructor(private _http: HttpClient, private _commonService: CommonService, private _coiService: CoiService, private _dataStore: DataStoreService) { }

    openReviewerComment(projectSfiRelation: ProjectSfiRelations, section: 'SFI' | 'RELATIONSHIP', childSubSection?: CoiDisclEntProjDetail) {
        const COI_DATA: COI = this._dataStore.getData();
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: section === 'SFI' ? FCOI_RELATIONSHIP_COMMENTS?.commentTypeCode : FCOI_PROJECT_COMMENTS.commentTypeCode,
            moduleItemKey: COI_DATA?.coiDisclosure?.disclosureId,
            moduleItemNumber: COI_DATA?.coiDisclosure?.disclosureNumber,
            subModuleCode: null,
            subModuleItemKey: section === 'SFI' ? childSubSection?.coiDisclProjectEntityRelId : projectSfiRelation?.projectNumber,
            subModuleItemNumber: section === 'RELATIONSHIP' ? projectSfiRelation?.projectTypeCode : null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: COI_DATA?.coiDisclosure?.person?.personId,
        }
        const REVIEW_COMMENTS_CARD_CONFIG: Partial<COIReviewCommentsConfig> = {
            moduleSectionDetails: {
                sectionId: section === 'SFI' ? childSubSection?.coiDisclProjectEntityRelId : projectSfiRelation?.projectNumber,
                sectionName: `${projectSfiRelation?.title}`,
                sectionKey: section ==='SFI' ? childSubSection?.coiDisclProjectEntityRelId : projectSfiRelation?.projectNumber,
                subsectionId: childSubSection ? (section ==='SFI' ? childSubSection?.personEntity?.entityId : projectSfiRelation?.projectNumber) : '',
                subsectionName: childSubSection ? (section ==='SFI' ? childSubSection?.personEntity?.entityName : childSubSection?.personEntity?.entityName) : ''
            },
            componentDetails: {
                componentName:  section === 'SFI' ? FCOI_RELATIONSHIP_COMMENTS?.componentName : FCOI_PROJECT_COMMENTS.componentName,
                componentTypeCode: section === 'SFI' ? FCOI_RELATIONSHIP_COMMENTS?.commentTypeCode : FCOI_PROJECT_COMMENTS.commentTypeCode,
            }
        }
        this._coiService.setReviewCommentSliderConfig(REQ_BODY, REVIEW_COMMENTS_CARD_CONFIG);
    }

    updateDisclosureConflictStatus(disclConflictStatusType: CoiConflictStatusType): void {
        const COI_DATA = this._dataStore.getData();
        COI_DATA.coiDisclosure.coiConflictStatusType = disclConflictStatusType;
        COI_DATA.coiDisclosure.conflictStatusCode = disclConflictStatusType?.conflictStatusCode;
        this._dataStore.updateStore(['coiDisclosure'], { coiDisclosure: COI_DATA.coiDisclosure });
    }

    clearAllServiceData(): void {
        this.searchText = '';
        this.isLoading = true;
        this.isEditMode = false;
        this.addConflictSlider = new AddConflictSlider();
    }

    lookups(): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/fcoiDisclosure/lookups`);
    }

    getExtendedProjectRelations(projectSfiRelationLoadRO: ProjectSfiRelationLoadRO): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/extendedProject/relations`, projectSfiRelationLoadRO);
    }

}
