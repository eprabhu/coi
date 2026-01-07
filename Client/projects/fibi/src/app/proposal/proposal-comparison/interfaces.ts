export interface CompareDetails {
    baseProposalId: string;
    currentProposalId: string;
    activeProposalId: string;
    activeProposalStatus: number;
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
    proposalId: string;
}

export interface Section {
    reviewSectionCode: number;
    reviewSectionDescription: string;
    documentId: string;
    subSectionCode: string;
}

export interface History {
    proposalId: number;
    activeProposalId: number;
    requestType: string;
    createUserFullName: string;
    createTimestamp: string;
    versionNumber: number;
    activeProposalStatus: number;
}
