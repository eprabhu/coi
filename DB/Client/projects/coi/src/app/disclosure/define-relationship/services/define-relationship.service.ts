import { Injectable } from '@angular/core';
import { CommonModalConfig } from '../../../shared-components/common-modal/common-modal.interface';
import { AddConflictSlider, ApplyToAllModal, COI, CoiDisclEntProjDetail,
    CoiProjConflictStatusType, ExpandCollapseSummaryBySection, FormattedConflictData, ProjectSfiRelationConflictRO,
    ProjectSfiRelationLoadRO, ProjectSfiRelations, RelationshipConflictType, 
    SaveProjectSfiConflict} from '../../coi-interface';
import { CommonService } from '../../../common/services/common.service';
import { HttpClient } from '@angular/common/http';
import { ScrollSpyConfiguration, ScrollSpyEvent } from '../../../shared-components/scroll-spy/scroll-spy.interface';
import { DataStoreService } from '../../services/data-store.service';
import { CoiService } from '../../services/coi.service';
import { Subject } from 'rxjs';
import { FetchReviewCommentRO, Projects } from '../../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COIReviewCommentsConfig } from '../../../shared-components/coi-review-comments/coi-review-comments.interface';
import { FCOI_RELATIONSHIP_COMMENTS, FCOI_PROJECT_COMMENTS } from '../../../shared-components/coi-review-comments/coi-review-comments-constants';
import { CONFLICT_STATUS_TO_PROJECT_STATUS_MAP, FCOI_DISCLOSURE_CREATE_MODE_BASE_URL, PROJECT_CONFLICT_STATUS_COUNT_COLOR } from '../../../app-constants';
import { LookUpClass } from '../../../common/services/coi-common.interface';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';
import { Router } from '@angular/router';

@Injectable()
export class DefineRelationshipService {

    searchText = '';
    isLoading = true;
    isEditMode = false;
    isShowErrorToast = false;
    searchKeys: Record<'PROJECTS' | 'ENGAGEMENTS', Array<string | Record<string, any>>> = {
        PROJECTS: [
            'piName',
            'projectId',
            'reporterRole',
            'projectStatus',
            '[projectNumber - title]',
            '[sponsorCode - sponsorName]',
            '[homeUnitNumber - homeUnitName]',
            '[primeSponsorCode - primeSponsorName]'
        ],
        ENGAGEMENTS: [
            { 'personEntity': ['entityName', 'countryName'] }
        ]
    };
    isObserverActive: boolean[] = [];
    applyToAllModal = new ApplyToAllModal();
    isShowProjectSfiConflict: boolean[] = [];
    currentRelationSwitch: 'PROJECTS' | 'ENGAGEMENTS' = 'PROJECTS';
    addConflictSlider = new AddConflictSlider();
    elementVisiblePercentageList: number[] = [];
    coiStatusList: CoiProjConflictStatusType[] = [];
    conflictStatusLookup: LookUpClass[] = [];
    scrollSpyConfiguration = new ScrollSpyConfiguration();
    modalConfig = new CommonModalConfig('coi-relation-modal', 'Apply to All', 'Cancel', 'xl');
    relationshipConflictType: RelationshipConflictType[] = [];

    // auto save obj
    apiFailedKeysList: any[] = [];
    $autoSaveDebounce = new Subject();
    mandatoryList: Map<string, string> = new Map();
    autoSaveKeysList: CoiDisclEntProjDetail[] = [];
    autoSaveRelationQueue: Record<number | string, CoiDisclEntProjDetail> = {};

    constructor(private _http: HttpClient,
                private _router: Router,
                private _commonService: CommonService,
                private _coiService: CoiService,
                private _dataStore: DataStoreService,
                private _autoSaveService: AutoSaveService) { }

    updateObserverActivationStatus(totalCount: number, activeCounter: number, value: boolean) {
        for (let index = 0; index < totalCount; index++) {
            this.isObserverActive[index] = (activeCounter === index) ? true : value;
        }
    }

