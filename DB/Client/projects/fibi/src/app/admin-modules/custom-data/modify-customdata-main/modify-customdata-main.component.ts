import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomDataService } from '../services/custom-data.service';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import * as _ from 'lodash';
import { Constants } from '../custom-data.constants';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';
import { CustomDataAuditLog } from '../interface';

declare var $: any;
@Component({
  selector: 'app-modify-customdata-main',
  templateUrl: './modify-customdata-main.component.html',
  styleUrls: ['./modify-customdata-main.component.css'],
  providers: [AuditLogService,
		{ provide: 'moduleName', useValue: 'CUSTOM_ELEMENT' }]
})

export class ModifyCustomdataMainComponent implements OnInit, OnDestroy {

  currentTab = '';
  $subscriptions: Subscription[] = [];
  customElementId: any = null;
  moduleList: any;
  helpInfo = false;
  customId: any;
  lookupData: any = [];
  dataTypes: any = {};
  customDataElement: any = {
    customElementId: '',
    columnId: '',
    columnVersionNumber: 1,
    columnLabel: '',
    dataType: '',
    dataLength: '',
    defaultValue: '',
    isLatestVesrion: 'Y',
    hasLookup: false,
    updateUser: '',
    updateTimestamp: '',
    isActive: 'Y',
    lookupWindow: '',
    customDataElementUsage: [],
  };
  isDataChange;
  customDataType: any;
  elementOptions: any = [];
  defaultValueOptions: any = [];
  tempElementOptions: any = [];
  deleteOptions: any = [];
  map = new Map();
  appliedModuleList: any = [];
  moduleCompleterOptions: any = {};
  clearModuleField: any;
  updatedModule: any;
  usageModuleList: any[];
  currentElementAnswered = false;
  before: any;
  currentModuleName: string;

  constructor(private _customdataService: CustomDataService, private _commonService: CommonService,
     private auditLogService: AuditLogService) { }


  ngOnInit() {
    this.getDatatypes();
    this.getUsageModuleList();
    this.isDataChange = false;
  }

  /**
* Get module  list of custom data
*/
  getModuleList() {
    this.$subscriptions.push(this._customdataService.getModuleList().subscribe(
      (data: any) => {
        this.moduleList = data.applicableModules.filter(item => item.isActive);
        this.setModuleCompleterOptions( this.moduleList);
      }));
  }

  getUsageModuleList() {
    this.$subscriptions.push(this._customdataService.getCusElementModules().subscribe(
      (data: any) => {
        this.usageModuleList = data.data.filter(item => item.isActive);
        this.currentTab = this.usageModuleList[0].moduleCode;
        this.currentModuleName = this.usageModuleList[0].description;
        this.setModuleCompleterOptions(data.applicableModules);
      }));
  }

  createEditCustomElementModalOpen(customElementId = '') {
    this.getModuleList();
    $('#createEditCustomElementModal').modal('show');
    if (customElementId) {
      this.$subscriptions.push(this._customdataService.getCustomData(customElementId).subscribe((data: any) => {
        if (data.customDataElement) {
          this.currentElementAnswered = data.elementAnswered;
          this.customDataElement = data.customDataElement;
          this.before = this.prepareAuditLogObject(data.customDataElement, data.elementOptions);
          this.customDataType = this.customDataElement.dataType;
          this.fetchLookupDetails(this.customDataType);
          this.selectSearchValue(this.customDataElement.lookupArgument);
          this.customDataElement.lookupArgument = this.customDataElement.lookupArgument;
          this.elementOptions = data.elementOptions;
          this.tempElementOptions = JSON.stringify(data.elementOptions);
          this.customId = this.customDataElement.customElementId;
        }
      }));
    } else {
      this.currentElementAnswered = false;
      this.elementOptions = [];
      this.tempElementOptions = [];
      this.customDataType = [];
    }
  }

