import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../common/services/common.service';
import {BehaviorSubject} from 'rxjs';
import {HTTP_SUCCESS_STATUS} from '../../app-constants';
import {AutoSaveRequestObject} from './custom-element.interface';

@Injectable()
export class CustomElementService {

    private isProcessingAutoSaveQueue = new BehaviorSubject<boolean>(false);
    isProcessingAutoSaveQueue$ = this.isProcessingAutoSaveQueue.asObservable();

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    getCustomData(moduleCode, moduleItemKey, tabName, subSectionCode) {
        return this._http.post(this._commonService.fibiUrl + '/getApplicatbleCustomElement', {
            'moduleCode': moduleCode,
            'moduleItemKey': moduleItemKey,
            'tabName': tabName,
            'subSectionCode': subSectionCode
        });
    }

    getCustomDataOnModuleCode(moduleCode) {
        return this._http.get(this._commonService.fibiUrl + '/customElements/' + moduleCode);
    }

    saveCustomData(params) {
        return this._http.post(this._commonService.fibiUrl + '/saveCustomResponse', params);
    }

    /**
     * API call for the autosave feature in custom data
     * - Shows a toaster with the below content till the API response is received
     */
    autoSaveCustomData(requestObject: AutoSaveRequestObject, isShowToast = true) {
        isShowToast && this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Saving...');
        return this._http.post(this._commonService.fibiUrl + '/saveCustomResponse/v1', requestObject);
    }

    /**
     * Function to update the autosave queue flag
     * - Autosave queue flag indicates whether there are any pending API calls of autosave to complete
     */
    updateAutoSaveQueueFlag(newValue: boolean) {
        this.isProcessingAutoSaveQueue.next(newValue);
    }
}
