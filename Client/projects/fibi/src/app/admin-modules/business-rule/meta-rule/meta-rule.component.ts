import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import {
  getSelectedModule, getSelectedSubModule, onModuleSelect,
  onRuleSelect, onUnitSelect, setFilteredData, setCompleterOptions, setSelectedCriteriaAndDefaultValue, mapModules
} from '../common/commonFunctions';
import { BusinessRuleService } from '../common/businessrule.service';
import { DeleteObject, MetaRule, SelectedCriteria } from './meta-rule-interface';
import { NavigationService } from '../../../common/services/navigation.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { isEmptyObject } from '../../../common/utilities/custom-utilities';

declare var $: any;

@Component({
  selector: 'app-meta-rule',
  templateUrl: './meta-rule.component.html',
  styleUrls: ['./meta-rule.component.css']
})
export class MetaRuleComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  ruleId: any;
  ruleList: any;
  isDesc: any;
  direction = -1;
  column = 'DESCRIPTION';
  warningMessage: string;
  completerSubModuleOptions: any;
  metaRule: MetaRule = new MetaRule();
  metaRuleDesc: any;
  selectedOption = 'T';
  metaRuleDetails: any = {};
  isMetaRulesAvailable: any;
  metaRulesDto: any = [];
  selectedNode: any;
  currentNodeNumber: any;
  currentRuleId: any;
  isCreateMode = false;
  isSearchDone = false;
  map = new Map();
  deleteObject: DeleteObject = new DeleteObject();
  showIfFalse = true;
  showNext = true;
  showIfTrue = true;
  showRule = false;
  selectedIndex: any;
  selectedCriteria: SelectedCriteria = new SelectedCriteria();
  isEditDescription = false;
  disableSearch = true;
  clearField: any;
  errorMessage: any;

  constructor(public ruleService: BusinessRuleService,
    private _router: Router,
    public commonService: CommonService,
    private _navigateService: NavigationService) { }

  ngOnInit() {
    if (!isEmptyObject(this.ruleService.filterData) && this._navigateService.previousURL.includes('create')) {
      this.selectedCriteria = setSelectedCriteriaAndDefaultValue(this.ruleService, this.selectedCriteria);
      if (this.ruleService.filterData.MODULE_CODE && this.ruleService.filterData.UNIT_NUMBER && this.ruleService.filterData.RULE_TYPE) {
        this.selectedCriteria.ruleCode = 'R';
        this.fetchMetaRules('search');
      }
    } else {
      this.ruleService.completerModuleListOptions.defaultValue = null;
      this.ruleService.completerUnitListOptions.defaultValue = null;
      this.selectedCriteria = new SelectedCriteria();
      setFilteredData(this.ruleService, this.selectedCriteria);
    }
    this.setDefaultValue();
  }

  private setDefaultValue(): void {
    this.ruleService.completerRuleListOptions.defaultValue = 'Routing';
    this.selectedCriteria.ruleName = 'Routing';
    this.selectedCriteria.ruleCode = 'R';
    this.disableSearch = true;
    if (this.selectedCriteria.moduleCode && this.selectedCriteria.unitNumber && this.selectedCriteria.ruleCode) {
      setFilteredData(this.ruleService, this.selectedCriteria);
    }
  }

  onValueSelect(selectedItem, option): void {
    if (option === 'module') {
      this.selectedCriteria = onModuleSelect(selectedItem, this.selectedCriteria, this.ruleService);
      if (selectedItem && this.isCreateMode) {
        this.getSubmodules();
      }
    } else if (option === 'condition') {
      this.selectedCriteria = onRuleSelect(selectedItem, this.selectedCriteria, this.ruleService);
    } else {
      this.selectedCriteria = onUnitSelect(selectedItem, this.selectedCriteria, this.ruleService);
    }
    if (this.selectedCriteria.moduleCode && this.selectedCriteria.unitNumber && this.selectedCriteria.ruleCode) {
      setFilteredData(this.ruleService, this.selectedCriteria);
    }
  }

  private getFilteredRuleList(): void {
    this.ruleList = [];
    if (this.checkSearchFieldsFilled()) {
      this.$subscriptions.push(this.ruleService.getRuleList(this.getRequestObject('businessRuleList')).subscribe(
        (data: any) => {
          this.ruleList = JSON.parse(JSON.stringify(data.businessRule.rule));
          $('#addNewRule').modal('show');
        }));
    }
  }

  private getRequestObject(type): any {
    const requestObject: any = {};
    requestObject.moduleCode = this.selectedCriteria.moduleCode;
    requestObject.subModuleCode = this.selectedCriteria.subModuleCode;
    requestObject.unitNumber = this.selectedCriteria.unitNumber;
    type === 'businessRuleList' ? requestObject.ruleType = this.selectedCriteria.ruleCode :
                                  requestObject.metaRuleType = this.selectedCriteria.ruleCode;
    return requestObject;
  }

  getSubmodules(): void {
    this.getModuleAndSubModule();
    this.ruleService.completerModuleListOptions =
                      setCompleterOptions(this.ruleService.filterData.moduleList, 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
    this.completerSubModuleOptions = setCompleterOptions(this.ruleService.filterData.moduleIndex > -1 ?
                      this.ruleService.filterData.moduleList[this.ruleService.filterData.moduleIndex].subModules : [],
                      'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
    if (this.ruleService.filterData.moduleIndex > -1) {
        this.ruleService.completerModuleListOptions.defaultValue = this.ruleService.filterData.SUB_MODULE_CODE ?
                                                                    this.ruleService.filterData.submodule.moduleName :
                                                                    this.ruleService.filterData.MODULE_NAME;
        this.completerSubModuleOptions.defaultValue = this.ruleService.filterData.SUB_MODULE_CODE ?
                                                      this.ruleService.filterData.MODULE_NAME : '';
    }
  }

  createRule(): void {
    if (this.selectedCriteria.unitNumber && this.selectedCriteria.moduleCode && this.selectedCriteria.ruleCode) {
      this.getModuleAndSubModule();
    } else {
      this.ruleService.filterData = {};
    }
    this._router.navigate(['fibi/businessRule/create'], { queryParams: { ruleId: this.ruleId } });
  }

  private getModuleAndSubModule(): void {
    if (this.ruleService.moduleSubModuleList) {
      this.ruleService.filterData.moduleList = mapModules(this.ruleService.moduleSubModuleList);
    }
    if (this.selectedCriteria.moduleCode) {
      setFilteredData(this.ruleService, this.selectedCriteria);
      this.ruleService.filterData.moduleIndex =
        this.ruleService.filterData.moduleList ? getSelectedModule(this.ruleService.filterData) : null;
      this.ruleService.filterData.submodule =
        this.ruleService.filterData.moduleList ? getSelectedSubModule(this.ruleService.filterData) : null;
    }
  }

  prepareMetaRuleObject(): void {
    if (this.selectedCriteria.ruleId) {
      this.metaRuleDetails.ruleId = this.selectedCriteria.ruleId;
      this.metaRuleDetails.parentNode = this.currentNodeNumber || null;
      this.metaRule.metaRuleDetails = [];
      this.metaRule.metaRuleDetails.push(this.metaRuleDetails);
      this.createMetaRule();
    } else {
      this.commonService.showToast(HTTP_ERROR_STATUS, 'Please select one rule to add new node.');
    }
  }

  createMetaRule(): void {
    this.setMetaRule();
    this.isMetaRulesAvailable = this.metaRulesDto && this.metaRulesDto.length > 0 ? true : false;
    const RULE_CONDITION = this.metaRulesDto && this.metaRulesDto.length > 0 ? this.selectedOption : null;
    this.$subscriptions.push(this.ruleService.createMetaRule
      (RULE_CONDITION, this.metaRule, this.isMetaRulesAvailable, this.currentNodeNumber).subscribe((data: any) => {
        this.metaRule = data.metaRule;
        this.metaRulesDto = data.metaRuleDtos;
        this.currentRuleId = data.metaRule.metaRuleId;
        this.isSearchDone = true;
        this.currentNodeNumber = null;
        $('#addNewRule').modal('hide');
    }));
  }

  private setMetaRule(): void {
    this.metaRule.moduleCode = this.selectedCriteria.moduleCode;
    this.metaRule.subModuleCode = this.selectedCriteria.subModuleCode;
    this.metaRule.description = this.metaRuleDesc;
    this.metaRule.unitNumber = this.selectedCriteria.unitNumber;
    this.metaRule.metaRuleType = this.selectedCriteria.ruleCode;
    this.metaRule.metaRuleId = this.currentRuleId;
  }

  onSubModuleSelect(event): void {
    if (event) {
      this.selectedCriteria.moduleCode = event.MODULE_CODE;
      this.selectedCriteria.moduleName = event.DESCRIPTION;
      this.selectedCriteria.subModuleCode = event.SUB_MODULE_CODE;
    } else {
      this.selectedCriteria.moduleCode = null;
      this.selectedCriteria.subModuleCode = null;
      this.selectedCriteria.moduleName = null;
    }
    if (this.selectedCriteria.moduleCode && this.selectedCriteria.unitNumber && this.selectedCriteria.ruleCode) {
      setFilteredData(this.ruleService, this.selectedCriteria);
    }
  }

  clearModal(): void {
    this.selectedOption = 'T';
    this.selectedCriteria.ruleId = null;
    this.metaRule = new MetaRule();
    this.warningMessage = null;
    this.errorMessage = null;
    this.showIfFalse = this.showIfTrue = this.showNext = true;
    $('#addNewRule').modal('hide');
  }

  fetchMetaRules(clickedOption): void {
    if (this.checkSearchFieldsFilled()) {
      this.isSearchDone = true;
      this.$subscriptions.push(this.ruleService.getMetaRuleList(this.getRequestObject('metaRule')).subscribe((data: any) => {
        if (data) {
          this.updateDataAfterFetch(data, clickedOption);
        }
      }, err => {
        this.commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Meta Rules failed. Please try again.');
      }));
    }
  }

  private updateDataAfterFetch(data, clickedOption): void {
    this.metaRule = data.metaRule ? Object.assign({}, data.metaRule) : null;
    this.metaRulesDto = data.metaRuleDtos ? data.metaRuleDtos : [];
    this.metaRuleDesc = this.metaRule &&
        this.metaRule.description ? this.metaRule.description : this.metaRuleDesc;
    this.currentRuleId = this.metaRule ? this.metaRule.metaRuleId : null;
    if (clickedOption === 'search') {
      this.setCreateMode();
    } else if (!data.metaRuleDtos || data.metaRuleDtos.length === 0) {
      this.getFilteredRuleList();
      this.metaRule = new MetaRule();
    }
  }

  private setCreateMode(): void {
    if (this.metaRulesDto && this.metaRulesDto.length > 0) {
      this.isCreateMode = true;
      this.getSubmodules();
    } else {
      this.isCreateMode = false;
    }
  }

  deleteRule(): void {
    this.$subscriptions.push(this.ruleService.deleteMetaRule
      (this.deleteObject).subscribe((data: any) => {
        this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Node deleted successfully.');
        $('#deleteConfirmationModal').modal('hide');
        this.updateTree(this.metaRulesDto);
        if (this.metaRule.metaRuleDetails) {
          const deletedIndex = this.metaRule.metaRuleDetails.findIndex(ele => ele.metaRuleDetailId === this.deleteObject.metaRuleDetailId);
          this.metaRule.metaRuleDetails.splice(deletedIndex, 1);
        }
        this.metaRuleDesc = !this.metaRulesDto || this.metaRulesDto.length === 0 ? '' : this.metaRuleDesc;
        this.deleteObject = new DeleteObject();
      }, err => {
        this.commonService.showToast(HTTP_ERROR_STATUS, 'Deleting node from Meta Rule failed. Please try again.');
      }));
  }

  private updateTree(rulesList): void {
    rulesList.forEach((ele: any, index) => {
      // tslint:disable-next-line: triple-equals
      if (ele.metaRuleDetailId == this.deleteObject.metaRuleDetailId) {
        rulesList.splice(index, 1);
      } else if (ele.childNodes) {
        this.updateTree(ele.childNodes);
      }
    });
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

  listClick(event, node, index): void {
    this.selectedNode = node;
    this.selectedIndex = index;
    event.stopPropagation();
  }

  addNewNode(node): void {
    if (node.childNodes && node.childNodes.length > 0) {
      if (node.childNodes[0].nodeCondition === 'N' || node.childNodes.length === 2) {
        $('#addWarningModal').modal('show');
      } else {
        this.warningMessage = 'Cannot add a NEXT condition.The TRUE/FALSE condition has already been defined in the rule.';
        this.setNewNodeValues(node);
        this.showNext = false;
        this.setDefaultSelectedOption(node);
      }
    } else {
      this.setNewNodeValues(node);
      this.showNext = true;
    }
  }

  private setNewNodeValues(node): void {
    this.getFilteredRuleList();
    this.currentRuleId = node.metaRuleId;
    this.currentNodeNumber = node.nodeNumber;
  }

  private setDefaultSelectedOption(node): void {
    if (node.childNodes[0].nodeCondition === 'F') {
      this.showIfTrue = true;
      this.showIfFalse = false;
      this.selectedOption = 'T';
    } else {
      this.showIfFalse = true;
      this.showIfTrue = false;
      this.selectedOption = 'F';
    }
  }

  deleteNode(node): void {
    this.deleteObject.ruleName = node.ruleName;
    if (node.childNodes && node.childNodes.length > 0) {
      this.deleteObject.isChildAvailable = true;
    } else {
      this.deleteObject.isChildAvailable = false;
      this.deleteObject.metaRuleDetailId = node.metaRuleDetailId;
      this.deleteObject.parentNodeNumber = node.parentNodeNumber;
      this.deleteObject.condition = node.nodeCondition;
      this.deleteObject.metaRuleId = node.metaRuleId;
      // tslint:disable-next-line: triple-equals
      this.deleteObject.isRootNode = node.parentNodeNumber == 0 && node.childNodes.length === 0 ? true : false;
    }
    $('#deleteConfirmationModal').modal('show');
  }

  viewRule(node): void {
    this.currentRuleId = node.ruleId;
    this.showRule = true;
  }

  closeModal(event): void {
    this.showRule = event;
    this.currentRuleId = null;
  }

  clearMetaRule(): void {
    this.metaRulesDto = [];
    this.isCreateMode = false;
    this.metaRuleDesc = null;
    this.isSearchDone = false;
    this.isEditDescription = false;
    this.selectedNode = null;
    this.ruleService.completerModuleListOptions =
      setCompleterOptions(this.ruleService.moduleSubModuleList, 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
    this.selectedCriteria = setSelectedCriteriaAndDefaultValue(this.ruleService, this.selectedCriteria);
  }

  sortBy(property): void {
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  cancelEdit(): void {
    this.metaRuleDesc = this.metaRule ? this.metaRule.description : '';
    this.isEditDescription = false;
  }

  ngOnDestroy(): void {
    subscriptionHandler(this.$subscriptions);
  }
}
