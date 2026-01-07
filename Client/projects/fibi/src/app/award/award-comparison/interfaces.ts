export interface CompareDetails {
    baseAwardId: string;
    currentAwardId: string;
    awardNumber: string;
    sequenceNumber: number;
    awardSequenceStatus: string;
    moduleVariableSections: Array<any>;
    currentSequenceNumber: number;
    isActiveComparison: boolean;
    baseUnitNumber: string;
    currentUnitNumber: string;
    baseServiceRequestTypeCode: string;
    currentServiceRequestTypeCode: string;
}
export interface CompareType {
    reviewSectionCode: number;
    reviewSectionName: string;
    reviewSectionDescription: string;
    reviewSectionUniqueFields: Array<string>;
    reviewSectionType: string;
    reviewSectionSubFields: Array<string>;
}

export interface CompareData {
    base: any;
    current: any;
    awardId: string;
    awardNumber: string;
    sequenceNumber: number;
    moduleVariableSections: Array<any>;
    currentSequenceNumber: number;
    isActiveComparison: boolean;
}

export interface Section {
    reviewSectionCode: number;
    reviewSectionDescription: string;
    documentId: string;
    subSectionCode: string;
}

export interface History {
    awardId: number;
    awardNumber: string;
    sequenceNumber: number;
    submitUserFullName: string;
    submissionDate: string;
    awardStatus: string;
    serviceRequestSubject: string;
    serviceRequestType: string;
    serviceRequestDescription: string;
    createUserFullName: string;
    title: string;
    isAwardActive: boolean;
    awardSequenceStatus: string;
    serviceRequestId: number;
    serviceRequestTypeCode: string;
    moduleVariableSections: Array<any>;
    unitNumber: string;
}
