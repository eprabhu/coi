/** last updated by Archana R on 04-12-2019 **/

import { Component, OnInit, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MapService } from '../common/map.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { getCompleterOptionsForLeadUnitWithCustField } from '../../../common/services/completer.config';
import { AuditLogService } from '../../../common/services/audit-log.service';

class Approver {
  APPROVER_NUMBER = 0;
  APPROVER_PERSON_ID = null;
  PRIMARY_APPROVER_FLAG = '';
  IS_ROLE = 'N';
  isRuleSelected = 0;
  ROLE_TYPE_CODE = null;
  DESCRIPTION = '';
  STOP_NAME = '';
  approverName = '';
  MAP_ID = 0;
  MAP_DETAIL_ID = 0;
  isEditDescription = false;
}
class StopDetails {
  APPROVAL_STOP_NUMBER = 0;
  showApproverField = true;
  approverDetailsList = [];
  STOP_NAME = null;

}

class MapDetails {
  APPROVAL_STOP_NUMBER: 0;
  APPROVER_NUMBER: 0;
  APPROVER_PERSON_ID: null;
  PRIMARY_APPROVER_FLAG: '';
  IS_ROLE: 'N';
  ROLE_TYPE_CODE: null;
  DESCRIPTION: '';
  STOP_NAME: '';
  MAP_ID: 0;
  MAP_DETAIL_ID: 0;
  UPDATE_USER: '';
  APPROVER_NAME: '';
}

@Component({
  selector: 'app-create-map',
  templateUrl: './create-map.component.html',
  styleUrls: ['./create-map.component.css'],
  providers: [AuditLogService,
  { provide: 'moduleName', useValue: 'MAP_MAINTENANCE' }]
})

export class CreateMapComponent implements OnInit, OnDestroy {
  mapDetailsObject = new MapDetails();
  activeApprover: any;
  resultReturns: any = {
  };
  noOfAltApprovers = 0;
  populatedResult: any = {
    mapList: [{
      DESCRIPTION: '',
      // MAP_TYPE: 'R',
      UPDATE_USER: '',
      UNIT_NUMBER: 0,
    }],
    mapDetailList: []
  };
  approverFieldStopNumber = 0;
  validationText = '';
  approverData: Approver = new Approver();
  approverNumberList = [];
  stopNumberList = [];
  deletedMapDetailList = [];
  mapData: any = {
    DESCRIPTION: '',
    unitNumber: '',
    unitName: '',
    MAP_TYPE: '',
    MAP_NAME: '',
    stopDetailsList: []
  };
  addApproverText = '';
  mapIdForEdit = 0;
  personSearchText: UntypedFormControl = new UntypedFormControl('');
  message = '';
  isEdited = false;
  personnelInfo: any = {};
  personType = 'person';
  resultData: any =
    {
    };
  seachTextModel: string;
  _results: Subject<Array<any>> = new Subject<Array<any>>();
  roleDescription: any = {
    roletypeId: 0,
    roleTypeDescription: '',

  };
  updatedUser: any;
  completrService: any;
  stopGroupList: any[];
  stopGroupListKeys: any[];
  delStop = '';
  addApproverButton = false;
  altApprvr = false;
  elasticSearchOptions: any = {};
  completerSearchOptions: any = {};
  completerDescriptionOptions: any = {};
  result: any = {};
  workflowMapTypes: any[];
  clearPersonField: string;
  clearField;
  $subscriptions: Subscription[] = [];
  isSaving = false;
  fetchIsRoleOrNot: string;
  validationMap = new Map();
  before = {};

  constructor(private activatedRouter: ActivatedRoute, private router: Router, private mapService: MapService,
    private _elasticConfig: ElasticConfigService, public _commonService: CommonService, private _auditLogService: AuditLogService) { }

