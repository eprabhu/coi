import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';
import { DeclarationAdminDashboardRO, DeclarationAdminDashboardSearchValues,
    DeclarationDashboardSortType, DeclarationSortCountObj, DeclarationAdminDashboard,
    DeclAdminDashboardTabType, DeclAdminDashboardTabCount } from '../../declaration.interface';

@Injectable()
export class DeclarationAdminDashboardService {

    isAdvanceSearchMade = false;
    isShowAdvanceSearchBox = false;
    sortCountObj = new DeclarationSortCountObj();
    sortType = new DeclarationDashboardSortType();
    dashboardRO = new DeclarationAdminDashboardRO();
    tabType: DeclAdminDashboardTabType = 'ALL_DECLARATIONS';
    dashboardSearchValues = new DeclarationAdminDashboardSearchValues();

    constructor(private _http: HttpClient, private _commonService: CommonService) {}

    fetchDeclarations(declarationDashboardData: DeclarationAdminDashboardRO): Observable<DeclarationAdminDashboard> {
        return this._http.post<DeclarationAdminDashboard>(`${this._commonService.baseUrl}/declaration/dashboard/getDashboardData`, { declarationDashboardData });
    }

    getAdminDashboardTabCount(declarationDashboardData: DeclarationAdminDashboardRO): Observable<DeclAdminDashboardTabCount> {
        return this._http.post<DeclAdminDashboardTabCount>(`${this._commonService.baseUrl}/declaration/dashboard/getAdminDashboardTabCount`, { declarationDashboardData });
    }

}
