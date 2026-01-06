import { Injectable } from '@angular/core';
import { FormBuilderService } from '../../form-builder.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()

export class OPAInstituteResourcesService {

constructor( private _fbService: FormBuilderService, private _http: HttpClient ) { }

  saveEntityOrRelation(RO): Promise<any> {
   return RO.hasOwnProperty('entityId') ? this.saveEntity(RO) : this.saveEntityRelationOnly(RO);
  }

  saveEntity(RO): Promise<any> {
    return this._http.post(this._fbService.baseURL + '/coi/personEntity', RO).toPromise();
  }

  saveEntityRelationOnly(RO): Promise<any> {
    return this._http.post(this._fbService.baseURL + '/coi/personEntity/addRelationship', RO).toPromise();
  }

  getEntities(): Observable<any> {
    return this._http.get(this._fbService.baseURL + '/coi/getSFIRelationshipDetails');
  }

}

