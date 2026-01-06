import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UpdateProjectRelationshipRO } from '../../coi-interface';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class CoiSummaryEventsAndStoreService {

    dataEvent = new Subject();
    coiSummaryConfig: any = {
        currentDisclosureId: null,
    };

    private storeData: any = {};

    constructor(private _http: HttpClient, private _commonService: CommonService) {}

    getData(disclosureId: string, keys?: Array<string>): any {
        if (!keys) {
            return this.structuredClone(this.storeData[disclosureId]);
        }
        const data: any = {};
        keys.forEach(key => {
            data[key] = this.storeData[disclosureId][key];
        });
        return this.structuredClone(data);
    }

    setStoreData(data: any, key: string): void {
        this.storeData[key] = this.structuredClone(data);
    }

    manualDataUpdate(updatedData): void {
        const KEYS = Object.keys(updatedData);
        KEYS.forEach(key => {
            this.storeData[key] = this.structuredClone(updatedData[key]);
        });
        this.dataEvent.next(KEYS);
    }

    private structuredClone(obj: any): any {
        const nativeCloneFunction = (window as any).structuredClone;
        return (typeof nativeCloneFunction === 'function') ? nativeCloneFunction(obj) : JSON.parse(JSON.stringify(obj));
    }

    getProjConflictStatusType() {
        return this._http.get(this._commonService.baseUrl + '/getProjConflictStatusType');
    }

    updateProjectRelationship(params: UpdateProjectRelationshipRO) {
        return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/updateProjectRelationship', params);
    }

    loadProjectConflictHistory(disclosureDetailsId: any) {
        return this._http.get(`${this._commonService.baseUrl}/loadProjectConflictHistory/${disclosureDetailsId}`);
    }

}
