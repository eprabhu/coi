import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../common/services/common.service';
import { EngagementMigrationCount } from '../common/services/coi-common.interface';
import { Observable } from 'rxjs';
import { EngagementSliderConfig, EngagementsMigDashboardRO, EngagementStatusRO, LegacyEngagement, SaveMatrixRO } from './migrated-engagements-interface';
import { openCoiSlider } from '../common/utilities/custom-utilities';
import { DNBReqObj } from '../entity-management-module/shared/entity-interface';
import { PAGINATION_LIMIT } from '../app-constants';

@Injectable()
export class MigratedEngagementsService {
    
    engagementSliderConfig = new EngagementSliderConfig();

    constructor(private _http: HttpClient,
        private _commonService: CommonService) { }

    openEngagementSlider(engagementDetails: LegacyEngagement): void {
        this.engagementSliderConfig.engagementDetails = engagementDetails;
        openCoiSlider(this.engagementSliderConfig.sliderElementId);
    }

    closeEngagementSlider(): void {
        setTimeout(() => {
            this.engagementSliderConfig = new EngagementSliderConfig();
        }, 500);
    }

    getEngagementDashboard(EngagementsMigDashboardRO: object): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/engagementMigration/getDashboard`, EngagementsMigDashboardRO);
    }

    fetchMigratedEngagementCount(): Observable<EngagementMigrationCount> {
        return this._http.get<EngagementMigrationCount>(this._commonService.baseUrl + '/engagementMigration/checkMigration');
    }

    getLegacyEngagementMatrix(engagementId = ''): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/engagementMigration/getMatrix' + (engagementId ? '/' + engagementId : ''));
    }

    updateEngagementStatus(engagementStatusRO: EngagementStatusRO): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/engagementMigration/updateMigStatus', engagementStatusRO);
    }

    getEntitiesFromDB(engagementId = ''): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/engagementMigration/getEntities' + (engagementId ? '/' + engagementId : ''));
    }

    getLegacyEngagementDetails(engagementId = ''): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/engagementMigration/getEngagements' + (engagementId ? '/' + engagementId : ''));
    }

    saveMigrationAnswer(legacyEngagementDetails: SaveMatrixRO): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/engagementMigration/populateAndUpdateMigDetails', legacyEngagementDetails);
    }
    getDunsMatch(cleanseRequest: DNBReqObj): Observable<any> {
        return this._http.post(this._commonService.fibiCOIConnectUrl + '/fibi-coi-connect/cleansematch/entity/runCleanseMatch', cleanseRequest);
    }

}
