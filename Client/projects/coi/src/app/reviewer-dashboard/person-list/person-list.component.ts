import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormSharedModule } from '../../configuration/form-builder-create/shared/shared.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';
import { leftSlideInOut } from '../../common/utilities/animations';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { PersonListTableComponent } from './person-list-table/person-list-table.component';
import { Router } from '@angular/router';
import {
    DisclosureFetchConfig,
    EligibilityModalMode,
    NotificationData,
    PersonDashBoardSortCountObj, PersonDashBoardSortType,
    PersonDetails, PersonHistorySliderConfig, PersonListDetails, personListFetchRO, PersonListTabTypes,
    PersonNotificationSliderConfig
} from '../reviewer-dashboard.interface';
import { of, Subject, Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ReviewerDashboardService } from '../services/reviewer-dashboard.service';
import { deepCloneObject, openCommonModal } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PersonEligibilityAdditionModalComponent } from './person-eligibility-addition-modal/person-eligibility-addition-modal.component';
import { PERSON_ELIGIBILITY_MODAL_ID } from '../reviewer-dashboard-constants';
import { PersonNotificationComponent } from './person-notification/person-notification.component';
import { PersonHistorySliderComponent } from './person-history-slider/person-history-slider.component';
import { EndPointOptions } from '../../shared-components/shared-interface';
import { getEndPointOptionsForLeadUnit } from '../../../../../fibi/src/app/common/services/end-point.config';
@Component({
    selector: 'app-person-list',
    templateUrl: './person-list.component.html',
    styleUrls: ['./person-list.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule,
        PersonListTableComponent, PersonEligibilityAdditionModalComponent, PersonNotificationComponent, PersonHistorySliderComponent],
    animations: [leftSlideInOut]
})
export class PersonListComponent implements OnInit, OnDestroy {

    advSearchClearField: string;
    elasticPersonSearchOptions: EndPointOptions = {};
    leadUnitSearchOptions: EndPointOptions = {};
    personDetails: PersonDetails[] = [];
    isLoading = false;
    sortCountObj = new PersonDashBoardSortCountObj();
    sortRequestObject = new PersonDashBoardSortType();
    totalRecordsCount = 0;
    localRequestObject = new personListFetchRO();
    personListTabType = new PersonListTabTypes();
    filterPills = [
        { label: 'All', value: 'ALL', id: 'discl-hist-filter-all' },
        { label: 'Exempt from OPA', value: 'EXEMPT', id: 'discl-filter-exempt-from-opa' },
        { label: 'Admin Override', value: 'ADMIN_OVERRIDE', id: 'discl-filter-admin-override' },
        { label: 'OPA Eligible Persons', value: 'ELIGIBLE_PERSONS', id: 'discl-filter-eligible-person' },
    ];
    disclosureReviewStatDetails: DisclosureFetchConfig;
    notificationData = new NotificationData();
    private $subscriptions: Subscription[] = [];
    private $fetchPersonData = new Subject<{ isCountNeeded: boolean }>();
    private previousPersonId: string | null = null;
    private previousUnitNumber: string | null = null;
    private isDepartmentSelected = false;

    constructor(private _elasticConfig: ElasticConfigService, private _router: Router,
        private _commonService: CommonService, public reviewerDashboardService: ReviewerDashboardService) { }

