import { PAGINATION_LIMIT } from "../app-constants";
import { ModulesConfiguration } from "../shared/common.interface";
import { LookUpClass, Person } from "../common/services/coi-common.interface";
import { DefaultAssignAdminDetails } from "../shared-components/shared-interface";
import { CommonModalConfig } from "../shared-components/common-modal/common-modal.interface";

export type DeclAdminDashboardTabType = 'ALL_DECLARATIONS' | 'NEW_SUBMISSIONS' | 'MY_REVIEWS'  | 'ALL_REVIEWS';
export type DeclarationConfirmationModalType = 'SUBMIT' | 'APPROVE' | 'CONFIRMATION' | 'REJECT' | 'WITHDRAW' | 'RETURN' | 'COMPLETE_FINAL_REVIEW' | 'CANCEL' | 'MARK_AS_VOID';

export class UserDeclaration {
    declaration: Declaration | null = null;
    declarations: Declaration[] = [];
}

export class Declaration {
    declarationId: number | null = null;
    declarationNumber: string | null = null;
    personId: string | null = null;
    declarationTypeCode: string | null = null;
    declarationType: DeclarationType;
    declarationStatusCode: string | null = null;
    declarationStatus: DeclarationStatus
    submissionDate: number | null = null;
    expirationDate: number | null = null;
    versionNumber: number | null = null;
    versionStatus: string | null = null;
    createdBy: string | null = null;
    createTimestamp: number | null = null;
    updatedBy: string | null = null;
    updateTimestamp: number | null = null;
    updateUserFullName: string | null = null;
    createUserFullName: string | null = null;
    person: Person | null = null;
    adminGroupId: string | null = null;
    adminGroupName: string | null = null;
    adminPersonId: string | null = null;
    adminPersonName: string | null = null;
    reviewStatusCode: string | null = null;
    declarationReviewStatusType: DeclarationReviewStatus;
    isHomeUnitSubmission: boolean | null = null;
}

export interface DeclarationType {
    declarationTypeCode: string;
    declarationType: string;
    badgeColor: string;
    projectIcon: string;
    isActive: boolean;
    createdBy: string;
    createTimestamp: number;
    updatedBy: string;
    updateTimestamp: number;
}

export interface DeclarationStatus {
    declarationStatusCode: string;
    description: string;
    isActive?: boolean;
    createdBy?: string;
    createTimestamp?: number;
    updatedBy?: string;
    updateTimestamp?: number;
}

export interface DeclarationReviewStatus {
    reviewStatusCode: string;
    declarationReviewStatusType: string;
    isActive?: boolean;
    createdBy?: string;
    createTimestamp?: number;
    updatedBy?: string;
    updateTimestamp?: number;
}

export class DeclarationConfirmationModal {
    description? = '';
    isShowDescription? = false;
    isDescriptionMandatory? = false;
    descriptionLabel? = 'Provide the Reason';
    textAreaPlaceholder? = 'Please provide the reason.';
    modalHeader = 'Confirmation';
    mandatoryList? = new Map<'DECLARATION_ACTION_DESCRIPTION', string>();
    modalBody = 'Are you sure want to confirm';
    modalConfig = new CommonModalConfig('declaration-confirmation-modal', 'Yes', 'No');
    action: DeclarationConfirmationModalType = 'CONFIRMATION';
    modalHelpTextConfig: { subSectionId: string, elementId: string };
    descriptionHelpTextConfig?: { subSectionId: string, elementId: string };
    additionalFooterBtns: { action: string, event: any }[] = [];
}

export interface DeclarationActionRO {
    declarationId: number | null;
    isApproval?: boolean;
    comment: string;
}

export class DeclarationAdminDashboardRO {
    PERSON?: string | undefined = undefined;
    DEPARTMENT?: string | undefined = undefined;
    ADMINISTRATOR?: string | undefined = undefined;
    DECLARATION_TYPE?: string | undefined = undefined;
    DECLARATION_STATUS?: string | undefined = undefined;
    REVIEW_STATUS_CODE?: string | undefined = undefined;
    EXPIRATION_DATE?: Date | string | undefined = undefined;
    SUBMISSION_DATE?: Date | string | undefined = undefined;
    SORT_TYPE?: string | undefined = 'UPDATE_TIMESTAMP DESC';
    FREE_TEXT_SEARCH_FIELDS?: string | undefined = undefined;
    TAB_TYPE?: DeclAdminDashboardTabType = 'ALL_DECLARATIONS';
    DASHBOARD_TYPE?: 'A' | undefined = 'A';
    TYPE?: 'A' | undefined = undefined;
    PAGED = 0;
    LIMIT = PAGINATION_LIMIT;
}

export class DeclarationAdminDashboardSearchValues {
    personName = '';
    departmentName = '';
};

export class DeclarationSortCountObj {
    PERSON_FULL_NAME = 0;
    DECLARATION_TYPE = 0;
    DECLARATION_STATUS = 0;
    REVIEW_STATUS_CODE = 0;
    SUBMISSION_DATE = 0;
    EXPIRATION_DATE = 0;
    UPDATE_TIMESTAMP = 2;
}

export class DeclarationDashboardSortType {
    UPDATE_TIMESTAMP?: 'DESC' | 'ASC';
    PERSON_FULL_NAME?: 'DESC' | 'ASC';
    DECLARATION_TYPE?: 'DESC' | 'ASC';
    DECLARATION_STATUS?: 'DESC' | 'ASC';
    REVIEW_STATUS_CODE?: 'DESC' | 'ASC';
    SUBMISSION_DATE?: 'DESC' | 'ASC';
    EXPIRATION_DATE?: 'DESC' | 'ASC';

    constructor() {
        this.UPDATE_TIMESTAMP = 'DESC';
    }
}

export interface DeclarationDashboard {
    declarationId?: number;
    declarationNumber?: string;
    personId?: string;
    personFullName?: string;
    homeUnitNumber?: string;
    homeUnitName?: string;
    declarationType?: string;
    declarationTypeCode?: string;
    badgeColor?: string;
    declarationStatus?: string;
    declarationStatusCode?: string;
    submissionDate?: number;
    expirationDate?: number;
    updateTimeStamp?: number;
    updateUserFullName?: string;
    unitDisplayName?: string;
    versionStatus?: string;
    versionNumber?: number;
    reviewStatus?: string;
    reviewStatusCode?: string;
    adminGroupId?: string;
    adminGroupName?: string;
    adminPersonId?: string;
    adminPersonName?: string;
    isHomeUnitSubmission?: boolean | null;
    isShowAssignAdminBtn?: boolean | null;
}

export class DeclarationAdminDashboard {
    dashboardResponses: DeclarationDashboard[] = [];
    totalDeclarationResponse: number = 0;
}

export interface DeclAdminDashboardResolvedData {
    moduleConfig: ModulesConfiguration;
    lookupArrayForAdministrator: LookUpClass[];
    lookupArrayForDeclarationType: LookUpClass[];
}

export class DeclAdminDashboardTabCount {
    newSubmissionTabCount = 0;
    myReviewsTabCount = 0;
    allReviewsTabCount = 0;
}
