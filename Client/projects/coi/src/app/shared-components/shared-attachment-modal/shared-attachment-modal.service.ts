import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { AttachmentSaveRO } from '../../common/services/coi-common.interface';

@Injectable()

export class SharedAttachmentModalService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }
    
    
    getAttachmentTypes(attachmentTypeEndpoint: string) {
        return this._http.get(this._commonService.baseUrl + attachmentTypeEndpoint);
    }
    
    saveAttachment(params: { attachments: AttachmentSaveRO[] } | Record<string, string>, uploadedFile: any[], saveOrReplaceEndpoint: string) {
        const formData = new FormData();
        for (const file of uploadedFile) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify(params));
        return this._http.post(`${this._commonService.baseUrl}${saveOrReplaceEndpoint}`, formData);
    }
    
    updateAttachment(params: { attachmentId: number; description: string; updateAttachmentEndpoint: string }) {
        return this._http.patch(`${this._commonService.baseUrl}${params.updateAttachmentEndpoint}`,
             { attachmentId: params.attachmentId, description: params.description } , 
             {responseType: 'text'});
    }
}
