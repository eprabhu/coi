/** Last updated by Aravind  on 18-11-2019 */

import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OverviewService } from '../../../overview/overview.service';
import { CommonDataService } from '../../../services/common-data.service';
import { OverviewComponent } from '../../../overview/overview.component';
import { CommonService } from '../../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { AwardService } from '../../../services/award.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import {concatUnitNumberAndUnitName} from '../../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-institute-proposal-edit',
  templateUrl: './institute-proposal-edit.component.html',
  styleUrls: ['./institute-proposal-edit.component.css']
})
export class InstituteProposalEditComponent implements OnInit, OnChanges, OnDestroy {
  elasticSearchProposalOptions: any = {};
  currentProposal: any = {};
  savedProposals: any = {
    proposal: {}
  };
  savedProposalsList: any = [];
  awrdFundingProposals: any;
  currency;
  clearField: String;
  awardId: any;
  warningMsgObj: any = {};
  leadUnitSearchOptions: any;
  sponsorSearchOptions: any;
  isShowCollapse = true;
  @Input() result: any = {};
  @Output() awardResults: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(OverviewComponent, { static: false }) awardInfo: OverviewComponent;
  isIPCard = false;
  isIPLinked: boolean;
  selectedFundingProposalObj: any;
  deleteIndex;
  isHighlighted = false;
  $subscriptions: Subscription[] = [];
  isSaving = false;
  homeUnitNumber: any;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  canIpLinked = true;
  linkIpValidationText = '';

  constructor(private _activatedRoute: ActivatedRoute, private _commonService: CommonService,
    private _commonData: CommonDataService, private _overviewService: OverviewService, private _elasticConfig: ElasticConfigService) { }

