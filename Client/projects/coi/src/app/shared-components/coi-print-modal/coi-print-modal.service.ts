import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { DownloadLetterTemplateRO } from '../../common/services/coi-common.interface';

@Injectable()
export class CoiPrintModalService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {}

    fetchPrintTemplates(fetchPrintTemplatesEndpoint: string, moduleItemCode: string | number, subModuleItemCode: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}${fetchPrintTemplatesEndpoint}/${moduleItemCode}/${subModuleItemCode}`);
    }

    downloadTemplate(downloadTemplateEndpoint: string, params: DownloadLetterTemplateRO): Observable<any> {
        return this._http.post(`${this._commonService.printUrl}${downloadTemplateEndpoint}`, params, { responseType: 'blob' });
    }

}
