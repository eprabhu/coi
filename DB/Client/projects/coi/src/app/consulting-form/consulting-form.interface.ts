import { Person, Unit } from "../common/services/coi-common.interface";
import { EntityDetails } from "../entity-management-module/shared/entity-interface";
import { CommonModalConfig } from "../shared-components/common-modal/common-modal.interface";

export type ConsultingFormConfirmModalType = 'SUBMIT' | 'APPROVE' | 'CONFIRMATION' | 'REJECT' | 'WITHDRAW'
    | 'RETURN' | 'COMPLETE_FINAL_REVIEW' | 'CANCEL';

export class ConsultingFormStoreData {
    consultingForm: ConsultingForm;
}

export class ConsultingForm {
    disclosureId: number;
    personId: string;
    person: Person;
    entityId: number;
    personEntityNumber: number;
    entity: EntityDetails;
    entityNumber: number;
    homeUnit: string;
    unit: Unit;
    reviewStatusCode: string;
    reviewStatusType: ReviewStatusType;
    dispositionStatusCode: string;
    dispositionStatusType: DispositionStatusType;
    certificationText: any;
    certifiedBy: any;
    certifiedAt: any;
    expirationDate: any;
    adminGroupId: string;
    adminPersonId: string;
    createTimestamp: number;
    createUser: string;
    updateTimeStamp: number;
    updatedBy: string;
    updateUserFullName: string;
    createUserFullName: string;
    adminGroupName: string;
    adminPersonName: string;
    homeUnitName: string;
    consultingDisclFormBuilderDetails: any[];
    personNotesCount: number;
    personAttachmentsCount: number;
    personEntitiesCount: number;
    isHomeUnitSubmission: boolean | null = null;
}

export interface ReviewStatusType {
    reviewStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
    sortOrder: string;
}

export interface DispositionStatusType {
    dispositionStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
    sortOrder: string;
}

export class ConsultingFormConfirmationModal {
    description? = '';
    isShowDescription? = false;
    isDescriptionMandatory? = false;
    descriptionLabel? = 'Provide the Reason';
    textAreaPlaceholder? = 'Please provide the reason.';
    modalHeader = 'Confirmation';
    mandatoryList? = new Map<'CONSULTING_FORM_ACTION_DESCRIPTION', string>();
    modalBody = 'Are you sure want to confirm';
    modalConfig = new CommonModalConfig('consulting-form-confirmation-modal', 'Yes', 'No');
    action: ConsultingFormConfirmModalType = 'CONFIRMATION';
    modalHelpTextConfig: { subSectionId: string, elementId: string };
    descriptionHelpTextConfig?: { subSectionId: string, elementId: string };
    additionalFooterBtns: { action: string, event: any }[] = [];
}

export interface ConsultingEntitySaveRO {
    entityId: string | number;
    entityNumber: string | number;
    disclosureId: string | number;
}
