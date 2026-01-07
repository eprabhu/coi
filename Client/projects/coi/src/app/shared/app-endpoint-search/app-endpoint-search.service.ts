import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppEndpointSearchService {
  endpointUrl: any;
  constructor(private _commonService: CommonService, private _http: HttpClient) { }

  endpointSearch(servicePath, searchString, params) {
    const searchParams: any = {};
    searchParams.searchString = searchString;

    this.endpointUrl = servicePath;
    if (params) {
      Object.keys(params).forEach(key => {
        searchParams[key] = params[key];
      });
    }
    return this._http.post(this.endpointUrl, searchParams);
  }
}
