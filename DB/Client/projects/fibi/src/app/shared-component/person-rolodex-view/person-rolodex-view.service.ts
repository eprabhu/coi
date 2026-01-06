import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable({
	providedIn: 'root'
})
export class PersonRolodexViewService {

	constructor(private _http: HttpClient, private _commonService: CommonService) { }

	getPersonData(personId) {
		return this._http.post(this._commonService.baseUrl + '/getPersonDetailById', { 'personId': personId });
	}

	getRolodexData(rolodexId) {
		return this._http.post(this._commonService.baseUrl + '/getRolodexDetailById', { 'rolodexId': rolodexId });
	}

	loadPersonTrainingList(params) {
		return this._http.post(this._commonService.baseUrl + '/getTrainingDashboard', params);
	}

	getDegreeType() {
		return this._http.get(this._commonService.baseUrl + '/getDegreeType');
	}

	addDegree(params) {
		return this._http.post(this._commonService.baseUrl + '/addProposalPersonDegree', {'proposalPersonDegree': params});
	}

	getPersonDegree(proposalPersonId) {
		return this._http.post(this._commonService.baseUrl + '/getPersonDegree', { 'proposalPersonId': proposalPersonId });
	}

	deleteDegree(proposalPersonDegreeId: number) {
		return this._http.delete(`${this._commonService.baseUrl}/deleteProposalPersonDegree/${proposalPersonDegreeId}`);
	}
	
	getPersonInformation(personId) {
		return this._http.post(this._commonService.baseUrl + '/getPersonPrimaryInformation', {'personId': personId});
	}
}
