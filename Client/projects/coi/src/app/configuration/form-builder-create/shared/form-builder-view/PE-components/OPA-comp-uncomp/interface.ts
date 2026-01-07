export class CompUnComp {
    opaDiscActivityId: number;
    actionType: string;
    opaDisclActivityId: number;
    opaDisclosureId: number;
    opaDisclPersonEntityId: number;
    personEntityId: number;
    isCompensated = 'Y';
    numOfDaysSummer: any;
    numOfDaysAcademic: any;
    numOfDaysInYear: any;
    natureOfWork: string;
    description1: any;
    description2: any;
    updateTimestamp: string;
    updateUser: string;
    entityInfo = new EntityInfo();
}

export class EntityInfo {
    opaPersonEntityId: number;
    personEntityId: number;
    personId: string;
    entityNumber: number;
    entityName: string;
    entityType: string;
    countryName: string;
    relationship: string;
    involvementStartDate: string;
    involvementEndDate: any;
    sfiVersionStatus: string;
    entityRiskCategory: string;
    isFormCompleted: string | boolean;
}

export class CompUnCompPE {
    actionType: string;
    data: Array<CompUnComp>;
}

export class EntitySaveRO {
    entityId: number;
    entityNumber: number;
    sponsorsResearch: boolean;
    involvementStartDate: string;
    staffInvolvement: string;
    studentInvolvement: string;
    instituteResourceInvolvement: string;
    validPersonEntityRelTypeCodes?: number[];
    perEntDisclTypeSelection?: number[];
}

export class RelationShipSaveRO {
    personEntityId: string;
    validPersonEntityRelTypeCodes?: number[];
    disclTypeCodes?: number[];
}

export class EntityListRO {
    disclosureId: any;
    reviewStatusCode: string;
    filterType = 'ALL';
    currentPage: number;
    pageNumber: number;
    personId: string;
    fetchAllRecords = true;
}
export interface EntityDetails {
    personEntityId: number
    entityId: number
    entityName: string
    entityNumber: number
    countryName: string
    validPersonEntityRelType: string
    entityType: string
    entityRiskCategory: string
    personEntityVersionStatus: string
    isFormCompleted: boolean
    involvementStartDate: any
    involvementEndDate: any
  }
