import { Component, OnDestroy, OnInit } from '@angular/core';
import { COMPANY_DETAILS, ENTITY_NOTES_RIGHTS, OverviewTabSection } from '../shared/entity-constants';
import { CommonService } from '../../common/services/common.service';
import { EntityDataStoreService } from '../entity-data-store.service';
import { CommonNoteInputs, DataStoreEvent, EntireEntityDetails, EntityAttachment, EntityRisk, EntitySectionDetails } from '../shared/entity-interface';
import { Subscription } from 'rxjs';
import { deepCloneObject, isEmptyObject } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { NOTES_SECTIONS_LIST } from '../../app-constants';
import { EntityManagementService } from '../entity-management.service';
import { Note } from '../../disclosure/coi-interface';

@Component({
    selector: 'app-entity-overview',
    templateUrl: './entity-overview.component.html',
    styleUrls: ['./entity-overview.component.scss']
})
export class EntityOverviewComponent implements OnInit, OnDestroy {

    overviewTab: any;
    coiEntity: any;
    entityRisksList: EntityRisk[] = [];
    $subscriptions: Subscription[] = [];
    entityAttachmentList: EntityAttachment[] = [];
    basicDetails = new EntitySectionDetails();
    companyDetails = new EntitySectionDetails();
    otherReferences = new EntitySectionDetails();
    riskSectionDetails = new EntitySectionDetails();
    attachmentSectionDetails = new EntitySectionDetails();
    additionalDetailsSectionDetails = new EntitySectionDetails();
    canShowAdditionalInformation = true;
    noteSectionDetails = new EntitySectionDetails();
    notesSectionInput = new CommonNoteInputs();
    entityId: number | string | null;
    notesList: Note[] = [];
    canShowNotesSection = false;
    isShowCommentButton = false;
    commentCount = 0;

    constructor(public commonService: CommonService,
                public _dataStoreService: EntityDataStoreService,
                public entityManagementService: EntityManagementService) {}

    ngOnInit() {
        window.scrollTo(0, 0);
        this.overviewTab = OverviewTabSection;
        this.setSectionIdAndName();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.entityManagementService.scrollToSavedSection();
        this.listenAdditionInfoVisibilityChange();
        this.fetchNotesList();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(COMPANY_DETAILS);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private setSectionIdAndName() {
        this.riskSectionDetails.subSectionId = 2607;
        this.attachmentSectionDetails.subSectionId = 2623;
        this.basicDetails.sectionId = this.commonService.getSectionId(this.overviewTab, 'BASIC_DETAILS');
        this.basicDetails.sectionName = this.commonService.getSectionName(this.overviewTab, 'BASIC_DETAILS');
        this.companyDetails.sectionId = this.commonService.getSectionId(this.overviewTab, 'COMPANY_DETAILS');
        this.companyDetails.sectionName = this.commonService.getSectionName(this.overviewTab, 'COMPANY_DETAILS');
        this.riskSectionDetails.sectionId = this.commonService.getSectionId(this.overviewTab, 'ENTITY_RISK');
        this.riskSectionDetails.sectionName = this.commonService.getSectionName(this.overviewTab, 'ENTITY_RISK');
        this.otherReferences.sectionId = this.commonService.getSectionId(this.overviewTab, 'OTHER_REFERENCE_IDS');
        this.otherReferences.sectionName = this.commonService.getSectionName(this.overviewTab, 'OTHER_REFERENCE_IDS');
        this.attachmentSectionDetails.sectionId = this.commonService.getSectionId(this.overviewTab, 'ENTITY_ATTACHMENTS');
        this.attachmentSectionDetails.sectionName = this.commonService.getSectionName(this.overviewTab, 'ENTITY_ATTACHMENTS');
        this.additionalDetailsSectionDetails.sectionName = this.commonService.getSectionName(this.overviewTab, 'ADDITIONAL_INFORMATION');
        this.additionalDetailsSectionDetails.sectionId = this.commonService.getSectionId(this.overviewTab, 'ADDITIONAL_INFORMATION');
        this.additionalDetailsSectionDetails.subSectionId = this.commonService.getSubSectionId(this.overviewTab, 'ADDITIONAL_INFORMATION');
        this.noteSectionDetails.sectionId = this.commonService.getSectionId(this.overviewTab, 'ENTITY_NOTES');
        this.noteSectionDetails.sectionName = this.commonService.getSectionName(this.overviewTab, 'ENTITY_NOTES');
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private getDataFromStore() {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) {
            return;
        }
        this.entityRisksList = ENTITY_DATA?.entityRisks;
        this.entityAttachmentList = ENTITY_DATA?.attachments ? ENTITY_DATA.attachments : [];
        this.entityId = ENTITY_DATA?.entityDetails?.entityId;
        this.commentCount = ENTITY_DATA.commentCountList?.[COMPANY_DETAILS.sectionTypeCode] || 0;
        this.canShowNotesSection = this.commonService.getAvailableRight(ENTITY_NOTES_RIGHTS);
        this.setNotesSectionInput(ENTITY_DATA?.entityDetails?.entityId);
    }

    setNotesSectionInput(entityId: number | string): void {
        this.notesSectionInput.entityId = entityId;
        this.notesSectionInput.isEditMode = this._dataStoreService.getEditMode() && this.commonService.getAvailableRight(['MANAGE_ENTITY_OVERVIEW_NOTES'], 'SOME');
        this.notesSectionInput.sectionCode = NOTES_SECTIONS_LIST.OVERVIEW;
        this.notesSectionInput.sectionId = this.noteSectionDetails.sectionId;
        this.notesSectionInput.sectionName = this.noteSectionDetails.sectionName;
        this.notesList = [...this.notesList];
    }

    riskUpdated(risksList: EntityRisk[]): void {
        this.entityRisksList = deepCloneObject(risksList);
        this._dataStoreService.updateStore(['entityRisks'], { 'entityRisks': this.entityRisksList });
    }

    attachemntUpdated(attachmentList: EntityAttachment[]): void {
        const UPDATED_ATTACHMENT_LIST = deepCloneObject(attachmentList);
        this._dataStoreService.updateStore(['attachments'], { 'attachments': UPDATED_ATTACHMENT_LIST });
    }

    listenAdditionInfoVisibilityChange() {
        this.$subscriptions.push(this.entityManagementService.$canShowAdditionalInformation.subscribe((canShow) => {
            this.canShowAdditionalInformation = canShow;
        }));
    }

    private fetchNotesList(): void {
        if (this.canShowNotesSection) {
            this.$subscriptions.push(this.entityManagementService.fetchOverviewNotes(NOTES_SECTIONS_LIST.OVERVIEW, this.entityId).subscribe((data: any) => {
                this.notesList = [...data];
            }));
        }
    }

    openReviewComments(): void {
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: COMPANY_DETAILS.commentTypeCode,
            sectionTypeCode: COMPANY_DETAILS.sectionTypeCode
        });
    }

}
