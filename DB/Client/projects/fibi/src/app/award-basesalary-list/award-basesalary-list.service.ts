import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonService } from '../common/services/common.service';
import { SearchHeader } from './award-basesalary-list.interface';

@Injectable()
export class AwardBasesalaryListService {

  constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) { }

  fetchManpowerBaseSalaryDetails(params: SearchHeader): Observable<any> {
    return this._http.post(`${this._commonService.baseUrl}/fetchManpowerBaseSalaryDetails`, params).pipe(
      catchError(error => {
        console.log('Retrieval error', error);
        if (error.status === 403) {
          this._router.navigate(['/error/403']);
          return of(null);
        }
      }));
  }

}
