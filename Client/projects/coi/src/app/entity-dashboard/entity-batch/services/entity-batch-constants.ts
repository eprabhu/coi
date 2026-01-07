import { BatchBulkActionType, BatchReviewActionType, BatchReviewStepType } from "./entity-batch.interface";

// help text subSectionCode
export const SUB_SECTION_CODES = {
    BATCH_DUPLICATES: 2627,
    DB_DUPLICATES: 2628,
    DNB_MATCHES: 2629,
    BATCH_ACTION: 2630
};

// help text elementId
export const BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID: Record<BatchReviewStepType | 'BATCH_ACTION', Partial<Record<BatchReviewActionType | 'SLIDER_HEADER' | 'RE_REVIEW' | 'VALIDATION_MODAL_HEADER' | 'EXCLUDE_VALIDATION_MODAL_HEADER', string>>> = {
    BATCH_DUPLICATES: {
        SLIDER_HEADER: 'coi-GE-dup-rev-slider-hdr',
        LINK_TO_ORIGINAL: 'coi-GE-dup-rev-link-conf',
        EXCLUDE_FROM_CREATION: 'coi-GE-dup-rev-excl-conf'
    },
    DB_DUPLICATES: {
        SLIDER_HEADER: 'coi-GE-db-dup-rev-slider-hdr',
        LINK_TO_ORIGINAL: 'coi-GE-db-dup-rev-link-conf',
        EXCLUDE_FROM_CREATION: 'coi-GE-db-dup-rev-excl-conf'
    },
    DNB_MATCHES: {
        SLIDER_HEADER: 'coi-GE-duns-rev-slider-hdr',
        CREATION_WITH_DNB: 'coi-GE-duns-yes-conf',
        CREATION_WITHOUT_DNB: 'coi-GE-duns-no-conf',
        EXCLUDE_FROM_CREATION: 'coi-GE-duns-excl-conf'
    },
    BATCH_ACTION: {
        EXCLUDE_FROM_CREATION: `coi-GE-bulk-rev-excl-conf`,
        CREATION_WITHOUT_DNB: `coi-GE-bulk-rev-no-duns-conf`,
        CREATION_WITH_DNB: `coi-GE-bulk-rev-yes-duns-conf`,
        RE_REVIEW: `coi-GE-re-rev-modal-hdr`,
        VALIDATION_MODAL_HEADER: `coi-GE-rev-val-modal-hdr`,
        EXCLUDE_VALIDATION_MODAL_HEADER: `coi-GE-rev-ex-val-modal-hdr`,
    }
};

// bulk action modal configurations
export const BATCH_ENTITY_BULK_REVIEW_MODAL_HEADER: Record<BatchBulkActionType, string> = {
    EXCLUDE_FROM_CREATION: `Confirm Exclusion from Entity Creation`,
    CREATION_WITHOUT_DNB: `Confirm Entity Creation Without D&B Match`,
    CREATION_WITH_DNB: `Confirm Entity Creation`
};

export const BATCH_ENTITY_BULK_REVIEW_MODAL_INFO: Record<BatchBulkActionType | 'RE_REVIEW', string> = {
    EXCLUDE_FROM_CREATION: `The selected {{count}} entity(s) will be excluded from entity creation.`,
    CREATION_WITHOUT_DNB: `The selected {{count}} entity(s) will be created in the entity database without using any D&B match.`,
    CREATION_WITH_DNB: `The selected {{count}} entity(s) will be created using D&B match.`,
    RE_REVIEW: `The Re-review action will undo the last review action taken for the entity.`
};

// review slider configurations
export const BATCH_ENTITY_REVIEW_MODAL_HEADER: Record<BatchReviewActionType, string> = {
    LINK_TO_ORIGINAL: `Confirm Duplicate Entity Linking`,
    EXCLUDE_FROM_CREATION: `Confirm Exclusion from Entity Creation`,
    CREATION_WITHOUT_DNB: `Confirm Entity Creation Without D&B Match`,
    CREATION_WITH_DNB: `Confirm Entity Creation`
};

export const BATCH_ENTITY_REVIEW_MODAL_INFO: Record<BatchReviewActionType, string> = {
    LINK_TO_ORIGINAL: `The entity will be marked as a duplicate of the following entity from the {{duplicateSource}} and will be linked to it.`,
    EXCLUDE_FROM_CREATION: `The entity will be marked as a duplicate of the following entity from the {{duplicateSource}} and will be excluded from entity creation.`,
    CREATION_WITHOUT_DNB: `The entity will be created in the entity database without using any D&B match.`,
    CREATION_WITH_DNB: `The following match will be used as the D&B match for the entity, and the entity will be created using this match.`
};

export const BATCH_ENTITY_REVIEW_SLIDER_HEADER: Record<BatchReviewStepType, string> = {
    BATCH_DUPLICATES: `Duplicate Records Found in Batch`,
    DB_DUPLICATES: `Duplicate Entities Found in the Entity Database`,
    DNB_MATCHES: `Select a D&B Match for the Entity`
}

export const BATCH_ENTITY_REVIEW_SLIDER_INFO: Record<BatchReviewStepType, string> = {
    BATCH_DUPLICATES: `During the batch processing of entities, we identified some records that appear to be duplicates. If any of these matches are correct, please select the appropriate one. The current entity will then be marked as a duplicate of the original, and you can choose to either exclude it from entity creation or link it to the original. If none of the matches are accurate, you can skip and proceed.`,
    DB_DUPLICATES: `Matches have been identified between this entity and existing entities. If any of these matches are correct, please select the appropriate one. The current entity will then be marked as a duplicate of the original, and you can choose to either exclude it from entity creation or link it to the original. If none of the matches are accurate, you can skip and proceed.`,
    DNB_MATCHES: `The above entity has matches with D&B. Please select the appropriate match, choose to create without a D&B match, or exclude the entity from creation.`
}

export const BATCH_ENTITY_CONFIRMATION_TEXT = 'Are you sure you want to proceed?';
export const BATCH_ENTITY_DUNS_STEP_EXCLUDE_INFO_TEXT = 'The entity will be excluded from entity creation.';
export const BATCH_ENTITY_RE_REVIEW_VALIDATION_INFO_TEXT = 'Re-review is not allowed because the original entity has already been created in the database.';
export const BATCH_ENTITY_SOURCE_SELECTED_EXCLUDE_INFO_TEXT = 'This entity cannot be excluded as it has been selected as the original for the following entities. To proceed with exclusion, re-review the listed entities and update their original entity selection first.';
