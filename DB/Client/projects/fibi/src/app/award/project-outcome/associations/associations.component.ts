import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { ProjectOutcomeService } from '../project-outcome.service';
import { CommonService } from '../../../common/services/common.service';
import { CurrencyParserService } from '../../../common/services/currency-parser.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { AWARD_LABEL, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { getEndPointOptionsForSponsor, getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { CommonDataService } from '../../services/common-data.service';

@Component({
  selector: 'app-associations',
  templateUrl: './associations.component.html',
  styleUrls: ['./associations.component.css']
})
export class AssociationsComponent implements OnInit, OnDestroy {

  elasticSearchOptions: any = {};
  tempAssociationType = '';
  associationObject: any;
  isProposal = false;
  isAward = false;
  associationList: any = [];
  awardAssociation: any = {};
  awardAssociationId;
  deleteIndex: number;
  clearField: String;
  associationLinkWarningMsg = null;
  isErrorAward = false;
  $subscriptions: Subscription[] = [];
  isAssociationEdit = false;
  awardOutcomeMap = new Map();
  isClear: any = {};
  sponsorHttpOptions: any = {};
  awardHttpOptions: any = {};
  proposalHttpOptions: any = {};
  primeSponsorHttpOptions: any = {};
  leadUnitSearchOptions: any = {};
  elasticSearchOptionsPerson: any = {};
  isOutcomeEmployee = true;
  isShowExternalAssociationDetails = false;
  awardAssociationDetail: any = {};
  temporaryAssociationDetails: any = {};
  isAwardOutcomeAssociationEdit = false;
  editAssociationIndex: any;
  duplicateAssociationMsg: string;
  currency: any;
  isSaving = false;

