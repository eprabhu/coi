import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { CoiReviewCommentsService } from './coi-review-comments.service';
import { Subscription, Subject, interval } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { COIReviewCommentsConfig, COIReviewCommentList, CommentCardConfig, ComponentComments } from './coi-review-comments.interface';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from './coi-review-comments-constants';
import { deepCloneObject } from '../../common/utilities/custom-utilities';
import { COMMENTS_NO_INFO_MESSAGE } from '../../no-info-message-constants';

@Component({
    selector: 'app-coi-review-comments',
    templateUrl: './coi-review-comments.component.html',
    styleUrls: ['./coi-review-comments.component.scss'],
    providers: [CoiReviewCommentsService]
})
export class CoiReviewCommentsComponent implements OnInit, OnChanges, OnDestroy {

    @Input() reviewCommentsConfig = new COIReviewCommentsConfig();
    @Output() filterSearchDataChange = new EventEmitter<any>();

    isExpandGoToSection = false;
    sectionKey: string | number = null;
    $subscriptions: Subscription[] = [];
    $debounceEventForAPISearch = new Subject();
    addCommentCardConfig: CommentCardConfig = null;
    selectedAddCommentSection?: ComponentComments = null;
    isShowAddCommentEditor: Record<number | string, boolean> = {};
    noDataMessage = COMMENTS_NO_INFO_MESSAGE;

    constructor(private _commonService: CommonService, private _reviewCommentService: CoiReviewCommentsService) {}

