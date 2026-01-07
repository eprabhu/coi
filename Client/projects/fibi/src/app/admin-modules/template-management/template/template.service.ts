import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class TemplateService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    loadAllTemplates(param) {
        return this._http.post(this._commonService.baseUrl + '/loadAllTemplates', param);
    }
    deleteTemplate(param) {
        return this._http.post(this._commonService.baseUrl + '/deleteAgreementTemplate', param);
    }

    addAgreementTemplate(newAttachments, typeCode, uploadedFile) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append( 'files', file );
    }
    formData.append( 'formDataJson', JSON.stringify( {'newAgreementTypeTemplate': newAttachments, 'agreementTypeCode' : typeCode} ) );
    return this._http.post( this._commonService.baseUrl + '/addAgreementTemplate', formData );
  }
  downloadAgreementTemplate( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadAgreementTemplate', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }
}
