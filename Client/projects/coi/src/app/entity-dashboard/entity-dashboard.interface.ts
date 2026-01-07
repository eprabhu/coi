
export type EntityDashboardTabs = 'ALL_ENTITY' | 'UNVERIFIED' | 'IMPORT' | 'DUNS_REFRESH_ENTITIES';

export class EntityDashboardSearchRequest {
    [key: string]: any;
    entityDashboardData = new EntityDashboardRequest();
}

export class EntityDashboardRequest {
    SORT_TYPE = { UPDATE_TIMESTAMP: 'DESC' };
    LIMIT = 20;
    PAGED = 0;
    TYPE = 'A';
    TAB_TYPE = '';
    UNLIMITED = false;
    // fields
    PRIMARY_NAME?: string;
    OWNERSHIP_TYPE_CODE?: string;
    ENTITY_STATUS_TYPE_CODE?: string;
    VERIFICATION_STATUS?: string;
    ENTITY_SOURCE_TYPE_CODE?: string;
    PRIMARY_ADDRESS?: string;
    CITY?: string;
    STATE?: string;
    COUNTRY?: string;
    SPONSOR_CODE?: string;
    ORGANIZATION_ID?: string;
    FOREIGN_NAME?: string;
    PRIOR_NAME?: string;
    DUNS_NUMBER?: string;
    UEI_NUMBER?: string;
    WEBSITE_ADDRESS?: string;
    CAGE_NUMBER?: string;
    TRANSLATED_NAME?: string;
}

export class RelationshipDashboardRequest {
    property1 = null;
    property2 = null;
    property3 = null;
    property4 = [];
    property5 = null;
    sort: any = { 'updateTimeStamp': 'desc' };
    filterType = null;
    currentPage = 1;
    pageNumber = 20;
    id = null;
}

export class EntityDashDefaultValues {
    entitySearch = '';
    countrySearch = '';
    stateSearch = '';
}

export class SortCountObj {
    name = 0;
    entityType = 0;
    riskLevel = 0;
    country = 0;
    updateTimeStamp = 2;
}

export class NameObject {
    entityName = '';
    personName = '';
    departmentName = '';
    travelCountryName = '';
}

export class DashboardEntityDetails {
    entityId: number;
    entityNumber: number;
    entityName: string;
    ownershipType: string;
    country: string;
    city: string;
    state: string;
    dunsNumber: string;
    ueiNumber: string;
    cageNumber: string;
    websiteAddress: string;
    certifiedEmail: string;
    entityStatus: string;
    entityVerificationStatus: string;
    entityStatusTypeCode: string;
    documentStatusTypeCode: string;
    ownershipTypeCode: string;
    entitySourceType: string;
    entitySourceTypeCode: string;
    organizationId: number;
    sponsorCode: string;
    primaryAddress: string;
    foreignName: string;
    priorName: string;
    modificationIsInProgress: boolean;
    entityBusinessType: string;
    familyTreeRoleTypes: string;
    postCode: string;
    isDunsMatched: boolean;
    dunsRefVersionIsInProgress: boolean;
    hasPersonEntityLinked: boolean;
    createUserFullName: boolean;
    createTimestamp: boolean;
    // for frontend binding
    foreignNameList?: string[];
    entityFamilyTreeRolesList?: string[];
}

export class DashboardEntity {
    totalEntityResponse: number = null;
    dashboardResponses: DashboardEntityDetails[] = [];
}
