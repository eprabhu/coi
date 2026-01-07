import { Component, Input, OnInit, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CustomDataService } from '../services/custom-data.service';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { Router } from '@angular/router';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import {
  getEndPointOptionsForLeadUnit, getEndPointOptionsForSponsor, getEndPointOptionsForDepartment,
  getEndPointOptionsForOrganization, getEndPointOptionsForCountry, getEndPointOptionsForGrandCode,
  getEndPointOptionsForProfitCentre, getEndPointOptionsForFundCentre, getEndPointOptionsForCostCentre, 
  getEndPointOptionsForMappedClaimTemplate
} from '../../../common/services/end-point.config';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-preview-customdata',
  templateUrl: './modify-preview-customdata.component.html',
  styleUrls: ['./modify-preview-customdata.component.css'],
  providers: [AuditLogService,
		{ provide: 'moduleName', useValue: 'CUSTOM_ELEMENT' }]
}
)

export class ModifyPreviewCustomdataComponent implements OnInit, OnChanges {

  @Input() moduleCode: any;
  @Input() moduleName: any;
  @Output() customElementIdChange: EventEmitter<String> = new EventEmitter<String>();
  @Input() updatedModule: any;

  constructor(private _customdataService: CustomDataService, private _commonService: CommonService,
     private _elasticConfig: ElasticConfigService, private auditLogService: AuditLogService) {
  }

  $subscriptions: Subscription[] = [];
  public customElements: Array<any> = [];
  viewMode = 'view';
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  elasticSearchOptions: any = {};
  endPointSearchOptions: any = {};
  isInactive: boolean;
  currentElementLabel: String;
  customDataElementId: number;
  currentCustomElementIndex: number;
  setFocusToElement = setFocusToElement;

  ngOnInit() {
    if (this.moduleCode) {
      this.getCustomElements(this.moduleCode);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.moduleCode) {
      this.getCustomElements(this.moduleCode);
    }
    if (changes.updatedModule) {
      this.moduleChangeActions();
    }
  }

  moduleChangeActions() {
    if (this.updatedModule && this.updatedModule.customDataElement) {
      const cusUsage = this.updatedModule.customDataElement
        .customDataElementUsage.find(element => element.moduleCode === this.moduleCode);
      const cusElement = this.customElements.find(element => element.customDataElementId ===
        this.updatedModule.customDataElement.customElementId);
      if (cusUsage && cusElement) {
        cusElement.columnName = this.updatedModule.customDataElement.columnLabel;
        cusElement.isRequired = cusUsage.isRequired;
        cusElement.filterType = this.updatedModule.customDataElement.customDataTypes.description;
        cusElement.options = this.getOptionsArray();
        cusElement.isActive = this.updatedModule.customDataElement.isActive;
      } else if (!cusUsage && cusElement) {
        this.deleteElement(cusElement);
      } else if (cusUsage && !cusElement) {
        const element = {
          'columnName': this.updatedModule.customDataElement.columnLabel,
          'isRequired': cusUsage.isRequired,
          'filterType': this.updatedModule.customDataElement.customDataTypes.description,
          'options': this.getOptionsArray(),
          'customDataElementId': this.updatedModule.customDataElement.customElementId,
          'orderNumber': cusUsage.orderNumber,
          'isActive' : this.updatedModule.customDataElement.isActive,
          'customElementName' : this.updatedModule.customDataElement.customElementName
        };
        this.customElements.push(element);
      }
    }
  }

  getOptionsArray() {
    const options = [];
    if (this.updatedModule.elementOptions.length > 0) {
      this.updatedModule.elementOptions.forEach(option => {options.push(option); });
    }
    return options;
  }

  deleteElement(cusElement) {
    const index: number = this.customElements.indexOf(cusElement);
    if (index !== -1) {
      this.customElements.splice(index, 1);
    }
  }

  getCustomElements(moduleCode) {
    this.$subscriptions.push(this._customdataService.getCustomElements(moduleCode)
      .subscribe((response: any) => {
        this.customElements = response.data;
        this.setDefaultValues(response.data);
      }));
  }

  saveCustomDataSort() {
    const sortObjects = [];
    this.customElements.forEach((obj, index) => {
      sortObjects.push({
        'customElementId': obj.customDataElementId,
        'orderNumber': index + 1
      });
    });
    this.$subscriptions.push(this._customdataService.saveCustomdataOrder(sortObjects, this.moduleCode).subscribe((data: any) => {
      if (data.status) {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
      }
    }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Save Custom Data has failed. Please try again.'); }));
  }

  setDefaultValues(customElementList) {
    customElementList.forEach(element => {
      switch (element.filterType) {
        case 'Elastic Search': this.setElasticOptions(element); break;
        case 'Autosuggest': this.setEndpointOptions(element); break;
        default:
      }
    });
  }

  setElasticOptions(object) {
    switch (object.lookupArgument) {
      case 'fibiproposal': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForProposal();
        break;
      case 'fibiperson': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForPerson();
        break;
      case 'awardfibi': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForAward();
        break;
      case 'instituteproposal': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForProposal();
        break;
      case 'grantcall_elastic': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForGrantCall();
        break;
      default: break;
    }
  }

  setEndpointOptions(object) {
    switch (object.lookupArgument) {
      case 'sponsorName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForSponsor();
        break;
      case 'unitName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForLeadUnit();
        break;
      case 'fibiDepartment': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForDepartment();
        break;
      case 'fibiOrganization': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForOrganization();
        break;
      case 'fibiCountry': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForCountry();
        break;
      case 'profitCenterName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForProfitCentre();
        break;
      case 'grantCodeName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForGrandCode();
        break;
      case 'costCenterName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForCostCentre();
        break;
      case 'fundCenterName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForFundCentre();
        break;
      case 'claimTemplateName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForMappedClaimTemplate();
        break;
      default: break;
    }
  }

  customDataElementEdit(customDataElementId) {
    this.customElementIdChange.emit(customDataElementId);
  }

  // isActivateCancelled() {
  //   if (this.customElements[this.currentCustomElementIndex].isActive === 'Y') {
  //     this.customElements[this.currentCustomElementIndex].isActive = 'N';
  //   } else {
  //     this.customElements[this.currentCustomElementIndex].isActive = 'Y';
  //   }
  // }

  toggleCustomDataRequired(isRequired: string, customDataElementId: number, index: number, customElementName: string) {
    let before = {customElementName, 'moduleName': this.moduleName, isRequired};
    let after = {customElementName, 'moduleName': this.moduleName}
    this.$subscriptions.push(this._customdataService.updateCustomElementRequired(customDataElementId, this.moduleCode)
      .subscribe((data: any) => {
        if (data.status) {
          if (isRequired === 'Y') {
            this.customElements[index].isRequired = 'N';
          } else {
            this.customElements[index].isRequired = 'Y';
          }
          this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
          after['isRequired'] = this.customElements[index].isRequired;
          this.auditLogService.saveAuditLog('U', before, after, null, Object.keys(after), customDataElementId.toString());
        }
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Custom Data has failed. Please try again.'); }));
  }
}
