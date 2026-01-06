import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { COI, DefineRelationshipDataStore, ProjectSfiRelations } from '../../../coi-interface';
import { DISCLOSURE_CONFLICT_STATUS_BADGE, PROJECT_DETAILS_ORDER } from '../../../../app-constants';
import { Subscription } from 'rxjs';
import { DefineRelationshipDataStoreService } from '../../services/define-relationship-data-store.service';
import { DefineRelationshipService } from '../../services/define-relationship.service';
import { deepCloneObject, getFormattedSponsor, isEmptyObject } from '../../../../common/utilities/custom-utilities';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { DataStoreService } from '../../../services/data-store.service';

@Component({
    selector: 'app-project-details-card',
    templateUrl: './project-details-card.component.html',
    styleUrls: ['./project-details-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailsCardComponent implements OnInit, OnDestroy {

    @Input() isCardExpanded = false;
    @Input() isShowPrevNextBtn = false;
    @Input() nextIndex = null;
    @Input() previousIndex = null;
    @Input() projectSfiRelation = new ProjectSfiRelations();

    $subscriptions: Subscription[] = [];
    sponsor = '';
    primeSponsor = '';
    PROJECT_DETAILS_ORDER = PROJECT_DETAILS_ORDER;
    DISCLOSURE_CONFLICT_STATUS_BADGE = DISCLOSURE_CONFLICT_STATUS_BADGE;
    coiData = new COI();
    relationshipCommentCount: number;
    isShowCommentButton = false;

    constructor(private _cdr: ChangeDetectorRef,
                public commonService: CommonService,
                public defineRelationshipService: DefineRelationshipService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService,
                private _dataStore: DataStoreService
    ) { }

    ngOnInit(): void {
        this.setSponsorAndPrimeSponsor();
        this.listenDataChangeFromRelationStore();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.setStickyTop();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private setSponsorAndPrimeSponsor(): void {
        this.sponsor = getFormattedSponsor(this.projectSfiRelation?.sponsorCode, this.projectSfiRelation?.sponsorName);
        this.primeSponsor = getFormattedSponsor(this.projectSfiRelation?.primeSponsorCode, this.projectSfiRelation?.primeSponsorName);
    }

    private listenDataChangeFromRelationStore(): void {
        this.$subscriptions.push(
            this._defineRelationshipDataStore.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes?.projectId == 'ALL' || changes?.projectId?.toString() === this.projectSfiRelation?.projectId?.toString()) {
                    this.getDataFromRelationshipStore();
                }
            }));
    }

    private getDataFromRelationshipStore(): void {
        this.setSponsorAndPrimeSponsor();
        const UPDATED_PROJECT_RELATION = this._defineRelationshipDataStore.getActualStoreData(this.projectSfiRelation?.projectId);
        this.projectSfiRelation = deepCloneObject(UPDATED_PROJECT_RELATION);
        this._cdr.markForCheck();
    }

    private getDataFromStore(): void {
        const coiData = this._dataStore.getData();
        if (isEmptyObject(coiData)) { return; }
        this.coiData = coiData;
        this.isShowCommentButton = this._dataStore.getCommentButtonVisibility();
        this.getRelationshipCommentCount(this.projectSfiRelation.projectNumber);
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe(() => {
                this.getDataFromStore();
            })
        );
    }

    private getRelationshipCommentCount(subModuleItemKey: any): void {
        const REVIEW_COMMENTS = this.coiData?.disclosureCommentsCount?.reviewCommentsCount || [];
        const RELATIONSHIP_COMMENT_DETAILS = REVIEW_COMMENTS.find(item => String(item.subModuleItemKey) === String(subModuleItemKey));
        this.relationshipCommentCount = RELATIONSHIP_COMMENT_DETAILS?.count ?? 0;
        this._cdr.markForCheck();
    }

    private setStickyTop(): void {
        setTimeout(() => {
            const STICKY_TOP = document.getElementById('project_relationship_card_' + this.projectSfiRelation?.projectId)?.clientHeight ?? 0;
            const STICKY_ELEMENT = document.getElementById('coi-relationship-' + this.projectSfiRelation?.projectId);
            if (STICKY_ELEMENT) {
                STICKY_ELEMENT.style.top = STICKY_TOP + 'px';
            }
        }, 50);
    }

    openReviewerComment(): void {
        this.defineRelationshipService.openReviewerComment(this.projectSfiRelation, 'RELATIONSHIP');
    }

    openProjectHierarchySlider(): void {
        this.commonService.openProjectHierarchySlider(this.projectSfiRelation.moduleCode, this.projectSfiRelation.projectNumber);
    }
    
    expandCollapseProjectCard(): void {
        this.isCardExpanded = !this.isCardExpanded;
        this.setStickyTop();
    }

    navigateToPrevProject(): void {
        setTimeout(() => {
            document.getElementById('COI_PROJECT_SFI_RELATION_NAV_' + this.previousIndex)?.click();
        });
    }

    navigateToNextProject(): void {
        setTimeout(() => {
            document.getElementById('COI_PROJECT_SFI_RELATION_NAV_' + this.nextIndex)?.click();
        });
    }

}
