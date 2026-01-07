import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { CommentConfiguration, CompleterOptions, CommentFetch, CoiReviewComment, KeyPersonComment } from './review-comments-interface';
import { ReviewCommentsService } from './review-comments.service';
import { COMMON_ERROR_TOAST_MSG, DISCLOSURE_CONFLICT_STATUS_BADGE, EDITOR_CONFIGURATION, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, PROJECT_CONFLICT_STATUS_BADGE } from '../../app-constants';
import { topSlideInOut } from '../../common/utilities/animations';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { closeCoiSlider, hideModal, openCoiSlider } from '../../common/utilities/custom-utilities';
import { COI } from '../../disclosure/coi-interface';
import { ReviewCommentsSliderConfig, SharedProjectDetails } from '../../common/services/coi-common.interface';


@Component({
    selector: 'app-review-comments-slider',
    templateUrl: './review-comments-slider.component.html',
    styleUrls: ['./review-comments-slider.component.scss'],
    providers: [ReviewCommentsService],
    animations: [topSlideInOut]
})
export class ReviewCommentsSliderComponent implements OnInit, OnDestroy {

    headerName = ''
    @Output() closePage: EventEmitter<any> = new EventEmitter<any>();
    @Output() keyPersonCommentCount: EventEmitter<any> = new EventEmitter<any>();
    @Input() disclosureDetails: any;
    @Input() disclosureType: any = "";
    @Input() projectDetails: any = null;
    @Input() selectedProject: any;
    @Input() reviewList: any = null;
    @Input() isViewMode = false;
    @Input() reviewSliderConfig = new ReviewCommentsSliderConfig();
    @Input() dataForCommentSlider: any;

    isSaving = false;
    $subscriptions: Subscription[] = [];
    isReadMore = false;
    reviewCommentDetails: CoiReviewComment = new CoiReviewComment();
    reviewTypeList: any;
    selectedProjectDetails:any = {};
    adminGroupsCompleterOptions: CompleterOptions = new CompleterOptions();
    clearAdminGroupField: any;
    assignAdminMap = new Map();
    adminSearchOptions: any = {};
    clearAdministratorField: String;
    isAddAssignee = false;
    selectedReviewType: any = {};
    commentList: any = [];
    uploadedFile: any = [];
    mandatoryMap = new Map();
    isEditComment = false;
    isReplyComment = false;
    isReplayCommentReadMore = false;
    isChangesInField = false;
    isAddAttachment = false;
    isCloseSlider = false;
    noFileChosen = false;
    multipleFile = false;
    public Editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIGURATION;
    selectedAttachmentDescription = [];
    selectedAttachmentType: any[] = [];
    selectedAttachmentStatus: any[] = [];
    selectedKeyPersonnel: any[] = [];
    statusSelected: boolean;
    coiFinancialEntityDetails: any[] = [];
    commentConfiguration: CommentConfiguration = new CommentConfiguration();
    projectList: any = [];
    activeProject = 1;
    projectRelations: any = [];
    sectionSearchOptions: CompleterOptions = new CompleterOptions();
    clearSectionField: String;
    subSectionSearchOptions: CompleterOptions = new CompleterOptions();
    clearSubSectionField: String;
    childSubSectionSelectOptions: CompleterOptions = new CompleterOptions();
    childSubSectionFiled: String;
    selectedReviewType1: any = {};
    searchPlaceHolder = '';
    coiSubSectionsTitle = '';
    personnelAttachTypes: any = [];
    attachmentWarningMsg = null;
    deployMap = environment.deployUrl;
    sfiStatus: any;
    reviewCommentType: any = [
        { code: 1, description: 'Public', isShowForAdmin: true, isShowForReviewer: true, isShowForReporter: true },
        { code: 2, description: 'Reviewer only', isShowForAdmin: true, isShowForReviewer: false, isShowForReporter: false },
        { code: 3, description: 'Admin only', isShowForAdmin: false, isShowForReviewer: true, isShowForReporter: true },
        { code: 4, description: 'Reporter only', isShowForAdmin: true, isShowForReviewer: false, isShowForReporter: false }
    ];
    selectedCommentType: any = null;
    componentSubRefTitle = '';
    coiSectionType = null;
    isUserAdmin = false;
    isUserReviewer = false;
    isUserReporter = false;
    subSectionTitle: string;
    subSectionId: any;
    showAddComment = false;
    showSlider = false;
    sliderElementId: any;
    imgUrl = this.deployMap + 'assets/images/close-black.svg';
    searchText = '';
    isSectionNavigationCollapsed = false;
    groupedCommentsList: any;
    privateComment = false;
    caComment = false
    coiData = new COI();
    hasMaintainCoiComments = false;
    hasMaintainPrivateComments = false;
    isCOIAdministrator = false;
    isDisclosureOwner = false;
    projectDetailsForHeader = new SharedProjectDetails();
    isProjectDashboard = false;
    generalCommentFromProjectTab = false
    keyPersonComment = new KeyPersonComment();
    requestBodyData: CommentFetch;
    disclosureConflictBadge = DISCLOSURE_CONFLICT_STATUS_BADGE;
    projectDisclosureConflictBadge = PROJECT_CONFLICT_STATUS_BADGE;

