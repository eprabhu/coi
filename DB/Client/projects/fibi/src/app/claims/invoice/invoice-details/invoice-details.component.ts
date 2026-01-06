import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Subscription} from 'rxjs';
import {DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../app-constants';
import {isValidEmailAddress, setFocusToElement} from '../../../common/utilities/custom-utilities';
import {CommonDataService} from '../../services/common-data.service';
import {CommonService} from '../../../common/services/common.service';
import {ActivatedRoute, Router} from '@angular/router';
import {InvoiceService} from '../invoice.service';
import {
    BaCode,
    ClaimInvoiceDetail,
    ClaimOutputGstTaxCode,
    DocumentType,
    GlAccountCode,
    InvoiceLineItem,
    InvoiceLineItemConfig,
    InvoiceLookUp
} from '../invoice.interface';
import {subscriptionHandler} from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-invoice-details',
    templateUrl: './invoice-details.component.html',
    styleUrls: ['./invoice-details.component.css']
})
export class InvoiceDetailsComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    claimDetails: any = {};
    claimOutputGstTaxCode: ClaimOutputGstTaxCode = {
        isActive: false,
        outputGstCategory: '',
        taxCode: null,
        taxDescription: '',
        updateTimeStamp: 0,
        updateUser: ''
    };
    lookupData: InvoiceLookUp = {taxCodes: [], baCodeMetadata: undefined, glAccountCode: []};
    isEditMode = false;
    isInvoiceWidgetOpen = true;
    claimInvoiceDetails: ClaimInvoiceDetail = {
        claimGlAccount: undefined,
        glAccountCode: null, grantCode: '', profitCentre: '',
        assignmentField: '',
        invoiceDetailId: 0,
        baCode: '',
        actionIndicator: undefined,
        claimId: 0,
        claimInvoiceDetails: [],
        claimNumber: '',
        companyCode: '',
        contactTelephoneNo: '',
        currencyCode: '',
        customerEmailAddress: '',
        description: '',
        documentHeaderText: '',
        documentTypeCode: '',
        headerPostingKey: '',
        invoiceId: 0,
        particulars1: '',
        particulars2: '',
        particulars3: '',
        particulars4: '',
        requesterEmailAddress: '',
        sequenceNumber: 0,
        campus: '',
        customerNumber: null,

    };
    setFocusToElement = setFocusToElement;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    invoiceValidationMap = new Map();
    invoiceWarningMap = new Map();
    documentDate = null;
    baseDate = null;
    documentType: DocumentType = {
        baCode: '',
        documentTypeCode: null,
        documentTypeDesc: '',
        headerPostingKey: '',
        isActive: false,
        lineItemPostingKey: '',
        reversalDocumentTypeCode: '',
        reversalDocumentTypeDesc: '',
        reversalHeaderPostingKey: '',
        reversalLineItemPostingKey: '',
        updateTimeStamp: 0,
        updateUser: ''
    };
    glAccountCode: GlAccountCode = {
        description: '',
        glAccountCode: null,
        isActive: false,
        isControlledGl: false,
        updateTimeStamp: undefined,
        updateUser: ''
    };
    documentTypeLookup: BaCode[] = [];
    invoiceLineItems: InvoiceLineItem[] = [];
    invoiceLineItemConfig: InvoiceLineItemConfig = {
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

    constructor(public _commonData: CommonDataService,
                public _commonService: CommonService,
                private router: Router,
                private route: ActivatedRoute,
                private _invoiceService: InvoiceService) {
    }

    ngOnInit() {
        this.getClaimDetails();
        this.saveButtonClickListener();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    saveButtonClickListener(): void {
        this.$subscriptions.push(
            this._commonData.$saveEndorsement.subscribe((clicked: boolean) => {
                if (clicked) {
                    this.saveInvoiceHeaderDetails();
                    this.openFormIfClosed();
                }
            })
        );
    }

    getClaimDetails() {
        this.$subscriptions.push(this._commonData.$claimData.subscribe((data: any) => {
            if (data && data.claim) {
                this.claimDetails = JSON.parse(JSON.stringify(data.claim));
                this.setEditMode(this.claimDetails.claimStatus.claimStatusCode, data.availableRights);
                this.claimInvoiceDetails.claimId = this.claimDetails.claimId;
                this.getClaimInvoice();
                this.setLineItemConfiguration();
            }
        }));
    }

    /**
     * 1 = Pending
     * 2 = Revision Requested
     * 7 = Revision Requested by Funding Agency
     * @param claimStatusCode
     * @param availableRights
     */
    setEditMode(claimStatusCode: string, availableRights: string[] = []) {
        this.isEditMode = ['1', '2', '7'].includes(claimStatusCode) && availableRights.includes('CLAIM_MODIFY_INVOICE');
        this.isEditMode && this.invoiceValidationMap.clear();
    }

    updatePostingKeys(): void {
        this.claimInvoiceDetails.documentTypeCode = this.documentType.documentTypeCode;
        this.claimInvoiceDetails.headerPostingKey = this.documentType.headerPostingKey;
    }

    updateControlledGlAccount(): void {
        this.claimInvoiceDetails.glAccountCode = this.glAccountCode.glAccountCode;
    }

    compareByTypeCode(itemOne, itemTwo): boolean {
        return itemOne && itemTwo && itemOne.documentTypeCode === itemTwo.documentTypeCode;
    }

    compareByGlAccount(itemOne: GlAccountCode, itemTwo: GlAccountCode): boolean {
        return itemOne && itemTwo && itemOne.glAccountCode === itemTwo.glAccountCode;
    }


    private openFormIfClosed(): void {
        if (!this.isInvoiceWidgetOpen) {
            this.isInvoiceWidgetOpen = true;
        }
    }

    private getClaimInvoice(): void {
        const claimRequests = [this._invoiceService.loadClaimInvoice(this.claimInvoiceDetails.claimId),
            this._invoiceService.loadClaimInvoiceLookups()];
        this.$subscriptions.push(forkJoin(claimRequests).subscribe((res: any[]) => {
            if (res && res[0] && res[1] && res[0].claimInvoice) {
                this.claimInvoiceDetails = res[0].claimInvoice;
                if (this.isEditMode && res[0].claimOutputGstTaxCode) {
                    this.claimOutputGstTaxCode = res[0].claimOutputGstTaxCode;
                }
                this.setInvoiceLineItems();
                this.setDocumentType();
                this.setGlAccountCode();

                this.lookupData = res[1];
                this.setDocumentTypeLookup();
                this.setLineItemConfiguration();
            }
            !res[0].claimInvoice && this.showErrorMessage('Fetching invoice details failed. Please try again.');
        }, _err => this.showErrorMessage('Fetching invoice details failed. Please try again.')));
    }


    private setInvoiceLineItems() {
        this.invoiceLineItems = JSON.parse(JSON.stringify(this.claimInvoiceDetails.claimInvoiceDetails));
    }

    private setLineItemConfiguration(): void {
        this.invoiceLineItemConfig = {
            invoiceLineItems: this.invoiceLineItems,
            lookups: this.lookupData,
            isEditMode: this.isEditMode,
            headerPostingKey: this.documentType ? this.documentType.headerPostingKey : null,
            lineItemPostingKey: this.documentType ? this.documentType.lineItemPostingKey : null,
            claimOutputGstTaxCode: this.claimOutputGstTaxCode,
            baCode: this.claimInvoiceDetails.baCode,
            claimId: this.claimInvoiceDetails.claimId,
            invoiceId: this.claimInvoiceDetails.invoiceId,
            isNestedMode: false,
            grtWbs: this.claimDetails.award.accountNumber,
            campus: this.claimInvoiceDetails.campus,
        };
    }

    private setDocumentType(): void {
        this.documentType = this.claimInvoiceDetails.claimInvoiceMetadata;
        if (!this.documentType) {
            this.documentType = {
                baCode: '',
                documentTypeCode: null,
                documentTypeDesc: '',
                headerPostingKey: '',
                isActive: false,
                lineItemPostingKey: '',
                reversalDocumentTypeCode: '',
                reversalDocumentTypeDesc: '',
                reversalHeaderPostingKey: '',
                reversalLineItemPostingKey: '',
                updateTimeStamp: 0,
                updateUser: ''
            };
        }
    }

    private setGlAccountCode(): void {
        this.glAccountCode.glAccountCode = this.claimInvoiceDetails.glAccountCode;
    }

    private setDocumentTypeLookup(): void {
        const baCode = this.claimInvoiceDetails.campus;
        this.documentTypeLookup = this.lookupData.baCodeMetadata[baCode] || [];
    }

    private generateRequestObject({ ...claimInvoiceDetails }): { claimInvoice: ClaimInvoiceDetail } {
        claimInvoiceDetails.customerEmailAddress = claimInvoiceDetails.customerEmailAddress.trim();
        claimInvoiceDetails.requesterEmailAddress = claimInvoiceDetails.requesterEmailAddress.trim();
        const requestObject: { claimInvoice: any } = { claimInvoice: { ...JSON.parse(JSON.stringify(claimInvoiceDetails)) } };
        delete requestObject.claimInvoice.claimInvoiceMetadata;
        delete requestObject.claimInvoice.claimInvoiceDetails;
        delete requestObject.claimInvoice.updateTimeStamp;
        delete requestObject.claimInvoice.updateUser;
        return requestObject;
    }

    private isFormValid(): boolean {
        this.invoiceValidationMap.clear();
        this.invoiceWarningMap.clear();
        this.areAllEmailFieldsValid();
        this.areAllMandatoryFieldsFilled();
        this.validateCustomerNumber(this.claimInvoiceDetails.customerNumber);
        return this.invoiceValidationMap.size === 0;
    }

    private areAllMandatoryFieldsFilled() {
        ['documentHeaderText', 'documentTypeCode', 'contactTelephoneNo', 'assignmentField',
            'customerEmailAddress', 'requesterEmailAddress', 'glAccountCode', 'companyCode', 'currencyCode'].forEach((field: string) => {
            this.checkIfFieldNotEmpty(field);
        });
    }

    private areAllEmailFieldsValid() {
        ['customerEmailAddress', 'requesterEmailAddress']
            .forEach((field: string) => {
               this.checkIfValidEmail(field);
            });
    }

    private checkIfFieldNotEmpty(field: string) {
        if (!this.claimInvoiceDetails[field]) {
            this.invoiceValidationMap.set(field, field);
        }
    }

    private checkIfValidEmail(field: string) {
        if (!isValidEmailAddress(this.claimInvoiceDetails[field])) {
            this.invoiceValidationMap.set(field, field);
        }
    }

    private saveInvoiceHeaderDetails(): void {
        if (this.isFormValid()) {
            this.$subscriptions.push(this._invoiceService.saveOrUpdateClaimInvoice(this.generateRequestObject(this.claimInvoiceDetails))
                .subscribe((_res: any) => {
            this.claimInvoiceDetails = _res.claimInvoice;
                    this.setLineItemConfiguration();
                    this.showSuccessMessage('Invoice details saved successfully.');
                    this._commonData.isClaimDataChange = false;
                }, err => this.showErrorMessage('Saving Invoice details failed. Please try again.')));
        }
    }

    private showErrorMessage(message: string): void {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }

    private showSuccessMessage(message: string): void {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, message);
    }

    filterNumbers(event) {
        return (!isNaN(event.key) && (this.claimInvoiceDetails.customerNumber ?
            this.claimInvoiceDetails.customerNumber : '').toString().length <= 9 ) ? true : event.preventDefault();
    }

    validateCustomerNumber(customerNumber) {
        if (customerNumber) {
            if (!(customerNumber.toString().length >= 8 && customerNumber.toString().length <= 10)) {
                this.invoiceWarningMap.set('customerNumber',
                'Customer Number should be 8-10 numeric. Please check and re-enter.');
            }
        } else {
            this.claimInvoiceDetails.customerNumber = null;
        }
    }
}
