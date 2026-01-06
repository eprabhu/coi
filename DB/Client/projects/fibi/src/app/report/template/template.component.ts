/**
 * Created by Saranya T Pillai
 * Last Updated by Saranya T Pillai - 1/11/2019, mahesh sreenath- code clean up and functionalities added - 17-12-2019
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { CommonService } from '../../common/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getAutoCompleterOptions, ReportService } from '../report.service';
import { buildQuery, formatDate } from '../query-builder';
import { forkJoin, Subscription } from 'rxjs';
import {
  getEndPointOptionsForLeadUnit, getEndPointOptionsForSponsor,
  getEndPointOptionsForGrantCall,
  getEndPointOptionsForOrganization,
  getEndPointOptionsForCountry,
  getEndPointOptionsForSchoolUnit
} from '../../common/services/end-point.config';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, LS_FY_END_DATE, LS_FY_START_DATE, YEAR_RANGE } from '../../app-constants';
import { fileDownloader, pageScroll, range, setFocusToElement } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DomSanitizer } from '@angular/platform-browser';
import { getValuesForBirt, setCriteria } from '../birt-value-builder';
import { AuditLogService } from '../../common/services/audit-log.service';

declare var $: any;
@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
  providers: [AuditLogService,
    { provide: 'moduleName', useValue: 'BIRT_REPORT' }]
})
export class TemplateComponent implements OnInit, OnDestroy {
  configurationData = [];
  currentTemplate = null;
  currentModule = null;
  isBirt = false;
  elasticSearchOptions: any = {};
  endPointSearchOptions: any = {};
  autoCompleterSearchOptions: any = {};
  reportCount = 0;
  clearField: String;
  filterValues: any = {};
  tempFilterValues: any = {};
  startDate: any = {};
  endDate: any = {};
  rangeFrom: any = {};
  rangeTo: any = {};
  lookUpValues = {};
  tempLookUpValues = {};
  requestTemplateData: any = {
    templateName: null,
    templateDescription: null,
    updateTimestamp: null,
    createTimestamp: null,
    selectedFields: null,
    conditions: null,
    reportView: null
  };
  templateName = null;
  templateDescription = null;
  isTemplateName = false;
  templateTypes: any = {};
  result = [];
  isSaveFilterValues: boolean;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  filtersFieldsData: any = {
    fields: [],
    filters: []
  };
  criteriaModalSize = 'modal-lg';
  columnModalSize = 'modal-lg';
  saveAs = true;
  criteriaSingleSpaceImpact: any = 0;
  columnSingleSpaceImpact: any = 0;
  isFieldSelected = true;
  isAllCriteriasSelected: boolean;
  isAllColumnsSelected: boolean;
  isReportCreator = false;
  isSaving = false;
  criteriaName: string;
  columnName: string;
  content: Object = null;
  allowedReports = '';
  isShowCollapse = false;
  reportCriteria: Array<string> = [];
  pageScroll = pageScroll;
  isCollapseCriteria = true;
 

  constructor(private _elasticConfig: ElasticConfigService, private _router: Router,
    private _reportService: ReportService, private _activatedRoute: ActivatedRoute,
    public _commonService: CommonService, public sanitizer: DomSanitizer,
   private _auditLogService:AuditLogService) { }

  async ngOnInit() {
    this.$subscriptions.push(this._activatedRoute.queryParams.subscribe((data: any) => {
      this.currentTemplate = data.id;
      this.currentModule = data.tc;
      this.isBirt = data.R ? true : false;
    }));
    this.getTemplateDetails();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * returns configuration data and selected template based on id fork join is used so that once both service data is returned,
   * we can set search values to the current template and setup intial values for given filters
   * */
  getTemplateDetails() {
    const requestObject = {
      'reportTemplateId': this.currentTemplate,
      'personId': this._commonService.getCurrentUserDetail('personID'),
      'isBirt': this.isBirt
    };
    this.isBirt ? this.getBirtReport(requestObject) : this.getSystemBasedReport(requestObject);
  }

  getSystemBasedReport(requestObject) {
    this.$subscriptions.push(forkJoin(this._reportService.getTemplateDetails(requestObject),
      this._reportService.getReportJSON(this.currentModule)).subscribe((data: any) => {
        this.requestTemplateData = data[0].reportTemplate;
        this.templateTypes = this.requestTemplateData.reportType;
        this.requestTemplateData.templateJson = JSON.parse(data[0].reportTemplate.templateJson);
        this.configurationData = data[1].configFile.reports || [];
        this.getColumnNameData(this.requestTemplateData.templateJson.filters, 'filters');
        this.getColumnNameData(this.requestTemplateData.templateJson.fields, 'fields');
        this.setMandatoryFields();
        this.setDynamicSearchValues(this.filtersFieldsData.filters);
        this.setConfigurationData();
        this.checkForSavedValues();
        this.setSelectAllStatus(this.isAllFieldsChecked());
        this.setSelectAllStatusForColumns(this.isAllFieldsChecked());
        this.setModalSizeForCriteriaAndColumn();
        this.checkForReportCreator();
      }));
  }

  getBirtReport(requestObject) {
    this.$subscriptions.push(this._reportService.getTemplateDetails(requestObject).subscribe((data: any) => {
      this.requestTemplateData = data.reportTemplate;
      this.templateTypes = this.requestTemplateData.reportType;
      this.requestTemplateData.templateJson = JSON.parse(data.reportTemplate.templateJson);
      this.configurationData = data.inputParamDetails || [];
      this.getColumnNameData(this.requestTemplateData.templateJson.filters, 'filters');
      this.setMandatoryFields();
      this.setDynamicSearchValues(this.filtersFieldsData.filters);
      this.setConfigurationData();
      this.setDefaultValuesToFilterValues();
      this.checkForSavedValues();
      this.setSelectAllStatusForColumns(this.isAllFieldsChecked());
      this.setModalSizeForCriteriaAndColumn();
      this.checkForReportCreator();
      this.setAllowedReportTypes();
    }, err => {
      $('#reportCheckingWarningModal').modal('show');
    }));
  }

  checkForReportCreator() {
    this.isReportCreator =
      this._commonService.getCurrentUserDetail('personID') === this.requestTemplateData.templateOwnerPersonId ? true : false;
  }

  /**
   * @param  {any} arrayList
   * if an element of passed arrayList matches with the columnName of configurationData ,
   * then it returns the corresponding object from configurationData.
   */
  getColumnNameData(arrayList: any, type) {
    this.filtersFieldsData[type] = [];
    arrayList.forEach(t => {
      const column = this.getMatchingColumnNames(t);
      if (column) {
        this.filtersFieldsData[type].push(column);
      }
    });
  }

  addEncryptedIndex(): Array<number> {
    const encryptedFieldIndexes = [];
    this.filtersFieldsData.fields.forEach((column, index) => {
      if (column.isEncrypted) {
        encryptedFieldIndexes.push(index);
      }
    });
    return encryptedFieldIndexes;
  }
  /**
   * @param  {} element
   * finds and returns the corresponding columnName from configurationData.
   */
  getMatchingColumnNames(element) {
    const column = this.configurationData.find(c => c.columnName === element);
    return column;
  }

  setDynamicSearchValues(searchFields) {
    searchFields.forEach(element => {
      switch (element.filterType) {
        case 'elastic': this.setElasticOptions(element); break;
        case 'endpoint': this.setEndpointOptions(element); break;
        case 'autocomplete': this.setAutoCompleterOptions(element); break;
        default: break;
      }
    });
  }
  /**
   * @param  {} object
   * sets the elastic search options based on filter index
   */
  setElasticOptions(object) {
    switch (object.index) {
      case 'fibiproposal': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForProposal(); break;
      case 'fibiperson': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForPerson(); break;
      case 'awardfibi': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForAward(); break;
      case 'instituteproposal': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForProposal(); break;
      case 'grantcall': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForGrantCall(); break;
      case 'fibiirb': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForIrb(); break;
      case 'fibirolodex': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForRolodex(); break;
      case 'coifibi': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForCoi(); break;
      case 'iacucfibi': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForIacuc(); break;
      case 'fibiagreement': this.elasticSearchOptions[object.columnName] = this._elasticConfig.getElasticForAgreement(); break;
      default: break;
    }
  }

  /**
 * @param  {} object
 * sets the auto completer search options based on filter index
 */
  setAutoCompleterOptions(object) {
    this.autoCompleterSearchOptions[object.columnName] = getAutoCompleterOptions(this.autoCompleterSearchOptions, object.dynamicLookup);
  }

  /**
   * @param  {} object
   * sets the end point search options based on filter index
   */
  setEndpointOptions(object) {
    switch (object.index) {
      case 'unitName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForLeadUnit(); break;
      case 'sponsorName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForSponsor(); break;
      case 'grantCallName': this.endPointSearchOptions[object.columnName] = this.setEndPointOptionsForGrantCall(); break;
      case 'organizationName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForOrganization(); break;
      case 'countryName': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForCountry(); break;
      case 'schoolUnit': this.endPointSearchOptions[object.columnName] = getEndPointOptionsForSchoolUnit(); break;
      default: break;
    }
  }

  setEndPointOptionsForGrantCall() {
    const options = getEndPointOptionsForGrantCall();
    options.params = { 'moduleCode': this.requestTemplateData.moduleCode.toString() };
    return options;
  }
  /**
   * this function is used to update the values used for checkbox in user list. update the value if we found the
   * value in added filters or fields.
   */
  setConfigurationData() {
    this.configurationData.forEach(element => {
      element.isFilterChecked = this.findInFilters(element) > -1 ? true : false;
      element.isColumnChecked = this.findInFields(element) > -1 ? true : false;
    });
  }
  /**
   * @param  {} filter
   * returns true for the first matching index of columnName of requestTemplateData.templateJson.filters and
   * columnName of configurationData.
   */
  findInFilters(filter) {
    return this.filtersFieldsData.filters.findIndex(t => t.columnName === filter.columnName);
  }

  findInFields(field) {
    return this.filtersFieldsData.fields.findIndex(t => t.columnName === field.columnName);
  }
  /**
   * if the user has saved the filter values for future uses we will be rebinding them to the UI with this function
   */
  checkForSavedValues() {
    if (this.requestTemplateData.templateJson.values) {
      this.filterValues = {...this.filterValues, ...this.requestTemplateData.templateJson.values} || {};
      this.isSaveFilterValues = Object.keys(this.filterValues).length ? true : false;
      this.updateFilterWithSavedValues();
    }
  }
  /**
   * for each filter if we have a saved value then WE update the UI with that value refer setDefaultValueForSerachOptions function
   */
  updateFilterWithSavedValues() {
    this.filtersFieldsData.filters.forEach(filter => {
      const value = this.findInFilterValues(filter);
      if(filter.filterType == 'lookUp') {
        this.lookUpValues[filter.columnName] = [];
        this.tempLookUpValues[filter.columnName] = [];
      }
      if (value) {
        this.setDefaultValueForSearchOptions(filter, this.filterValues[value]);
      }
    });
  }

  findInFilterValues(filter) {
    return Object.keys(this.filterValues).find(val => val === filter.columnName);
  }

  setDefaultValueForSearchOptions(template, value) {
    switch (template.filterType) {
      case 'elastic': this.setElasticDefaultValue(template, value); break;
      case 'endpoint': this.setEndpointDefaultValue(template, value); break;
      case 'lookUp': this.setLookUpDefaultValue(template, value); break;
      case 'autocomplete': this.setAutoCompleterDefaultValue(template, value); break;
      case 'date': this.setDateFieldsDefaultValue(template, value); break;
      case 'datetime': this.setDateFieldsDefaultValue(template, value); break;
      case 'freetext': this.setFreeTextFieldsDefaultValue(template, value); break;
      case 'range': this.setRangeFieldsDefaultValue(template, value); break;
      default: break;
    }
  }

  setElasticDefaultValue(template, value) {
    this.elasticSearchOptions[template.columnName].defaultValue = value[0];
  }

  setAutoCompleterDefaultValue(template, value) {
    this.autoCompleterSearchOptions[template.columnName].defaultValue = value[0];
  }

  setEndpointDefaultValue(template, value) {
    this.endPointSearchOptions[template.columnName].defaultValue = value[0];
  }

  setDateFieldsDefaultValue(template, value) {
    this.startDate[template.columnName] = new Date(value.from);
    this.endDate[template.columnName] = new Date(value.to);
  }

  setRangeFieldsDefaultValue(template, value) {
    this.rangeFrom[template.columnName] = value.from;
    this.rangeTo[template.columnName] = value.to;
  }

  setLookUpDefaultValue(template, value) {
    this.lookUpValues[template.columnName] = this.convertLookUpValueToLibraryFormat(value);
    this.tempLookUpValues[template.columnName] = this.convertLookUpValueToLibraryFormat(value);
  }

  setFreeTextFieldsDefaultValue(template, value) {
    this.tempFilterValues[template.columnName] = value[0];
  }
  /**
   * @param  {} values
   * library need [{code: 100, description:'actions_for_select_all_box'}] as input since we only save [decsrption] i have to map the values
   */
  convertLookUpValueToLibraryFormat(values) {
    return values.map(lookup => {
      const LOOKUP: any = {};
      LOOKUP.code = null;
      LOOKUP.description = lookup;
      return LOOKUP;
    });
  }

  setSearchFilterValue(data: any, template: any) {
    this.filterValues[template.columnName] = data ? [data[template.valueField]] : [];
  }

  setFilterValueForFreeText(columnName) {
    this.filterValues[columnName] =
      this.tempFilterValues[columnName] ? this.tempFilterValues[columnName].trim().split(',') : [];
  }

  updateFilterCriteria(filter: any) {
    this.setSelectAllStatus(this.isAllFieldsChecked());
    filter.isFilterChecked ? this.addFilterCriteria(filter) : this.removeFilterCriteria(filter);
  }

  setSelectAllStatus(status) {
    this.isAllCriteriasSelected = status;
  }
  /**
   * returns true if all the report fields get checked otherwise false.
   * */
  isAllFieldsChecked() {
    return this.configurationData.every(element => this.checkFilterValue(element));
  }

  checkFilterValue(filter) {
    return filter.filterType === 'null' ? true : filter.isFilterChecked ? true : false;
  }

  updateColumnFields(field) {
    this.setSelectAllStatusForColumns(this.isAllFieldsCheckedForColumns());
    field.isColumnChecked ? this.addColumnField(field) : this.removeColumnField(field);
  }

  setSelectAllStatusForColumns(status) {
    this.isAllColumnsSelected = status;
  }

  isAllFieldsCheckedForColumns() {
    return this.configurationData.every(element => this.checkFilterValueForColumns(element));
  }

  checkFilterValueForColumns(filter) {
    return filter.filterType === 'null' ? true : filter.isColumnChecked || filter.excludeDisplay === 'Y' ? true : false;
  }
  /**
   * @param  {} filter
   * removes the selected criteria from template filters
   */
  removeFilterCriteria(filter) {
    const INDEX = this.findInFilters(filter);
    return (INDEX > -1) ? this.filtersFieldsData.filters.splice(INDEX, 1) : null;
  }
  /**
   * @param  {} filter
   * adds the selected criteria to template filters
   */
  addFilterCriteria(filter) {
    this.filtersFieldsData.filters.push(filter);
    this.setDynamicSearchValues([filter]);
  }
  /**
   * @param  {} status
   * selects all the fields as checked.
   */
  selectAllReportFields(status) {
    this.filtersFieldsData.filters = this.filtersFieldsData.filters.filter(ele => ele.isMandatory);
    this.configurationData.forEach(element => {
      if (element.filterType !== 'null' && !element.isMandatory) {
        element.isFilterChecked = status;
        this.updateFilterCriteria(element);
      }
    });
  }

  selectAllColumnFields(status) {
    this.filtersFieldsData.fields = [];
    this.configurationData.forEach(element => {
      if (element.excludeDisplay !== 'Y') {
        element.isColumnChecked = status;
        this.updateColumnFields(element);
      }
    });
  }

  onLookupSelect(data, template) {
    this.tempLookUpValues[template.columnName] = data;
    if (template.valueField.split('#')[4] === 'CODE') {
      this.filterValues[template.columnName] = data.length ? data.map(d => d.code) : [];
    } else {
      this.filterValues[template.columnName] = data.length ? data.map(d => d.description) : [];
    }
  }

  assignTempValuesToLookUp() {
    this.lookUpValues = JSON.parse(JSON.stringify(this.tempLookUpValues));
  }

  generateReport() {
    if (this.isBirt) {
      this.generateBirtReport('pdf');
    } else if (this.checkFieldsSelected() && !this.isSaving) {
      this.isSaving = true;
      this.getReportCount();
      this.$subscriptions.push(this._reportService.generateReport(this.setRequestObject()).subscribe((data: any) => {
        this.result = data.generatedReport;
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
      this.addHeaderToTemplateJSON();
    }
  }

  generateBirtReport(reportType: string) {
    if (!this.isSaving) {
      if (this.checkMandatoryFilterFields()) {
        this.isSaving = true;
        this.$subscriptions.push(this._reportService.generateBirtReport(this.getBirtRequestObject(reportType))
          .subscribe((data: any) => {
            const fileURL = URL.createObjectURL(new Blob([data.body], { type: 'application/pdf' }));
            this.content = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
            setTimeout(() => {
              const EL = document.getElementById('embebededContainer');
              if (EL) {
                EL.style.height = '600px';
              }
            });
            this.isSaving = false;
          }, err => {
            this.isSaving = false;
            this._commonService.showToast(HTTP_ERROR_STATUS, err.error.errorMessage || 'Exception occurred in BIRT Engine Service');
          }));
      } else {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Please fill all the mandatory criteria(s) to preview the Report');
      }
    }
  }

  generateAuditLogRequest(actionType: string) {
    const birtParam = getValuesForBirt(this.filtersFieldsData.filters, this.filterValues);
    const auditModulename: any = { "Report Criteria Used": "","Report Action": actionType };
    const auditParameters = {
      ...auditModulename,
      ...birtParam
    }
    return auditParameters;
  }

  generatePreviewReport() {
    pageScroll('generateReport');
    this.isShowCollapse = false;
    const auditParameters=this.generateAuditLogRequest('Preview');
    if (this.isBirt) {
      if (this.checkMandatoryFilterFields()) {
        this.generateReport();
        this._auditLogService.saveAuditLog('I',"",auditParameters, 'BIRT_REPORT', [],this.requestTemplateData.templateName);
      } else {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Please fill all the mandatory criteria(s) to preview the Report');
      }
    } else {
      this.generateReport();
    }
  }

  downloadBirt(reportType: string) {
    if (this.checkMandatoryFilterFields()) {
      this.$subscriptions.push(this._reportService.generateBirtReport(this.getBirtRequestObject(reportType))
        .subscribe((data: any) => {
          const name = this.requestTemplateData.templateName + '-' + formatDate(new Date().getTime()).replace(/'/g, '');
          const extension = reportType === 'pdf' ? 'pdf' : 'xls';
          fileDownloader(data.body, name, extension);
          const auditParameters=this.generateAuditLogRequest('Export');
          this._auditLogService.saveAuditLog('I',"", auditParameters, 'BIRT_REPORT', [],this.requestTemplateData.templateName);
        },
          err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, err.error.errorMessage || 'Exception occurred in BIRT Engine Service');
          }));
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please fill all the mandatory criteria(s) to preview the Report');
    }
  }

  getBirtRequestObject(type: string) {
    const REQ_OBJECT: any = {};
    REQ_OBJECT.exportType = type;
    REQ_OBJECT.reportTypeId = this.currentModule;
    REQ_OBJECT.inputPrams = getValuesForBirt(this.filtersFieldsData.filters, this.filterValues);
    this.reportCriteria = setCriteria(this.filtersFieldsData.filters, this.filterValues);
    return REQ_OBJECT;
  }

  getReportCount() {
    this.$subscriptions.push(this._reportService.getReportCount(this.setRequestObject()).subscribe((data: any) => {
      this.reportCount = data.totalRecords;
    }));
  }
  /**
   * downloads the excel file a dynamic tag is used since its a post request and we cannot open post with window.open()
   */
  exportData() {
    if (this.checkFieldsSelected() && !this.isSaving) {
      this.isSaving = true;
      const requestObject = this.setRequestObject();
      this.$subscriptions.push(this._reportService.exportReportData(requestObject).subscribe((data: any) => {
        fileDownloader(data.body, requestObject.documentHeading, 'xlsx');
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    }
  }
  /**
   * @param  {any} field
   * @param  {string} type
   * binds the start date and end date to the filterValues object.
   */
  setDateValueToFilter(field: any, type: string) {
    this.filterValues[field] = (!this.filterValues[field]) ? {} : this.filterValues[field];
    type === 'start' ? delete this.filterValues[field].from : delete this.filterValues[field].to;
    if ((type === 'start' && this.startDate[field]) || (type !== 'start' && this.endDate[field])) {
      type === 'start' ? this.filterValues[field].from = this.startDate[field] : this.filterValues[field].to = this.endDate[field];
    }
  }
  /**
 * @param  {any} field
 * @param  {string} type
 * binds the From  and TO for range to the filterValues object.
 */
  setRangeValueToFilter(field: any, type: string) {
    this.filterValues[field] = (!this.filterValues[field]) ? {} : this.filterValues[field];
    type === 'From' ? delete this.filterValues[field].from : delete this.filterValues[field].to;
    if ((type === 'From' && this.rangeFrom[field]) || (type !== 'From' && this.rangeTo[field])) {
      type === 'From' ? this.filterValues[field].from = this.rangeFrom[field] : this.filterValues[field].to = this.rangeTo[field];
    }
  }
  /**
   * @param  {} field
   * adds the selected field to the template fields array
   */
  addColumnField(field) {
    this.isFieldSelected = true;
    this.filtersFieldsData.fields.push(field);
  }
  /**
   * @param  {} field
   * removes the selected column from template fields array
   */
  removeColumnField(field) {
    const INDEX = this.findInFields(field);
    if (INDEX > -1) {
      this.filtersFieldsData.fields.splice(INDEX, 1);
    }
  }
  /**
   * @param  {} type only allows to save if a template name is entered by user otherwise marks is templateName as false
   */
  validateTemplate(type) {
    if (this.isBirt || this.checkFieldsSelected()) {
      this.isTemplateName = false;
      if (this.templateName) {
        this.setRequestObjectForSave(type);
      } else {
        this.isTemplateName = true;
      }
    } else {
      document.getElementById('saveReportCancelBtn').click();
    }
  }
  /**
   * updates the request object with header used for printing adds required header with format and build the query that need to be executed.
   */
  setRequestObject() {
    let requestObject: any = {};
    this.reportCriteria = [];
    requestObject.moduleCode = this.requestTemplateData.moduleCode;
    requestObject.reportTemplateId = this.requestTemplateData.reportTemplateId;
    requestObject.reportTypeId = this.requestTemplateData.typeCode;
    requestObject.specialIndex = this.addEncryptedIndex();
    requestObject = this.setQueryToRequestObject(requestObject);
    this.reportCriteria = requestObject.reportCriteria || [];
    requestObject.headers = this.getTemplateHeaders();
    requestObject.documentHeading = this.requestTemplateData.templateName + '-' + formatDate(new Date().getTime()).replace(/'/g, '');
    return requestObject;
  }

  setQueryToRequestObject(requestObject: any) {
    const queryString = buildQuery(this.filtersFieldsData.filters,
      this.filtersFieldsData.fields, this.filterValues, this.templateTypes);
    return Object.assign(requestObject, queryString);
  }
  /**
   * @param  {} type setups request Object for save stringify the templateJson file
   * rebuilds the query with filter values if user wants to keep the value or removes the filter values from query.
   * if its a system defined template and user wants to save as his own template the templateType is set as 'U'.
   * Updates the request object with current user and personId
   */
  setRequestObjectForSave(type) {
    if (type === 'create') {
      this.requestTemplateData.reportTemplateId = null;
    }
    if (this.requestTemplateData.reportTemplateId === null && this.requestTemplateData.templateType === 'S') {
      this.requestTemplateData.templateType = 'U';
    }
    this.requestTemplateData.templateJson['values'] = this.isSaveFilterValues === true ? this.filterValues : {};
    this.requestTemplateData.templateOwnerPersonId = this._commonService.getCurrentUserDetail('personID');
    this.requestTemplateData.createUser = this.requestTemplateData.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.requestTemplateData.templateName = this.templateName;
    this.requestTemplateData.templateDescription = this.templateDescription;
    this.requestTemplateData.templateJson.headers = this.getTemplateHeaders();
    this.requestTemplateData.templateJson.fields = this.mappedColumnNames(this.filtersFieldsData.fields);
    this.requestTemplateData.templateJson.filters = this.mappedColumnNames(this.filtersFieldsData.filters);
    let requestObject: any = {};
    if (!this.isBirt) {
      requestObject.specialIndex = this.addEncryptedIndex();
      requestObject = this.setQueryToRequestObject(requestObject);
    }
    requestObject.reportTemplate = this.requestTemplateData;
    this.requestTemplateData.templateJson = JSON.stringify(this.requestTemplateData.templateJson);
    this.saveTemplate(type, requestObject);
  }

  /**
   * updates the template to the DB resets the values after the save.
   */
  saveTemplate(type, requestObject) {
    this.$subscriptions.push(this._reportService.saveOrUpdateReportTemplate(requestObject)
      .subscribe((data: any) => {
        this.requestTemplateData = data.reportTemplate;
        this.requestTemplateData.templateJson = JSON.parse(data.reportTemplate.templateJson);
        this.checkForSavedValues();
        this.checkForReportCreator();
        this.isTemplateName = false;
        document.getElementById('saveReportCancelBtn').click();
        if (type === 'create') {
          this.openNewTemplate(this.requestTemplateData.reportTemplateId);
        }
      }));
  }
  /**
   * @param  {any} data
   * returns the corresponding columnName from the data passed.
   */
  mappedColumnNames(data: any) {
    return data.map(element => element.columnName);
  }
  /**
   * @param  {} id
   * this open the new template once user uses save as  which navigates the new template generated
   */
  openNewTemplate(id) {
    this._router.navigate(['fibi/report/template'], { queryParams: { id: id, tc: this.currentModule } });
  }

  clearTemplate() {
    this.filterValues = {};
    this.tempLookUpValues = {};
    Object.keys(this.lookUpValues).forEach(K => this.lookUpValues[K]= []);
    this.startDate = {};
    this.endDate = {};
    this.tempFilterValues = {};
    this.clearField = new String('true');
    this.setDynamicSearchValues(this.filtersFieldsData.filters);
  }

  setModalFields() {
    this.templateName = (this.requestTemplateData.templateName) ? this.requestTemplateData.templateName : null;
    this.templateDescription = (this.requestTemplateData.templateDescription) ? this.requestTemplateData.templateDescription : null;
  }
  /**
   * this header array is used for printing purpose thus enabling dynamic heading see backend code for more clarity.
   */
  addHeaderToTemplateJSON() {
    this.requestTemplateData.templateJson['headers'] = this.getTemplateHeaders();
  }
  /**
   * return the header values used in template its used for print purposes in java this header values will be
   * displayed in excel sheet as column names
   */
  getTemplateHeaders() {
    if (this.filtersFieldsData.fields.length > 0) {
      return this.filtersFieldsData.fields.map(data => data.displayName);
    } else {
      return this.configurationData.map(data => data.displayName);
    }
  }

  checkFieldsSelected() {
    if (this.filtersFieldsData.fields.length) {
      this.isFieldSelected = true;
      return true;
    } else {
      this.isFieldSelected = false;
      return false;
    }
  }

  /**
   * Assign modal classes modal-lg and modal-xl based on number of checkbox elements in add criteria
   * and add column modals. This will also assigns the number which musts be reduced from default column divisions
   * based on modal sizes assigned.
   */
  setModalSizeForCriteriaAndColumn() {
    const criteriaCheckboxCount = this.configurationData.filter(element => element.filterType !== 'null').length;
    this.criteriaModalSize = criteriaCheckboxCount < 26 ? 'modal-lg' : 'modal-xl';
    this.columnModalSize = this.configurationData.length < 26 ? 'modal-lg' : 'modal-xl';
    this.criteriaSingleSpaceImpact = this.criteriaModalSize === 'modal-xl' ? 1 : 0;
    this.columnSingleSpaceImpact = this.columnModalSize === 'modal-xl' ? 1 : 0;
  }

  checkMandatoryFilterFields() {
    let isMandatoryNotFilled = true;
    this.filtersFieldsData.filters.forEach(F => {
      if (F.isMandatory && ((Array.isArray(this.filterValues[F.columnName]) && !this.filterValues[F.columnName].length) ||
        (!this.filterValues[F.columnName] || !Object.keys(this.filterValues[F.columnName]).length))) {
        isMandatoryNotFilled = false;
      }
    });
    return isMandatoryNotFilled;
  }

  setMandatoryFields() {
    this.configurationData.forEach(C => {
      if (C.filterType !== 'null' && (C.isMandatory || C.defaultValue) && this.findInFilters(C) === -1) {
        C.isFilterChecked = true;
        this.filtersFieldsData.filters.push(C);
      }
      if (C.excludeDisplay !== 'Y' && C.isMandatory && this.findInFields(C) === -1) {
        C.isColumnChecked = true;
        this.filtersFieldsData.fields.push(C);
      }
    });
  }

  setAllowedReportTypes() {
    this.requestTemplateData.reportType.birtDownloadOptions.forEach(T => this.allowedReports += T.downloadType);
  }

  setDefaultValuesToFilterValues() {
    this.configurationData.forEach( C => {
      if (C.defaultValue) {
        if (C.filterType === 'endpoint') {
          this.filterValues[C.columnName] = [C.defaultValue];
          this.endPointSearchOptions[C.columnName].defaultValue = C.defaultValue;
        } else if (C.filterType === 'elastic') {
          this.filterValues[C.columnName] = [C.defaultValue];
          this.elasticSearchOptions[C.columnName].defaultValue = C.defaultValue;
        } else if (C.filterType === 'freetext') {
          this.filterValues[C.columnName] = C.columnName.trim().split(',');
          this.tempFilterValues[C.columnName] = C.defaultValue;
        } else if (C.filterType === 'birtdate') {
          this.filterValues[C.columnName] = (!this.filterValues[C.columnName]) ? {} : this.filterValues[C.columnName];
          this.filterValues[C.columnName].from = new Date(C.defaultValue);
          this.startDate[C.columnName] = new Date(C.defaultValue);
        } else if (C.filterType === 'autocomplete') {
          this.filterValues[C.columnName] = [C.defaultValue];
          this.autoCompleterSearchOptions[C.columnName].defaultValue = C.defaultValue;
        }
      }
    });
  }

  checkFilterValuesLength(length = 0) {
    return Object.keys(this.filterValues).length > length;
  }

  removeString(string) {
    return string.replace(/['"]+/g, '').replace(/[,]+/g, ', ');
  }

  actionsOnPageChange() {
    pageScroll('generateReport');
  }

getYearRange(): any {
    const currentYear = new Date().getFullYear();
    const min = currentYear - YEAR_RANGE;
    const max = currentYear + YEAR_RANGE;
    return range(min, max);
}

setYearValueToFilter(columnName: string, filterType): void {
  if (this.tempFilterValues[columnName] === 'undefined') {
    delete this.filterValues[columnName];
  } else if (filterType === 'year_end') {
    this.filterValues[columnName] = [this.setYearEndValue(this.tempFilterValues[columnName])];
  } else {
    this.filterValues[columnName] = [this.setYearStartValue(this.tempFilterValues[columnName])];
  }
}

setYearEndValue(year: string): string {
  return LS_FY_END_DATE + '/' + year;
}

setYearStartValue(year: string): string {
  return LS_FY_START_DATE + '/' + year;
}

}

