import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { CodeTableService } from './code-table.service';
import { Subscription } from 'rxjs';
import { setFocusToElement, scrollIntoView, fileDownloader, deepCloneObject } from '../../../common/utilities/custom-utilities';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { getEndPointOptionsForSponsor, getEndPointOptionsForCountry,
    getEndPointOptionsForOrganization, getEndPointOptionsForLeadUnit,
    getEndPointOptionsForRole, getEndPointOptionsForLetterTemplatetypes,
    getEndPointOptionsForLetterTemplateMapping, 
    getEndPointOptionsForClaimTemplate} from '../../../common/services/end-point.config';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { parseDateWithoutTimestamp } from './../../../common/utilities/date-utilities';
import { CodeTableItem, CodeTableSave, Field } from '../codetable-interface';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getCompleterOptionsForRole } from '../../../common/services/completer.config';
import { AuditLogService } from '../../../common/services/audit-log.service';

/**
 * revamped by Mahesh Sreenath V M
 * the code comments are purposefully removed you can find the basic details from here.
 * https://docs.google.com/document/d/1kmpsKZxQBqRBHsBQpNzHv0BbGtO2ZP8X6j795kojN1w/edit
 * this document include the work flow and how this code is organized.
 * Quick workflow is the code table details are fetched from parent and a dynamic UI is build on top of that.
 * On new value changes we initialize the UI by adding dynamic searches and lookups.
 * functions are arranged in the flow of execution
 * if further clarifications are required contact @ mahesh.sreenath@polussoftware.com
 */
@Component({
    selector: 'app-code-table',
    templateUrl: './code-table.component.html',
    styleUrls: ['./code-table.component.css'],
    providers: [WafAttachmentService, AuditLogService,
    {provide: 'moduleName', useValue: 'CODE_TABLE'}]
})

export class CodeTableComponent implements OnChanges, OnDestroy {
    @Input() codeTableProperty: CodeTableItem;

    tableColumnList: Array<Field> = [];
    tableEntryList: any = [];
    newCodeTableEntry: any = {};
    lookupDefaultValues = {};
    currentEditIndex: number = -1;
    isActiveStatusUpdated = false;
    previousStatus: string;
    previousColumName: string;
    updatedCodeTable: CodeTableSave = {
        tableData: [],
        primaryValues: [],
        changedMap: [],
        tableName: '',
        personId: '',
        updatedUser: ''
    };
    placeHolder = 'Search by ';
    searchText: string;
    attachmentColumnName: string;
    endPointSearchOptions: any = {};
    elasticSearchOptions: any = {};
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    uploadedFile: Array<any> = [];
    errorMap = new Map();
    isShowModal = false;
    sortedColumn: any;
    sortOrder: boolean;
    isEditAllowed = false;
    isDeleteAllowed = false;
    isAddAllowed = false;
    isSaving = false;
    autoCompleterSearchOptions: any = {};

    beforeObj: any;
    changedFieldsForAuditLog: any = [];

    constructor(private _codeTableService: CodeTableService,
        public commonService: CommonService,
        private _auditService: AuditLogService,
        private _wafAttachmentService: WafAttachmentService,
        private _elasticConfig: ElasticConfigService) { }

    ngOnChanges(): void {
        this.getCodeTableEntries();
    }

    initializeCodeTableObjects(): void {
        this.tableColumnList = this.codeTableProperty.content.fields || [];
        this.updatedCodeTable.updatedUser = this.commonService.getCurrentUserDetail('userName');
        this.updatedCodeTable.personId = this.commonService.getCurrentUserDetail('personID');
        this.placeHolder = 'Search by ';
        this.searchText = '';
        this.attachmentColumnName = '';
    }

    setAllowedUserActions() {
        if (this.codeTableProperty.content.actions) {
            this.isEditAllowed = this.codeTableProperty.content.actions.includes('U');
            this.isDeleteAllowed = this.codeTableProperty.content.actions.includes('D');
            this.isAddAllowed = this.codeTableProperty.content.actions.includes('I');
        } else {
            this.isEditAllowed = true;
            this.isDeleteAllowed = true;
            this.isAddAllowed = true;
        }
    }

