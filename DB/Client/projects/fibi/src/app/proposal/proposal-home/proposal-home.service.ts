// Last updated by Ramlekshmy on 23-01-2020
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ProposalHomeService {
  endPointSearchOptions: any = {};
  hasProposalOverviewChanged = false;

  constructor( private http: HttpClient, private _commonService: CommonService ) { }

  deleteProposalSpecialReview( params ) {
   return this.http.post( this._commonService.baseUrl + '/deleteProposalSpecialReview', params);
  }

  deleteProposalKeyword( params ) {
    return this.http.post( this._commonService.baseUrl + '/deleteProposalKeyword', params );
  }

  fetchDepartment( searchString) {
    return this.http.get( this._commonService.baseUrl + '/findDepartment' + '?searchString=' + searchString);
  }

  deleteProposalPerson( params ) {
    return this.http.post( this._commonService.baseUrl + '/deleteProposalPerson', params );
  }

  deleteProposalSponsor( params ) {
    return this.http.post( this._commonService.baseUrl + '/deleteProposalSponsor', params );
  }

  fetchProtocol( searchString ) {
    return this.http.get( this._commonService.baseUrl +  '/findProtocol' + '?searchString=' + searchString);
  }

  deleteIrbProtocol( params ) {
    return this.http.post( this._commonService.baseUrl + '/deleteIrbProtocol', params );
  }

  addProposalAttachment( formData ) {
    return this.http.post( this._commonService.baseUrl + '/addProposalAttachment', formData );
  }

  deleteProposalAttachment( params ) {
    return this.http.post( this._commonService.baseUrl + '/deleteProposalAttachment', params );
  }

  downloadProposalAttachment( attachmentId ) {
    return this.http.get( this._commonService.baseUrl + '/downloadProposalAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

   addProjectTeam(person) {
    return this.http.post( this._commonService.baseUrl + '/maintainProjectTeam', {'projectTeam': person} );
  }

  addScienceKeyword(params) {
    return this.http.post( this._commonService.baseUrl + '/addScienceKeyword', params );
  }

  fetchActivityType() {
    return this.http.get( this._commonService.baseUrl + '/getAllActivityForGrantType');
  }

  deleteProposalResearchArea(params) {
    return this.http.post(this._commonService.baseUrl + '/deleteProposalResearchArea', params);
  }

  addProposalPersonAttachment( proposalPersonAttachment, uploadedFile ) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append('files', file, file.name);
    }
    formData.append('formDataJson', JSON.stringify({
      'newPersonAttachments': proposalPersonAttachment, 'userFullName': this._commonService.getCurrentUserDetail('fullName')
    }));
    return this.http.post( this._commonService.baseUrl + '/addProposalPersonAttachment', formData );
  }

  downloadProposalPersonAttachment( attachmentId ) {
    return this.http.get( this._commonService.baseUrl + '/downloadProposalPersonAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

  saveProposalDetails(params) {
    return this.http.post(this._commonService.baseUrl + '/saveProposalDetails', params);
  }

  saveOrRemoveGrantCall(params) {
    return this.http.post(this._commonService.baseUrl + '/unlinkGrantCallFromProposal', params);
  }

  addKeyPerson(params) {
    return this.http.post(this._commonService.baseUrl + '/addKeyPerson', params);
  }

  addSpecialReview(params) {
    return this.http.post(this._commonService.baseUrl + '/addSpecialReview', params);
  }

  addFundingSupport(params) {
    return this.http.post(this._commonService.baseUrl + '/addFundingSupport', params);
  }

  addAreaOfResearch(params) {
    return this.http.post(this._commonService.baseUrl + '/addAreaOfResearch', params);
  }

  saveProposalMoreInfo(params) {
    return this.http.post(this._commonService.baseUrl + '/saveDescriptionOfProposal', params);
  }

  loadGrantById(params) {
    return this.http.post(this._commonService.baseUrl + '/loadGrantCallById', params);
  }

  getRolodexData(rolodexId) {
    return this.http.post(this._commonService.baseUrl + '/getRolodexDetailById', {'rolodexId': rolodexId});
  }

  setEndPointSearchOptions(contextField, formatString, path, defaultValue, param) {
    this.endPointSearchOptions.contextField = contextField;
    this.endPointSearchOptions.formatString = formatString;
    this.endPointSearchOptions.path = path;
    this.endPointSearchOptions.defaultValue = defaultValue;
    this.endPointSearchOptions.params = param;
    return JSON.parse(JSON.stringify(this.endPointSearchOptions));
  }

  saveOrUpdateProposalOrganization(params) {
    return this.http.post(this._commonService.baseUrl + '/saveOrUpdateProposalOrganization', params);
  }

  saveOrUpdateOrganization(params) {
    return this.http.post(this._commonService.baseUrl + '/saveOrUpdateOrganization', params);
  }

  getRolodexDetailById(params) {
    return this.http.post(this._commonService.baseUrl + '/getRolodexDetailById', params);
  }

  deleteProposalOrganization(id: any) {
    return this.http.delete(`${this._commonService.baseUrl}/deleteProposalOrganization/${id}`);
  }

  deleteProposalCongDistrict(id: any) {
    return this.http.delete(`${this._commonService.baseUrl}/deleteProposalCongDistrict/${id}`);
  }

  checkUnitRight(param) {
    return this.http.post(this._commonService.baseUrl + '/checkUnitRight', param );
  }

  loadPersonnelAttachTypes() {
    return this.http.get(this._commonService.baseUrl + '/loadPersonnelAttachTypes');
  }

  loadPersonTrainingList(params) {
    return this.http.post(this._commonService.baseUrl + '/getTrainingDashboard', params);
  }

  getPersonInformation(personId) {
    return this.http.post(this._commonService.baseUrl + '/getPersonPrimaryInformation', { 'personId': personId });
  }

}
