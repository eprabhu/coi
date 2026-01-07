export type FBOpaCardActions = 'COMMENT' | 'VIEW_ENGAGEMENT' | 'MODIFY_ENGAGEMENT' | 'ACTIVATE_DEACTIVATE_ENGAGEMENT' | 'DELETE_ENGAGEMENT' | 'CREATE_ENGAGEMENT' | 'CHECK_SABBATICAL_TYPE';
export type ExternalActionTypes = 'EXTERNAL_ACTION';
export type FBOpaEngTabType = 'ALL' | 'OPA';

export type FBOpaCardActionEvent = { action: FBOpaCardActions, content: any };
export type ExternalActionEvent = { eventType: ExternalActionTypes, data: any };

export interface ProposalPersonRole {
    id: number;
    code: string;
    sponsorHierarchyName: string;
    description: string;
    certificationRequired: string;
    readOnly: boolean;
    unitDetailsRequired: boolean;
    isMultiPi: string;
    sortId: number;
    isActive: boolean;
}

export interface UnitAdministratorType {
    code: string;
    description: string;
    isActive: boolean;
}

export interface UnitAdministrator {
    personId: string;
    fullName?: any;
    oldPersonId?: any;
    oldUnitAdministratorTypeCode?: any;
    unitAdministratorTypeCode: string;
    unitNumber: string;
    unitName?: any;
    updateTimestamp: any;
    updateUser: string;
    unitAdministratorType: UnitAdministratorType;
}

export interface EngagementDetails {
    personEntityId: string;
    personId: string;
    entityId: string;
    involvementStartDate: string;
    involvementEndDate: string;
    entityName: string;
    isCompensated: string;
    relationships: string[];
    engQuestionnaireAnswers: EngQuestionnaireAnswer[];
    sabbaticalType: string;
    opaPersonEntityRelId: number;
}

export interface EngQuestionnaireAnswer {
    Label: string;
    value: boolean | null;
}

export class OpaPersonEngagementFetchRO {
    opaDisclosureId: number;
    documentOwnerPersonId: number | string;
    loggedInUserPersonId: number;
    filterType: string = 'COMPLETE';
    tabType: FBOpaEngTabType = 'OPA';
    searchWord = '';
    isSyncRequired = false;
}
