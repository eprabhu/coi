import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { Observable, Subject, Subscription, interval, of } from 'rxjs';
import { catchError, debounce, map, switchMap } from 'rxjs/operators';
import { ConfigurableProjectListService } from './configurable-project-list.service';
import { INITIAL_REVISE_INFO_TEXT_FORMAT, UserProjectFetchRO, PROJECT_INFO_TEXT_FORMAT, ProjectListConfiguration, UserProjectsResponse, UserProjectDetails,
    DISCLOSURE_SUBMITTED_INFO_TEXT_FORMAT, DISCLOSURE_PENDING_INFO_TEXT_FORMAT, ProjectConfigActionType, ProjectConfigInputAction, ProjectConfigAction, 
    WITHDRAW_VIEW_DISCL_SUBMITTED_INFO_TEXT_FORMAT,
    CREATE_FCOI_DISCL_INFO_TEXT_FORMAT} from './configurable-project-list.interface';
import { COMMON_ERROR_TOAST_MSG, CREATE_DISCLOSURE_RELATIONSHIP_ROUTE_URL, DISCLOSURE_REVIEW_STATUS, DISCLOSURE_TYPE, HTTP_ERROR_STATUS,
    POST_CREATE_DISCLOSURE_ROUTE_URL, PROJECT_TYPE, PROJECT_TYPE_LABEL } from '../../app-constants';
import { FcoiType, GlobalEventNotifier, SharedProjectDetails, SuccessErrorType } from '../../common/services/coi-common.interface';
import { DisclosureCreateModalService } from '../disclosure-create-modal/disclosure-create-modal.service';
import { Router } from '@angular/router';
import { HeaderService } from '../../common/header/header.service';
import { CoiDisclosure } from '../../disclosure/coi-interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { FcoiReviseRO } from '../shared-interface';
import { COMMON_DISCL_LOCALIZE } from '../../app-locales';

@Component({
    selector: 'app-configurable-project-list',
    templateUrl: './configurable-project-list.component.html',
    styleUrls: ['./configurable-project-list.component.scss'],
    providers: [ConfigurableProjectListService, DisclosureCreateModalService]
})
export class ConfigurableProjectListComponent implements OnInit, OnDestroy {

    @Input() projectListConfiguration = new ProjectListConfiguration();
    @Output() projectListChanged = new EventEmitter<ProjectConfigAction>();
    @Output() inputActions = new EventEmitter<ProjectConfigInputAction>();

    private $subscriptions: Subscription[] = [];
    private $searchDebounceEvent = new Subject<string>();
    private $fetchProjectList = new Subject<ProjectConfigActionType>();
    
    totalCount = 0;
    filteredCount = 0;

    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    
    infoText = '';
    projectType = '';

    isLoading = true;
    hasPendingFCOI = false;
    hasFCOIDisclosure = false;
    isShowSearchAndInfo = false;
    canCreateDisclosure = false;
    hasSubmittedDisclosure = false;
    hasActiveFCOI = false;

    activeDisclosureDetails: CoiDisclosure;
    fcoiReviseRO = new FcoiReviseRO();
    userProjectList: UserProjectDetails[] = [];
    pendingInitialRevisionDiscl: CoiDisclosure = null;
    userProjectCardDetails: Record<string, SharedProjectDetails> = {};

    constructor(private _router: Router,
        private _headerService: HeaderService,
        private _commonService: CommonService,
        private _userAwardsService: ConfigurableProjectListService,
        private _disclosureCreateModalService: DisclosureCreateModalService) {}