  ngOnInit() {
    this.setElasticProposalOption();
    this.savedProposalsList.length === 0 ? this.isIPLinked = false : this.isIPLinked = true;
    if (this._activatedRoute.snapshot.queryParamMap.get('instituteProposalId')) {
      this.setInstituteProposal();
    }
  }
  ngOnChanges() {
    if (this.result.awardFundingProposals) {
      this.savedProposalsList = this.result.awardFundingProposals;
      this.savedProposalsList.length === 0 ? this.isIPLinked = false : this.isIPLinked = true;
      this.isHighlighted = this._commonData.checkSectionHightlightPermission('117');
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
  * Set Elastic search option for Institute proposal
  */
  setElasticProposalOption() {
    this.elasticSearchProposalOptions = this._elasticConfig.getElasticForIP();
    this.elasticSearchProposalOptions.fontSize = '1rem';
  }

  /**
   * @param  {} event
   * To retrieve id, full name, email and phone from elastic search result and assign to contacts object
   */
  selectProposal(event) {
    this.currentProposal.proposalId = event.proposal_id;
    this.savedProposals.proposal.proposalNumber = event.proposal_number;
    this.savedProposals.proposal.title = event.title;
    this.savedProposals.proposal.homeUnitName = event.lead_unit_name;
    this.homeUnitNumber = event.lead_unit_number;
    this.savedProposals.proposal.sponsorName = event.sponsor;
    this.savedProposals.proposal.status = event.status;
    this.warningMsgObj.proposalWarningText = null;
  }

  /**
   * Link institute proposal to an award.
   */
  setInstituteProposal() {
    if (!this.isSaving) {
      this.isSaving = true;
      if (this.currentProposal.proposalId || this._activatedRoute.snapshot.queryParamMap.get('instituteProposalId')) {
        this.warningMsgObj.proposalWarningText = null;
        let proposalObject: any = {};
        this.currentProposal.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.currentProposal.awardFundingProposalId = null;
        this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
        if (this.awardId) {
          this.currentProposal.awardId = this.awardId;
          proposalObject = this.savedProposalsList.find(element => element.proposalId.toString() === this.currentProposal.proposalId);
          if (!proposalObject) {
            this.maintainInstituteProposal(true);
          } else {
            this.warningMsgObj.proposalWarningText = 'Institute Proposal already linked. Please use a different Institute Proposal.';
            this.isSaving = false;
          }
        } else {
          if (this._activatedRoute.snapshot.queryParamMap.get('instituteProposalId')) {
            this.currentProposal.proposalId = this._activatedRoute.snapshot.queryParamMap.get('instituteProposalId');
          }
          this.maintainInstituteProposal(false);
        }
      }
      this.clearField = new String('true');
    }
  }
  /**
   * @param  {boolean} isNewAward true when new award is created
   * Service call for linking IP
   */
  maintainInstituteProposal(isNewAward: boolean): void {
    const requestObject: any = {
      'awardFundingProposal': this.currentProposal, 'acType': 'I'
    };
    if (isNewAward) {requestObject.updateUser = this._commonService.getCurrentUserDetail('userName'); }
    this.$subscriptions.push(this._overviewService.maintainInstituteProposal(requestObject).subscribe((data: any) => {
      this.savedProposals = data.awardFundingProposal;
      this.savedProposalsList.push(Object.assign({}, this.savedProposals));
      this.savedProposalsList.length === 0 ? this.isIPLinked = false : this.isIPLinked = true;
      this.currentProposal = {};
      this.isIPCard = false;
      this.warningMsgObj.proposalWarningText = null;
      isNewAward ? this.setupAwardStoreData(this.savedProposalsList) : this.setAwardDetails(data);
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Institute Proposal linked successfully.');
      this.isSaving = false;
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Unable to link Institute Proposal.');
      this.isSaving = false;
    }));
  }

  setAwardDetails(data: any): void {
    if (data.award) {
      this.result = Object.assign({}, data);
      this.savedProposals = { proposal: {} };
      this.currentProposal = {};
      this.setTemporaryDateValues();
      this.awardResults.emit(this.result);
    }
  }

  setTemporaryDateValues() {
    this._commonData.beginDate = this.result.award && this.result.award.beginDate;
    this._commonData.finalExpirationDate = this.result.award && this.result.award.finalExpirationDate;
    this._commonData.awardEffectiveDate = this.result.award && this.result.award.awardEffectiveDate;
  }

  deleteInstituteProposal(deleteindex) {
    const REQUESTINSTITUTEPROPOSAL: any = {};
    REQUESTINSTITUTEPROPOSAL.awardFundingProposalId = this.selectedFundingProposalObj.awardFundingProposalId;
    REQUESTINSTITUTEPROPOSAL.proposalId = this.selectedFundingProposalObj.proposalId;
    this.savedProposalsList.splice(deleteindex, 1);
    this.$subscriptions.push(this._overviewService.maintainInstituteProposal({
      'awardFundingProposal': REQUESTINSTITUTEPROPOSAL, 'acType': 'D',
      'awardId': this._activatedRoute.snapshot.queryParamMap.get('awardId'),
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    })
      .subscribe((data: any) => {
        this.savedProposalsList.length === 0 ? this.isIPLinked = false : this.isIPLinked = true;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
        this.elasticSearchProposalOptions.defaultValue = '';
        this.clearField = new String('true');
        this.setupAwardStoreData(this.savedProposalsList);
      },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Award Funding proposal failed. Please try again.');
      }));
  }

  linkAnotherIP() {
    this.isIPLinked = false;
    this.elasticSearchProposalOptions.defaultValue = '';
    this.clearField = new String('true');
  }

  /**
   * @param  {} data
   * setup award common data the values that changed after the service call need to be updatedinto the store.
   * every service call wont have all the all the details as reponse so
   * we need to cherry pick the changes and update them to the store.
   */
  setupAwardStoreData(data) {
    this.result.awardFundingProposals = data;
    this.updateAwardStoreData();
  }
  updateAwardStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setAwardData(this.result);
  }
  checkIpCanLinked(event) {
    if (event !== null) {
      this.isIPCard = true;
      this.$subscriptions.push(this._overviewService.canLinkInstituteProposal(event.proposal_id)
      .subscribe((data: any) => {
        this.canIpLinked = data.status;
        this.linkIpValidationText = data.message;
        this.selectProposal(event);
      }, err => {
        this.canIpLinked = false;
      }));
    } else {
      this.savedProposals = { proposal: {} };
      this.isIPCard = false;
      this.canIpLinked = true;
    }
  }
}
