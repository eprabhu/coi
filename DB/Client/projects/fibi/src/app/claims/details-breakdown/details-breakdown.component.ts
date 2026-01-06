import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { CommonDataService } from '../services/common-data.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DetailsBreakdownService } from './details-breakdown.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import {
    convertToValidAmount,
    inputRestrictionForAmountField,
    setFocusToElement,
    validatePercentage
} from '../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';

declare var $: any;

@Component({
    selector: 'app-details-breakdown',
    templateUrl: './details-breakdown.component.html',
    styleUrls: ['./details-breakdown.component.css'],
    providers: [DetailsBreakdownService]
})
export class DetailsBreakdownComponent implements OnInit, OnDestroy {

    claimDetails: any = {};
    claimBreakDownDetails: any = [];
    isEditMode = false;
    isSaving = false;
    previouslyExcluded: any = [];
    $subscriptions: Subscription[] = [];
    isIndirectCostEdit = false;
    mandatoryList = new Map();
    indirectCostWarning = new Map();
    tempTransaction: any = {};
    previousTransaction: any = {};
    setFocusToElement = setFocusToElement;
    tempIndirectCost: any;
    isCategoryViewData: any = [];
    selectedDetailId: any;
    selectedCommentDetailId: any;
    constructor(public _commonData: CommonDataService,
        private _detailsBreakdownService: DetailsBreakdownService, public _commonService: CommonService) {
    }