    async ngOnInit() {
        this.listenToGlobalNotifier();
        this.triggerCommentFilterSearch();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.reviewCommentsConfig) {
            this.closeEditor();
            this.addCommentCardConfig = null;
            this.setCommentEditorIfEmpty();
            this.selectedAddCommentSection = this.reviewCommentsConfig?.selectedAddCommentSection || null;
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                if (['CANCEL_EDITOR', 'CLOSE_ALL_EDITOR'].includes(data.content?.action)) {
                    this.closeEditor();
                }
                if (['COMMENT_CHANGES'].includes(data.content?.action) && this.isShowAddCommentEditor['ALL_SECTION_COMMENT']) {
                    this.addCommentCardConfig.commentDetails.comment = data?.content?.commentEditorConfig?.commentDetails?.comment || '';
                }
            }
        }));
    }

    private triggerCommentFilterSearch(): void {
        this.$subscriptions.push(this.$debounceEventForAPISearch.pipe(debounce(() => interval(800))).subscribe((data: any) => {
            this._reviewCommentService.notifyGlobalEvent('SEARCH_TEXT_CHANGED', { searchText: this.reviewCommentsConfig?.searchText });
        }));
    }

    private setCommentEditorIfEmpty(): void {
        const COMPONENT_TYPE_CODE = this.reviewCommentsConfig?.componentTypeCode;
        if (!this.reviewCommentsConfig?.searchText && COMPONENT_TYPE_CODE) {
            const SECTION_INDEX = this.reviewCommentsConfig?.filteredReviewCommentsList?.findIndex((data: COIReviewCommentList) => data.componentTypeCode === COMPONENT_TYPE_CODE);
            // for individual sections add
            if (SECTION_INDEX > -1 && !this.reviewCommentsConfig?.canAddAllComments) {
                const DEFAULT_SECTION = { ...this.reviewCommentsConfig?.filteredReviewCommentsList[SECTION_INDEX] };
                if (!DEFAULT_SECTION.componentComments?.[0]?.reviewCommentsList?.[0]?.commentDetails?.commentId) {
                    this.initializeAddCommentDetails(DEFAULT_SECTION.componentComments?.[0].moduleSectionDetails.sectionKey, DEFAULT_SECTION.componentComments?.[0].reviewCommentsList?.[0]);
                }
            }
            // for multiple sections add
            if (SECTION_INDEX === -1 && this.reviewCommentsConfig?.canAddAllComments && !this.reviewCommentsConfig?.filteredReviewCommentsList?.length) {
                const DEFAULT_SECTION = this.reviewCommentsConfig?.addAllCommentsConfig?.find((data: COIReviewCommentList) => data.componentTypeCode === COMPONENT_TYPE_CODE);
                if (DEFAULT_SECTION?.componentComments?.[0].reviewCommentsList?.[0]) {
                    this.initializeAddCommentDetails('ALL_SECTION_COMMENT', DEFAULT_SECTION.componentComments?.[0].reviewCommentsList?.[0]);
                }
            }
        }
    }

    private closeEditor(): void {
        this.isShowAddCommentEditor = {};
        this.selectedAddCommentSection = deepCloneObject(this.reviewCommentsConfig.selectedAddCommentSection);
    }

    private initializeAddCommentDetails(key: string | number, cardConfig: CommentCardConfig): void {
        this.addCommentCardConfig = {
            componentTypeCode: cardConfig?.commentDetails?.componentTypeCode || this.reviewCommentsConfig?.componentTypeCode,
            checkboxConfig: this.reviewCommentsConfig?.checkboxConfig,
            isEditMode: cardConfig?.isEditMode,
            isDocumentOwner: cardConfig?.isDocumentOwner,
            canMaintainComments: cardConfig?.canMaintainComments,
            canMaintainPrivateComments: cardConfig?.canMaintainPrivateComments,
            canResolveComments: cardConfig?.canResolveComments,
            isOpenAddComment: true,
            isReplyComment: false,
            uniqueId: 'comment-card-add-' + key,
            moduleSectionDetails: cardConfig?.commentDetails?.moduleSectionDetails || this.reviewCommentsConfig?.moduleSectionDetails,
            commentDetails: {
                ...cardConfig?.commentDetails,
                comment: (key === 'ALL_SECTION_COMMENT' && this.isShowAddCommentEditor[key]) ? this.addCommentCardConfig?.commentDetails?.comment : '',
                commentId: null,
                isPrivate: false,
                parentCommentId: null,
                updateUserFullName: this._commonService.getCurrentUserDetail('fullName'),
                commentPersonId: null,
                childComments: null,
                documentOwnerPersonId: cardConfig?.commentDetails?.documentOwnerPersonId || null,
                updateTimestamp: null,
            },
        };
        const { isEditMode: IS_EDIT_MODE, isDocumentOwner: IS_DOCUMENT_OWNER } = this.reviewCommentsConfig || {};
        if (key && IS_EDIT_MODE && (IS_DOCUMENT_OWNER || cardConfig?.canMaintainComments || cardConfig?.canMaintainPrivateComments)) {
            this.isShowAddCommentEditor[key] = true;
        }
    }

    openAddAllComments(): void {
        const COMMENT_CARD = this.selectedAddCommentSection?.reviewCommentsList?.[0];
        this.openAddComment('ALL_SECTION_COMMENT', COMMENT_CARD);
    }

    openAddComment(key: string | number, commentCard: CommentCardConfig | undefined = null): void {
        !this.isShowAddCommentEditor[key] && this._reviewCommentService.notifyGlobalEvent('CLOSE_ALL_EDITOR');
        setTimeout(() => {
            this.initializeAddCommentDetails(key, commentCard);
        });
    }

    searchTextChanged(): void {
        this._reviewCommentService.notifyGlobalEvent('SEARCH_TEXT_CHANGED', { searchText: this.reviewCommentsConfig?.searchText });
    }

    clearSearch(): void {
        this.reviewCommentsConfig.searchText = '';
        this.searchTextChanged();
    }

    scrollToSection(sectionKey: string, goToIndex: number): void {
        this.sectionKey = sectionKey;
        const UNIQUE_ID = 'coi-RevC-' + this.reviewCommentsConfig?.uniqueId + '-section-' + sectionKey;
        // this._commonService.$globalEventNotifier.next({ uniqueId: 'DISCLOSURE_COMMENTS_SECTION_NAVIGATION', content: { uniqueId: UNIQUE_ID } });
        setTimeout(() => {
            const SECTION_ELEMENT = document.getElementById(this.reviewCommentsConfig?.triggeredSource?.scrollElementId);
            const TARGET_ELEMENT = document.getElementById(UNIQUE_ID);
            const TARGET_ELEMENT_TOP = TARGET_ELEMENT?.offsetTop || 0;
            if (SECTION_ELEMENT) {
                SECTION_ELEMENT.scrollTo({
                    top: TARGET_ELEMENT_TOP - (goToIndex == 0 ? 152 : 142),
                    behavior: 'smooth',
                });
            }
        });
    }

    addCommentSectionChanges(sectionKey: string | number): void {
        this.reviewCommentsConfig?.addAllCommentsConfig?.forEach((commentSections) => {
          commentSections?.componentComments?.forEach((commentAddSection) => {
            if (commentAddSection?.moduleSectionDetails?.sectionKey === sectionKey) {
                this.selectedAddCommentSection = deepCloneObject(commentAddSection);
            }
          });
        });
        this.openAddAllComments();
    }

}