  changeCurrentTab(currentTab, moduleName) {
    this.currentTab = currentTab;
    this.currentModuleName = moduleName;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getDatatypes() {
    this.$subscriptions.push(this._customdataService.getDataTypes().subscribe(data => { this.dataTypes = data; }));
  }

  setModuleCompleterOptions(moduleList) {
    this.moduleCompleterOptions.arrayList = moduleList;
    this.moduleCompleterOptions.contextField = 'description';
    this.moduleCompleterOptions.formatString = 'description';
    this.moduleCompleterOptions.defaultValue = '';
    this.moduleCompleterOptions.filterFields = 'description';
  }

  onModuleSelect(module) {
    let foundModuleCode = false;
    this.customDataElement.customDataElementUsage.forEach(element => {
      if (element.moduleCode === module.moduleCode && element.acType === 'D') {
        element.acType = 'U';
        foundModuleCode = true;
      } else if (element.moduleCode === module.moduleCode && (element.acType === 'I' || element.acType === 'U')) {
        foundModuleCode = true;
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Module already exists.');
      }
    });
    if (!foundModuleCode) {
      this.setCustomDataElement(module.moduleCode, module);
    }
    this.clearModuleField = new String('true');
  }

  setCustomDataElement(moduleCode, module) {
    this.customDataElement.customDataElementUsage.push({
      'moduleCode': moduleCode, 'isRequired': 'N',
      'updateUser': this._commonService.getCurrentUserDetail('userName'), 'updateTimestamp': new Date().getTime(), 'acType': 'I',
      'module': module
    });
  }

  removeModule(moduleCode) {
    let foundModuleCode = false;
    this.customDataElement.customDataElementUsage.forEach(element => {
      if (element.moduleCode === moduleCode && element.acType === 'U') {
        element.acType = 'D';
        foundModuleCode = true;
      }
    });
    if (!foundModuleCode) {
      this.customDataElement.customDataElementUsage.splice
        (this.customDataElement.customDataElementUsage.findIndex(usage => usage.moduleCode === moduleCode), 1);
    }
  }

  /**
   * @param  {} dataTypeCode
   * In modify custom data check the changed datatype with current type and if
   * it is equal keeps the elementoptions in a temporary variable
   * otherwise removes elementoptions.
   * If datatype is radiobutton or checkbox addoption function invokes updates elementOptions.
   */
  changeOptions(dataTypeCode) {
    this.customDataElement.customDataTypes = this.dataTypes.customDataTypes.find(type => type.dataTypeCode === dataTypeCode);
    this.customDataElement.lookupArgument = '';
    this.deleteOptions = [];
    if (!['1', '2'].includes(dataTypeCode)) {
    this.customDataElement.dataLength = '';
    }
    if (dataTypeCode === this.customDataType) {
      this.elementOptions = JSON.parse(this.tempElementOptions);
    } else {
      this.elementOptions = [];
    }
    if (['4', '5']. includes(dataTypeCode)) {
      this.deleteOptions = this.tempElementOptions.length ? JSON.parse(this.tempElementOptions) : [];
      this.addOptions();
    }
    if (['6', '7', '8', '9']. includes(dataTypeCode)) {
      this.fetchLookupDetails(dataTypeCode);
    }
  }

  addOptions() {
    if (this.elementOptions.length && (!this.elementOptions.find(x => x.optionName))) {
      this.map.set('customdataoption', 'option');
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please fill the Option.');
    } else {
      this.elementOptions.push({
        'customDataElementsId': this.customDataElement.customElementId,
        'updateUser': this._commonService.getCurrentUserDetail('userName'), 'updateTimestamp': new Date().getTime()
      });
      setTimeout(() => { document.getElementById('option').focus(); });
    }
  }

  deleteOption(option, optionIndex) {
    if (option.customDataElementsId) {
      this.isDataChange = true;
      this.deleteOptions.push(option);
    }
    this.elementOptions.splice(optionIndex, 1);
  }
  /**
   * @param  {} dataTypeCode
   * Fetch lookup datas for elastic,endpoint,user lookup and system lookup datatypes and listed in lookup Type dropdown field.
   */
  fetchLookupDetails(dataTypeCode) {
    this.$subscriptions.push(this._customdataService.getSystemLookupDetails(dataTypeCode).subscribe(
      (data: any) => {
        this.lookupData = data.lookUps;
      }));
  }

  selectSearchValue(index) {
    this.defaultValueOptions = [];
    if (this.customDataElement.dataType === '6' || this.customDataElement.dataType === '7') {
      switch (index) {
        case 'fibiperson': this.defaultValueOptions = Constants.person; break;
        case 'sponsorName': this.defaultValueOptions = Constants.sponsor; break;
        case 'fibiproposal': this.defaultValueOptions = Constants.proposal; break;
        case 'awardfibi': this.defaultValueOptions = Constants.award; break;
        case 'instituteproposal': this.defaultValueOptions = Constants.instituteproposal; break;
        case 'grantcall_elastic': this.defaultValueOptions = Constants.grantcallElastic; break;
        case 'unitName': this.defaultValueOptions = Constants.leadUnit; break;
        case 'fibiDepartment': this.defaultValueOptions = Constants.department; break;
        case 'fibiOrganization': this.defaultValueOptions = Constants.organization; break;
        case 'fibiCountry': this.defaultValueOptions = Constants.country; break;
        case 'profitCenterName': this.defaultValueOptions = Constants.profitCenter; break;
        case 'grantCodeName': this.defaultValueOptions = Constants.grantCodeName; break;
        case 'costCenterName': this.defaultValueOptions = Constants.costCenter; break;
        case 'fundCenterName': this.defaultValueOptions = Constants.fundCenter; break;
        case 'claimTemplateName': this.defaultValueOptions = Constants.claimTemplate; break;
      }
    }

  }

  /**
 * restrict input fields to numbers, - and /
 * @param event
 */
  inputRestriction(event: any) {
    const pattern = /[0-9\+\-\/\.\ ]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }
  customDataValidation() {
    this.map.clear();
    if (!this.customDataElement.columnLabel) {
      this.map.set('customcolumnlabel', 'columnlabel');
    }
    if (!this.customDataElement.dataType) {
      this.map.set('customdatatype', 'datatype');
    }
    if (!this.customDataElement.customElementName) {
      this.map.set('customdataname', 'elementname');
    }
    if (this.customDataElement.dataType === '1' || this.customDataElement.dataType === '2') {
      if (!this.customDataElement.dataLength) {
        this.map.set('customdatalength', 'datalength');
      }
    }
    if (this.customDataElement.dataType === '6' || this.customDataElement.dataType === '7' || this.customDataElement.dataType === '8' ||
      this.customDataElement.dataType === '9') {
      if (!this.customDataElement.lookupArgument) {
        this.map.set('customdatalookup', 'lookup');
      }
    }
    if (this.customDataElement.dataType === '6' || this.customDataElement.dataType === '7') {
      if (!this.customDataElement.defaultValue) {
        this.map.set('customdatadefault', 'defaultvalue');
      }
    }
    if (this.customDataElement.dataType === '4' || this.customDataElement.dataType === '5') {
      if (!this.elementOptions.find(x => x.optionName) || !this.elementOptions.length) {
        this.map.set('customdataoption', 'option');
        setTimeout(() => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Please add atleast one Option.');
        }, 0);
      }
    }
    if (this.customDataElement.customDataElementUsage.length <= 0 ||
      !(this.customDataElement.customDataElementUsage.find(x => x.acType === 'I' || x.acType === 'U'))) {
      this.map.set('custommodule', 'module');
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please select atleast one Module.');
    }
  }

