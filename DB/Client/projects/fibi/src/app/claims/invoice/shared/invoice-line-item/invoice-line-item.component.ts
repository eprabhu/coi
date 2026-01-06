import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {ClaimOutputGstTaxCode, GlAccountCode, InvoiceLineItem, InvoiceLineItemConfig} from '../../invoice.interface';
import {CommonService} from '../../../../common/services/common.service';
import {InvoiceLineItemService} from './invoice-line-item.service';
import {Subscription} from 'rxjs';
import {subscriptionHandler} from '../../../../common/utilities/subscription-handler';
import {HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../../app-constants';
import {convertToValidAmount, inputRestrictionForAmountField} from '../../../../common/utilities/custom-utilities';

declare var $: any;

@Component({
    selector: 'app-invoice-line-item',
    templateUrl: './invoice-line-item.component.html',
    styleUrls: ['./invoice-line-item.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [InvoiceLineItemService]
})
export class InvoiceLineItemComponent implements OnDestroy, OnChanges {

    @Input() config: InvoiceLineItemConfig = {
        baCode: '',
        claimId: 0,
        claimOutputGstTaxCode: undefined,
        invoiceId: 0,
        invoiceLineItems: [],
        isEditMode: false,
        headerPostingKey: '',
        lineItemPostingKey: '',
        lookups: undefined,
        isNestedMode: false,
        grtWbs: '',
        campus: ''
    };

    modalInvoiceLineItem: InvoiceLineItem = {
        claimGlAccount: null,
        claimAmount: null,
        description: undefined,
        glAccountCode: null,
        grtWbs: undefined,
        subContractAmount: null,
        taxCode: null
    };
    lineItemValidationMap: Map<string, string> = new Map();
    selectedInvoiceIndex: number;
    isDescriptionShown: boolean[] = [];
    $subscriptions: Subscription[] = [];
    totalAmounts = {claimAmount: 0, subContractAmount: 0, finalClaimAmount: 0};
    isShowAllDescription = false;

    constructor(public _commonService: CommonService,
                private _invoiceLineItemService: InvoiceLineItemService,
                public cd: ChangeDetectorRef) {
    }

    ngOnChanges(): void {
        this.showDataChangeInView();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    saveLineItem(): void {
        if (this.isFormValid()) {
            this.$subscriptions.push(this._invoiceLineItemService
                .saveOrUpdateClaimInvoiceDetail({claimInvoiceDetail: this.modalInvoiceLineItem})
                .subscribe((res: any) => {
                    if (res && res.claimInvoiceDetail) {
                        if (this.isIndex(this.selectedInvoiceIndex)) { // edit mode
                            this.updateLineItemEntry(res);
                            this.showSuccessMessage('Line Item updated successfully.');
                        } else { // add mode
                            this.addLineItemEntry(res);
                            this.showSuccessMessage('Line Item added successfully.');
                        }
                        $('#line-item-modal').modal('hide');
                        this.resetModal();
                        this.showDataChangeInView();
                    }
                }, _err => this.showErrorMessage('Adding line Item failed. Please try again.')));
        }
    }

    editLineItem(lineItem: InvoiceLineItem, index: number): void {
        this.selectedInvoiceIndex = index;
        this.modalInvoiceLineItem = JSON.parse(JSON.stringify(lineItem));
    }

    deleteLineItemPrep(index: number): void {
        this.selectedInvoiceIndex = index;
    }

    confirmDeleteLineItem(): void {
        if (this.isIndex(this.selectedInvoiceIndex)) {
            this.$subscriptions.push(this._invoiceLineItemService
                .deleteClaimInvoiceDetail(this.config.invoiceLineItems[this.selectedInvoiceIndex].invoiceDetailId)
                .subscribe((res: any) => {
                    if (res.status) {
                        this.config.invoiceLineItems.splice(this.selectedInvoiceIndex, 1);
                        this.selectedInvoiceIndex = null;
                        this.showSuccessMessage('Line Item deleted successfully.');
                        this.showDataChangeInView();
                    }
                }, _err => this.showErrorMessage('Deleting Line Item failed. Please try again.')));
        }
    }

    cancelLineItem(): void {
        if (this.isIndex(this.selectedInvoiceIndex)) {
            this.selectedInvoiceIndex = null;
        }
        this.resetModal();
    }

    showDescription(index: number): void {
        if (this.isDescriptionShown[index]) {
            this.isDescriptionShown[index] = false;
            this.isShowAllDescription = !this.isDescriptionShown.every((item) => item === false);
        } else {
            this.isDescriptionShown[index] = true;
            this.isShowAllDescription = true;
        }
    }

    isIndex(index: number): boolean {
        return Number.isInteger(index);
    }

    getTotal(invoiceLineItems: InvoiceLineItem[], fieldName): number {
        if (invoiceLineItems.length === 0) {
            return 0;
        }
        return invoiceLineItems.reduce((acc, cur) => acc + cur[fieldName], 0);
    }

    showDataChangeInView(): void {
        this.calculateTotal();
        this.cd.markForCheck();
    }

    calculateTotal(): void {
        this.totalAmounts.claimAmount = this.getTotal(this.config.invoiceLineItems, 'claimAmount');
        this.totalAmounts.subContractAmount = this.getTotal(this.config.invoiceLineItems, 'subContractAmount');
        this.totalAmounts.finalClaimAmount = this.totalAmounts.claimAmount + this.totalAmounts.subContractAmount;
    }

    amountValidation(fieldValue: number, fieldName: string): void {
        fieldValue = convertToValidAmount(fieldValue);
        this.lineItemValidationMap.delete(fieldName);
        if (inputRestrictionForAmountField(fieldValue)) {
            this.lineItemValidationMap.set(fieldName, 'true');
        }
    }

    toggleShowAllDescription(): void {
        this.isShowAllDescription = !this.isShowAllDescription;
        this.isDescriptionShown = (this.isShowAllDescription) ?
            new Array((this.config.invoiceLineItems.length)).fill(true) :  [];
    }

    private updateClaimLookUpDescription(res: any): void {
        res.claimInvoiceDetail.claimGlAccount = this.getGlAccount(this.modalInvoiceLineItem.glAccountCode);
        res.claimInvoiceDetail.claimOutputGstTaxCode = this.getTaxCode(this.modalInvoiceLineItem.taxCode);
    }

    private addLineItemEntry(res: any): void {
        this.updateClaimLookUpDescription(res);
        this.config.invoiceLineItems.push(res.claimInvoiceDetail);
    }

    private updateLineItemEntry(res: any): void {
        this.updateClaimLookUpDescription(res);
        this.config.invoiceLineItems[this.selectedInvoiceIndex] = res.claimInvoiceDetail;
        this.selectedInvoiceIndex = null;
    }

    private getGlAccount(glAccountCode: string): GlAccountCode {
        if (!glAccountCode ||
            !this.config.lookups || !this.config.lookups.glAccountCode || this.config.lookups.glAccountCode.length === 0) {
            return {
                isControlledGl: false,
                glAccountCode: '',
                description: '',
                isActive: false,
                updateTimeStamp: '',
                updateUser: ''
            };
        }
        return this.config.lookups.glAccountCode.find(gl => gl.glAccountCode === glAccountCode);
    }

    private getTaxCode(taxCode: string): ClaimOutputGstTaxCode {
        if (!taxCode || !this.config.lookups || !this.config.lookups.taxCodes || this.config.lookups.taxCodes.length === 0) {
            return {
                outputGstCategory: '',
                taxCode: '',
                taxDescription: '',
                isActive: false,
                updateTimeStamp: null,
                updateUser: '',
            };
        }
        return this.config.lookups.taxCodes.find(gl => gl.taxCode === taxCode);
    }

    private resetModalInvoiceLineItem(): void {
        this.modalInvoiceLineItem = {
            claimGlAccount: undefined,
            invoiceDetailId: null,
            claimAmount: null,
            description: null,
            glAccountCode: null,
            grtWbs: (this.config.grtWbs ? this.config.grtWbs + 'GRT01' : ''),
            subContractAmount: null,
            claimId: this.config.claimId,
            baCode: '',
            claimOutputGstTaxCode: this.config.claimOutputGstTaxCode,
            invoiceId: this.config.invoiceId,
            lineItemPostingKey: this.config.lineItemPostingKey,
            taxCode: (this.config.claimOutputGstTaxCode && this.config.claimOutputGstTaxCode.taxCode) ?
                this.config.claimOutputGstTaxCode.taxCode : null,
            campus: this.config.campus
        };
    }

    private resetModal(): void {
        this.resetModalInvoiceLineItem();
        this.lineItemValidationMap.clear();
    }

    private isFormValid() {
        let isValid = true;
        this.lineItemValidationMap.clear();
        isValid = this.areAllMandatoryFieldsFilled(isValid);
        isValid = this.checkIfValidLength('grtWbs', 20, isValid);
        return isValid;
    }

    private areAllMandatoryFieldsFilled(isValid: boolean) {
        ['grtWbs', 'glAccountCode', 'taxCode', 'claimAmount']
            .forEach((field: string) => {
                isValid = this.checkIfFieldNotEmpty(field, isValid);
            });
        return isValid;
    }

    private checkIfValidLength(field: string, length: number, isValid: boolean): boolean {
        if (this.modalInvoiceLineItem[field].length < length) {
            isValid = false;
            this.lineItemValidationMap.set(field, field);
        }
        return isValid;
    }

    private checkIfFieldNotEmpty(field: string, isValid: boolean): boolean {
        if (['', null].includes(this.modalInvoiceLineItem[field])) {
            isValid = false;
            this.lineItemValidationMap.set(field, field);
        }
        return isValid;
    }

    private showErrorMessage(message: string): void {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }

    private showSuccessMessage(message: string): void {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, message);
    }

}
