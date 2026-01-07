import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { NotesTab } from '../shared/entity-constants';
import { Subject, Subscription } from 'rxjs';
import { EntityManagementService } from '../entity-management.service';
import { CommonNoteInputs, DataStoreEvent, EntireEntityDetails, EntityDetails } from '../shared/entity-interface';
import { EntityDataStoreService } from '../entity-data-store.service';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { NOTES_SECTIONS_LIST } from '../../app-constants';
import { Note } from '../../disclosure/coi-interface';

@Component({
  selector: 'app-entity-notes',
  templateUrl: './entity-notes.component.html',
  styleUrls: ['./entity-notes.component.scss']
})
export class EntityNotesComponent implements OnInit, OnDestroy {

    sectionDetails = {sectionId: '', sectionName: ''};
    $subscriptions: Subscription[] = [];
    entityDetails = new EntityDetails();
    isEditMode = false;
    notesList: Note[] = [];
    notesSectionInput = new CommonNoteInputs();

    constructor(private _commonService: CommonService, private _entityManagementService: EntityManagementService,
        private _dataStoreService: EntityDataStoreService
    ) {}

    ngOnInit() {
        window.scrollTo(0,0);
        this.setSectionIdAndName();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.fetchConsolidatedNotes();
    }

    private setSectionIdAndName(): void {
        this.sectionDetails.sectionId = this._commonService.getSectionId(NotesTab, 'NOTES');
        this.sectionDetails.sectionName = this._commonService.getSectionName(NotesTab, 'NOTES');
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.checkUserHasRight();
        this.setNotesSectionInput();
    }

    private setNotesSectionInput(): void {
        this.notesSectionInput.entityId = this.entityDetails.entityId;
        this.notesSectionInput.isEditMode = this.isEditMode;
        this.notesSectionInput.sectionCode = NOTES_SECTIONS_LIST.OVERVIEW;
        this.notesSectionInput.sectionId = this.sectionDetails.sectionId;
        this.notesSectionInput.sectionName = this.sectionDetails.sectionName;
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
        }));
    }

    private checkUserHasRight(): void {
        this.isEditMode = this._dataStoreService.getEditMode() && 
        this._commonService.getAvailableRight(['MANAGE_ENTITY_OVERVIEW_NOTES'], 'SOME');
    }

    private fetchConsolidatedNotes(): void {
        this.$subscriptions.push(this._entityManagementService.fetchOverviewNotes(NOTES_SECTIONS_LIST.OVERVIEW ,this.entityDetails.entityId).subscribe((data: any) => {
            this.notesList = [...data];
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
