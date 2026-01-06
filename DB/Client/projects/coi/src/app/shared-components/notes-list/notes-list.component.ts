import { Component, EventEmitter, Input, Output,} from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { Note } from '../../disclosure/coi-interface';
import { closeCommonModal, openCommonModal } from '../../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../common-modal/common-modal.interface';
import { NotesListService } from './notes-list.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { COMMON_ERROR_TOAST_MSG, HTTP_SUCCESS_STATUS, NotesAPI, HTTP_ERROR_STATUS, NoteStickyClass } from '../../app-constants';

@Component({
    selector: 'app-notes-list',
    templateUrl: './notes-list.component.html',
    styleUrls: ['./notes-list.component.scss'],
    providers: [NotesListService]
})
export class NotesListComponent {

    $subscriptions: Subscription[] = [];
    notesList: Note[] = [];
    currentIndex: number = null;
    currentNote: Note = null;
    editSliderId = '';
    CONFIRMATION_MODAL_ID = 'note-delete-confirmation-modal';
    READ_MORE_MODAL_ID = 'read-more-modal';
    modalConfig = new CommonModalConfig(this.CONFIRMATION_MODAL_ID, 'Confirm', 'Cancel');
    readMoreModalConfig = new CommonModalConfig(this.READ_MORE_MODAL_ID, undefined, undefined, 'xl');
    isShowSlider = false;
    searchText = '';
    sliderMode: 'VIEW' | 'EDIT' = 'EDIT';

    @Input() gridClass: string = 'coi-grid-1 coi-grid-md-2 coi-grid-lg-3 coi-grid-xl-1';
    @Input() notesAPICalls: NotesAPI;
    @Input() isSliderView = false;
    @Input() canShowAddButton = false;
    @Input() stickyClass: NoteStickyClass = 'sticky-top-51';

    @Output() emitDeletedList = new EventEmitter<any>();
    @Output() emitAddAction = new EventEmitter<Note|null>();

    constructor(private _commonService: CommonService, private _notesListService: NotesListService) { }

    ngOnInit() {
        this.listenToGlobalNotifier();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data.uniqueId === 'NOTES_LIST') {
                this.notesList = [...data.content];
                this.notesList.map(ele => {
                    ele.isExpanded = false;
                });
            }
        }));
    }

    editNote(note: Note, editIndex: number): void {
        this.currentNote = note;
        this.currentIndex = editIndex;
        if(this.isSliderView) {
            this.emitAddAction.emit(this.currentNote);
        } else {
            this.editSliderId = 'edit-note-slider' + editIndex;
            this.isShowSlider = true;
            setTimeout(() => {
                this._commonService.$globalEventNotifier.next({ uniqueId: 'NOTES_EDITOR', content: { note: this.currentNote, sliderMode: 'EDIT', isEditMode: note.isEditable } });
            });
        }
    }

    addNewNote(): void {
        this.searchText = '';
        this.emitAddAction.emit(null);
    }

    viewNote(note: Note, editIndex: number): void {
        this.currentNote = note;
        this.currentIndex = editIndex;
        if (this.isSliderView) {
            note.isExpanded = true;
        } else {
            this.editSliderId = 'edit-note-slider' + editIndex;
            this.isShowSlider = true;
            //Time taken to render from ts to html, so given inside settimeout (isShowSlider);
            setTimeout(() => {
                this._commonService.$globalEventNotifier.next({ uniqueId: 'NOTES_EDITOR', content: { note: this.currentNote, sliderMode: 'VIEW', isEditMode: note.isEditable } });
            });
        }
    }

    collapseText(note) {
        note.isExpanded = false;
    }

    deleteNote(note: Note, editIndex: number): void {
        this.currentNote = note;
        this.currentIndex = editIndex;
        openCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    postDeleteConfirmation(actionEvent: ModalActionEvent) {
        actionEvent.action === 'PRIMARY_BTN' ? this.deleteNoteAPICall() : this.clearAndCloseModal();
    }

    deleteNoteAPICall() {
        this.$subscriptions.push(this._notesListService.deleteNote(this.currentNote, this.notesAPICalls.delete).subscribe((data: any) => {
            const INDEX = this.notesList.findIndex((ele: Note) => ele.noteId === this.currentNote?.noteId);
            if (INDEX > -1) { this.notesList.splice(INDEX, 1); }
            this.clearAndCloseModal();
            this.emitDeletedList.emit(this.notesList);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Note deleted successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
        ));
    }

    private clearAndCloseModal(): void {
        this.currentNote = null;
        this.currentIndex = null;
        this.isShowSlider = false;
        closeCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    updateAndCloseSlider(event: { notesObj: Note | null }) {
        if (event?.notesObj?.noteId) {
            const INDEX = this.notesList.findIndex((ele: Note) => ele.noteId === event?.notesObj?.noteId);
            if (INDEX > -1) {
                this.notesList.splice(INDEX, 1);
                this.notesList.unshift(event?.notesObj);
            }
        }
        this.isShowSlider = false;
        this.currentIndex = null;
        this.currentNote = null;
    }
}
