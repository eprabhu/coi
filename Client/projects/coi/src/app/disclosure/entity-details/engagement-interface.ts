import { PersonEntityRelType } from "./entity-details.service";

export const MATRIX_TYPE = 1;
export const QUESTIONNAIRE_TYPE = 2;
export const FORM_TYPE = 3;

export const FINANACIAL_DIS_TYPE = '1';
export const TRAVEL_DIS_TYPE = '3';
export const COMMITMENT_DIS_TYPE = '2';
export const CONSULTING_DIS_TYPE = '4';

export const TRAVEL_QUES_MODULE_ITEM_KEY = 4;
export const CONSULTING_QUES_MODULE_ITEM_KEY = 7;
export const COMMITMENT_QUES_MODULE_ITEM_KEY = 5;

export class CreateDisclosureModalDetails {
    message: string;
    id: any;
    type: 'OPA' | 'FCOI' | 'TRAVEL';
    REVIEW_STATUS_CODE?: '';
    modalHeader: string;
    OPAMessage: 'CREATE' | 'REVISE' | null;
    fcoiMessage: 'CREATE' | 'REVISE' | null;
    isTravelMessage: boolean;
};

export interface EngagementVersion {
    versionNumber: number;
    versionStatus: string;
    personEntityId: number;
    personEntityNumber?: any;
    personId?: any;
    entityId?: any;
    entityNumber?: any;
    isFormCompleted?: any;
    sponsorsResearch?: any;
    involvementStartDate?: any;
    involvementEndDate?: any;
    studentInvolvement?: any;
    staffInvolvement?: any;
    instituteResourceInvolvement?: any;
    updateTimestamp?: any;
    updateUser?: any;
    createUser?: any;
    createTimestamp?: any;
    personFullName?: any;
    revisionReason?: any;
    updateUserFullName?: any;
    personEntityRelationships?: any;
    country?: any;
    entityOwnershipType?: any;
    actionTypeCode?: any;
    entityName?: any;
    relationshipName?: any;
    perEntDisclTypeSelection?: any;
    isCompensated?: any;
    message?: any;
};

export interface COIMatrix {
    coiMatrixQuestion: CoiMatrixQuestion;
    relationships: PersonEntityRelType[];
    coiMatrixAnswer: CoiMatrixAnswer[];
}

export interface CoiMatrixAnswer {
    matrixAnswerId: number;
    personEntityId: number;
    personEntityNumber: number;
    matrixQuestionId: number;
    columnValue: string;
    relationshipTypeCode: string;
    comments: string;
    updateTimestamp: number;
    updatedBy: string;
}

export interface CoiMatrixQuestion {
    matrixQuestionId: number;
    columnLabel: string;
    answerTypeCode: string;
    lookupType: string;
    lookupValue: string;
    groupId: number;
    isActive: boolean;
    sortId: number;
    updateTimestamp: number;
    updatedBy: string;
    coiMatrixGroup: CoiMatrixGroup;
    coiMatrixAnswerType: CoiMatrixAnswerType;
}

export interface CoiMatrixAnswerType {
    answerTypeCode: number;
    description: string;
    updateTimestamp: number;
    updatedBy: string;
}

export interface CoiMatrixGroup {
    groupId: number;
    groupName: string;
    sortId: number;
    updateTimestamp: number;
    updatedBy: string;
}