    setProjectConflictStatusMapping(coiStatusList: CoiProjConflictStatusType[]): void {
        this.coiStatusList = coiStatusList || [];
        this.conflictStatusLookup = this.coiStatusList.map(({ projectConflictStatusCode: code, description }) => ({ code, description }));
        this.relationshipConflictType = Object.entries(CONFLICT_STATUS_TO_PROJECT_STATUS_MAP)
            .map(([CONFLICT_STATUS_CODE, PROJECT_CONFLICT_STATUS_CODE]) => {
                const PROJECT_STATUS_OBJ = this.coiStatusList.find(
                    ({ projectConflictStatusCode }) => projectConflictStatusCode?.toString() === PROJECT_CONFLICT_STATUS_CODE?.toString()
                );
                return PROJECT_STATUS_OBJ && {
                    statusCode: CONFLICT_STATUS_CODE,
                    projectConflictStatus: PROJECT_STATUS_OBJ.description,
                    color: PROJECT_CONFLICT_STATUS_COUNT_COLOR[PROJECT_CONFLICT_STATUS_CODE],
                    projectConflictStatusCode: PROJECT_CONFLICT_STATUS_CODE
                };
            })
            .filter(Boolean);
    }

    configureScrollSpy(): void {
        this.scrollSpyConfiguration.activeCounter = 0;
        this.scrollSpyConfiguration.isActiveKeyNavigation = false;
        this.scrollSpyConfiguration.navItemClass = 'coi-scrollspy-right';
        this.scrollSpyConfiguration.contentItemClass = 'coi-scrollspy-left';
        this.setHeight();
    }

    updateScrollSpyConfig(event: { isVisible: boolean; observerEntry: IntersectionObserverEntry; }, scrollSpyIndex: number): void {
        this.elementVisiblePercentageList[scrollSpyIndex] = event.observerEntry.intersectionRatio;
        this.elementVisiblePercentageList = deepCloneObject(this.elementVisiblePercentageList);
    }

