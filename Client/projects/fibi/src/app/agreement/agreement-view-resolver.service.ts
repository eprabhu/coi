import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {of as observableOf,  Observable } from 'rxjs';

import { CommonService } from './../common/services/common.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AgreementViewResolverService implements Resolve<any> {

  constructor(private _http: HttpClient, private _router: Router,
    private _commonService: CommonService) { }

  resolve(route: ActivatedRouteSnapshot) {
    if (!route.queryParamMap.get('agreementId')) {
      return this._http.post(this._commonService.baseUrl + '/createAgreement ',
        { 'personId': this._commonService.getCurrentUserDetail('personID') });
    } else {
      return this._http.post(this._commonService.baseUrl + '/loadAgreementById',
        {
          'agreementRequestId': route.queryParamMap.get('agreementId'),
          'personId': this._commonService.getCurrentUserDetail('personID'),
          'loginUserName': this._commonService.getCurrentUserDetail('userName')
        }).pipe(catchError(error => {
            if (error.status === 403) {
              // name is given based on the values assinged in forbidden component please refer forbidden.component.ts
              this._commonService.forbiddenModule = '13';
              this._router.navigate(['/fibi/error/403']);
              return observableOf(null);
            } else {
              this._router.navigate(['/fibi/dashboard/agreement-list']);
              return observableOf(null);
            }
          }));;
    }
  }
}
