export interface ClaimInvoiceDetail {
    invoiceDetailId: number;
    invoiceId: number;
    sequenceNumber: number;
    baCode: string;
    claimId: number;
    claimNumber: string;
    description: string;
    documentTypeCode?: any;
    currencyCode: string;
    claimInvoiceMetadata?: any;
    documentHeaderText?: string;
    customerEmailAddress?: string;
    requesterEmailAddress: string;
    assignmentField: string;
    claimGlAccount: GlAccountCode;
    glAccountCode: string;
    grantCode: string;
    profitCentre: string;
    headerPostingKey?: any;
    companyCode: string;
    particulars1?: string;
    particulars2?: string;
    particulars3?: string;
    particulars4?: string;
    contactTelephoneNo?: string;
    actionIndicator?: any;
    claimInvoiceDetails?: any[];
    updateTimeStamp?: any;
    updateUser?: any;
    campus: string;
    geBizPoNumber?: string;
    vendorSubBusinessUnitNumber?: string;
    eInvoice?: boolean;
    attentionTo?: string;
    customerNumber: string | number;
}

export interface DocumentType {
    baCode: string;
    documentTypeCode: string;
    documentTypeDesc: string;
    reversalDocumentTypeCode: string;
    reversalDocumentTypeDesc: string;
    headerPostingKey: string;
    lineItemPostingKey: string;
    reversalHeaderPostingKey: string;
    reversalLineItemPostingKey: string;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface InvoiceLineItem {
    invoiceDetailId?: number;
    invoiceId?: number;
    claimId?: number;
    grantCode?: any;
    lineItemPostingKey?: any;
    claimGlAccount: ClaimGlAccount;
    claimOutputGstTaxCode?: ClaimOutputGstTaxCode;
    glAccountCode: any;
    claimAmount: number;
    subContractAmount: number;
    grtWbs: any;
    description: any;
    profitCentre?: any;
    baCode?: any;
    taxCode: any;
    updateTimeStamp?: number;
    updateUser?: string;
    campus?: string;
}

export interface BaCode {
    baCode: string;
    documentTypeCode: string;
    documentTypeDesc: string;
    reversalDocumentTypeCode: string;
    reversalDocumentTypeDesc: string;
    headerPostingKey: string;
    lineItemPostingKey: string;
    reversalHeaderPostingKey: string;
    reversalLineItemPostingKey: string;
    isActive: boolean;
    updateTimeStamp: any;
    updateUser: string;
}

export interface BaCodeMetadata {
    LKCM: BaCode[];
    NIE: BaCode[];
    RSIS: BaCode[];
    NTU: BaCode[];
}

export interface GlAccountCode {
    glAccountCode: string;
    description: string;
    isActive: boolean;
    isControlledGl: boolean;
    updateTimeStamp: any;
    updateUser: string;
}

export interface TaxCode {
    outputGstCategory: string;
    taxCode: string;
    taxDescription: string;
    isActive: boolean;
    updateTimeStamp: any;
    updateUser: string;
}

export interface InvoiceLookUp {
    taxCodes: TaxCode[];
    baCodeMetadata: BaCodeMetadata;
    glAccountCode: GlAccountCode[];
}

export interface ClaimOutputGstTaxCode {
    outputGstCategory: string;
    taxCode: string;
    taxDescription: string;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface InvoiceLineItemConfig {
    isEditMode: boolean;
    lineItemPostingKey: string;
    headerPostingKey: string;
    invoiceLineItems: InvoiceLineItem[];
    lookups: InvoiceLookUp;
    claimOutputGstTaxCode: ClaimOutputGstTaxCode;
    baCode: string;
    claimId: number;
    invoiceId: number;
    isNestedMode: boolean;
    grtWbs: string;
    campus: string;
}

export interface CustomDataView {
    moduleItemKey: string;
    grantCode: string;
    outputGstCategory: string;
    stemNonStem?: any;
    rieDomain?: any;
    subLeadUnit?: any;
    profitCenter: string;
    fundCenter?: any;
    costCenter?: any;
    claimPreparer?: any;
}

export interface ClaimGlAccount {
    glAccountCode: string;
    description: string;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface ClaimInvoiceMetadata {
    baCode: string;
    documentTypeCode: string;
    documentTypeDesc: string;
    reversalDocumentTypeCode: string;
    reversalDocumentTypeDesc: string;
    headerPostingKey: string;
    lineItemPostingKey: string;
    reversalHeaderPostingKey: string;
    reversalLineItemPostingKey: string;
    isActive: boolean;
    updateTimeStamp: any;
    updateUser: string;
}

export interface SummaryClaimInvoiceDetail {
    invoiceDetailId: number;
    invoiceId: number;
    claimId: number;
    grantCode: string;
    lineItemPostingKey: string;
    glAccountCode: string;
    claimAmount: number;
    subContractAmount: number;
    grtWbs: string;
    assignmentField: string;
    description: string;
    profitCentre: string;
    baCode: string;
    taxCode: string;
    updateTimeStamp: any;
    updateUser: string;
    claimGlAccount: ClaimGlAccount;
    claimOutputGstTaxCode: ClaimOutputGstTaxCode;
}


export interface ClaimInvoiceVersions {
    claimGlAccount: GlAccountCode;
    claimInvoiceLogId: number;
    invoiceId: number;
    sequenceNumber: number;
    assignmentField: string;
    claimId: number;
    claimNumber: string;
    documentTypeCode: string;
    currencyCode: string;
    documentHeaderText: string;
    customerEmailAddress: string;
    requesterEmailAddress: string;
    headerPostingKey: string;
    documentDate: any;
    baseDate: any;
    companyCode: string;
    particulars1: string;
    particulars2: string;
    particulars3: string;
    particulars4: string;
    glAccountCode: string;
    profitCentre: string;
    grantCode: string;
    description: string;
    inputDocumentNumber: string;
    outputDocumentNumber: string;
    contactTelephoneNo: string;
    documentNumber: string;
    fiscalYear: string;
    actionIndicator: string;
    batchId: string;
    actionNote: string;
    updateTimeStamp: any;
    updateUser: string;
    message: string;
    status: string;
    claimInvoiceFeedType: ClaimInvoiceFeedType;
    claimInvoiceDetails: SummaryClaimInvoiceDetail[];
    baCode?: any;
    claimAmount?: any;
    claimInvoiceMetadata: ClaimInvoiceMetadata;
    geBizPoNumber?: string;
    vendorSubBusinessUnitNumber?: string;
    eInvoice?: boolean;
    attentionTo?: string;
    customerNumber: number;
}

export interface ClaimInvoiceFeedType {
    typeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface SapMessage {
    responseMessgeId: number;
    claimInvoiceLogId: number;
    message: string;
    updateTimeStamp: any;
    updateUser: string;
}
