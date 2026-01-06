import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { UpdateCertificateRO } from '../interface/proposal.interface';

@Injectable()
export class CertificationService {

    constructor(private _http: HttpClient, public _commonService: CommonService) {
    }

    getProposalPersonsForCertification(params: any) {
        return this._http.post(this._commonService.baseUrl + '/proposalPersonsForCertification', params);
    }

    updateProposalPersonCertification(params: UpdateCertificateRO) {
        return this._http.patch(`${this._commonService.baseUrl}/updateProposalPersonCertification`, params);
    }
}


