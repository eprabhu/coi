import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class SponsorMaintenanceService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    endpointSearchOptions: any = {
        contextField: '',
        formatString: '',
        path : '',
        defaultValue : ''
    };
    getSponsorData(selectedSponsor) {
        return this._http.post(this._commonService.baseUrl + '/maintainSponsor', {'sponsorCode': selectedSponsor});
    }
    getNewSponsorData() {
        return this._http.post(this._commonService.baseUrl + '/createNewSponsor', {});
    }
    maintainSponsorData(sponsor) {
        return this._http.post(this._commonService.baseUrl + '/saveSponsor', sponsor);
    }
    fetchSponsorData(params) {
        return this._http.post(this._commonService.baseUrl + '/getAllSponsors ', params);
    }
    getCountryLookUp() {
        return this._http.get(this._commonService.baseUrl + '/getCountryLookUp');
    }

}

export function setCompleterOptions(countrySearchOptions, countries) {
    countrySearchOptions.defaultValue = '';
    countrySearchOptions.arrayList = countries;
    countrySearchOptions.contextField = 'countryCode - countryName';
    countrySearchOptions.filterFields = ['countryCode', 'countryName'];
    countrySearchOptions.formatString = 'countryCode - countryName';
    return countrySearchOptions;
  }
