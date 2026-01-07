import { CoiDashboardDisclosures } from "../admin-dashboard/admin-dashboard.interface";
import { PAGINATION_LIMIT } from "../app-constants";
import { LookUpClass } from "../common/services/coi-common.interface";
import { CommonModalConfig } from "../shared-components/common-modal/common-modal.interface";
import { ModulesConfiguration } from "../shared/common.interface";

export type ReviewCardTriggeredFrom = 'DEPT_OVERVIEW' | 'OVERVIEW_HEADER';
export type DisclosureType = 'FCOI' | 'OPA' | 'TRAVEL' | 'CONSULTING';
export type PersonTableEventActionType = 'EDIT_ELIGIBILITY' | 'NOTIFICATION_SLIDER' | 'PERSON_HISTORY';
export type EligibilityModalMode = 'CREATE_MODE' | 'EDIT_MODE';
export type RecipientGroup = 'TO' | 'CC' | 'BCC' | null;
export type PersonTableTriggeredFrom = 'PERSON_LIST' | 'HISTORY_SLIDER';

export class ReviewerDashboard {
    dashboardData: CoiDashboardDisclosures[] = [];
    totalCount: number = 0;
}

export class RevDashDeptOverview {
    unitNumber: string;
    unitName: string;
    parentUnitNumber: string;
    displayName: string;
    departmentOverviewCountDetails: RevDashDeptOverviewCount[] = [];
}

export interface RevDashDeptOverviewCount {
    COUNT: number;
    LABEL: string;
    UNIQUE_ID: string;
    MODULE_NAME: string;
    MODULE_CODE: number | string;
    ORDER_NUMBER: number;
    SHOW_IN_HEADER: boolean;
}

export class DisclosureReviewData {
    MODULE_CODE: number | string;
    MODULE_ICON: string;
    MODULE_NAME: string;
    ORDER_NUMBER: number;
    COUNT_DETAILS: DisclosureReviewCountDetails[] = [];
}

export interface DisclosureReviewCountDetails {
    COUNT: number;
    LABEL: string;
    UNIQUE_ID: string;
    ORDER_NUMBER: number;
    EXPIRING_DAYS?: number;
    SHOW_IN_HEADER: boolean;
    // for front-end
    title?: string;
    ariaLabel?: string;
}

export interface ReviewStat {
    label: string;
    value: number;
}

export class DeptReviewModalConfig {
    isOpenDeptReviewModal = false;
    personId: string;
    personName: string;
    revDashDeptOverview = new RevDashDeptOverview();
    departmentReviewDetails?: DisclosureReviewData[] = [];
    modalConfig = new CommonModalConfig('coi-dept-review-details-modal', '', 'Close', 'lg');
}

export class DisclConfigurationModalConfig {
    isOpenDiscConfigModal = false;
    availableDisclosures: DisclosureReviewData[];
}

export class PersonEligibilityModalConfig {
    isOpenModal = false;
    isEditMode: boolean = false;
    personDetails: PersonDetails;
}

export class PersonNotificationSliderConfig {
    isOpenSlider? = false;
    notificationSliderData? = new NotificationData();
}

export class PersonHistorySliderConfig {
    isOpenSlider? = false;
    historySliderData? = new HistoryData();
}

export class EngagementSliderConfig {
    showEngagementSlider = false;
    entityId: string | number | null = null;
    sliderElementId = '';
}

export class HistoryData {
    personDetailsForHistorySlider: PersonDetails;
    personIndex: string | number | null;
}

export class NotificationData {
    personDetailsForSlider: PersonDetails;
    personIndex: string | number | null;
    personDetailsList?: PersonDetails[];
}

export class ReviewerDashboardRo {
    moduleCode: number | string;
    fetchType: 'DATA' | 'HEADER' = 'DATA';
    isCountNeeded = false;
    dashboardData = new ReviewerDashboardData();
}

export class ReviewerDashboardData {
    MODULE_CODE?: number | string;
    TAB_TYPE?: String;
    IS_UNLIMITED? = false;
    LIMIT? = PAGINATION_LIMIT;
    PAGED? = 0;
    SORT_TYPE?: string | undefined = 'UPDATE_TIMESTAMP DESC';
    PERSON?: string | undefined = undefined;
    ENTITY?: string | undefined = undefined;
    EXPIRATION_DATE?: Date | string | undefined = undefined;
    CERTIFIED_AT?: Date | string | undefined = undefined;
    TRAVEL_START_DATE?: Date | string | undefined = undefined;
    TRAVEL_END_DATE?: Date | string | undefined = undefined;
    FREE_TEXT_SEARCH_FIELDS?: string | undefined = undefined;
    PROJECT_NUMBER?: number | string | undefined = undefined;
    CONFLICT_STATUS_CODE?: string | undefined = undefined;
    DISPOSITION_STATUS_CODE?: string | undefined = undefined;
    REVIEW_STATUS_CODE?: string | undefined = undefined;
    DOCUMENT_STATUS_CODE?: string | undefined = undefined;
    DISCLOSURE_CATEGORY_TYPE?: string | undefined = undefined;
    OPA_DISCLOSURE_TYPES?: string | undefined = undefined;
    COUNTRY?: string | undefined = undefined;
    ADMINISTRATOR?: string | undefined = undefined;
    PROJECT_TITLE?: string | undefined = undefined;
    TRIP_TITLE?: string | undefined = undefined;
    HOME_UNIT?: string | number | undefined = undefined;
    TAB_TITLE?: string | number | undefined = undefined;
    INCLUDE_CHILD_UNITS?: boolean | undefined = undefined;
}

