export interface CompareDetails {
    baseProposalId: string;
    currentProposalId: string;
    proposalNumber: string;
    baseVersionNumber: number;
    currentVersionNumber: number;
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

export interface IPHistory {
    proposalId: number;
    activeProposalId: number;
    requestType: string;
    createUserFullName: string;
    createTimestamp: string;
    versionNumber: number;
    proposalNumber: string;
    proposalSequenceStatus: string;
    description: string;
}

export class ComparisonData {
    base: any = {};
    current: any = {};
    proposalId: any = '';
    baseProposalId: any = '';
    currentProposalId: any = '';
    proposalNumber: any = '';
    baseVersionNumber: number;
    currentVersionNumber: number;
}
