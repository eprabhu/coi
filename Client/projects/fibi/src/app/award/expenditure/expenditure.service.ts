import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

import { Observable } from 'rxjs';

import { KUConfigService } from '../../common/services/KU-config.service';

@Injectable()
export class ExpenditureService {
    KUProjectUrl: '';
    KUProjectTaskUrl: '';
    KuToken: '';
    KuTokenType: '';

    constructor(private _http: HttpClient, private _commonService: CommonService, private _KUConfig: KUConfigService) { }

    getKuExpenditureConfig() {
        return this._http.get(this._commonService.baseUrl + '/getExternalApiInfo').toPromise();
    }

    expenditureLookUpData(accountNumber) {
        return new Promise((resolve, reject) => {
            const http = new XMLHttpRequest();
            http.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(this.responseText);
                } else if (this.readyState === 4 && this.status !== 200) {
                    reject('error');
                }
            };
            http.open('GET', this._KUConfig.KUProjectTaskUrl + accountNumber);
            http.setRequestHeader('Content-Type', 'application/json');
            http.setRequestHeader(this._KUConfig.KuTokenType, this._KUConfig.KuToken);
            http.send();

        });
    }

    expenditureLookUpDetails(projectId, taskId) {
        return new Promise((resolve, reject) => {
            const http = new XMLHttpRequest();
            http.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                   resolve(this.responseText);
                } else if (this.readyState === 4 && this.status !== 200) {
                   reject('error');
                }
            };
            http.open('GET', this._KUConfig.KUProjectUrl + projectId + '/' + taskId);
            http.setRequestHeader('Content-Type', 'application/json');
            http.setRequestHeader(this._KUConfig.KuTokenType, this._KUConfig.KuToken);
            http.send();
        });
    }
}
