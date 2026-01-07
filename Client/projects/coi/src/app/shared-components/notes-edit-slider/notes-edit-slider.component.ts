import { deepCloneObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { CommonService } from '../../common/services/common.service';
import { Note } from '../../disclosure/coi-interface';
import { closeCoiSlider, openCoiSlider } from '../../common/utilities/custom-utilities';
import { COMMON_ERROR_TOAST_MSG, EDITOR_CONFIGURATION, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, NotesAPI } from '../../app-constants';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { NotesEditSliderService } from './notes-edit-slider.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

interface EmitDetails {
    notesObj: Note;
}

@Component({
    selector: 'app-notes-edit-slider',
    templateUrl: './notes-edit-slider.component.html',
    styleUrls: ['./notes-edit-slider.component.scss'],
    providers: [NotesEditSliderService]
})
export class NotesEditSliderComponent {

    $subscriptions: Subscription[] = [];
    notesObj = new Note();
    initialNoteObj = new Note();
    changesFlag = {
        title: false,
        content: false
    }
    Editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIGURATION;
    isShowSlider = false;
    mandatoryList = new Map();
    mode: 'VIEW' | 'EDIT' = 'VIEW';
    isEditMode = false;

    @Input() sliderId: string;
    @Input() notesAPICalls: NotesAPI;
    @Input() noteEditorView: 'SLIDER'|'CARD' = 'SLIDER';
    @Output() emitSliderAction = new EventEmitter<EmitDetails>();
    @Output() cancelActionEmit = new EventEmitter<boolean>();

    constructor(private _commonService: CommonService, private _notesEditService: NotesEditSliderService) { }

    ngOnInit() {
        this.editorConfig.height = 80;
        this.editorConfig.placeholder = 'Please enter the note description';
        this.listenToGlobalNotifier();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data.uniqueId === 'NOTES_EDITOR') {
                this.notesObj = deepCloneObject(data?.content?.note);
                this.initialNoteObj = deepCloneObject(data?.content?.note);
                this.mode = data?.content?.sliderMode;
                this.isEditMode = data?.content?.isEditMode;
                if(this.noteEditorView === 'SLIDER') {
                    this.setFocusToTitle('coi-notes-title-slider', 100);
                    this.isShowSlider = true;
                    openCoiSlider(this.sliderId);
                } else {
                    this.setFocusToTitle('coi-notes-title-card');
                }
            }
        }));
    }

    setFocusToTitle(id: string, time = 0) {
        setTimeout(() => {
            const TITLE = document.getElementById(id);
            if(TITLE) {
                TITLE.focus();
            }
        }, time);
    }

    onReady(editor): void {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    closeSlider(): void {
        setTimeout(() => {
            this.isShowSlider = false;
            this.initialNoteObj = new Note();
            this.emitSliderAction.emit({ notesObj: null });
        }, 500);
    }

    clearNotes(): void {
        this.mandatoryList.clear();
        this.notesObj.content = '';
        this.notesObj.title = '';
        this.changesFlag = { title: false, content: false };
        if(this.noteEditorView === 'CARD') {
            this.cancelActionEmit.emit(true);
        }
    }

    saveOrUpdateNotes() {
        this.notesObj?.noteId ? this.updateNote() : this.saveNote();
    }

    private saveNote(): void {
        if (this.checkMandatoryFilled()) {
            delete this.notesObj['isEditable'];
            this.$subscriptions.push(this._notesEditService.saveNote(this.notesObj, this.notesAPICalls?.add).subscribe((data: Note) => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Note saved successfully.');
                this.noteEditorView === 'SLIDER' ? this.emitDataAndCloseSlider(data) : this.emitDataFromCard(data);
            }, err=> {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }
        ));
        }
    }

    private updateNote(): void {
        const REQ_OBJ = this.getReqObj();
        if (REQ_OBJ.hasOwnProperty('title') || REQ_OBJ.hasOwnProperty('content')) {
            if (this.checkMandatoryFilled()) {
                this.$subscriptions.push(this._notesEditService.updateNote(REQ_OBJ, this.notesAPICalls?.edit).subscribe((data: any) => {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Note updated successfully.');
                    this.emitDataAndCloseSlider(data);
                }, err=> {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
            }
        } else {
            this.emitDataAndCloseSlider();
        }
    }

    emitDataAndCloseSlider(data: Note = null) {
        setTimeout(() => {
            this.notesObj.noteId = data?.noteId;
            this.notesObj.updateTimestamp = data?.updateTimestamp;
            this.notesObj.updatedBy = data?.updatedBy;
            this.notesObj.updatedByFullName = data?.updatedByFullName;
            this.emitSliderAction.emit({ notesObj: this.notesObj });
        }, 500);
        closeCoiSlider(this.sliderId);
    }

    emitDataFromCard(data: Note = null) {
        this.notesObj.noteId = data?.noteId;
        this.notesObj.updateTimestamp = data?.updateTimestamp;
        this.notesObj.updatedBy = data?.updatedBy;
        this.notesObj.updatedByFullName = data?.updatedByFullName;
        this.emitSliderAction.emit({ notesObj: this.notesObj });
    }

    getReqObj(): Note {
        const REQ_OBJ = new Note();
        REQ_OBJ.noteId = this.notesObj.noteId;
        REQ_OBJ.sectionCode = this.notesObj.sectionCode;
        REQ_OBJ.personId = this.notesAPICalls?.edit.includes('entity') ? undefined : this._commonService.getCurrentUserDetail('personID');
        REQ_OBJ.title = this.changesFlag.title ? this.notesObj.title : undefined;
        REQ_OBJ.content = this.changesFlag.content ? this.notesObj.content : undefined;
        delete REQ_OBJ['isEditable'];
        return REQ_OBJ;
    }

    setChangesFlag(key: 'content' | 'title'): void {
        if (this.initialNoteObj[key] != this.notesObj[key]) {
            this.changesFlag[key] = true;
        }
    }

    private checkMandatoryFilled(): boolean {
        this.mandatoryList.clear();
        this.notesObj.content = this.notesObj?.content?.trim();
        if (!this.notesObj.title) {
            this.mandatoryList.set('title', 'Please enter a note title.');
        }
        if (!this.notesObj.content) {
            this.mandatoryList.set('content', 'Please enter a note description.');
        }
        return !this.mandatoryList.size;
    }

    cancelAddCard(): void {
        this.cancelActionEmit.emit(false);
    }
}