    ngOnInit() {
        const STORED_REVIEW_STAT = sessionStorage.getItem('disclosureFetchConfig');
        this.disclosureReviewStatDetails = STORED_REVIEW_STAT ? JSON.parse(STORED_REVIEW_STAT) : new DisclosureFetchConfig();
        this.previousPersonId = this.disclosureReviewStatDetails?.personId || null;
        this.getTabData(this.disclosureReviewStatDetails);
        this.setSearchOptions();
        this.loadPersonData();
        this.$fetchPersonData.next({ isCountNeeded: true });
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private loadPersonData(): void {
        this.$subscriptions.push(this.$fetchPersonData.pipe(
            switchMap((params: { isCountNeeded: boolean }) => {
                this.isLoading = true;
                return this.reviewerDashboardService.getPersonDisclRequirementsDashboard(this.getRequestObject(params.isCountNeeded)).pipe(
                    map((data) => ({ data: data, isCountNeeded: params.isCountNeeded })),
                    catchError((error: any) => {
                        this.isLoading = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching person details.');
                        return of({ data: null, isCountNeeded: false });
                    })
                )
            })
        ).subscribe(({ data, isCountNeeded }: { data: PersonListDetails, isCountNeeded: boolean }) => {
            if (data?.dashboardData) {
                this.personDetails = data.dashboardData || [];
                isCountNeeded && (this.totalRecordsCount = data.totalCount || 0);
            }
            this.isLoading = false;
        }));
    }

    private getTabData(disclosureReviewStatDetails: DisclosureFetchConfig): void {
        switch (disclosureReviewStatDetails?.uniqueId) {
            case 'OPA_DELINQUENT':
                this.personListTabType.isDelinquent = true;
                break;
            case 'OPA_ELIGIBLE':
                this.personListTabType.isEligiblePerson = true;
                break;
            case 'OPA_EXEMPT':
                this.personListTabType.isExempt = true;
                break;
        }
        this.localRequestObject.dashboardData.TAB_TYPE = this.disclosureReviewStatDetails.tabType;
    }

    private getRequestObject(isCountNeeded): any {
        const PERSON_LIST_RO = deepCloneObject(this.localRequestObject);
        if (!this.isDepartmentSelected) {
            PERSON_LIST_RO.dashboardData.HOME_UNIT = this.disclosureReviewStatDetails?.unitNumber || undefined;
        }
        PERSON_LIST_RO.dashboardData.INCLUDE_CHILD_UNITS = this.disclosureReviewStatDetails?.isIncludeChildUnits || undefined;
        PERSON_LIST_RO.isCountNeeded = isCountNeeded;
        return PERSON_LIST_RO;
    }

    /**
    * Caches the current sort configuration.
    * - If no sort keys are present, removes SORT_TYPE from the dashboardRO.
    * - Otherwise, converts the sort object to a comma-separated string and stores it in SORT_TYPE.
    */
    private cacheSortCriteria(): void {
        const SORT_TYPE_OBJECT = this.sortRequestObject;
        if (!Object.keys(SORT_TYPE_OBJECT)?.length) {
            delete this.localRequestObject.dashboardData.SORT_TYPE;
        } else {
            const KEY_VALUE_PAIRS = Object.entries(SORT_TYPE_OBJECT)
                .map(([key, value]) => `${key} ${value}`)
                .join(',');
            this.localRequestObject.dashboardData.SORT_TYPE = KEY_VALUE_PAIRS;
        }
    }

    private sortPersonListColumns(sortFieldBy: string): void {
        if (this.sortCountObj[sortFieldBy] < 3) {
            this.sortRequestObject[sortFieldBy] = !this.sortRequestObject[sortFieldBy] ? 'ASC' : 'DESC';
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.sortRequestObject[sortFieldBy];
        }
    }

    private setSearchOptions() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        this.leadUnitSearchOptions = getEndPointOptionsForLeadUnit('', this._commonService.fibiUrl);
        this.setInitialPersonSearchValues();
    }

    private setInitialPersonSearchValues(): void {
        this.elasticPersonSearchOptions.defaultValue = this.disclosureReviewStatDetails?.personFullName || undefined;
        this.localRequestObject.dashboardData.PERSON = this.disclosureReviewStatDetails?.personId || undefined;
    }

    onSortClick(sortFieldBy: keyof PersonDashBoardSortCountObj): void {
        this.sortCountObj[sortFieldBy]++;
        this.sortPersonListColumns(sortFieldBy);
        this.cacheSortCriteria();
        this.$fetchPersonData.next({ isCountNeeded: true });
    }

    actionsOnPageChange(event): void {
        const PAGE_OFFSET = (event - 1);
        if (this.localRequestObject.dashboardData.PAGED != PAGE_OFFSET) {
            this.localRequestObject.dashboardData.PAGED = PAGE_OFFSET;
            this.$fetchPersonData.next({ isCountNeeded: true });
        }
    }

