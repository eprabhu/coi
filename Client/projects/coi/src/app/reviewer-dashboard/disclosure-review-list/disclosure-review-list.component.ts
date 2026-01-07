import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SharedModule } from '../../shared/shared.module';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { listAnimation, scaleOutAnimation, slideInAnimation, topSlideInOut } from '../../common/utilities/animations';
import { calculateFilledProperties, deepCloneObject, fileDownloader, openCoiSlider, updateSearchField } from '../../common/utilities/custom-utilities';
import {
    ReviewerDashboardData, DisclosureFetchConfig, DisclosureType, FilterOptions, RevDashAdminDashboardResolvedData,
    RevDashSortSection, ReviewerDashboard, ReviewerDashboardRo, ReviewerDashboardSearchValues,
    ReviewerDashboardSortCountObj, ReviewerDashboardSortType
} from '../reviewer-dashboard.interface';
import { CommonService } from '../../common/services/common.service';
import { GlobalEventNotifier, LookUpClass } from '../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ReviewerDashboardService } from '../services/reviewer-dashboard.service';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { AdminPathType, CoiDashboardDisclosures, ContentRole } from '../../admin-dashboard/admin-dashboard.interface';
import { FormSharedModule } from '../../configuration/form-builder-create/shared/shared.module';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { NavigationService } from '../../common/services/navigation.service';
import { COI_REVIEW_COMMENTS_IDENTIFIER, FCOI_COMMENTS_RIGHTS, OPA_COMMENTS_RIGHTS, TRAVEL_COMMENTS_RIGHTS } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { CoiReviewCommentSliderService } from '../../shared-components/coi-review-comments-slider/coi-review-comment-slider.service';
import { CoiDashboardCardEvent } from '../../shared-components/coi-disclosure-dashboard-card/coi-disclosure-dashboard-card.component';
import {
    COMMON_DISCLOSURE_STATUS, COMMON_DISPOSITION_STATUS, COI_REVIEW_STATUS,
    COI_CERTIFICATION_DATE, COMMON_DISCL_LOCALIZE,
    REVIEWER_DASHBOARD_LOCALIZE,
    CONSULTING_CERTIFICATION_DATE,
    CONSULTING_REVIEW_STATUS_LABEL,
    TRAVEL_CERTIFICATION_DATE,
    TRAVEL_REVIEW_STATUS_LABEL,
    OPA_REVIEW_STATUS_LABEL,
    OPA_CERTIFICATION_DATE,
    OPA_EXPIRATION_DATE,
    ADV_SEARCH_PROJECT_NUMBER_PH,
    ADV_SEARCH_PROJECT_TITLE_PH,
    COMMON_DEPARTMENT,
    ADV_SEARCH_DEPARTMENT_PH,
} from '../../app-locales';
import {
    DISCLOSURE_TYPE, HTTP_ERROR_STATUS,
    DATE_PLACEHOLDER,
    DEFAULT_DATE_FORMAT,
    CONSULTING_DISCLOSURE_MANAGE_RIGHTS,
    CONSULTING_REVIEW_STATUS,
    MAINTAIN_DISCL_FROM_AFFILIATED_UNITS,
    TRAVEL_DISCLOSURE_MANAGE_RIGHTS,
    OPA_DISCLOSURE_RIGHTS,
    OPA_REVIEW_STATUS,
    COI_MODULE_CODE,
    OPA_MODULE_CODE,
    TRAVEL_MODULE_CODE,
    CONSULTING_MODULE_CODE,
    HTTP_SUCCESS_STATUS,
    OPA_INITIAL_VERSION_NUMBER
} from '../../app-constants';
import { getDateObjectFromTimeStamp, isValidDateFormat, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
import { getEndPointOptionsForCountry, getEndPointOptionsForLeadUnit } from '../../../../../fibi/src/app/common/services/end-point.config';
import {
    ADVANCE_SEARCH_CRITERIA_FOR_REVIEWER_DASHBOARD, REVERSE_TAB_TYPE_MAPPING_FOR_FILTER, REVIEWER_DASHBOARD_DISCLOSURE_TYPES,
    STATUS_FILTER_CONFIG_LOOKUP, TAB_TYPE_MAPPING_FOR_FILTER
} from '../reviewer-dashboard-constants';
import { AttachmentSourceSection, COICountModal, COICountModalViewSlider, EndPointOptions } from '../../shared-components/shared-interface';
import { FormsModule } from '@angular/forms';
import { EntityDetailsModule } from '../../disclosure/entity-details/entity-details.module';
import { REVIEWER_DASH_NO_INFO_MESSAGE } from '../../no-info-message-constants';
import { TRAVEL_DISCL_REVIEW_STATUS_TYPE } from '../../travel-disclosure/travel-disclosure-constants';

@Component({
    selector: 'app-disclosure-review-list',
    templateUrl: './disclosure-review-list.component.html',
    styleUrls: ['./disclosure-review-list.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, FormsModule, EntityDetailsModule],
    animations: [listAnimation, topSlideInOut,
        slideInAnimation('0', '12px', 400, 'slideUp'),
        slideInAnimation('0', '-12px', 400, 'slideDown'),
        scaleOutAnimation('-2px', '0', 200, 'scaleOut'),
    ]
})
export class DisclosureReviewListComponent implements OnInit, OnDestroy {

    @ViewChild('certificationDateInput', { static: false }) certificationDateInput?: ElementRef;
    @ViewChild('expirationDateInput', { static: false }) expirationDateInput?: ElementRef;
    @ViewChild('travelStartDateInput', { static: false }) travelStartDateInput?: ElementRef;
    @ViewChild('travelEndDateInput', { static: false }) travelEndDateInput?: ElementRef;
    @ViewChild('dropdownToggle') dropdownToggle!: ElementRef;

    sortSectionsList: RevDashSortSection[];
    disclosureSortSections = [
        { variableName: 'DISCLOSURE_PERSON_FULL_NAME', fieldName: 'Person' },
        { variableName: 'DISCLOSURE_CATEGORY_TYPE', fieldName: 'Disclosure Type' },
        { variableName: 'DISCLOSURE_STATUS', fieldName: COMMON_DISCLOSURE_STATUS },
        { variableName: 'DISPOSITION_STATUS', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'REVIEW_STATUS', fieldName: COI_REVIEW_STATUS },
        { variableName: 'CERTIFIED_AT', fieldName: COI_CERTIFICATION_DATE },
        { variableName: 'EXPIRATION_DATE', fieldName: 'Expiration Date' },
        { variableName: 'UPDATE_TIMESTAMP', fieldName: 'Last Updated' },
    ];
    travelDisclosureSortSections = [
        { variableName: 'TRAVELLER_NAME', fieldName: 'Person' },
        { variableName: 'TRAVEL_ENTITY_NAME', fieldName: 'Entity' },
        { variableName: 'DISPOSITION_STATUS', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'REVIEW_STATUS', fieldName: TRAVEL_REVIEW_STATUS_LABEL },
        { variableName: 'CERTIFIED_AT', fieldName: TRAVEL_CERTIFICATION_DATE },
        { variableName: 'UPDATE_TIMESTAMP', fieldName: 'Last Updated' },
    ];
    consultingFormSortSection = [
        { variableName: 'DISCLOSURE_PERSON_FULL_NAME', fieldName: 'Person' },
        { variableName: 'ENTITY', fieldName: 'Entity' },
        { variableName: 'DISPOSITION_STATUS', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'REVIEW_STATUS', fieldName: CONSULTING_REVIEW_STATUS_LABEL },
        { variableName: 'CERTIFIED_AT', fieldName: CONSULTING_CERTIFICATION_DATE },
        { variableName: 'UPDATE_TIMESTAMP', fieldName: 'Last Updated' },
    ];
    opaFormSortSection = [
        { variableName: 'DISCLOSURE_PERSON_FULL_NAME', fieldName: 'Person' },
        { variableName: 'DISPOSITION_STATUS', fieldName: COMMON_DISPOSITION_STATUS },
        { variableName: 'UNIT_NAME', fieldName: COMMON_DEPARTMENT },
        { variableName: 'REVIEW_STATUS', fieldName: OPA_REVIEW_STATUS_LABEL },
        { variableName: 'CERTIFIED_AT', fieldName: OPA_CERTIFICATION_DATE },
        { variableName: 'UPDATE_TIMESTAMP', fieldName: 'Last Updated' },
    ];
    disclosureStatusOptions = 'COI_CONFLICT_STATUS_TYPE#CONFLICT_STATUS_CODE#true#true';
    coiDisPositionOptions = 'COI_DISPOSITION_STATUS_TYPE#DISPOSITION_STATUS_CODE#true#true';
    opaDispositionStatusOption = 'OPA_DISPOSITION_STATUS_TYPE#DISPOSITION_STATUS_CODE#true#true';
    coiReviewStatusOptions = 'COI_REVIEW_STATUS_TYPE#REVIEW_STATUS_CODE#true#true';
    travelReviewStatusOptions = 'coi_travel_review_status#REVIEW_STATUS_CODE#true#true';
    opaReviewStatusOptions = 'OPA_REVIEW_STATUS_TYPE#REVIEW_STATUS_CODE#true#true';
    disclosureTypeOptionsForFCOI = 'COI_DISCLOSURE_FCOI_TYPE#FCOI_TYPE_CODE#true#true';
    disclosureTypeOptionsForOPA = 'EMPTY#EMPTY#true#true#true#true';
    reviewerDashAdministratorOptions = 'EMPTY#EMPTY#true#true';
    travelDocumentStatusOptions = 'coi_travel_document_status_type#DOCUMENT_STATUS_CODE#true#true';
    $fetchReviewerDashboard = new Subject<{ isCountNeeded: boolean }>();
    $subscriptions: Subscription[] = [];
    reviewerDashboardList = new ReviewerDashboard();
    isLoading = false;
    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    disclosureReviewStatDetails: DisclosureFetchConfig;
    advSearchProjectNumberPH = ADV_SEARCH_PROJECT_NUMBER_PH;
    advSearchProjectTitlePH = ADV_SEARCH_PROJECT_TITLE_PH;
    advSearchDepartmentPlaceholder = ADV_SEARCH_DEPARTMENT_PH;
    advSearchClearField: string;
    elasticPersonSearchOptions: EndPointOptions = {};
    entitySearchOptions: EndPointOptions = {};
    leadUnitSearchOptions: EndPointOptions = {};
    entityNameClearField: string;
    dateValidationMap = new Map();
    datePlaceHolder = DATE_PLACEHOLDER;
    disclosureType: DisclosureType;
    REVIEWER_DASHBOARD_DISCLOSURE_TYPE = REVIEWER_DASHBOARD_DISCLOSURE_TYPES;
    isShowDisclosureList = false;
    reviewerDashboardLocalRo = new ReviewerDashboardRo();
    isShowAdvanceSearch = false;
    dashboardTempSearchValues = new ReviewerDashboardSearchValues();
    selectedLookUpList: any[] = [];
    reviewerLocalize = REVIEWER_DASHBOARD_LOCALIZE;
    localizedTexts: any = {};
    lookupArrayForAdministrator: LookUpClass[] = [];
    lookupArrayForDisclosureTypeForOPA: LookUpClass[] = [];
    countryClearField: string;
    countrySearchOptions: any = {};
    advancedSearchCriteriaCount = 0;
    coiCountModal = new COICountModal();
    lastOpenedCountModalData = new COICountModal();
    hasReviewerRight = false;
    filterOptions = new FilterOptions();
    selectedFilterCount = 0;
    dashboardTotalCount = 0;
    statusFilters: LookUpClass[] = [];
    selectedStatusCodes: { [key: string]: boolean } = {};
    selectedFilterFields = '';
    noDataMessage = REVIEWER_DASH_NO_INFO_MESSAGE;
    reviewStatusOptions = '';
    isAssignAdminModalOpen = false;
    disclosureDetailsForAssignAdmin: any = {};
    assignAdminPath: AdminPathType = 'DISCLOSURES';
    isAllSelected = false;
    private advanceSearchTimeOut: ReturnType<typeof setTimeout>;
    private isDepartmentSelected = false;
    private isPersonSelected = false;
    private isDropdownOpen = false;
    private initialSelectedStatusCodes: { [key: string]: boolean } = {};
    private selectedPersonId: string | number | null = null;
    private isPersonExplicitlyCleared = false;

    // Update on window resize
    @HostListener('window:resize')
    onWindowResize(): void {
        this.setAdvSearchTopDynamic();
    }

    // Update on window scroll
    @HostListener('window:scroll')
    onWindowScroll() {
        this.setAdvSearchTopDynamic();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.isDropdownOpen) return;
        const CLICKED_INSIDE = this.isClickInsideDropdown(event);
        if (this.isDropdownOpen && !CLICKED_INSIDE) {
            this.closeDropdownAndApplyFilter();
        }
    }

    constructor(public reviewerDashboardService: ReviewerDashboardService, private _router: Router,
        public commonService: CommonService, private _coiReviewCommentSliderService: CoiReviewCommentSliderService,
        private _elasticConfig: ElasticConfigService, private _navigationService: NavigationService,
        private _informationAndHelpTextService: InformationAndHelpTextService, private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        const STORED_REVIEW_STAT = sessionStorage.getItem('disclosureFetchConfig');
        this.disclosureReviewStatDetails = STORED_REVIEW_STAT ? JSON.parse(STORED_REVIEW_STAT) : new DisclosureFetchConfig();
        this.disclosureType = this.getDisclosureType(this.disclosureReviewStatDetails);
        this.sortSectionsList = this.setDisclosureSortList();
        this.setAdvSearchTopDynamic();
        this.setAssignAdminPath();
        this.setLookupOptions();
        this.initializeStatusFilters();
        this.initializeDefaultFilters();
        !this.hasStoredStatusFilters() && this.setInitialFilterFromTabType();
        this.updateFilterCount();
        this.getPermissions();
        this.initializeLocalizedTexts();
        this.setDashboardConfigFromSnapshot();
        this.setSearchOptions();
        this.listenFetchReviewerDashboard();
        this.listenGlobalEventNotifier();
        this.setAdvancedSearch();
        this.$fetchReviewerDashboard.next({ isCountNeeded: true });
    }

    ngOnDestroy(): void {
        clearTimeout(this.advanceSearchTimeOut);
        subscriptionHandler(this.$subscriptions);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                    if (['CLOSE_REVIEW_SLIDER', 'API_FAILED_ON_INITIAL_LOAD'].includes(event?.content?.action)) {
                        this.$fetchReviewerDashboard.next({ isCountNeeded: false });
                        this.commonService.clearReviewCommentsSlider();
                    }
                }
            })
        );
    }

    private setDashboardConfigFromSnapshot(): void {
        const RESOLVED_DATA: RevDashAdminDashboardResolvedData = this._activatedRoute.snapshot.data.resolvedData;
        this._informationAndHelpTextService.moduleConfiguration = this.commonService.getSectionCodeAsKeys(RESOLVED_DATA?.moduleConfig);
        this.lookupArrayForAdministrator = RESOLVED_DATA?.lookupArrayForAdministrator;
    }

    private getPermissions(): void {
        this.hasReviewerRight = this.disclosureType === 'FCOI' ? this.commonService.isCoiReviewer : this.commonService.isOPAReviewer;
    }

    private setDisclosureSortList(): RevDashSortSection[] {
        switch (this.disclosureType) {
            case 'TRAVEL':
                return this.travelDisclosureSortSections;
            case 'CONSULTING':
                return this.consultingFormSortSection;
            case 'OPA':
                return this.opaFormSortSection;
            case 'FCOI':
            default:
                return this.disclosureSortSections;
        }
    }

    private initializeLocalizedTexts() {
        const TAB_NAME = this.disclosureType;
        this.localizedTexts = {
            reviewStatus: {
                label: this.getLocalizedText('reviewStatus', 'label', TAB_NAME),
                title: this.getLocalizedText('reviewStatus', 'title', TAB_NAME),
                'aria-label': this.getLocalizedText('reviewStatus', 'aria-label', TAB_NAME)
            },
            certificationDate: {
                label: this.getLocalizedText('certificationDate', 'label', TAB_NAME),
                title: this.getLocalizedText('certificationDate', 'title', TAB_NAME),
                'aria-label': this.getLocalizedText('certificationDate', 'aria-label', TAB_NAME)
            },
            expirationDate: {
                label: this.getLocalizedText('expirationDate', 'label', TAB_NAME),
                title: this.getLocalizedText('expirationDate', 'title', TAB_NAME),
                'aria-label': this.getLocalizedText('expirationDate', 'aria-label', TAB_NAME)
            }
        };
    }

    private getLocalizedText(field: string, contentRole: ContentRole, tabName: string): string {
        switch (field) {
            case 'reviewStatus':
                return this.getReviewStatusText(contentRole, tabName);
            case 'certificationDate':
                return this.getCertificationDateText(contentRole, tabName);
            case 'expirationDate':
                return this.getExpirationDateText(contentRole, tabName);
            default:
                return '';
        }
    }

    private getReviewStatusText(contentRole: ContentRole, tabName: string): string {
        const configs = {
            TRAVEL: this.createReviewStatusConfig(TRAVEL_REVIEW_STATUS_LABEL),
            CONSULTING: this.createReviewStatusConfig(CONSULTING_REVIEW_STATUS_LABEL),
            OPA: this.createReviewStatusConfig(OPA_REVIEW_STATUS_LABEL),
            default: this.createReviewStatusConfig(COI_REVIEW_STATUS)
        };
        return this.getTextFromConfig(configs, contentRole, tabName);
    }

    private getCertificationDateText(contentRole: ContentRole, tabName: string): string {
        const configs = {
            TRAVEL: this.createCertificationDateConfig(TRAVEL_CERTIFICATION_DATE),
            CONSULTING: this.createCertificationDateConfig(CONSULTING_CERTIFICATION_DATE),
            OPA: this.createCertificationDateConfig(OPA_CERTIFICATION_DATE),
            default: this.createCertificationDateConfig(COI_CERTIFICATION_DATE)
        };
        return this.getTextFromConfig(configs, contentRole, tabName);
    }

    private getExpirationDateText(contentRole: ContentRole, tabName: string): string {
        const configs = {
            OPA: this.createExpirationDateConfig(OPA_EXPIRATION_DATE),
            default: this.createExpirationDateConfig(COMMON_DISCL_LOCALIZE.COI_EXPIRATION_DATE)
        };
        return this.getTextFromConfig(configs, contentRole, tabName);
    }

    private createReviewStatusConfig(label: string) {
        const TITLE_PREFIX = 'Click here to search by ';
        const ARIA_LABEL_SUFFIX = ' dropdown';
        return {
            label: label,
            title: TITLE_PREFIX + label,
            'aria-label': label + ARIA_LABEL_SUFFIX
        };
    }

    private createCertificationDateConfig(label: string) {
        const TITLE_PREFIX = 'Click here to search by ';
        return {
            label: label,
            title: TITLE_PREFIX + label,
            'aria-label': label
        };
    }

    private createExpirationDateConfig(label: string) {
        const TITLE_PREFIX = 'Click here to search by ';
        return {
            label: label,
            title: TITLE_PREFIX + label,
            'aria-label': label
        };
    }

    private getTextFromConfig(configs: any, contentRole: ContentRole, tabName: string): string {
        return configs[tabName]?.[contentRole]
            || configs.default?.[contentRole]
            || '';
    }

    private getDisclosureType(disclosureReviewStatDetails: any): DisclosureType {
        const MODULE_CODE = disclosureReviewStatDetails?.moduleCode;
        switch (MODULE_CODE) {
            case COI_MODULE_CODE:
                return 'FCOI';
            case OPA_MODULE_CODE:
                return 'OPA';
            case TRAVEL_MODULE_CODE:
                return 'TRAVEL';
            case CONSULTING_MODULE_CODE:
                return 'CONSULTING';
            default:
                return disclosureReviewStatDetails?.disclosureType || '';
        }
    }

    private listenFetchReviewerDashboard(): void {
        this.$subscriptions.push(
            this.$fetchReviewerDashboard.pipe(
                switchMap((params: { isCountNeeded: boolean }) => {
                    this.isLoading = true;
                    this.dateValidationMap = new Map();
                    this.isShowAdvanceSearch = false;
                    this.clearSelectAllDisclosure();
                    return this.reviewerDashboardService.getCOIReviewerDashboard(this.getRequestObject(params.isCountNeeded)).pipe(
                        map(data => ({ data, isCountNeeded: params.isCountNeeded })),
                        catchError((error) => {
                            this.commonService.showToast(HTTP_ERROR_STATUS, `Failed to fetch reviewer dashboard. Please try again.`);
                            return of({ data: null, isCountNeeded: false });
                        })
                    );
                })).subscribe(({ data, isCountNeeded }: { data: ReviewerDashboard, isCountNeeded: boolean }) => {
                    if (data?.dashboardData) {
                        this.reviewerDashboardList = data;
                        this.reviewerDashboardList.dashboardData.forEach(ele => {
                            if (ele) {
                                const CARD_TYPE = this.getCardType(ele);
                                ele.projectHeader = ele.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT ? (`#${ele.projectNumber} - ${ele.projectTitle}`) : '';
                                ele.isShowCommentBtn = this.getCommentBtnVisibility(ele);
                                ele.isShowAssignAdminBtn = this.showAssignAdminButton(ele, CARD_TYPE);
                                ele.cardType = CARD_TYPE;
                            }
                        });
                    }
                    isCountNeeded && (this.dashboardTotalCount = data?.totalCount || 0);
                    this.isLoading = false;
                    this.reviewerDashboardService.isDisclosureListInitialLoad = false;
                    this.isShowDisclosureList = true;
                }
                )
        );
    }

    private getRequestObject(isCountNeeded: boolean): ReviewerDashboardRo {
        this.reviewerDashboardLocalRo.moduleCode = this.disclosureReviewStatDetails?.moduleCode;
        this.reviewerDashboardLocalRo.dashboardData.MODULE_CODE = this.disclosureReviewStatDetails?.moduleCode;
        if (!this.isDepartmentSelected) {
            this.reviewerDashboardLocalRo.dashboardData.HOME_UNIT = this.disclosureReviewStatDetails?.unitNumber || undefined;
        }
        if (!this.isPersonSelected && !this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData.PERSON && !this.isPersonExplicitlyCleared) {
            this.reviewerDashboardLocalRo.dashboardData.PERSON = this.disclosureReviewStatDetails?.personId || undefined;
        }
        this.reviewerDashboardLocalRo.dashboardData.INCLUDE_CHILD_UNITS = this.disclosureReviewStatDetails?.isIncludeChildUnits || undefined;
        const SELECTED_TAB_TYPES = this.convertStatusCodesToTabTypes(this.filterOptions.statusFilters);
        this.reviewerDashboardLocalRo.dashboardData.TAB_TYPE = SELECTED_TAB_TYPES?.length > 0
            ? SELECTED_TAB_TYPES.join(',') : '';
        this.reviewerDashboardLocalRo.isCountNeeded = isCountNeeded;
        this.reviewerDashboardLocalRo.dashboardData.TAB_TITLE = this.selectedFilterFields;
        this.reviewerDashboardService.reviewerDashboardServiceRo = this.reviewerDashboardLocalRo;
        return this.reviewerDashboardService.reviewerDashboardServiceRo;
    }

    private getCardType(coi: any): string {
        switch (true) {
            case !!coi?.coiDisclosureId:
                return 'FCOI';
            case !!coi?.opaDisclosureId:
                return 'OPA';
            case !!coi?.travelDisclosureId:
                return 'TRAVEL';
            default:
                return 'FCOI';
        }
    }

    private clearSelectAllDisclosure(): void {
        this.reviewerDashboardList.dashboardData = [];
    }

    private getCommentBtnVisibility(disclosureDetails: CoiDashboardDisclosures): boolean {
        if (this.hasReviewerRight) return true;
        switch (this.disclosureType) {
            case 'CONSULTING':
                return false;
            case 'FCOI':
                return this.commonService.getAvailableRight(FCOI_COMMENTS_RIGHTS) || this.commonService.isCoiReviewer;
            case 'OPA':
                return this.commonService.getAvailableRight(OPA_COMMENTS_RIGHTS) || this.commonService.isOPAReviewer;
            case 'TRAVEL':
                return this.commonService.getAvailableRight(TRAVEL_COMMENTS_RIGHTS);
            default:
                return false;
        }
    }

    private setAdvSearchTopDynamic(): void {
        const MAIN_HEADER = document.getElementById('reviewer-dashboard-header');
        const ADVANCE_SEARCH_SECTION = document.getElementById('rev-dash-advance-search');
        if (MAIN_HEADER && ADVANCE_SEARCH_SECTION) {
            const HEADER_HEIGHT = MAIN_HEADER.offsetHeight;
            const FINAL_TOP = 51 + HEADER_HEIGHT;
            ADVANCE_SEARCH_SECTION.style.top = `${FINAL_TOP}px`;
        }
    }

    private setSearchOptionsFromCache(): void {
        this.dashboardTempSearchValues = this.reviewerDashboardService.dashboardSearchValues;
        this.elasticPersonSearchOptions.defaultValue = this.reviewerDashboardService.isDisclosureListInitialLoad ? this.disclosureReviewStatDetails.personFullName : this.dashboardTempSearchValues.personName || '';
        this.entitySearchOptions.defaultValue = this.dashboardTempSearchValues.entityName || '';
        this.countrySearchOptions.defaultValue = this.dashboardTempSearchValues.travelCountryName || '';
        this.leadUnitSearchOptions.defaultValue = this.dashboardTempSearchValues.HOME_UNIT_NAME || '';
    }

    private setSearchOptions(): void {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveEntity();
        this.countrySearchOptions = getEndPointOptionsForCountry(this.commonService.fibiUrl);
        this.leadUnitSearchOptions = getEndPointOptionsForLeadUnit('', this.commonService.fibiUrl);
    }

    private fetchDisclosureList(): void {
        this.cacheSearchCriteria();
        this.cacheSortCriteria();
        if (this.reviewerDashboardLocalRo.dashboardData.TRAVEL_START_DATE && this.reviewerDashboardLocalRo.dashboardData.TRAVEL_END_DATE) {
            this.advancedSearchCriteriaCount = this.advancedSearchCriteriaCount - 1;
        }
        this.$fetchReviewerDashboard.next({ isCountNeeded: true });
    }

    private cacheSearchCriteria(): void {
        this.reviewerDashboardService.dashboardSearchValues = this.dashboardTempSearchValues;
        const REVIEWER_DASHBOARD_LOCAL_RO = this.reviewerDashboardLocalRo.dashboardData;
        const REVIEWER_DASHBOARD_SERVICE_RO = this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData
        REVIEWER_DASHBOARD_SERVICE_RO.TAB_TYPE = REVIEWER_DASHBOARD_LOCAL_RO.TAB_TYPE || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.PERSON = REVIEWER_DASHBOARD_LOCAL_RO.PERSON ? REVIEWER_DASHBOARD_LOCAL_RO.PERSON :
            (this.reviewerDashboardService.isDisclosureListInitialLoad && !this.isPersonExplicitlyCleared ? this.disclosureReviewStatDetails?.personId : undefined);
        REVIEWER_DASHBOARD_SERVICE_RO.ENTITY = REVIEWER_DASHBOARD_LOCAL_RO.ENTITY || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.CONFLICT_STATUS_CODE = REVIEWER_DASHBOARD_LOCAL_RO.CONFLICT_STATUS_CODE || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.DISPOSITION_STATUS_CODE = REVIEWER_DASHBOARD_LOCAL_RO.DISPOSITION_STATUS_CODE || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.REVIEW_STATUS_CODE = REVIEWER_DASHBOARD_LOCAL_RO.REVIEW_STATUS_CODE || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.CERTIFIED_AT = parseDateWithoutTimestamp(REVIEWER_DASHBOARD_LOCAL_RO.CERTIFIED_AT) || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.EXPIRATION_DATE = parseDateWithoutTimestamp(REVIEWER_DASHBOARD_LOCAL_RO.EXPIRATION_DATE) || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.DISCLOSURE_CATEGORY_TYPE = REVIEWER_DASHBOARD_LOCAL_RO.DISCLOSURE_CATEGORY_TYPE || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.OPA_DISCLOSURE_TYPES = REVIEWER_DASHBOARD_LOCAL_RO.OPA_DISCLOSURE_TYPES || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.ADMINISTRATOR = REVIEWER_DASHBOARD_LOCAL_RO.ADMINISTRATOR || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.PROJECT_NUMBER = REVIEWER_DASHBOARD_LOCAL_RO.PROJECT_NUMBER || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.PROJECT_TITLE = REVIEWER_DASHBOARD_LOCAL_RO.PROJECT_TITLE || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.TRAVEL_START_DATE = parseDateWithoutTimestamp(REVIEWER_DASHBOARD_LOCAL_RO.TRAVEL_START_DATE) || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.TRAVEL_END_DATE = parseDateWithoutTimestamp(REVIEWER_DASHBOARD_LOCAL_RO.TRAVEL_END_DATE) || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.DOCUMENT_STATUS_CODE = REVIEWER_DASHBOARD_LOCAL_RO.DOCUMENT_STATUS_CODE || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.COUNTRY = REVIEWER_DASHBOARD_LOCAL_RO.COUNTRY || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.HOME_UNIT = this.isDepartmentSelected ? REVIEWER_DASHBOARD_LOCAL_RO.HOME_UNIT : this.disclosureReviewStatDetails?.unitNumber || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.TRIP_TITLE = REVIEWER_DASHBOARD_LOCAL_RO.TRIP_TITLE || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.FREE_TEXT_SEARCH_FIELDS = REVIEWER_DASHBOARD_LOCAL_RO.FREE_TEXT_SEARCH_FIELDS || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.PAGED = REVIEWER_DASHBOARD_LOCAL_RO.PAGED;
        const FILTERED_PROPERTIES = this.setSearchCriteria();
        this.advancedSearchCriteriaCount = calculateFilledProperties(REVIEWER_DASHBOARD_LOCAL_RO, FILTERED_PROPERTIES);
    }

    private setTempFromCache(): void {
        const CACHED_DATA = this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData;
        const REVIEWER_DASHBOARD_LOCAL_RO = this.reviewerDashboardLocalRo.dashboardData;
        REVIEWER_DASHBOARD_LOCAL_RO.TAB_TYPE = CACHED_DATA.TAB_TYPE || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.PERSON = CACHED_DATA.PERSON || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.ENTITY = CACHED_DATA.ENTITY || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.CONFLICT_STATUS_CODE = CACHED_DATA.CONFLICT_STATUS_CODE || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.DISPOSITION_STATUS_CODE = CACHED_DATA.DISPOSITION_STATUS_CODE || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.REVIEW_STATUS_CODE = CACHED_DATA.REVIEW_STATUS_CODE || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.CERTIFIED_AT = getDateObjectFromTimeStamp(CACHED_DATA.CERTIFIED_AT) || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.EXPIRATION_DATE = getDateObjectFromTimeStamp(CACHED_DATA.EXPIRATION_DATE) || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.DISCLOSURE_CATEGORY_TYPE = CACHED_DATA.DISCLOSURE_CATEGORY_TYPE || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.OPA_DISCLOSURE_TYPES = CACHED_DATA.OPA_DISCLOSURE_TYPES || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.ADMINISTRATOR = CACHED_DATA.ADMINISTRATOR || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.PROJECT_NUMBER = CACHED_DATA.PROJECT_NUMBER || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.PROJECT_TITLE = CACHED_DATA.PROJECT_TITLE || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.TRAVEL_START_DATE = getDateObjectFromTimeStamp(CACHED_DATA.TRAVEL_START_DATE) || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.TRAVEL_END_DATE = getDateObjectFromTimeStamp(CACHED_DATA.TRAVEL_END_DATE) || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.DOCUMENT_STATUS_CODE = CACHED_DATA.DOCUMENT_STATUS_CODE || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.COUNTRY = CACHED_DATA.COUNTRY || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.HOME_UNIT = CACHED_DATA.HOME_UNIT || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.TRIP_TITLE = CACHED_DATA.TRIP_TITLE || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.FREE_TEXT_SEARCH_FIELDS = CACHED_DATA.FREE_TEXT_SEARCH_FIELDS || undefined;
        REVIEWER_DASHBOARD_LOCAL_RO.PAGED = CACHED_DATA.PAGED;
        this.setSearchOptionsFromCache();
        this.generateSelectedLookupFromCache();
        this.isDepartmentSelected = !!this.leadUnitSearchOptions.defaultValue;
        this.isPersonSelected = !!this.reviewerDashboardLocalRo.dashboardData.PERSON;
        const FILTERED_PROPERTIES = this.setSearchCriteria();
        this.advancedSearchCriteriaCount = calculateFilledProperties(REVIEWER_DASHBOARD_LOCAL_RO, FILTERED_PROPERTIES);
    }

    private setSearchCriteria(): string[] {
        let filteredProperties = [...ADVANCE_SEARCH_CRITERIA_FOR_REVIEWER_DASHBOARD];
        if (!this.isDepartmentSelected) {
            filteredProperties = filteredProperties.filter(prop => prop !== 'HOME_UNIT');
        }
        return filteredProperties;
    }

    private generateSelectedLookupFromCache(): void {
        const LOOKUP_KEYS = ['CONFLICT_STATUS_CODE', 'DISPOSITION_STATUS_CODE', 'REVIEW_STATUS_CODE',
            'DOCUMENT_STATUS_CODE', 'DISCLOSURE_CATEGORY_TYPE', 'ADMINISTRATOR', 'OPA_DISCLOSURE_TYPES'
        ] as const;
        for (const KEY of LOOKUP_KEYS) {
            const VALUE = this.reviewerDashboardLocalRo.dashboardData[KEY];
            if (VALUE) {
                this.generateLookupArray(VALUE, KEY);
            }
        }
    }

    private generateLookupArray(list: string, key: (keyof ReviewerDashboardData)): void {
        this.selectedLookUpList[key] = [];
        list.split(',').forEach(element => {
            this.selectedLookUpList[key].push({ code: element });
        });
    }

    /**
     * Caches the current sort configuration.
     * - If no sort keys are present, removes SORT_TYPE from the dashboardRO.
     * - Otherwise, converts the sort object to a comma-separated string and stores it in SORT_TYPE.
     */
    private cacheSortCriteria(): void {
        const SORT_TYPE_OBJECT = this.reviewerDashboardService.sortType;
        if (!Object.keys(SORT_TYPE_OBJECT)?.length) {
            delete this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData.SORT_TYPE;
        } else {
            const KEY_VALUE_PAIRS = Object.entries(SORT_TYPE_OBJECT)
                .map(([key, value]) => `${key} ${value}`)
                .join(',');
            this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData.SORT_TYPE = KEY_VALUE_PAIRS;
        }
    }

    /**
         * Updates the FREE_TEXT_SEARCH_FIELDS in dashboardTempRO based on the field key and its presence.
         */
    private updateFreeTextSearchField(key: string, isPresent: boolean): void {
        const DATA = this.reviewerDashboardLocalRo.dashboardData.FREE_TEXT_SEARCH_FIELDS?.split(',') || [];
        updateSearchField(DATA, key, isPresent);
        this.reviewerDashboardLocalRo.dashboardData.FREE_TEXT_SEARCH_FIELDS = DATA.join(',');
    }

    private validateTravelDateRange(): void {
        const TRAVEL_START_DATE: string = this.travelStartDateInput?.nativeElement.value?.trim() || '';
        const TRAVEL_END_DATE: string = this.travelEndDateInput?.nativeElement.value?.trim() || '';
        if (TRAVEL_START_DATE && TRAVEL_END_DATE) {
            const START_DATE = parseDateWithoutTimestamp(TRAVEL_START_DATE);
            const END_DATE = parseDateWithoutTimestamp(TRAVEL_END_DATE);
            if (START_DATE && END_DATE && START_DATE > END_DATE) {
                this.dateValidationMap.set('TRAVEL_DATE', 'Please select an end date after start date.');
            }
        }
    }

    private isDateFormatValid(dateString: string | null | undefined): boolean {
        if (!dateString) {
            return true;
        }
        return isValidDateFormat({ _i: dateString });
    }

    private setAdvancedSearch(): void {
        const CURRENT_TAB_TYPE = this.disclosureReviewStatDetails.tabType;
        const IS_NAVIGATED_FROM_REVIEWER_DASHBOARD = this.checkForPreviousURL();
        if (IS_NAVIGATED_FROM_REVIEWER_DASHBOARD && CURRENT_TAB_TYPE) {
            this.setTabType(CURRENT_TAB_TYPE);
        } else {
            this.reviewerDashboardService.isAdvanceSearchMade = false;
            this.reviewerDashboardService.isShowAdvanceSearchBox = true;
            this.reviewerDashboardService.sortCountObject = new ReviewerDashboardSortCountObj();
            this.reviewerDashboardService.sortType = new ReviewerDashboardSortType();
            this.reviewerDashboardService.reviewerDashboardServiceRo = new ReviewerDashboardRo();
            this.reviewerDashboardService.dashboardSearchValues = new ReviewerDashboardSearchValues();
            this.setTabType(CURRENT_TAB_TYPE);
        }
        this.setTempFromCache();
        this.setInitialPersonSearchValues();
    }

    private setInitialPersonSearchValues(): void {
        if (this.reviewerDashboardService.isDisclosureListInitialLoad && this.disclosureReviewStatDetails?.personId && !this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData.PERSON) {
            this.elasticPersonSearchOptions.defaultValue = this.disclosureReviewStatDetails.personFullName;
            this.reviewerDashboardLocalRo.dashboardData.PERSON = this.disclosureReviewStatDetails.personId;
            this.dashboardTempSearchValues.personName = this.disclosureReviewStatDetails.personFullName;
            this.updateFreeTextSearchField('PERSON', true);
            const FILTERED_PROPERTIES = this.setSearchCriteria();
            this.advancedSearchCriteriaCount = calculateFilledProperties(this.reviewerDashboardLocalRo.dashboardData, FILTERED_PROPERTIES);
        }
    }

    private resetAdvancedSearch(): void {
        this.setSearchOptions();
        this.selectedLookUpList = [];
        this.dateValidationMap = new Map();
        this.advancedSearchCriteriaCount = 0;
        this.reviewerDashboardService.isAdvanceSearchMade = false;
        this.reviewerDashboardLocalRo = new ReviewerDashboardRo();
        this.reviewerDashboardList.dashboardData = [];
        this.reviewerDashboardService.sortCountObject = new ReviewerDashboardSortCountObj();
        this.reviewerDashboardService.sortType = new ReviewerDashboardSortType();
        this.reviewerDashboardService.reviewerDashboardServiceRo = new ReviewerDashboardRo();
        this.dashboardTempSearchValues = new ReviewerDashboardSearchValues();
        this.reviewerDashboardService.dashboardSearchValues = new ReviewerDashboardSearchValues();
        this.isDepartmentSelected = false;
        this.isPersonSelected = false;
        if (this.getInputValue(this.certificationDateInput)) {
            this.certificationDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.expirationDateInput)) {
            this.expirationDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.travelStartDateInput)) {
            this.travelStartDateInput.nativeElement.value = '';
        }
        if (this.getInputValue(this.travelEndDateInput)) {
            this.travelEndDateInput.nativeElement.value = '';
        }
        this.setTabType(this.disclosureReviewStatDetails.tabType);
        this.setAdvanceSearchVisibility();
    }

    private getInputValue(inputRef?: ElementRef): string {
        return inputRef?.nativeElement?.value?.trim() || '';
    }

    private setAdvanceSearchVisibility(): void {
        this.isShowDisclosureList = true;
        this.isShowAdvanceSearch = false;
        this.reviewerDashboardService.isShowAdvanceSearchBox = false;
    }

    private setTabType(tabType: string): void {
        this.reviewerDashboardLocalRo.dashboardData.TAB_TYPE = tabType;
        this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData.TAB_TYPE = tabType;
    }

    private sortAdminDashboardTabs(sortFieldBy: string): void {
        if (this.reviewerDashboardService.sortCountObject[sortFieldBy] < 3) {
            this.reviewerDashboardService.sortType[sortFieldBy] = !this.reviewerDashboardService.sortType[sortFieldBy] ? 'ASC' : 'DESC';
        } else {
            this.reviewerDashboardService.sortCountObject[sortFieldBy] = 0;
            delete this.reviewerDashboardService.sortType[sortFieldBy];
        }
        this.fetchDisclosureList();
    }

    private getManageDisclosureRight(fcoiTypeCode: string): boolean {
        const IS_FCOI_ADMINISTRATOR = this.commonService.getAvailableRight('MANAGE_FCOI_DISCLOSURE');
        const IS_PROJECT_ADMINISTRATOR = this.commonService.getAvailableRight('MANAGE_PROJECT_DISCLOSURE');
        switch (fcoiTypeCode) {
            case DISCLOSURE_TYPE.INITIAL:
            case DISCLOSURE_TYPE.REVISION:
                return IS_FCOI_ADMINISTRATOR;
            case DISCLOSURE_TYPE.PROJECT:
                return IS_PROJECT_ADMINISTRATOR;
            default:
                return;
        }
    }

    private handleCountModal(event: CoiDashboardCardEvent): void {
        const { disclosureDetails, content } = event;
        if (content?.count > 0) {
            this.openCountModal(
                disclosureDetails,
                content.count,
                content.moduleCode,
                content.inputType
            );
        }
    }

    private openCountModal(disclosureDetails: CoiDashboardDisclosures, count: number | null = null, moduleCode: number = 0, inputType: AttachmentSourceSection = 'DISCLOSURE_TAB'): void {
        if (count > 0) {
            this.coiCountModal = {
                personUnit: disclosureDetails?.unit,
                moduleCode: moduleCode,
                personId: disclosureDetails?.personId,
                disclosureType: moduleCode === OPA_MODULE_CODE ? (disclosureDetails?.versionNumber === OPA_INITIAL_VERSION_NUMBER ? 'Initial' : 'Revision')
                    : (disclosureDetails?.fcoiTypeCode === DISCLOSURE_TYPE.PROJECT ? disclosureDetails?.projectType : disclosureDetails?.fcoiType),
                inputType: inputType,
                fcoiTypeCode: disclosureDetails?.fcoiTypeCode,
                disclosureId: moduleCode === OPA_MODULE_CODE ? disclosureDetails?.opaDisclosureId : disclosureDetails?.coiDisclosureId,
                projectHeader: disclosureDetails?.projectHeader,
                personFullName: disclosureDetails?.disclosurePersonFullName,
                reviewStatusCode: disclosureDetails?.reviewStatusCode,
                count: count,
                isOpenCountModal: true
            };
            this.lastOpenedCountModalData = deepCloneObject(this.coiCountModal);
        }
    }

    private initializeStatusFilters(): void {
        this.statusFilters = STATUS_FILTER_CONFIG_LOOKUP[this.disclosureType] || STATUS_FILTER_CONFIG_LOOKUP.FCOI;
    }

    private initializeDefaultFilters(): void {
        this.statusFilters.forEach(status => {
            this.selectedStatusCodes[status.code] = false;
        });
        this.isAllSelected = false;
    }

    private convertStatusCodesToTabTypes(statusCodes: string[] = []): string[] {
        return statusCodes.map(statusCode => {
            const STATUS = this.statusFilters.find(s => s.code === statusCode);
            if (STATUS?.description) {
                return REVERSE_TAB_TYPE_MAPPING_FOR_FILTER[STATUS.description] || statusCode;
            }
            return statusCode;
        });
    }

    private hasStoredStatusFilters(): boolean {
        const SAVED_FILTERS = this.reviewerDashboardService.retainedStatusFilters;
        if (!Array.isArray(SAVED_FILTERS)) {
            return false;
        }
        this.statusFilters.forEach(status => {
            const STATUS_CODE = String(status.code);
            this.selectedStatusCodes[STATUS_CODE] = SAVED_FILTERS.includes(STATUS_CODE);
        });
        this.updateFilterOptions();
        return true;
    }

    private cacheStatusFilters(): void {
        const CURRENT_FILTERS = this.filterOptions.statusFilters || [];
        this.reviewerDashboardService.retainedStatusFilters = [...CURRENT_FILTERS];
    }

    private setInitialFilterFromTabType(): void {
        if (this.disclosureReviewStatDetails?.tabType) {
            const TAB_TYPE_KEY = TAB_TYPE_MAPPING_FOR_FILTER[this.disclosureReviewStatDetails.tabType];
            if (TAB_TYPE_KEY) {
                const DEFAULT_STATUS = this.statusFilters.find(status => status.description === TAB_TYPE_KEY);
                if (DEFAULT_STATUS) {
                    this.selectedStatusCodes[DEFAULT_STATUS.code] = true;
                    this.updateFilterOptions();
                    this.updateSelectAllState();
                }
            }
        }
    }

    private updateFilterOptions(): void {
        this.filterOptions.statusFilters = Object.keys(this.selectedStatusCodes)
            .filter(key => this.selectedStatusCodes[key])
            .map(key => key);
        const FILTER_FIELDS_ARRAY = this.filterOptions.statusFilters.map(status =>
            TAB_TYPE_MAPPING_FOR_FILTER[status as keyof typeof TAB_TYPE_MAPPING_FOR_FILTER] || status
        );
        this.selectedFilterFields = FILTER_FIELDS_ARRAY.join(', ');
        this.updateFilterCount();
        this.updateSelectAllState();
        this.cacheStatusFilters();
    }

    private updateSelectAllState(): void {
        const ALL_STATUS_CODE = this.statusFilters.map(status => status.code);
        const ALL_SELECTED = ALL_STATUS_CODE.every(code => this.selectedStatusCodes[code]);
        this.isAllSelected = ALL_SELECTED;
    }

    private updateFilterCount(): void {
        this.selectedFilterCount = this.filterOptions.statusFilters?.length || 0;
    }

    private closeDropdownAndApplyFilter(): void {
        if (this.hasFiltersActuallyChanged()) {
            this.performFilteredSearch();
        } else {
            this.closeDropdown();
        }
    }

    private isClickInsideDropdown(event: MouseEvent): boolean {
        const DROPDOWN_ELEMENT = document.querySelector('.dropdown-menu');
        const TOGGLE_ELEMENT = this.dropdownToggle?.nativeElement;
        return (DROPDOWN_ELEMENT?.contains(event.target as Node)) ||
            (TOGGLE_ELEMENT?.contains(event.target as Node));
    }

    /**
     * Checks whether the current filter selections have actually changed
     * compared to the initially selected filter values.
     *
     * It verifies:
     * 1. If the number of selected keys is different.
     * 2. If any value for the existing keys has changed.
     * 3. If any initial key is missing in the current selection.
     *
     * Returns true if any difference is found, otherwise false.
     */
    private hasFiltersActuallyChanged(): boolean {
        const CURRENT_KEYS = Object.keys(this.selectedStatusCodes);
        const INITIAL_KEYS = Object.keys(this.initialSelectedStatusCodes);
        if (CURRENT_KEYS.length !== INITIAL_KEYS.length) {
            return true;
        }
        for (const key of CURRENT_KEYS) {
            const CURRENT_VALUE = this.selectedStatusCodes[key];
            const INITIAL_VALUE = this.initialSelectedStatusCodes[key];
            if (CURRENT_VALUE !== INITIAL_VALUE) {
                return true;
            }
        }
        for (const key of INITIAL_KEYS) {
            if (!CURRENT_KEYS.includes(key)) {
                return true;
            }
        }
        return false;
    }

    private setLookupArrayForDisclosureType(): void {
        this.lookupArrayForDisclosureTypeForOPA = [
            { code: 'INITIAL', description: 'Initial' },
            { code: 'REVISION', description: 'Revision' }
        ];
    }

    private setReviewStatusOptions(): void {
        const optionsMap = {
            [REVIEWER_DASHBOARD_DISCLOSURE_TYPES.FCOI]: this.coiReviewStatusOptions,
            [REVIEWER_DASHBOARD_DISCLOSURE_TYPES.OPA]: this.opaReviewStatusOptions,
            [REVIEWER_DASHBOARD_DISCLOSURE_TYPES.TRAVEL]: this.travelReviewStatusOptions
        };
        this.reviewStatusOptions = optionsMap[this.disclosureType];
    }

    private setLookupOptions(): void {
        this.setReviewStatusOptions();
        this.setLookupArrayForDisclosureType();
    }

    private openAssignAdminModal(disclosureDetails): void {
        this.disclosureDetailsForAssignAdmin.disclosureId = disclosureDetails?.coiDisclosureId || disclosureDetails?.opaDisclosureId
            || disclosureDetails?.travelDisclosureId || disclosureDetails?.disclosureId;
        this.isAssignAdminModalOpen = true;
    }

    private setAssignAdminPath(): void {
        switch (this.disclosureType) {
            case 'FCOI':
                this.assignAdminPath = 'DISCLOSURES';
                break;
            case 'TRAVEL':
                this.assignAdminPath = 'TRAVEL_DISCLOSURES';
                break;
            case 'OPA':
                this.assignAdminPath = 'OPA_DISCLOSURES';
                break;
            case 'CONSULTING':
                this.assignAdminPath = 'CONSULTING_DISCLOSURES';
                break;
        }
    }

    selectedPersonName(person: any): void {
        if (!person) {
            delete this.reviewerDashboardLocalRo.dashboardData.PERSON;
            this.isPersonSelected = false;
            this.isPersonExplicitlyCleared = true;
            return;
        }
        const PERSON_ID = person?.personId ?? person?.prncpl_id ?? person?.value ?? null;
        if (PERSON_ID === this.selectedPersonId) {
            return;
        }
        this.selectedPersonId = PERSON_ID;
        this.reviewerDashboardLocalRo.dashboardData.PERSON = person?.value || person?.prncpl_id || null;
        this.dashboardTempSearchValues.personName = person?.value || person?.full_name || null;
        this.updateFreeTextSearchField('PERSON', !!person?.value);
        this.isPersonSelected = Boolean(person?.value || person?.prncpl_id);
        this.isPersonExplicitlyCleared = false;
    }

    selectedEntityName(entity: any): void {
        this.reviewerDashboardLocalRo.dashboardData.ENTITY = entity?.value ?? entity?.entity_id ?? null;
        this.dashboardTempSearchValues.entityName = entity?.value ?? entity?.entity_name ?? null;
        this.updateFreeTextSearchField('ENTITY', !!entity?.value);
    }

    selectedCountryEvent(country: any): void {
        this.reviewerDashboardLocalRo.dashboardData.COUNTRY = country?.value ?? country?.countryCode ?? null;
        this.dashboardTempSearchValues.travelCountryName = country?.value ?? country?.countryName ?? null;
        this.updateFreeTextSearchField('COUNTRY', !!country?.value);
    }

    selectedDeptDetails(unit: any): void {
        this.reviewerDashboardLocalRo.dashboardData.HOME_UNIT = unit?.value ?? unit?.unitNumber ?? null;
        this.dashboardTempSearchValues.HOME_UNIT_NAME = unit?.value ?? unit?.displayName ?? null;
        this.updateFreeTextSearchField('HOME_UNIT', !!unit?.value);
        this.isDepartmentSelected = Boolean(unit?.value || unit?.unitNumber);
    }

    onLookupSelect(data: any, property: string): void {
        this.selectedLookUpList[property] = data;
        this.reviewerDashboardLocalRo.dashboardData[property] = data?.length ? data?.map(d => d.code)?.join(',') : '';
    }

    navigateToDashboard(): void {
        this.reviewerDashboardService.retainedStatusFilters = null;
        this._router.navigate(['/coi/reviewer-dashboard/overview']);
    }

    toggleAdvanceSearch(): void {
        this.isShowAdvanceSearch = !this.isShowAdvanceSearch;
        if (!this.isShowAdvanceSearch) {
            this.reviewerDashboardService.isAdvanceSearch = false;
        }
    }

    cardActions(event: CoiDashboardCardEvent): void {
        switch (event?.action) {
            case 'COMMENTS':
                this.openReviewComment(event.disclosureDetails);
                break;
            case 'ASSIGN_ADMIN':
                this.openAssignAdminModal(event.disclosureDetails);
                break;
            case 'ENGAGEMENTS_MODAL':
            case 'ATTACHMENTS_MODAL':
            case 'PROJECT_MODAL':
                this.handleCountModal(event);
                break;
        }
    }

    viewSlider(event: COICountModalViewSlider): void {
        this.reviewerDashboardService.engagementSliderConfig.showEngagementSlider = event.isOpenSlider;
        this.reviewerDashboardService.engagementSliderConfig.entityId = event.entityId;
        this.reviewerDashboardService.engagementSliderConfig.sliderElementId = `reviewer-dash-entity-slider-${event.entityId}`;
        setTimeout(() => {
            openCoiSlider(this.reviewerDashboardService.engagementSliderConfig.sliderElementId);
        });
    }

    validateSliderClose() {
        setTimeout(() => {
            this.reviewerDashboardService.engagementSliderConfig.showEngagementSlider = false;
            this.reviewerDashboardService.engagementSliderConfig.entityId = null;
            this.reviewerDashboardService.engagementSliderConfig.sliderElementId = '';
            this.coiCountModal = { ...this.lastOpenedCountModalData, isOpenCountModal: true };
        }, 500);
    }

    openReviewComment(disclosureData: CoiDashboardDisclosures): void {
        this._coiReviewCommentSliderService.initializeReviewCommentSlider(disclosureData);
    }

    checkForPreviousURL(): boolean {
        return ['coi/disclosure', 'coi/travel-disclosure', 'coi/opa', 'coi/create-disclosure'].some((url) => this._navigationService.previousURL.includes(url));
    }

    performAdvanceSearch(): void {
        this.reviewerDashboardService.isAdvanceSearchMade = true;
        this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData.PAGED = 0;
        this.advanceSearchTimeOut = setTimeout(() => {
            this.fetchDisclosureList();
        }, 100);
    }

    validateDateFormat(fieldName: 'CERTIFIED_AT' | 'EXPIRATION_DATE' | 'TRAVEL_DATE'): void {
        this.dateValidationMap.delete(fieldName);
        if (['CERTIFIED_AT', 'EXPIRATION_DATE'].includes(fieldName)) {
            const INPUT_MAP = {
                CERTIFIED_AT: this.certificationDateInput,
                EXPIRATION_DATE: this.expirationDateInput
            };
            const DATE_VALUE = INPUT_MAP[fieldName]?.nativeElement.value?.trim() || '';
            if (!DATE_VALUE) {
                return;
            }
            if (!this.isDateFormatValid(DATE_VALUE)) {
                const ERROR_MSG = `Entered date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`;
                this.dateValidationMap.set(fieldName, ERROR_MSG);
            }
        } else if (fieldName === 'TRAVEL_DATE') {
            const TRAVEL_START_DATE: string = this.travelStartDateInput?.nativeElement.value?.trim() || '';
            const TRAVEL_END_DATE: string = this.travelEndDateInput?.nativeElement.value?.trim() || '';
            if (!TRAVEL_START_DATE && !TRAVEL_END_DATE) {
                return;
            }
            const IS_START_DATE_VALID = !TRAVEL_START_DATE || this.isDateFormatValid(TRAVEL_START_DATE);
            const IS_END_DATE_VALID = !TRAVEL_END_DATE || this.isDateFormatValid(TRAVEL_END_DATE);
            if (!IS_START_DATE_VALID && !IS_END_DATE_VALID) {
                this.dateValidationMap.set(
                    'TRAVEL_DATE',
                    `Entered start and end date formats are invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
            } else if (!IS_START_DATE_VALID) {
                this.dateValidationMap.set(
                    'TRAVEL_DATE',
                    `Entered start date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
            } else if (!IS_END_DATE_VALID) {
                this.dateValidationMap.set(
                    'TRAVEL_DATE',
                    `Entered end date format is invalid. Please use ${DEFAULT_DATE_FORMAT} format.`
                );
                return;
            }
            this.validateTravelDateRange();
        }
    }

    clearAdvancedSearch(): void {
        this.resetAdvancedSearch();
        this.fetchDisclosureList();
    }

    sortResult(sortFieldBy: string): void {
        this.reviewerDashboardService.sortCountObject[sortFieldBy]++;
        this.sortAdminDashboardTabs(sortFieldBy);
    }

    actionsOnPageChange(event: number): void {
        const PAGE_OFFSET = (event - 1);
        if (this.reviewerDashboardLocalRo.dashboardData.PAGED != PAGE_OFFSET) {
            this.reviewerDashboardLocalRo.dashboardData.PAGED = PAGE_OFFSET;
            this.reviewerDashboardService.reviewerDashboardServiceRo.dashboardData.PAGED = PAGE_OFFSET;
            this.fetchDisclosureList();
        }
    }

    showAssignAdminButton(disclosureDetails: CoiDashboardDisclosures, disclosureType: string): boolean {
        const LOGGED_IN_PERSON = this.commonService.getCurrentUserDetail('personID');
        const IS_OPA_ADMINISTRATOR = this.commonService.getAvailableRight(OPA_DISCLOSURE_RIGHTS);
        const IS_TRAVEL_ADMINISTRATOR = this.commonService.getAvailableRight(TRAVEL_DISCLOSURE_MANAGE_RIGHTS);
        const IS_CONSULTING_ADMINISTRATOR = this.commonService.getAvailableRight(CONSULTING_DISCLOSURE_MANAGE_RIGHTS);
        const HAS_AFFILIATION_MANAGE_RIGHT = this.commonService.getAvailableRight(MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
        const CAN_EDIT_AFFILIATED_DISCLOSURE = disclosureDetails?.isHomeUnitSubmission === false && HAS_AFFILIATION_MANAGE_RIGHT;
        const CAN_MANAGE_DISCLOSURE = (disclosureDetails?.isHomeUnitSubmission || CAN_EDIT_AFFILIATED_DISCLOSURE) && disclosureDetails?.personId !== LOGGED_IN_PERSON;
        const IS_SHOW_ASSIGN_ADMIN_BTN = (CAN_MANAGE_DISCLOSURE || disclosureDetails?.adminPersonId === LOGGED_IN_PERSON);
        switch (disclosureType) {
            case 'FCOI':
                return this.getManageDisclosureRight(disclosureDetails?.fcoiTypeCode) && IS_SHOW_ASSIGN_ADMIN_BTN;
            case 'OPA':
                return (String(disclosureDetails?.reviewStatusCode) === String(OPA_REVIEW_STATUS.SUBMITTED)) && IS_OPA_ADMINISTRATOR && IS_SHOW_ASSIGN_ADMIN_BTN;
            case 'TRAVEL':
                return (String(disclosureDetails?.reviewStatusCode) === String(TRAVEL_DISCL_REVIEW_STATUS_TYPE.SUBMITTED)) && IS_TRAVEL_ADMINISTRATOR && IS_SHOW_ASSIGN_ADMIN_BTN;
            case 'CONSULTING':
                return (String(disclosureDetails?.reviewStatusCode) === String(CONSULTING_REVIEW_STATUS.SUBMITTED)) && IS_CONSULTING_ADMINISTRATOR;
            default: return false;
        }
    }

    clearAllFilters(): void {
        Object.keys(this.selectedStatusCodes).forEach(key => {
            this.selectedStatusCodes[key] = false;
        });
        this.isAllSelected = false;
        this.filterOptions.statusFilters = [];
        this.updateFilterCount();
        this.cacheStatusFilters();
        this.$fetchReviewerDashboard.next({ isCountNeeded: true });
        Object.keys(this.initialSelectedStatusCodes).forEach(key => {
            this.initialSelectedStatusCodes[key] = false;
        });
        this.closeDropdown();
    }

    performFilteredSearch(): void {
        this.updateFilterOptions();
        this.fetchDisclosureList();
        this.initialSelectedStatusCodes = { ...this.selectedStatusCodes };
        this.closeDropdown();
    }

    closeDropdown(): void {
        if (this.dropdownToggle?.nativeElement) {
            const BOOTSTRAP_DROP_DOWN = (window as any).bootstrap?.Dropdown.getInstance(this.dropdownToggle.nativeElement);
            if (BOOTSTRAP_DROP_DOWN) {
                BOOTSTRAP_DROP_DOWN.hide();
            } else {
                const DROP_DOWN_MENU = document.querySelector('.dropdown-menu');
                if (DROP_DOWN_MENU) {
                    DROP_DOWN_MENU.classList.remove('show');
                }
                if (this.dropdownToggle.nativeElement) {
                    this.dropdownToggle.nativeElement.setAttribute('aria-expanded', 'false');
                    this.dropdownToggle.nativeElement.classList.remove('show');
                }
            }
            this.isDropdownOpen = false;
        }
    }

    preventDropdownClose(event: Event): void {
        event.stopPropagation();
    }

    onDropdownToggle(): void {
        this.isDropdownOpen = !this.isDropdownOpen;
        if (this.isDropdownOpen) {
            this.initialSelectedStatusCodes = { ...this.selectedStatusCodes };
        } else {
            this.closeDropdownAndApplyFilter();
        }
    }

    exportReviewDetails(): void {
        this.$subscriptions.push(this.reviewerDashboardService
            .exportReviewerDashboardData(this.getRequestObject(false))
            .subscribe((res) => {
                fileDownloader(res, 'Reviewer Dashboard', 'xlsx');
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Dashboard Data downloaded successfully');
            }, (_err) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Dashboard Data downloading failed.');
            }));
    }

    closeAssignAdminModal(event: Event): void {
        if (event) {
            this.disclosureDetailsForAssignAdmin.disclosureId = null;
            this.$fetchReviewerDashboard.next();
        }
        this.isAssignAdminModalOpen = false;
    }

    toggleSelectAll(event: Event): void {
        const IS_CHECKED = (event.target as HTMLInputElement).checked;
        this.isAllSelected = IS_CHECKED;
        this.statusFilters.forEach(status => {
            this.selectedStatusCodes[status.code] = IS_CHECKED;
        });
        this.updateFilterOptions();
    }
}
