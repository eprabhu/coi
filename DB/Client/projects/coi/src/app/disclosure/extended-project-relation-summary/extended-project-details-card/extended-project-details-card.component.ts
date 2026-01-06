import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { COI, DisclosureRelationshipProjectCard, ProjectSfiRelations } from '../../coi-interface';
import { PROJECT_DETAILS_ORDER, DISCLOSURE_CONFLICT_STATUS_BADGE } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { getFormattedSponsor, isEmptyObject } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { DataStoreService } from '../../services/data-store.service';

@Component({
    selector: 'app-extended-project-details-card',
    templateUrl: './extended-project-details-card.component.html',
    styleUrls: ['./extended-project-details-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendedProjectDetailsCardComponent implements OnInit, OnDestroy {

    @Input() nextIndex = null;
    @Input() isEditMode = false;
    @Input() previousIndex = null;
    @Input() isCardExpanded = false;
    @Input() isShowPrevNextBtn = false;
    @Input() projectSfiRelation = new ProjectSfiRelations();

    @Output() emitProjectCardActions = new EventEmitter<DisclosureRelationshipProjectCard>();

    sponsor = '';
    primeSponsor = '';
    coiData = new COI();
    isShowCommentButton = false;
    relationshipCommentCount = 0;
    $subscriptions: Subscription[] = [];
    PROJECT_DETAILS_ORDER = PROJECT_DETAILS_ORDER;
    DISCLOSURE_CONFLICT_STATUS_BADGE = DISCLOSURE_CONFLICT_STATUS_BADGE;

    constructor(private _cdr: ChangeDetectorRef,
                public commonService: CommonService,
                private _dataStore: DataStoreService) { }

    ngOnInit(): void {
        this.setSponsorAndPrimeSponsor();
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

    private getDataFromStore(): void {
        const COI_DATA = this._dataStore.getData();
        if (isEmptyObject(COI_DATA)) { return; }
        this.coiData = COI_DATA;
        this.getRelationshipCommentCount(this.projectSfiRelation?.projectNumber);
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe(() => {
                this.getDataFromStore();
            })
        );
    }

    private getRelationshipCommentCount(subModuleItemKey: string | number): void {
        const REVIEW_COMMENTS = this.coiData?.disclosureCommentsCount?.reviewCommentsCount || [];
        const RELATIONSHIP_COMMENT_DETAILS = REVIEW_COMMENTS.find(item => String(item.subModuleItemKey) === String(subModuleItemKey));
        this.relationshipCommentCount = RELATIONSHIP_COMMENT_DETAILS?.count ?? 0;
        this._cdr.markForCheck();
    }

    private setStickyTop(): void {
        setTimeout(() => {
            const STICKY_TOP = document.getElementById('ext_proj_rel_card_' + this.projectSfiRelation?.projectId)?.clientHeight ?? 0;
            const STICKY_ELEMENT = document.getElementById('coi_ext_proj_rel_' + this.projectSfiRelation?.projectId);
            if (STICKY_ELEMENT) {
                STICKY_ELEMENT.style.top = STICKY_TOP + 'px';
            }
        }, 50);
    }

    openReviewerComment(): void {
       this.emitProjectCardActions.emit({ uniqueId: 'OPEN_REVIEW_COMMENTS', content: { projectSfiRelation: this.projectSfiRelation }});
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
            document.getElementById('COI_EXT_PROJ_REL_NAV' + this.previousIndex)?.click();
        });
    }

    navigateToNextProject(): void {
        setTimeout(() => {
            document.getElementById('COI_EXT_PROJ_REL_NAV' + this.nextIndex)?.click();
        });
    }

}