  constructor(private _elasticConfig: ElasticConfigService, public _outComeService: ProjectOutcomeService,
    private _commonService: CommonService, public currencyFormatter: CurrencyParserService, 
    private _commonData: CommonDataService) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
    if (this._outComeService.outcomesData.awardAssociations) {
      this.associationList = this._outComeService.outcomesData.awardAssociations;
      this.sortAssociations();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param  {} tempAssociationType
   * Select accociation type and trigger elastic search w.r.t selected dropdown
   */
  onAssociationTypeSelect(tempAssociationType) {
    this.duplicateAssociationMsg = null;
    this.awardAssociation = {};
    this.awardAssociationDetail = {};
    this.isAwardOutcomeAssociationEdit = false;
    this.isOutcomeEmployee = true;
    this.awardOutcomeMap.clear();
    this.setAwardPersonType();
    this._outComeService.outcomesData.associationTypes.forEach(element => {
      if (element.associationTypeCode === tempAssociationType) {
        this.awardAssociation.awardAssociationType = element;
      }
    });
    if (tempAssociationType === '1') {
      this.awardHttpOptions = this.setAwardorProposalObjects();
      this.awardHttpOptions.params = {
        'moduleCode': 1, 'awardId': this._outComeService.awardData.awardId,
        'awardNumber': this._outComeService.awardData.awardNumber
      };
      this.isProposal = false;
    } else if (tempAssociationType === '2') {
      this.proposalHttpOptions = this.setAwardorProposalObjects();
      this.proposalHttpOptions.params = {
        'moduleCode': 3, 'awardId': this._outComeService.awardData.awardId,
        'awardNumber': this._outComeService.awardData.awardNumber
      };
      this.isAward = false;
    } else if (tempAssociationType === '3') {
      this.isProposal = this.isAward = false;
      this.awardAssociationDetail.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.setAwardPersonType();
      this.setEndpointObjects();
    }
  }
  setAwardorProposalObjects() {
    return this._outComeService.setSearchOptions('title',
      'moduleItemKey | title | piName | sponsorName | moduleStatus', 'getModuleDetails');
  }
  setEndpointObjects() {
    this.sponsorHttpOptions = getEndPointOptionsForSponsor();
    this.primeSponsorHttpOptions = getEndPointOptionsForSponsor();
    this.leadUnitSearchOptions = getEndPointOptionsForDepartment();
  }
  /**
   * @param  {} value
   * @param  {} type
   * select a result from elastic search(for tempAssociationType === '3' )
   * and result from endpoint search( for tempAssociationType === '1' or '2')
   * sets associationObject to award or proposal values with respect to the dropdown value selected
   */
  selectResult(value, type) {
    this._commonData.isAwardDataChange = true;
    this.duplicateAssociationMsg = null;
    if (value) {
      if (type === 'award') {
        this.associationObject = value;
        this.isAward = true;
        this.isProposal = false;
      } else {
        this.associationObject = value;
        this.isAward = false;
        this.isProposal = true;
      }
    } else {
      this.associationObject = null;
      this.isAward = false;
      this.isProposal = false;
    }
  }
  /**
  * save association to the selected award
  */
  linkAssociation(projectId) {
    this.awardOutcomeMap.clear();
    if (this.tempAssociationType === '3' && !this.awardAssociationDetail.title) {
      this.awardOutcomeMap.set('associationTitle', '* Please enter Title');
    }
    if (!this.awardOutcomeMap.size && this.checkDuplication(projectId, this.tempAssociationType) && !this.isSaving) {
      this.isSaving = true;
      this.setAwardCommonDetails(projectId);
      if (this.tempAssociationType === '1' || this.tempAssociationType === '2') {
        this.setAwardAssociationDetails();
      }
      this.awardAssociation.awardAssociationDetail = this.awardAssociationDetail;
      this.$subscriptions.push(this._outComeService.maintainAssociation({
        'awardAssociation': this.awardAssociation,
      }).subscribe((response: any) => {
        this.isAwardOutcomeAssociationEdit ? this.associationList.splice(this.editAssociationIndex, 1, response) :
          this.associationList.push(response);
        this.isAward = false;
        this.isProposal = false;
        this.sortAssociations();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Association linked successfully.');
        this.clearAssociationField();
        this.isSaving = false;
      }, err => {
        this.isSaving = false;
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Linking Association failed. Please try again');
      }));
    }
  }
  /**
   * @param  {} projectId
   * projectId is either AwardId or proposalId to be linked to this award.
   * awardAssociation- object contain all details of linking association
   * awardAssociationDetails is object within awardAssociation
   */
  setAwardCommonDetails(projectId) {
    this.awardAssociation.associatedProjectId = projectId;
    this.awardAssociation.awardId = this._outComeService.awardData.awardId;
    this.awardAssociation.awardNumber = this._outComeService.awardData.awardNumber;
    this.awardAssociation.sequenceNumber = this._outComeService.awardData.sequenceNumber;
    this.awardAssociation.associationTypeCode = this.tempAssociationType;
  }
  setAwardAssociationDetails() {
    this.awardAssociationDetail.title = this.associationObject.title;
    this.awardAssociationDetail.personId = this.associationObject.piPersonId;
    this.awardAssociationDetail.rolodexId = this.associationObject.piRolodexId;
    this.awardAssociationDetail.piName = this.associationObject.piName;
    this.awardAssociationDetail.sponsorCode = this.associationObject.sponsorCode;
    this.awardAssociationDetail.sponsor = this.associationObject.sponsor;
    this.awardAssociationDetail.fundingScheme = this.associationObject.fundingScheme;
    this.awardAssociationDetail.statusDescription = this.associationObject.moduleStatus;
    this.awardAssociationDetail.totalProjectCost = this.associationObject.totalProjectValue;
    this.awardAssociationDetail.fundingSchemeCode = this.associationObject.fundingSchemeCode;
  }
  checkDuplication(projectId, tempAssociationType) {
    let isMultiple = false;
    if (tempAssociationType !== '3') {
      isMultiple = this.associationList.find(el => el.associatedProjectId == projectId);
    } else {
      isMultiple = this.externalDuplicateCheck();
    }
    if (isMultiple) {
      this.duplicateAssociationMsg = `*The following project is already associated with this ${AWARD_LABEL.toLowerCase()}`;
      return false;
    } else {
      this.duplicateAssociationMsg = null;
      return true;
    }
  }
  externalDuplicateCheck() {
    const externaList = this.associationList.filter((el, index) => {
      return el.associationTypeCode === '3' && this.editAssociationIndex !== index;
    }).find(value => {
      return (value.awardAssociationDetail.title.trim()) === (this.awardAssociationDetail.title).trim();
    });
    return externaList ? true : false;
  }

  /**
 * @param  {} index
 * @param  {} associationId
 * Delete association w.r.t the publiction id
 */
  deleteAssociation(index, associationId) {
    this.$subscriptions.push(this._outComeService.deleteAssociation({
      'awardAssociationId': associationId
    })
      .subscribe(data => {
        this.associationList.splice(index, 1);
        this.sortAssociations();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Association removed successfully.');
        this.clearAssociationField();
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing association failed. Please try again');
      }));
  }

  /**
  * clear association field for linking another one
  */
  clearAssociationField() {
    this.awardOutcomeMap.clear();
    this.awardAssociationDetail = {};
    this.elasticSearchOptions.defaultValue = this.sponsorHttpOptions.defaultValue =
      this.primeSponsorHttpOptions.defaultValue = this.leadUnitSearchOptions.defaultValue = '';
    this.clearField = new String('true');
    this.tempAssociationType = '';
    this.isAwardOutcomeAssociationEdit = false;
    this.isOutcomeEmployee = true;
    this.setAwardPersonType();
    this._commonData.isAwardDataChange = false;
  }

  /**
   * @param  {} typeCode
   * @param  {} id
   */
  /* opens a new tab of award or proposal details based on id */
  viewAssociation(typeCode, id) {
    const a = document.createElement('a');
    a.href = typeCode === '2' ? '#/fibi/proposal?proposalId=' + id :
      '#/fibi/award?awardId=' + id;
    a.target = '_blank';
    a.click();
  }

  sortAssociations() {
    this.associationList.sort(function (a, b) {
      return b['associationTypeCode'] - a['associationTypeCode'];
    });
  }
  /**
   * @param  {} event
   * Sets the person details to respective object properties on selecting a person from elastic search
   */
  selectPerson(event) {
    this._commonData.isAwardDataChange = true;
    if (this.isOutcomeEmployee) {
      this.awardAssociationDetail.personId = event ? event.prncpl_id : null;
      this.awardAssociationDetail.piName = event ? event.full_name : null;
      this.awardAssociationDetail.rolodexId = null;
    } else {
      this.awardAssociationDetail.personId = null;
      this.awardAssociationDetail.rolodexId = event ? event.rolodex_id : null;
      this.awardAssociationDetail.piName = event ? event.full_name : null;
    }
  }
  /**
    * @param  {} event
    * Sets the details of Sponsor, Prime Sponsor, Department to respective object properties
    * on selecting from end-point search
    */
  setSearchResult(value, type) {
    this._commonData.isAwardDataChange = true;
    if (type === 'unit') {
      this.awardAssociationDetail.unit = {};
      this.awardAssociationDetail.unit.unitName = value ? value.unitName : null;
      this.awardAssociationDetail.unit.unitNumber = value ? value.unitNumber : null;
      this.awardAssociationDetail.leadUnit = value ? value.unitNumber : null;
    } else if (type === 'sponsor') {
      this.awardAssociationDetail.sponsor = {};
      this.awardAssociationDetail.sponsor.sponsorName = value ? value.sponsorName : null;
      this.awardAssociationDetail.sponsor.sponsorCode = value ? value.sponsorCode : null;
      this.awardAssociationDetail.sponsorCode = value ? value.sponsorCode : null;
    } else if (type === 'primesponsor') {
      this.awardAssociationDetail.primeSponsor = {};
      this.awardAssociationDetail.primeSponsor.sponsorName = value ? value.sponsorName : null;
      this.awardAssociationDetail.primeSponsor.sponsorCode = value ? value.sponsorCode : null;
      this.awardAssociationDetail.primeSponsorCode = value ? value.sponsorCode : null;
    }
  }
  /**
   * Sets the elastic person type to employee or non employee as per user selection
   */
  setAwardPersonType() {
    this.elasticSearchOptionsPerson = this.isOutcomeEmployee ?
      this._elasticConfig.getElasticForPerson() : this._elasticConfig.getElasticForRolodex();
  }
  /**
   * Function invoked as part when user try to edit saved external association
   */
  editExternalAssociation() {
    this.clearField = new String('false');
    this.tempAssociationType = '3';
    this.awardAssociation.awardAssociationType = Object.assign({}, this.associationList[this.editAssociationIndex].awardAssociationType);
    this.awardAssociation.awardAssociationId = this.associationList[this.editAssociationIndex].awardAssociationId;
    this.awardAssociationDetail = Object.assign({}, this.associationList[this.editAssociationIndex].awardAssociationDetail);
    this.isOutcomeEmployee = ((this.awardAssociationDetail.personId) ||
      (!this.awardAssociationDetail.personId && !this.awardAssociationDetail.rolodexId)) ? true : false;
    this.setAwardPersonType();
    this.setEndpointObjects();
    this.sponsorHttpOptions.defaultValue = this.awardAssociationDetail.sponsor ?
      this.awardAssociationDetail.sponsorName : null;
    this.primeSponsorHttpOptions.defaultValue = this.awardAssociationDetail.primeSponsor ?
        this.awardAssociationDetail.primeSponsorName : null;
    this.leadUnitSearchOptions.defaultValue = this.awardAssociationDetail.unit ?
      this.awardAssociationDetail.unit.unitName : null;
    this.elasticSearchOptionsPerson.defaultValue = this.awardAssociationDetail.piName;
  }

}