  ngOnInit() {
    this.updatedUser = this._commonService.getCurrentUserDetail('userName');
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    this.$subscriptions.push(this.mapService.getUnitLists().subscribe(
      data => {
        this.resultData = data;
        this.completerSearchOptions = getCompleterOptionsForLeadUnitWithCustField(this.resultData.unitList.unitList);
      }));
    this.$subscriptions.push(this.mapService.fetchWorkflowMapType().subscribe(
      data => {
        this.result = data;
        this.workflowMapTypes = this.result.workflowMapType;
      }));
    this.getRoleDescription();
    this.$subscriptions.push(this.activatedRouter.queryParams.subscribe(params => {
      this.mapIdForEdit = params['id'];
    }));

    if (this.mapIdForEdit !== undefined && this.mapIdForEdit > 0) {
      this.$subscriptions.push(this.mapService.getMapDetailsById(this.mapIdForEdit)
        .subscribe(
          (data: any) => {
            this.resultReturns = data;
            this.populatedResult = this.resultReturns.mapDetails;
            this.populateMapData();
            this.before = this.prepareAuditLogObject(data.mapDetails);
          }));
    } else {
      this.addSequentialStop();
      this.approverNumberList.push(0);
    }
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  getRoleDescription() {
    this.$subscriptions.push(this.mapService.getRoleDescription().subscribe(
      data => {
        this.resultData = data;
        this.completerDescriptionOptions.arrayList = this.resultData.roleDescription;
        this.completerDescriptionOptions.contextField = 'DESCRIPTION';
        this.completerDescriptionOptions.filterFields = 'DESCRIPTION';
        this.completerDescriptionOptions.formatString = 'DESCRIPTION';
        // this.dataMapService = this.completrService.local(this.resultData.roleDescription, 'DESCRIPTION', 'DESCRIPTION');
      }));
  }
  onApprovedRoleSelected(selectedItem) {
    if (selectedItem) {
      this.approverData.ROLE_TYPE_CODE = selectedItem.ROLE_TYPE_CODE;
      this.approverData.IS_ROLE = 'Y';
      this.approverData.approverName = selectedItem.DESCRIPTION;
    } else {
      this.approverData.ROLE_TYPE_CODE = null;
      this.approverData.approverName = '';
    }
  }

  handleError(): any {
    this.message = 'something went wrong';
  }
  clearsearchBox(e: any) {
    e.preventDefault();
    this.seachTextModel = '';
  }
  selectedResult(result) {
    this.seachTextModel = result.obj.full_name;
    this.approverData.approverName = result.obj.full_name;
    this.approverData.APPROVER_PERSON_ID = result.obj.person_id;
    this.approverData.IS_ROLE = 'N';
  }

  /** 
   * fetchIsRoleOrNot variable is used to store selected Approve By, 
   * which will be used when type is changed from Evaluation to Routing. **/
  onApproveBySelectionChange(stop, value) {
    this.fetchIsRoleOrNot = value;
    this.approverData.APPROVER_PERSON_ID = null;
    this.approverData.ROLE_TYPE_CODE = null;
    this.approverData.IS_ROLE = value;
    this.approverData.isRuleSelected = value === true ? (1 + (stop.APPROVAL_STOP_NUMBER * 10)) : (2 + (stop.APPROVAL_STOP_NUMBER * 10));
  }

  validateAndaddStop() {
    if ((this.mapData.stopDetailsList === undefined || this.mapData.stopDetailsList.length === 0) ||
      this.mapData.stopDetailsList[this.mapData.stopDetailsList.length - 1].approverDetailsList.length > 0) {
      this.addSequentialStop();
    } else {
      this.validationText = 'Please specify at least one primary approver';
      document.getElementById('validatebutton').click();
    }
  }
  addSequentialStop() {
    this.addApproverButton = false;
    this.elasticSearchOptions = Object.assign({}, this.elasticSearchOptions);
    this.elasticSearchOptions.defaultValue = '';
    const sequentialStop: StopDetails = new StopDetails();
    sequentialStop.APPROVAL_STOP_NUMBER = this.mapData.stopDetailsList.length + 1;
    this.approverData.isRuleSelected = 2 + (sequentialStop.APPROVAL_STOP_NUMBER * 10);
    this.approverFieldStopNumber = sequentialStop.APPROVAL_STOP_NUMBER;
    this.addApproverText = 'Primary approver for the stop';
    this.mapData.stopDetailsList.push(Object.assign({}, sequentialStop));
  }
  addAlternateApprover(stop, approver) {
    this.addApproverText = 'Alternate Approver for ' + approver.approverName;
    this.addApproverButton = true;
    this.isEdited = true;
    this.activeApprover = approver;
    this.approverData = new Approver();
    this.approverData.APPROVER_NUMBER = approver.APPROVER_NUMBER;
    this.approverData.PRIMARY_APPROVER_FLAG = 'N';
    this.approverData.isRuleSelected = 2 + (stop.APPROVAL_STOP_NUMBER * 10);
    stop.showApproverField = true;
    this.approverFieldStopNumber = stop.APPROVAL_STOP_NUMBER;
    this.elasticSearchOptions.defaultValue = '';
    this.completerDescriptionOptions.defaultValue = '';
  }
  cancelApproverField(stop) {
    stop.showApproverField = false;
    this.seachTextModel = '';
    this.roleDescription.roleTypeDescription = '';
  }
  onUnitSelect(selectedValue) {
    this.onChange();
    if (selectedValue) {
      this.mapData.unitNumber = selectedValue.UNIT_NUMBER;
      this.mapData.unitName = selectedValue.UNIT_NAME;
    } else {
      this.mapData.unitNumber = '';
      this.mapData.unitName = '';
    }
  }
  addApprover(stop) {
    this.addApproverText = 'Primary approver for the stop';
    this.activeApprover = new Approver();
    this.isEdited = true;
    this.addApproverButton = false;
    this.approverData = new Approver();
    this.approverData.PRIMARY_APPROVER_FLAG = 'Y';
    this.approverData.isRuleSelected = 2 + (stop.APPROVAL_STOP_NUMBER * 10);
    stop.showApproverField = true;
    this.approverFieldStopNumber = stop.APPROVAL_STOP_NUMBER;
    this.seachTextModel = '';
    this.roleDescription.roleTypeDescription = '';
    this.elasticSearchOptions.defaultValue = '';
    this.completerDescriptionOptions.defaultValue = '';
  }

  emptyValidationKeyup(event) {
    if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
      this.approverData.ROLE_TYPE_CODE = null;
    }
  }

