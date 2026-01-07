import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { SharedModule } from '../../../shared/shared.module';
import { listAnimation } from '../../../common/utilities/animations';
import { CommonService } from '../../../common/services/common.service';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { deepCloneObject, openCommonModal } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ReviewerDashboardService } from '../../services/reviewer-dashboard.service';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { REVIEWER_DASHBOARD_LOCALIZE } from '../../../app-locales';
import { DisclosureReviewData, ReviewerDashboardRo, ReviewerDashboardSearchValues, SelectedUnit, UserPreference } from '../../reviewer-dashboard.interface';
import { getEndPointOptionsForLoggedPersonUnit } from '../../../common/services/end-point.config';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { ConfigurationModalComponent } from '../configuration-modal/configuration-modal.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader.component';
import {
    DISCLOSURE_CONFIGURATION_MODAL_ID, REVIEWER_DASHBOARD_DISCLOSURE_TAB_TYPE
} from '../../reviewer-dashboard-constants';
import {
    ReviewerOverviewCardEvent, SharedDisclReviewOverviewCardComponent
} from '../../shared/shared-discl-review-overview-card/shared-discl-review-overview-card.component';
import { GlobalEventNotifier } from '../../../common/services/coi-common.interface';

@Component({
    selector: 'app-overview-header',
    templateUrl: './overview-header.component.html',
    styleUrls: ['./overview-header.component.scss'],
    standalone: true,
    animations: [listAnimation],
    imports: [
        CommonModule, FormsModule, SharedModule, SharedComponentModule,
        FormSharedModule, SharedDisclReviewOverviewCardComponent,
        ConfigurationModalComponent, SkeletonLoaderComponent
    ]
})
export class OverviewHeaderComponent implements OnInit, OnDestroy {

    totalSlides = 0;
    cardsPerView = 3;
    isLoading = false;
    transformValue = 0;
    isAPIFailed = false;
    currentSlideIndex = 0;
    indicators: number[] = [];
    leadUnitSearchOptions: any = {};
    reviewStatDetails: DisclosureReviewData[] = [];
    REVIEWER_DASHBOARD_LOCALIZE = REVIEWER_DASHBOARD_LOCALIZE;
    selectedUnit = new SelectedUnit();
    skeletonLoaderList = [
        { class: 'col-12 col-md-12 col-xl-6 col-xxxl-4', columnClassArray: ['col', 'col', 'col'] },
        { class: 'd-none d-xl-block col-xl-6 col-xxxl-4', columnClassArray: ['col', 'col', 'col', 'col'] }
    ];
    unitAdministrators: any = [];
    defaultUnitDetails = null;
    defaultPreferenceForChildUnit = null;
    unitObject: any;
    isUnitChange = false;
    isDescentFlagOn = true;
    personPreferenceForUnit = null;
    personPreferenceForChildUnit = null;
    defaultUnitName = '';
    customWidgetLayoutClass = '';
    overviewHeaderLocalRo = new ReviewerDashboardRo();
    isShowIncludeChildUnit = false;
    dashboardTempSearchValues = new ReviewerDashboardSearchValues();
    private resizeListener: any;
    private $subscriptions: Subscription[] = [];

    @HostListener('window:resize')
    onResize(): void {
        this.setCardsPerView();
        this.calculateSlides();
    }

    constructor(private _commonService: CommonService, public reviewerDashboardService: ReviewerDashboardService) { }

