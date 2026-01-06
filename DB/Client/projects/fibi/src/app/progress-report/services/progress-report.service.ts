import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import {Subject} from 'rxjs';


@Injectable()
export class ProgressReportService {
    $isQuestionnaireChange = new Subject();

    constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) { }

    loadAwardProgressReport(progressReportId: string) {
        return this._http.get(`${this._commonService.baseUrl}/loadAwardProgressReport/${progressReportId}`);
    }

    submitProgressReport(progressReportId: number, progressReportStatusCode: any) {
        return this._http.post(`${this._commonService.baseUrl}/submitProgressReport/${progressReportId}/${progressReportStatusCode}`, {});
    }

    maintainReportWorkFlow(requestObject, uploadedFile) {
        const approveFormData = new FormData();
        if (uploadedFile) {
            for (let i = 0; i < uploadedFile.length; i++) {
                approveFormData.append('files', uploadedFile[i], uploadedFile[i].name);
            }
        }
        approveFormData.append('formDataJson', JSON.stringify(requestObject));
        approveFormData.append('moduleCode', '16');
        approveFormData.append('subModuleCode', '0');
        return this._http.post(`${this._commonService.baseUrl}/approveOrRejectWorkflow`, approveFormData);
    }

    performPRFundingAgencyAction(params) {
        return this._http.patch(`${this._commonService.baseUrl}/performPRFundingAgencyAction`, params);
    }
    updateProgressReportAchievements(awardProgressReportAchievements) {
        return this._http.patch(this._commonService.baseUrl + '/updateProgressReportAchievements', awardProgressReportAchievements);
    }

    updateProgressReportDates(params: any) {
        return this._http.patch(this._commonService.baseUrl + '/updateProgressReportDates', params);
    }

    loadProgressReportKPISummary(progressReportId) {
        return this._http.get(this._commonService.baseUrl + '/loadProgressReportKPISummary/' + progressReportId);
    }

    addImportedAttachment(awardId, progressReportId, importedFile) {
            const formData = new FormData();
            for (const file of importedFile) {
              formData.append( 'files', file, file.name );
            }
            formData.append( 'formDataJson', JSON.stringify( {'awardId': awardId, 'progressReportId': progressReportId} ) );
            return this._http.post(this._commonService.baseUrl + '/importProgressReportTemplate', formData);
    }

    downloadProgressReportAsExcel(progressReportId) {
        return this._http.get(`${this._commonService.baseUrl}/generateProgressReport/${progressReportId}/ANSWERED`, {
            responseType: 'blob'
        });
    }

    downloadProgressReportAsZip(params) {
        return this._http.get(this._commonService.baseUrl + '/printEntireProgressReport', {
            headers: new HttpHeaders()
            .set( 'progressReportId', params.progressReportId.toString())
            .set('awardId', params.awardId.toString())
            .set('awardLeadUnitNumber', params.awardLeadUnitNumber.toString())
            .set('questionnaireMode', 'ANSWERED'),
                responseType: 'blob'
          });
    }

    fetchHelpText(param) {
        return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param );
    }

    deleteProgressReport(progressReportId: number) {
        return this._http.delete(`${this._commonService.baseUrl}/deleteProgressReport/${progressReportId}`);
    }

    getApplicableQuestionnaire(params) {
        return this._http.post(this._commonService.baseUrl + '/getApplicableQuestionnaire', params);
    }
}
