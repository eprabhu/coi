// Last updated by Ramlekshmy on 15-01-2020

import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { OverviewService } from '../overview/overview.service';
import { CommonDataService } from '../services/common-data.service';
import { Subscription } from 'rxjs';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, AWARD_LABEL } from '../../app-constants';
import { getCurrentTimeStamp, getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';
import { AwardDetailsEditComponent } from './award-details/award-details-edit/award-details-edit.component';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { AwardService } from '../services/award.service';

declare var $: any;

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

  result: any = {
    award: '',
  };
  awardInfo: any = {};
  award: any = {
    accountNumber: null,
    awardSequenceStatus: '',
    leadUnitNumber: null,
    sponsorCode: null,
    primeSponsorCode: null,
    createUser: '',
    createTimestamp: '',
    title: '',
    awardStatus: {
      description: '',
      statusCode: ''
    },
    awardTypeCode: '',
    activityTypeCode: '',
    accountTypeCode: '',
    statusCode: '',
    awardEffectiveDate: '',
    finalExpirationDate: '',
    beginDate: '',
    updateTimeStamp: '',
    updateUser: ''
  };
  keywords: any = [];
  awardId: any;
  index: number;
  lookupData: any = {};
  organizationSum = 0;
  map = new Map();
  isKpiEdit = false;
  @ViewChildren(AwardDetailsEditComponent) children: QueryList<AwardDetailsEditComponent>;

  isAwardDetailsEdit = false;
  isIpEdit = false;
  isPersonnalEdit = false;
  isProjectTeamEdit = false;
  isContactsEdit = false;
  isCostShareEdit = false;
  isSubcontractEdit = false;
  isSpecialReviewEdit = false;
  isMilestoneEdit = false;
  isAreaOfResearchEdit = false;
  $subscriptions: Subscription[] = [];
  helpText: any = {};
  isSaving = false;
  tempGrantHeaderId: any;

  constructor(private _activatedRoute: ActivatedRoute,
    private _router: Router, private _awardService: AwardService,
    private _overviewService: OverviewService, private _elasticConfig: ElasticConfigService,
    public _commonData: CommonDataService, public _commonService: CommonService) { }

  ngOnInit() {
    this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
    this.getAwardLookupData();
    this.getAwardGeneralData();
    this.fetchHelpText();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAwardLookupData() {
    this.$subscriptions.push(this._overviewService.getLookupData({
      'awardId': this.awardId, 'personId': this._commonService.getCurrentUserDetail('personID'),
      'leadUnitNumber': this._commonService.getCurrentUserDetail('unitNumber')
    }).subscribe((data: any) => {
      this.lookupData = data;
    }));
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.tempGrantHeaderId = data.award.grantHeaderId;
        this.getSectionEditableList();
        this.initialValueAssign();
        this.updateDateValues();
      }
    }));
  }

  /**
   * Fetches help text for Award Section Codes 113 - Special Review, 125 - Area of Research, 104 -key persons
   */
  fetchHelpText() {
    this.$subscriptions.push(this._awardService.fetchHelpText({
      'moduleCode': 1, 'sectionCodes': [113, 125, 104]
    }).subscribe((data: any) => {
      this.helpText = data;
    }));
  }

  /**
  * the common data will not call api every time since its written in common data constructor.
  * which resolves the reload issue from other tabs
  * to avoid multiple service calls we only do when the data is not available in common data store refer common-data.service.ts
  * the whole result is store to keep the data same after save sine save only return overview data.
  * also the data store is updated with the api result :)
  */
  getAwardOverviewData(awardId) {
    this.$subscriptions.push(this._overviewService.getAwardGeneralData({
      'awardId': awardId
    }).subscribe((data: any) => {
      if (data) {
        this.result = data;
        this.awardId = this.result.award.awardId;
        this._commonData.departmentLevelRights = this.result.availableRights;
        this.result = JSON.parse(JSON.stringify(this.result));
        this._commonData.setAwardData(this.result);
        this.updateDateValues();
        this._awardService.isAvailableRights.next(true);
      }
    }));
  }

  /**
   * returns editable permission w.r.t section code
   */
  getSectionEditableList() {
    this.isIpEdit = this._commonData.getSectionEditableFlag('117'); // ip
    this.isAwardDetailsEdit = this._commonData.getSectionEditableFlag('101'); // award details
    this.isPersonnalEdit = this._commonData.getSectionEditableFlag('104'); // key person
    this.isProjectTeamEdit = this._commonData.getSectionEditableFlag('105'); // project team
    this.isContactsEdit = this._commonData.getSectionEditableFlag('106'); // contacts
    this.isSpecialReviewEdit = this._commonData.getSectionEditableFlag('113'); // special review
    this.isSubcontractEdit = this._commonData.getSectionEditableFlag('112'); // subcontract
    this.isCostShareEdit = this._commonData.getSectionEditableFlag('111'); // cost share
    this.isKpiEdit = this._commonData.getSectionEditableFlag('122'); // kpi
    this.isMilestoneEdit = this._commonData.getSectionEditableFlag('123'); // milestone
    this.isAreaOfResearchEdit = this._commonData.getSectionEditableFlag('125'); // Area Of Research
  }

  initialValueAssign() {
    if (this.result.award) {
      this.award = this.result.award;
      this._commonData.awardTitle.title = this.result.award.title;
    }
  }

  updateDateValues() {
    if (this.isAwardDetailsEdit) {
      this.award.beginDate = getDateObjectFromTimeStamp(this._commonData.beginDate);
      if (this.award.finalExpirationDate) {
        this.award.finalExpirationDate = getDateObjectFromTimeStamp(this._commonData.finalExpirationDate);
      }
      if (this.award.awardEffectiveDate) {
        this.award.awardEffectiveDate = getDateObjectFromTimeStamp(this._commonData.awardEffectiveDate);
      }
    }
  }
  /**
   * @param  {} isChanged
   * this function sets isAwardDataChange flag to true or false w.r.t isChanged
   * If true canDeactivate guard stops routing and if false canDeactivate guard give access for routing
   */
  setAwardDataChangeStatus(status) {
    this._commonData.isAwardDataChange = status;
  }

  saveAward(awardDetails) {
    if (!this.isSaving) {
      this.isSaving = true;
      this.award = (awardDetails.award) ? awardDetails.award : this.award;
      this.award.updateTimeStamp = getCurrentTimeStamp();
      this.award.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.award.awardSequenceStatus = 'PENDING';
      if (!this.awardId) {
        this.award.createUser = this._commonService.getCurrentUserDetail('userName');
        this.award.createTimestamp = getCurrentTimeStamp();
        this.award.workflowAwardStatusCode = this.lookupData.awardWorkflowStatus.workflowAwardStatusCode;
        this.award.awardWorkflowStatus = this.lookupData.awardWorkflowStatus;
      }
      this.$subscriptions.push(this._overviewService.saveAward({
        'award': this.award,
        'isNonEmployee': awardDetails.nonEmployee,
        'isGrantCallChanged': this.checkGrantCallChangedOrNot(awardDetails.award)
      }).subscribe(
        (data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, `${AWARD_LABEL} saved successfully.`);
          this.setTemporaryDateValues(data);
          this.result.canEnableMilestoneStatus = data.canEnableMilestoneStatus;
          this.setupAwardStoreData(data);
          this.setAwardDataChangeStatus(false);
          this.triggerReportExistPopUp(data);
          this._awardService.isAvailableRights.next(true);
          this._router.navigate(['fibi/award/overview'], { queryParams: { awardId: data.award.awardId } });
          this.awardId = !this.awardId ? data.award.awardId : this.awardId; // setting awardId after initial save
          this.isSaving = false;
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, `Saving ${AWARD_LABEL} failed as another transaction is being processed in current ${AWARD_LABEL.toLowerCase()}. Please click submit again.`);
          this.isSaving = false;
        }));
    }
  }

  checkGrantCallChangedOrNot(award) {
    return this.tempGrantHeaderId !== award.grantHeaderId;
  }

  triggerReportExistPopUp(data) {
    if (data.isReportTermsExist) {
      $('#modal-report-term-exist-trigger').modal('show');
    } else if(!data.isReportTermsExist && data.isGrantCallChanged) {
     this.updateReportTermsInAward(false);
    }
  }

  updateReportTermsInAward(showToast = true) {
    this.$subscriptions.push(this._overviewService.updateReportTermsInAward({
      'award': this.result.award,
    }).subscribe((data: any) => {
      if (showToast) {
        if(data.status) {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reporting Requirements and Terms updated successfully.');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, `Updating Reporting Requirements and Terms failed. Please try again.`);
        }
      }
    }));
  }

  setTemporaryDateValues(data) {
    this._commonData.beginDate = data.award && data.award.beginDate;
    this._commonData.finalExpirationDate = data.award && data.award.finalExpirationDate;
    this._commonData.awardEffectiveDate = data.award && data.award.awardEffectiveDate;
  }

  setupAwardStoreData(data) {
    this.result.award = data.award;
    if (!this.awardId) {
      this.result.awardPersons = data.awardPersons;
    }
    this.result.kpiTypes = data.kpiTypes;
    this.result.awardKpis = data.awardKpis;
    this.result.awardMileStones = data.awardMileStones;
    this.result.availableRights = data.availableRights;
    this.result.isGenerateWBSNumber = data.isGenerateWBSNumber;
    this._commonData.departmentLevelRights = this.result.availableRights;
    this.updateAwardStoreData();
  }

  updateAwardStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setAwardData(this.result);
  }

  setAwardDetails(event) {
    this.getAwardOverviewData(event.award.awardId);
    this._router.navigate(['fibi/award/overview'], { queryParams: { awardId: event.award.awardId } });
  }
}