  saveApprover(stop) {
    if (this.approverData.APPROVER_PERSON_ID === null && this.approverData.ROLE_TYPE_CODE === null) {
      stop.showApproverField = true;
      this.approverFieldStopNumber = stop.APPROVAL_STOP_NUMBER;
      this.validationText = 'Please specify at least one  approver';
      document.getElementById('validatebutton').click();
      return;
    }
    let isValidUser = false;
    const existingRole = stop.approverDetailsList.filter(user => user.ROLE_TYPE_CODE === this.approverData.ROLE_TYPE_CODE &&
      user.IS_ROLE === 'Y');
    const existingUser = stop.approverDetailsList.filter(user => user.APPROVER_PERSON_ID === this.approverData.APPROVER_PERSON_ID &&
      user.IS_ROLE === 'N');
    if (existingUser.length === 0 && existingRole.length === 0) {
      isValidUser = true;
    }

    if (isValidUser) {
      if (this.approverData.APPROVER_NUMBER === 0) {
        const maxApproveNumber = Math.max.apply(null, this.approverNumberList);
        this.approverData.APPROVER_NUMBER = maxApproveNumber + 1;
        this.approverData.PRIMARY_APPROVER_FLAG = 'Y';
        this.approverNumberList.push(this.approverData.APPROVER_NUMBER);
      }
      stop.showApproverField = false;
      this.approverFieldStopNumber = 0;
      if (this.approverData.DESCRIPTION.length > 60) {
        stop.showApproverField = true;
        this.approverFieldStopNumber = stop.APPROVAL_STOP_NUMBER;
        this.validationText = 'Maximum length is 60 characters.';
        document.getElementById('validatebutton').click();
      } else {
        this.activeApprover = new Approver();
        this.approverFieldStopNumber = 0;
        stop.showApproverField = false;
        stop.approverDetailsList.push(Object.assign({}, this.approverData));
      }

      if (this.approverData.PRIMARY_APPROVER_FLAG === 'N') {
        this.altApprvr = true;
        this.noOfAltApprovers++;
      }
      this.approverData = new Approver();
      this.seachTextModel = '';
      this.roleDescription.roleTypeDescription = '';
    } else {
      this.validationText = 'The user has already been selected at this stop';
      document.getElementById('validatebutton').click();
    }
  }
  removeEntireStop(stop) {
    this.elasticSearchOptions = Object.assign({}, this.elasticSearchOptions);
    this.elasticSearchOptions.defaultValue = '';
    const altApproverCount = stop.approverDetailsList.filter(x => x.PRIMARY_APPROVER_FLAG === 'N').length;
    this.noOfAltApprovers = this.noOfAltApprovers - altApproverCount;
    stop.approverDetailsList.forEach((approver) => {
      for (let i = this.approverNumberList.length - 1; i >= 0; i--) {
        if (approver.MAP_DETAIL_ID !== undefined && approver.MAP_DETAIL_ID > 0) {
          this.deletedMapDetailList.push(approver.MAP_DETAIL_ID);
        }
        if (this.approverNumberList[i] === approver.APPROVER_NUMBER) {
          this.approverNumberList.splice(i, 1);
        }
      }
    });
    this.mapData.stopDetailsList = this.mapData.stopDetailsList.filter(item => item.APPROVAL_STOP_NUMBER !== stop.APPROVAL_STOP_NUMBER);
    for (const singleStop of this.mapData.stopDetailsList) {
      if (stop.APPROVAL_STOP_NUMBER < singleStop.APPROVAL_STOP_NUMBER) {
        singleStop.APPROVAL_STOP_NUMBER = singleStop.APPROVAL_STOP_NUMBER - 1;
      }
    }
    this.altApprvr = this.noOfAltApprovers > 0 ? true : false;
    if (this.mapData.stopDetailsList.length === 0) {
      this.altApprvr = false;
      this.addSequentialStop();
      this.approverNumberList.push(0);
    }
  }
  removeStope(stop) {
    const altApproverCount = stop.approverDetailsList.filter(x => x.PRIMARY_APPROVER_FLAG === 'N').length;
    this.noOfAltApprovers = this.noOfAltApprovers - altApproverCount;
    this.mapData.stopDetailsList = this.mapData.stopDetailsList.filter(item => item.APPROVAL_STOP_NUMBER !== stop.APPROVAL_STOP_NUMBER);
    for (const singleStop of this.mapData.stopDetailsList) {
      if (stop.APPROVAL_STOP_NUMBER < singleStop.APPROVAL_STOP_NUMBER) {
        singleStop.APPROVAL_STOP_NUMBER = singleStop.APPROVAL_STOP_NUMBER - 1;
      }
    }
    this.altApprvr = this.noOfAltApprovers > 0 ? true : false;
    if (this.mapData.stopDetailsList.length === 0) {
      this.altApprvr = false;
      this.addSequentialStop();
      this.approverNumberList.push(0);
    }
  }

