export class OutsideFinRelation {
    opaOutsideFinancialInterestId: number;
    opaDisclosureId: number;
    opaDisclPersonEntityId: number;
    personEntityId: number;
    personsRelationWithEntity: string;
    entityRelationWithInstitute: string;
    description1: any;
    description2: any;
    updateTimestamp: string;
    updateUser: string;
    entityInfo = new EntityInfo();
    actionType: string;
}

export class EntityInfo {
    opaDisclPersonEntityId: number;
    personEntityId: number;
    personId: string;
    entityNumber: number;
    entityName: string;
    entityType: string;
    entityStatus: string;
    entityRiskCategory: string;
    countryName: string;
    relationship: string;
    isFormCompleted: string | boolean;
    sfiVersionStatus: string;
    involvementStartDate: string;
    involvementEndDate: any;
}

export class OutsideFinRelationPE {
    actionType: string;
    data: Array<OutsideFinRelation>;
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
