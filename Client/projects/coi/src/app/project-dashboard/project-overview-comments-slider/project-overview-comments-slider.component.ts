import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { closeCoiSlider, closeCommonModal, getFormattedSponsor, openCoiSlider, openCommonModal } from '../../common/utilities/custom-utilities';
import { EDITOR_CONFIURATION, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from 'projects/fibi/src/app/app-constants';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from 'projects/fibi/src/app/common/utilities/subscription-handler';
import { SharedProjectDetails } from '../../common/services/coi-common.interface';
import { COMMON_ERROR_TOAST_MSG } from '../../app-constants';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { ProjectDashboardService } from '../project-dashboard.service';
import { CoiProjectOverviewComment, COMMENTS_DELETE_MODAL_ID, ProjectDashboardComment, ProjectOverviewCommentFetch } from '../project-dashboard.interface';

@Component({
    selector: 'app-project-overview-comments-slider',
    templateUrl: './project-overview-comments-slider.component.html',
    styleUrls: ['./project-overview-comments-slider.component.scss']
})
export class ProjectOverviewCommentsSliderComponent implements OnInit {

    @Input() dataForCommentSlider: any;
    @Output() closePage: EventEmitter<any> = new EventEmitter<any>();
    @Output() commentCountUpdated = new EventEmitter<number>();
    public Editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIURATION;
    isReplyCommentOpen = false;
    projectOverviewCommentDetails: CoiProjectOverviewComment = new CoiProjectOverviewComment();
    $subscriptions: Subscription[] = [];
    showAddComment = false;
    isEditComment = false;
    isShowResolveComment = false;
    loggedInPersonId: string;
    visibleCommentsMap: { [key: number]: any[] } = {};
    initialVisibleComments = 2;
    public currentEditIndex: number | null = null;
    commentFetchRequestPayload: ProjectOverviewCommentFetch = new ProjectOverviewCommentFetch();
    commentsData: any[] = [];
    mandatoryMap = new Map();
    currentUserId: any;
    isEditorFocused = false;
    getFormattedSponsor = getFormattedSponsor;
    projectDetails = new SharedProjectDetails();
    modalConfig = new CommonModalConfig(COMMENTS_DELETE_MODAL_ID, 'Delete', 'Cancel');
	deleteCommentdetails = new CoiProjectOverviewComment();
    isEditParentComment = false;
    editParentCommentId = null;
    projectOverviewSlider = 'coi-project-overview-slider';
    isOpenSlider = false;
    currentTab = '';
    currentProjectDetails: any;

    constructor(public projectDashboardService: ProjectDashboardService, public commonService: CommonService) { }

    ngOnInit() {
        this.modalConfig.dataBsOptions.focus = false;
        this.currentTab = this.projectDashboardService.projectOverviewRequestObject?.tabName;
        this.currentProjectDetails = this.dataForCommentSlider?.projectDetails;
        this.loadProjectOverviewCommentRO();
        this.projectDetails = this.commonService.setProjectCardDetails(this.dataForCommentSlider?.projectDetails);
        this.loggedInPersonId = this.commonService.getCurrentUserDetail('personID');
        this.isShowResolveComment = this.commonService.getAvailableRight(['MAINTAIN_COI_RESOLVE_COMMENTS']);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private viewSlider(): void {
        if(!this.isOpenSlider){
            this.isOpenSlider = true;
            setTimeout(() => {
                openCoiSlider(this.projectOverviewSlider);
            });
        }
    }


    validateSliderClose(): void {
        closeCoiSlider(this.projectOverviewSlider);
        setTimeout(() => {
            this.isOpenSlider = false;
            this.closePage.emit();
        }, 500);
    }

    private loadProjectOverviewCommentRO(): void {
        this.commentFetchRequestPayload = new ProjectOverviewCommentFetch();
        this.commentFetchRequestPayload.commentTypeCode = '1';
        this.commentFetchRequestPayload.moduleCode = this.currentTab === 'AWARD' ? '1' : '3';
        this.commentFetchRequestPayload.moduleItemKey = this.currentTab === 'AWARD'? this.currentProjectDetails?.projectNumber : this.currentProjectDetails?.projectId;
        this.getProjectOverviewComments(this.commentFetchRequestPayload);
    }

    private getProjectOverviewComments(commentFetchRequestPayload: any): void {
        this.$subscriptions.push(this.projectDashboardService.getProjectOverviewComments(commentFetchRequestPayload).subscribe((res: any) => {
            this.commentsData = res;
            this.currentUserId = this.commonService.getCurrentUserDetail('personID');
            this.initializeVisibleComments();
            this.viewSlider();
            this.dataForCommentSlider.projectDetails.commentCount = this.commentsData?.length;
            this.commentCountUpdated.emit(this.dataForCommentSlider.projectDetails.commentCount);
        },(error:any)=>{
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            this.closePage.emit();
        }));
    }

    resolveComment(details: ProjectDashboardComment): void {
        this.$subscriptions.push(this.projectDashboardService.projectCommentsResolve(details?.commentId).subscribe(() => {
            this.cancelOrClearCommentsDetails(true);
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment resolved successfully.');
        }, (error: any) => {
            if (error.status === 405) {
                this.commonService.concurrentUpdateAction = 'resolve comment';
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in resolving comment, please try again.');
            }
        }));
    }

    addComment(details): void {
        this.$subscriptions.push(this.projectDashboardService.addProjectOverviewComment(details).subscribe((res: any) => {
            this.cancelOrClearCommentsDetails(true);
            if (details) {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment added successfully');
            }
            this.showAddComment = false;
        }, (error:any) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private updateComment(details): void {
        this.$subscriptions.push(this.projectDashboardService.updateProjectOverviewComment(details).subscribe((res: any) => {
            this.cancelOrClearCommentsDetails(true);
            if (details) {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment updated successfully');
            }
        }, (error:any) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }))
    }

    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.deleteComment(this.deleteCommentdetails);
        }
         else {
            this.clearDeleteCommentDetails();
        }
        closeCommonModal(COMMENTS_DELETE_MODAL_ID);
    }

	private clearDeleteCommentDetails(): void {
        this.deleteCommentdetails = new CoiProjectOverviewComment();
    }

    triggerDeleteConfirmationModal(details: CoiProjectOverviewComment): void {
        this.isEditorFocused = false;
        this.deleteCommentdetails = details;
        setTimeout(() => {
            openCommonModal(COMMENTS_DELETE_MODAL_ID);
        }, 50);
    }

    private deleteComment(details): void {
        this.$subscriptions.push(this.projectDashboardService.deleteProjectOverviewComments(details.commentId).subscribe((res: any) => {
            this.cancelOrClearCommentsDetails(true);
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment deleted successfully');
        }, (error:any) => {
            if (error.status === 405) {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Unable to delete the comment');
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }
        }))
    }

    toggleAddCommentBox(): void {
        this.mandatoryMap.clear();
        this.showAddComment = !this.showAddComment;
    }

    public onReady(editor) {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    replyComment(commentDetails): void {
        this.mandatoryMap.clear();
            this.projectOverviewCommentDetails.comment = null;
            this.projectOverviewCommentDetails.parentCommentId = commentDetails.commentId;
            this.isReplyCommentOpen = true;
    }

    addReplayCommentsDetails(): void {
        if (!this.validateComment()) {
            this.addCommentsDetails()
        }
    }

    addCommentsDetails(): void {
        if (!this.validateComment()) {
            this.projectOverviewCommentDetails.commentTypeCode = '1';
            this.projectOverviewCommentDetails.moduleCode = this.currentTab === 'AWARD' ? '1' : '3';
            this.projectOverviewCommentDetails.moduleItemKey = this.currentTab === 'AWARD'? this.currentProjectDetails?.projectNumber : this.currentProjectDetails?.projectId;
            this.addComment(this.projectOverviewCommentDetails)
        }
    }

    editParentComment(details): void {
        this.mandatoryMap.clear();
        if (!this.isEditParentComment && !this.isEditComment && !this.isReplyCommentOpen) {
            this.isEditParentComment = true;
            this.editParentCommentId = details.commentId;
        }
    }

    addEditedComment(details): void {
        this.isEditComment = true;
        this.projectOverviewCommentDetails.commentId = details.commentId;
        this.projectOverviewCommentDetails.comment = details.comment;
        if (!this.validateComment()) {
            this.updateComment(this.projectOverviewCommentDetails)
        }
    }

    private validateComment(): boolean {
        this.mandatoryMap.clear();
        if (!this.projectOverviewCommentDetails.comment) {
            this.mandatoryMap.set('comment', 'Please add comment');
        }
        return this.mandatoryMap.size > 0;
    }

    cancelOrClearCommentsDetails(shouldFetchComments: boolean = false): void {
        this.projectOverviewCommentDetails = new CoiProjectOverviewComment();
        this.isEditComment = false;
        this.isReplyCommentOpen = false;
        this.isEditParentComment = false;
        if(shouldFetchComments){
            this.loadProjectOverviewCommentRO();
        }
        this.editParentCommentId = null;
        this.mandatoryMap.clear();
    }

    private initializeVisibleComments(): void {
        if (this.commentsData?.length) {
            this.commentsData.forEach((comment, index) => {
                if (comment.childComments) {
                    this.visibleCommentsMap[index] = comment.childComments.slice(0, this.initialVisibleComments);
                } else {
                    this.visibleCommentsMap[index] = [];
                }
            });
        }
    }

    viewMore(replyIndex: number): void {
        if (this.commentsData[replyIndex]?.childComments) {
            this.visibleCommentsMap[replyIndex] = this.commentsData[replyIndex].childComments;
        }
    }

    viewLess(replyIndex: number): void {
        if (this.commentsData[replyIndex]?.childComments) {
            this.visibleCommentsMap[replyIndex] = this.commentsData[replyIndex].childComments.slice(0, this.initialVisibleComments);
        }
    }

    editReplyComment(childComment, index): void {
        this.mandatoryMap.clear();
        if (!this.isEditComment && !this.isEditParentComment && !this.isReplyCommentOpen) {
            this.isEditComment = true;
            this.currentEditIndex = index;
            this.projectOverviewCommentDetails.commentId = childComment.commentId;
        }
    }

    addReplyEditedComments(childComment): void {
        this.projectOverviewCommentDetails.comment = childComment.comment;
        if (!this.validateComment()) {
            this.updateComment(this.projectOverviewCommentDetails)
        }
    }

    /**
     * This host listener is used to keep the background scroll fixed at the top at all times.
     */
    @HostListener('window:scroll')
    onScroll(): void {
        if (this.isEditorFocused) {
            window.scrollTo(0, 0);
        }
    }

    onEditorFocus() {
        this.isEditorFocused = true;
    }

    onEditorBlur() {
        this.isEditorFocused = false;
    }
}
