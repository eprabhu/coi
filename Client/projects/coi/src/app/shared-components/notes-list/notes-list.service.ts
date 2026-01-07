import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';
import { NOTE_DELETE_API } from '../../app-constants';
import { Note } from '../../disclosure/coi-interface';

@Injectable()

export class NotesListService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    deleteNote(note: Note, deleteAPICall: NOTE_DELETE_API) {
        if(deleteAPICall.includes('entity')) {
            return this._http.delete(`${this._commonService.baseUrl}${deleteAPICall}/${note?.sectionCode}/${note?.noteId}`, { responseType: 'text' });
        } else {
            const LOGIN_PERSON = this._commonService.getCurrentUserDetail('personID');
            return this._http.delete(`${this._commonService.baseUrl}${deleteAPICall}/${note?.noteId}/${LOGIN_PERSON}`, { responseType: 'text' });
        }
    }

}