    @ViewChild('reviewCommentsOverlay', { static: true }) reviewCommentsOverlay: ElementRef;

    constructor(
        public commonService: CommonService, public reviewCommentsService: ReviewCommentsService,
        private _router: Router
    ) { }

    ngOnInit() {
        this.getReviewerActionDetails();
        this.projectDetailsForHeader = this.commonService.setProjectCardDetails(this.dataForCommentSlider?.projectDetails);
        // this.loadSectionsTypeCode();
        this.hasMaintainCoiComments = this.commonService.getAvailableRight(['MAINTAIN_COI_COMMENTS']);
        this.hasMaintainPrivateComments = this.commonService.getAvailableRight(['MAINTAIN_COI_PRIVATE_COMMENTS']);
        this.isCOIAdministrator = this.commonService.getAvailableRight(['MANAGE_PROJECT_DISCLOSURE']);
        this.isProjectDashboard = this._router.url.includes('project-dashboard');
    }

    private viewSlider(): void {
        if (!this.showSlider) {
            this.showSlider = true;
            this.sliderElementId = `review-comments-slider-${this.reviewCommentDetails.componentTypeCode}`;
            setTimeout(() => {
                openCoiSlider(this.sliderElementId);
            });
        }
    }

    validateSliderClose(): void {
        this.setCommentCount();
        closeCoiSlider(this.sliderElementId);
        setTimeout(() => {
            this.clearReviewSlider();
		}, 500);
	}
  
