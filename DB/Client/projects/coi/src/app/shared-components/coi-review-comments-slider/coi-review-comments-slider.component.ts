import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { closeCommonModal, deepCloneObject, isEmptyObject, openCoiSlider, openCommonModal } from '../../common/utilities/custom-utilities';
import { CoiReviewCommentsService } from '../coi-review-comments/coi-review-comments.service';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { switchMap, catchError } from 'rxjs/operators';
import { CommonModalConfig, ModalActionEvent } from '../common-modal/common-modal.interface';
import { COI_REVIEW_COMMENTS_IDENTIFIER, FCOI_ADMINISTRATOR_COMMENTS, FCOI_ENGAGEMENT_COMMENTS, FCOI_PROJECT_COMMENTS, OPA_FORM_COMMENTS } from '../coi-review-comments/coi-review-comments-constants';
import { AddReviewCommentRO, COIReviewComments, COIReviewCommentsSliderConfig, COIReviewCommentsWithProjects, FetchReviewCommentRO } from './coi-review-comments-slider.interface';
import {
    CardCommentDetails,
    COIReviewCommentEditor,
    COIReviewCommentList,
    COIReviewCommentsActions,
    COIReviewCommentsConfig,
    CommentCardConfig,
    ModuleSectionDetails
} from '../coi-review-comments/coi-review-comments.interface';
import { CoiReviewCommentSliderService } from './coi-review-comment-slider.service';

@Component({
    selector: 'app-coi-review-comments-slider',
    templateUrl: './coi-review-comments-slider.component.html',
    styleUrls: ['./coi-review-comments-slider.component.scss'],
    providers: [CoiReviewCommentsService, CoiReviewCommentSliderService]
})
export class CoiReviewCommentsSliderComponent implements OnInit {

    @Input() reviewCommentsSliderConfig = new COIReviewCommentsSliderConfig();

    isSaving = false;
    isOpenSlider = false;
    $subscriptions: Subscription[] = [];
    sliderId = 'coi-review-comments-slider';
    deleteCommentDetails: COIReviewComments = null;
    deleteCommentModalId = 'coi-RevC-delete-confirm-modal';
    reviewCommentsTypes: Record<number | string, string> = {};
    reviewCommentsSectionConfig = new COIReviewCommentsConfig();
    actualReviewComments: Record<number | string, COIReviewComments[]>;
    modalConfig = new CommonModalConfig(this.deleteCommentModalId, 'Delete', 'Cancel');
    $fetchReviewComments = new Subject<'INITIAL_LOAD' | 'UPDATE_LOAD' | 'SEARCH_TEXT_CHANGED'>();

    constructor(private _commonService: CommonService, private _reviewCommentService: CoiReviewCommentsService) {}