    getCodeTableEntries(): void {
        this.updatedCodeTable.tableName = this.codeTableProperty.tableName;
        this.$subscriptions.push(this._codeTableService.getCodeTableEntryList(this.updatedCodeTable)
            .subscribe((data: any) => {
                this.codeTableProperty.content = data.codeTable;
                this.tableEntryList = data.tableData;
                this.initializeCodeTableObjects();
                this.createPlaceHolderValue();
                this.setAllowedUserActions();
                this.scrollTableEntryListIntoView();
            }));
    }

    scrollTableEntryListIntoView() {
        setTimeout(() => {
            scrollIntoView('code-table-add-entry-card', 'start');
        }, 100);
    }

    createPlaceHolderValue(): void {
        this.tableColumnList.forEach((field: Field) => {
            if (field.visible) {
                this.placeHolder = this.placeHolder + field.displayName + ', ';
            }
        });
    }

    setNewCreation(): void {
        this.newCodeTableEntry = {};
        this.makeSwitchTypeColumnAsActive();
        this.assignCurrentIndex();
        this.assignSearchFieldOptions(this.tableColumnList);
        this.isShowModal = true;
        this.errorMap.clear();
        this.uploadedFile = [];
    }

    makeSwitchTypeColumnAsActive(): void {
        this.tableColumnList.forEach((field: Field) => {
            if (field.filterType === 'switch') {
                this.newCodeTableEntry[field.columnName] = 'Y';
                this.markAsChanged(field.columnName);
                this.getAuditLogChangedFields(field.columnName);
            }
        });
    }

    assignCurrentIndex(value: any = {}): void {
        this.currentEditIndex = this.tableEntryList.indexOf(value);
    }

    assignSearchFieldOptions(tableColumnList: Array<Field>) {
        tableColumnList.forEach((field: Field) => {
            switch (field.filterType) {
                case 'endpoint': {
                    this.setEndpointOptions(field);
                    this.endPointSearchOptions[field.columnName].defaultValue = this.newCodeTableEntry[field.defaultValue];
                    break;
                };
                case 'elastic': {
                    this.setElasticOptions(field);
                    this.elasticSearchOptions[field.columnName].defaultValue = this.newCodeTableEntry[field.defaultValue];
                    break;
                };
                case 'lookUp': {
                    this.lookupDefaultValues[field.columnName] = this.newCodeTableEntry[field.defaultValue];
                    break;
                };
                case 'autocompleter': {
                    if (field.index === 'roleName') {
                        this.$subscriptions.push(this._codeTableService.fetchRoles().subscribe((data: any) => {
                            this.autoCompleterSearchOptions[field.columnName] = getCompleterOptionsForRole(data, this.newCodeTableEntry[field.defaultValue]);
                        }));
                    }
                    break;
                };
                default: break;
            }
        });
    }

    setEndpointOptions(field: Field): void {
        switch (field.index) {
            case 'sponsorName': this.endPointSearchOptions[field.columnName] = getEndPointOptionsForSponsor(); break;
            case 'countryName': this.endPointSearchOptions[field.columnName] = getEndPointOptionsForCountry(); break;
            case 'organizationName': this.endPointSearchOptions[field.columnName] = getEndPointOptionsForOrganization(); break;
            case 'unitName': this.endPointSearchOptions[field.columnName] = getEndPointOptionsForLeadUnit(); break;
            case 'roleName': this.endPointSearchOptions[field.columnName] = getEndPointOptionsForRole(); break;
            case 'letterTemplate': this.endPointSearchOptions[field.columnName] = getEndPointOptionsForLetterTemplatetypes(); break;
            case 'letterTemplateMapping': this.endPointSearchOptions[field.columnName] = getEndPointOptionsForLetterTemplateMapping(); break;
            case 'claimTemplates': this.endPointSearchOptions[field.columnName] = getEndPointOptionsForClaimTemplate(); break;
            default: break;
        }
    }

    setElasticOptions(field: Field): void {
        switch (field.index) {
            case 'fibiproposal': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForProposal(); break;
            case 'fibiperson': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForPerson(); break;
            case 'awardfibi': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForAward(); break;
            case 'instituteproposal': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForProposal(); break;
            case 'grantcall': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForGrantCall(); break;
            case 'fibiirb': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForIrb(); break;
            case 'fibirolodex': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForRolodex(); break;
            case 'coifibi': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForCoi(); break;
            case 'iacucfibi': this.elasticSearchOptions[field.columnName] = this._elasticConfig.getElasticForIacuc(); break;
            default: break;
        }
    }

