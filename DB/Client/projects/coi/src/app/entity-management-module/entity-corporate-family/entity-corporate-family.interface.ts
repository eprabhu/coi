import { ElasticEntityResult, EntityFamilyTreeRole } from "../shared/entity-interface";

export class CorporateFamilySection {
    sectionId: string;
    sectionName: string;
}

export class RelationshipClass {
    selectedEntity = new ElasticEntityResult();
    selectedRelation: any = null;
}

export class NewTreeClass {
    entityId: string | number | null = null;
    parentEntityId: string | number | null = null;
    entityNumber: string | number | null = null;
    parentEntityNumber: string | number | null = null;
    currentEntityId: string | number | null = null;
    currentEntityNumber: string | number | null = null;
    roleTypeCodes?: Array<any>;
}

export class EntityTreeStructure {
    entityId: string | number | null = null;
    entityName: string | null = null;
    dunsNumber: string | null = null;
    parentEntityId: string | number | null = null;
    entityNumber: string | number | null = null;
    parentEntityNumber: string | number | null = null;
    entityType: string | null = null;
    country: string | null = null;
    updatedBy: string | null = null;
    isSystemCreated: boolean | null = null;
    child: EntityTreeStructure[] = [];
    visible?: boolean;
}

export interface CorporateTreeUnlinkRO {
    entityNumber: string | number;
    currentEntityId: string | number;
    currentEntityNumber: string | number;
}

export interface CorporateTreeServiceResponse {
    entityId: string | number;
    entityNumber: string | number;
    isForeign: boolean;
    entityFamilyTreeRoles: EntityFamilyTreeRole[];
    dunsNumber: string;
    parentEntityId: string | number;
    parentEntityNumber: string | number;
    guEntityId: string | number;
    updatedBy: string;
    updateTimestamp: number;
    guEntityNumber: string | number;
    isSystemCreated: boolean;
    currentEntityId: string | number;
    currentEntityNumber: string | number;
    hierarchyLevel: any;
    roleTypeCodes: any;
    roleTypeCode: any;
}