    ngOnInit() {
        this.getSharedClaimData();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    getSharedClaimData() {
        this.$subscriptions.push(
            this._commonData.$claimData.subscribe((data: any) => {
                if (data && data.claim) {
                    this.claimDetails = data.claim;
                    this.checkEditMode(this.claimDetails.claimStatus.claimStatusCode);
                    this.getDetailsBreakdownData();
                }
            })
        );
    }

    getDetailsBreakdownData() {
        this._commonService.isManualLoaderOn = true;
        this.$subscriptions.push(
            this._detailsBreakdownService
                .loadClaimDetailBreakDown({ 'claimId': this.claimDetails.claimId,
                'leadUnitNumber': this.claimDetails.award.leadUnitNumber,
                'awardNumber': this.claimDetails.award.awardNumber})
                .subscribe((res: any) => {
                if (res) {
                    this.claimBreakDownDetails = this.colSpanAddedResponse(res);
                    this.setEditFlag();
                    this._commonService.isManualLoaderOn = false;
                }
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching breakdown details failed. Please try again.');
                this._commonService.isManualLoaderOn = false;
            })
        );

    }

    setEditFlag() {
        this.selectedCommentDetailId = null;
        this.selectedDetailId = null;
    }

    checkEditMode(claimStatusCode: string) {
        this.isEditMode = ['1', '2', '7'].includes(claimStatusCode) && this._commonData.isClaimModifiable();
    }

    saveIndirectCost(adjustedIndirectCost: number) {
        if (this.indirectCostWarning.size === 0) {
            const requestObject = {claimId: this.claimDetails.claimId, adjustedIndirectCost};
            this.$subscriptions.push(this._detailsBreakdownService
                .updateAdjustedIndirectCost(requestObject).subscribe((res: any) => {
                if (res) {
                    this.isIndirectCostEdit = false;
                    this.updateIndirectCost(adjustedIndirectCost);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Indirect cost updated successfully');
                }
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Indirect cost  failed. Please try again.')));
        }
    }

    updateIndirectCost(adjustedIndirectCost: number = 0) {
        this.claimBreakDownDetails.claimSummaryCalculations.totalExpenditure.expenditureAdjTotalAmount =
            this.claimBreakDownDetails.claimSummaryCalculations.subTotalDirectCost.subTotalDirectAdjTotalAmount
             + Number(adjustedIndirectCost);
    }

    toggleExcludeFlag(isExclude: boolean, transaction: any): void {
        if (!this.isSaving) {
            transaction.isExcludedFlag = isExclude;
            this.updateClaimSummaryExcludeFlag(transaction);
        }
    }

    updateClaimSummaryExcludeFlag(transaction, excludeIndex = null, categoryIndex = null) {
        const claimSummaryDetail = {
            'claimDetailsId': transaction.claimDetailsId,
            'isExcludedFlag': transaction.isExcludedFlag,
            'claimId': transaction.claimId,
            'claimSummaryId': transaction.claimSummaryId,
            'budgetCategoryCode': transaction.budgetCategoryCode,
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'prevExcludedSummaryDetId': transaction.prevExcludedSummaryDetId
        };
        this.isSaving = true;
        this._commonService.isShowOverlay = true;
        this.$subscriptions.push(
            this._detailsBreakdownService.updateClaimSummaryExcludeFlag(
                {
                    'claimSummaryDetail': claimSummaryDetail, 'claimId': this.claimDetails.claimId,
                    'leadUnitNumber': this.claimDetails.award.leadUnitNumber, 'awardNumber': this.claimDetails.award.awardNumber
                })
                .subscribe((res: any) => {
                    if (res) {
                        if (res.claimPreviouslyExcluded) {
                            $('#alertClaimModal').modal('show');
                            transaction.isExcludedFlag = transaction.isExcludedFlag ? false : true;
                        } else {
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, this.getToastMessage(transaction.isExcludedFlag));
                            if (Number.isInteger(excludeIndex) && Number.isInteger(categoryIndex)) {
                                this.previouslyExcluded[categoryIndex].transactions.splice(excludeIndex, 0);
                            }
                            this.claimBreakDownDetails = this.colSpanAddedResponse(res);
                            this.setEditFlag();
                        }
                    }
                }, err => {
                    this._commonService.isShowOverlay = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating transaction failed. Please try again.')
                },
                () => {
                        this.isSaving = false;
                        this._commonService.isShowOverlay = false;
                    }
                ));
    }

    getToastMessage(isExcludedFlag) {
        return 'Transaction ' + (isExcludedFlag ? 'excluded' : 'included') + ' successfully';
    }

    updateDetailBreakDown(transaction) {
        this.checkAdjustedTotalValidation(transaction);
        const claimSummaryDetail = {
            'claimId': this.claimDetails.claimId,
            'claimDetailsId': transaction.claimDetailsId,
            'levelOfSupportPercentage': transaction.levelOfSupportPercentage,
            'totalAmount': parseFloat(transaction.totalAmount),
            'adjustedTotal': convertToValidAmount(transaction.adjustedTotal),
            'description': transaction.description,
            'deliveryDate': parseDateWithoutTimestamp(transaction.deliveryDate),
            'expenseCaped': convertToValidAmount(transaction.expenseCaped),
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'qualifyingCost': parseFloat(transaction.qualifyingCost),
            'budgetCategoryCode': transaction.budgetCategoryCode,
            'unitPrice': parseFloat(transaction.unitPrice),
            'descriptionOfEquipment': transaction.descriptionOfEquipment
        };
        if (this.mandatoryList.size === 0) {
            this.$subscriptions.push(
                this._detailsBreakdownService
                    .saveOrUpdateClaimBreakDown(
                        {
                            'claimSummaryDetail': claimSummaryDetail,
                            'leadUnitNumber': this.claimDetails.award.leadUnitNumber,
                            'awardNumber': this.claimDetails.award.awardNumber
                        })
                    .subscribe((res: any) => {
                        if (res) {
                            this.claimBreakDownDetails = this.colSpanAddedResponse(res);
                            this.tempTransaction = {};
                            this.setEditFlag();
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Transaction details updated successfully.');
                        }
                    }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating transaction failed. Please try again.'))
            );
        }
    }

    checkAdjustedTotalValidation(transaction) {
        this.mandatoryList.delete('amount');
        if (parseFloat(transaction.adjustedTotal) > parseFloat(transaction.totalAmount)) {
            this.mandatoryList.set('amount', 'Adjusted total should be equal or lesser than total amount');
        }
    }

    editTransaction(transaction, categoryIndex, groupedIndex, editIndex) {
        const isPreviousEditMode = Object.keys(this.tempTransaction).length;
        if (isPreviousEditMode) {
            this.claimBreakDownDetails
                .claimSummaryDetails[this.previousTransaction.categoryIndex]
                .groupedTransactions[this.previousTransaction.groupedIndex]
                .transactions[this.previousTransaction.editIndex] = JSON.parse(JSON.stringify(this.tempTransaction));
        }
        this.previousTransaction = {categoryIndex, groupedIndex, editIndex};
        this.tempTransaction = Object.assign({}, transaction);
        this.setEditFlag();
        this.mandatoryList.clear();
        this.selectedDetailId = transaction.claimDetailsId;
    }

    /**limitKeypress - limit the input field b/w 0 and 100 with 2 decimal points
     * @param {} value
     */
    limitKeypress(value, key, list) {
        list.delete(key);
        if (validatePercentage(value)) {
            list.set(key, validatePercentage(value));
        }
    }

    /**
     * fetch and populates previously excluded entry of the given budget category. shows or hide the info according to checkbox value.
     * @param index
     * @param category
     */
    togglePreviouslyExcluded(index: number, category: any) {
        category.showExcluded = !category.showExcluded;
        this.previouslyExcluded[index] = { transactions: [] };
        if (category.showExcluded) {
            const requestObject = {
                claimId: this.claimDetails.claimId, awardNumber: category.awardNumber,
                internalOrderCode: category.internalOrderCode
            };
            this.$subscriptions.push(
                this._detailsBreakdownService.getPrevExcludedClaimSummaryDetails(requestObject).subscribe((res: any) => {
                    if (res) {
                        this.previouslyExcluded[index]['transactions'] = res.prevClaimSummaryDetails;
                    }
                })
            );
        }
    }

    amountValidation(field, key) {
        field = convertToValidAmount(field);
        this.mandatoryList.delete(key);
        if (inputRestrictionForAmountField(field)) {
            this.mandatoryList.set(key, inputRestrictionForAmountField(field));
        }
    }

    indirectCostValidation(field, key) {
        field = convertToValidAmount(field);
        this.indirectCostWarning.delete(key);
        if (inputRestrictionForAmountField(field)) {
            this.indirectCostWarning.set(key, inputRestrictionForAmountField(field));
        }
    }

    commentAction(transaction) {
        this.setEditFlag();
        this.selectedCommentDetailId = transaction.claimDetailsId;

    }

    updateTotalAmount(transaction) {
        transaction.totalAmount = ((transaction.qualifyingCost * transaction.levelOfSupportPercentage) / 100).toFixed(2);
    }

    /**
     * returns modified response with new claimSummaryDetails containing colSpan data
     * @param response
     */
    colSpanAddedResponse(response: any) {
        return {...response, claimSummaryDetails: this.setCategoryColSpan(response.claimSummaryDetails)};
    }

    /**
     * adds 3 colSpan variables for comment, quarter and full colSpan calculated only once for every summary element rather than
     * each transaction within summary.
     * @param summaryDetails
     */
    setCategoryColSpan(summaryDetails) {
        return summaryDetails.map((summary) => ({
            ...summary,
            colspanComment: this.calculateColSpan(summary.budgetCategory.code, 'comment'),
            colspanQuarter: this.calculateColSpan(summary.budgetCategory.code, 'quarter'),
            colspanFull: this.calculateColSpan(summary.budgetCategory.code, 'full')
        }));
    }

    /**
     * Calculates colSpan dynamically.
     * default colSpan for fullWidth columns are 14.
     * default colSpan for editable mode is 1 but not for 'quater'(has its own td).
     * @param budgetCategoryCode
     * @param type
     */
    calculateColSpan(budgetCategoryCode: string, type = '') {
        const defaultColumns = type === 'comment' ? 12 : type === 'quarter' ? 10 : 13;
        const editColumn = this.isEditMode ? type === 'quarter' ? 0 : 1 : 0;
        const dynamicColumns = (budgetCategoryCode === 'OOE' || budgetCategoryCode === 'OST') ? 10 :
        budgetCategoryCode === 'EOM' ? 2 : (budgetCategoryCode === 'MAC' || budgetCategoryCode === 'EQT') ? 3 :
        budgetCategoryCode === 'RSS' ? 1 : 0;
        return (defaultColumns + dynamicColumns + editColumn);
    }
}
