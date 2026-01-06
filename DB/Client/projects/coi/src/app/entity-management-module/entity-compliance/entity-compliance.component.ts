import {Component, OnDestroy, OnInit} from '@angular/core';
import { EntityDataStoreService } from '../entity-data-store.service';
import { CommonService } from '../../common/services/common.service';
import { COMPLIANCE_NOTES_RIGHTS, ComplianceTab} from '../shared/entity-constants';
import { EntityComplianceService } from './entity-compliance.service';
import { CommonNoteInputs, DataStoreEvent, EntireEntityDetails, EntityAttachment, EntityCompliance, EntityDetails, EntityRisk, EntitySectionDetails, SubAwardOrganization } from '../shared/entity-interface';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, NOTES_SECTIONS_LIST } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { Note } from '../../disclosure/coi-interface';
import { EntityManagementService } from '../entity-management.service';

@Component({
    selector: 'app-entity-compliance',
    templateUrl: './entity-compliance.component.html',
    styleUrls: ['./entity-compliance.component.scss'],
    providers: [EntityComplianceService]
})
export class EntityComplianceComponent implements OnInit, OnDestroy {

    complianceTab: any;
    isLoading = true;
    entityDetails = new EntityDetails();
    $subscriptions: Subscription[] = [];
    complianceEntityRiskList: EntityRisk[] = [];
    entityComplianceAttachmentList: EntityAttachment[] = [];
    riskSectionDetails = new EntitySectionDetails();
    attachmentSectionDetails = new EntitySectionDetails();
    questionnaireSectionDetails = new EntitySectionDetails();
    complianceDetails = new EntitySectionDetails();
    notesList: Note[] = [];
    notesSectionInput = new CommonNoteInputs();
    noteSectionDetails = new EntitySectionDetails();
    canShowNotesSection = false;

    constructor(public commonService: CommonService, private _dataStoreService: EntityDataStoreService, private _entityComplianceService: EntityComplianceService, private _entityManagementService: EntityManagementService) { }

    ngOnInit() {
        window.scrollTo(0, 0);
        this.complianceTab = ComplianceTab;
        this.setSectionIdAndName();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.fetchNotesList();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private setSectionIdAndName() {
        this.riskSectionDetails.sectionId = this.commonService.getSectionId(this.complianceTab, 'COMPLIANCE_RISK');
        this.riskSectionDetails.sectionName = this.commonService.getSectionName(this.complianceTab, 'COMPLIANCE_RISK');
        this.riskSectionDetails.subSectionId = 2615;
        this.attachmentSectionDetails.sectionId = this.commonService.getSectionId(this.complianceTab, 'COMPLIANCE_ATTACHMENTS');
        this.attachmentSectionDetails.sectionName = this.commonService.getSectionName(this.complianceTab, 'COMPLIANCE_ATTACHMENTS');
        this.attachmentSectionDetails.subSectionId = 2616;
        this.questionnaireSectionDetails.sectionId = this.commonService.getSectionId(this.complianceTab, 'COMPLIANCE_QUESTIONNAIRE');
        this.questionnaireSectionDetails.sectionName = this.commonService.getSectionName(this.complianceTab, 'COMPLIANCE_QUESTIONNAIRE');
        this.questionnaireSectionDetails.subSectionId = this.commonService.getSubSectionId(this.complianceTab, 'COMPLIANCE_QUESTIONNAIRE');
        this.noteSectionDetails.sectionId = this.commonService.getSectionId(this.complianceTab, 'COMPLIANCE_NOTES');
        this.noteSectionDetails.sectionName = this.commonService.getSectionName(this.complianceTab, 'COMPLIANCE_NOTES');
        this.complianceDetails.sectionId = this.commonService.getSectionId(this.complianceTab, 'COMPLIANCE_DETAILS');
        this.complianceDetails.sectionName = this.commonService.getSectionName(this.complianceTab, 'COMPLIANCE_DETAILS');
    }

    setNotesSectionInput(): void {
        this.notesSectionInput.entityId = this.entityDetails.entityId;
        this.notesSectionInput.isEditMode = this._dataStoreService.getEditMode() && this.commonService.getAvailableRight(['MANAGE_ENTITY_COMPLIANCE_NOTES']);
        this.notesSectionInput.sectionCode = NOTES_SECTIONS_LIST.COMPLIANCE;
        this.notesSectionInput.sectionId = this.noteSectionDetails.sectionId;
        this.notesSectionInput.sectionName = this.noteSectionDetails.sectionName;
        this.notesList = [...this.notesList];
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        if (this.entityDetails?.entityId != ENTITY_DATA?.entityDetails?.entityId) {
            this.fetchEntityComplianceDetails(ENTITY_DATA?.entityDetails?.entityId);
        }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.canShowNotesSection = this.commonService.getAvailableRight(COMPLIANCE_NOTES_RIGHTS);
        this.setNotesSectionInput();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private fetchEntityComplianceDetails(entityId: string | number): void {
        this.$subscriptions.push(this._entityComplianceService.fetchEntityComplianceDetails(entityId).subscribe((entityCompliance: EntityCompliance) => {
            this._entityComplianceService.entityCompliance = entityCompliance;
            this.complianceEntityRiskList = entityCompliance?.entityRisks ? entityCompliance.entityRisks : [];
            this.entityComplianceAttachmentList = entityCompliance?.attachments ? entityCompliance.attachments : [];
            this.isLoading = false;
        }, (_error: any) => {
            this.isLoading = false;
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }));
    }

    private fetchNotesList(): void {
        if(this.canShowNotesSection) {
            this.$subscriptions.push(this._entityManagementService.fetchOverviewNotes(NOTES_SECTIONS_LIST.COMPLIANCE ,this.entityDetails.entityId).subscribe((data: any) => {
                this.notesList = [...data];
            }));
        }
    }

    updateNotesList(notesList: Note[]): void {
        this.notesList = notesList;
    }


}
