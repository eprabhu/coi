import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../common/services/common.service';

@Injectable()

export class NotesAttachmentsService {

    constructor(private _http: HttpClient,
        private _commonService: CommonService) { }

    fetchAllNotesForPerson(personId) {
        return this._http.get(`${this._commonService.baseUrl}/fetchAllNotesForPerson/${personId}`);
    }

    getNoteBaseOnId(noteId) {
        return this._http.get(`${this._commonService.baseUrl}/getNoteDetailsForNoteId/${noteId}`);
    }

    saveOrUpdatePersonNote(req: any) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdatePersonNote', req);
    }

}