  saveCustomData(type) {
    this.customDataValidation();
    const REQUESTCUSTOMDATA: any = {};
    if (this.customDataElement.dataType === '8' || this.customDataElement.dataType === '9') {
      this.customDataElement.hasLookup = true;
    }
    if ((this.map.size < 1)) {
      this.customDataElement.acType = type;
      this.customDataElement.customElementId = this.customId;
      this.customDataElement.updateTimestamp = new Date().getTime();
      this.customDataElement.updateUser = this._commonService.getCurrentUserDetail('userName');
      REQUESTCUSTOMDATA.customDataElement = this.customDataElement;
      REQUESTCUSTOMDATA.elementOptions = this.elementOptions;
      REQUESTCUSTOMDATA.deleteOptions = this.deleteOptions;
      REQUESTCUSTOMDATA.isDataChange = this.isDataChange;
      this.$subscriptions.push(this._customdataService.saveCustomdata(REQUESTCUSTOMDATA).subscribe(
        (data: any) => {
          if (data && data.responseMessage === 'Custom Data Element saved successfully.') {
            const newModules = [];
            this.customDataElement.customDataElementUsage.forEach(element => {
              const filteredModule = this.usageModuleList.findIndex(moduleEle => moduleEle.moduleCode === element.moduleCode);
              if (filteredModule < 0) {
                this.usageModuleList.push(element.module);
                newModules.push(element.module);
              }
            });
            if (newModules.length > 0) {
              this.currentTab = newModules[0].moduleCode;
              this.currentModuleName = newModules[0].description
            } else {
              this.currentTab = data.customDataElement.customDataElementUsage[0].moduleCode;
              this.currentModuleName =  data.customDataElement.customDataElementUsage[0].module.description;
            }
            this.updatedModule = data;
            this.createEditCustomElementModalCloseClear();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, data.responseMessage);
            let after = this.prepareAuditLogObject(data.customDataElement, data.elementOptions);
            this.auditLogService.saveAuditLog('I', {}, after, null, Object.keys(after), data.customDataElement.customElementId);
          } else if (data && data.responseMessage === 'Custom Data Element updated successfully.') {
            this.customDataElement.customDataElementUsage.forEach(element => {
              const filteredModule = this.usageModuleList.findIndex(moduleEle => moduleEle.moduleCode === element.moduleCode);
              if (filteredModule < 0) {
                this.usageModuleList.push(element.module);
              }
            });
            this.updatedModule = data;
            this.createEditCustomElementModalCloseClear();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, data.responseMessage);
            let after = this.prepareAuditLogObject(deepCloneObject(data.customDataElement),data.elementOptions);
            this.auditLogService.saveAuditLog('U', this.before, after, null, Object.keys(after), data.customDataElement.customElementId);
          } else if (data && data.responseMessage === 'Custom Element Name already exists.') {
            this.map.set('customelementname', 'elementname');
            this._commonService.showToast(HTTP_ERROR_STATUS, data.responseMessage);
          }
        }, err =>{
          this._commonService.showToast(HTTP_ERROR_STATUS,'Custom Data Element failed. Please try again.');
        }));
    }
  }

  /**
   * preparing audit log object with required keys
   * based on the data type.
   */
  prepareAuditLogObject(customElements: any, elementOptions: any): CustomDataAuditLog {
    let auditLog: CustomDataAuditLog = {};
    auditLog.columnLabel = customElements.columnLabel;
    auditLog.usageModules = customElements.customDataElementUsage.map(e => e.module.description);
    auditLog.customDataTypes = customElements.customDataTypes.description;
    auditLog.customElementName = customElements.customElementName;
    auditLog.dataType = customElements.dataType;
    auditLog.isActive = customElements.isActive;
    auditLog.isLatestVersion = customElements.isLatestVesrion;

    if (['6', '7', '8', '9'].includes(customElements.dataType)) {
      auditLog.lookupArgument = customElements.lookupArgument;
      auditLog.hasLookup = customElements.hasLookup;
    }

    if (['7', '1', '2', '6'].includes(customElements.dataType)) {
      auditLog.defaultValue= customElements.defaultValue;
    }

    if (['1', '2'].includes(customElements.dataType)) {
      auditLog.dataLength = customElements.dataLength;
    }

    if(['4', '5'].includes(customElements.dataType) && elementOptions.length > 0) { 
      customElements.dataType == 4 ? auditLog.checkBoxOptions = elementOptions.map(e => e.optionName) 
                                   : auditLog.radioButtonOptions = elementOptions.map(e => e.optionName); 
    }
    return auditLog;
  }

  checkLengthValidation(defaultValue, customData) {
    if (customData.dataLength && (defaultValue.length > customData.dataLength)) {
      this.customDataElement.defaultValue = defaultValue.slice(0, customData.dataLength);
    }
  }

  createEditCustomElementModalCloseClear() {
    $('#createEditCustomElementModal').modal('hide');
    this.map.clear();
    this.customElementId = null;
    this.customId = null;
    this.customDataElement = {
      customElementId: '',
      columnId: '',
      columnVersionNumber: 1,
      columnLabel: '',
      dataType: '',
      dataLength: '',
      defaultValue: '',
      isLatestVesrion: 'Y',
      hasLookup: false,
      updateUser: '',
      updateTimestamp: '',
      isActive: 'Y',
      lookupWindow: '',
      customDataElementUsage: [],
    };
    this.deleteOptions = [];
  }

  customElementIdChange(customElementId) {
    this.createEditCustomElementModalOpen(customElementId);
    this.customElementId = customElementId;
  }

  inactivateCustomData(isActive, customElementName, customDataElementId) {
    this.customElementId = customDataElementId;
    let before = {customElementName, isActive};
    let after = {customElementName}
    this.$subscriptions.push(this._customdataService.updateStatus(customDataElementId).
      subscribe(data => {
        if (isActive === 'Y') {
          this.customDataElement.isActive = 'N';
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Element inactivated successfully.');
        } else {
          this.customDataElement.isActive = 'Y';
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Element activated successfully.');
        }
        after['isActive'] = this.customDataElement.isActive;
        this.auditLogService.saveAuditLog('U', before, after, null, Object.keys(after), this.customElementId);
      }));
  }

}
