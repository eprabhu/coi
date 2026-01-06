import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { fileDownloader, setFocusToElement } from '../../common/utilities/custom-utilities';
import { compareDates, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExportObject, Person, Category } from './audit-log-report';
import { AuditLogReportService } from './audit-log-report.service';

@Component({
    selector: 'app-audit-log-report',
    templateUrl: './audit-log-report.component.html',
    styleUrls: ['./audit-log-report.component.css'],
    providers: [AuditLogReportService]
})
export class AuditLogReportComponent implements OnInit, OnDestroy {

    elasticPersonSearchOptions: any;
    clearPersonField: String;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    exportObject: ExportObject = new ExportObject();
    isFieldsEmpty = false;
    selectedPersons: Array<Person> = [];
    selectedCategory: Array<Category> = [];
    categoryLookUp = 'AUDIT_LOG_CONFIG#MODULE#TRUE';
    dateWarningList = new Map();
    isSaving = false;
    datePipe = new DatePipe('en-US');

    constructor(private _elasticConfig: ElasticConfigService, private _auditLogService: AuditLogReportService,
        private _commonService: CommonService) { }

    ngOnInit() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    selectPerson(event: Person): void {
        this.clearPersonField = new String('true');
        if (event && !this.checkForDuplicatePerson(event.prncpl_id)) {
            this.selectedPersons.push(event);
            this.isFieldsEmpty = false;
        }
    }

    private checkForDuplicatePerson(personId: any): boolean {
        return !!this.selectedPersons.find(ele => ele.prncpl_id === personId);
    }

    clearField(): void {
        this.exportObject = new ExportObject();
        this.elasticPersonSearchOptions.defaultValue = null;
        this.selectedPersons = [];
        this.selectedCategory = [];
        this.clearPersonField = new String('true');
        this.isFieldsEmpty = false;
        this.dateWarningList.clear();
    }

    validateFields(): void {
        this.getSelectedPersonsList();
        this.getSelectedCategoryList();
        if (!this.exportObject.actionFrom && !this.exportObject.actionTo
            && !this.exportObject.moduleNames.length && !this.exportObject.personIds.length) {
            this.isFieldsEmpty = true;
        } else {
            this.isFieldsEmpty = false;
            this.generateExcelReport();
        }
    }

    private getSelectedCategoryList(): void {
        this.exportObject.moduleNames = [];
        this.exportObject.moduleDescriptions = [];
        if (this.selectedCategory.length) {
            this.selectedCategory.forEach((ele) => {
                this.exportObject.moduleNames.push(ele.code);
                this.exportObject.moduleDescriptions.push(ele.description);
            });
        }
    }

    private getSelectedPersonsList(): void {
        this.exportObject.personIds = [];
        this.exportObject.personNames = [];
        if (this.selectedPersons.length) {
            this.selectedPersons.forEach((ele) => {
                this.exportObject.personIds.push(ele.prncpl_id);
                this.exportObject.personNames.push(ele.full_name);
            });
        }
    }

    private generateExcelReport(): void {
        const FILE_NAME = `fibi_audit_log_report_${this.datePipe.transform(new Date(), 'yyyyMMddHHmm')}`;
        this.exportObject.actionFrom = this.exportObject.actionFrom ? parseDateWithoutTimestamp(this.exportObject.actionFrom) : null;
        this.exportObject.actionTo = this.exportObject.actionTo ? parseDateWithoutTimestamp(this.exportObject.actionTo) : null;
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._auditLogService.getAuditReportAsExcel(this.exportObject).subscribe((data: any) => {
                    fileDownloader(data.body, FILE_NAME, 'xlsx');
                    this.clearField();
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in exporting excel, please try again');
                    this.isSaving = false;
                }));
        }
    }

    onLookupSelect(event: Array<Category>): void {
        if (event) {
            this.selectedCategory = event;
        }
    }

    removePerson(index: number): void {
        this.selectedPersons.splice(index, 1);
    }

    dateValidation(): void {
        this.dateWarningList.clear();
        if (this.exportObject.actionTo != null) {
            if (compareDates(this.exportObject.actionFrom, this.exportObject.actionTo, 'dateObject', 'dateObject') === 1) {
                this.dateWarningList.set('endDate', 'Please select TO date after FROM date');
            }
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