export class DisclosureFetchConfig {
    uniqueId: string;
    moduleName: string;
    tabType: string | null;
    moduleCode: number | string;
    unitDisplayName: string | null;
    unitNumber: number | string | null;
    isIncludeChildUnits: boolean | null;
    personId?: string;
    personFullName?: string;
}

export class ReviewerDashboardSearchValues {
    entityName = '';
    personName = '';
    HOME_UNIT_NAME = '';
    travelCountryName = '';
}

export class PersonEligibilitySearchValues {
    personName = '';
    HOME_UNIT_NAME = '';
}

export class ReviewerDashboardSortCountObj {
    UPDATE_TIMESTAMP? = 2;
    DISCLOSURE_PERSON_FULL_NAME? = 0;
    TRAVELLER_NAME? = 0;
    TRAVEL_ENTITY_NAME? = 0;
    DEPARTMENT? = 0;
    DISCLOSURE_CATEGORY_TYPE? = 0;
    DISCLOSURE_STATUS? = 0;
    DISPOSITION_STATUS? = 0;
    REVIEW_STATUS? = 0;
    CERTIFIED_AT? = 0;
    EXPIRATION_DATE? = 0;
}

export class ReviewerDashboardSortType {
    UPDATE_TIMESTAMP?: 'DESC' | 'ASC';
    DISCLOSURE_PERSON_FULL_NAME?: 'DESC' | 'ASC';
    TRAVELLER_NAME?: 'DESC' | 'ASC';
    TRAVEL_ENTITY_NAME?: 'DESC' | 'ASC';
    DEPARTMENT?: 'DESC' | 'ASC';
    DISCLOSURE_CATEGORY_TYPE?: 'DESC' | 'ASC';
    DISCLOSURE_STATUS?: 'DESC' | 'ASC';
    DISPOSITION_STATUS?: 'DESC' | 'ASC';
    REVIEW_STATUS?: 'DESC' | 'ASC';
    CERTIFIED_AT?: 'DESC' | 'ASC';
    EXPIRATION_DATE?: 'DESC' | 'ASC';

    constructor() {
        this.UPDATE_TIMESTAMP = 'DESC';
    }
}

export interface RevDashAdminDashboardResolvedData {
    moduleConfig: ModulesConfiguration;
    lookupArrayForAdministrator: LookUpClass[];
}
export interface RevDashSortSection {
    variableName: string;
    fieldName: string;
}

export class FilterOptions {
    statusFilters: string[];
}

export class personListFetchRO {
    dashboardData = new DashboardDataForPersonList();
    isCountNeeded: false
}

export class DashboardDataForPersonList {
    PERSON?: string | undefined;
    HOME_UNIT?: string | undefined;
    TAB_TYPE = "EXEMPT";
    IS_UNLIMITED = false;
    LIMIT = PAGINATION_LIMIT;;
    PAGED = 0;
    SORT_TYPE = null;
}

export class PersonDashBoardSortType {
    PERSON_ID?: 'DESC' | 'ASC';
    PERSON_FULL_NAME?: 'DESC' | 'ASC';
    APPOINTMENT_TITLE?: 'DESC' | 'ASC';
    HOME_UNIT_NAME?: 'DESC' | 'ASC';
    HOME_UNIT?: 'DESC' | 'ASC';
    IS_FACULTY?: 'DESC' | 'ASC';
    HAS_PENDING_DISCLOSURE?: 'DESC' | 'ASC';
    UPDATE_TIMESTAMP?: 'DESC' | 'ASC';
    CAN_CREATE_OPA?: 'DESC' | 'ASC';
    CREATE_OPA_ADMIN_FORCE_ALLOWED?: 'DESC' | 'ASC';
    OPA_EXEMPTION_REASON?: 'DESC' | 'ASC';
    IS_EXEMPT_FROM_OPA?: 'DESC' | 'ASC';
    OPA_EXEMPT_FROM_DATE?: 'DESC' | 'ASC';
    OPA_EXEMPT_TO_DATE?: 'DESC' | 'ASC';
}

