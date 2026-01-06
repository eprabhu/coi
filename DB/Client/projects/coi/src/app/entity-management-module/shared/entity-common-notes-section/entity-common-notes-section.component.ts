import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { Note } from '../../../disclosure/coi-interface';
import { CommonNoteInputs, EntireEntityDetails } from '../entity-interface';
import { NOTES_SECTIONS_LIST, NotesAPI } from '../../../app-constants';
import { EntityManagementService } from '../../entity-management.service';
import { SUB_AWARD_NOTES, COMPLIANCE_NOTES, SPONSOR_NOTES, ENTITY_NOTES } from '../entity-constants';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { Subscription } from 'rxjs';
import { isEmptyObject } from '../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-entity-common-notes-section',
    templateUrl: './entity-common-notes-section.component.html',
    styleUrls: ['./entity-common-notes-section.component.scss']
})

export class EntityCommonNotesSectionComponent implements OnInit, OnChanges {

    commentCount = 0;
    notesObj = new Note();
    isShowCommentButton = false;
    isShowAddNoteSlider = false;
    $subscriptions: Subscription[] = [];
    notesAPICallsForList: NotesAPI = { add: '/entity/notes/save', delete: '/entity/notes/delete', edit: '/entity/notes/update' };
    notesAPICallsForEditor: NotesAPI = { add: '/entity/notes/save' };

    @Input() notesList: Note[];
    @Input() notesSectionInput: CommonNoteInputs;
    @Input() gridClass: string = 'coi-grid-1 coi-grid-md-2 coi-grid-lg-3 coi-grid-xl-1';

    @Output() emitNotesList: EventEmitter<Note[]> = new EventEmitter<Note[]>();

    constructor(private _commonService: CommonService, public entityManagementService: EntityManagementService, private _dataStoreService: EntityDataStoreService) { }

    ngOnInit() {
        this.listenDataChangeFromStore();
        this.getDataFromStore();
        this.notesListTrigger();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(this.getSectionDetails(this.notesSectionInput?.sectionCode));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['notesList'] && !changes['notesList'].isFirstChange()) {
            //need for fututre use.
            // const PREVIOUS_LIST = changes['notesList'].previousValue;
            // const CURRENT_VALUE = changes['notesList'].currentValue;
            // (JSON.stringify(PREVIOUS_LIST) !== JSON.stringify(CURRENT_VALUE)) &&
            this.notesListTrigger();
        }
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.commentCount = ENTITY_DATA.commentCountList?.[this.getSectionDetails(this.notesSectionInput?.sectionCode)?.sectionTypeCode] || 0;
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(this._dataStoreService.dataEvent
            .subscribe(() => {
                this.getDataFromStore();
            }));
    }

    private notesListTrigger(): void {
        this.checkUserHasRight()
        if (this.notesList?.length) {
            this.notesList.map((ele: Note) => {
                ele.sectionCode = this.notesSectionInput?.sectionCode;
                ele.isEditable = this.notesSectionInput?.isEditMode;
            });
            setTimeout(() => { this._commonService.$globalEventNotifier.next({ uniqueId: 'NOTES_LIST', content: this.notesList }) });
        }
    }

    private getSectionDetails(sectionCode: number | string): any {
        switch (sectionCode) {
            case NOTES_SECTIONS_LIST.SUB_AWARD: return SUB_AWARD_NOTES;
            case NOTES_SECTIONS_LIST.COMPLIANCE: return COMPLIANCE_NOTES;
            case NOTES_SECTIONS_LIST.SPONSOR: return SPONSOR_NOTES;
            case NOTES_SECTIONS_LIST.OVERVIEW: return ENTITY_NOTES;
            default: return;
        }
    }

    private checkUserHasRight(): void {
        const hasRight = this._dataStoreService.getOverviewEditRight(this.notesSectionInput?.sectionId);
        if (!hasRight) {
            this.notesSectionInput.isEditMode = false;
        }
    }

    openEditorSlider(): void {
        this.notesObj.entityId = this.notesSectionInput.entityId;
        this.notesObj.sectionCode = this.notesSectionInput.sectionCode;
        delete this.notesObj.noteId;
        this.isShowAddNoteSlider = true;
        setTimeout(() => {
            this._commonService.$globalEventNotifier.next({ uniqueId: 'NOTES_EDITOR', content: { note: this.notesObj, sliderMode: 'EDIT', isEditMode: true} });
        });
    }

    updateAndCloseSlider(event: { notesObj: Note | null }): void {
        this.isShowAddNoteSlider = false;
        if (event?.notesObj?.noteId) {
            this.notesList.unshift(event.notesObj);
            this.notesListTrigger();
        }
        this.emitNotesList.emit(this.notesList);
    }

    emitDeletedList(noteList: Note[]) {
        if(noteList.length) {
            this.notesList = noteList;
        } else {
            this.notesList = [];
        }
    }

    openReviewComments(): void {
        const SECTION_DETAILS = this.getSectionDetails(this.notesSectionInput?.sectionCode);
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: SECTION_DETAILS.commentTypeCode,
            sectionTypeCode: SECTION_DETAILS.sectionTypeCode
        });
    }

}
