import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ProjectOutcomeService {
    httpOptions: any = {};
    outcomesData: any = {};
    awardData: any = {};
    isOutcomesEditable = false;
    endpointSearchOptions: any = {
      contextField: '',
      formatString: '',
      path : '',
      defaultValue : ''
  };

constructor(private _commonService: CommonService, private _http: HttpClient) { }

  linkAwardPublication(awardPublication) {
    return this._http.post( this._commonService.baseUrl + '/saveAwardPublication', {'awardPublication' : awardPublication} );
  }

  loadAllProjectOutcomes(awardNumber) {
    return this._http.post( this._commonService.baseUrl + '/loadAllAwardProjectOutcomes', awardNumber);
  }

  deletePublication(param) {
    return this._http.post( this._commonService.baseUrl + '/deleteAwardPublication', param);
  }

  maintainAssociation(awardAssociation) {
    return this._http.post( this._commonService.baseUrl + '/saveAwardAssociation', awardAssociation );
  }

  deleteAssociation(params) {
    return this._http.post( this._commonService.baseUrl + '/deleteAwardAssociation', params);
  }

  addAwardAcheivement(awardAcheivement, uploadedFile) {
    const formData = new FormData();
    if (uploadedFile.length) {
      formData.append( 'files', uploadedFile[0], uploadedFile[0].name );
    }
    formData.append( 'formDataJson', JSON.stringify( {'awardAcheivement': awardAcheivement} ) );
    return this._http.post( this._commonService.baseUrl + '/addAwardAcheivements', formData );
  }

  downloadAttachment(awardAcheivementAttachId) {
    return this._http.get( this._commonService.baseUrl + '/downloadAwardAcheivementsAttachment' +
                          '?awardAcheivementId=' + awardAcheivementAttachId, {responseType: 'blob'});

  }

 deleteAwardAcheivement(params) {
  return this._http.post( this._commonService.baseUrl + '/deleteAwardAcheivements', params);

 }

 linkAwardScopus(awardScopus) {
  return this._http.post( this._commonService.baseUrl + '/saveAwardScopus', {'awardScopus' : awardScopus} );
}

loadAllAwardScopus(params) {
  return this._http.post( this._commonService.baseUrl + '/loadAllAwardScopus', params);
}

deleteAwardScopus(param) {
  return this._http.post( this._commonService.baseUrl + '/deleteAwardScopus', param);
}

findPublications(param) : Observable<any>{
  return this._http.post( this._commonService.baseUrl + '/findPublications', param);
}
 /**
   * @param  {} contextField
   * @param  {} formatString
   * @param  {} path
   * returns the endpoint search object with respect to the the inputs.
   */
  setSearchOptions(contextField, formatString, path) {
    this.endpointSearchOptions.contextField = contextField;
    this.endpointSearchOptions.formatString = formatString;
    this.endpointSearchOptions.path = path;
    return JSON.parse(JSON.stringify(this.endpointSearchOptions));
  }

    fetchHelpText(param) {
        return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param);
    }
}
