import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { UserProjectFetchRO, UserProposalFetchRO, UserProjectsCountRO } from './configurable-project-list.interface';
import { Observable } from 'rxjs';

@Injectable()
export class ConfigurableProjectListService {

    constructor(private _commonService: CommonService, private _http: HttpClient) {}

    fetchMyAwards(param: UserProjectFetchRO): Observable<object> {
        return this._http.post(`${this._commonService.baseUrl}/project/fetchMyAwards`, param);
    }

    fetchMyProposals(param: UserProjectFetchRO): Observable<object> {
        const PROPOSAL_FETCH_RO: UserProposalFetchRO = {
            currentPage: param.currentPage,
            searchKeyword: param.searchWord,
            isUnlimited: param.currentPage === null,
            pageNumber: param.paginationLimit
        }
        return this._http.post(`${this._commonService.baseUrl}/project/fetchMyProposals`, PROPOSAL_FETCH_RO);
    }

}
