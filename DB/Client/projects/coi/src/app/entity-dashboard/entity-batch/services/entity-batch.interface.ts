import { PAGINATION_LIMIT } from "../../../app-constants";
import { AdminActionType, AdminReviewStatusType, BatchEntityDetails, EntityBatchDetails, EntityDetailsCardConfig } from "../../../common/services/coi-common.interface";

export type BatchReviewStepType = 'BATCH_DUPLICATES' | 'DB_DUPLICATES' | 'DNB_MATCHES';
export type BatchReviewActionType = 'LINK_TO_ORIGINAL' | 'EXCLUDE_FROM_CREATION' | 'CREATION_WITHOUT_DNB' | 'CREATION_WITH_DNB'; // do not change these names, have dependency with backend
export type BatchBulkActionType = 'EXCLUDE_FROM_CREATION' | 'CREATION_WITHOUT_DNB' | 'CREATION_WITH_DNB'; // do not change these names, have dependency with backend

export class ImportEntityRO {
    batchId?: number = null;
    batchStatusCodes?: string[] = [];
    reviewStatusCodes?: string[] = [];
}

export class BatchEntityRO {
    batchId: number = null;
    pageNumber: number = 1;
    totalCount: number = PAGINATION_LIMIT;
    searchKeyword?: string = null;
    isNoDunsMatch?: boolean = null;
    isExactDunsMatch?: boolean = null;
    adminActionCodes?: string[] = null;
    isDuplicateInBatch?: boolean = null;
    isMultipleDunsMatch?: boolean = null;
    isDuplicateInEntitySys?: boolean = null;
    adminReviewStatusCodes?: string[] = null;
}

export class BatchEntity {
    batchEntityDetailsCount = 0;
    batchDetail = new EntityBatchDetails();
    batchEntityDetails: BatchEntityDetails[] = [];
}

export class BatchEntityDuplicateRO {
    entityId?: number;
    canReReview = false;
    batchId: number = null;
    adminReviewStatusCode?: number;
    originalEntityDetailId?: number;
    duplicateEntityDetailId?: number;
    excludedEntityDetailId?: number;
    entityStageDetailId: number;
    adminActionCode: number | string;
}

export class BatchEntityBulkUpdateRO {
    batchId: number = null;
    action: BatchBulkActionType;
    entityStageDetailIds: string[];
}

export class BulkConfirmationModal {
    modalHeader = '';
    modalInfoText = '';
    modalHelpElementId = '';
    bulkAction: BatchBulkActionType = null;
    selectedReviewEntity?: BatchEntityDetails = null;
}

export class FilterSearchAction {
    searchText = '';
    currentMatchFilter: string[] = null;
    currentReviewFilter: any[] = null;
    currentAdminActionFilter: any[] = null;
    selectedLookupList = {
        currentMatchFilter: [],
        currentReviewFilter: [],
        currentAdminActionFilter: []
    };
}

export interface BatchEntityLookups {
    adminReviewStatusTypes: AdminReviewStatusType[];
    adminActionTypes: AdminActionType[];
}

export interface CreateImportEntityRO {
    srcUei: string;
    batchId: number;
    srcCity: string;
    srcState: string;
    srcDataName: string;
    groupNumber: number;
    srcDunsNumber: string;
    srcCageNumber: string;
    srcPostalCode: string;
    srcCountryCode: string;
    srcPhoneNumber: string;
    createWithDuns: boolean;
    srcEmailAddress: string;
    srcAddressLine1: string;
    srcAddressLine2: string;
    entityStageDetailId: number;
    adminActionCode: number | string;
    highestConfidenceCode: number;
}

export class BatchReviewConfirmation {
    modalHeader = '';
    modalInfoText = '';
    modalHelpElementId = '';
    modalHelpSubSectionId: number = null;
    reviewStep?: BatchReviewStepType = null;
    reviewAction: BatchReviewActionType = null;
    selectedEntityCard?: EntityDetailsCardConfig = null;
}
