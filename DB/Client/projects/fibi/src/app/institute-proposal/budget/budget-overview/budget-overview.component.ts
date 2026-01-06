import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DATE_PICKER_FORMAT } from '../../../app-constants';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { deepCloneObject, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { InstituteProposalService } from '../../services/institute-proposal.service';
import { BudgetData, BudgetStatus, RateType } from '../ip-budget';
import { BudgetDataService } from '../services/budget-data.service';
import { BudgetService } from '../services/budget.service';

declare var $: any;

@Component({
    selector: 'app-budget-overview',
    templateUrl: './budget-overview.component.html',
    styleUrls: ['./budget-overview.component.css']
})
export class BudgetOverviewComponent implements OnInit, OnDestroy {

    @Input() isViewMode = true;
    $subscriptions: Subscription[] = [];
    isBudgetOverviewWidgetOpen = true;
    datePlaceHolder = DATE_PICKER_FORMAT;
    setFocusToElement = setFocusToElement;
    budgetDatesValidation = new Map();
    budgetData: BudgetData;
    budgetStatus: Array<BudgetStatus>;
    rateTypes: Array<RateType> = [];
    helpText: any;
    isBudgetStatusComplete = false;
    tempBudgetTemplateId = null;
    campusFlagList: any = [
        { value: 'N', description: 'ON' },
        { value: 'F', description: 'OFF' },
        { value: 'D', description: 'BOTH' }
    ];
    isSaving = false;
    costShareStatus: any;
    dataDependencies = ['instituteProposalBudgetHeader', 'isBudgetMerge', 'isCampusFlagEnabled', 'isFundingSupportDeclarationRequired',
        'isKeyPersonMerge', 'isReplaceAttachmentEnabled', 'isShowCostShareAndUnderrecovery', 'isShowInKind', 'costSharingTypes',
        'isShowModifiedDirectCost', 'isSpecialReviewMerge', 'overHeadRateTypeEnabled',
        'isShowBudgetOHRatePercentage', 'enableCostShareStatus', 'costShareTypeCode', 'rateTypes'];
    hasUnsavedChanges = false;

    constructor(private _budgetDataService: BudgetDataService, private _autoSaveService: AutoSaveService, private _budgetService: BudgetService,
        public _instituteService: InstituteProposalService) { }

    ngOnInit() {
        this.getBudgetFromStore();
        this.listenForDataUpdate();
        if (this.budgetData && this.budgetData.enableCostShareStatus && this.budgetData.costShareTypeCode) {
            this.getCostSharingTypeCode(this.budgetData.costShareTypeCode);
        }
        this.getOverHeadRateType();
        this.listenForGlobalSave();
    }

    listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => {
            this.saveOrUpdateRequestData();
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._autoSaveService.clearUnsavedChanges();
    }

    private listenForDataUpdate(): void {
        this.$subscriptions.push(
            this._budgetDataService.ipBudgetData.subscribe((dependencies: string[]) => {
                if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                    this.getBudgetFromStore();
                }
            })
        );
    }

    private getBudgetFromStore() {
        this.budgetData = this._budgetDataService.getBudgetData(this.dataDependencies);
    }

    getCostSharingTypeCode(code) {
        this.costShareStatus = this.budgetData.costSharingTypes.find(ele => ele.costSharingTypeCode == code).description;
    }


    getCostSharingType(code) {
        this.budgetData.instituteProposalBudgetHeader.costSharingType = this.budgetData.costSharingTypes.find(
            ele => ele.costSharingTypeCode === code);
    }

    setObjectOfDropdown() {
        this.budgetData.instituteProposalBudgetHeader.rateType = this.budgetData.rateTypes.find(
            element => element.rateClassCode === this.budgetData.instituteProposalBudgetHeader.rateClassCode);
        this.budgetData.instituteProposalBudgetHeader.underRecoveryRateType = this.budgetData.rateTypes.find(
            element => element.rateClassCode === this.budgetData.instituteProposalBudgetHeader.underRecoveryRateClassCode);
        this._budgetDataService.updateBudgetData({ instituteProposalBudgetHeader: this.budgetData.instituteProposalBudgetHeader });
    }

    setUnsavedChanges(flag: boolean) {
        this._instituteService.isInstituteProposalDataChange = flag;
        this._budgetDataService.isBudgetOverviewChanged = flag;
        this.hasUnsavedChanges = flag;
        this._autoSaveService.setUnsavedChanges('Budget Summary', 'proposal-budget-overview', flag, true);
    }

    getOverHeadRateType() {
      this.budgetData.instituteProposalBudgetHeader.rateType = this.budgetData.rateTypes.find(rate => rate.rateClassCode === this.budgetData.instituteProposalBudgetHeader.rateClassCode);
    }

    getUnderRecoveryRateType() {
        this.budgetData.instituteProposalBudgetHeader.underRecoveryRateType = this.budgetData.rateTypes.find(rate => rate.rateClassCode === this.budgetData.instituteProposalBudgetHeader.underRecoveryRateType.rateClassCode);
        this.budgetData.instituteProposalBudgetHeader.underRecoveryRateClassCode = this.budgetData.instituteProposalBudgetHeader.underRecoveryRateType.rateClassCode;
        this.budgetData.instituteProposalBudgetHeader.underRecoveryRateTypeCode = this.budgetData.instituteProposalBudgetHeader.underRecoveryRateType.rateTypeCode;
    }

    saveOrUpdateRequestData() {
        const HEADER_DATA = deepCloneObject(this.budgetData.instituteProposalBudgetHeader);
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(HEADER_DATA);
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._budgetService.saveOrUpdateIPBudgetData({
                instituteProposalBudgetHeader: HEADER_DATA
            }).subscribe((data: any) => {
                this._budgetDataService.updateBudgetData({ instituteProposalBudgetHeader: data.instituteProposalBudgetHeader });
                this.isSaving = false;
                this.setUnsavedChanges(false);
            }, err => {
                this.isSaving = false;
            }));
        }
    }

    setBudgetData() {
        this.getCostSharingType(this.budgetData.instituteProposalBudgetHeader.costSharingTypeCode);
        this._budgetDataService.updateBudgetData(
            { instituteProposalBudgetHeader: this.budgetData.instituteProposalBudgetHeader});
    }

    getCampusFlagDescription(code) {
        return this.campusFlagList.find(item => item.value === code).description;
    }
}
