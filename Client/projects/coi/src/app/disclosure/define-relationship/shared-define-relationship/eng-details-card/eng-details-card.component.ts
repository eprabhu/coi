import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { COI, DefineRelationshipDataStore, ProjectSfiRelations } from '../../../coi-interface';
import { DISCLOSURE_CONFLICT_STATUS_BADGE, ENGAGEMENT_TYPE_ICONS, RISK_ICON_COLOR_MAPPING } from '../../../../app-constants';
import { Subscription } from 'rxjs';
import { DefineRelationshipDataStoreService } from '../../services/define-relationship-data-store.service';
import { DefineRelationshipService } from '../../services/define-relationship.service';
import { deepCloneObject, isEmptyObject } from '../../../../common/utilities/custom-utilities';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { DataStoreService } from '../../../services/data-store.service';
import { FetchReviewCommentRO } from 'projects/coi/src/app/shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { FCOI_ENGAGEMENT_COMMENTS } from 'projects/coi/src/app/shared-components/coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentsConfig } from 'projects/coi/src/app/shared-components/coi-review-comments/coi-review-comments.interface';
import { CoiService } from '../../../services/coi.service';
import { ENGAGEMENT_LOCALIZE } from 'projects/coi/src/app/app-locales';
import { environment } from 'projects/coi/src/environments/environment';

@Component({
    selector: 'app-eng-details-card',
    templateUrl: './eng-details-card.component.html',
    styleUrls: ['./eng-details-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EngagementDetailsCardComponent implements OnInit, OnDestroy {

    @Input() isCardExpanded = false;
    @Input() isShowPrevNextBtn = false;
    @Input() nextIndex = null;
    @Input() previousIndex = null;
    @Input() isShowEngagementRisk = false;
    @Input() projectSfiRelation = new ProjectSfiRelations();

    $subscriptions: Subscription[] = [];
    riskIconColor = RISK_ICON_COLOR_MAPPING;
    ENGAGEMENT_LOCALIZE = ENGAGEMENT_LOCALIZE;
    ENGAGEMENT_TYPE_ICONS = ENGAGEMENT_TYPE_ICONS;
    DISCLOSURE_CONFLICT_STATUS_BADGE = DISCLOSURE_CONFLICT_STATUS_BADGE;
    coiData = new COI();
    relationshipCommentCount: number;
    isShowCommentButton = false;
    deployMap = environment.deployUrl;  

    constructor(private _cdr: ChangeDetectorRef,
        private _coiService: CoiService,
        public commonService: CommonService,
        public defineRelationshipService: DefineRelationshipService,
        private _defineRelationshipDataStore: DefineRelationshipDataStoreService,
        private _dataStore: DataStoreService
    ) {}

    ngOnInit(): void {
        this.listenDataChangeFromRelationStore();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.setStickyTop();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenDataChangeFromRelationStore(): void {
        this.$subscriptions.push(
            this._defineRelationshipDataStore.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes?.personEntityId == 'ALL' || changes?.personEntityId?.toString() === this.projectSfiRelation?.personEntityId?.toString()) {
                    this.getDataFromRelationshipStore();
                }
            }));
    }

    private getDataFromRelationshipStore(): void {
        const UPDATED_PROJECT_RELATION = this._defineRelationshipDataStore.getActualStoreData(this.projectSfiRelation?.personEntityId);
        this.projectSfiRelation = deepCloneObject(UPDATED_PROJECT_RELATION);
        this._cdr.markForCheck();
    }

    private getDataFromStore(): void {
        const coiData = this._dataStore.getData();
        if (isEmptyObject(coiData)) { return; }
        this.coiData = coiData;
        this.isShowCommentButton = this._dataStore.getCommentButtonVisibility();
        this.getRelationshipCommentCount();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe(() => {
                this.getDataFromStore();
            })
        );
    }

    private getRelationshipCommentCount(): void {
        const REVIEW_COMMENTS = this.coiData?.disclosureCommentsCount?.reviewCommentsCount || [];
        const RELATIONSHIP_COMMENT_DETAILS = REVIEW_COMMENTS.find(item => String(item.subModuleItemKey) === String(this.projectSfiRelation?.personEntityNumber));
        this.relationshipCommentCount = RELATIONSHIP_COMMENT_DETAILS?.count ?? 0;
        this._cdr.markForCheck();
    }

    private setStickyTop(): void {
        setTimeout(() => {
            const STICKY_TOP = document.getElementById('project_relationship_card_' + this.projectSfiRelation?.personEntityId)?.clientHeight ?? 0;
            const STICKY_ELEMENT = document.getElementById('coi-relationship-' + this.projectSfiRelation?.personEntityId);
            if (STICKY_ELEMENT) {
                STICKY_ELEMENT.style.top = STICKY_TOP + 'px';
            }
        }, 50);
    }

    openReviewerComment(event) {
        const COI_DATA = this._dataStore.getData();
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: FCOI_ENGAGEMENT_COMMENTS?.commentTypeCode,
            moduleItemKey: COI_DATA?.coiDisclosure?.disclosureId,
            moduleItemNumber: COI_DATA?.coiDisclosure?.disclosureNumber,
            subModuleCode: null,
            subModuleItemKey: event?.personEntityId,
            subModuleItemNumber: event?.personEntityNumber,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: COI_DATA?.coiDisclosure?.person?.personId,
        }
        const REVIEW_COMMENTS_CARD_CONFIG: Partial<COIReviewCommentsConfig> = {
            moduleSectionDetails: {
                sectionId: event?.personEntityId,
                sectionName: event?.personEntityHeader,
                sectionKey: event?.personEntityId + event?.personEntityHeader
            },
            componentDetails: {
                componentName: FCOI_ENGAGEMENT_COMMENTS?.componentName,
                componentTypeCode: FCOI_ENGAGEMENT_COMMENTS?.commentTypeCode
            }
        }
        this._coiService.setReviewCommentSliderConfig(REQ_BODY, REVIEW_COMMENTS_CARD_CONFIG);
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

    viewEntityDetails() {
        this.commonService.openEntityDetailsModal(this.projectSfiRelation.entityId);
    }

    openEngagementSlider(selectedEngagementId: string | number): void {
        this._coiService.openEngagementSlider(selectedEngagementId);
    }

}
