import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { EvaluationService } from './evaluation.service';
import { GrantCommonDataService } from '../services/grant-common-data.service';
import { GrantCallService } from '../services/grant.service';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit, OnDestroy {

  @Input() result: any = {};
  isCollapsed = [];
  workflowMapDetail: any = [];
  workflowMapsList: any = [];
  savedData: any = [];
  grantCallId: any;
  workFlow = null;
  personDetail: any = {};
  clearFields: string;
  panelSelectedList = [];
  mainPanel: false;
  isTwoStageEvaluation = false;
  isDisable = false;
  warningMessage = new Map();
  $subscriptions: Subscription[] = [];
  isModifyOrPublishGrantCall = false;
  evaluationPanelList: any=[];
  evaluationPanelId:any;
  deleteIndex:any;
  

  constructor(private _grantService: GrantCallService, public _commonService: CommonService,
     private _evaluationService: EvaluationService, public _commonData: GrantCommonDataService) { }

  ngOnInit() {
    this.getGrantCallGeneralData();
    this.twoStateEvaluationCheck();
    this.$subscriptions.push(this._grantService.fetchAllEvaluationPanels({ 'grantCallId': parseInt(this.grantCallId, 10), 'mapType': 'E' })
    .subscribe((data: any) => {
        this.workflowMapsList = data.workflowMaps;
        this.workflowMapDetail = data.grantCallEvaluationPanels;
        if (this.workflowMapDetail.find(result => result.isMainPanel === 'Y')) {
          this.isDisable = true;
        }
      }));
  }

  getGrantCallGeneralData() {
    this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.grantCallId = this.result.grantCall.grantCallId;
        this.setModifyOrPublishGrantCall();
      }
    }));
  }

  setModifyOrPublishGrantCall() {
    this.isModifyOrPublishGrantCall = this.result.availableRights.includes('PUBLISH_GRANT_CALL') ||
    this.result.availableRights.includes('MODIFY_GRANT_CALL');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /* data preparation */
  setEvaluationPanel() {
    this.personDetail.mapId = this.workFlow.mapId;
    this.personDetail.grantCallId = this.grantCallId;
    this.personDetail.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.personDetail.updateTimeStamp = new Date().getTime();
    if (!this.personDetail.isMainPanel) {
      this.personDetail.isMainPanel = 'N';
    }
    this.personDetail.workflowMap = this.workFlow;
    this.workflowMapDetail.push(JSON.parse(JSON.stringify(this.personDetail)));
  }

  /* function to set when main panel is deselected */
  toggleFalse(index) {
    this.isDisable = false;
    this.workflowMapDetail[index].isMainPanel = 'N';
    this.submitPannel(this.workflowMapDetail[index].isMainPanel);
  }

  /* function to set when main panel is selected */
  toggleTrue(index) {
    this.isDisable = true;
    this.workflowMapDetail[index].isMainPanel = 'Y';
    this.submitPannel(this.workflowMapDetail[index].isMainPanel);
  }

  /* function to add a Evaluation panel */

  addPannel() {
    if (this.workFlow != null) {
      this.getWorkFlowMapDetails();
      this.warningMessage.clear();
    } else {
      this.validateEvaluationPanel();
    }
    this.workFlow = null;
  }

  /** shows a warning message if user clicks 'Add' button without selecting a panel */
  validateEvaluationPanel() {
    if (!this.workFlow || this.workflowMapDetail.length === 0) {
      this.warningMessage.set('evaluationWarningText', 'Please select an Evaluation Panel.');
    }
  }

  getWorkFlowMapDetails() {
    if (this.workflowMapDetail.length > 0) {
      this.fetchevaluationpanellists();
    } else {
      this.setEvaluationPanel();
      this.submitPannel(null);
    }
  }

  fetchevaluationpanellists() {
    let isFound = false;
    if (this.checkForDuplicateList()) {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'This Evaluation Panel already added.');
      isFound = true;
    }
    if (!isFound) {
      this.setEvaluationPanel();
      this.submitPannel(null);
    }
  }

  /** Returns true if the first duplicate element found.*/
  checkForDuplicateList() {
    return !!this.workflowMapDetail.find(element => element.mapId === this.workFlow.mapId);
  }

  /** function to check grant call type for type code 4&8 needs to set main panel
    *4-Internal Two stage
    *8-External Two stage
  */
  twoStateEvaluationCheck() {
    this.isTwoStageEvaluation = [4, 8].includes(this.result.grantCall.grantCallType.grantTypeCode);
  }

  /** Submit panel after final selection */
  submitPannel(toastCondition) {
    this.$subscriptions.push(this._evaluationService.saveOrUpdateEvaluationPanel({ 'grantCallEvaluationPanels': this.workflowMapDetail })
      .subscribe((data: any) => {
        this.workflowMapDetail = data.grantCallEvaluationPanels;
        !toastCondition ?
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Evaluation Panel saved successfully.') :
          this.showMainPanelSelectedToast(toastCondition);
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Evaluation Panel failed. Please try again.');
      }));
  }

  showMainPanelSelectedToast(toastCondition) {
    this._commonService.showToast(HTTP_SUCCESS_STATUS,toastCondition === 'Y' ?
        'Evaluation Panel is selected as Main Panel and saved successfully.' :
        'Evaluation Panel is deselected as Main Panel and saved successfully.');
  }
  /**
   * @param  {} evaluationList
   * @param index
   * to delete evaluation panel
   */

   setEvaluationDeleteObject(evaluationList, index) {
    this.evaluationPanelList=evaluationList;
    this.evaluationPanelId = { 'grantCallEvaluationPanelId': evaluationList.grantCallEvaluationPanelId }
    this.deleteIndex = index;  
  }
  deleteEvaluation() {    
    this.$subscriptions.push(this._grantService.deleteEvaluationPanel(this.evaluationPanelId).subscribe((data: any) => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Evaluation Panel deleted successfully.');
      if (this.workflowMapDetail[this.deleteIndex].isMainPanel === 'Y') {
        this.isDisable = false;
      }
      this.workflowMapDetail.splice(this.workflowMapDetail.indexOf(this.evaluationPanelList), 1);      
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Evaluation Panel failed. Please try again.');
    }));
  }
}