    async ngOnInit(): Promise<void> {
        this.setSearchOptions();
        await this.getUserPreference();
        this.listenFetchOverviewHeader();
        this.listenGlobalEventNotifier();
        this.setupResponsiveBehavior();
        this.setTempFromCache();
        this.fetchOverviewHeader();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
        if (this.resizeListener) { this.resizeListener(); }
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event?.uniqueId === 'REFRESH_OVERVIEW_TAB') {
                    event.content.isDefaultDataChanged && this.handleRefreshOverview();
                }
            })
        );
    }

    private setTempFromCache(): void {
        const SERVICE_RO = this.reviewerDashboardService.overviewHeaderFetchServiceRO.dashboardData;
        const HAS_CACHED_UNIT = Boolean(SERVICE_RO?.HOME_UNIT);
        if (HAS_CACHED_UNIT) {
            this.selectedUnit.unitNumber = SERVICE_RO.HOME_UNIT as string;
            this.selectedUnit.isIncludeChildUnits = Boolean(SERVICE_RO.INCLUDE_CHILD_UNITS);
            this.isShowIncludeChildUnit = Boolean(this.selectedUnit.unitNumber);
            this.setSearchOptionsFromCache();
        } else if (this.selectedUnit.displayName) {
            this.dashboardTempSearchValues.HOME_UNIT_NAME = this.selectedUnit.displayName;
            this.updateLeadUnitDefaultValue(this.selectedUnit.displayName);
        }
    }

    private cacheSearchCriteria(): void {
        this.persistSearchValuesToService();
        const REVIEWER_DASHBOARD_SERVICE_RO = this.reviewerDashboardService.overviewHeaderFetchServiceRO.dashboardData;
        REVIEWER_DASHBOARD_SERVICE_RO.HOME_UNIT = this.selectedUnit.unitNumber || undefined;
        REVIEWER_DASHBOARD_SERVICE_RO.INCLUDE_CHILD_UNITS = this.selectedUnit.isIncludeChildUnits || undefined;
    }

    private setSearchOptionsFromCache(): void {
        if (!this.hasCachedSearchValues()) {
            return;
        }
        this.dashboardTempSearchValues = deepCloneObject(this.reviewerDashboardService.overviewHeaderSearchValues);
        this.selectedUnit.displayName = this.dashboardTempSearchValues.HOME_UNIT_NAME || this.selectedUnit.displayName;
        const DEFAULT_NAME = this.dashboardTempSearchValues.HOME_UNIT_NAME || '';
        this.updateLeadUnitDefaultValue(DEFAULT_NAME);
    }

    private async handleRefreshOverview(): Promise<void> {
        this.resetCachedSelections();
        await this.getUserPreference();
        this.setTempFromCache();
        this.fetchOverviewHeader();
    }

    private setDefaultUnitName(): void {
        const CACHED_DISPLAY_NAME = this.hasCachedSearchValues()
            ? this.reviewerDashboardService.overviewHeaderSearchValues.HOME_UNIT_NAME
            : null;
        if (!this.selectedUnit.displayName || this.hasCachedSearchValues()) {
            const DISPLAY_NAME = CACHED_DISPLAY_NAME || this.selectedUnit.displayName || '';
            this.updateLeadUnitDefaultValue(DISPLAY_NAME);
            return;
        }
        this.dashboardTempSearchValues.HOME_UNIT_NAME = this.selectedUnit.displayName || '';
        this.updateLeadUnitDefaultValue(this.selectedUnit.displayName || '');
    }

    private getUserPreference(): Promise<void> {
        this.isLoading = true;
        return new Promise((resolve) => {
            this.$subscriptions.push(
                this.reviewerDashboardService.getUserPreference()
                    .subscribe({
                        next: (data: UserPreference) => {
                            this.selectedUnit = { unitNumber: null, displayName: null, isIncludeChildUnits: false };
                            let PREFERENCE_DETAILS = {};
                            data.personPreferences.forEach(element => {
                                PREFERENCE_DETAILS[element.preferencesTypeCode] = element;
                            });
                            this.defaultUnitDetails = PREFERENCE_DETAILS[8001];
                            this.defaultPreferenceForChildUnit = PREFERENCE_DETAILS[8002];
                            if (this.defaultUnitDetails?.value) {
                                this.selectedUnit.unitNumber = this.defaultUnitDetails.value;
                                this.selectedUnit.displayName = data.unitDisplyName || null;
                            }
                            this.defaultUnitName = data.unitDisplyName || null;
                            if (this.defaultPreferenceForChildUnit?.value) {
                                this.selectedUnit.isIncludeChildUnits = this.defaultPreferenceForChildUnit.value === 'Y';
                            }
                            this.isShowIncludeChildUnit = Boolean(this.selectedUnit.unitNumber);
                            this.setDefaultUnitName();
                            this.isLoading = false;
                            resolve();
                        },
                        error: (error) => {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch user preference');
                            this.isLoading = false;
                            resolve();
                        }
                    })
            );
        });
    }

    private setPersonSelectedUnit() {
        this.personPreferenceForUnit = deepCloneObject(this.defaultUnitDetails ? this.defaultUnitDetails : { value: this.unitObject?.unitNumber });
        this.personPreferenceForChildUnit = deepCloneObject(this.defaultPreferenceForChildUnit ? this.defaultPreferenceForChildUnit : { value: 'Y' });
    }

    private listenFetchOverviewHeader(): void {
        this.$subscriptions.push(
            this.reviewerDashboardService.$fetchOverviewDetails.pipe(
                switchMap(() => {
                    this.isAPIFailed = false;
                    this.isLoading = true;
                    this.reviewStatDetails = [];
                    return this.reviewerDashboardService.getCOIReviewerDashboard(this.getReviewerDashboardRO()).pipe(
                        catchError((error) => {
                            this.isAPIFailed = true;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching overview details.');
                            return of(null);
                        })
                    );
                })).subscribe((data: { dashboardData: DisclosureReviewData[], totalCount: number | null } | null) => {
                    this.reviewStatDetails = this.formatDashboardData(data?.dashboardData || []);
                    this.customWidgetLayoutClass = this.getColumnClass(this.reviewStatDetails.length);
                    this.setCardsPerView();
                    this.calculateSlides();
                    this.isLoading = false;
                }
                )
        );
    }

    private getColumnClass(cardCount: number): string {
        switch (cardCount) {
            case 1:
                // Full width for single card
                return 'col-12 col-xxxl-12';
            case 2:
                // Half width for two cards
                return 'col-12 col-md-6 col-xxxl-6';
            case 3:
                // One third width for three cards
                return 'col-12 col-md-6 col-xxxl-4';
            default:
                return 'col-12 col-md-6 col-xxxl-4';
        }
    }

    private formatDashboardData(dashboardData: DisclosureReviewData[]): DisclosureReviewData[] {
        return dashboardData
            .sort((a, b) => (a.ORDER_NUMBER || 0) - (b.ORDER_NUMBER || 0))
            .map(item => ({
                ...item,
                COUNT_DETAILS: item.COUNT_DETAILS
                    ? item.COUNT_DETAILS.sort((x, y) => (x.ORDER_NUMBER || 0) - (y.ORDER_NUMBER || 0))
                    : []
            }));
    }

    private getReviewerDashboardRO(): ReviewerDashboardRo {
        const REVIEWER_DASHBOARD_RO = deepCloneObject(this.overviewHeaderLocalRo);
        REVIEWER_DASHBOARD_RO.fetchType = 'HEADER';
        REVIEWER_DASHBOARD_RO.dashboardData = {
            HOME_UNIT: this.selectedUnit.unitNumber || undefined,
            INCLUDE_CHILD_UNITS: this.selectedUnit.isIncludeChildUnits || undefined
        };
        return REVIEWER_DASHBOARD_RO;
    }

    private setSearchOptions(): void {
        this.leadUnitSearchOptions = getEndPointOptionsForLoggedPersonUnit(this._commonService.baseUrl);
    }

    private setupResponsiveBehavior(): void {
        this.setCardsPerView();
        this.resizeListener = this.onResize.bind(this);
        window.addEventListener('resize', this.resizeListener);
    }

    private setCardsPerView(): void {
        const WIDTH = window.innerWidth;
        if (WIDTH < 1400) {
            this.cardsPerView = 1;
        } else if (WIDTH >= 1400 && WIDTH < 1800) {
            this.cardsPerView = 2;
        } else {
            this.cardsPerView = 3;
        }
        this.currentSlideIndex = 0;
    }

    private calculateSlides(): void {
        const TOTAL_CARDS = this.reviewStatDetails.length;
        if (TOTAL_CARDS <= this.cardsPerView) {
            this.totalSlides = 1;
        } else {
            this.totalSlides = TOTAL_CARDS - this.cardsPerView + 1;
        }
        this.indicators = Array.from({ length: this.totalSlides }, (_, i) => i);
        this.updateTransform();
    }

    private updateTransform(): void {
        const SLIDE_PERCENTAGE = 100 / this.cardsPerView;
        this.transformValue = -(this.currentSlideIndex * SLIDE_PERCENTAGE);
    }

    nextSlide(): void {
        if (this.currentSlideIndex < this.totalSlides - 1) {
            this.currentSlideIndex++;
            this.updateTransform();
        }
    }

    previousSlide(): void {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.updateTransform();
        }
    }

    goToSlide(index: number): void {
        if (index >= 0 && index < this.totalSlides) {
            this.currentSlideIndex = index;
            this.updateTransform();
        }
    }

    // this function is for future use in which it returns the current slider index and cards per view depend
    // upon the screen size, it can be used to get the active card etc...
    get visibleCardIndices(): number[] {
        const INDICES = [];
        for (let i = 0; i < this.cardsPerView; i++) {
            INDICES.push(this.currentSlideIndex + i);
        }
        return INDICES;
    }

    openConfigureModal(): void {
        this.reviewerDashboardService.disclosureConfigurationModalConfig.isOpenDiscConfigModal = true;
        this.reviewerDashboardService.disclosureConfigurationModalConfig.availableDisclosures = this.reviewStatDetails;
        setTimeout(() => {
            openCommonModal(DISCLOSURE_CONFIGURATION_MODAL_ID);
        });
        this.setPersonSelectedUnit();
    }

    overviewCardActions(cardActionEvent: ReviewerOverviewCardEvent): void {
        if (cardActionEvent.action === 'VIEW_LIST') {
            const { selectedCountDetails, reviewStatDetails } = cardActionEvent.content;
            this.reviewerDashboardService.viewReviewerDashboardList({
                unitNumber: this.selectedUnit.unitNumber,
                uniqueId: selectedCountDetails?.UNIQUE_ID,
                moduleCode: reviewStatDetails?.MODULE_CODE,
                moduleName: reviewStatDetails?.MODULE_NAME,
                unitDisplayName: this.selectedUnit.displayName,
                isIncludeChildUnits: this.selectedUnit.isIncludeChildUnits,
                tabType: REVIEWER_DASHBOARD_DISCLOSURE_TAB_TYPE[selectedCountDetails?.UNIQUE_ID],
                personId: null,
                personFullName: null,
            });
        }
    }

    onUnitChange(unit: any): void {
        if ((unit?.unitNumber || this.selectedUnit.unitNumber) && String(unit?.unitNumber) !== String(this.selectedUnit.unitNumber)) {
            this.selectedUnit.unitNumber = unit?.unitNumber || null;
            this.selectedUnit.displayName = unit?.displayName || null;
            this.dashboardTempSearchValues.HOME_UNIT_NAME = this.selectedUnit.displayName || '';
            this.updateLeadUnitDefaultValue(this.dashboardTempSearchValues.HOME_UNIT_NAME);
            if (!unit?.unitNumber) {
                delete (this.overviewHeaderLocalRo.dashboardData.INCLUDE_CHILD_UNITS);
                this.selectedUnit.isIncludeChildUnits = false;
                this.isShowIncludeChildUnit = false;
            } else {
                this.isShowIncludeChildUnit = true;
                this.overviewHeaderLocalRo.dashboardData.INCLUDE_CHILD_UNITS = this.selectedUnit.isIncludeChildUnits;
            }
            this.fetchOverviewHeader(true);
        }
    }

    onIncludeChildUnitChange(includeChildUnits: boolean): void {
        this.selectedUnit.isIncludeChildUnits = includeChildUnits;
        this.fetchOverviewHeader(true);
    }

    fetchOverviewHeader(shouldRetainSearch = false): void {
        if (shouldRetainSearch) {
            this.cacheSearchCriteria();
        }
        this.triggerOverviewDashboard(this.selectedUnit);
    }

    triggerOverviewDashboard(unitDetails: SelectedUnit): void {
        this.reviewerDashboardService.overviewUnitDetails = unitDetails;
        this.reviewerDashboardService.triggerOverviewHeader();
        this.reviewerDashboardService.triggerOverviewDepartment();
    }

    private hasCachedSearchValues(): boolean {
        const SEARCH_VALUES = this.reviewerDashboardService.overviewHeaderSearchValues;
        return Object.values(SEARCH_VALUES || {}).some(value => Boolean(value));
    }

    private persistSearchValuesToService(): void {
        this.reviewerDashboardService.overviewHeaderSearchValues = deepCloneObject(this.dashboardTempSearchValues);
    }

    private updateLeadUnitDefaultValue(defaultValue: string): void {
        this.leadUnitSearchOptions = {
            ...this.leadUnitSearchOptions,
            defaultValue
        };
    }

    private resetCachedSelections(): void {
        this.dashboardTempSearchValues = new ReviewerDashboardSearchValues();
        this.reviewerDashboardService.overviewHeaderSearchValues = new ReviewerDashboardSearchValues();
        const SERVICE_RO = this.reviewerDashboardService.overviewHeaderFetchServiceRO.dashboardData;
        delete SERVICE_RO.HOME_UNIT;
        delete SERVICE_RO.INCLUDE_CHILD_UNITS;
    }
}