  removeApprover(stop, approver) {
    this.isEdited = true;
    if (approver.PRIMARY_APPROVER_FLAG === 'N') {
      this.noOfAltApprovers--;
      this.altApprvr = this.noOfAltApprovers === 0 ? false : true;
    }
    if (approver.MAP_DETAIL_ID !== undefined && approver.MAP_DETAIL_ID > 0) {
      this.deletedMapDetailList.push(approver.MAP_DETAIL_ID);
    }
    const numberOfApproversInCurrentStop = stop.approverDetailsList.length;

    if (numberOfApproversInCurrentStop === 1) {
      for (let i = this.approverNumberList.length - 1; i >= 0; i--) {

        if (this.approverNumberList[i] === approver.APPROVER_NUMBER) {
          this.approverNumberList.splice(i, 1);
        }
      }
      this.removeStope(stop);
    } else {
      let approversHasSameApproverNumber = stop.approverDetailsList.filter(user => user.APPROVER_NUMBER ===
        approver.APPROVER_NUMBER);
      if (approversHasSameApproverNumber.length === 1) {
        for (let i = this.approverNumberList.length - 1; i >= 0; i--) {

          if (this.approverNumberList[i] === approver.APPROVER_NUMBER) {
            this.approverNumberList.splice(i, 1);
          }
        }
      }
      if (approversHasSameApproverNumber.length > 1) {
        if (approver.PRIMARY_APPROVER_FLAG === 'Y') {
          this.removeApproverBasedOnType(stop, approver);
          this.noOfAltApprovers--;
          this.altApprvr = this.noOfAltApprovers === 0 ? false : true;
          if (approver.IS_ROLE === 'Y') {
            approversHasSameApproverNumber = approversHasSameApproverNumber.filter(user => user.ROLE_TYPE_CODE !==
              approver.ROLE_TYPE_CODE);
          } else {
            approversHasSameApproverNumber = approversHasSameApproverNumber.filter(user => user.APPROVER_PERSON_ID !==
              approver.APPROVER_PERSON_ID);
          }
          const newPrimaryApprover = approversHasSameApproverNumber[0];
          let itemIndex = -1;
          if (newPrimaryApprover.IS_ROLE === 'Y') {
            itemIndex = stop.approverDetailsList.findIndex(item => item.ROLE_TYPE_CODE === newPrimaryApprover.ROLE_TYPE_CODE);
          } else {
            itemIndex = stop.approverDetailsList.findIndex(item => item.APPROVER_PERSON_ID === newPrimaryApprover.APPROVER_PERSON_ID);
          }
          if (itemIndex > -1) {
            stop.approverDetailsList[itemIndex].PRIMARY_APPROVER_FLAG = 'Y';
          } else {
            console.log('something went wrong');
          }
        } else {
          this.removeApproverBasedOnType(stop, approver);
        }
      } else {
        this.removeApproverBasedOnType(stop, approver);
      }
    }
  }

