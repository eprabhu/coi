import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { CommonService } from '../../../common/services/common.service';
import { NavigationService } from '../../../common/services/navigation.service';
import { isEmptyObject } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BusinessRuleService } from '../common/businessrule.service';
import {
  getSelectedModule, getSelectedSubModule,
  onModuleSelect, onRuleSelect, onUnitSelect, setFilteredData, mapModules,
  setSelectedCriteriaAndDefaultValue
} from '../common/commonFunctions';
import { SelectedCriteria } from '../meta-rule/meta-rule-interface';

@Component({
  selector: 'app-rule-lookups',
  templateUrl: './rule-lookups.component.html',
  styleUrls: ['./rule-lookups.component.css'],
  providers: [AuditLogService,
    { provide: 'moduleName', useValue: 'BUSINESS_RULE' }]
})
export class RuleLookupsComponent implements OnInit, OnDestroy {

  showAll = 'Y';
  businessRuleList: any = [];
  isMapName: boolean;
  isDesc: any;
  searchText: '';
  direction = -1;
  column = 'RULE_TYPE';
  ruleDefinitionResult: any;
  ruleDefinition: any = {};
  mapName: any;
  $subscriptions: Subscription[] = [];
  moduleSubModuleList: any;
  moduleSubModuleResult: any;
  selectedCriteria: SelectedCriteria = new SelectedCriteria();
  ruleId: any;
  deleteRuleId: any;
  NoResultFound: boolean;
  warningMessage: string;
  ruleList: any;
  ruleListResult: any;
  currentRuleId: any;
  showRule = false;
  map = new Map();
  currentRuleName: '';
  inactiveRuleId = null;
  isActive = 'N';
  user = '';
  isInactive: boolean;
  clearField: any;
  requestObject: any = {
    deleteRuleList: [{
      RULE_ID: null,
      IS_ACTIVE: '',
      UPDATE_USER: '',
    }]
  };

  constructor(public ruleService: BusinessRuleService,
              private _router: Router,
              private _commonService: CommonService,
              private navigationService: NavigationService,
              private _auditLogService: AuditLogService) { }

  ngOnInit() {
    if (!isEmptyObject(this.ruleService.filterData) && this.navigationService.previousURL.includes('create')) {
      this.selectedCriteria = setSelectedCriteriaAndDefaultValue(this.ruleService, this.selectedCriteria);
      if (this.ruleService.filterData.MODULE_CODE && this.ruleService.filterData.UNIT_NUMBER && this.ruleService.filterData.RULE_TYPE) {
        this.getFilteredRuleList();
      }
    } else {
      this.ruleService.completerModuleListOptions.defaultValue = null;
      this.ruleService.completerRuleListOptions.defaultValue = null;
      this.ruleService.completerUnitListOptions.defaultValue = null;
      this.selectedCriteria = new SelectedCriteria();
      setFilteredData(this.ruleService, this.selectedCriteria);
    }
  }

