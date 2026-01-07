import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import {
    CompleterOptions, ServiceRequest, ServiceRequestHistory,
    ServiceRequestModule, ServiceRequestPriority, ServiceRequestRoot, ServiceRequestType
} from '../../service-request.interface';
import { CommonDataService } from '../../services/common-data.service';
import { ServiceRequestService } from '../../services/service-request.service';
import { OverviewService } from '../overview.service';
import { concatUnitNumberAndUnitName } from '../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-request-edit',
    templateUrl: './request-edit.component.html',
    styleUrls: ['./request-edit.component.css']
})
export class RequestEditComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    serviceRequest: ServiceRequest = new ServiceRequest();
    temporaryServiceObject: ServiceRequest = new ServiceRequest();
    serviceRequestHistory: ServiceRequestHistory = null;
    moduleList: ServiceRequestModule[];
    serviceRequestTypes: ServiceRequestType[];
    priorityList: ServiceRequestPriority[];
    errorMap = new Map();
    isSaving = false;

    categoryCompleterOptions: CompleterOptions = new CompleterOptions();
    requestTypeCompleterOptions: CompleterOptions = new CompleterOptions();
    departmentSearchOptions: any = {};
    categoryClearFiled: string;
    requestTypeClearFiled: string;
    clearFieldLeadUnit: String;
    linkedModuleSearchOptions: any = {};
    clearLinkedModuleField: String;
    linkedModulePlaceholder: string;

    constructor(
        private _autoSaveService: AutoSaveService,
        public _serviceRequestService: ServiceRequestService,
        public _commonData: CommonDataService,
        private _router: Router,
        private _elasticConfig: ElasticConfigService,
        private _commonService: CommonService,
        private _overviewService: OverviewService
    ) { }

    ngOnInit() {
        this.setSearchOptions();
        this._autoSaveService.initiateAutoSave();
        this.getGeneralDetails();
        this.autoSaveEvent();
        this.loadLookups();
    }

    ngOnDestroy() {
        this._autoSaveService.stopAutoSaveEvent();
        subscriptionHandler(this.$subscriptions);
    }

    private loadLookups() {
        this.$subscriptions.push(
            this._serviceRequestService.loadLookups().subscribe((data: any) => {
                this.moduleList = data.moduleList || [];
                this.serviceRequestTypes = data.serviceRequestTypes || [];
                this.priorityList = data.serviceRequestPriorities || [];
                this.setCategoryOptions();
                this.setCategoryTypeOptions();
            })
        );
    }

    private getGeneralDetails(): void {
        const data: any = this._commonData.getData(['serviceRequest']);
        this.serviceRequest = data.serviceRequest;
        this.setDefaultValues();
        this.setTemporaryData();
        // this.setUnitForNewRequest();
    }

    private setUnitForNewRequest(): void {
        if (this.serviceRequest.serviceRequestId) {
            return;
        }
        this.$subscriptions.push(
            this._overviewService.getPersonInformation(this._commonService.getCurrentUserDetail('personID')).subscribe((data: any) => {
                if (data.unit) {
                    this.selectDepartment(data.unit);
                    this.departmentSearchOptions.defaultValue = concatUnitNumberAndUnitName(data.unit.unitNumber, data.unit.unitName);
                    this.clearFieldLeadUnit = new String('false');
                }
            })
        );
    }

    private setTemporaryData(): void {
        if (this.serviceRequest.statusCode === 1) {
            return;
        }
        this.temporaryServiceObject = JSON.parse(JSON.stringify(this.serviceRequest));
    }
    /**
     * this Event subscribes to the auto save trigger generated on save click on top basically
     * what happens is when a save click happen this will let this component know when
     * user click the general save button.
     */
    private autoSaveEvent(): void {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(event => this.saveOrUpdateServiceRequest()));
    }

    private setCategoryOptions(): void {
        this.categoryCompleterOptions = {
            arrayList: this.getModuleList(),
            contextField: 'description',
            filterFields: 'description',
            formatString: 'description',
            defaultValue: this.getDefaultValues(this.serviceRequest.serviceRequestModule),
        };
    }

    private getModuleList(): ServiceRequestModule[] {
        return this.moduleList.filter(element => element.isActive);
    }

    private getDefaultValues(data): string {
        return data ? data.description : '';
    }

    private setCategoryTypeOptions(): void {
        this.requestTypeCompleterOptions = {
            arrayList: this.getTypeList(),
            contextField: 'description',
            filterFields: 'description',
            formatString: 'description',
            defaultValue: this.getDefaultValues(this.serviceRequest.serviceRequestType),
        };
    }

    private getTypeList(): ServiceRequestType[] {
        if (!this.serviceRequest.moduleCode) {
            return [];
        }
        return this.serviceRequestTypes.filter(element => this.filterConditionsForType(element));
    }

    private filterConditionsForType(element) {
        return element.activeFlag === 'Y' && this.serviceRequest.moduleCode && element.moduleCode === this.serviceRequest.moduleCode;
    }

    categorySelect(event): void {
        this.setUnsavedChanges(true);
        if (event) {
            this.serviceRequest.moduleCode = event.moduleCode;
            this.serviceRequest.serviceRequestModule = event;
        } else {
            this.serviceRequest.moduleCode = this.serviceRequest.serviceRequestModule = null;
            this.serviceRequest.subject = null;
            this._serviceRequestService.serviceRequestTitle = null;
            this.serviceRequest.description = null;
        }
        this.categoryTypeSelect();
        this.setCategoryTypeOptions();
        this.selectModuleResult();
        this.setModuleSearchOptions();
    }

    categoryTypeSelect(event?: any): void {
        this.setUnsavedChanges(true);
        if (event) {
            this.serviceRequest.typeCode = event.typeCode;
            this.serviceRequest.serviceRequestType = event;
            this.serviceRequest.subject = event.subject;
            this._serviceRequestService.serviceRequestTitle = event.subject;
            this.serviceRequest.description = event.instruction;
        } else {
            this.serviceRequest.typeCode = this.serviceRequest.serviceRequestType = null;
            this.serviceRequest.subject = null;
            this.serviceRequest.description = null;
        }
    }

    private setModuleSearchOptions(): void {
        switch (this.serviceRequest.moduleCode) {
            case 1: this.linkedModuleSearchOptions = this._elasticConfig.getElasticForAward(); break;
            case 2: this.linkedModuleSearchOptions = this._elasticConfig.getElasticForIP(); break;
            case 3: this.linkedModuleSearchOptions = this._elasticConfig.getElasticForProposal(); break;
            case 13: this.linkedModuleSearchOptions = this._elasticConfig.getElasticForAgreement(); break;
            default: this.linkedModuleSearchOptions = {}; break;
        }
        if (this.serviceRequest.serviceRequestModule) {
            this.linkedModulePlaceholder = `Search for ${this.serviceRequest.serviceRequestModule.description}`;
        }
    }

    private setSearchOptions(): void {
        this.departmentSearchOptions = getEndPointOptionsForDepartment();
        this.setModuleSearchOptions();
    }

    private setDefaultValues(): void {
        this.departmentSearchOptions.defaultValue = this.serviceRequest.unit ?
            concatUnitNumberAndUnitName(this.serviceRequest.unit.unitNumber, this.serviceRequest.unit.unitName) : '';
        this.setModuleSearchOptions();
        this.linkedModuleSearchOptions.defaultValue = this.serviceRequest.moduleDetails ?
            this.serviceRequest.moduleDetails.title || this.serviceRequest.moduleDetails.moduleItemKey : '';
    }

    selectDepartment(event?: any): void {
        this.setUnsavedChanges(true);
        if (event) {
            this.serviceRequest.unitNumber = event.unitNumber;
            this.serviceRequest.unit = event;
        } else {
            this.serviceRequest.unit = this.serviceRequest.unitNumber = null;
        }
    }

    selectModuleResult(event?: any): void {
        this.setUnsavedChanges(true);
        if (event) {
            this.setLinkedModuleData(event);
        } else {
            this.serviceRequest.moduleItemKey = this.serviceRequest.moduleDetails = null;
        }
    }

    private setLinkedModuleData(event): void {
        const moduleItemKey = event ? event.award_id || event.proposal_id || event.agreement_request_id : null;
        this.$subscriptions.push(
            this._overviewService.loadModuleDetail(this.serviceRequest.moduleCode, moduleItemKey).subscribe((data: any) => {
                this.serviceRequest.moduleDetails = data;
                this.serviceRequest.moduleItemKey = moduleItemKey;
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching module details failed. Please try again.');
            })
        );
    }

    unlinkModule(event: boolean): void {
        if (event) {
            this.selectModuleResult();
            this.linkedModuleSearchOptions.defaultValue = '';
            this.clearLinkedModuleField = new String('true');
            if (this.serviceRequest.serviceRequestId) {
                this.saveOrUpdateServiceRequest();
            }
        }
    }

    private setPriorityDetails(): void {
        this.serviceRequest.serviceRequestPriority =
            this.priorityList.find(element => element.priorityId == this.serviceRequest.priorityId);
    }

    saveOrUpdateServiceRequest(): void {
        if (this.validateSave()) {
            if (!this.isSaving) {
                this.isSaving = true;
                this.setPriorityDetails();
                this.getPreviousValues();
                this.$subscriptions.push(
                    this._serviceRequestService.saveOrUpdateServiceRequest({
                        serviceRequest: this.serviceRequest,
                        serviceRequestHistory: this.serviceRequestHistory
                    }).subscribe((data: any) => {
                        this.updateStore(data);
                        this.serviceRequest = data.serviceRequest;
                        this.setTemporaryData();
                        this.navigateToOverview(data);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Service request saved successfully');
                        this.setUnsavedChanges(false);
                        this.isSaving = false;
                    }, err => {
                        this._autoSaveService.errorEvent(
                            { name: 'Service Request Summary', documentId: 'service-request-summary', type: 'API' });
                        this.isSaving = false;
                    })
                );
            }
        } else {
            this._autoSaveService.errorEvent(
                { name: 'Service Request Summary', documentId: 'service-request-summary', type: 'VALIDATION' });
        }
    }

    private navigateToOverview(data: ServiceRequestRoot) {
        if (!this._router.url.includes('serviceRequestId')) {
            this._router.navigate(['fibi/service-request/overview'],
                { queryParams: { serviceRequestId: data.serviceRequest.serviceRequestId } });
        }
    }

    private updateStore(data: ServiceRequestRoot) {
        this._serviceRequestService.isServiceRequestDataChange = false;
        this._commonData.updateStoreData({
            serviceRequest: data.serviceRequest,
            serviceRequestStatusHistories: data.serviceRequestStatusHistories,
            availableRights: data.availableRights
        });
    }

    private validateSave(): boolean {
        this.errorMap.clear();
        if (!this.serviceRequest.priorityId || this.serviceRequest.priorityId === 'null') {
            this.errorMap.set('priority', '* Please select a priority');
        }
        if (!this.serviceRequest.subject) {
            this.errorMap.set('subject', '* Please enter subject');
        }
        if (!this.serviceRequest.serviceRequestModule) {
            this.errorMap.set('category', '* Please select a category');
        }
        if (!this.serviceRequest.serviceRequestType) {
            this.errorMap.set('type', '* Please select a type');
        }
        if (!this.serviceRequest.unitNumber) {
            this.errorMap.set('department', '* Please select a department');
        }
        return this.errorMap.size === 0;
    }

    private getPreviousValues(): void {
        if (this.serviceRequest.statusCode === 1) {
            return;
        }
        this.serviceRequestHistory = new ServiceRequestHistory();
        this.serviceRequestHistory.serviceRequestId = this.serviceRequest.serviceRequestId;
        if (this.serviceRequest.typeCode !== this.temporaryServiceObject.typeCode) {
            this.getChangedFields({ 'typeCode': 'previousTypeCode' });
        }
        if (this.serviceRequest.moduleCode !== this.temporaryServiceObject.moduleCode) {
            this.getChangedFields({ 'moduleCode': 'previousModuleCode' });
        }
        if (this.serviceRequest.subject !== this.temporaryServiceObject.subject) {
            this.getChangedFields({ 'subject': 'previousSubject' });
        }
        if (this.serviceRequest.description !== this.temporaryServiceObject.description) {
            this.getChangedFields({ 'description': 'previousDescription' });
        }
        if (this.serviceRequest.moduleItemKey !== this.temporaryServiceObject.moduleItemKey) {
            this.getChangedFields({
                'moduleItemKey': 'previousModuleItemKey',
                'moduleCode': 'previousModuleCode',
            });
        }
        if (this.serviceRequest.priorityId !== this.temporaryServiceObject.priorityId) {
            this.getChangedFields({ 'priorityId': 'previousPriorityId' });
        }
        if (this.serviceRequest.unitNumber !== this.temporaryServiceObject.unitNumber) {
            this.getChangedFields({ 'unitNumber': 'previousUnitNumber' });
        }
    }

    private getChangedFields(changedKeys): void {
        const KEYS = Object.keys(changedKeys);
        KEYS.forEach((key) => {
            this.serviceRequestHistory[key] = this.serviceRequest[key];
            this.serviceRequestHistory[changedKeys[key]] = this.temporaryServiceObject[key];
        });
    }

    setUnsavedChanges(flag: boolean) {
        this._serviceRequestService.isServiceRequestDataChange = flag;
        this._autoSaveService.setUnsavedChanges('Summary', 'service-request-summary', flag, true);
    }
}