  removeApproverBasedOnType(stop, approver) {
    if (approver.IS_ROLE === 'Y') {
      stop.approverDetailsList = stop.approverDetailsList.filter(user => user.ROLE_TYPE_CODE !==
        approver.ROLE_TYPE_CODE);
    } else {
      stop.approverDetailsList = stop.approverDetailsList.filter(user => user.APPROVER_PERSON_ID !==
        approver.APPROVER_PERSON_ID);
    }
  }

  /** 
   * If the type is Evaluation(MAP_TYPE = 'E', 
   * Approve By should be Person, so Is role is set to N.) **/
  setIsRoleOrNot(){
      this.approverData.IS_ROLE = this.mapData.MAP_TYPE == 'E' ? 'N' : this.fetchIsRoleOrNot; 
  }

  validateMap() {
    if (!this.isSaving) {
      this.validationMap.clear();
      this.isSaving = true;
      this.isEdited = false;
      if (!this.mapData.unitNumber) {
        this.validationMap.set('department', 'Please specify the map department.');
      } if (this.mapData.MAP_TYPE === '' || this.mapData.MAP_TYPE == null) {
        this.validationMap.set('mapType','Please specify the map type.');
      } if (!this.mapData.MAP_NAME) {
        this.validationMap.set('mapName', 'Please specify the map name.');
      } if (!this.mapData.DESCRIPTION) {
        this.validationMap.set('mapDescription', 'Please specify the map description.');
      } else if (this.mapData.stopDetailsList.length === 0) {
        this.validationText = 'Please specify at least one stop for the map';
        document.getElementById('validatebutton').click();
      } else { 
        if (this.mapData.stopDetailsList[this.mapData.stopDetailsList.length - 1].approverDetailsList.length > 0) {
          this.prepareSaveMapObject();
        } else {
          this.validationText = 'Please add atleast one primary approver';
          document.getElementById('validatebutton').click();
        }
      }
    }
    this.isSaving = false;
  }

