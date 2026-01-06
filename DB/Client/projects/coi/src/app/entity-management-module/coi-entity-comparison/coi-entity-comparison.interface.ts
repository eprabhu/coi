import { EntireEntityDetails, EntityCompliance, EntitySponsor, SubAwardOrganization } from "../../entity-management-module/shared/entity-interface";

export interface EntityComparisonFieldConfig {
    labelName: string;
    objectName?: string; // e.g., 'entityDetails?', 'entityName'
    alternativeObjectName?: string; // e.g., 'entityDetails?', 'entityName'
    class?: string;
    isGroupHeader?: boolean;
    type?: 'DATE' | 'TEXT' | 'LOOKUP' | 'SUB_HEAD' | 'NUMBER';
    pipe?: string;
    fieldConfig?: EntityComparisonFieldConfig[];
}

export class EntityComparison {
    entireEntityDetails: EntireEntityDetails | null = null;
    entitySponsorDetails: EntitySponsor | null = null;
    entityOrganizationDetails: SubAwardOrganization | null = null;
    entityComplianceDetails: EntityCompliance | null = null;
}

export class EntityComparisonData {
    ADD = [];
    DELETE = [];
    UPDATE = [];
    NO_CHANGE = [];
};
