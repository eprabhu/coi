import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { AttachmentSaveRO, AttachmentReplaceRO } from '../../../common/services/coi-common.interface';

@Injectable()
export class EntityAttachmentModalService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {}

    saveAttachment(params: { sectionCode: string, newAttachments: AttachmentSaveRO[], entityId: string | number }, uploadedFile) {
        const formData = new FormData();
        for (const file of uploadedFile) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify(params));
        return this._http.post(`${this._commonService.baseUrl}/entity/attachment/saveFile`, formData);
    }

    fetchAttachmentTypes(sectionCode: string) {
        return this._http.get(`${this._commonService.baseUrl}/entity/attachment/fetchAttachmentTypes/${sectionCode}`);
    }

    deleteAttachment(attachmentNumber: number) {
        return this._http.post(`${this._commonService.baseUrl}/entity/attachment/deleteAttachment`, {attachmentNumber});
    }

    updateAttachment(attachmentId: number, description: string) {
        return this._http.post(`${this._commonService.baseUrl}/entity/attachment/updateAttachmentDetails`, { attachmentId, description });
    }

    downloadAwardAttachment(attachmentId) {
        return this._http.get(`${this._commonService.baseUrl}/entity/attachment/downloadAttachment`, {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

}
