export class OPAInstituteResources {
    opaInstResId: number;
    opaDisclosureId: number;
    updateTimestamp: string;
    opaDisclPersonEntityId: number;
    personEntityId: number;
    updateUser: string;
    description: any;
    description1: any;
    description2: any;
    entityInfo = new EntityInfo;
    actionType: string;
}

  export class OPAInstituteResourcesPE {
    actionType: string;
    data: Array<OPAInstituteResources>;
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
