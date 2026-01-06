import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { PreviousSearchObj } from './person-training.interface';
import { of } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { catchError } from 'rxjs/operators';

@Injectable()
export class PersonTrainingService {
    previousSearch = new PreviousSearchObj();
    formData = new FormData();

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    loadPersonTrainingList(params) {
        return this._http.post(this._commonService.baseUrl + '/getTrainingDashboard', params).pipe(catchError((err) => {
            if (err.status === 400) {
              this._commonService.showToast(HTTP_ERROR_STATUS, 'Invalid character(s) found in search.');
            } else {
              this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching training details failed. Please try again.');
            }
            return of();
          }));
    }

    getPersonTrainingDetails(trainingId: number) {
        return this._http.get(`${this._commonService.baseUrl}/getPersonTrainingDetails/${trainingId}`);
    }

    downloadTrainingAttachment(trainingAttachmentId: number) {
        return this._http.get(this._commonService.baseUrl + '/downloadtrainingAttachment/' + trainingAttachmentId,
            {observe: 'response', responseType: 'blob'});
    }

    saveOrUpdatePersonTraining(params: any) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdatePersonTraining', params);
    }

    saveOrUpdateTrainingComments(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateTrainingComments', params);
    }

    deleteTrainingComments(trainingCommentId: number) {
        return this._http.delete(this._commonService.baseUrl + '/deleteTrainingComments/' + trainingCommentId);
    }

    deletePersonTraining(personTrainingId: number) {
        return this._http.delete(this._commonService.baseUrl + '/deletePersonTraining/' + personTrainingId);
    }

    deleteTrainingAttachment(trainingAttachmentId: number) {
        return this._http.delete(this._commonService.baseUrl + '/deleteTrainingAttachment/' + trainingAttachmentId);
    }

    saveOrUpdateTrainingAttachment(uploadedFile, requestObject) {
        this.formData.delete('fileData');
        this.formData.delete('formDataJson');
        this.formData.append('fileData', uploadedFile);
        this.formData.append('formDataJson', JSON.stringify(requestObject));
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateTrainingAttachment', this.formData);
    }
}
