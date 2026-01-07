import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ReviewService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

  createPreReview( params ) {
    return this._http.post( this._commonService.baseUrl + '/createPreReview', params );
  }

  loadPreReviews( params ) {
    return this._http.post( this._commonService.baseUrl + '/loadPreReviews', params );
  }

  downloadPreReviewAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadPreReviewAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

  addPreReviewComment( formData ) {
    return this._http.post( this._commonService.baseUrl + '/addPreReviewComment', formData );
  }

  approveOrDisapprovePreReview( formData ) {
    return this._http.post( this._commonService.baseUrl + '/approveOrDisapprovePreReview', formData );
  }

  sortReviewerFields(params) {
    return this._http.post( this._commonService.baseUrl + '/fetchSortedReviews', params );
  }

}
