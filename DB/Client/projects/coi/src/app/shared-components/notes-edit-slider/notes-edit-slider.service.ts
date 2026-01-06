import { Injectable } from '@angular/core';
import { Note } from '../../disclosure/coi-interface';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { NOTE_ADD_API, NOTE_EDIT_API } from '../../app-constants';

@Injectable()

export class NotesEditSliderService {

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    saveNote(notesObj: Note, saveAPICall: NOTE_ADD_API) {
        return this._http.post(this._commonService.baseUrl + saveAPICall, notesObj);
    }

    updateNote(notesObj: Note, editAPICall: NOTE_EDIT_API) {
        return this._http.patch(this._commonService.baseUrl + editAPICall, notesObj);
    }
}
