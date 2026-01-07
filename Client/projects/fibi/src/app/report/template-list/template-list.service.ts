import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class TemplateListService {

  selectedTemplateType = 'S';
	activeTab = 'REPORT';

  constructor(private _commonService: CommonService, private _http: HttpClient) { }

  fetchAllReportTemplates(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchAllReportTemplates', params);
  }

  deleteReportTemplate(templateId) {
		return this._http.post(this._commonService.baseUrl + '/deleteReportTemplate', { reportTemplateId: templateId });
	}

}