    navigateToDashboard(): void {
        this._router.navigate(['/coi/reviewer-dashboard/overview']);
    }

    setFilter(filterType): void {
        this.localRequestObject = new personListFetchRO();
        this.localRequestObject.dashboardData.TAB_TYPE = filterType;
        this.$fetchPersonData.next({ isCountNeeded: true });
    }

    selectedPersonDetails(personDetails: any): void {
        const DASHBOARD_DATA = this.localRequestObject.dashboardData;
        const CURRENT_PERSON_ID = personDetails?.prncpl_id || null;
        if (CURRENT_PERSON_ID === this.previousPersonId) return;
        if (!CURRENT_PERSON_ID) {
            delete DASHBOARD_DATA.PERSON;
        }
        DASHBOARD_DATA.PERSON = personDetails?.prncpl_id;
        this.previousPersonId = CURRENT_PERSON_ID;
        this.$fetchPersonData.next({ isCountNeeded: true });
    }

    selectedDeptDetails(departmentDetails: any): void {
        const DASHBOARD_DATA = this.localRequestObject.dashboardData;
        const CURRENT_UNIT_NUMBER = departmentDetails?.unitNumber || null;
        if (CURRENT_UNIT_NUMBER === this.previousUnitNumber) return;
        CURRENT_UNIT_NUMBER ? (DASHBOARD_DATA.HOME_UNIT = departmentDetails?.unitNumber) : delete DASHBOARD_DATA.HOME_UNIT;
        this.previousUnitNumber = CURRENT_UNIT_NUMBER;
        this.isDepartmentSelected = Boolean(departmentDetails?.value || departmentDetails?.unitNumber);
        this.$fetchPersonData.next({ isCountNeeded: true });
    }

    openEligibilityModal(eligibilityModalType: EligibilityModalMode): void {
        this.reviewerDashboardService.personEligibilityModalConfig.isOpenModal = true;
        this.reviewerDashboardService.personEligibilityModalConfig.isEditMode = eligibilityModalType === 'EDIT_MODE';
        setTimeout(() => {
            openCommonModal(PERSON_ELIGIBILITY_MODAL_ID);
        });
    }

    triggerPersonList(event): void {
        event && this.$fetchPersonData.next({ isCountNeeded: true });
    }

    handlePersonTableActions(event: any): void {
        switch (event.action) {
            case 'EDIT_ELIGIBILITY':
                this.reviewerDashboardService.personEligibilityModalConfig.personDetails = event.disclosureDetails;
                this.openEligibilityModal('EDIT_MODE');
                break;
            case 'NOTIFICATION_SLIDER':
                this.toggleNotificationSlider(event.disclosureDetails, event.content.personIndex, event.content.personDetailsList);
                break;
            case 'PERSON_HISTORY':
                this.toggleHistorySlider(event.disclosureDetails, event.content.personIndex);
                break;
        }
    }

    toggleHistorySlider(personDetails: PersonDetails, personIndex: number): void {
        const NOTIFICATION_SLIDER_CONFIG = this.reviewerDashboardService.personHistorySliderConfig;
        NOTIFICATION_SLIDER_CONFIG.isOpenSlider = true;
        NOTIFICATION_SLIDER_CONFIG.historySliderData = { personDetailsForHistorySlider: personDetails, personIndex };
    }

    toggleNotificationSlider(personDetails: PersonDetails | null, personIndex: number | null, personDetailsList: PersonDetails[] = []): void {
        const NOTIFICATION_SLIDER_CONFIG = this.reviewerDashboardService.personNotificationSliderConfig;
        NOTIFICATION_SLIDER_CONFIG.isOpenSlider = true;
        NOTIFICATION_SLIDER_CONFIG.notificationSliderData = {
            personDetailsForSlider: personDetails,
            personIndex,
            personDetailsList
        };
    }

    closeNotificationSlider(event): void {
        this.reviewerDashboardService.personNotificationSliderConfig = new PersonNotificationSliderConfig();
    }

    closeHistorySlider(event): void {
        this.reviewerDashboardService.personHistorySliderConfig = new PersonHistorySliderConfig();
    }
}   