    private clearReviewSlider(): void {
        this.showSlider = false;
        this.sliderElementId = '';
        this.closePage.emit();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    openConformationModal(): void {
        document.getElementById('review-comments-confirmation-modal-trigger-btn').click();
    }

    private closeReviewSlider() : void {
        const SLIDER = document.querySelector('.slider-base');
        SLIDER.classList.remove('slider-opened');
        setTimeout(() => {
            this.cancelOrClearCommentsDetails();
            this.closePage.emit(false);
        }, 500);
    }

    leavePageClicked(event: boolean = false) {
        if (!event) {
            setTimeout(() => {
                this.closeReviewSlider();
            }, 100);
        }
    }

    fileDrop(event): void {
        if (event) {
            this.uploadedFile.push(event[0]);
            this.selectedAttachmentType.push(null);
            this.isChangesInField = true;
        }

    }

    public adminSelect(event: any) {
        if (event) {
            if (!this.validateAdmin(event, 'ADMINISTRATOR')) {
                const adminPersonDetails = {
                    tagPersonId: event.personId,
                    tagPersonFullName: event.fullName,
                    tagGroupId: null,
                    tagGroupName: '',
                }
                this.assignAdminMap.clear();
                this.clearAdministratorField = new String('true');
                this.isChangesInField = true;
            }

        }
    }

    public adminGroupSelect(event) {
        if (event) {
            if (!this.validateAdmin(event, 'ADMIN_GROUP')) {
                const adminGroupDetails = {
                    tagPersonId: '',
                    tagPersonFullName: '',
                    tagGroupId: event.adminGroupId,
                    tagGroupName: event.adminGroupName,
                }
                this.assignAdminMap.clear();
                this.clearAdminGroupField = new String('true');
                this.isChangesInField = true;
            }
        }
    }


    deleteCoiCommentAssignee(tagDetails, index) {
        if (this.isEditComment && tagDetails.coiReviewCommentTagsId) {
            this.$subscriptions.push(this.reviewCommentsService.deleteCOIAssignee(tagDetails.coiReviewCommentTagsId).subscribe(res => {
                this.reviewCommentDetails.commentTags.splice(index, 1);
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Assignee removed successfully.')
            }, (error: any) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG)
            }));
        } else {
            this.reviewCommentDetails.commentTags.splice(index, 1);
        }
    }

    addCommentsDetails(): void {
        if (!this.validateComment()) {
            !this.isEditComment && (this.reviewCommentDetails.isPrivate = this.privateComment);
            this.caComment && (this.reviewCommentDetails.componentTypeCode = '12'); 
            this.addOrUpdateComment(this.reviewCommentDetails, this.uploadedFile);
        }
    }

    private addOrUpdateComment(details, file, showAddComment = false): void {
        details.moduleCode = this.disclosureType == 'OPA' ? 23 : 8;
        if(this.reviewCommentDetails.componentTypeCode != '10') {
            this.$subscriptions.push(this.reviewCommentsService.addCOIReviewComment(details).subscribe((res: any) => {
                this.reviewCommentsService.isEditOrReplyClicked = false;
                this.cancelOrClearCommentsDetails();
                if (details.parentCommentId) {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Reply comment added successfully');
                } else {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Comments added successfully');
                }
                this.showAddComment = showAddComment;
            }, (error: any) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        }
        if(this.reviewCommentDetails.componentTypeCode == '10') {
            this.$subscriptions.push(this.reviewCommentsService.addOPAReviewComment(details).subscribe((res: any) => {
                this.cancelOrClearCommentsDetails();
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Comments added successfully');
            }, (error: any) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        }
    }

    private validateAdmin(event, type): boolean {
        this.assignAdminMap.clear();
        if (type === 'ADMINISTRATOR' && this.checkAlreadyAdd(event, type)) {
            this.assignAdminMap.set('adminName', 'Administrator already been added');
        }
        if (type === 'ADMIN_GROUP' && this.checkAlreadyAdd(event, type)) {
            this.assignAdminMap.set('adminGroup', 'Admin Group already been added');
        }
        return this.assignAdminMap.size === 0 ? false : true;
    }

    checkAlreadyAdd(event, type) {
        return this.reviewCommentDetails.commentTags.some((element) =>
            type === 'ADMINISTRATOR' ? element.tagPersonId === event.personId : element.tagGroupId === event.adminGroupId);
    }

    private getCoiReviewComments(REQ_BODY): void {
        //To fetch the Coi review comments
        if(REQ_BODY.componentTypeCode != '10') {
            this.$subscriptions.push(this.reviewCommentsService.getCoiReviewComments(REQ_BODY).subscribe((res: any) => {
                this.commentList = res;
                this.viewSlider();
                if (this.reviewCommentsService.editParentCommentId) {
                    this.reviewCommentsService.editParentCommentId = null;
                }
            }, (error: any)=>{
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.clearReviewSlider();
            }));
        }
        //To fetch the Opa Review comments
        if(REQ_BODY.componentTypeCode == '10') {
            this.$subscriptions.push(this.reviewCommentsService.getOPAReviewComments(REQ_BODY).subscribe((res: any) => {
                this.commentList = res;
                this.viewSlider();
                if (this.reviewCommentsService.editParentCommentId) {
                    this.reviewCommentsService.editParentCommentId = null;
                }
            }, (error: any)=>{
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.clearReviewSlider();
            }));
        }
    }

    private getReviewerActionDetails(): void {
        this.$subscriptions.push(this.commonService.$commentConfigurationDetails.subscribe((res: any) => {
            if(res) {
                this.reviewCommentDetails.documentOwnerPersonId = res.documentOwnerPersonId;
                this.reviewCommentDetails.moduleItemKey = this.disclosureType === 'COI' ? this.disclosureDetails.disclosureId : this.disclosureDetails.opaDisclosureId;
                this.reviewCommentDetails.componentTypeCode = res.componentTypeCode;
                if (['4', '5', '6', '8', '11'].includes(this.reviewCommentDetails.componentTypeCode)) {
                    this.headerName = res.headerName;
                    this.reviewCommentDetails.subModuleItemKey = res.subModuleItemKey;
                    this.reviewCommentDetails.subModuleItemNumber = res.subModuleItemNumber || null;
                    this.coiSubSectionsTitle = res.coiSubSectionsTitle;
                    this.selectedProjectDetails = res.selectedProject;
                    this.setLocalVariableValue(res)
                }
                if (this.reviewCommentDetails.componentTypeCode == 10) {
                    this.reviewCommentDetails.formBuilderComponentId = res.formBuilderComponentId;
                    this.reviewCommentDetails.formBuilderId = res.formBuilderId;
                    this.reviewCommentDetails.formBuilderSectionId = res.formBuilderSectionId;
                    this.coiSubSectionsTitle = res.headerName;
                }
                this.getCoiReviewComments(this.loadReviewerCommentBody(res));
            }
        }));
    }

    private setLocalVariableValue(type): void {
        if(type.sfiStatus) {
            this.sfiStatus = type.sfiStatus;
        }
        if (type.subSectionTitle) {
            this.subSectionTitle = type.subSectionTitle;
        }
        if(type.subSectionId) {
            this.subSectionId = type.subSectionId;
        }
    }

    deleteCoiCommentAttachments(item) {
        if (this.isEditComment) {
            this.$subscriptions.push(this.reviewCommentsService.deleteCOICommentAttachment({ attachmentId: item.attachmentId, fileDataId: item.fileDataId }).subscribe(res => {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully');
            }, (error: any) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        } else {
        }
    }

    validateComment(): boolean {
        this.mandatoryMap.clear();
        if (!this.reviewCommentDetails.comment) {
            this.mandatoryMap.set('comment', 'Please add comment');
        }
        return this.mandatoryMap.size > 0;
    }

    cancelOrClearCommentsDetails(): void {
        this.mandatoryMap.clear();
        this.privateComment = false;
        this.caComment = false;
        this.reviewCommentDetails = new CoiReviewComment();
        this.uploadedFile = [];
        if (this.isEditComment) {
            this.isEditComment = false;
        }
        if (this.reviewCommentsService.isEditParentComment) {
            this.reviewCommentsService.isEditParentComment = false;
        }
        this.isChangesInField = false;
        if (!this.isCloseSlider) {
            this.getReviewerActionDetails();
        }
        if (this.reviewCommentsService.editParentCommentId) {
            this.reviewCommentsService.editParentCommentId = null;
        }
    }

    deleteReviewComment(event) : void {
        // this.commentList.splice(event, 1);
        if (!this.isCloseSlider) {
            this.getReviewerActionDetails();
        }
    }

    editReviewerParentComment(event) : void {
        this.isEditComment = true;
        this.reviewCommentDetails.documentOwnerPersonId = event.documentOwnerPersonId;
        this.reviewCommentDetails.commentId = event.commentId;
        this.reviewCommentDetails.isPrivate = event.isPrivate;
        this.reviewCommentDetails.comment = event.comment;
        this.reviewCommentDetails.subModuleItemKey = event.subModuleItemKey;
        this.reviewCommentDetails.componentTypeCode = event.componentTypeCode;
        this.reviewCommentDetails.moduleItemKey = this.reviewCommentDetails.moduleItemKey;
        this.updateAttachmentDetails(event.disclAttachments);
        this.updateAssigneeDetails(event.coiReviewCommentTag);
        this.addCommentsDetails();
    }

    private updateAssigneeDetails(assigneeDetails: any) : void {
        if(assigneeDetails && assigneeDetails.length) {
            assigneeDetails.forEach(ele => {
                const reviewerList: any = {};
                reviewerList.tagPersonId = ele.tagPersonId;
                reviewerList.tagPersonFullName = ele.tagPersonFullName;
                reviewerList.tagGroupId = ele.tagGroupId;
                reviewerList.tagGroupName = ele.tagGroupName;
                reviewerList.coiReviewCommentTagsId = ele.coiReviewCommentTagsId;
                this.reviewCommentDetails.commentTags.push(reviewerList);
            });
        }
    }

    private updateAttachmentDetails(attachmentsDetails: any) : void {
        if(attachmentsDetails && attachmentsDetails.length) {
            attachmentsDetails.forEach(ele => {
                const fileList: any = {};
                fileList.fileName = ele.fileName;
                fileList.commentId = ele.commentId;
                fileList.attachmentId = ele.attachmentId;
                fileList.mimeType = ele.mimeType;
                fileList.fileDataId = ele.fileDataId;
            });
        }
    }

    addReplayComment(event) : void {
        this.isEditComment = event.isEditComment;
        this.isReplyComment = event.isReplyComment;
        this.addOrUpdateComment(event.details, this.uploadedFile, this.showAddComment);
    }

    removeChidReviewComment(event) : void {
        this.getReviewerActionDetails();
    }

    private loadReviewerCommentBody(details): CommentFetch {
        const REQ_BODY = new CommentFetch();
        REQ_BODY.componentTypeCode = ['3', '9'].includes(details.componentTypeCode) ? null : details.componentTypeCode;
        REQ_BODY.moduleItemKey = this.disclosureType === 'COI' ? this.disclosureDetails.disclosureId : this.disclosureDetails.opaDisclosureId;
        REQ_BODY.moduleItemNumber = this.disclosureDetails.disclosureNumber;
        REQ_BODY.parentCommentId = this.disclosureDetails.parentCommentId || null;
        REQ_BODY.subModuleCode = details.subModuleCode || null;
        REQ_BODY.subModuleItemKey = details.subModuleItemKey || null;
        REQ_BODY.subModuleItemNumber = details.subModuleItemNumber || null;
        REQ_BODY.formBuilderComponentId = details.formBuilderComponentId || null;
        REQ_BODY.formBuilderId = details.formBuilderId || null;
        REQ_BODY.formBuilderSectionId = details.formBuilderSectionId || null;
        REQ_BODY.moduleCode = this.disclosureType === 'COI' ? 8 : 23;
        REQ_BODY.isSectionDetailsNeeded = ['3', '9'].includes(details.componentTypeCode);
        REQ_BODY.documentOwnerPersonId = details.documentOwnerPersonId;
        this.requestBodyData = REQ_BODY;
        return REQ_BODY;
    }

    addToAttachment() : void {
        if (this.checkMandatoryFilled()) {
        this.uploadedFile.forEach(element => {
            const attachment = {
                fileName: element.name,
                commentId: null,
                attachmentId: null,
                mimeType: element.type,
            }
        });
        }
        this.dismissAttachmentModal();

    }

    dismissAttachmentModal(): void {
        this.mandatoryMap.clear();
        hideModal('add-attachment-modal');
        this.selectedAttachmentDescription = null;
    }


    attachmentModal(): void {
        if (!this.personnelAttachTypes?.length) {
            this.disclosureAttachmentTypes();
        }
        this.uploadedFile = [];
        this.noFileChosen = false;
        this.multipleFile = false;
        this.selectedAttachmentType = [];
        this.selectedAttachmentDescription = [];
        this.selectedAttachmentStatus = [];
    }

    public onReady(editor): void {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    deleteFromUploadedFileList(index): void {
        this.selectedAttachmentType.splice(index, 1);
        this.selectedAttachmentDescription.splice(index, 1);
        this.selectedAttachmentStatus.splice(index, 1);
        this.uploadedFile.splice(index, 1);
    }

    private setCompleterOptions(array, field) {
        return {
            arrayList: array,
            contextField: field,
            filterFields: field,
            formatString: field,
            defaultValue: ''
        };
    }

    setSubSectionOptions(typeCode): void {
        if (typeCode === '4') {
            this.searchPlaceHolder = 'Search for Questionnaire';
            this.subSectionSearchOptions = this.setCompleterOptions(this.reviewTypeList.questionnaireDataBus.applicableQuestionnaire, 'QUESTIONNAIRE_LABEL')
        }
        if (typeCode === '5') {
            this.searchPlaceHolder = 'Search for Engagements';
            this.subSectionSearchOptions = this.setOptionsForEntity(this.reviewTypeList.personEntities);
        }
        if (typeCode === '6') {
            this.searchPlaceHolder = 'Search for Project Relationship';
            this.subSectionSearchOptions = this.setCompleterOptions(this.reviewTypeList.projectList, 'title');
        }
    }

    setOptionsForEntity(array) {
        const ENTITY = array.map(e => {return {personEntityId : e.personEntityId, entityName: e.coiEntity.entityName}});
        return this.setCompleterOptions(ENTITY, 'entityName');
    }

    getSubSectionId(event) {
        if (this.reviewCommentDetails?.componentTypeCode === '4') {
            return event?.QUESTIONNAIRE_ID;
        }
        if (this.reviewCommentDetails?.componentTypeCode === '5') {
            return event.personEntityId;
        }
        if (this.reviewCommentDetails?.componentTypeCode === '6') {
            return event.moduleItemId;
        }
    }

    disclosureAttachmentTypes() {
            this.$subscriptions.push(this.reviewCommentsService.loadDisclAttachTypes().subscribe((data: any) => {
                    this.personnelAttachTypes = data;
                }, (error: any) => this.commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Attachment Types failed. Please try again.')));
    }

    checkMandatoryFilled() {
        this.attachmentWarningMsg = '';
        if (!this.uploadedFile?.length) {
            this.attachmentWarningMsg = '* No attachments added';
        } else {
            for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
                if (this.selectedAttachmentType[uploadIndex] === 'null' || this.selectedAttachmentType[uploadIndex] == null) {
                    this.attachmentWarningMsg = '* Please fill all the mandatory fields';
                    break;
                }
            }
        }
        return !this.attachmentWarningMsg;
    }

    isReviewComment(code) {
        return this.reviewCommentDetails.componentTypeCode == code
        && ((this.reviewCommentDetails.subModuleItemKey || (this.reviewCommentDetails.formBuilderSectionId && !this.reviewCommentDetails.formBuilderComponentId)));
    }

    openSFI(personEntityId): void {
        this.validateSliderClose();
        setTimeout(() => {
            this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: personEntityId, mode: 'view' } });
		}, 500);       
    }

    showTaskNavBar(): void {
        const SLIDER = document.querySelector('.slider-base');
        SLIDER.classList.add('slider-opened');
    }

    addBodyScroll(): void {
        document.getElementById('COI_SCROLL').classList.remove('overflow-hidden');
        document.getElementById('COI_SCROLL').classList.add('overflow-y-scroll');
    }

    toggleAddCommentBox(): void {
        this.showAddComment = !this.showAddComment;
    }

    redirectToProjectDetails(): void {
        const { documentNumber, projectId, projectTypeCode } = this.selectedProjectDetails || {};
        this.commonService.redirectToProjectDetails(projectTypeCode, (documentNumber || projectId));
    }

    resetDashboardAfterSearch(): void {
        this.searchText = '';
    }

    sectionNavigationCollapsed(): void {
        this.isSectionNavigationCollapsed = !this.isSectionNavigationCollapsed;
    }

    getSectionName(valueArray: any): string {
        if (typeof valueArray === 'object' && !Array.isArray(valueArray)) {
          for (const key in valueArray) {
            if (valueArray.hasOwnProperty(key)) {
              const valueArrayRes = valueArray[key].find(
                ele => ele.moduleSectionDetails && (ele.moduleSectionDetails.sectionName || ele.moduleSectionDetails.otherDetails)
              );
      
              return valueArrayRes?.componentType?.description || valueArrayRes?.moduleSectionDetails?.otherDetails?.location || 'General Comments';
            }
          }
        }
        return 'General Comments';
    }
      

    groupedCommentsListChange(event) : void {
        this.groupedCommentsList = event;
    }

    scrollToSection(sectionName: string, index: number): void {
        const UNIQUE_ID = `${sectionName}-${index}`;
        this.commonService.$globalEventNotifier.next({ uniqueId: 'DISCLOSURE_COMMENTS_SECTION_NAVIGATION', content: { uniqueId: UNIQUE_ID }});
        setTimeout(() => {
            const SECTION_ELEMENT = document.getElementById(this.sliderElementId + '-slider-body');
            const SCROLL_ELEMENT = document.getElementById('review-comment-slider-header');
            const TARGET_ELEMENT = document.getElementById(UNIQUE_ID);
            const OFFSET_TOP = SCROLL_ELEMENT?.getBoundingClientRect()?.height || 0;
            const TARGET_ELEMENT_TOP = TARGET_ELEMENT?.offsetTop || 0;
            if (SECTION_ELEMENT) {
                SECTION_ELEMENT.scrollTo({
                    top: TARGET_ELEMENT_TOP - OFFSET_TOP - 110,
                    behavior: 'smooth',
                });
            }
        });
    }

    setToPrivateComment(): void {
        this.privateComment = !this.privateComment
    }

    setToCaComment(): void {
        this.caComment = !this.caComment;
    }

    isProjectTabCommentSection(code) {
        if (this.isProjectDashboard && (this.reviewCommentDetails.componentTypeCode == '12' || this.reviewCommentDetails.componentTypeCode == '3')) {
            this.generalCommentFromProjectTab = true
        }
        return this.reviewCommentDetails.componentTypeCode == code;
    }

    getDynamicTop(): string{
        if (window.innerWidth > 1530) {
            return '124px';
            } else if (window.innerWidth >= 992) {
            return '173px';
            } else {
            return '224px';
        }
    }
      
    private setCommentCount(): void {
        if(this.commentList.length) {
            this.keyPersonComment.commentCount = this.commentList.length;
            this.keyPersonComment.personID = this.reviewCommentDetails.documentOwnerPersonId;
            this.keyPersonCommentCount.emit(this.keyPersonComment);
        }
    }
}