  prepareSaveMapObject() {
    this.populatedResult.mapDetailList = [];
    this.populatedResult.mapList[0].DESCRIPTION = this.mapData.DESCRIPTION;
    this.populatedResult.mapList[0].MAP_TYPE = this.mapData.MAP_TYPE;
    this.populatedResult.mapList[0].MAP_NAME = this.mapData.MAP_NAME;
    this.populatedResult.mapList[0].UNIT_NAME = this.mapData.unitName;
    this.populatedResult.mapList[0].UNIT_NUMBER = this.mapData.unitNumber;
    this.populatedResult.mapList[0].UPDATE_USER = this.updatedUser;
    for (const stopData of this.mapData.stopDetailsList) {
      for (const approver of stopData.approverDetailsList) {
        this.mapDetailsObject.APPROVAL_STOP_NUMBER = stopData.APPROVAL_STOP_NUMBER;
        this.mapDetailsObject.APPROVER_NUMBER = approver.APPROVER_NUMBER;
        this.mapDetailsObject.APPROVER_PERSON_ID = approver.APPROVER_PERSON_ID;
        this.mapDetailsObject.APPROVER_NAME = approver.approverName;
        this.mapDetailsObject.PRIMARY_APPROVER_FLAG = approver.PRIMARY_APPROVER_FLAG;
        this.mapDetailsObject.IS_ROLE = approver.IS_ROLE;
        this.mapDetailsObject.ROLE_TYPE_CODE = approver.ROLE_TYPE_CODE;
        this.mapDetailsObject.STOP_NAME = stopData.STOP_NAME;
        if (approver.DESCRIPTION && approver.DESCRIPTION.length > 60) {
            this.validationText = 'The maximum description length is limited to 60 characters';
            document.getElementById('validatebutton').click();
        }
        this.mapDetailsObject.DESCRIPTION = approver.DESCRIPTION;
        this.mapDetailsObject.UPDATE_USER = this.updatedUser;
        this.mapDetailsObject.MAP_DETAIL_ID = approver.MAP_DETAIL_ID;
        this.mapDetailsObject.MAP_ID = approver.MAP_ID;
        this.populatedResult.mapDetailList.push(Object.assign({}, this.mapDetailsObject));
      }
    }
    if (this.populatedResult.mapDetailList.length === 0) {
      this.validationText = 'There must be at least one stop defined for a map';
      document.getElementById('validatebutton').click();
    } else {
      this.saveMap();
    }
  }

  saveMap() {
    if (this.mapIdForEdit > 0) {
      this.populatedResult.deletedMapDetailList = this.deletedMapDetailList;
      this.$subscriptions.push(this.mapService.updateMap(this.populatedResult).subscribe(
        (data: any) => {
          this.saveAuditLog('U', data.mapDetails);
          this.navigateToRuleList();
          this.isSaving = false;
        },
        err => { this.isSaving = false; }));
    } else if (!this.validationText) {
      this.$subscriptions.push(this.mapService.insertMap(this.populatedResult).subscribe(
        (data: any) => {
          this.saveAuditLog('I', data.mapDetails);
          this.navigateToRuleList();
          this.isSaving = false;
        },
        err => { this.isSaving = false; } ));
    }
  }

