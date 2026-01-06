import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';
import { CorporateTreeUnlinkRO, EntityTreeStructure, NewTreeClass } from './entity-corporate-family.interface';
import { Observable } from 'rxjs';

@Injectable()

export class EntityCorporateFamilyService {

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    coporateFamilyTree: EntityTreeStructure;
    foundEntitiesId = [];

    addNewTree(corporateFamilyObj: NewTreeClass): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/entity/corporateFamily', corporateFamilyObj);
    }

    fetchFamilyTree(entityNumber: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/corporateFamily/${entityNumber}`);
    }

    unLinkNode(payload: CorporateTreeUnlinkRO): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/entity/corporateFamily/unLink`, payload);
    }

    editNode(corporateFamilyObj: NewTreeClass): Observable<any> {
        return this._http.patch(this._commonService.baseUrl + '/entity/corporateFamily', corporateFamilyObj);
    }

    checkEntityAlreadyPresent(entityNumber: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/corporateFamily/parentExists/${entityNumber}`);
    }

}
