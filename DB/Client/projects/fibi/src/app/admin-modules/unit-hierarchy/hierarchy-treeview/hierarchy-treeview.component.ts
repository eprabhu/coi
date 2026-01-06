import { Component, OnInit, OnDestroy } from '@angular/core';

import { UnitHierarchyService } from '../unit-hierarchy.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { getEndPointOptionsForOrganization } from '../../../common/services/end-point.config';
import { getCompleterOptionsForLeadUnit } from '../../../common/services/completer.config';
import { concatUnitNumberAndUnitName, isEmptyObject } from '../../../common/utilities/custom-utilities';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { ROOT_UNIT_NUMBER } from '../../../app-constants';

class Unit {
  unitNumber: any = null;
  parentUnitNumber: any = null;
  parentUnitName: any = null;
  unitName: string = null;
  organizationId: any = null;
  organizationName: any = null;
  updateUser: any = null;
  active = true;
  unitAdministrators: Array<any>;
}
class UnitProperties {
  unit: Unit = new Unit();
  acType: any;
  parentUnitChanged = false;
}

@Component({
  selector: 'app-hierarchy-treeview',
  templateUrl: './hierarchy-treeview.component.html',
  styleUrls: ['./hierarchy-treeview.component.css'],
  providers: [AuditLogService,
  { provide: 'moduleName', useValue: 'UNIT_HIERARCHY' }]
})

export class HierarchyTreeviewComponent implements OnInit, OnDestroy {

  unitProperties: UnitProperties = new UnitProperties();
  unitAdministratorsObject: any = {};
  elasticSearchOptions: any = {};
  isAdministratorsRepeat = false;
  isUnitNumEmpty = false;
  isUnitNumLength = false;
  isUnitNumRepeat = false;
  isValueChanged = false;
  isUnitNameEmpty = false;
  isUnitNameLength = false;
  isParentUnitNumEmpty = false;
  isEditmode = false;
  isSameUnit = false;
  unitAdministratorTypeList: any = [];
  tempUnitAdministrators: any = [];
  isAdmnUserEmpty: any = [];
  isAdmnTypeEmpty: any = [];
  tempAdmnArray: any = [];
  isPersonEdit: any = [];
  treeData: any = [];
  selectedNode: any;
  searchText: any;
  clearField: any;
  unitId: any;
  unitList: any;
  viewUnitProperties: any = {
    unit: {
      unitAdministrators: []
    }
  };
  isMaintainUserRoles = false;
  $subscriptions: Subscription[] = [];
  unitHierarchySearchOptions: any = {};
  parentUnitHierarchySearchOptions: any = {};
  isSaving = false;
  unitHttpOptions: any = {};
  clearUnitField;
  helpInfo = false;
  mode = '';
  clearParentUnitField: any;
  clearSearchUnitField: any;
  isParenUnitDisabled = false;
  before = {};

  constructor(private _treeService: UnitHierarchyService, public _commonService: CommonService,
    private _elasticConfig: ElasticConfigService,  private _auditLogService: AuditLogService) { }