  saveAuditLog(acType, mapDetails) {
    let after = this.prepareAuditLogObject(mapDetails);
    this._auditLogService.saveAuditLog(acType, acType == 'I' ? {} : this.before, after, null, Object.keys(this.before), mapDetails.mapList[0].MAP_ID);
  }

  private prepareAuditLogObject(mapDetails): any {
    let mapAuditLog = {
      'DESCRIPTION': mapDetails.mapList[0].DESCRIPTION,
      'MAP_NAME': mapDetails.mapList[0].MAP_NAME,
      'MAP_TYPE': mapDetails.mapList[0].MAP_TYPE === 'R' ? 'Routing' : 'Evaluation',
      'UNIT': `${mapDetails.mapList[0].UNIT_NUMBER} - ${mapDetails.mapList[0].UNIT_NAME}`,
      'UPDATE_USER': mapDetails.mapList[0].UPDATE_USER,
      'APPROVERS': this.getApproverStringList(mapDetails.mapDetailList)
    }
    return mapAuditLog;
  }

  private getApproverStringList(userDetails): any {
    return userDetails.map(ele => `${ele.APPROVER_NAME} ${this.getRoleStringForRole(ele)} is ${this.getApproverTitleString(ele)} at stop ${ele.STOP_NAME}`);
  }

  /**
   * approver can be person or role , so in case of role we add
   * role string along with approver details in audit log
   * @param approver 
   * @returns 
   */
  getRoleStringForRole(approver) {
    return approver.APPROVER_PERSON_ID ? '' : ' role';
  }

  getApproverTitleString(approver) {
    return approver.PRIMARY_APPROVER_FLAG === 'Y' ? 'Primary Approver' : 'Alternative Approver';
  }

  navigateToRuleList() {
    if ((this.isEdited === false) || (this.mapIdForEdit === undefined)) {
      return this.router.navigate(['fibi/mapMaintainance/']);
    } else {
      document.getElementById('updateButton').click();
    }
  }

  removeStops(stop) {
    this.isEdited = true;
    this.delStop = stop;
  }

  populateMapData() {
    this.stopNumberList = [];
    this.mapData.DESCRIPTION = this.populatedResult.mapList[0].DESCRIPTION;
    this.mapData.MAP_TYPE = this.populatedResult.mapList[0].MAP_TYPE;
    this.mapData.MAP_NAME = this.populatedResult.mapList[0].MAP_NAME;
    this.mapData.unitNumber = this.populatedResult.mapList[0].UNIT_NUMBER;
    this.mapData.unitName = this.populatedResult.mapList[0].UNIT_NAME;
    this.populatedResult.mapDetailList.sort(function (firstMap, secondMap) {
      return firstMap.APPROVAL_STOP_NUMBER - secondMap.APPROVAL_STOP_NUMBER;
    });
    this.stopGroupList = this.groupBy(this.populatedResult.mapDetailList, 'APPROVAL_STOP_NUMBER');
    this.stopGroupListKeys = Object.keys(this.stopGroupList);
    this.stopGroupListKeys.forEach((item, index) => {
      const sequentialStop = new StopDetails();

      for (const stopData of this.stopGroupList[item]) {
        if (stopData.PRIMARY_APPROVER_FLAG === 'Y') {
          sequentialStop.APPROVAL_STOP_NUMBER = stopData.APPROVAL_STOP_NUMBER;
          sequentialStop.showApproverField = false;
          const approver = new Approver();

          this.approverNumberList.push(stopData.APPROVER_NUMBER);
          approver.APPROVER_NUMBER = stopData.APPROVER_NUMBER;
          approver.APPROVER_PERSON_ID = stopData.APPROVER_PERSON_ID;
          approver.approverName = stopData.APPROVER_NAME;
          approver.PRIMARY_APPROVER_FLAG = stopData.PRIMARY_APPROVER_FLAG;
          approver.IS_ROLE = stopData.IS_ROLE;
          approver.ROLE_TYPE_CODE = stopData.ROLE_TYPE_CODE;
          approver.DESCRIPTION = stopData.DESCRIPTION;
          approver.STOP_NAME = stopData.STOP_NAME;
          approver.MAP_DETAIL_ID = stopData.MAP_DETAIL_ID;
          approver.MAP_ID = stopData.MAP_ID;
          sequentialStop.STOP_NAME = approver.STOP_NAME;
          sequentialStop.approverDetailsList.push(Object.assign({}, approver));
          for (const alternateApprover of this.stopGroupList[item]) {
            if (alternateApprover.APPROVER_NUMBER === stopData.APPROVER_NUMBER && alternateApprover.PRIMARY_APPROVER_FLAG === 'N') {
              const altApprover = new Approver();
              this.altApprvr = true;
              this.noOfAltApprovers++;
              this.altApprvr = this.noOfAltApprovers === 0 ? false : true;
              this.approverNumberList.push(alternateApprover.APPROVER_NUMBER);
              altApprover.APPROVER_NUMBER = alternateApprover.APPROVER_NUMBER;
              altApprover.APPROVER_PERSON_ID = alternateApprover.APPROVER_PERSON_ID;
              altApprover.PRIMARY_APPROVER_FLAG = alternateApprover.PRIMARY_APPROVER_FLAG;
              altApprover.IS_ROLE = alternateApprover.IS_ROLE;
              altApprover.approverName = alternateApprover.APPROVER_NAME;
              altApprover.ROLE_TYPE_CODE = alternateApprover.ROLE_TYPE_CODE;
              altApprover.DESCRIPTION = alternateApprover.DESCRIPTION;
              altApprover.MAP_DETAIL_ID = alternateApprover.MAP_DETAIL_ID;
              altApprover.MAP_ID = alternateApprover.MAP_ID;
              sequentialStop.approverDetailsList.push(Object.assign({}, altApprover));
            }
          }
        }
      }
      this.mapData.stopDetailsList.push(Object.assign({}, sequentialStop));
    });
  }

