import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class QuestionnaireListCompareService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    questionnaireListCache: any = {};

    getApplicableQuestionnaire(params) {
        const cacheName = this.getCacheName(params.moduleItemKey, params.moduleSubItemKey, params.moduleSubItemCode);
        if (this.checkInCache(cacheName)) {
            return of(this.deepCopy(this.questionnaireListCache[cacheName]));
        }
        return this._http.post(this._commonService.fibiUrl + '/getApplicableQuestionnaire', params)
        .pipe(map(data => this.updateQuestionnaireListCache(cacheName, data)));
    }

    getQuestionnaire(data) {
        return this._http.post(this._commonService.fibiUrl + '/getQuestionnaire', data );
    }

    checkInCache(cacheName: string): boolean {
        return !!Object.keys(this.questionnaireListCache).find(key => key === cacheName);
    }

    getCacheName(moduleItemKey: string, moduleSubItemKey: string, moduleSubItemCode: string) {
        return  moduleItemKey + moduleSubItemKey + moduleSubItemCode;
    }

    updateQuestionnaireListCache(cacheName: string, data: any) {
        this.questionnaireListCache[cacheName] = this.deepCopy(data);
        return data;
    }
    deepCopy(data: any): any {
        return JSON.parse(JSON.stringify(data));
    }
}