    ngOnInit() {
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
                this.commentActions(data);
            }
        }));
    }

    private triggerFetchComments(): void {
        this.$subscriptions.push(
            this.$fetchReviewComments.pipe(
                switchMap((loadType: 'INITIAL_LOAD' | 'UPDATE_LOAD' | 'SEARCH_TEXT_CHANGED') => {
                    this.actualReviewComments = {};
                    return this._reviewCommentService.getCoiReviewComments(this.getFetchReviewCommentRO()).pipe(
                        catchError((error) => {
                            this.handleFetchCommentError(loadType);
                            return of(undefined);
                        })
                    );
                })
            ).subscribe((reviewComments: COIReviewCommentsWithProjects) => {
                if (reviewComments !== undefined) {
                    const REVIEW_COMMENTS_LIST: COIReviewComments[] = this.getFormattedReviewCommentsList(reviewComments);
                    this.setFilteredReviewComments(REVIEW_COMMENTS_LIST);
                    this.openReviewCommentSlider();
                }
            })
        );
    }

    private getFormattedReviewCommentsList(reviewComments: COIReviewCommentsWithProjects): COIReviewComments[] {
        if (!reviewComments) {
            return [];
        } else if (Array.isArray(reviewComments)) {
            return reviewComments;
        }
        const FORMATTED_COMMENTS: COIReviewComments[] = [];
        if (Array.isArray(reviewComments.comments) && reviewComments.comments.length) {
            FORMATTED_COMMENTS.push(...reviewComments.comments);
        }
        // Adding project-specific comments if projectComments exists
        if (Array.isArray(reviewComments.projectComments) && reviewComments.projectComments.length) {
            reviewComments.projectComments?.forEach(project => {
                project.comments?.forEach(comment => {
                    const FORMATTED = this.formatCommentRecursively(comment, project);
                        FORMATTED_COMMENTS.push(FORMATTED);
                    });
            });
        }
        return FORMATTED_COMMENTS;
    }

    private formatCommentRecursively(comment: COIReviewComments, project): COIReviewComments {
        const { projectNumber, projectTitle } = project;
        const COMPONENT_CONFIG = {
            componentTypeCode: FCOI_ADMINISTRATOR_COMMENTS.componentTypeCode,
            componentName: FCOI_ADMINISTRATOR_COMMENTS.componentName
        };
        return {
            ...comment,
            moduleSectionDetails: {
            sectionId: projectNumber,
            sectionName: projectTitle
            },
            componentType: {
            componentTypeCode: COMPONENT_CONFIG.componentTypeCode,
            description: COMPONENT_CONFIG.componentName
            },
            componentTypeCode: COMPONENT_CONFIG.componentTypeCode,
            childComments: comment.childComments?.map(child => this.formatCommentRecursively(child, project)) || []
        };
    }

    private groupCommentsByComponentTypeCode(comments: COIReviewComments[]): { [key: string]: COIReviewComments[] } {
        return comments?.reduce((result, comment) => {
            const componentTypeCode = comment?.componentTypeCode;

            if (!result[componentTypeCode]) {
                result[componentTypeCode] = [];
            }

            result[componentTypeCode].push(comment);

            return result;
        }, {} as { [key: string]: any[] });
    }

    private convertToCommentCardConfigArray(coiReviewComments: COIReviewComments, sectionTypeCode: string | number, moduleSectionDetails: ModuleSectionDetails, isReplyComment: boolean = false): CommentCardConfig {
        const SECTION_DETAILS = this.reviewCommentsSliderConfig?.reviewCommentsSections[sectionTypeCode] || {};
        const cardConfig = new CommentCardConfig();
        cardConfig.uniqueId = coiReviewComments?.commentId ?? null;
        cardConfig.isReplyComment = isReplyComment;
        cardConfig.isEditMode = this.reviewCommentsSliderConfig?.isEditMode;
        cardConfig.isOpenAddComment = false;
        cardConfig.canMaintainComments = this.reviewCommentsSliderConfig?.canMaintainComments;
        cardConfig.canMaintainPrivateComments = this.reviewCommentsSliderConfig?.canMaintainPrivateComments;
        cardConfig.canResolveComments = this.reviewCommentsSliderConfig?.canResolveComments;
        cardConfig.isDocumentOwner = this.reviewCommentsSliderConfig?.isDocumentOwner;
        cardConfig.componentTypeCode = SECTION_DETAILS?.uniqueId ?? null;
        cardConfig.commentDetails = {
            ...coiReviewComments,
            commentId: coiReviewComments?.commentId ?? null,
            parentCommentId: coiReviewComments?.parentCommentId ?? null,
            commentPersonId: coiReviewComments?.commentPersonId ?? '',
            comment: coiReviewComments?.comment ?? '',
            documentOwnerPersonId: coiReviewComments?.documentOwnerPersonId ?? '',
            isPrivate: coiReviewComments?.isPrivate ?? false,
            updateUserFullName: coiReviewComments?.updateUserFullName ?? '',
            updateTimestamp: coiReviewComments?.updateTimestamp ?? null,
            isParentCommentResolved: coiReviewComments?.isParentCommentResolved,
            childComments: coiReviewComments?.childComments?.map(coiChildReviewComments => coiChildReviewComments = this.convertToCommentCardConfigArray(coiChildReviewComments, sectionTypeCode, moduleSectionDetails, true)) ?? []
        };

        cardConfig.moduleSectionDetails = coiReviewComments?.moduleSectionDetails || null;
        return cardConfig;
    }

    private getFetchReviewCommentRO(): FetchReviewCommentRO {
        const COMMENT_PAYLOAD: FetchReviewCommentRO = {
            moduleItemKey: this.reviewCommentsSliderConfig?.moduleItemKey,
            moduleItemNumber: this.reviewCommentsSliderConfig?.moduleItemNumber,
            subModuleItemKey: this.reviewCommentsSliderConfig?.subModuleItemKey,
            subModuleItemNumber: this.reviewCommentsSliderConfig?.subModuleItemNumber,
            moduleCode: this.reviewCommentsSliderConfig?.moduleCode,
            subModuleCode: this.reviewCommentsSliderConfig?.subModuleCode,
            componentTypeCode: this.reviewCommentsSliderConfig?.isShowAllComments && this.reviewCommentsSliderConfig?.componentTypeCode != FCOI_PROJECT_COMMENTS.componentTypeCode ? null : this.reviewCommentsSliderConfig?.componentTypeCode,
            parentCommentId: this.reviewCommentsSliderConfig?.parentCommentId,
            isSectionDetailsNeeded: this.reviewCommentsSliderConfig?.isSectionDetailsNeeded,
            documentOwnerPersonId: this.reviewCommentsSliderConfig?.documentOwnerPersonId,
            formBuilderId: this.reviewCommentsSliderConfig?.formBuilderId || undefined,
            formBuilderComponentId: this.reviewCommentsSliderConfig?.formBuilderComponentId || undefined,
            projects: this.reviewCommentsSliderConfig?.projects?.length ? this.reviewCommentsSliderConfig.projects : undefined
        };
        return COMMENT_PAYLOAD;
    }

    private setFilteredReviewComments(reviewComments: any): void {
        const SECTION_DETAILS = this.reviewCommentsSliderConfig?.reviewCommentsSections[this.reviewCommentsSliderConfig?.componentTypeCode];
        const IS_SHOW_ALL_COMMENTS = this.reviewCommentsSliderConfig?.isShowAllComments;
        const IS_COMMENTS_EMPTY_SECTION = !reviewComments?.length;
        this.reviewCommentsSectionConfig = {
            uniqueId: 'disclosure',
            filteredReviewCommentsList: [],
            reviewCommentsSections: this.reviewCommentsSliderConfig?.reviewCommentsSections,
            sliderHeader: this.reviewCommentsSliderConfig?.sliderHeader,
            searchText: this.reviewCommentsSliderConfig.searchText || '',
            isEditMode: this.reviewCommentsSliderConfig?.isEditMode || false,
            checkboxConfig: this.reviewCommentsSliderConfig?.checkboxConfig || [],
            componentTypeCode: this.reviewCommentsSliderConfig?.componentTypeCode,
            componentDetails: this.reviewCommentsSliderConfig?.componentDetails || SECTION_DETAILS,
            canAddAllComments: IS_SHOW_ALL_COMMENTS,
            isDocumentOwner: this.reviewCommentsSliderConfig?.isDocumentOwner || false,
            moduleSectionDetails: {
               ...this.reviewCommentsSliderConfig?.moduleSectionDetails,
                canMaintainComments: this.reviewCommentsSliderConfig?.canMaintainComments,
                canMaintainPrivateComments: this.reviewCommentsSliderConfig?.canMaintainPrivateComments,
            },
            triggeredSource: { from: 'ENTITY_REVIEW_SLIDER', scrollElementId: this.sliderId + '-slider-body', isTriggeredFromSlider: true },
        }
        const ADD_NEW_REVIEW_COMMENT: COIReviewComments = {
            parentCommentId: null,
            comment: '',
            isPrivate: false,
            updateUser: '',
            updateUserFullName: this._commonService.getCurrentUserDetail('fullName'),
            updateTimestamp: null,
            componentTypeCode: this.reviewCommentsSliderConfig?.componentTypeCode,
            childComments: [],
            moduleCode: this.reviewCommentsSliderConfig?.moduleCode,
            subModuleCode: this.reviewCommentsSliderConfig?.subModuleCode,
            moduleItemKey: this.reviewCommentsSliderConfig?.moduleItemKey,
            subModuleItemKey: this.reviewCommentsSliderConfig?.subModuleItemKey,
            moduleItemNumber: this.reviewCommentsSliderConfig?.moduleItemNumber,
            subModuleItemNumber: this.reviewCommentsSliderConfig?.subModuleItemNumber,
            documentOwnerPersonId: this.reviewCommentsSliderConfig?.documentOwnerPersonId,
            moduleSectionDetails: this.reviewCommentsSliderConfig?.moduleSectionDetails,
            componentType: SECTION_DETAILS
        }
        const HAS_MANAGE_RIGHT = this.reviewCommentsSliderConfig?.canMaintainComments || this.reviewCommentsSliderConfig?.canMaintainPrivateComments || this.reviewCommentsSliderConfig?.isDocumentOwner;
        const REVIEW_COMMENT = IS_COMMENTS_EMPTY_SECTION && HAS_MANAGE_RIGHT ? [ADD_NEW_REVIEW_COMMENT] : reviewComments;
        const groupedComments = this.groupCommentsByComponentTypeCode(reviewComments);
        this.actualReviewComments = !IS_SHOW_ALL_COMMENTS ? { [this.reviewCommentsSliderConfig?.componentTypeCode]: REVIEW_COMMENT } : groupedComments;
        this.setAllAddComments();
        this.setSearchAndFilterComment();
    }

    private setAllAddComments(): void {
        if (this.reviewCommentsSliderConfig?.isShowAllComments) {
            const ADD_COMMENTS_SECTIONS: Record<string, COIReviewComments[]> = {};
            for (const [SECTION_TYPE_CODE, SECTION_DETAILS] of Object.entries(this.reviewCommentsSliderConfig?.reviewCommentsSections || {})) {
                const CAN_MAINTAIN_COMMENT = this._commonService.getAvailableRight(SECTION_DETAILS.rights.manage) || this.reviewCommentsSliderConfig.isReviewer;
                const CAN_MAINTAIN_PRIVATE_COMMENT = this._commonService.getAvailableRight(SECTION_DETAILS.rights.managePrivate) || this.reviewCommentsSliderConfig.isReviewer;
                if (CAN_MAINTAIN_COMMENT || CAN_MAINTAIN_PRIVATE_COMMENT || SECTION_DETAILS.rights.canDocumentOwnerManage && this.reviewCommentsSliderConfig?.isDocumentOwner) {
                    const ADD_NEW_REVIEW_COMMENT: COIReviewComments = {
                        parentCommentId: null,
                        comment: '',
                        isPrivate: false,
                        updateUser: '',
                        updateUserFullName: this._commonService.getCurrentUserDetail('fullName'),
                        updateTimestamp: null,
                        componentTypeCode: SECTION_TYPE_CODE,
                        childComments: [],
                        moduleCode: this.reviewCommentsSliderConfig?.moduleCode,
                        subModuleCode: this.reviewCommentsSliderConfig?.subModuleCode,
                        moduleItemKey: this.reviewCommentsSliderConfig?.moduleItemKey,
                        subModuleItemKey: this.reviewCommentsSliderConfig?.subModuleItemKey,
                        moduleItemNumber: this.reviewCommentsSliderConfig?.moduleItemNumber,
                        subModuleItemNumber: this.reviewCommentsSliderConfig?.subModuleItemNumber,
                        documentOwnerPersonId: this.reviewCommentsSliderConfig?.documentOwnerPersonId,
                        moduleSectionDetails: {
                            sectionKey: SECTION_DETAILS?.componentTypeCode,
                            sectionId: SECTION_DETAILS?.componentTypeCode,
                            sectionName: SECTION_DETAILS?.componentName,
                            canMaintainComments: CAN_MAINTAIN_COMMENT,
                            canMaintainPrivateComments: CAN_MAINTAIN_PRIVATE_COMMENT
                        },
                        componentType: {
                            componentTypeCode: SECTION_DETAILS.componentTypeCode,
                            description: SECTION_DETAILS.commentSectionName,
                        }
                    }
                    ADD_COMMENTS_SECTIONS[SECTION_TYPE_CODE] = [ADD_NEW_REVIEW_COMMENT];
                }
            }
            if (!isEmptyObject(ADD_COMMENTS_SECTIONS)) {
                const FILTERED_COMMENT_LIST = this.getFilteredCommentList(ADD_COMMENTS_SECTIONS, '');
                const SORTED_LIST = this.sortGroupedArray(FILTERED_COMMENT_LIST, this.reviewCommentsSliderConfig?.sortOrder);
                this.reviewCommentsSectionConfig.addAllCommentsConfig = SORTED_LIST;
                const DEFAULT_SECTION_DETAILS = this.reviewCommentsSliderConfig?.reviewCommentsSections[this.reviewCommentsSliderConfig?.componentTypeCode];
                const DEFAULT_COMMENTS_SECTION = this.reviewCommentsSectionConfig.addAllCommentsConfig?.find((commentSection: COIReviewCommentList) => commentSection.componentTypeCode == DEFAULT_SECTION_DETAILS?.uniqueId);
                this.reviewCommentsSectionConfig.selectedAddCommentSection = DEFAULT_COMMENTS_SECTION ? deepCloneObject(DEFAULT_COMMENTS_SECTION?.componentComments[0]) : null;
            }
        }
    }

    private setSearchAndFilterComment(): void {
        this.reviewCommentsSliderConfig.searchText = this.reviewCommentsSliderConfig?.searchText?.trim();
        const COMPONENT_TYPE_CODES_FOR_SECTION_NAME = [FCOI_PROJECT_COMMENTS.componentTypeCode, FCOI_ADMINISTRATOR_COMMENTS.componentTypeCode];
        const FILTERED_COMMENT_LIST = this.getFilteredCommentList(this.actualReviewComments, this.reviewCommentsSliderConfig?.searchText, COMPONENT_TYPE_CODES_FOR_SECTION_NAME);
        const SORTED_LIST = this.sortGroupedArray(FILTERED_COMMENT_LIST, this.reviewCommentsSliderConfig?.sortOrder);
        this.reviewCommentsSectionConfig.filteredReviewCommentsList = SORTED_LIST;
        this.reviewCommentsSectionConfig = { ...this.reviewCommentsSectionConfig };
    }

    private getFilteredCommentList(data: Record<string, COIReviewComments[]>, searchText: string, componentTypeCodesToSetSectionName = []): COIReviewCommentList[] {
        const FILTERED_COMMENT_LIST: COIReviewCommentList[] = [];
        for (const [key, value] of Object.entries(data || {})) {
            const FILTERED_COMMENTS_BY_SEARCH = this.getSearchComments(value, searchText);
            if (FILTERED_COMMENTS_BY_SEARCH?.length) {
                FILTERED_COMMENTS_BY_SEARCH.forEach((commentData) => {
                    const COMPONENT_TYPE_CODE = commentData?.componentTypeCode;
                    const EXISTING_LIST = FILTERED_COMMENT_LIST.find(item => item?.componentTypeCode == COMPONENT_TYPE_CODE);
                    const { sectionId, subsectionId, sectionName, otherDetails } = commentData?.moduleSectionDetails || {};
                    const SECTION_KEY = (sectionId + '' + subsectionId + sectionName + otherDetails?.location);
                    const SECTION_NAME = `#${sectionId} - ${sectionName}`;
                    const MODULE_SECTION_DETAILS: ModuleSectionDetails = {
                        ...commentData?.moduleSectionDetails,
                        sectionKey: SECTION_KEY,
                       sectionName: COMPONENT_TYPE_CODE && componentTypeCodesToSetSectionName.includes(COMPONENT_TYPE_CODE)
                        ? SECTION_NAME : sectionName,
                        canMaintainComments: this.reviewCommentsSliderConfig?.canMaintainComments,
                        canMaintainPrivateComments: this.reviewCommentsSliderConfig?.canMaintainPrivateComments,
                    }
                    const DATA = commentData?.moduleSectionDetails ? MODULE_SECTION_DETAILS : null;
                    if (!EXISTING_LIST) {
                        FILTERED_COMMENT_LIST.push({
                            componentComments: [{
                                moduleSectionDetails: DATA,
                                reviewCommentsList: [this.convertToCommentCardConfigArray(commentData, key, DATA)]
                            }],
                            componentName: this.getComponenetName(commentData),
                            componentTypeCode: commentData?.componentType?.componentTypeCode || this.reviewCommentsSliderConfig?.componentDetails?.componentTypeCode,
                            canMaintainComments: this.reviewCommentsSliderConfig?.canMaintainComments,
                            canMaintainPrivateComments: this.reviewCommentsSliderConfig?.canMaintainPrivateComments,
                            canResolveComments: this.reviewCommentsSliderConfig?.canResolveComments
                        })
                    } else {
                        const EXISTING_MODULE_LIST = EXISTING_LIST.componentComments.find(item => !item?.moduleSectionDetails || item?.moduleSectionDetails?.sectionKey == DATA?.sectionKey);
                        if (EXISTING_MODULE_LIST) {
                            EXISTING_MODULE_LIST.reviewCommentsList.push(this.convertToCommentCardConfigArray(commentData, key, DATA));
                        } else {
                            if (DATA) {
                                EXISTING_LIST.componentComments.push({
                                    moduleSectionDetails: DATA,
                                    reviewCommentsList: [this.convertToCommentCardConfigArray(commentData, key, DATA)]
                                })
                            } else {
                                EXISTING_LIST.componentComments.unshift({
                                    moduleSectionDetails: DATA,
                                    reviewCommentsList: [this.convertToCommentCardConfigArray(commentData, key, DATA)]
                                })
                            }
                        }
                    }
                })
            }
        }
        return FILTERED_COMMENT_LIST;
    }

    private getComponenetName(commentData: COIReviewComments) {
        return commentData?.componentType?.description || this.reviewCommentsSliderConfig?.componentDetails?.componentName;
    }

    private sortGroupedArray(groupedArray: COIReviewCommentList[], sortOrder: string[]): COIReviewCommentList[] {
        return groupedArray.sort((a, b) => {
            const indexA = sortOrder.indexOf(a?.componentTypeCode?.toString());
            const indexB = sortOrder.indexOf(b?.componentTypeCode?.toString());
            return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
        });
    }

    private getSearchComments(comments: COIReviewComments[], searchText: string): COIReviewComments[] {
        if (!comments || !searchText) {
            return comments; // Return the original array if no search text is provided
        }
        const LOWER_CASE_SEARCH_TEXT = searchText.toLowerCase();
        return comments.map(commentObj => {
            const IS_MATCH = commentObj?.comment?.toLowerCase().includes(LOWER_CASE_SEARCH_TEXT);
            const FILTERED_CHILD_COMMENTS = this.getSearchComments(commentObj?.childComments, searchText);
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
        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }

    private commentActions(event: GlobalEventNotifier): void {
        switch (event?.content?.action as COIReviewCommentsActions) {
            case 'ADD_COMMENT':
            case 'EDIT_COMMENT':
                this.saveReviewComment(event?.content?.commentEditorConfig, event?.content?.action);
                break;
            case 'DELETE_COMMENT':
                this.triggerDeleteConfirmationModal(event);
                break;
            case 'SEARCH_TEXT_CHANGED':
                this.reviewCommentsSliderConfig.searchText = event?.content?.searchText;
                this.setSearchAndFilterComment();
                break;
            case 'RESOLVE_COMMENT':
                this.resolveReviewComments(event?.content?.commentDetails);
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
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in resolving comment, please try again');
                }
            }));
        }
    }

    private projectResolveComment(commentDetails: CardCommentDetails): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._reviewCommentService.projectCommentsResolve(commentDetails?.commentId).subscribe(() => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment Resolved Successfully');
                this.$fetchReviewComments.next('UPDATE_LOAD');
                this.isSaving = false;
            }, err => {
                if (err.status === 405) {
                    this._commonService.concurrentUpdateAction = 'resolve comment';
                } else {
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in resolving comment, please try again');
                }
            }));
        }
    }

    private getSaveReviewCommentRO(editorDetails: COIReviewCommentEditor): AddReviewCommentRO {
        const COMMENT_DETAILS = editorDetails?.commentDetails;
        const ENGAGEMENT_COMPONENT_TYPES = [
            OPA_FORM_COMMENTS.commentTypeCode.toString(),
            FCOI_ENGAGEMENT_COMMENTS.commentTypeCode.toString()
        ];
        const IS_ENGAGEMENT_COMPONENT_TYPE = ENGAGEMENT_COMPONENT_TYPES.includes(COMMENT_DETAILS?.componentTypeCode?.toString());
        const SUB_MODULE_ITEM_KEY_FOR_ENGAGEMENT = IS_ENGAGEMENT_COMPONENT_TYPE ? COMMENT_DETAILS?.moduleSectionDetails?.sectionId : null;
        const COI_REVIEW_COMMENT_RO: AddReviewCommentRO = {
            comment: COMMENT_DETAILS?.comment,
            commentId: COMMENT_DETAILS?.commentId,
            isPrivate: COMMENT_DETAILS?.isPrivate,
            commentTags: COMMENT_DETAILS?.commentTags,
            parentCommentId: COMMENT_DETAILS?.parentCommentId,
            componentTypeCode: COMMENT_DETAILS?.componentTypeCode,
            moduleCode: COMMENT_DETAILS?.moduleCode || this.reviewCommentsSliderConfig?.moduleCode,
            subModuleCode: COMMENT_DETAILS?.subModuleCode || this.reviewCommentsSliderConfig?.subModuleCode,
            moduleItemKey: COMMENT_DETAILS?.moduleItemKey || this.reviewCommentsSliderConfig?.moduleItemKey,
            subModuleItemKey: SUB_MODULE_ITEM_KEY_FOR_ENGAGEMENT || COMMENT_DETAILS?.subModuleItemKey || this.reviewCommentsSliderConfig?.subModuleItemKey,
            moduleItemNumber: COMMENT_DETAILS?.moduleItemNumber || this.reviewCommentsSliderConfig?.moduleItemNumber,
            subModuleItemNumber: COMMENT_DETAILS?.subModuleItemNumber || this.reviewCommentsSliderConfig?.subModuleItemNumber,
            documentOwnerPersonId: COMMENT_DETAILS?.documentOwnerPersonId || this.reviewCommentsSliderConfig?.documentOwnerPersonId,
            formBuilderId: COMMENT_DETAILS?.formBuilderId || this.reviewCommentsSliderConfig?.formBuilderId || undefined,
            formBuilderComponentId: COMMENT_DETAILS?.formBuilderComponentId || this.reviewCommentsSliderConfig?.formBuilderComponentId || undefined,
            formBuilderSectionId: COMMENT_DETAILS?.formBuilderSectionId || this.reviewCommentsSliderConfig?.formBuilderSectionId || undefined,
        };
        return COI_REVIEW_COMMENT_RO;
    }

    private getSaveProjectCommentRO(editorDetails: COIReviewCommentEditor): AddReviewCommentRO {
        const PROJECT_COMMENT_RO: AddReviewCommentRO = {
            comment: editorDetails?.commentDetails?.comment,
            commentId: editorDetails?.commentDetails?.commentId,
            commentType: editorDetails?.commentDetails?.commentType,
            commentTypeCode: editorDetails?.commentDetails?.commentTypeCode,
            isPrivate: editorDetails?.commentDetails?.isPrivate,
            parentCommentId: editorDetails?.commentDetails?.parentCommentId,
            moduleCode: editorDetails?.commentDetails?.moduleCode || this.reviewCommentsSliderConfig?.moduleCode,
            moduleItemKey: editorDetails?.commentDetails?.moduleItemKey || this.reviewCommentsSliderConfig?.moduleItemKey,
        };
        return PROJECT_COMMENT_RO;
    }

    private saveReviewComment(editorDetails: COIReviewCommentEditor, editorAction: COIReviewCommentsActions): void {
        if (!this.isSaving) {
            this.isSaving = true;
            if (editorDetails?.commentDetails?.componentTypeCode?.toString() === FCOI_ADMINISTRATOR_COMMENTS.componentTypeCode?.toString()){
                this.projectReviewCommentAction(editorDetails, editorAction);
            } else {
                this.COIReviewCommentSave(editorDetails);
            }
        }
    }

    private resolveReviewComments(commentDetails: CardCommentDetails): void {
        if (commentDetails?.componentTypeCode?.toString() === FCOI_ADMINISTRATOR_COMMENTS.componentTypeCode?.toString()) {
            this.projectResolveComment(commentDetails);
        } else {
            this.resolveComment(commentDetails);
        }
    }

    private projectReviewCommentAction(editorDetails: COIReviewCommentEditor, editorAction: COIReviewCommentsActions): void {
        let projectCommentApiBasedOnAction: Observable<any>;
        switch (editorAction) {
            case 'ADD_COMMENT':
                projectCommentApiBasedOnAction = this._reviewCommentService.addProjectOverviewComment(this.getSaveProjectCommentRO(editorDetails));
                break;
            case 'EDIT_COMMENT':
                projectCommentApiBasedOnAction = this._reviewCommentService.updateProjectOverviewComment(this.getSaveProjectCommentRO(editorDetails));
                break;
        }
        this.handleCommentApiSubscription (projectCommentApiBasedOnAction, editorDetails);
    }

    private COIReviewCommentSave(editorDetails: COIReviewCommentEditor): void {
        const COI_REVIEW_COMMENT_API =  this._reviewCommentService.saveCOIReviewComment(this.getSaveReviewCommentRO(editorDetails));
        this.handleCommentApiSubscription (COI_REVIEW_COMMENT_API, editorDetails);
    }

    private handleCommentApiSubscription (commentApiRequest: Observable<any>, editorDetails: COIReviewCommentEditor): void {
        this.$subscriptions.push(
            commentApiRequest.subscribe(
                (res: any) => {
                    this._reviewCommentService.notifyGlobalEvent('CLOSE_ALL_EDITOR');
                    this.$fetchReviewComments.next('UPDATE_LOAD');
                    this.isSaving = false;
                },
                (error: any) => {
                    this.isSaving = false;
                    if (error.status === 405) {
                        this._commonService.concurrentUpdateAction = 'review comment';
                    } else {
                        const ACTION_TYPE = editorDetails?.commentDetails?.commentId ? 'updating' : 'adding';
                        this._commonService.showToast(HTTP_ERROR_STATUS, `Error in ${ACTION_TYPE} comment, please try again.`);
                    }
                }
            )
        );
    }

    private handleDeleteComment(deleteCommentApi: Observable<any>): void {
        this.$subscriptions.push(
            deleteCommentApi.subscribe((res: any) => {
                this.closeDeleteConfirmationModal();
                this._reviewCommentService.notifyGlobalEvent('CLOSE_ALL_EDITOR');
                this.$fetchReviewComments.next('UPDATE_LOAD');
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
            const { commentId, commentTypeCode, moduleCode } = this.deleteCommentDetails || {};
            const DELETE_COMMENT_API = commentTypeCode?.toString() === FCOI_ADMINISTRATOR_COMMENTS.commentTypeCode?.toString()
                ? this._reviewCommentService.deleteProjectOverviewComments(commentId)
                : this._reviewCommentService.deleteReviewComments(commentId, moduleCode);
            this.handleDeleteComment(DELETE_COMMENT_API);
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