  sortBy(property): void {
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  editRule(ruleId): void {
    this._router.navigate(['fibi/businessRule/create'], { queryParams: { ruleId: ruleId } });
  }

  onValueSelect(selectedItem, option): void {
    if (option === 'module') {
      this.selectedCriteria = onModuleSelect(selectedItem, this.selectedCriteria, this.ruleService);
    } else if (option === 'condition') {
      this.selectedCriteria = onRuleSelect(selectedItem, this.selectedCriteria, this.ruleService);
    } else {
      this.selectedCriteria = onUnitSelect(selectedItem, this.selectedCriteria, this.ruleService);
    }
  }

  createRule(): void {
    if (this.selectedCriteria.unitNumber && this.selectedCriteria.moduleCode && this.selectedCriteria.ruleCode) {
      if (this.ruleService.moduleSubModuleList) {
        this.ruleService.filterData.moduleList = mapModules(this.ruleService.moduleSubModuleList);
      }
      setFilteredData(this.ruleService, this.selectedCriteria);
      this.ruleService.filterData.moduleIndex = this.ruleService.filterData.moduleList ?
        getSelectedModule(this.ruleService.filterData) : null;
      this.ruleService.filterData.submodule = this.ruleService.filterData.moduleList ?
        getSelectedSubModule(this.ruleService.filterData) : null;
    } else {
      this.ruleService.filterData = {};
    }
    this._router.navigate(['fibi/businessRule/create'], { queryParams: { ruleId: this.ruleId } });
  }

  deleteBusinessRule(): void {
    // tslint:disable-next-line: triple-equals
    const deleteIndex = this.businessRuleList.findIndex(ele => ele.RULE_ID == this.deleteRuleId);
    let before = this.prepareAuditLogObject(this.deleteRuleId);
    this.$subscriptions.push(this.ruleService.deleteBusinessRule(this.deleteRuleId).subscribe(
      data => {
        this.businessRuleList.splice(deleteIndex, 1);
        this._auditLogService.saveAuditLog('D', before, null, 'BUSINESS_RULE', Object.keys(before), this.deleteRuleId)
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Business Rule deleted successfully.');
        this.deleteRuleId = null;
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Business Rule failed. Please try again.');
        this.deleteRuleId = null;
      }));
  }

  private prepareAuditLogObject(deleteId): any {
    let rule = this.businessRuleList.find(ele => ele.RULE_ID == deleteId);
    let ruleAuditLog = {
          'Module': rule.MODULE_NAME,
          'Submodule': rule.SUB_MODULE_CODE ? rule.RULE_APPLIED_TO : '--NONE--',
          'Used For': this.getRuleType(rule.RULE_TYPE),
          'Unit': rule.UNIT_NUMBER + '-' + rule.UNIT_NAME,
          'Description': rule.DESCRIPTION,
          'IS_ACTIVE': rule.IS_ACTIVE
    }
    return ruleAuditLog;
  }

  private getRuleType(ruleType): any {
    switch (ruleType) {
      case 'N': return 'Notification';
      case 'Q': return 'Questionnaire';
      case 'R': return 'Routing';
      case 'VE': return 'Validation-Error';
      case 'VW': return 'Validation-Warning';
    }
  }

  getFilteredRuleList(): any {
    if (this.checkSearchFieldsFilled()) {
      setFilteredData(this.ruleService, this.selectedCriteria);
      this.$subscriptions.push(this.ruleService.getRuleList(this.getRequestObject()).subscribe(data => {
        this.ruleListResult = data;
        this.businessRuleList = this.ruleList = JSON.parse(JSON.stringify(this.ruleListResult.businessRule.rule));
        if (this.ruleList.length === 0) {
          this.NoResultFound = true;
          this.warningMessage = 'No rules found for this combination';
        } else {
          this.NoResultFound = false;
          this.isMapName = this.selectedCriteria.ruleCode === 'R';
        }
      }));
    }
  }

  private getRequestObject(): any {
    const requestObject: any = {};
    requestObject.moduleCode = this.selectedCriteria.moduleCode;
    requestObject.subModuleCode = this.selectedCriteria.subModuleCode;
    requestObject.unitNumber = this.selectedCriteria.unitNumber;
    requestObject.ruleType = this.selectedCriteria.ruleCode;
    requestObject.showActive= this.selectedCriteria.showActive =this.showAll;
    return requestObject;
  }

  viewRule(rule): void {
    this.currentRuleId = rule.RULE_ID;
    this.showRule = true;
  }

  closeModal($event): void {
    this.showRule = false;
    this.currentRuleId = null;
  }

  private checkSearchFieldsFilled(): boolean {
    this.map.clear();
    if (!this.selectedCriteria.moduleCode) {
      this.map.set('module', 'Please select module');
    }
    if (!this.selectedCriteria.unitNumber) {
      this.map.set('unit', 'Please select unit');
    }
    if (!this.selectedCriteria.ruleCode) {
      this.map.set('rule', 'Please select rule');
    }
    return this.map.size > 0 ? false : true;
  }

  inActivateRule(ruleId, isActive, user, description): void {
    this.currentRuleName = description;
    this.inactiveRuleId = ruleId;
    if (isActive === 'Y') {
      this.isInactive = false;
    } else {
      this.isInactive = true;
    }
    this.isActive = isActive;
    this.user = user;
  }

  inActivate(inactiveRuleId, isActive, user): void {
    let before = this.prepareAuditLogObject(inactiveRuleId);
    this.requestObject.deleteRuleList[0].RULE_ID = inactiveRuleId;
    if (isActive === 'Y') {
      this.requestObject.deleteRuleList[0].IS_ACTIVE = 'N';
    } else {
      this.requestObject.deleteRuleList[0].IS_ACTIVE = 'Y';
    }
    this.requestObject.deleteRuleList[0].UPDATE_USER = user;
    this.$subscriptions.push(this.ruleService.inActivateRule(this.requestObject).subscribe(
      data => {
        const rule = this.ruleList.find(type => type.RULE_ID === inactiveRuleId);
        const resultList = this.ruleListResult.businessRule.rule.find(type => type.RULE_ID === inactiveRuleId);
        if (isActive === 'Y') {
          rule.IS_ACTIVE = 'N';
          resultList.IS_ACTIVE = 'N';
        } else {
          rule.IS_ACTIVE = 'Y';
          resultList.IS_ACTIVE = 'Y';
        }
        let after = this.prepareAuditLogObject(inactiveRuleId);
        this._auditLogService.saveAuditLog('U', before, after, 'BUSINESS_RULE', Object.keys(after), inactiveRuleId);
      }));
  }

  isActivateCancelled(): void {
    (document.getElementById(this.inactiveRuleId) as HTMLInputElement).checked = !this.isInactive;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