export class PersonDashBoardSortCountObj {
    PERSON_ID? = 0;
    PERSON_FULL_NAME? = 0;
    APPOINTMENT_TITLE? = 0;
    HOME_UNIT_NAME? = 0;
    HOME_UNIT? = 0;
    IS_FACULTY? = 0;
    HAS_PENDING_DISCLOSURE? = 0;
    UPDATE_TIMESTAMP? = 0;
    CAN_CREATE_OPA? = 0;
    CREATE_OPA_ADMIN_FORCE_ALLOWED? = 0;
    OPA_EXEMPTION_REASON? = 0;
    IS_EXEMPT_FROM_OPA? = 0;
    OPA_EXEMPT_FROM_DATE? = 0;
    OPA_EXEMPT_TO_DATE? = 0;
}

export class PersonListTabTypes {
    isDelinquent: boolean = false;
    isEligiblePerson: boolean = false;
    isExempt: boolean = false;
}

export interface PersonDetails {
    appointmentTitle: string;
    email: string;
    isFaculty: boolean;
    personFullName: string;
    personId: string;
    unitName: string;
    unitNumber: string;
    canCreateOPA: boolean;
    createOpaAdminForceAllowed: boolean;
    opaExemptionReason: any;
    opaExemptFromDate: number;
    opaExemptToDate: number;
    isExemptFromOPA: boolean;
    updateTimestamp: number;
    displayName: string;
    canEdit?: boolean;
    canView?: boolean;
}

export class PersonListDetails {
    dashboardData: PersonDetails[] = [];
    totalCount: number = 0;
}

export class PersonEligibilityForm {
    createOpaAdminForceAllowed? = false;
    canCreateOPA? = null;
    opaExemptFromDate? = null;
    opaExemptToDate? = null;
    opaExemptionReason?: string | null = null;
    isExemptFromOPA? = false;
    appointmentTitle?: string = '';
    personFullName?: string = '';
    unitName?: string = '';
    personDisclRequirementId?: number;
}

export class NotificationObject {
    subject: string;
    message: string = '';
    moduleItemKey: number;
    subModuleItemKey: number | string | null = null;
    moduleCode: number = 23;
    subModuleCode: string;
    recipients: Recipient[] = [];
    description: string;
    notifyType: string;
    notificationTypeId: string;
    personId: string;
    actionType = 'PERS_DISC_REQ_NOTIFY';
}

export class NotificationTypeRO {
    moduleCode: number = 23;
    subModuleCode: number = 0;
    showTemplateInModule = true
}

export class Recipient {
    recipientName = '';
    recipientPersonId = '';
    recipientType: RecipientGroup = 'TO';
}

export interface NotificationDetails {
    notificationLogId: number;
    notificationTypeId: number;
    moduleItemKey: string | number;
    moduleSubItemKey: string | number;
    moduleCode: number;
    subject: string;
    message: string;
    sendDate: number;
    requestedBy: string | number;
    messageId: string | number;
    actionType: string;
    notificationLogRecipients: NotificationRecipient[];
    fromUserFullName: string | number;
}

export interface NotificationRecipient {
    notificationLogRecipientId: number;
    notificationLogId: number;
    recipientEmailId: string | number;
    recipientPersonId: string | number;
    roleTypeCode: string | number;
    recipientFullName: string;
}

export interface ContactPersonDetails {
    phone_nbr: string
    directory_title: string
    email_addr: string
    unit_name: string
    prncpl_nm: string
    addr_line_1: any
    unit_number: string
    primary_title: string
    prncpl_id: string
    full_name: string
}

export interface UserPreference {
    unitDisplyName: string;
    personPreferences: UserPreferenceData[];
}

export interface UserPreferenceData {
    preferenceId: number
    personId: string
    preferencesTypeCode: string
    value: string
    updateTimestamp: number
    updateUser: string
}

// Overview Widget related Interfaces
export interface WidgetResponse {
    userSelectedWidgets: UserSelectedWidget[];
    widgetLookups: WidgetLookup[];
    userSelectedWidget: WidgetLookup | null;
    widgetDatas: Record<string, any>;
}

export interface UserSelectedWidget {
    selectedWidgetId?: number;
    widgetId?: number;
    widgetLookup?: WidgetLookup;
    sortOrder?: number;
    personId?: string;
    updateTimestamp?: number;
    updateUser?: string;
}

export interface WidgetLookup {
    widgetId?: number;
    widgetName?: string;
    description?: string;
    isActive?: boolean;
    size?: string;
    imagePath?: string | null;
    updateTimestamp?: number;
    updateUser?: string;
    dynModulesConfigCode?: string;
}

export class PreferenceRequest {
    preferenceId: number | string | null;
    personId: string | number;
    preferencesTypeCode: number;
    value: any;
    updateTimestamp: number | null = null;
    updateUser: string | null = null;

    constructor(init?: Partial<PreferenceRequest>) {
        Object.assign(this, init);
    }
}

export class SelectedUnit {
    unitNumber: string | null = null;
    displayName: string | null = null;
    isIncludeChildUnits: boolean = false;
}
