import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class PersonMaintenanceService {

  isPersonEditOrView = false;
  isPersonEdit = false;
  personDisplayCard: any;

  constructor(private _http: HttpClient, private _commonService: CommonService) { }
  fetchPersons(searchString) {
    return this._http.get(this._commonService.baseUrl + '/findPersons' + '?searchString=' + searchString);
  }
  getPersonData(personId) {
    return this._http.post(this._commonService.baseUrl + '/getPersonDetailById', { 'personId': personId });
  }
  maintainPersonData(sponsor) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdatePerson', sponsor);
  }
  getPersonList(params) {
    return this._http.post(this._commonService.baseUrl + '/getAllPersons', params);
  }
  fetchKeyUnit(searchString) {
    return this._http.post(this._commonService.baseUrl + '/findDepartment', {'searchString' : searchString});
  }
  getTrainingList(personId) {
    return this._http.post(this._commonService.baseUrl + '/getAllTrainings', { 'personId': personId });
  }
  getDelegationData(personId) {
    return this._http.get(this._commonService.baseUrl + '/loadDelegationByPersonId', {
       headers: new HttpHeaders().set( 'personId', personId.toString())});
  }
    saveOrUpdateDeligation(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateDeligation', params);
  }
  updateDeligationStatus(params) {
    return this._http.post(this._commonService.baseUrl + '/updateDeligationStatus', params);
  }
  getActiveAwardsByPersonId(params) {
    return this._http.post(this._commonService.baseUrl + '/loadAwardTimesheetByPersonId', params);
  }
  getAwardKeyPersonTimesheetDetails(person) {
    return this._http.post(this._commonService.baseUrl + '/getAwardKeyPersonTimesheetDetails', person);
  }

  saveOrUpdateAwardKeyPersonTimesheet(person) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAwardKeyPersonTimesheet', person);
  }
  generateAwardKeyPersonTimesheetReport(params) {
    return this._http.post(this._commonService.baseUrl + '/generateAwardKeyPersonTimesheetReport', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  getCountryLookUp() {
    return this._http.get(this._commonService.baseUrl + '/getCountryLookUp');
  }

  getDegreeType() {
    return this._http.get(this._commonService.baseUrl + '/getDegreeType');
  }

  getAllPersonDegrees(person) {
    return this._http.post(this._commonService.baseUrl + '/getAllPersonDegree', { 'personId': person });
  }

  saveOrUpdatePersonDegree(params) {
    return this._http.post(this._commonService.baseUrl + '/savePersonDegree', params);
  }

  deletePersonDegree(id) {
    return this._http.delete(this._commonService.baseUrl + `/deletePersonDegree/${id}`);
  }

  getPersonInformation(personId: number) {
		return this._http.post(this._commonService.baseUrl + '/getPersonPrimaryInformation', {personId});
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