    addNewCodeTableData(): void {
        if (this.validateCodeTableEntry() && !this.isSaving) {
        this.isSaving = true;
        const AFTER = deepCloneObject(this.newCodeTableEntry);
        this.updatedCodeTable.tableData[0] = this.newCodeTableEntry;
            if (!this.commonService.isWafEnabled) {
                this.$subscriptions.push(this._codeTableService.addNewCodeTableData(this.updatedCodeTable, this.attachmentColumnName)
                    .subscribe((data: any) => {
                        if (data && !data.error && data.promptCode === 1) {
                            this.saveAuditLog('I', null, AFTER);
                        } else {
                            this.changedFieldsForAuditLog = [];
                        }
                        this.actionsAfterSave(data);
                        this.isSaving = false;
                    }, err => {
                        this.changedFieldsForAuditLog = [];
                        this.isSaving = false;
                    }));
            } else {
                this.addNewCodeTableDataWaf();
                this.isSaving = false;
            }
        }
    }

    validateCodeTableEntry(): boolean {
        this.errorMap.clear();
        this.tableColumnList.forEach((column: Field) => {
            this.newCodeTableEntry[column.columnName] && column.dataType === 'String' ?
                this.newCodeTableEntry[column.columnName].toString().trim() : this.newCodeTableEntry[column.columnName];
            if (this.isEntryInvalid(column)) {
                this.errorMap.set(column.columnName, 'This field is missing. Please check');
            }
        });
        return this.errorMap.size ? false : true;
    }

    isEntryInvalid(column: Field): boolean {
        if (['Clob', 'Blob'].includes(column.dataType)) {
            return this.currentEditIndex !== -1 ? false : (column.isEditable && !column.canEmpty && !this.newCodeTableEntry[column.columnName]);
        } else {
            return column.isEditable && !column.canEmpty && 
                  !(this.newCodeTableEntry[column.columnName] || this.newCodeTableEntry[column.columnName] == 0);
        }
    };

    async addNewCodeTableDataWaf() {
        if (this.uploadedFile.length) {
            const data = await this._wafAttachmentService.saveAttachment(this.updatedCodeTable, null, this.uploadedFile,
                '/addCodeTableRecordForWaf', null, null);
            this.actionsAfterSave(data);
        } else {
            this._wafAttachmentService.saveWafRequest(this.updatedCodeTable, '/addCodeTableRecordForWaf').then(data => {
                this.actionsAfterSave(data);
            }).catch(error => {
                this.checkEntryStatus(error);
            });
        }
    }

    editCodeTable(value: any): void {
        this.beforeObj = {};
        this.assignCurrentIndex(value);
        this.newCodeTableEntry = deepCloneObject(value);
        this.beforeObj = deepCloneObject(value);
        this.setPrimaryFieldValues(value);
        this.assignSearchFieldOptions(this.tableColumnList);
        this.isShowModal = true;
        this.errorMap.clear();
    }

    setPrimaryFieldValues(newCodeTableEntry: any): void {
        this.updatedCodeTable.primaryValues = [];
        this.codeTableProperty.content.primaryKey.forEach((PKey: string) => {
            const primaryKey = {};
            primaryKey[PKey] = newCodeTableEntry[PKey] || null;
            this.updatedCodeTable.primaryValues.push(primaryKey);
        });
    }

    updateCodeTable(newCodeTableEntry: Object): void {
        if (this.validateCodeTableEntry()) {
            this.updateNullValue(newCodeTableEntry);
            this.updatedCodeTable.tableData[0] = newCodeTableEntry;
            if (!this.commonService.isWafEnabled) {
                this.saveCodeTableEntry();
            } else {
                this.updateCodeTableWaf();
            }
        }
    }

    updateNullValue(newCodeTableEntry) {
        this.tableColumnList.forEach(column => {
            if (newCodeTableEntry[column.columnName] === 'null') {
                newCodeTableEntry[column.columnName] = null;
            }
        });
    }

    saveCodeTableEntry(): void {
        this.$subscriptions.push(
            this._codeTableService.getUpdatedTableValues(this.updatedCodeTable, this.attachmentColumnName)
                .subscribe((data: any) => {
                    if (data && !data.error && data.promptCode === 1) {
                        this.saveAuditLog('U', this.beforeObj, this.updatedCodeTable.tableData[0]);
                    } else {
                        this.changedFieldsForAuditLog = [];
                    }
                    this.actionsAfterSave(data);
                }, err => {
                    this.revertCodeTableEntry();
                    this.changedFieldsForAuditLog = [];
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please contact Support.');
                }));
    }

