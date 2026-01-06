import { Component, Input, OnInit } from '@angular/core';
import { Subscription, Subject, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { GlobalEventNotifier } from '../../../common/services/coi-common.interface';
import { CommonService } from '../../../common/services/common.service';
import { openCoiSlider, openCommonModal, closeCommonModal, isEmptyObject, deepCloneObject } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from '../../../shared-components/coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentsConfig, CommentCardConfig, COIReviewCommentList, ModuleSectionDetails, COIReviewCommentsActions, COIReviewCommentEditor, CardCommentDetails } from '../../../shared-components/coi-review-comments/coi-review-comments.interface';
import { EntityReviewCommentsService } from './entity-review-comments.service';
import { AddEntityReviewCommentsRO, EntityDetails, EntityReviewComments, EntityReviewCommentsSliderConfig } from '../entity-interface';
import { ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP, ENTITY_REVIEW_COMMENTS_COMPONENT_SORT } from '../entity-constants';

@Component({
    selector: 'app-entity-review-comments-slider',
    templateUrl: './entity-review-comments-slider.component.html',
    styleUrls: ['./entity-review-comments-slider.component.scss'],
    providers: [EntityReviewCommentsService]
})
export class EntityReviewCommentsSliderComponent implements OnInit {

    @Input() entityDetails = new EntityDetails();
    @Input() reviewCommentsSliderConfig = new EntityReviewCommentsSliderConfig();

    isSaving = false;
    isOpenSlider = false;
    $subscriptions: Subscription[] = [];
    sliderId = 'coi-review-comments-slider';
    deleteCommentDetails: EntityReviewComments = null;
    deleteCommentModalId = 'coi-RevC-delete-confirm-modal';
    reviewCommentsTypes: Record<number | string, string> = {};
    reviewCommentsSectionConfig = new COIReviewCommentsConfig();
    reviewCommentsSections = ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP;
    actualReviewComments: Record<number | string, EntityReviewComments[]>;
    modalConfig = new CommonModalConfig(this.deleteCommentModalId, 'Delete', 'Cancel');
    $fetchReviewComments = new Subject<'INITIAL_LOAD' | 'UPDATE_LOAD' | 'SEARCH_TEXT_CHANGED'>();

    constructor(private _commonService: CommonService, private _reviewCommentService: EntityReviewCommentsService) {}

    async ngOnInit() {
        this.listenToGlobalNotifier();
        this.triggerFetchComments();
        this.$fetchReviewComments.next('INITIAL_LOAD');
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                this.commentActions(data)
            }
        }));
    }

    private triggerFetchComments(): void {
        this.$subscriptions.push(
            this.$fetchReviewComments.pipe(
                switchMap((loadType: 'INITIAL_LOAD' | 'UPDATE_LOAD' | 'SEARCH_TEXT_CHANGED') => {
                    this.actualReviewComments = {};
                    const SECTION_TYPE_CODE = this.reviewCommentsSliderConfig?.isShowAllComments ? null : this.reviewCommentsSliderConfig?.sectionTypeCode;
                    return this._reviewCommentService.getEntityReviewComments(this.entityDetails?.entityNumber, SECTION_TYPE_CODE).pipe(
                        catchError((error) => {
                            this.handleFetchCommentError(loadType);
                            return of(undefined);
                        })
                    );
                })
            ).subscribe((reviewComments: any) => {
                if (reviewComments != undefined) {
                    this.setFilteredReviewComments(reviewComments);
                    this.openReviewCommentSlider();
                }
            })
        );
    }

    private convertToCommentCardConfigArray(coiReviewCommentsArray: EntityReviewComments[], sectionTypeCode: string | number, moduleSectionDetails: ModuleSectionDetails, isReplyComment: boolean = false): CommentCardConfig[] {
        const SECTION_DETAILS = ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP[sectionTypeCode]
        return coiReviewCommentsArray?.map(coiReviewComments => {
            const cardConfig = new CommentCardConfig();
            cardConfig.uniqueId = coiReviewComments?.entityCommentId ?? null;
            cardConfig.isReplyComment = isReplyComment;
            cardConfig.isEditMode = this.reviewCommentsSliderConfig?.isEditMode;
            cardConfig.isOpenAddComment = false;
            cardConfig.canMaintainPrivateComments = false;
            cardConfig.canMaintainComments = this._commonService.getAvailableRight(SECTION_DETAILS?.rights.manage);
            cardConfig.canResolveComments = this._commonService.getAvailableRight(SECTION_DETAILS?.rights.resolve);
            cardConfig.isDocumentOwner = this.reviewCommentsSliderConfig?.isDocumentOwner;
            cardConfig.componentTypeCode = SECTION_DETAILS?.uniqueId ?? null;
            cardConfig.commentDetails = {
                ...coiReviewComments,
                sectionTypeCode: sectionTypeCode,
                commentId: coiReviewComments?.entityCommentId ?? null,
                parentCommentId: coiReviewComments?.parentCommentId ?? null,
                commentPersonId: coiReviewComments?.updatedBy ?? '',
                comment: coiReviewComments?.comment ?? '',
                documentOwnerPersonId: null,
                isPrivate: coiReviewComments?.isPrivate ?? false,
                updateUserFullName: coiReviewComments?.updatedByFullName ?? '',
                updateTimestamp: coiReviewComments?.updateTimestamp ?? null,
                childComments: this.convertToCommentCardConfigArray(coiReviewComments?.childComments, sectionTypeCode, moduleSectionDetails, true) ?? [],
            };

            cardConfig.moduleSectionDetails = moduleSectionDetails || null;
            return cardConfig;
        });
    }

    private setFilteredReviewComments(reviewComments: any): void {
        const SECTION_DETAILS = ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP[this.reviewCommentsSliderConfig?.sectionTypeCode];
        const IS_SHOW_ALL_COMMENTS = this.reviewCommentsSliderConfig?.isShowAllComments;
        const IS_COMMENTS_EMPTY_SECTION =  !IS_SHOW_ALL_COMMENTS && !reviewComments?.length;
        this.reviewCommentsSectionConfig = {
            uniqueId: 'disclosure',
            filteredReviewCommentsList: [],
            reviewCommentsSections: this.reviewCommentsSections,
            searchText: this.reviewCommentsSliderConfig.searchText || '',
            isEditMode: this.reviewCommentsSliderConfig?.isEditMode || false,
            checkboxConfig: this.reviewCommentsSliderConfig?.checkboxConfig || [],
            componentTypeCode: SECTION_DETAILS?.uniqueId || null,
            componentDetails: SECTION_DETAILS,
            canAddAllComments: IS_SHOW_ALL_COMMENTS,
            isDocumentOwner: this.reviewCommentsSliderConfig?.isDocumentOwner || false,
            moduleSectionDetails: {
                sectionId: SECTION_DETAILS?.commentTypeCode,
                sectionKey: SECTION_DETAILS?.commentTypeCode,
                sectionName: SECTION_DETAILS?.commentSectionName,
                canMaintainComments: SECTION_DETAILS?.rights.manage.length ? this._commonService.getAvailableRight(SECTION_DETAILS?.rights.manage) : false,
                canResolveComments: SECTION_DETAILS?.rights.resolve.length ? this._commonService.getAvailableRight(SECTION_DETAILS?.rights.resolve) : false,
                canMaintainPrivateComments: false,
            },
            triggeredSource: { from: 'ENTITY_REVIEW_SLIDER', scrollElementId: this.sliderId + '-slider-body', isTriggeredFromSlider: true },
        }
        const ADD_NEW_REVIEW_COMMENT: EntityReviewComments = {
            parentCommentId: null,
            comment: '',
            isPrivate: false,
            commentTypeCode: SECTION_DETAILS?.commentTypeCode,
            entityId: this.entityDetails?.entityId,
            entityNumber: this.entityDetails?.entityNumber,
            entityCommentId: null,
            sectionCode: null,
            updatedBy: '',
            updatedByFullName: this._commonService.getCurrentUserDetail('fullName'),
            updateTimestamp: null,
            sectionTypeCode: this.reviewCommentsSliderConfig?.sectionTypeCode,
            childComments: [],
        }
        const { canMaintainComments, canMaintainPrivateComments } = this.reviewCommentsSectionConfig?.moduleSectionDetails;
        const REVIEW_COMMENT = IS_COMMENTS_EMPTY_SECTION && (canMaintainComments || canMaintainPrivateComments) ? [ADD_NEW_REVIEW_COMMENT] : reviewComments;
        this.actualReviewComments = !IS_SHOW_ALL_COMMENTS ? { [this.reviewCommentsSliderConfig?.sectionTypeCode]: REVIEW_COMMENT } : reviewComments;
        this.setAllAddComments();
        this.setSearchAndFilterComment();
    }

    private setAllAddComments(): void {
        if (this.reviewCommentsSliderConfig?.isShowAllComments) {
            const ADD_COMMENTS_SECTIONS: Record<string, EntityReviewComments[]> = {};
            for (const [SECTION_TYPE_CODE, SECTION_DETAILS] of Object.entries(ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP || {})) {
                if (this._commonService.getAvailableRight(SECTION_DETAILS.rights.manage)) {
                    const ADD_NEW_REVIEW_COMMENT: EntityReviewComments = {
                        parentCommentId: null,
                        comment: '',
                        isPrivate: false,
                        commentTypeCode: SECTION_DETAILS?.commentTypeCode,
                        entityId: this.entityDetails?.entityId,
                        entityNumber: this.entityDetails?.entityNumber,
                        entityCommentId: null,
                        sectionCode: null,
                        updatedBy: '',
                        updatedByFullName: this._commonService.getCurrentUserDetail('fullName'),
                        updateTimestamp: null,
                        sectionTypeCode: SECTION_TYPE_CODE,
                        childComments: [],
                    }
                    ADD_COMMENTS_SECTIONS[SECTION_TYPE_CODE] = [ADD_NEW_REVIEW_COMMENT];
                }
            }
            if (!isEmptyObject(ADD_COMMENTS_SECTIONS)) {
                const FILTERED_COMMENT_LIST = this.getFilteredCommentList(ADD_COMMENTS_SECTIONS, '');
                const SORTED_LIST = this.sortGroupedArray(FILTERED_COMMENT_LIST, ENTITY_REVIEW_COMMENTS_COMPONENT_SORT);
                this.reviewCommentsSectionConfig.addAllCommentsConfig = SORTED_LIST;
                const DEFAULT_SECTION_DETAILS = ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP[this.reviewCommentsSliderConfig?.sectionTypeCode];
                const DEFAULT_COMMENTS_SECTION = this.reviewCommentsSectionConfig.addAllCommentsConfig?.find((commentSection: COIReviewCommentList) => commentSection.componentTypeCode == DEFAULT_SECTION_DETAILS?.uniqueId );
                this.reviewCommentsSectionConfig.selectedAddCommentSection = DEFAULT_COMMENTS_SECTION ? deepCloneObject(DEFAULT_COMMENTS_SECTION?.componentComments[0]) : null;
            }
        }
    }

    private setSearchAndFilterComment(): void {
        this.reviewCommentsSliderConfig.searchText = this.reviewCommentsSliderConfig?.searchText?.trim();
        const FILTERED_COMMENT_LIST = this.getFilteredCommentList(this.actualReviewComments, this.reviewCommentsSliderConfig?.searchText);
        const SORTED_LIST = this.sortGroupedArray(FILTERED_COMMENT_LIST, ENTITY_REVIEW_COMMENTS_COMPONENT_SORT);
        this.reviewCommentsSectionConfig.filteredReviewCommentsList = SORTED_LIST;
        this.reviewCommentsSectionConfig = { ...this.reviewCommentsSectionConfig };
    }

    private getFilteredCommentList(data: Record<string, EntityReviewComments[]>, searchText: string): COIReviewCommentList[] {
        const FILTERED_COMMENT_LIST: COIReviewCommentList[] = []
        for (const [key, value] of Object.entries(data || {})) {
            const FILTERED_COMMENTS_BY_SEARCH = this.getSearchComments(value, searchText);
            if (FILTERED_COMMENTS_BY_SEARCH?.length) {
                const SECTION_DETAILS = ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP[key]
                const COMPONENT_TYPE_CODE = SECTION_DETAILS.uniqueId
                const EXISTING_LIST = FILTERED_COMMENT_LIST.find(item => item?.componentTypeCode === COMPONENT_TYPE_CODE);
                const MODULE_SECTION_DETAILS: ModuleSectionDetails = {
                    sectionId: SECTION_DETAILS?.commentTypeCode,
                    sectionKey: SECTION_DETAILS?.commentTypeCode,
                    sectionName: SECTION_DETAILS?.commentSectionName,
                    canMaintainComments: this._commonService.getAvailableRight(SECTION_DETAILS?.rights.manage),
                    canResolveComments: this._commonService.getAvailableRight(SECTION_DETAILS?.rights.resolve),
                    canMaintainPrivateComments: false,
                }
                if (!EXISTING_LIST) {
                    FILTERED_COMMENT_LIST.push({
                        componentComments: [{
                            moduleSectionDetails: MODULE_SECTION_DETAILS,
                            reviewCommentsList: this.convertToCommentCardConfigArray(FILTERED_COMMENTS_BY_SEARCH, key, MODULE_SECTION_DETAILS)
                        }],
                        componentName: SECTION_DETAILS?.componentName,
                        componentTypeCode: SECTION_DETAILS?.uniqueId,
                        canMaintainComments: this._commonService.getAvailableRight(SECTION_DETAILS?.rights.manage),
                        canResolveComments: this._commonService.getAvailableRight(SECTION_DETAILS?.rights.resolve),
                        canMaintainPrivateComments: false,
                    })
                } else {
                    EXISTING_LIST.componentComments.push({
                        moduleSectionDetails: MODULE_SECTION_DETAILS,
                        reviewCommentsList: this.convertToCommentCardConfigArray(FILTERED_COMMENTS_BY_SEARCH, key, MODULE_SECTION_DETAILS)
                    })
                }
            }
        }
        return FILTERED_COMMENT_LIST;
    }

    private sortGroupedArray(groupedArray: COIReviewCommentList[], sortOrder: string[]): COIReviewCommentList[] {
        return groupedArray.sort((a, b) => {
            const indexA = sortOrder.indexOf(a?.componentTypeCode?.toString());
            const indexB = sortOrder.indexOf(b?.componentTypeCode?.toString());
            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
        });
    }

    private getSearchComments(comments: EntityReviewComments[], searchText: string): EntityReviewComments[] {
        if (!comments || !searchText) {
            return comments; // Return the original array if no search text is provided
        }
        const LOWER_CASE_SEARCH_TEXT = searchText.toLowerCase();
        return comments.map(commentObj => {
            const IS_MATCH = commentObj.comment?.toLowerCase().includes(LOWER_CASE_SEARCH_TEXT);
            const FILTERED_CHILD_COMMENTS = this.getSearchComments(commentObj.childComments, searchText);
            if (IS_MATCH || (FILTERED_CHILD_COMMENTS && FILTERED_CHILD_COMMENTS.length > 0)) {
                return { ...commentObj, childComments: FILTERED_CHILD_COMMENTS };
            }
            return null;
        }).filter(commentObj => commentObj !== null);
    }

    private handleFetchCommentError(loadType: 'INITIAL_LOAD' | 'UPDATE_LOAD' | 'SEARCH_TEXT_CHANGED'): void {
        if (loadType === 'INITIAL_LOAD') {
            this._reviewCommentService.notifyGlobalEvent('API_FAILED_ON_INITIAL_LOAD');
        }
        if (['UPDATE_LOAD'].includes(loadType)) {
            this.reviewCommentsSectionConfig.filteredReviewCommentsList = [];
        }
        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }

    private commentActions(event: GlobalEventNotifier): void {
        switch (event?.content?.action as COIReviewCommentsActions) {
            case 'ADD_COMMENT':
                this.addReviewComment(event?.content?.commentEditorConfig);
                break;
            case 'EDIT_COMMENT':
                this.updateReviewComment(event?.content?.commentEditorConfig);
                break;
            case 'DELETE_COMMENT':
                this.triggerDeleteConfirmationModal(event);
                break;
            case 'SEARCH_TEXT_CHANGED':
                this.reviewCommentsSliderConfig.searchText = event?.content?.searchText;
                this.setSearchAndFilterComment();
                break;
            case 'RESOLVE_COMMENT':
                this.resolveComment(event?.content?.commentDetails);
                break;
            default:
                break;
        }
    }

    private resolveComment(commentDetails: CardCommentDetails): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._reviewCommentService.resolveComment(commentDetails?.commentId).subscribe(() => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment Resolved Successfully');
                this.$fetchReviewComments.next('UPDATE_LOAD');
                this.isSaving = false;
            }, err => {
                if (err.status === 405) {
                    this._commonService.concurrentUpdateAction = 'resolve comment';
                } else {
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in resolving comment, please try again.');
                }
            }));
        }
    }

    private getSaveReviewCommentRO(editorDetails: COIReviewCommentEditor): AddEntityReviewCommentsRO {
        const RO: AddEntityReviewCommentsRO = {
            entityId: this.entityDetails?.entityId,
            entityNumber: this.entityDetails?.entityNumber,
            comment: editorDetails?.commentDetails?.comment,
            isPrivate: editorDetails?.commentDetails?.isPrivate,
            entityCommentId: editorDetails?.commentDetails?.commentId,
            sectionCode: editorDetails?.commentDetails?.sectionTypeCode,
            parentCommentId: editorDetails?.commentDetails?.parentCommentId,
            commentTypeCode: editorDetails?.commentDetails?.commentTypeCode || ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP[editorDetails?.commentDetails?.sectionTypeCode]?.commentTypeCode
        }
        return RO;
    }

    private addReviewComment(editorDetails: COIReviewCommentEditor): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._reviewCommentService.addEntityReviewComment(this.getSaveReviewCommentRO(editorDetails))
                    .subscribe((res: any) => {
                        this.$fetchReviewComments.next('UPDATE_LOAD');
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment added successfully.');
                        this.isSaving = false;
                    }, (error: any) => {
                        this.isSaving = false;
                        if (error.status === 405) {
                            this._commonService.concurrentUpdateAction = 'review comment';
                        } else {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in adding comment, please try again.');
                        }
                    }));
        }
    }

    private updateReviewComment(editorDetails: COIReviewCommentEditor): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._reviewCommentService.updateEntityReviewComment(this.getSaveReviewCommentRO(editorDetails))
                    .subscribe((res: any) => {
                        this.$fetchReviewComments.next('UPDATE_LOAD');
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment updated successfully.');
                        this.isSaving = false;
                    }, (error: any) => {
                        this.isSaving = false;
                        if (error.status === 405) {
                            this._commonService.concurrentUpdateAction = 'review comment';
                        } else {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in updating comment, please try again.');
                        }
                    }));
        }
    }

    private deleteReviewComment(): void {
        this.$subscriptions.push(
            this._reviewCommentService.deleteReviewComments(this.deleteCommentDetails?.sectionTypeCode, this.deleteCommentDetails?.entityCommentId)
                .subscribe((res: any) => {
                    this.closeDeleteConfirmationModal();
                    this.$fetchReviewComments.next('UPDATE_LOAD');
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment deleted successfully.');
                }, (error: any) => {
                    if (error.status === 405) {
                        this._commonService.concurrentUpdateAction = 'review comment';
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in deleting comment, please try again.');
                    }
                }));
    }

    closeReviewCommentSlider(): void {
        setTimeout(() => {
            this.clearReviewCommentSlider();
        }, 500);
    }

    private openReviewCommentSlider(): void {
        if (!this.isOpenSlider) {
            this.isOpenSlider = true;
            setTimeout(() => {
                openCoiSlider(this.sliderId);
            }, 100);
        }
    }

    private clearReviewCommentSlider(): void {
        this.isOpenSlider = false;
        this._reviewCommentService.notifyGlobalEvent('CLOSE_REVIEW_SLIDER', this.reviewCommentsSliderConfig);
    }

    triggerDeleteConfirmationModal(event: GlobalEventNotifier): void {
        this.deleteCommentDetails = event?.content?.commentDetails;
        setTimeout(() => {
            openCommonModal(this.deleteCommentModalId);
        }, 50);
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.deleteReviewComment();
        } else {
            this.closeDeleteConfirmationModal();
        }
    }

    private closeDeleteConfirmationModal(): void {
        closeCommonModal(this.deleteCommentModalId);
        setTimeout(() => {
            this.deleteCommentDetails = null;
        }, 200);
    }

}