  ngOnInit() {
    this.unitProperties.unit.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.getSearchList();
    this.getTreeViewList(true);
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    this.getPermissions();
    this.unitHttpOptions = getEndPointOptionsForOrganization();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  OrgSelectionFunction(event: any) {
    this.unitProperties.unit.organizationId = event ? event.organizationId : null;
    this.unitProperties.unit.organizationName = event ? event.organizationName : null;
    this.isValueChanged = true;
  }

  setCompleterListOptionsForRoles() {
    this.unitHierarchySearchOptions = getCompleterOptionsForLeadUnit(this.unitList);
    this.parentUnitHierarchySearchOptions = getCompleterOptionsForLeadUnit(this.unitList);
  }

  fetchunit(event: any) {
    if (event) {
      this.unitProperties.unit.unitNumber = event.unitNumber;
      this.unitProperties.unit.unitName = event.unitName;
      this.viewUnitDetails(this.unitProperties.unit.unitNumber);
    }
  }

  checkForChild(node) {
      this.isParenUnitDisabled = node.childUnits && node.childUnits.length > 0 ? true : false;
  }
  /**
   * Get treeview data for unit hierarchy list
   */
  getTreeViewList(isInitialLoad = false) {
    this.$subscriptions.push(this._treeService.getHierarchylist().subscribe((data: any) => {
      this.treeData = data.unitHierarchyList;
      this.unitAdministratorTypeList = data.unitAdministratorTypeList;
      const ROOT_UNIT_NUMBER = data.unitNumber || (this.treeData.length ? this.treeData[0].unitNumber : '');
      if (ROOT_UNIT_NUMBER && isInitialLoad) {
        this.viewUnitDetails(ROOT_UNIT_NUMBER, isInitialLoad);
      }
      isInitialLoad ? this.openRootAndChild() : this.openAllNodes(this.treeData);
    }));
  }
  /**
  * Get search data for unit hierarchy list
  */
  getSearchList() {
      this.$subscriptions.push(this._treeService.getUnitList().subscribe((data: any) => {
        this.unitList = data;
        this.setCompleterListOptionsForRoles();
      }));

  }
  /**
   * @param  {} event
   * @param  {} node
   * Accordion functionality on clicking a specific node
   */
  listClick(event, node) {
    this.selectedNode = node;
    node.visible = !node.visible;
    event.stopPropagation();
  }
  /**
   * @param  {} nodes
   * Expand every nodes in the treeview
   */
  openAllNodes(nodes) {
    nodes.forEach(node => {
      node.visible = true;
      if (node.childUnits) {
        this.openAllNodes(node.childUnits);
      }
    });
  }
  /**
  * @param  {} unitId
  * Scroll to specific node and highlight it on selecting specific field in the search box
  */
  selectUnit(unitId) {
    this.openAllNodes(this.treeData);
    if (document.getElementsByClassName('highlight-node')[0]) {
      document.getElementsByClassName('highlight-node')[0].classList.remove('highlight-node');
    }
    setTimeout(() => {
      this.unitId = document.getElementById(unitId);
      if (this.unitId && unitId) {
        this.unitId.scrollIntoView({ behavior: 'instant', block: 'center' });
        this.unitId.classList.add('highlight-node');
      }
    });
    this.searchText = '';
  }
  /**
   * @param  {} node
   * sets the parent node for the new unit to be added,resets input fields & validators.
   */
  addNewUnitParentSet(node, mode) {
    this.isParenUnitDisabled = false;
    this.unitProperties = new UnitProperties();
    this.mode = mode;
    mode === 'add' ? this.setAddUnitModal(node) : this.setCopyUnitModal(node);
    this.selectUnit(node.unitNumber);
    this.unitProperties.acType = 'I';
    this.validatorsReset();
    this.clearUnitField = new String('true');
    this.unitHttpOptions.defaultValue = '';
  }

  setAddUnitModal(node) {
    this.clearParentUnitField = new String('false');
    this.unitProperties.unit.parentUnitNumber = node.unitNumber;
    this.unitProperties.unit.parentUnitName = node.unitName;
    this.unitProperties.unit.unitAdministrators = [];
    this.unitProperties.unit.unitName = null;
    this.parentUnitHierarchySearchOptions.defaultValue
        = node.unitNumber ? concatUnitNumberAndUnitName(node.unitNumber, node.unitName) : '';
  }

  setCopyUnitModal(node) {
    this.clearParentUnitField = new String('true');
    this.unitProperties.unit.unitName = 'Copy of ' + node.unitName;
    this.$subscriptions.push(this._treeService.viewUnitDetails(node.unitNumber).subscribe((data: any) => {
      this.unitProperties.unit.unitAdministrators = data.unit.unitAdministrators;
    }));
  }

  /**
   * Checks empty validations To add new unit under selected unit(considers parent unit, unit number and unit name).
   * calls function which calls service to add new unit if the validations are correct.
   */
  addNewUnit() {
   // we are skipping parent unit check incase the editing unit is root unit.
    this.isParentUnitNumEmpty =
        this.unitProperties.unit.unitNumber !== ROOT_UNIT_NUMBER && !this.unitProperties.unit.parentUnitNumber ? true : false;
    this.isUnitNumEmpty = !this.unitProperties.unit.unitNumber  ? true :  false;
    this.isUnitNameEmpty = !this.unitProperties.unit.unitName ? true :  false;
    this.isSameUnit =  this.unitProperties.unit.parentUnitNumber ?
    (this.unitProperties.unit.unitNumber === this.unitProperties.unit.parentUnitNumber) ? true : false : false;
    if (this.unitAdministratorsObject.personId !== '' && this.unitAdministratorsObject.unitAdministratorTypeCode === '') {
      this.isAdmnTypeEmpty[this.unitProperties.unit.unitAdministrators.length] = true;
    } else if (this.unitAdministratorsObject.unitAdministratorTypeCode !== '' && this.unitAdministratorsObject.personId === '') {
      this.isAdmnUserEmpty[this.unitProperties.unit.unitAdministrators.length] = true;
    } else {
      this.isAdmnTypeEmpty[this.unitProperties.unit.unitAdministrators.length] = false;
      this.isAdmnUserEmpty[this.unitProperties.unit.unitAdministrators.length] = false;
    }
    if (this.unitAdministratorsObject.personId !== '' && this.unitAdministratorsObject.unitAdministratorTypeCode !== '') {
      this.addUnitAdministrator(this.unitAdministratorsObject);
    }
    this.administratorEmptyValidation();
    if (!this.isUnitNumEmpty && !this.isUnitNumLength && !this.isUnitNumRepeat && !this.isParentUnitNumEmpty &&
      !this.isUnitNameEmpty && !this.isUnitNameLength && !this.isAdministratorsRepeat && !this.isSameUnit) {
      if (!this.isAdmnTypeEmpty.find((key) => key === true) && !this.isAdmnUserEmpty.find((key) => key === true)) {
        this.saveUnit();
      }
    }
    this.clearField = new String('true');
  }
  /**
   * calls delete service to delete all the administrators stored in the tempAdmnArray and adds a new unit.
   */
  saveUnit() {
    if (this.isValueChanged) {
      if (this.tempAdmnArray.length !== 0) {
        this.$subscriptions.push(this._treeService.deleteUnitAdministrator(this.tempAdmnArray).subscribe());
      }
      this.unitProperties.parentUnitChanged = this.unitProperties.parentUnitChanged ? this.unitProperties.parentUnitChanged : false;
      this.$subscriptions.push(this._treeService.addNewUnit(this.unitProperties)
        .subscribe((data: any) => {
          if (data === 'Units are added successfully') {
            document.getElementById('closeModal').click();
            this.getAdministrativeTypeObject();
            this.getTreeViewList();
            this.getSearchList();
            this.viewUnitDetails(this.unitProperties.unit.unitNumber);
            setTimeout(() => {
              this.unitId = document.getElementById(this.unitProperties.unit.unitNumber);
              this.unitId.scrollIntoView({ behavior: 'instant', block: 'center' });
              this.unitId.classList.add('highlight-node');
            }, 1000);
            this.validatorsReset();
            this.saveAuditLog();
          }
        }));
    } else { document.getElementById('closeModal').click(); }
  }

  private getAdministrativeTypeObject(): void {
    this.unitProperties.unit.unitAdministrators.forEach((ele) => {
      if(!ele.unitAdministratorType || isEmptyObject(ele.unitAdministratorType) || 
          (ele.oldUnitAdministratorTypeCode && ele.oldUnitAdministratorTypeCode != ele.unitAdministratorTypeCode)) {
        ele.unitAdministratorType = this.unitAdministratorTypeList.find(element => element.code == ele.unitAdministratorTypeCode);
      }
    });
  }

  private prepareAuditLogObject(unitDetails): any {
    let unitAuditLog = {
      'organizationName': unitDetails.organizationId ? `${unitDetails.organizationId} - ${unitDetails.organizationName}` : '--NONE--',
      'parentUnit': `${unitDetails.parentUnitNumber} - ${unitDetails.parentUnitName}`,
      'Unit Administrators': this.mapUnitAdminsString(unitDetails.unitAdministrators),
      'unit': `${unitDetails.unitNumber} - ${unitDetails.unitName}`
    }
    return unitAuditLog;
  }

  private saveAuditLog(): void {
    let after = this.prepareAuditLogObject(this.unitProperties.unit);
    if (this.mode === 'add' || this.mode == 'copy') {
      this._auditLogService.saveAuditLog('I', {}, after, null, Object.keys(after), this.unitProperties.unit.unitNumber);
    } else {
      this._auditLogService.saveAuditLog('U', this.before, after, null, Object.keys(after), this.unitProperties.unit.unitNumber);
    }
  }

  private mapUnitAdminsString(administrators): Array<any> {
    return administrators.map(ele => `${ele.fullName} as ${ele.unitAdministratorType.description}`);
  }
  
  /**
   * @param  {} value
   * @param  {} index
   * @param  {} administrator
   * select a result from elastic search when editing adminastrator
   */
  selectUserElasticResult(value, index, administrator) {
    if (value) {
      this.unitProperties.unit.unitAdministrators[index].personId = value.prncpl_id;
      this.isAdmnUserEmpty[index] = false;
      this.isValueChanged = true;
      this.administratorRepeatValidation(administrator, index);
    } else {
        this.isValueChanged = false;
        this.unitProperties.unit.unitAdministrators[index].personId = '';
        this.isAdmnUserEmpty[index] = true;
    }
  }
  /**
   * @param  {} administrator
   * push new administrator object to unitAdministartor array if administrators not repeated
   */
  addUnitAdministrator(administrator) {
    this.administratorRepeatValidation(administrator, null);
    if (administrator.personId !== '' && administrator.unitAdministratorTypeCode !== '' && !this.isAdministratorsRepeat) {
      this.isValueChanged = true;
      this.clearField = new String('true');
      administrator.unitNumber = this.unitProperties.unit.unitNumber;
      this.unitProperties.unit.unitAdministrators.push(administrator);
      this.isPersonEdit.push(true);
      this.unitAdministratorsObjectReset();
    }
  }
  viewUnitDetails(unitNumber, isInitialLoad = false) {
    this.validatorsReset();
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._treeService.viewUnitDetails(unitNumber).subscribe((data: any) => {
        this.unitProperties = data;
        this.before = this.prepareAuditLogObject(this.unitProperties.unit);
        this.viewUnitProperties = JSON.parse(JSON.stringify(data));
        isInitialLoad ? this.openRootAndChild() : this.selectUnit(unitNumber);
        this.unitProperties.acType = 'U';
        this.tempUnitAdministrators = JSON.parse(JSON.stringify(data.unit.unitAdministrators));
        this.unitProperties.unit.unitAdministrators.forEach(element => { this.isPersonEdit.push(true); });
        this.unitHttpOptions.defaultValue = this.viewUnitProperties.unit.organizationName;
        this.parentUnitHierarchySearchOptions.defaultValue
          = this.unitProperties.unit.parentUnitNumber ?
          concatUnitNumberAndUnitName(this.unitProperties.unit.parentUnitNumber, this.unitProperties.unit.parentUnitName) : '';
        this.clearUnitField = new String('false');
        this.clearParentUnitField = new String('false');
        this.clearField = new String('true');
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    }
  }

  openRootAndChild() {
    this.treeData.forEach(node => {
      node.visible = true;
    });
  }
  /**
   * @param  {} id
   * allows to change selected administrator person
   */
  adminPersonEdit(id, type, administrator) {
    this.unitProperties.unit.unitAdministrators.forEach((value, index) => {
      if (index === id) {
        (this.isPersonEdit[index]) ? this.isPersonEdit[index] = false : this.isPersonEdit[index] = true;
      } else {
        this.isPersonEdit[index] = true;
      }
    });
    if (type === 'edit') {
      this.unitProperties.unit.unitAdministrators[id].oldPersonId = this.tempUnitAdministrators[id].personId;
      this.unitProperties.unit.unitAdministrators[id].oldUnitAdministratorTypeCode =
        this.unitProperties.unit.unitAdministrators[id].unitAdministratorTypeCode;
      this.elasticSearchOptions.defaultValue = this.unitProperties.unit.unitAdministrators[id].fullName;
    }
    if (type === 'undo') {
      this.unitProperties.unit.unitAdministrators[id].personId = this.tempUnitAdministrators[id].personId;
      this.isAdmnUserEmpty[id] = false;
      this.administratorRepeatValidation(administrator, id);
    }
  }
  /**
   * @param  {} index
   * removes selected object from unitAdministrator array when editing existing units & stores removed unit administrators in tempAdmnArray
   */
  deleteUnitAdministrator(index) {
    if (this.unitProperties.unit.unitAdministrators[index].unitNumber) {
      delete this.unitProperties.unit.unitAdministrators[index].unitAdministratorType;
      delete this.unitProperties.unit.unitAdministrators[index].fullName;
      this.tempAdmnArray.push(this.unitProperties.unit.unitAdministrators[index]);
      this.unitProperties.unit.unitAdministrators.splice(index, 1);
      this.isPersonEdit.splice(index, 1);
      this.isAdmnUserEmpty.splice(index, 1);
      this.isAdmnTypeEmpty.splice(index, 1);
      this.isValueChanged = true;
      this.isAdministratorsRepeat = false;
    } else {
      this.unitProperties.unit.unitAdministrators.splice(index, 1);
    }
  }
  /**
   * @param  {} unit
   * sets new parent properties on editing existing parent
   */
  setParentUnit(unit) {
    this.unitProperties.unit.parentUnitNumber = unit.unitNumber;
    this.unitProperties.unit.parentUnitName = unit.unitName;
    this.isValueChanged = true;
  }
  /**
   * @param  {} event
   * @param  {} Index=-1
   * shows validation message when clears administrator user or parent unit when clears those fields using backspace or delete keys.
   */
  emptyValidationKeyup(event, index = -1) {
    if (index >= 0) {
      if (event.keyCode === 8 || event.keyCode === 46) {
        this.unitProperties.unit.unitAdministrators[index].personId = '';
      }
    } else {
      const INDEX = this.unitList.findIndex((key) => key.unitName.toString().toLowerCase() === event.target.value.toString().toLowerCase());
      if (INDEX >= 0) {
        this.unitProperties.unit.parentUnitName = this.unitList[INDEX].unitName;
        this.unitProperties.unit.parentUnitNumber = this.unitList[INDEX].unitNumber;
      } else { this.unitProperties.unit.parentUnitNumber = ''; }
    }
  }
  /**
   * triggers cancel button if click yes in cancel confirmation modal
   */
  cancelChanges() {
    document.getElementById('closeModal').click();
  }
  /**
   * @param  {} value
   * sets isValuechanged to true if administartor type is selected.
   */
  administratorTypeValue(value, index, administrator) {
    if (value === '') {
      this.isValueChanged = false;
    } else {
      this.isValueChanged = true;
      this.isAdmnTypeEmpty[index] = false;
      this.administratorRepeatValidation(administrator, index);
      if (this.unitProperties.unit.unitAdministrators[index].unitNumber && this.unitProperties.acType === 'U') {
        this.unitProperties.unit.unitAdministrators[index].oldPersonId = this.unitProperties.unit.unitAdministrators[index].personId;
        this.unitProperties.unit.unitAdministrators[index].oldUnitAdministratorTypeCode =
          this.tempUnitAdministrators[index].unitAdministratorTypeCode;
      }
    }
  }
  elasticResult(event) {
      if (event) {
          this.unitAdministratorsObject.personId = event.prncpl_id;
          this.unitAdministratorsObject.fullName = event.full_name;
      } else {
        this.unitAdministratorsObject.personId = this.unitAdministratorsObject.fullName = null;
      }
  }
  unitAdministratorsObjectReset() {
    this.unitAdministratorsObject = {
      personId: '', unitAdministratorTypeCode: '',
      fullName: '',
      unitNumber: ''
    };
    this.isAdministratorsRepeat = false;
  }
  resetAdminPersonId(event) {
    if (event.keyCode === 8 || event.keyCode === 46) { this.unitAdministratorsObject.personId = ''; }
  }
  /**
   * @param  {} event
   * unit number repeatiton, length, type validations are checked here.
   */
  validateUnitNumber(event) {
    (this.unitList.find((key) => key.unitNumber === event.target.value)) ? this.isUnitNumRepeat = true : this.isUnitNumRepeat = false;
    (event.target.value.length >= 9) ? this.isUnitNumLength = true : this.isUnitNumLength = false;
    this.isUnitNumEmpty = false;
    this.unitProperties.unit.unitAdministrators.forEach(element => {
      element.unitNumber = this.unitProperties.unit.unitNumber;
    });
  }
  /**
   * @param  {} event
   * unit name length validation checks here.
   */
  validateUnitName(event) {
    this.isUnitNameLength = (event.target.value.length === 200) ? true : false;
    this.isUnitNameEmpty = false;
  }
  /**
   * Validates if Administrator type or user is empty
   */
  administratorEmptyValidation() {
    this.unitProperties.unit.unitAdministrators.forEach((element, id) => {
      (element.personId === '') ? this.isAdmnUserEmpty[id] = true : this.isAdmnUserEmpty[id] = false;
      (element.unitAdministratorTypeCode === '') ? this.isAdmnTypeEmpty[id] = true : this.isAdmnTypeEmpty[id] = false;
    });
  }
  /**
  * @param  {} administrator
  * @param  index
  * validates if administrator user with same role repeated.
  */
  administratorRepeatValidation(administrator, index) {
    this.isAdministratorsRepeat = false;
    this.unitProperties.unit.unitAdministrators.forEach((element, id) => {
      if (index !== id) {
        if (element.personId === administrator.personId && element.unitAdministratorTypeCode === administrator.unitAdministratorTypeCode) {
          this.isAdministratorsRepeat = true;
        }
      }
    });
  }
  validatorsReset() {
    this.isAdministratorsRepeat = this.isUnitNumEmpty = this.isUnitNumLength = this.isUnitNumRepeat = this.isParentUnitNumEmpty =
    this.isValueChanged = this.isUnitNameEmpty = this.isUnitNameLength = this.isSameUnit = false;
    this.isAdmnUserEmpty = [];
    this.isAdmnTypeEmpty = [];
    this.tempAdmnArray = [];
    this.isPersonEdit = [];
    this.unitAdministratorsObjectReset();
  }
  /**
   * @param  {scroll'} 'tree-outer
   * @param  {} []:- to set scroll to top
   */
  onWindowScroll(event) {
    (document.getElementsByClassName('u-tree-outer')[0].scrollTop > 300) ?
      document.getElementById('scrollUpBtn').style.display = 'block' : document.getElementById('scrollUpBtn').style.display = 'none';
  }
  topFunction() {
    document.getElementsByClassName('u-tree-outer')[0].scrollTop = 0;
  }
  /**
   * @param  {any} event
   * restricts inputs other than numbers
   */
  inputRestriction(event: any) {
    const pattern = /[a-zA-Z0-9\+\-\/\ ]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  async getPermissions() {
    this.isMaintainUserRoles = await this._commonService.checkPermissionAllowed('MAINTAIN_USER_ROLES');
  }

  selectParentUnit(selectedLeadUnit) {
    this.isValueChanged = true;
    if (this.isEditmode == null && this.mode !== 'copy' && this.mode !== 'add') {
      this.unitProperties.parentUnitChanged = true;
    }
    if (selectedLeadUnit) {
      this.unitProperties.unit.parentUnitNumber = selectedLeadUnit.unitNumber;
      this.unitProperties.unit.parentUnitName = selectedLeadUnit.unitName;
    } else {
      this.unitProperties.unit.parentUnitNumber = '';
      this.unitProperties.unit.parentUnitName = '';
    }
  }
}
