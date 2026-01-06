import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../fibi/src/app/common/utilities/subscription-handler';
import { listAnimation } from '../common/utilities/animations';
import { CommonService } from '../common/services/common.service';
import { Note } from '../disclosure/coi-interface';
import { HTTP_ERROR_STATUS, NotesAPI } from '../app-constants';
import { CommonNoteInputs } from '../entity-management-module/shared/entity-interface';
import { NOTES_NO_INFO_MESSAGE } from '../no-info-message-constants';

@Component({
    selector: 'app-notes-attachments',
    templateUrl: './notes-attachments.component.html',
    styleUrls: ['./notes-attachments.component.scss'],
    animations: [listAnimation]
})

export class NotesAttachmentsComponent implements OnInit {

    $subscriptions: Subscription[] = [];
    notesObj = new Note();
    notesAPICallsForList: NotesAPI = { add: '/notes/save', delete: '/notes/delete/', edit: '/notes/update' };
    notesList: Note[] = [];
    isShowDisAddNoteSlider = false;
    isShowAddNoteCard = false;
    notesAPICallsForEditor: NotesAPI = { add: '/notes/save' };
    loginPersonId = '';
    editorCardAction : 'ADD'|'EDIT'|null = null;
    lastFocusedElement ='';
    noDataMessage = NOTES_NO_INFO_MESSAGE;

    @Input() notesSectionInput: CommonNoteInputs = null;
    @Input() isEditMode = true;
    @Input() gridClass = 'coi-grid-1 coi-grid-md-2 coi-grid-lg-3 coi-grid-xl-1';
    @Input() isSliderView = false;
    @Input() coiPersonId = null;
    @Input() canShowAddButton = false;
    @Input() sliderId = '';

    constructor(private _commonService: CommonService) { }

    ngOnInit() {
        this.loginPersonId = this._commonService.getCurrentUserDetail('personID');
        this.fetchNotesList();
        this.listenForNoteUpdate();
    }

    private fetchNotesList(): void {
        this.$subscriptions.push(this._commonService.fetchNotesList(this.coiPersonId || this.loginPersonId).subscribe((data: any) => {
            if (data?.length) {
                this.notesList = data;
                this.triggerNoteList();
            } else if (this.canShowAddButton && this.isSliderView) {
                this.openEditorSlider();
            }
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching notes.');
        }))
    }

    private setEditModeForNotes(): void {
        this.notesList.map(ele => ele.isEditable = false);
        this.notesList.forEach((ele: Note) => {
            ele.isEditable = ((this.isSliderView && this.canShowAddButton) || !this.isSliderView) && this.loginPersonId == ele.updatedBy;
        });
    }

    private listenForNoteUpdate(): void {
        this.$subscriptions.push(this._commonService.$updateNoteList.subscribe((data: Note) => {
            this.notesList.unshift(data);
            this.triggerNoteList();
        }));
    }

    private triggerNoteList(): void {
        if(this.notesList.length) {
            this.setEditModeForNotes();
        }
        setTimeout(() => { this._commonService.$globalEventNotifier.next({ uniqueId: 'NOTES_LIST', content: this.notesList }) });
    }

    updateAndCloseSlider(event: { notesObj: Note | null }): void {
        if (event?.notesObj?.noteId) {
            this.removeFromListIfEdited(event?.notesObj?.noteId);
            this.notesList.unshift(event.notesObj);
            this.triggerNoteList();
        }
        this.isShowDisAddNoteSlider = false;
        this.isShowAddNoteCard = false;
        this.editorCardAction = null;
    }

    private removeFromListIfEdited(noteId): void {
        if(this.editorCardAction === 'EDIT') {
            const INDEX = this.notesList.findIndex((ele: Note) => ele.noteId === noteId);
            if (INDEX > -1) {
                this.notesList.splice(INDEX, 1);
            }
        }
    }

    openEditorSlider(noteEvent: Note = null): void {
        noteEvent ? this.openEditorForEdit(noteEvent) :  this.openEditorForAdd();
        setTimeout(() => {
            this.lastFocusedElement = 'add-note-from-list';
            document.getElementById(`${this.sliderId}-slider-body`)?.scrollTo(0,0);
        });
    }

    emitDeletedList(noteList: Note[]): void {
        if (noteList.length) {
            this.notesList = noteList;
        } else {
            this.notesList = [];
        }
    }

    cancelAddNote(cancelEvent: boolean) {
        this.isShowAddNoteCard = cancelEvent;
        this.editorCardAction = null;
        const ELEMET = document.getElementById(this.lastFocusedElement);
        if (ELEMET && this.editorCardAction === 'ADD') {
            ELEMET.focus();
        }
    }

    openEditorForAdd() {
        let notesObj =  new Note();
        notesObj.personId = this.coiPersonId || this._commonService.getCurrentUserDetail('personID');
        delete notesObj.noteId;
        this.isSliderView ? this.isShowAddNoteCard = true : this.isShowDisAddNoteSlider = true;
        this.editorCardAction = 'ADD';
        this.openEditor(notesObj);
    }

    openEditorForEdit(note: Note) {
        this.isShowAddNoteCard = true;
        this.editorCardAction = 'EDIT';
        this.openEditor(note)
    }

    openEditor(note: Note): void {
        setTimeout(() => {
            this._commonService.$globalEventNotifier.next({ uniqueId: 'NOTES_EDITOR', content: { note: note, sliderMode: 'EDIT', isEditMode: true } });
        });
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
