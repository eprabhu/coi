export interface EntityStatus {
    entityStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface EntityType {
    entityTypeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface CoiFinancialEntityRelType {
    financialEntityRelTypeCode: string;
    description: string;
    questionnaireNumber?: any;
    updateTimestamp: any;
    updateUser: string;
    isActive: boolean;
}

export interface Currency {
    currencyCode: string;
    currency: string;
    currencySymbol: string;
    updateUser: string;
    updateTimeStamp: number;
}

export interface Country {
    countryCode: string;
    countryName: string;
    currencyCode: string;
    currency: Currency;
    updateTimeStamp: number;
    updateUser: string;
    countryTwoCode: string;
}

export class CoiEntity {
    coiEntityId: number;
    coiEntityName = '';
    entityNameGivenByCreator = '';
    originalEntityId?: number;
    entityStatusCode?: string;
    entityStatus?: EntityStatus;
    entityTypeCode: any = null;
    entityType: EntityType;
    countryCode = '';
    country?: Country;
    stateCode?: any;
    state?: any;
    addressLine1?: any;
    addressLine2?: any;
    addressLine3?: any;
    pincode = '';
    emailAddress = '';
    webUrl = '';
    createTimestamp: number;
    createUser?: string;
    updateTimestamp: number;
    updateUser?: string;
    approvedTimestamp?: any;
    approvedUser?: any;
}

export class CoiFinancialEntity {
    coiFinancialEntityId: number;
    coiEntityId: number;
    coiEntity: CoiEntity = new CoiEntity();
    personId: string;
    entityVersionNumber: number;
    involvementStartDate: any = null;
    involvementEndDate: any = null;
    isActive?: any;
    studentInvolvement: any = null;
    staffInvolvement: any = null;
    instituteResourceInvolvement: any = null;
    updateTimestamp: number;
    updateUser: string;
}

export class CoiFinancialEntityDetail {
    financialEntityDetailsId?: number = null;
    questionnaireAnsHeaderId?: any = null;
    coiFinancialEntityId: number = null;
    coiFinancialEntity: CoiFinancialEntity;
    financialEntityRelTypeCode = '';
    coiFinancialEntityRelType: CoiFinancialEntityRelType;
    updateTimestamp: number;
    updateUser: string;
}

export class SFI {
    coiDisclosure?: any;
    person?: any;
    numberOfSFI?: any;
    coiFinancialEntity: CoiFinancialEntity;
    coiEntity?: any;
    personId?: any;
    proposals?: any;
    awards?: any;
    searchString?: any;
    entityStatus?: any;
    entityType?: any;
    coiFinancialEntityRelType?: any;
    coiDisclosureDetailStatuses?: any;
    coiFinancialEntityDetails: CoiFinancialEntityDetail[];
    coiFinancialEntityDetail?: CoiFinancialEntityDetail;
}

export class AddEngagementData {
    sponsorsResearch: boolean | null = null;
    isCompensated: boolean | null = null;
    isCommitment: boolean | null = null;
    involvementStartDate?: string;
    involvementEndDate?: string;
};