    closeModal(): void {
        this.isShowModal = false;
        const ELEMENT = document.getElementById('closeModal');
        if (ELEMENT) {
            ELEMENT.click();
        }
    }

    checkEntryStatus(data: any): void {
        if (data && !data.error) {
            if (data.promptCode === 1) {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, data.promptMessage);
            } else {
                this.commonService.showToast(HTTP_ERROR_STATUS, data.promptMessage);
                this.revertCodeTableEntry();
            }
        } else {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please contact Support.');
        }
        this.attachmentColumnName = '';
        this.isActiveStatusUpdated = false;
        this.uploadedFile = [];
    }

    revertCodeTableEntry(): void {
        if (this.isActiveStatusUpdated) {
            this.updatedCodeTable.tableData[0][this.previousColumName] = this.previousStatus;
            this.isActiveStatusUpdated = false;
        }
    }

    actionsAfterSave(data: any): void {
        if (!this.isActiveStatusUpdated) {
            this.getCodeTableEntries();
        }
        this.closeModal();
        this.checkEntryStatus(data);
        this.unMarkChanges();
    }

    async updateCodeTableWaf(): Promise<any> {
        if (this.uploadedFile.length) {
            this._wafAttachmentService.saveAttachment(this.updatedCodeTable, null, this.uploadedFile,
                '/updateCodeTableRecordForWaf', null, null).then((data: any) => {
                    this.actionsAfterSave(data);
                }).catch(error => {
                    this.checkEntryStatus(error);
                });
        } else {
            this._wafAttachmentService.saveWafRequest(this.updatedCodeTable, '/updateCodeTableRecordForWaf').then((data: any) => {
                this.actionsAfterSave(data);
            }).catch(error => {
                this.checkEntryStatus(error);
            });
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    toggleCodeTableEntryStatus(status: string, values: Object, columnName: string) {
        this.assignCurrentIndex(values);
        this.isActiveStatusUpdated = true;
        this.beforeObj = {};
        this.beforeObj = deepCloneObject(values);
        this.previousStatus = values[columnName];
        this.previousColumName = columnName;
        this.markAsChanged(columnName);
        this.getAuditLogChangedFields(columnName);
        values[columnName] = status;
        this.newCodeTableEntry = Object.assign({}, values);
        this.setPrimaryFieldValues(values);
        this.updateCodeTable(values);
    }

    markAsChanged(columnName: string): void {
        if (!this.updatedCodeTable.changedMap.includes(columnName)) {
            this.updatedCodeTable.changedMap.push(columnName);
        }
    }

    getAuditLogChangedFields(fieldName: string): void {
        if (!this.changedFieldsForAuditLog.includes(fieldName)) {
            this.changedFieldsForAuditLog.push(fieldName);
        }
    }

    unMarkChanges(): void {
        this.updatedCodeTable.changedMap = [];
    }

    deleteCodeTableData(): void {
        let tempSearchText = this.searchText;
        this.updatedCodeTable.tableData[0] = this.tableEntryList[this.currentEditIndex];
        this.setPrimaryFieldValues(this.tableEntryList[this.currentEditIndex]);
        this.searchText = '';
        this.$subscriptions.push(this._codeTableService.removeSelectedData(this.updatedCodeTable)
            .subscribe((data: any) => {
                if (data.promptCode === 1) {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, data.promptMessage);
                    this.tableEntryList.splice(this.currentEditIndex, 1);
                    this.saveAuditLog('D', this.beforeObj, null);
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, data.promptMessage);
                }
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please contact Support.');
            }, () => {
                this.searchText = tempSearchText;
            }));
    }

    downloadAttachment(values: any, columnName: string): void {
        this.updatedCodeTable.tableData[0] = values;
        this.updatedCodeTable.selectedColumnForDownload = columnName;
        this.setPrimaryFieldValues(values);
        this.$subscriptions.push(this._codeTableService.downloadAttachment(this.updatedCodeTable)
            .subscribe((data: any) => fileDownloader(data, values.FILE_NAME)));
    }

    addAttachments(file: Array<File>, columnName: string): void {
        if (file.length) {
            this.uploadedFile = [];
            this.uploadedFile.push(file[0]);
            this.newCodeTableEntry[columnName] = file[0];
            this.newCodeTableEntry[this.codeTableProperty.content.fileColumnName] = file[0].name;
            this.attachmentColumnName = columnName;
            this.markAsChanged(columnName);
            this.markAsChanged(this.codeTableProperty.content.fileColumnName);
            this.getAuditLogChangedFields(columnName);
            this.getAuditLogChangedFields(this.codeTableProperty.content.fileColumnName);
        }
    }

    deleteAttachment(columnName: string): void {
        this.newCodeTableEntry[columnName] = '';
        this.uploadedFile = [];
        this.attachmentColumnName = '';
    }

    setDateFormat(columnName: string): void {
        if (this.newCodeTableEntry[columnName]) {
            this.newCodeTableEntry[columnName] = parseDateWithoutTimestamp(this.newCodeTableEntry[columnName]);
            this.newCodeTableEntry[columnName] = new Date(this.newCodeTableEntry[columnName]).getTime();
        }
    }

    onLookupSelect(data: any, columnName: string, defaultValue: string): void {
        if (data.length) {
            this.newCodeTableEntry[columnName] = data[0].code;
            this.newCodeTableEntry[defaultValue] = data[0].description;
        } else {
            this.newCodeTableEntry[columnName] = '';
            this.newCodeTableEntry[defaultValue] = '';
        }
        this.markAsChanged(columnName);
        this.getAuditLogChangedFields(columnName);
        this.getAuditLogChangedFields(defaultValue);
    }

    onEndPointSelect(data: any, columnName: string, valueField: string, defaultValue: string, index): void {
        if (data) {
            this.newCodeTableEntry[columnName] = data[valueField] || '';
            this.newCodeTableEntry[defaultValue] = data[index] || '';
        } else {
            this.newCodeTableEntry[columnName] = '';
            this.newCodeTableEntry[defaultValue] = '';
        }
        this.markAsChanged(columnName);
        this.getAuditLogChangedFields(columnName);
        this.getAuditLogChangedFields(defaultValue);
    }

    onElasticSelect(data: any, columnName: string, valueField: string, defaultValue: string): void {
        if (data) {
            this.newCodeTableEntry[columnName] = data[valueField] || '';
            this.newCodeTableEntry[defaultValue] = data[defaultValue.toLowerCase()] || '';
        } else {
            this.newCodeTableEntry[columnName] = '';
            this.newCodeTableEntry[defaultValue] = '';
        }
        this.markAsChanged(columnName);
        this.getAuditLogChangedFields(columnName);
        this.getAuditLogChangedFields(defaultValue);
    }

    onAutoCompleterSelect(data: any, columnName: string, valueField: string, defaultValue: string, index: string): void {
        this.newCodeTableEntry[columnName] = (data && data[valueField]) || '';
        this.newCodeTableEntry[defaultValue] = (data && data[index]) || '';
        this.markAsChanged(columnName); 
        this.getAuditLogChangedFields(columnName); 
        this.getAuditLogChangedFields(defaultValue);
	}

    sortOnDisplayName(sortColumn: string, type: string): void {
        this.sortedColumn = sortColumn;
        this.sortOrder = !this.sortOrder;
        this.tableEntryList.sort((a, b) => {
            let first: string | number = '';
            let second: string | number = '';
            if (type === 'String') {
                first = a[sortColumn] ? a[sortColumn].toLowerCase() : '';
                second = b[sortColumn] ? b[sortColumn].toLowerCase() : '';
            } else if (type === 'INTEGER') {
                first = a[sortColumn] ? parseInt(a[sortColumn], 10) : 0;
                second = b[sortColumn] ? parseInt(b[sortColumn], 10) : 0;
            }
            if (first < second) {
                return this.sortOrder ? -1 : 1;
            }
            if (first > second) {
                return this.sortOrder ? 1 : -1;
            }
            return 0;
        });

    }

    deleteCodeTable(values: any) {
        this.beforeObj = {};
        this.beforeObj = deepCloneObject(values);
        this.assignCurrentIndex(values);
    }

    private saveAuditLog(acType: any, before: any, after: any): void {
        if (this.codeTableProperty.isAuditLogEnabledInTable) {
            let FIELD_METADATA = acType === 'U' ? this.changedFieldsForAuditLog : [] ;
            FIELD_METADATA = FIELD_METADATA.filter(ele => ele != 'UPDATE_TIMESTAMP');
            this._auditService.saveAuditLog(acType, before, after, this.updatedCodeTable.tableName, FIELD_METADATA);
        }
        this.changedFieldsForAuditLog = [];
    }

}
