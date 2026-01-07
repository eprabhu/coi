import { Injectable } from '@angular/core';
import { FormBuilderService } from '../../form-builder.service';
import { RelationShipSaveRO, EntitySaveRO, EntityListRO } from './interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class OPACompUncompService {

constructor( private _fbService: FormBuilderService, private _http: HttpClient) { }

  saveEntityOrRelation(RO: EntitySaveRO| RelationShipSaveRO ): Promise<any> {
   return RO.hasOwnProperty('entityId') ? this.saveEntity(RO) : this.saveEntityRelationOnly(RO);
  }

  saveEntity(RO: EntitySaveRO| RelationShipSaveRO ): Promise<any> {
    return this._http.post(this._fbService.baseURL + '/coi/personEntity', RO).toPromise();
  }

  saveEntityRelationOnly(RO: EntitySaveRO| RelationShipSaveRO ): Promise<any> {
    return this._http.post(this._fbService.baseURL + '/coi/personEntity/addRelationship', RO).toPromise();
  }

  getEntities(): Observable<any> {
    return this._http.get(this._fbService.baseURL + '/coi/getSFIRelationshipDetails');
  }
}
