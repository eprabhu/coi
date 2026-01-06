import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { FormBuilderCreateService } from '../../form-builder-create.service';
import {FetchModuleCode, FormIntegration, GetAllFormUsage, ModuleList, IntegrtionResponse, SubModules,
        UpdateFormUsage, SaveFormUsage} from '../../form-builder-create-interface';
import {HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../../app-constants';
import {CommonService} from '../../../../common/services/common.service';

declare const $: any;

@Component({
    selector: 'app-form-integration',
    templateUrl: './form-integration.component.html',
    styleUrls: ['./form-integration.component.scss']
})
export class FormIntegrationComponent implements OnInit, OnDestroy {
    formBuilderId: string;
    formIntegtion = new FormIntegration();
    $subscriptions: Subscription[] = [];
    moduleList: ModuleList[];
    subModuleList: SubModules[];
    formBuilderNumber: string;
    formUsage: GetAllFormUsage[];
    formUsageList = [];
    editStatus = '';
    deleteIndex: number;
    editIndex: number;
    formValidation = new Map();

    constructor(private _route: ActivatedRoute, public formBuilderService: FormBuilderCreateService,
                private _commonService: CommonService) { }

    ngOnInit() {
        this.$subscriptions.push(
        this._route.queryParamMap.subscribe(queryParams => {
            this.formBuilderId = queryParams.get('formBuilderId');
            this.formBuilderNumber = queryParams.get('formBuilderNumber');
        }));
        this.fetchModuleCode();
    }

    fetchModuleCode(): void {
        this.$subscriptions.push(
        this.formBuilderService.getModuleList().subscribe((data: FetchModuleCode) => {
            this.moduleList = this.mapModules(data.moduleList);
            this.getAllFormUsage();
        }, error => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching module list failed.Please try again');
        }));
    }

    mapModules(list: Array<any>): Array<any> {
        const MODULES = list.filter(el => !el.SUB_MODULE_CODE);
        MODULES.forEach(m => m.subModules = this.findSubModules(list, m.MODULE_CODE));
        return MODULES;
    }

    findSubModules(list, code): Array<any> {
        const SUB_MODULES = list.filter(l => l.MODULE_CODE === code && l.SUB_MODULE_CODE);
        return SUB_MODULES;
    }

    findSubModuleList(modulecode = this.formIntegtion.formModuleCode): void {
        this.formIntegtion.formSubSectionCode = null;
        const LIST: any = this.moduleList.find(M => M.MODULE_CODE == modulecode);
        this.subModuleList = LIST && LIST.subModules ? this.sortSubModules(LIST.subModules) : [];
    }

    sortSubModules(subModuleList: any): any[] {
        subModuleList.sort((a, b) => {
            return a.DESCRIPTION.toLowerCase() > b.DESCRIPTION.toLowerCase() ? 1 :
                a.DESCRIPTION.toLowerCase() < b.DESCRIPTION.toLowerCase() ? -1 : 0;
        });
        return subModuleList;
    }

    saveIntegration(): void {
        if (this.isModuleCodeValid('add')) {
            $('#FB-add-Integration-Modal').modal('hide');
            let moduleName;
            let subSectionName;
            this.$subscriptions.push(
                this.formBuilderService.saveFormUsage(this.prepareFormUsageObject()).subscribe((data: IntegrtionResponse) => {
                    moduleName = this.moduleList.find((x) => x.MODULE_CODE == data.moduleCode);
                    subSectionName = moduleName.subModules.find((subSection) =>
                        subSection.SUB_MODULE_CODE == data.subModuleCode);
                    this.formUsageList.push(
                        {
                            formUsageId: data.formUsageId,
                            formOrderNumber: data.formOrderNumber,
                            moduleName: moduleName.DESCRIPTION,
                            formLabel: data?.description,
                            moduleCode: moduleName?.MODULE_CODE,
                            subSectionCode: subSectionName?.SUB_MODULE_CODE || 0,
                        }
                    );
                    this.resetUsage();
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Integration added successfully');
                }, error => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding integration failed.Please try again');
                    })
            );
        }

    }

    prepareFormUsageObject(): SaveFormUsage {
        const FORM_USAGE_OBJECT = new SaveFormUsage();
        FORM_USAGE_OBJECT.formBuilderNumber = this.formBuilderNumber;
        FORM_USAGE_OBJECT.formBuilderId = this.formBuilderId;
        FORM_USAGE_OBJECT.moduleCode = this.formIntegtion.formModuleCode;
        FORM_USAGE_OBJECT.subModuleCode = this.formIntegtion.formSubSectionCode || 0;
        FORM_USAGE_OBJECT.businessRuleId = null;
        FORM_USAGE_OBJECT.description = this.formIntegtion.formLabel;
        FORM_USAGE_OBJECT.isActive = 'Y';
        return FORM_USAGE_OBJECT;
    }

    getAllFormUsage(): void {
        this.$subscriptions.push(
            this.formBuilderService.getAllFormUsage(this.formBuilderId).subscribe((data: GetAllFormUsage[]) => {
                if (data) {
                    let moduleName;
                    let subSectionName;
                    this.formUsage = data;
                    this.formUsage.forEach((ele) => {
                        moduleName = this.moduleList.find((x) => x?.MODULE_CODE == ele?.moduleCode)
                        subSectionName = moduleName?.subModules.find((subSection) =>
                            subSection.SUB_MODULE_CODE == ele.subModuleCode)
                        this.formUsageList.push(
                            {
                                formUsageId: ele.formUsageId,
                                moduleName: moduleName?.DESCRIPTION,
                                subSectionName: subSectionName?.DESCRIPTION,
                                moduleCode: moduleName?.MODULE_CODE,
                                formOrderNumber: ele.formOrderNumber,
                                subSectionCode: subSectionName?.SUB_MODULE_CODE || 0,
                                formLabel: ele?.description
                            }
                        );
                    });
                }
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching usage failed.Please try again');
            })
        );
    }


    editUsage(item, status: string, index: number): void {
        if (status === 'E') {
            this.editIndex = index;
            this.editStatus = 'E';
            this.formIntegtion.formModuleCode = item.moduleCode;
            this.findSubModuleList();
            this.formIntegtion.formSubSectionCode = item.subSectionCode;
            this.formIntegtion.formUsageId = item.formUsageId;
            this.formIntegtion.formOrderNumber = item.formOrderNumber;
            this.formIntegtion.formLabel = item.formLabel;
        }
    }

    prepareFormUsageObjectForUpdate(): UpdateFormUsage {
        const FORM_USAGE_OBJECT = new UpdateFormUsage();
        FORM_USAGE_OBJECT.formUsageId = this.formIntegtion.formUsageId;
        FORM_USAGE_OBJECT.formBuilderNumber = this.formBuilderNumber;
        FORM_USAGE_OBJECT.formBuilderId = this.formBuilderId;
        FORM_USAGE_OBJECT.moduleCode = this.formIntegtion.formModuleCode;
        FORM_USAGE_OBJECT.subModuleCode = this.formIntegtion.formSubSectionCode || 0;
        FORM_USAGE_OBJECT.businessRuleId = null;
        FORM_USAGE_OBJECT.description = this.formIntegtion.formLabel;
        FORM_USAGE_OBJECT.isActive = 'Y';
        FORM_USAGE_OBJECT.formOrderNumber = this.formIntegtion.formOrderNumber;
        return FORM_USAGE_OBJECT;
    }

    // Description should be given from back-end.

    updateFormUsage(): void {
        if (this.isModuleCodeValid('update')) {
            $('#FB-add-Integration-Modal').modal('hide');
            let moduleName;
            let subSectionName;
            this.$subscriptions.push(
                this.formBuilderService.updateFormUsage(this.prepareFormUsageObjectForUpdate()).subscribe((data: IntegrtionResponse) => {
                    this.formUsageList[this.editIndex].moduleCode = Number(data.moduleCode);
                    this.formUsageList[this.editIndex].subSectionCode = Number(data.subModuleCode);
                    this.formUsageList[this.editIndex].formUsageId = data.formUsageId;
                    this.formUsageList[this.editIndex].formLabel = data.description;
                    moduleName = this.moduleList.find((x) => x.MODULE_CODE == data.moduleCode);
                    subSectionName = moduleName.subModules.find((subSection) =>
                        subSection.SUB_MODULE_CODE == data.subModuleCode);
                    this.formUsageList[this.editIndex].moduleName = moduleName.DESCRIPTION;
                    this.formUsageList[this.editIndex].subSectionName = subSectionName?.DESCRIPTION;
                    this.resetUsage();
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Integration updated successfully');
                }, error => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating integration failed.Please try again');
                })
            );
        }
    }

    resetUsage(): void {
        this.formValidation.clear();
        this.editStatus = '';
        this.formIntegtion = new FormIntegration();
    }

    deleteUsage(): void {
        this.$subscriptions.push(
        this.formBuilderService.deleteusage(this.formIntegtion.formUsageId).subscribe((data) => {
            this.formUsageList.splice(this.deleteIndex, 1);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Integration deleted successfully.');
        }, error => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting integration failed.Please try again');
        }));
    }

    isModuleCodeValid(mode: string): boolean {
        this.formValidation.clear();
        if (!this.formIntegtion.formModuleCode) {
            this.formValidation.set('moduleCodeValidation', true);
        } else {
            const IS_DUPLICATE = mode === 'add'
                ? this.formUsageList?.some(form => form?.moduleCode === this.formIntegtion.formModuleCode)
                : mode === 'update'
                    ? this.formUsageList?.some(
                        (form, index) => index !== this.editIndex && form?.moduleCode === this.formIntegtion.formModuleCode
                    )
                    : false;
            if (IS_DUPLICATE) {
                this.formValidation.set('duplicateValidation', true);
            }
        }
        if (!this.formIntegtion.formLabel) {
            this.formValidation.set('formLabelValidation', true);
        }
        return this.formValidation.size <= 0;
    }

    openIntegrationModal(): void {
        $('#FB-add-Integration-Modal').modal('show');

    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    closeBtn(id: string) {
        $(id).modal('hide');

    }

}
