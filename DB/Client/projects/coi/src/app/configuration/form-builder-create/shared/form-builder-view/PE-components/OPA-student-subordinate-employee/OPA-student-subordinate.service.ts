import { Injectable } from '@angular/core';
import { FormBuilderService } from '../../form-builder.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class OPAStudentSubordinateService {

    constructor(private _fbService: FormBuilderService, private _http: HttpClient) { }

    getEntities(): Observable<any> {
        return this._http.get(this._fbService.baseURL + '/coi/getSFIRelationshipDetails');
    }

}
