import { PAGINATION_LIMIT } from "../app-constants";

export interface EngagementCardActionEvent {
    action: 'VIEW' | 'EXCLUDE' | 'PROCEED' | 'REVERT';
    engagementDetails: LegacyEngagement;
} 

export class EngagementsMigDashboardRO {
    tab: string = 'TO REVIEW';
    filter: string = '';
    pageNumber: number = 1;
    pageLimit: number = PAGINATION_LIMIT;
}

export class EngagementsMigDashboard {
    count = 0;
    legacyEngagements: LegacyEngagement[] = [];
}

export class LegacyEngagement {
    engagementId: number;
    entityName: string;
    relationshipType: string;
    entityType: string;
    ownershipType: string;
    entityBusinessFocus: string;
    involvementOfStudents: string;
    involvementOfStaff: string;
    useOfMitResources: string;
    founder: string;
    migrationStatus: string;
    ownershipTypeCode: string;
    coiEngagementId: number;
    coiEntityId: number;
    initialReportDate: string;
}

export class EngagementCount {
    completedCount? = 0;  
    excludedCount? = 0;
    toReviewCount? = 0;
    totalCount? = 0;
}

export class EngagementSliderConfig {
    sliderElementId = 'coi-engagement-slider';
    engagementDetails: LegacyEngagement | null = null;
}

export class MatrixAnsClass {
    engagementId = 0;
    personEntityNumber = 0;
    matrixQuestionId = 0;
    columnValue: '';
    relationshipTypeCode: '';
    comments: '';
}

export class COIEngagementActionModal {
    header = '';
    message = '';
    confirmationText = '';
    closingText = '';
};

export interface EngagementStatusRO {
    migrationStatus: string;
    engagementIds: (number | string)[];
}

export interface EngagementDetailsRO {
    entities: MigratedEntityCardConfig[];
}

export type EntityStepType = 'DB_ENTITIES' | 'DNB_ENTITIES';

export class MigratedEntityCardConfig {
  entityId: number;
  entityNumber: number;
  entityName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  dunsNumber: string;
  ueiNumber: string;
  organizationId: string;
  sponsorCode: string;
  postalCode: string;
  cageNumber: string;
  website: string;
  ownershipType: string;
  businessType: string;
  entityType: string;
  primaryAddress: string;
  matchQualityInformation: string | number;
}

export class EngagementDetails {
  engagementId: number;
  personId: string;
  entityNumber: string;
  sequenceNumber: number;
  statusCode: number;
  entityName: string;
  entityTypeCode: number;
  entityOwnershipType: string;
  relationshipDescription: string;
  studentInvolvement: string;
  staffInvolvement: string;
  instResourceInvolvement: string;
  isTravel: string;
  isFounder: string;
  migrationStatus: number;
  fibiCoiEngagementId: string | number;
  fibiCoiEntityId: string | number;
  updateTimestamp: number;
  updateUser: string;
  ownershipTypeCode: string;
}

export interface EntityCardActionEvent {
    action: 'PROCEED' | 'SELECT';
    entityDetails: MigratedEntityCardConfig;
} 

export class DnBRO {
    entityId: string | number;
    entityNumber: string | number;
    sourceDataName: string;
    sourceDunsNumber: string | number;
    emailAddress: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string | number;
    state: string;
    countryCode: string;
}

export class CreateEntityRO {
    entityId: string | number;
    entityRequestFields? = new MigratedEntityCardConfig();
    modificationIsInProgress?: boolean;
    complianceRequestDTO?: { entityTypeCode: string };
}

export interface SaveMatrixRO {
  legacyEngagementId: string | number;
  personEntityId: number;
  personEntityNumber: number;
}