    ngOnInit(): void {
        this.canCreateDisclosure = this._commonService.isShowFinancialDisclosure && this._commonService.isDisclosureRequired;
        this.getActiveDisclosure();
        this.fetchProjectDashboard();
        this.listenDebounceEvent();
        this.listenToGlobalNotifier();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getActiveDisclosure(): void {
        this.$subscriptions.push(this._headerService.getActiveDisclosure().subscribe((response: any) => {
            this._headerService.setActiveDisclosures(response);
            this.setFCOITypeCode(this._headerService.activeDisclosures);
            this.setInfoText();
            this.$fetchProjectList.next('REFRESH');
        }, (error: any) => {
            this.showOrHideListAndSearch(null);
            this.handleEmits('GET_ACTIVE_DISCLOSURE', 'ERROR');
            const ERROR_MSG = (error.error && error.error.errorMessage) ? error.error.errorMessage : COMMON_ERROR_TOAST_MSG;
            this._commonService.showToast(HTTP_ERROR_STATUS, ERROR_MSG);
        }));
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            const { projectTypeCode, uniqueId, paginationLimit } = this.projectListConfiguration;
            const PROJECT_CONFIG = data?.content?.projectListConfiguration || {};
            // listen Project Count Change
            if (data?.uniqueId === 'MY_PROJECT_COUNT_CHANGE' && PROJECT_CONFIG?.projectTypeCode === projectTypeCode && PROJECT_CONFIG?.uniqueId != uniqueId) {
                if (data?.content?.totalCount) {
                    this.$fetchProjectList.next('COUNT_CHANGE');
                } else {
                    this.userProjectList = [];
                    this.userProjectCardDetails = {};
                    this.isShowSearchAndInfo = false;
                }
            }
            // listen RELOAD PROJECTS
            if(data?.uniqueId === 'RELOAD_MY_PROJECTS') {
                this.projectListConfiguration.searchText = '';
                this.projectListConfiguration.currentPageNumber = paginationLimit ? 1 : null;
                this.$fetchProjectList.next('REFRESH');
            }
        }));
    }

    private listenDebounceEvent(): void {
        this.$subscriptions.push(this.$searchDebounceEvent.pipe(debounce(() => interval(500))).subscribe((searchText: any) => {
            this.$fetchProjectList.next('SEARCH');
        }));
    }

    private setFCOITypeCode(coiDisclosures: any): void {
        this.hasPendingFCOI = false;
        this.hasFCOIDisclosure = false;
        this.hasSubmittedDisclosure = false;
        this.pendingInitialRevisionDiscl = null;
        coiDisclosures?.forEach((disclosure: any) => {
            // checking whether any initial or revision disclosure.
            if ([DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode)) {
                this.hasFCOIDisclosure = true;
                // checking whether the disclosure version is pending. (note: only one disclosure will be in pending state.)
                if (disclosure?.versionStatus == 'PENDING') {
                    this.hasPendingFCOI = true;
                    this.pendingInitialRevisionDiscl = disclosure;
                    const { SUBMITTED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED } = DISCLOSURE_REVIEW_STATUS;
                    this.hasSubmittedDisclosure = [SUBMITTED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED].includes(disclosure?.reviewStatusCode);
                }
                if (disclosure?.versionStatus !== 'PENDING') {
                    this.hasActiveFCOI = true;
                    this.activeDisclosureDetails = disclosure;
                }
            }
        });
    }

    private setInfoText(): void {
        this.infoText = '';
        this.projectType = PROJECT_TYPE_LABEL[this.projectListConfiguration.projectTypeCode];
        const CREATE_DISCLOSURE_INFO = PROJECT_INFO_TEXT_FORMAT.replace(/{PROJECT_TYPE}/g, this.projectType?.toLowerCase());
        if (this.projectListConfiguration.triggeredFrom !== 'CREATE_MODAL') {
            // info for creating initial
            if (!this.hasFCOIDisclosure) {
                this.infoText = CREATE_FCOI_DISCL_INFO_TEXT_FORMAT
                    .replace(/{PROJECT_TYPE}/g, this.projectType?.toLowerCase())
                    .replace(/{INITIAL_REVISION_BTN_NAME}/g, `Create ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL}`);
            }
            // info for creating revision
            if (this.hasFCOIDisclosure && !this.hasPendingFCOI) {
                if (this.projectListConfiguration.newEngCreatedMsg) {
                    this.infoText = CREATE_FCOI_DISCL_INFO_TEXT_FORMAT
                        .replace(/{PROJECT_TYPE}/g, this.projectType?.toLowerCase())
                        .replace(/{INITIAL_REVISION_BTN_NAME}/g, COMMON_DISCL_LOCALIZE.FCOI_REVISE_BTN);
                } else {
                    const INITIAL_REVISE_INFO = INITIAL_REVISE_INFO_TEXT_FORMAT
                        .replace(/{PROJECT_TYPE}/g, this.projectType?.toLowerCase())
                        .replace(/{INITIAL_REVISION_BTN_NAME}/g, COMMON_DISCL_LOCALIZE.FCOI_REVISE_BTN);
                    this.infoText = CREATE_DISCLOSURE_INFO + INITIAL_REVISE_INFO;
                }
            }
            // info for submitted and pending initial or revision
            if (this.hasPendingFCOI && this.hasSubmittedDisclosure) {
                if (this.projectListConfiguration.newEngCreatedMsg) {
                    this.infoText = WITHDRAW_VIEW_DISCL_SUBMITTED_INFO_TEXT_FORMAT.replace(/{PROJECT_TYPE}/g, this.projectType?.toLowerCase());
                } else {
                    this.infoText = CREATE_DISCLOSURE_INFO + DISCLOSURE_SUBMITTED_INFO_TEXT_FORMAT.replace(/{PROJECT_TYPE}/g, this.projectType?.toLowerCase());
                }
            }
        }

        // info for not submitted and pending initial or revision
        if (this.hasPendingFCOI && !this.hasSubmittedDisclosure) {
            const PENDING_FCOI_TYPE_CODE = this.pendingInitialRevisionDiscl?.fcoiTypeCode;
            const INITIAL_REVISION = PENDING_FCOI_TYPE_CODE == DISCLOSURE_TYPE.INITIAL ? COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL : COMMON_DISCL_LOCALIZE.TERM_COI_REVISION_DISCL;
            const PREFIX = 'The';
            const PENDING_REVIEW_INFO = DISCLOSURE_PENDING_INFO_TEXT_FORMAT
                .replace(/{PREFIX}/g, PREFIX)
                .replace(/{PROJECT_TYPE}/g, this.projectType?.toLowerCase())
                .replace(/{CAPS_PROJECT_TYPE}/g, this.projectType)
                .replace(/{INITIAL_REVISION}/g, INITIAL_REVISION)
            this.infoText = PENDING_REVIEW_INFO;
        }
    }

    private getProjectFetchApi(): Observable<object> {
        switch (this.projectListConfiguration.projectTypeCode) {
            case PROJECT_TYPE.AWARD: return this._userAwardsService.fetchMyAwards(this.getFetchRO());
            case PROJECT_TYPE.IP: return this._userAwardsService.fetchMyAwards(this.getFetchRO());
            case PROJECT_TYPE.DEV_PROPOSAL: return this._userAwardsService.fetchMyProposals(this.getFetchRO());
            default: return undefined;
        }
    }

    private getFetchRO(): UserProjectFetchRO {
        const { searchText, paginationLimit, currentPageNumber } = this.projectListConfiguration;
        return {
            searchWord: searchText,
            paginationLimit: paginationLimit,
            currentPage: paginationLimit ? currentPageNumber : null
        }
    }

    private fetchProjectDashboard(): void {
        this.$subscriptions.push(
            this.$fetchProjectList.pipe(
                switchMap((action: ProjectConfigActionType) => {
                    return this.getProjectFetchApi()?.pipe(
                        catchError((error) => {
                            this.userProjectList = [];
                            this.userProjectCardDetails = {};
                            this.showOrHideListAndSearch(null);
                            this.handleEmits(action, 'ERROR');
                            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                            return of('ERROR');
                        }),
                        map((response: UserProjectsResponse | 'ERROR') => ({ action, response }))
                    );
                })
            ).subscribe(
                ({ action, response }) => {
                    if (response !== 'ERROR') {
                        this.userProjectList = response?.projects || [];
                        this.setProjectCardDetails(this.userProjectList);
                        this.handleEmits(action, 'SUCCESS');
                        this.filteredCount = response?.count || 0;
                        this.showOrHideListAndSearch(response);
                    }
                }
            )
        );
    }

    private handleEmits(action: ProjectConfigActionType, apiStatus: SuccessErrorType) {
        this.projectListChanged.emit({
            action: action,
            apiStatus: apiStatus,
            searchText: this.projectListConfiguration.searchText,
            projectList: this.userProjectList,
            currentPageNumber: this.projectListConfiguration?.paginationLimit ? this.projectListConfiguration?.currentPageNumber : null,
            projectCardList: this.userProjectCardDetails
        });
    }

    private setProjectCardDetails(projectList: UserProjectDetails[]): void {
        projectList.forEach((projectDetails: UserProjectDetails) => {
            const {
                projectNumber, sponsorCode, primeSponsorCode, sponsorName, leadUnitName: homeUnitName, leadUnitNumber: homeUnitNumber, primeSponsorName, projectStatus, piName,
                projectStartDate, projectEndDate, projectBadgeColour, projectIcon, projectType, projectTypeCode, title: projectTitle, documentNumber, accountNumber, projectId,
                keyPersonRole: reporterRole
            } = projectDetails;

            this.userProjectCardDetails[projectId] = {
                projectNumber, sponsorCode, primeSponsorCode, sponsorName, homeUnitName, homeUnitNumber, primeSponsorName, projectStatus, piName, projectStartDate,
                projectEndDate, projectBadgeColour, projectIcon, projectType, projectTypeCode, projectTitle, documentNumber, accountNumber, projectId, reporterRole
            };
        });
    }

    private showOrHideListAndSearch(userProjects: UserProjectsResponse): void {
        this.isLoading = false;
        const { searchText, paginationLimit, currentPageNumber, projectTypeCode } = this.projectListConfiguration;
        const IS_SHOWING_ALL_AWARDS = searchText === '' && (currentPageNumber === 1 || !paginationLimit);
        const IS_EMPTY_PROJECTS = IS_SHOWING_ALL_AWARDS && !userProjects?.projects?.length;
        this.isShowSearchAndInfo = !IS_EMPTY_PROJECTS;
        if (IS_SHOWING_ALL_AWARDS && userProjects) {
            this.totalCount = userProjects?.count || 0;
            if (this.totalCount !== this._headerService.projectTabCount[projectTypeCode]) {
                this._headerService.projectTabCount[projectTypeCode] = this.totalCount;
                this._headerService.updateProjectTabCount(this._headerService.projectTabCount);
                this._commonService.$globalEventNotifier.next({
                    uniqueId: 'MY_PROJECT_COUNT_CHANGE',
                    content: {
                        projectListConfiguration: this.projectListConfiguration,
                        totalCount: this.totalCount
                    }
                });
            }
        }
    }

    private navigateToDisclosure(routeUrl: string, disclosureId: string | number): void {
        this._router.navigate([routeUrl], { queryParams: { disclosureId } });
    }

    searchTextChanged(): void {
        this.inputActions.emit({
            action: 'SEARCH',
            searchText: this.projectListConfiguration?.searchText,
            currentPageNumber: this.projectListConfiguration?.currentPageNumber,
        });
        this.$searchDebounceEvent.next(this.projectListConfiguration?.searchText);
    }

    clearSearch(): void {
        this.projectListConfiguration.searchText = '';
        this.searchTextChanged();
    }

    actionsOnPageChange(pageNumber: number): void {
        if (this.projectListConfiguration?.currentPageNumber !== pageNumber) {
            this.projectListConfiguration.currentPageNumber = pageNumber;
            this.inputActions.emit({
                action: 'PAGINATION',
                searchText: this.projectListConfiguration?.searchText,
                currentPageNumber: this.projectListConfiguration?.currentPageNumber,
            });
            this.$fetchProjectList.next('PAGINATION');
        }
    }

    openDisclosureCreationModal(selectedProject: UserProjectDetails): void {
        if (this.projectListConfiguration?.isShowConfirmationModal) {
            this._commonService.openProjDisclCreateModal(PROJECT_TYPE.AWARD, this.userProjectCardDetails[selectedProject?.projectId]);
        } else {
            this.inputActions.emit({
                action: 'CREATE_DISCLOSURE_BTN',
                selectedProject: selectedProject,
            });
        }
    }

    handleFCOICreation(fcoiType: FcoiType): void {
        this._headerService.triggerFCOICreation(fcoiType);
    }

    linkProjectsToDisclosure(): void {
        this.$subscriptions.push(
            this._disclosureCreateModalService.syncFCOIDisclosure(this.pendingInitialRevisionDiscl?.disclosureId, this.pendingInitialRevisionDiscl?.disclosureNumber)
            .subscribe((response: any) => {
                this.inputActions.emit({ action: 'LINK_DISCLOSURE_BTN' });
                this.navigateToDisclosure(CREATE_DISCLOSURE_RELATIONSHIP_ROUTE_URL, this.pendingInitialRevisionDiscl?.disclosureId);
            }, (error: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
    }

    viewDisclosure(): void {
        this.inputActions.emit({ action: 'VIEW_DISCLOSURE_BTN' });
        this.navigateToDisclosure(POST_CREATE_DISCLOSURE_ROUTE_URL, this.pendingInitialRevisionDiscl?.disclosureId);
    }

}
