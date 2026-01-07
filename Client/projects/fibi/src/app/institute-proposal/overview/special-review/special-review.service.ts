import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class SpecialReviewService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  saveOrUpdateSpecialReview(data) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateIPSpecialReview', data);
  }

  deleteSpecialReview(proposalId, reviewId) {
    return this._http.delete(`${this._commonService.baseUrl}/deleteIPSpecialReview/${proposalId}/${reviewId}`);
  }
}
