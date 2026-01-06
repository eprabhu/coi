/** last updated by Aravind on 12-11-2019 **/

import { Component, OnInit, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { slideInOut, fadeDown } from '../../common/utilities/animations';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { AWARD_ERR_MESSAGE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fileDownloader } from '../../common/utilities/custom-utilities';

declare var $: any;
@Component({
  selector: 'workflow-engine',
  templateUrl: './workflow-engine.component.html',
  styleUrls: ['./workflow-engine.component.css'],
  animations: [slideInOut, fadeDown]
})
export class WorkflowEngineComponent implements OnInit, OnChanges, OnDestroy {

  @Input() workFlowResult: any = {};
  @Input() workFlowDetailKey: any = {};
  @Output() workFlowResponse: EventEmitter<any> = new EventEmitter<any>();
  @Output() errorEvent: EventEmitter<any> = new EventEmitter<any>();
  workFlowDetails: any;
  workflowDetailsMap: any[];
  resultMapArray: any = [];
  tempMapIndex = null;
  tempIndex = null;
  value: string;
  alternateWidgetOpen = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
  approverWidgetOpen = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
  elasticSearchOptions: any = {};
  elasticPrimarySearchOptions: any = {};
  versionHistorySelected: number;
  selectedAttachmentStop: any = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
  requestObject: any = {};
  uploadedFile = [];
  uploadedFiles = [];
  dataVisibilityObj: any;
  showApproveDisapproveModal: any;
  bypassReviewerRight: boolean;
  warningMsgObj: any = {};
  alternateApprover: any;
  addApproverRight: boolean;
  latestVersion: any;
  alternateApproverObject: any = {};
  clearField: String;
  approverFlag: boolean;
  tempApproverIndex = null;
  tempApproverI = null;
  workflowDetail: any = {};
  tempWorkflowStopList: any;
  isNonEmployee = false;
  tempAlternateI = null;
  tempAlternateIndex = null;
  personId: any;
  scoringCriteriaList: any = [];
  deployUrl = environment.deployUrl;
  isShowEvaluationMap = true;
  $subscriptions: Subscription[] = [];
  stopWidgetOpen: any = [];
  stopMap = new Map();
  sequentialStopObject: any = {};
  primaryClearField: String;
  isPersonCard: any = [];
  sequentialStopPersonObject: any = {};
  alternatePersonApprover: any = {};
  isAlternatePersonCard: any = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
  approverName = null;
  isSaving = false;
  isExpandall = false;
  isViewExpand = false;
  filteredScoringWithComments: any = [];
  workflowStartDate: number;
  workflowEndDate: number;
  workflowCreatedBy: string;
  DEFAULT_STOP_NAME = 'Stop ';
  isEmptyComments = false;


  constructor(private _commonService: CommonService, private _workFlowService: WorkflowEngineService,
    private _elasticConfig: ElasticConfigService) { }

  ngOnInit() {
    this.getPermissions();
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    this.elasticPrimarySearchOptions = this._elasticConfig.getElasticForPerson();
    this.personId = this._commonService.getCurrentUserDetail('personID');
  }
  ngOnChanges() {
    if (this.workFlowResult) {
      if (this.workFlowResult.workflow) {
        this.latestVersion = this.versionHistorySelected = this.workFlowResult.workflow.workflowSequence;
      }
      this.getPermissions();
      this.personId = this._commonService.getCurrentUserDetail('personID');
      this.workFlowDetails = this.workFlowResult[this.workFlowDetailKey];
      this.updateWorkflowStops(this.workFlowResult.workflow);
    }
  }

  /**
   * Included 2 new flags in resultArray.
   * Purpose of isLoginPerson : Users not having right to see evaluation panel but -
   * is a panel member have to see his stop and his comments.this flag determines the login person is able to see his stop.
   * isScoringPanel : used to differentiate between scoring and non scoring panel
   */
  setEvaluationFlags() {
    this.resultMapArray.forEach(element => {
      element = Object.assign(element, this.CheckEvaluationFlags(element.mapNumber));
    });
  }

  /**
   * @param  {} mapNumber
   * If the login person exist in any one of the evaluation panel-
   * then returns a true value. other wise returns a false value.
   * If the panel meber can score then returns true value.
   * otherwise returns a false value.
   */
  CheckEvaluationFlags(mapNumber) {
    let isLoginPerson = false, isScoringPanel = false;
    for (const detailMapIndex of this.workflowDetailsMap) {
      detailMapIndex.forEach(element => {
        if (element.workflowMap.mapType === 'E' && !isLoginPerson &&
          element.mapNumber === mapNumber && element.approverPersonId == this.personId) {
          isLoginPerson = true;
        }
        if (element.workflowMap.mapType === 'E' && !isScoringPanel &&
          element.mapNumber === mapNumber && element.isReviewerCanScore) {
          isScoringPanel = true;
        }
      });
      if (isLoginPerson && isScoringPanel) {
        break;
      }
    }
    return { isLoginPerson, isScoringPanel };
  }

  checkScoringPanel(mapNumber) {
    let isScoringPanel = false;
    for (const detailMapIndex of this.workflowDetailsMap) {
      isScoringPanel = detailMapIndex.find(item =>
        item.workflowMap.mapType === 'E' && item.mapNumber === mapNumber && item.isReviewerCanScore) ? true : false;
      if (isScoringPanel) {
        break;
      }
    }
    return isScoringPanel;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
 * memberTypeChanged - calls elastic search according to member type selected
 * */
  memberTypeChanged() {
    this.clearField = new String('true');
    if (!this.isNonEmployee) {
      this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    } else {
      this.elasticSearchOptions = this._elasticConfig.getElasticForRolodex();
    }
  }

  closeWidget() {
    this.alternateWidgetOpen = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    this.approverWidgetOpen = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    this.stopWidgetOpen = [];
    this.tempAlternateI = null;
    this.tempApproverI = null;
    this.tempAlternateIndex = null;
    this.tempApproverIndex = null;
  }

  /**
   * Updates workflow stops w.r.t map number by creating an map array
   * and separating each workflow list w.r.t map number
   */
  updateWorkflowStops(WORKFLOW) {
    this.tempIndex = null;
    this.tempMapIndex = null;
    this.workflowDetailsMap = [];
    if (WORKFLOW != null) {
      this.resultMapArray = [];
      this.workflowStartDate = WORKFLOW.workflowStartDate;
      this.workflowEndDate = WORKFLOW.workflowEndDate;
      this.workflowCreatedBy = WORKFLOW.workflowCreatedBy;
      const map = new Map();
      let index = 0;
      const KEYS = Object.keys(WORKFLOW.workflowDetailMap);
      while (index < KEYS.length) {
        const workFlowResult = WORKFLOW.workflowDetailMap[KEYS[index]];
        for (const item of workFlowResult) {
          if (!map.has(item.mapNumber)) {
            map.set(item.mapNumber, true);
            this.resultMapArray.push({
              mapNumber: item.mapNumber,
              mapName: item.mapName,
              mapId: item.mapId,
              description: item.mapDescription,
              mapType: item.workflowMap.mapType
            });
          }
          this.stopValue(index, item.mapNumber, item);
        }
        index++;
      }
      for (const KEY in WORKFLOW.workflowDetailMap) {
        if (WORKFLOW.workflowDetailMap[KEY] !== null) {
          const value = WORKFLOW.workflowDetailMap[KEY];
          this.workflowDetailsMap.push(value);
        }
      }
    }
    this.updateWorkflowattachments();
    this.resultMapArray.sort((a, b) => a.mapNumber > b.mapNumber ? 1 : a.mapNumber < b.mapNumber ? -1 : 0);
    this.setEvaluationFlags();
  }

  /**
   * setting up of route log by separating workflow list w.r.t to the
   * workflow version selected
   */
  routeLogVersionChange() {
    const WORKFLOW = this.workFlowResult.workflowList.find(workflow => workflow.workflowSequence.toString() ===
      this.versionHistorySelected.toString());
    this.closeWidget();
    this.updateWorkflowStops(WORKFLOW);
  }

  /**
   * setting up of attachment data from workflow detail map
   *  w.r.t the selected attachment from the dropdown
   */

  updateWorkflowattachments() {
    this.workflowDetailsMap.forEach((value, index) => {
      this.selectedAttachmentStop[index] = [];
      value.forEach((workFlowValue, valueIndex) => {
        if (workFlowValue.workflowAttachments != null && workFlowValue.workflowAttachments.length > 0) {
          this.selectedAttachmentStop[index][valueIndex] = workFlowValue.workflowAttachments[0].fileName;
        }
      });
    });
  }

  /**
   * Get rights for bypass and add alternate approver
   */
  getPermissions() {
    this.bypassReviewerRight = (this.workFlowResult.availableRights &&
      this.workFlowResult.availableRights.find(rights => rights === 'BYPASS_WORKFLOW')) ? true : false;
    this.addApproverRight = (this.workFlowResult.availableRights &&
      this.workFlowResult.availableRights.find(rights => rights === 'ADD_APPROVER_WORKFLOW')) ? true : false;
    this.isShowEvaluationMap = (this.workFlowDetailKey === 'proposal' &&
      this.workFlowResult.availableRights.find(rights => rights === 'VIEW_EVALUATION_ROUTE_LOG')) ? true : false;
  }

  /**
   * @param  {} index
   * @param  {} k
   * returns workflow stop value
   */
  stopValue(index, k, workflow) {
    if (this.tempMapIndex !== k) { this.tempIndex = -1; }
    if (this.tempIndex !== index) {
      this.tempIndex = index;
      this.tempMapIndex = k;
      workflow.stopName = workflow.stopName ? workflow.stopName : this.DEFAULT_STOP_NAME + workflow.approvalStopNumber;
    } else {
      this.tempIndex = index;
      this.tempMapIndex = k;
      workflow.stopName = null;
    }
  }
  /**
   * @param  {} detailMapIndex
   * returns true if selected stop contains waiting for approval or to be submitted else false
   */
    isStopActive(detailMapIndex, mapNumber) {
        let activeList: any = [];
        switch (this.workFlowDetailKey) {
            case 'award': {
                activeList = detailMapIndex.filter(e =>
                    (e.workflowStatus.approveStatusCode === 'W' || e.workflowStatus.approveStatusCode === 'T') &&
                    e.mapNumber === mapNumber &&
                    this.workFlowResult[this.workFlowDetailKey].awardWorkflowStatus.workflowAwardStatusCode === '2'
                );
            } break;
            case 'proposal': {
                activeList = detailMapIndex.filter(e =>
                    (e.workflowStatus.approveStatusCode === 'W' || e.workflowStatus.approveStatusCode === 'T') &&
                    e.mapNumber === mapNumber && (this.workFlowResult[this.workFlowDetailKey].statusCode === 2
                        || this.workFlowResult[this.workFlowDetailKey].statusCode === 8)
                    && this.workFlowResult[this.workFlowDetailKey].documentStatusCode != '2'
                );
            } break;
            case 'task': {
                activeList = detailMapIndex.filter(e =>
                    (e.workflowStatus.approveStatusCode === 'W' || e.workflowStatus.approveStatusCode === 'T') &&
                    e.mapNumber === mapNumber && (this.workFlowResult[this.workFlowDetailKey].taskStatusCode == 3)
                );
            } break;
            case 'claim': {
                activeList = detailMapIndex.filter(e =>
                    (e.workflowStatus.approveStatusCode === 'W' || e.workflowStatus.approveStatusCode === 'T') &&
                    e.mapNumber === mapNumber && (this.workFlowResult[this.workFlowDetailKey].claimStatus.claimStatusCode == 3)
                );
            } break;
            case 'awardProgressReport': {
                activeList = detailMapIndex.filter(e =>
                    (e.workflowStatus.approveStatusCode === 'W' || e.workflowStatus.approveStatusCode === 'T') &&
                    e.mapNumber === mapNumber && (this.workFlowResult[this.workFlowDetailKey].progressReportStatusCode == 3)
                );
            } break;
            case 'agreementHeader': {
                activeList = detailMapIndex.filter(e =>
                    (e.workflowStatus.approveStatusCode === 'W' || e.workflowStatus.approveStatusCode === 'T') &&
                    e.mapNumber === mapNumber && (this.workFlowResult[this.workFlowDetailKey].agreementStatusCode == 5)
                );
            } break;
            case 'serviceRequest': {
                activeList = detailMapIndex.filter(e =>
                    (e.workflowStatus.approveStatusCode === 'W' || e.workflowStatus.approveStatusCode === 'T') &&
                    e.mapNumber === mapNumber && (this.workFlowResult[this.workFlowDetailKey].statusCode == 2)
                );
            } break;
            default: break;
        }
        return activeList.length > 0 ? true : false;
    }

  /**
   * @param  {} workflow
   * Bypass the selected reviever
   */
  bypassReviewer(workflow) {
    this.requestObject.actionType = 'B';
    this.requestObject.workFlowPersonId = workflow.approverPersonId;
    this.requestObject.approverStopNumber = workflow.approvalStopNumber;
    this.requestObject.mapNumber = workflow.mapNumber;
    this.requestObject.mapId = workflow.mapId;
    this.requestObject.approverNumber = workflow.approverNumber;
    this.requestObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.approveComment = workflow.approveComment === undefined ? '' : workflow.approveComment;
    this.validateComment(this.requestObject.approveComment);
    if (!this.isEmptyComments) {
      this.bypassWorkFlow();
    }
  }

  bypassWorkFlow() {
      this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.setModuleDetails();
      this._commonService.isShowOverlay = true;
      this.$subscriptions.push(this._workFlowService.maintainWorkFlow(this.setModuleAndSubModule()).subscribe((data: any) => {
        this.workFlowResponse.emit(data);
        this._commonService.isShowOverlay = false;
        this.latestVersion = this.workFlowResult.workflow.workflowSequence;
        this.updateWorkflowStops(this.workFlowResult.workflow);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reviewer Bypassed successfully.');
        $('#bypassConfirmModal').modal('hide');
        this.closeBypassModal();
      }, err => {
        $('#bypassConfirmModal').modal('hide');
        this.closeBypassModal();
        this._commonService.isShowOverlay = false;
        if (err.error && err.error.errorMessage === 'Deadlock') {
          this._commonService.showToast(HTTP_ERROR_STATUS, `Action failed as another update is being processed in current document.
          Please click bypass again. If error persistent after 2 mins, ${AWARD_ERR_MESSAGE} for assistance`);
        } else if (err && err.status === 405) {
          this.errorEvent.emit();
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, `Action cannot be completed due to a system error.
            ${AWARD_ERR_MESSAGE} for assistance.`);
        }

      }));
  }

    setModuleDetails() {
        switch (this.workFlowDetailKey) {
            case 'award': {
                this.requestObject.moduleItemKey = this.workFlowResult[this.workFlowDetailKey].awardId;
                this.requestObject.awardId = this.workFlowResult[this.workFlowDetailKey].awardId;
                this.requestObject.awardNumber = this.workFlowResult[this.workFlowDetailKey].awardNumber;
            } break;
            case 'proposal': {
                this.requestObject.moduleItemKey = this.workFlowResult[this.workFlowDetailKey].proposalId;
                this.requestObject.proposalId = this.workFlowResult[this.workFlowDetailKey].proposalId;
            } break;
            case 'task': {
                this.requestObject.moduleItemId = this.workFlowResult[this.workFlowDetailKey].moduleItemId;
                this.requestObject.taskId = this.workFlowResult[this.workFlowDetailKey].taskId;
                this.requestObject.moduleItemKey = this.workFlowResult[this.workFlowDetailKey].moduleItemKey;
                this.requestObject.endModuleSubItemKey = this.workFlowResult[this.workFlowDetailKey].endModuleSubItemKey;
            } break;
            case 'claim': {
                this.requestObject.claimId = this.workFlowResult[this.workFlowDetailKey].claimId;
            } break;
            case 'awardProgressReport': {
                this.requestObject.progressReportId = this.workFlowResult[this.workFlowDetailKey].progressReportId;
            } break;
            case 'agreementHeader': {
                this.requestObject.moduleItemId = this.workFlowResult[this.workFlowDetailKey].moduleItemId;
                this.requestObject.agreementRequestId = this.workFlowResult[this.workFlowDetailKey].agreementRequestId;
                this.requestObject.moduleItemKey = this.workFlowResult[this.workFlowDetailKey].moduleItemKey;
                this.requestObject.endModuleSubItemKey = this.workFlowResult[this.workFlowDetailKey].endModuleSubItemKey;
            } break;
            case 'serviceRequest': {
                this.requestObject.serviceRequestId = this.workFlowResult[this.workFlowDetailKey].serviceRequestId;
            } break;
            default: break;
        }
    }

    setModuleAndSubModule() {
        const approveFormData = new FormData();
        approveFormData.append('formDataJson', JSON.stringify(this.requestObject));
        switch (this.workFlowDetailKey) {
            case 'award': {
                approveFormData.append('moduleCode', '1');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'proposal': {
                approveFormData.append('moduleCode', '3');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'task': {
                approveFormData.append('moduleCode', '1');
                approveFormData.append('subModuleCode', '2');
            } break;
            case 'claim': {
                approveFormData.append('moduleCode', '14');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'awardProgressReport': {
                approveFormData.append('moduleCode', '16');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'agreementHeader': {
                approveFormData.append('moduleCode', '13');
                approveFormData.append('subModuleCode', '0');
            } break;
            case 'serviceRequest': {
                approveFormData.append('moduleCode', '20');
                approveFormData.append('subModuleCode', '0');
            } break;
            default: break;
        }
        return approveFormData;
    }

  /**
   * @param  {} workflow
   * Check multiple insertion of approver by checking
   * both primary and alternate approvers
   */
  duplicateCheckForApprover(workflow) {
    const isDuplicate = this.tempWorkflowStopList.filter(element =>
      element.approverPersonId === this.alternateApprover && element.mapNumber === workflow.mapNumber
    );
    return isDuplicate.length > 0 ? true : false;
  }

  /**
   * @param  {} workflow
   * Add alternate approver under the primary approver
   * and updates the workflow version and stops
   */
    addAlternateApprover(workflow, type) {
        if (!this.duplicateCheckForApprover(workflow)) {
            this.alternateApproverObject.primaryApprover = type === 'approver' ? true : '';
            this.setAlternateApprover(workflow);
            this._commonService.isShowOverlay = true;
            this.$subscriptions.push(this._workFlowService.addAlternateApprover(this.alternateApproverObject).subscribe((data: any) => {
                this.workFlowResponse.emit(data);
                this._commonService.isShowOverlay = false;
                this.latestVersion = this.workFlowResult.workflow.workflowSequence;
                this.updateWorkflowStops(this.workFlowResult.workflow);
                this.alternateApproverObject = {};
                if (type === 'approver') {
                  this._commonService.showToast(HTTP_SUCCESS_STATUS, 'New Approver added successfully.');
                }else {
                  this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Alternate Approver added successfully.');
                }
            }, err => {
              if (err && err.status === 405) {
                this.errorEvent.emit();
              } else {
                if (type === 'approver') {
                  this._commonService.isShowOverlay = false;
                  this._commonService.showToast(HTTP_ERROR_STATUS, (err && typeof err.error == 'string') ?
                    err.error : 'Adding New Approver failed. Please try again.');
                } else {
                  this._commonService.showToast(HTTP_ERROR_STATUS, ' Adding Alternate Approver failed. Please try again.');
                }
              }
            }));
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Cannot add the same approver in the same stop.');
        }
        this.clearField = new String('true');
        this.elasticSearchOptions.defaultValue = '';
        this.tempAlternateI = this.tempAlternateIndex = this.tempApproverI = this.tempApproverIndex = null;
        this.approverFlag = false;
    }

  /**
   * @param  {} workflow
   * Setting up of Alternate Approver Object
   */
    setAlternateApprover(workflow) {
        switch (this.workFlowDetailKey) {
            case 'award': {
                this.setAlternateApproverObject(workflow, '1', '0', '0', this.workFlowResult[this.workFlowDetailKey].awardId);
            } break;
            case 'proposal': {
                this.setAlternateApproverObject(workflow, '3', '0', '0', this.workFlowResult[this.workFlowDetailKey].proposalId);
            } break;
            case 'task': {
                this.setAlternateApproverObject(workflow, '1', '2',
                    this.workFlowResult[this.workFlowDetailKey].taskId, this.workFlowResult[this.workFlowDetailKey].moduleItemId);
            } break;
            case 'claim': {
                this.setAlternateApproverObject(workflow, '14', '0', '0', this.workFlowResult[this.workFlowDetailKey].claimId);
            } break;
            case 'awardProgressReport': {
                this.setAlternateApproverObject(workflow, '16', '0', '0', this.workFlowResult[this.workFlowDetailKey].progressReportId);
            } break;
            case 'agreementHeader': {
                this.setAlternateApproverObject(workflow, '13', '0', '0', this.workFlowResult[this.workFlowDetailKey].agreementRequestId);
            } break;
            case 'serviceRequest': {
                this.setAlternateApproverObject(workflow, '20', '0', '0', this.workFlowResult[this.workFlowDetailKey].serviceRequestId);
            } break;
            default: break;
        }
    }

  setAlternateApproverObject(workflow, moduleCode, subModuleCode, subModuleItemKey, moduleItemKey) {
    this.alternateApproverObject.workFlowId = this.workFlowResult.workflow.workflowId;
    this.alternateApproverObject.mapId = workflow.mapId;
    this.alternateApproverObject.mapNumber = workflow.mapNumber;
    this.alternateApproverObject.moduleCode = moduleCode;
    this.alternateApproverObject.moduleItemKey = moduleItemKey;
    this.alternateApproverObject.subModuleCode = subModuleCode;
    this.alternateApproverObject.subModuleItemKey = subModuleItemKey;
    this.alternateApproverObject.mapName = workflow.mapName;
    this.alternateApproverObject.stopName = workflow.stopName;
    this.alternateApproverObject.approvalStopNumber = workflow.approvalStopNumber;
    this.alternateApproverObject.approverNumber = workflow.approverNumber;
    this.alternateApproverObject.approverPersonId = this.alternateApprover;
    this.alternateApproverObject.approvalStatus = this.setWorkflowStatusForApprover(workflow);
    this.alternateApproverObject.updateUser = workflow.updateUser;
    this.alternateApproverObject.mapDescription = workflow.mapDescription;
  }
  /**
   * @param  {} approvalStatusCode
   * for setting the approval status code of any workflow peson with "W" or "T" in a map from temporary array list of maps
   */
  setWorkflowStatusForApprover(workflow) {
    return this.alternateApproverObject.primaryApprover ? this.tempWorkflowStopList.find(e => (e.approvalStatusCode === 'W' ||
      e.approvalStatusCode === 'T') && e.mapNumber === workflow.mapNumber).approvalStatusCode : workflow.approvalStatusCode;
  }

  /**
   * @param  {} event
   * setting alternate approver id from elastic response
   */
  selectedPerson(event, index, i) {
    if (event) {
      this.alternateApprover = event.prncpl_id;
      this.approverFlag = true;
      this.alternatePersonApprover.email_addr = event ? event.email_addr : null;
      this.alternatePersonApprover.full_name = event ? event.full_name : null;
      this.alternatePersonApprover.phone_nbr = event ? event.phone_nbr : null;
      this.alternatePersonApprover.primary_title = event ? event.primary_title : null;
      this.isAlternatePersonCard[index][i] = event ? event : true || event ? null : false;
      this.alternatePersonApprover.isExternalUser = event.external == "Y" ? true : false;
      this.alternatePersonApprover.homeUnit = event.unit_name;
    } else {
      this.isAlternatePersonCard[index][i] = event ? event : true || event ? null : false;
      this.approverFlag = false;
    }
  }

  /**
   * @param  {} index=null
   * @param  {} i=null
   * @param  {} detailMapIndex
   * Set focus and flag to alternate approver input field
   * on clicking add alternate approver button
   */
  setAlternateApproverFlagAndFocus(index = null, i = null, detailMapIndex) {
    this.stopWidgetOpen = [];
    this.tempWorkflowStopList = detailMapIndex;
    this.approverWidgetOpen = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    this.clearField = new String('true');
    if (this.tempAlternateI !== null && this.tempAlternateIndex !== null) {
      this.alternateWidgetOpen[this.tempAlternateIndex][this.tempAlternateI]
        = !this.alternateWidgetOpen[this.tempAlternateIndex][this.tempAlternateI];
    }
    this.alternateWidgetOpen[index][i] = !this.alternateWidgetOpen[index][i];
    this.tempAlternateIndex = index;
    this.tempAlternateI = i;
    this.tempApproverI = null;
    this.tempApproverIndex = null;
    setTimeout(() => {
      (document.getElementsByClassName('app-elastic-search')[0] as HTMLElement).focus();
    });
  }

  /**
  * @param  {} index=null
  * @param  {} i=null
  * @param  {} detailMapIndex
  * Set focus and flag to approver input field
  * on clicking add alternate approver button
  */
  setApproverFlagAndFocus(index = null, i = null, detailMapIndex) {
    this.stopWidgetOpen = [];
    this.tempWorkflowStopList = detailMapIndex;
    this.alternateWidgetOpen = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    this.clearField = new String('true');
    if (this.tempApproverI !== null && this.tempApproverIndex !== null) {
      this.approverWidgetOpen[this.tempApproverIndex][this.tempApproverI]
        = !this.approverWidgetOpen[this.tempApproverIndex][this.tempApproverI];
    }
    this.approverWidgetOpen[index][i] = !this.approverWidgetOpen[index][i];
    this.tempApproverIndex = index;
    this.tempApproverI = i;
    this.tempAlternateI = null;
    this.tempAlternateIndex = null;
    setTimeout(() => {
      (document.getElementsByClassName('app-elastic-search')[0] as HTMLElement).focus();
    });
  }

  /**
   * @param  {} index
   * @param  {} i
   * close accordian by clearing approver fields
   */
  closeApprover(index, i) {
    this.alternateWidgetOpen[index][i] = false;
    this.approverWidgetOpen[index][i] = false;
    this.tempApproverI = null;
    this.tempApproverIndex = null;
    this.tempAlternateI = null;
    this.tempAlternateIndex = null;
    this.clearField = new String('true');
    this.elasticSearchOptions.defaultValue = '';
    this.alternateApproverObject = {};
    this.approverFlag = false;
    this.alternateApprover = null;
  }

  /** download route log attachment
   * @param event
   * @param selectedFileName
   * @param selectedAttachArray
   */
  downloadRouteAttachment(attachment) {
    this.$subscriptions.push(this._workFlowService.downloadRoutelogAttachment(attachment.attachmentId)
      .subscribe(
        data => {
          fileDownloader(data, attachment.fileName);
        }));
  }
  /**
   * fetchscoring criteia from workflow person
   */
  fetchScoringCriterias(WorkflowpersonId, workflowDetailId) {
    this.scoringCriteriaList = [];
    const RequestObject = {
      'grantCallId': this.workFlowResult.grantCall.grantCallId,
      'personId': WorkflowpersonId,
      'proposalId': this.workFlowResult.proposal.proposalId,
      'workflowDetailId': workflowDetailId
    };
    this.$subscriptions.push(this._workFlowService.fetchScoringCriteriaByProposal(RequestObject)
      .subscribe((data: any) => {
        this.scoringCriteriaList = data.workflowReviewerScores || [];
        this.scoringCriteriaList[0].isOpen = !this.scoringCriteriaList[0].workflowReviewerComments.length ? false : true;
        this.isViewExpand =  this.scoringCriteriaList.find(criteria => criteria.workflowReviewerComments.length) ? true : false;
        this.filteredScoringWithComments = [];
        this.checkConditionArray();
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching scoring criteria failed. Please try again.');
      }));
  }

 /**
 * @param  {} attachment
 * service to download attachment in score card in workflow
 */
  downloadAttachments(attachment) {
    if (attachment.workflowReviewerAttmntsId != null) {
      this.$subscriptions.push(this._workFlowService.downloadWorkflowReviewerAttachment(attachment.workflowReviewerAttmntsId)
        .subscribe(data => {
          fileDownloader(data, attachment.fileName);
        }));
    } else {
      const URL = 'data:' + attachment.mimeType + ';base64,' + attachment.attachment;
      const a = document.createElement('a');
      a.href = URL;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
    }
  }

  setSeqStopFocus(index) {
    this.stopMap.clear();
    this.primaryClearField = new String('true');
    this.elasticPrimarySearchOptions.defaultValue = '';
    this.stopWidgetOpen[index] = !this.stopWidgetOpen[index];
    this.approverWidgetOpen = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    this.alternateWidgetOpen = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    this.sequentialStopObject = {};
    setTimeout(() => {
      (document.getElementsByClassName('app-elastic-search')[0] as HTMLElement).focus();
    });
  }

  addSequentialStop(map, index) {
    if (this.checkMandatoryForStop() && !this.isSaving) {
      this.isSaving = true;
      this.setSeqStop(map);
      this.isPersonCard[index] = false;
      this._commonService.isShowOverlay = true;
      this.$subscriptions.push(this._workFlowService.addSequentialStop(this.sequentialStopObject).subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'New Sequential Stop added successfully.');
        this.workFlowResponse.emit(data);
        this._commonService.isShowOverlay = false;
        this.latestVersion = this.workFlowResult.workflow.workflowSequence;
        this.updateWorkflowStops(this.workFlowResult.workflow);
        this.sequentialStopObject = {};
        this.closeStop();
        this.isSaving = false;
      }, err => {
        if (err && err.status === 405) {
          this.errorEvent.emit();
        }
        this.isSaving = false;
        this._commonService.isShowOverlay = false;
        this._commonService.showToast(HTTP_ERROR_STATUS, (err && typeof err.error == 'string') ?
            err.error : 'Adding sequential stop failed. Please try again.');
    }));
    }
  }

    setSeqStop(map) {
        switch (this.workFlowDetailKey) {
            case 'award': {
                this.setSeqStopObject(map, '1', '0', '0', this.workFlowResult[this.workFlowDetailKey].awardId);
            } break;
            case 'proposal': {
                this.setSeqStopObject(map, '3', '0', '0', this.workFlowResult[this.workFlowDetailKey].proposalId);
            } break;
            case 'task': {
                this.setSeqStopObject(map, '1', '2',
                    this.workFlowResult[this.workFlowDetailKey].taskId, this.workFlowResult[this.workFlowDetailKey].moduleItemId);
            } break;
            case 'claim': {
                this.setSeqStopObject(map, '14', '0', '0', this.workFlowResult[this.workFlowDetailKey].claimId);
            } break;
            case 'awardProgressReport': {
                this.setSeqStopObject(map, '16', '0', '0', this.workFlowResult[this.workFlowDetailKey].progressReportId);
            } break;
            case 'agreementHeader': {
                this.setSeqStopObject(map, '13', '0', '0', this.workFlowResult[this.workFlowDetailKey].agreementRequestId);
            } break;
            case 'serviceRequest': {
                this.setSeqStopObject(map, '20', '0', '0', this.workFlowResult[this.workFlowDetailKey].serviceRequestId);
            } break;
            default: break;
        }
        // this.workFlowResult[this.workFlowDetailKey].taskId
    }

  setSeqStopObject(map, moduleCode, subModuleCode, subModuleItemKey, moduleItemKey) {
    this.sequentialStopObject.workFlowId = this.workFlowResult.workflow.workflowId;
    this.sequentialStopObject.mapId = map.mapId;
    this.sequentialStopObject.mapNumber = map.mapNumber;
    this.sequentialStopObject.mapName = map.mapName;
    this.sequentialStopObject.stopName = this.DEFAULT_STOP_NAME;
    this.sequentialStopObject.moduleCode = moduleCode;
    this.sequentialStopObject.moduleItemKey = moduleItemKey;
    this.sequentialStopObject.subModuleCode = subModuleCode;
    this.sequentialStopObject.subModuleItemKey = subModuleItemKey;
    this.sequentialStopObject.approverNumber = 1;
    this.sequentialStopObject.approvalStatus = 'T';
    this.sequentialStopObject.primaryApprover = true;
    this.sequentialStopObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.sequentialStopObject.personId = this._commonService.getCurrentUserDetail('personID');
  }

  checkMandatoryForStop() {
    this.stopMap.clear();
    if (!this.sequentialStopObject.approverPersonId) {
      this.stopMap.set('primaryApprover', 'primaryApprover');
      this.elasticPrimarySearchOptions.errorMessage = 'Please specify a primary approver.';
    }
    return this.stopMap.size > 0 ? false : true;
  }

  /**
   * @param  {} event
   * Select primary approver elastic for stop adding
   */
  selectedPrimaryApprover(event, index) {
    this.sequentialStopObject.approverPersonId = event ? event.prncpl_id : null;
    this.sequentialStopPersonObject.email_addr = event ? event.email_addr : null;
    this.sequentialStopPersonObject.full_name = event ? event.full_name : null;
    this.sequentialStopPersonObject.phone_nbr = event ? event.phone_nbr : null;
    this.sequentialStopPersonObject.primary_title = event ? event.primary_title : null;
    this.isPersonCard[index] = event ? event : true || event ? null : false;
    this.sequentialStopPersonObject.isExternalUser = event ? event.external == "Y" ? true : false : null;
    this.sequentialStopPersonObject.homeUnit = event ? event.unit_name: null;
  }

  /**
   * @param  {} mapNumber
   * Filter Workflow based on Map Number
   */
  getMapListBasedOnMapNumber(mapNumber) {
    if (this.workFlowResult.workflow) {
      return this.workFlowResult.workflow.workflowDetails.filter((e) => e.mapNumber === mapNumber);
    }
  }

  closeStop() {
    this.stopWidgetOpen = [];
    this.primaryClearField = new String('true');
    this.elasticPrimarySearchOptions.defaultValue = '';
    this.sequentialStopObject = {};
  }

  scrollToComments(criteriaIndex) {
    if (this.scoringCriteriaList[criteriaIndex].isOpen) {
      setTimeout(() => {
        const ITEM = document.getElementById('comment' + criteriaIndex);
        ITEM.scrollIntoView({behavior: 'smooth', block: 'start'});
      });
    }
  }

  toggleComments() {
    this.isExpandall = !this.isExpandall;
    this.scoringCriteriaList.map(item => item.isOpen = this.isExpandall ? true : false);
  }

  getBadgeByStatusCode(statusCode) {
    if (statusCode === '3') {
      return 'success';
    } else if (statusCode === '2') {
      return 'danger';
    } else if (statusCode === '1') {
      return 'warning';
    } else {
      return 'info';
    }
  }
  /**
   * for checking the condition to show collapse button or expand button
   */
  checkConditionArray(): void {
    if (!this.filteredScoringWithComments.length) {
      this.filteredScoringWithComments = this.scoringCriteriaList.filter((element: any) =>
        element.workflowReviewerComments.length);
    }
    this.isExpandall = this.filteredScoringWithComments.length && this.filteredScoringWithComments.every((element: any) => element.isOpen);
  }

  setBypassHeader() {
    switch (this.workFlowDetailKey) {
      case 'award': {
         return 'Award #' + this.workFlowResult[this.workFlowDetailKey].awardNumber;
      } break;
      case 'proposal': {
        return 'Proposal #' + this.workFlowResult[this.workFlowDetailKey].proposalId;
      } break;
      case 'task': {
        return 'Task #' + this.workFlowResult[this.workFlowDetailKey].taskId;
      } break;
      case 'claim': {
        return 'Claim';
      } break;
      case 'awardProgressReport': {
        return 'Progress Report';
      } break;
      case 'agreementHeader': {
        return 'Agreement #' + this.workFlowResult[this.workFlowDetailKey].agreementRequestId;
      } break;
      case 'serviceRequest': {
        return 'Service Request #' + this.workFlowResult[this.workFlowDetailKey].serviceRequestId;
      } break;
      default: break;
    }
  }

  getModuleStatus(type) {
    let bypassModalValue: any;
    switch (this.workFlowDetailKey) {
      case 'award': {
        bypassModalValue = type === 'PI' ? this.workFlowResult[this.workFlowDetailKey].principalInvestigator :
          type === 'leadUnit' ? this.workFlowResult[this.workFlowDetailKey].leadUnit.unitName :
            this.workFlowResult[this.workFlowDetailKey].awardWorkflowStatus.description;
        return bypassModalValue;
      } break;
      case 'proposal': {
        bypassModalValue = type === 'PI' ? this.workFlowResult[this.workFlowDetailKey].investigator.fullName :
          type === 'leadUnit' ? this.workFlowResult[this.workFlowDetailKey].unit.unitName :
            this.workFlowResult[this.workFlowDetailKey].proposalStatus.description;
        return bypassModalValue;
      } break;
      case 'task': {
        bypassModalValue = type === 'PI' ? this.workFlowResult[this.workFlowDetailKey].taskId :
          type === 'leadUnit' ? this.workFlowResult[this.workFlowDetailKey].assigneeFullName :
            this.workFlowResult[this.workFlowDetailKey].taskType.description;
        return bypassModalValue;
      } break;
      case 'agreementHeader': {
        bypassModalValue = type === 'category' ? this.workFlowResult[this.workFlowDetailKey].agreementCategory.description :
          type === 'type' ? this.workFlowResult[this.workFlowDetailKey].agreementType.description :
            type === 'leadUnit' ? this.workFlowResult[this.workFlowDetailKey].unit.unitName :
              this.workFlowResult[this.workFlowDetailKey].agreementStatus.description;
        return bypassModalValue;
      } break;
      case 'serviceRequest': {
        bypassModalValue = type === 'PI' ? this.workFlowResult[this.workFlowDetailKey].reporterPersonName :
          type === 'leadUnit' ? this.workFlowResult[this.workFlowDetailKey].unit.unitName :
            this.workFlowResult[this.workFlowDetailKey].serviceRequestStatus.description;
        return bypassModalValue;
      } break;
      default: break;
    }
  }

  validateComment(approveComments) {
    this.isEmptyComments = approveComments === '' ? true : false;
  }

  closeBypassModal() {
    this.workflowDetail.approveComment = '';
    this.isEmptyComments = false;
  }
}