    setHeight(): void {
        setTimeout(() => {
            const HEIGHT = this.getDefineRelationShipNavHeight();
            this.scrollSpyConfiguration.scrollLeftHeight = HEIGHT;
            this.scrollSpyConfiguration.activeCounter = 0;
            this.scrollSpyConfiguration.rightOffsetTop = this.getNavOffsetTop();
            this.scrollSpyConfiguration.scrollRightHeight = HEIGHT;
        });
    }

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
            documentOwnerPersonId: COI_DATA?.coiDisclosure?.person?.personId
        }
        if (section === 'RELATIONSHIP') {
            REQ_BODY.projects = this.setProjectObjectFromDisclosure(projectSfiRelation);
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

    private setProjectObjectFromDisclosure(projectSfiRelation: ProjectSfiRelations): Projects[] {
        if (projectSfiRelation?.projectNumber || projectSfiRelation?.documentNumber) {
            return [{
                projectNumber: String(projectSfiRelation.projectNumber || projectSfiRelation.documentNumber),
                projectModuleCode: Number(projectSfiRelation.moduleCode)
            }];
        }
        return null;
    }

    getFormattedConflictData(coiDisclEntProjDetails: CoiDisclEntProjDetail[]): FormattedConflictData {
        const RESULT = coiDisclEntProjDetails?.reduce((acc, item) => {
            const CONFLICT_TYPE: RelationshipConflictType = deepCloneObject(this.relationshipConflictType.find(type => type.projectConflictStatusCode === item.projectConflictStatusCode));
            const { statusCode, projectConflictStatus } = CONFLICT_TYPE || {};
            if (statusCode) {
                acc.conflictCount[statusCode] = (acc.conflictCount[statusCode] || 0) + 1;
                acc.totalCount++;
                // Update the worst conflict status code if this statusCode is higher
                if (acc.conflictStatusCode === null || Number(statusCode) > Number(acc.conflictStatusCode)) {
                    acc.conflictStatusCode = statusCode;
                    acc.conflictStatus = projectConflictStatus;
                }
            }
            return acc;
        }, {
            totalCount: 0,
            conflictStatus: null as string | null,
            conflictStatusCode: null as string | null,
            conflictCount: {} as { [key: string]: number }
        });

        return {
            conflictCount: RESULT.conflictCount,
            conflictStatus: RESULT.conflictStatus,
            conflictStatusCode: RESULT.conflictStatusCode,
            conflictCompleted: RESULT.totalCount === coiDisclEntProjDetails?.length
        };
    }

    updateDisclosureConflictStatus(projectSfiConflictDetails: SaveProjectSfiConflict): void {
        const COI_DATA = this._dataStore.getData();
        COI_DATA.coiDisclosure.coiConflictStatusType = projectSfiConflictDetails?.disclConflictStatusType;
        COI_DATA.coiDisclosure.conflictStatusCode = projectSfiConflictDetails?.disclConflictStatusType?.conflictStatusCode;
        COI_DATA.coiDisclosure.updateTimestamp = projectSfiConflictDetails?.updateTimestamp;
        this._dataStore.updateStore(['coiDisclosure'], { coiDisclosure: COI_DATA.coiDisclosure });
        this._autoSaveService.updatedLastSaveTime(COI_DATA.coiDisclosure.updateTimestamp, true);
    }

    scrollSpyCounterChanged(event: ScrollSpyEvent): void {
        this._commonService.$globalEventNotifier.next({uniqueId: 'SCROLL_SPY', content: event});
    }

    resetElementVisiblePercentageList(): void {
        this.elementVisiblePercentageList = this.isEditMode ? [] : this.elementVisiblePercentageList.length > 3 ? this.elementVisiblePercentageList.slice(0, 2).concat(this.elementVisiblePercentageList.slice(-1)) : this.elementVisiblePercentageList;
        this.elementVisiblePercentageList = deepCloneObject(this.elementVisiblePercentageList);
    }

    clearAllServiceData(): void {
        this.searchText = '';
        this.isLoading = true;
        this.isEditMode = false;
        this.coiStatusList = [];
        this.isObserverActive = [];
        this.autoSaveKeysList = [];
        this.apiFailedKeysList = [];
        this.isShowErrorToast = false;
        this.mandatoryList = new Map();
        this.autoSaveRelationQueue = {};
        this.isShowProjectSfiConflict = [];
        this.currentRelationSwitch = 'PROJECTS';
        this.elementVisiblePercentageList = [];
        this._coiService.activeSectionId = 'COI801';
        this.applyToAllModal = new ApplyToAllModal();
        this.addConflictSlider = new AddConflictSlider();
        this.scrollSpyConfiguration = new ScrollSpyConfiguration();
        this._coiService.isExpandSummaryBySection = new ExpandCollapseSummaryBySection();
    }

    private getDefineRelationShipNavHeight(): string {
        const COI_DISCLOSURE_HEADER = document.getElementById('COI-DISCLOSURE-HEADER')?.getBoundingClientRect();
        const COI_DISCLOSURE_HEADER_HEIGHT = COI_DISCLOSURE_HEADER?.height;
        const APPLICATION_HEADER_HEIGHT = 65;
        const BOTTOM_ACTION_PADDING = this._router.url.includes(FCOI_DISCLOSURE_CREATE_MODE_BASE_URL) ? 55 : 0; // bottom previous/proceed section height (applicable only in edit mode).
        const COI_DISCLOSURE_HEADER_BOTTOM = COI_DISCLOSURE_HEADER_HEIGHT + APPLICATION_HEADER_HEIGHT + BOTTOM_ACTION_PADDING;
        const PADDING = '10px';
        const FOOTER_HEIGHT = 0;
        const TOTAL_HEIGHT = `${COI_DISCLOSURE_HEADER_BOTTOM}px - ${FOOTER_HEIGHT}px - ${PADDING}`;
        return `calc(100vh - ${TOTAL_HEIGHT})`;
    }

    private getNavOffsetTop(): number {
        const element = document.getElementById('COI_DEFINE_RELATIONSHIP_NAV_HEADER');
        if (element) {
            const OFFSET_TOP = this.isEditMode ? 0 : 0;
            return element.getBoundingClientRect().height + 15 + OFFSET_TOP;
        }
        return 0;
    }

    lookups() {
        return this._http.get(`${this._commonService.baseUrl}/fcoiDisclosure/lookups`);
    }

    getSfiRelations(projectSfiRelationLoadRO: ProjectSfiRelationLoadRO) {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/entity/relations`, projectSfiRelationLoadRO);
    }

    saveProjectSfiConflict(projectSfiRelationConflictRO: ProjectSfiRelationConflictRO) {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure/relation/conflict`, projectSfiRelationConflictRO);
    }

}