  primaryFlagChanged(event, approver, stop) {
    this.isEdited = true;
    if (approver.PRIMARY_APPROVER_FLAG === 'N') {
      const existingPrimaryApprover = stop.approverDetailsList.filter(user => user.PRIMARY_APPROVER_FLAG === 'Y' &&
        user.APPROVER_NUMBER === approver.APPROVER_NUMBER);
      if (existingPrimaryApprover.length > 0) {
        existingPrimaryApprover[0].PRIMARY_APPROVER_FLAG = 'N';
        approver.PRIMARY_APPROVER_FLAG = 'Y';
      }
    } else {
      const newPrimaryApprovalList = stop.approverDetailsList.filter(user => user.PRIMARY_APPROVER_FLAG === 'N' &&
        user.APPROVER_NUMBER === approver.APPROVER_NUMBER);
      if (newPrimaryApprovalList.length > 0) {
        newPrimaryApprovalList[0].PRIMARY_APPROVER_FLAG = 'Y';
        approver.PRIMARY_APPROVER_FLAG = approver.PRIMARY_APPROVER_FLAG === 'Y' ? 'N' : 'Y';
      } else {
        approver.PRIMARY_APPROVER_FLAG = 'Y';
        event.preventDefault();
      }
    }
  }

  groupBy(jsonData, key) {
    return jsonData.reduce(function (objResult, item) {
      (objResult[item[key]] = objResult[item[key]] || []).push(item);
      return objResult;
    }, {});
  }
  onChange() {
    this.isEdited = true;
  }
  selectUserElasticResult(result) {
    this.onChange();
    if (result === null) {
      this.seachTextModel = '';
      this.approverData.approverName = '';
      this.approverData.APPROVER_PERSON_ID = null;
    } else {
      this.seachTextModel = result.full_name;
      this.approverData.approverName = result.full_name;
      this.approverData.APPROVER_PERSON_ID = result.prncpl_id;
      this.approverData.IS_ROLE = 'N';
    }
  }
}
