import { COIEngagementActionModal } from "./migrated-engagements-interface";

export const MIG_ENG_HELP_TEXT = {
    TO_DO_TEXT: 'Below is a list of existing engagements. Select one to migrate to the new system.',
    EXCLUDED_TEXT: 'Below is a list of engagements you previously excluded from migration. You can revert the decision to bring it back to your To Do list for review.',
    TRANSFERRED_TEXT: 'Below is a list of engagements you’ve already migrated to the new system. No further action is required.',
    IN_PROGRESS: 'Below is a list of engagements you’ve started migrating to the new system. Please complete the migration to proceed.'
};

export const MIG_ENG_ENTITY_HELP_TEXT = {
    'INITIAL_TEXT': `Below is a list of existing entities from the database based on you engagement. Select a
                        matching entity to proceed.
                        if no match is found, use the "Create New Entity" option to add a new one.`,
    'DNB_TEXT': 'Please create new entity and create an engagement',
};

export const EXCLUDE_MODAL_TEXT: COIEngagementActionModal = {
    header: 'Exclude Engagement',
    message: 'By excluding this engagement, you confirm that it does not need to be transferred from Coeus to MyCOI/OPA+.',
    confirmationText: 'Confirm if this engagement is no longer relevant.',
    closingText: 'You can view excluded engagements later in the dashboard, and this action can be reverted if needed.'
};

export const REVERT_MODAL_TEXT: COIEngagementActionModal = {
    header: 'Revert Excluded Engagement',
    message: 'This engagement was previously excluded from being transferred from Coeus to MyCOI/OPA+.',
    confirmationText: 'Reverting the exclusion will move the engagement back to your To Do list for review and migration.',
    closingText: 'Do you want to proceed?'
};

export const MIG_ENG_ENTITY_HEADER_TEXT = {
    'INITIAL_TEXT': 'Select an entity - Potential matches from entity database',
    'DNB_TEXT': 'Select an entity - potential matches from D&B',
    'CREATE_ENTITY_TEXT': 'Create new entity'
};

export enum Step {
    DB_ENTITIES = 1,
    DUNS_MATCHES = 2,
    CREATE_ENTITY = 3
};
