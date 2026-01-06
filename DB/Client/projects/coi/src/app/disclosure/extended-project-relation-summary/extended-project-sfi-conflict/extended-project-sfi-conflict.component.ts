import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { environment } from "projects/admin-dashboard/src/environments/environment";
import { Subscription } from "rxjs";
import { RISK_ICON_COLOR_MAPPING, PROJECT_CONFLICT_STATUS_BADGE} from "../../../app-constants";
import { COISortObj, DataStoreEvent } from "../../../common/services/coi-common.interface";
import { CommonService } from "../../../common/services/common.service";
import { ProjectSfiRelations, COI, DefineRelationshipDataStore, CoiDisclEntProjDetail } from "../../coi-interface";
import { CoiService } from "../../services/coi.service";
import { DataStoreService } from "../../services/data-store.service";
import { slideInAnimation, scaleOutAnimation } from '../../../common/utilities/animations';
import { deepCloneObject, isEmptyObject } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ExtendedProjRelDataStoreService } from '../services/extended-project-relation-data-store.service';
import { ExtendedProjectRelationService } from '../services/extended-project-relation.service';
import { ENGAGEMENT_LOCALIZE } from '../../../app-locales';

@Component({
    selector: 'app-extended-project-sfi-conflict',
    templateUrl: './extended-project-sfi-conflict.component.html',
    styleUrls: ['./extended-project-sfi-conflict.component.scss'],
    animations: [
        slideInAnimation('0','12px', 400, 'slideUp'),
        slideInAnimation('0','-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px','0', 200, 'scaleOut')
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendedProjectSfiConflictComponent implements OnInit, OnDestroy {

    @Input() projectSfiRelation = new ProjectSfiRelations();
    @Input() isShowEngagementRisk = false;

    readMore = {};
    sliceCount = 55;
    coiData = new COI();
    $subscriptions: Subscription[] = [];
    riskIconColor = RISK_ICON_COLOR_MAPPING;
    PROJECT_CONFLICT_STATUS_BADGE = PROJECT_CONFLICT_STATUS_BADGE;
    isDesc: Record<string, COISortObj | null> = { entityName: null, projectConflictStatusCode: null };
    applyAllHelpText = `Click 'Apply to All' to update the Conflict Status and Description for all engagements.`;
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

    constructor(public commonService: CommonService,
        private _coiService: CoiService,
        public extendedProjRelService: ExtendedProjectRelationService,
        private _dataStore: DataStoreService, private _cdr: ChangeDetectorRef,
        private _extendedProjRelDataStoreService: ExtendedProjRelDataStoreService) {
            this.setReadMoreSliceCount();
        }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    ngOnInit(): void {
        this.filteredProjectRelation = deepCloneObject(this.projectSfiRelation);
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.listenDataChangeFromRelationStore();
        this.setStickyTop();
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
        this.setCommentCount(this.projectSfiRelation.coiDisclEntProjDetails || []);
    }

    private listenDataChangeFromRelationStore(): void {
        this.$subscriptions.push(
            this._extendedProjRelDataStoreService.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes.projectId == 'ALL' || changes.projectId == this.projectSfiRelation.projectId) {
                    if (changes.coiDisclProjectEntityRelId) {
                        this._cdr.markForCheck();
                    }
                }
            })
        );
    }

    private onSortClick(sortKey?: 'entityName' | 'projectConflictStatusCode' | null, order?: 'ASC' | 'DESC' | null): void {
        this.currentSortState.key = sortKey;
        this.currentSortState.order = order;
        this.filteredProjectRelation = this.sortCoiDisclEntProjDetails(this.isDesc[sortKey]);
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
        if (!this.extendedProjRelService.isEditMode) {
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
        const STICKY_TOP = document.getElementById('ext_proj_rel_card_' + this.projectSfiRelation?.projectId)?.clientHeight ?? 0;
        const STICKY_ELEMENT = document.getElementById('coi_ext_proj_rel_' + this.projectSfiRelation?.projectId);
        if (STICKY_ELEMENT) {
            STICKY_ELEMENT.style.top = STICKY_TOP + 'px';
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
        const RELATIONSHIP_COMMENT_DETAILS = REVIEW_COMMENTS.find(item => String(item?.subModuleItemKey) === String(subModuleItemKey));
        return RELATIONSHIP_COMMENT_DETAILS?.count ?? 0;
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
        this.extendedProjRelService.openReviewerComment(this.projectSfiRelation, 'SFI', coiDisclEntProjDetail);
    }

    openAddConflictSlider(coiDisclEntProjDetail: CoiDisclEntProjDetail): void {
        this.extendedProjRelService.addConflictSlider = {
            isOpenSlider: true,
            coiDisclEntProjDetail: coiDisclEntProjDetail,
            projectSfiRelations: this.projectSfiRelation
        }
    }

    viewEntityDetails(entityId: string | number): void {
        this.commonService.openEntityDetailsModal(entityId);
    }

    openEngagementSlider(selectedEngagementId: string | number): void {
        this._coiService.openEngagementSlider(selectedEngagementId);
    }

}
