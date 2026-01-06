import { Component } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { EntityDataStoreService } from '../entity-data-store.service';
import {
    SPONSOR_NOTES_RIGHTS,
    SponsorTabSection
} from '../shared/entity-constants';
import { Subscription } from 'rxjs';
import { EntitySponsorService } from './entity-sponsor.service';
import { CommonNoteInputs, DataStoreEvent, EntireEntityDetails, EntityAttachment, EntityDetails, EntityRisk, EntitySectionDetails, EntitySponsor } from '../shared/entity-interface';
import { isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { HTTP_ERROR_STATUS, NOTES_SECTIONS_LIST } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { EntityManagementService } from '../entity-management.service';
import { Note } from '../../disclosure/coi-interface';

@Component({
    selector: 'app-entity-sponsor',
    templateUrl: './entity-sponsor.component.html',
    styleUrls: ['./entity-sponsor.component.scss'],
    providers: [EntitySponsorService]
})
export class EntitySponsorComponent {

    sponsorTab: any;
    entityDetails = new EntityDetails();
    $subscriptions: Subscription[] = [];
    entitySponsorRiskList: EntityRisk[] = [];
    entitySponsorAttachmentList: EntityAttachment[] = [];
    isLoading = true;
    sponsorDetails = new EntitySectionDetails();
    riskSectionDetails = new EntitySectionDetails();
    attachmentSectionDetails = new EntitySectionDetails();
    questionnaireSectionDetails = new EntitySectionDetails();
    notesList: Note[] = [];
    notesSectionInput = new CommonNoteInputs();
    noteSectionDetails = new EntitySectionDetails();
    canShowNotesSection = false;

    constructor(public commonService: CommonService,
        public dataStore: EntityDataStoreService,
        private _dataStoreService: EntityDataStoreService,
        private _entitySponsorService: EntitySponsorService,
        private _entityManagementService: EntityManagementService
    ) { }

    ngOnInit() {
        window.scrollTo(0,0);
        this.sponsorTab = SponsorTabSection;
        this.setSectionIdAndName();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.fetchNotesList();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private setSectionIdAndName(): void {
        this.riskSectionDetails.subSectionId = 2610;
        this.attachmentSectionDetails.subSectionId = 2611;
        this.sponsorDetails.sectionId = this.commonService.getSectionId(this.sponsorTab, 'SPONSOR_DETAILS');
        this.sponsorDetails.sectionName = this.commonService.getSectionName(this.sponsorTab, 'SPONSOR_DETAILS');
        this.riskSectionDetails.sectionId = this.commonService.getSectionId(this.sponsorTab, 'SPONSOR_RISK');
        this.riskSectionDetails.sectionName = this.commonService.getSectionName(this.sponsorTab, 'SPONSOR_RISK');
        this.attachmentSectionDetails.sectionId = this.commonService.getSectionId(this.sponsorTab, 'SPONSOR_ATTACHMENTS');
        this.attachmentSectionDetails.sectionName = this.commonService.getSectionName(this.sponsorTab, 'SPONSOR_ATTACHMENTS');
        this.questionnaireSectionDetails.sectionId = this.commonService.getSectionId(this.sponsorTab, 'SPONSOR_QUESTIONNAIRE');
        this.questionnaireSectionDetails.sectionName = this.commonService.getSectionName(this.sponsorTab, 'SPONSOR_QUESTIONNAIRE');
        this.questionnaireSectionDetails.subSectionId = this.commonService.getSubSectionId(this.sponsorTab, 'SPONSOR_QUESTIONNAIRE');
        this.noteSectionDetails.sectionId = this.commonService.getSectionId(this.sponsorTab, 'SPONSOR_NOTES');
        this.noteSectionDetails.sectionName = this.commonService.getSectionName(this.sponsorTab, 'SPONSOR_NOTES');
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        if (this.entityDetails?.entityId != ENTITY_DATA?.entityDetails?.entityId) {
            this.fetchEntitySponsorDetails(ENTITY_DATA?.entityDetails?.entityId);
        }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.canShowNotesSection = this.commonService.getAvailableRight(SPONSOR_NOTES_RIGHTS);
        this.setNotesSectionInput();
    }

    private setNotesSectionInput(): void {
        this.notesSectionInput.entityId = this.entityDetails.entityId;
        this.notesSectionInput.isEditMode = this._dataStoreService.getEditMode() && this.commonService.getAvailableRight(['MANAGE_ENTITY_SPONSOR_NOTES']);
        this.notesSectionInput.sectionCode = NOTES_SECTIONS_LIST.SPONSOR;
        this.notesSectionInput.sectionId = this.noteSectionDetails.sectionId;
        this.notesSectionInput.sectionName = this.noteSectionDetails.sectionName;
        this.notesList = [...this.notesList];
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    fetchEntitySponsorDetails(entityId: string | number): void{
        this.$subscriptions.push(this._entitySponsorService.fetchEntitySponsorDetails(entityId).subscribe((data: EntitySponsor)=>{
            this._entitySponsorService.entitySponsorDetails = data;
            this.entitySponsorRiskList = data?.entityRisks ? data.entityRisks : [];
            this.entitySponsorAttachmentList = data?.attachments ? data.attachments : [];
            this.isLoading = false;
            this._entityManagementService.scrollToSavedSection();
        }, (_error: any) => {
            this.isLoading = false;
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }));
    }

    private fetchNotesList(): void {
        if(this.canShowNotesSection) {
            this.$subscriptions.push(this._entityManagementService.fetchOverviewNotes(NOTES_SECTIONS_LIST.SPONSOR, this.entityDetails.entityId).subscribe((data: any) => {
                this.notesList = [...data];
            }));
        }
    }

}
