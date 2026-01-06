import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { Observable, Subscription } from 'rxjs';
import { HeaderService } from './header.service';
import { CONSULTING_REDIRECT_URL, HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG, NotesAPI, CREATE_TRAVEL_DISCLOSURE_ROUTE_URL,
    USER_DASHBOARD_CHILD_ROUTE_URLS, OPA_CHILD_ROUTE_URLS, INITIAL_MODAL_TEXT, REMINDER_MODAL_TEXT, OPA_VERSION_TYPE,
    CREATE_DISCLOSURE_ROUTE_URL, DISCLOSURE_TYPE, FCOI_VERSION_TYPE, 
    COI_USER_HELP_ROUTE_URLS, USER_DASHBOARD_ROUTE_URL,
    ENTITY_SOURCE_TYPE_CODE, REPORTER_HOME_URL} from '../../app-constants';
import { AttachmentApiEndpoint, COIAttachmentModalInfo, COIEngagementMigrationModal,
    DeclarationVersionType,
    EngagementMigrationCount, FcoiType, GlobalEventNotifier, 
    Person, 
    UserSupportSliderConfig} from '../services/coi-common.interface';
import { CoiDisclosure, Note } from '../../disclosure/coi-interface';
import { subscriptionHandler } from '../utilities/subscription-handler';
import { UserProjectsCountResponse } from '../../shared-components/configurable-project-list/configurable-project-list.interface';
import { filter } from 'rxjs/operators';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, copyToClipboard, deepCloneObject, openCoiSlider, openCommonModal } from '../utilities/custom-utilities';
import { OpaDisclosure } from '../../opa/opa-interface';
import { ActionListCount, FCOIDisclosureCreateRO, FcoiReviseRO } from '../../shared-components/shared-interface';
import { DeclarationType, UserDeclaration } from '../../declarations/declaration.interface';
import { EngagementsMigDashboardRO } from '../../migrated-engagements/migrated-engagements-interface';
import { DECLARATION_VERSION_TYPE, DECLARATION_ROUTE_URLS } from '../../declarations/declaration-constants';
import { CMP_LOCALIZE, COMMON_DISCL_LOCALIZE } from '../../app-locales';
import { MatMenuTrigger } from '@angular/material/menu';
import { NavigationService } from '../services/navigation.service';
import { EntityCreationResponse, EntityUpdateClass } from '../../entity-management-module/shared/entity-interface';
import { CmpCreationConfig } from '../../conflict-management-plan/shared/management-plan.interface';

declare const $: any;
class ChangePassword {
    password = '';
    reEnterPassword = '';
}
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {

    logo: any;
    isAccessible = false;
    personId: any;
    fullName = '';
    profilePicLetters = '';
    clearField: String = '';
    isMaleUser = this.commonService.getCurrentUserDetail('gender') === 'M';
    isAdmin = true;
    resetPassword = new ChangePassword();
    showReEnterPassword = false;
    showPassword = false;
    passwordValidation = new Map();
    timer: any = {password: null, confirmPassword: null};
    $subscriptions: Subscription[] = [];
    homeNavigation: string = '';
    noteComment: any;
    isShowCreateOrReviseModal = false;
    triggeredFrom = '';
    reviseObject: any = { revisionComment: null, disclosureId: null };
    isShowNavBarOverlay = false;
    notesHelpTexts = `You can view and edit notes under the 'Notes' tab.`;
    addAttachmentHelpText: string= '';
    attachmentApiEndpoint =  new AttachmentApiEndpoint();
    showSlider = false;
    notesAPICallsForEditor: NotesAPI = {add: '/notes/save'};
    isShowHeaderAddNoteSlider = false;
    userDashboardRoutingUrls = USER_DASHBOARD_CHILD_ROUTE_URLS;
    isShowDisclosureTab = false;
    isShowCreateButton = false;
    isShowAccessibilitySettings = false;
    engagementMigrationModalID = 'coi-welcome-modal'
    engMigrationDetails = {
        engagementMigrationModalConfig: new CommonModalConfig(this.engagementMigrationModalID, 'Proceed', '', 'xl'),
        isShowEngagementMigrationModal: false,
        engagementMigrationModal: new COIEngagementMigrationModal(),
        isInitialLogin: false,
        isEngagementMigrationPending: false
    };
    fcoiReviseRO = new FcoiReviseRO();
    isSaving = false;
    shouldShowHamburger = false;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    CMP_LOCALIZE = CMP_LOCALIZE;
    userHelpLink = COI_USER_HELP_ROUTE_URLS.FAQ;
    pendingActionItemCount: number | string | null;
    userSupportConfig: UserSupportSliderConfig = {
        copiedIndex: [],
        copyTimeouts: {},
        isOpenSlider: false,
        sliderId: 'coi-user-support-slider',
    };
    declarationActionMap: Map<string | number, { label: string, title: string, action: 'MASTER' | 'REVISION' } | null> = new Map();
    @ViewChild(MatMenuTrigger) createActionMenu!: MatMenuTrigger;

    @HostListener('window:resize', ['$event'])
    listenScreenSize(event: Event) {
        this.calculateNavVisibility();
        this.closeHeaderMenuBar();
    }

    constructor(public router: Router, private _navigationService: NavigationService,
                public commonService: CommonService, public headerService: HeaderService) {
        this.logo = environment.deployUrl + './assets/images/logo.png';
    }

    closeHeaderMenuBar(): void {
        const NAV_ELEMENT = document.getElementById('coi-header-responsive-nav');
        NAV_ELEMENT.classList.remove('show-menu');
        this.isShowNavBarOverlay = false;
    }

    onClickMenuBar() {
        const NAV_ELEMENT = document.getElementById('coi-header-responsive-nav');
        const IS_MENU_SHOW = NAV_ELEMENT.classList.contains('show-menu');
        if (!this.shouldShowHamburger) {
            this.isShowNavBarOverlay = false;
            return;
        }
        if (IS_MENU_SHOW) {
            NAV_ELEMENT.classList.remove('show-menu');
            this.isShowNavBarOverlay = false;
        } else {
            NAV_ELEMENT.classList.add('show-menu');
            this.isShowNavBarOverlay = true;
        }   
    }

    ngOnInit() {
        this.fullName = this.commonService.getCurrentUserDetail('fullName');
        this.setProfileIcon();
        this.showDisclosureTab();
        this.handleAttachmentEndPoint();
        this.navigateForHomeIcon();
        this.openModalTriggeredFromChild();
        this.listenToGlobalNotifier();
        const IS_USER_DASHBOARD_MODULE = this.router.url.includes(USER_DASHBOARD_ROUTE_URL);
        this.isShowCreateButton = IS_USER_DASHBOARD_MODULE;
        this.handleCreateButtonVisibilityOnRouteChange();
        this.checkEngagementsToMigrate();
        this.checkIsPendingActionItem();
        if (!IS_USER_DASHBOARD_MODULE) {
            this.headerService.triggerProjectsTabCount();
        }
    }

    ngAfterViewInit(): void {
        this.calculateNavVisibility();
    }

    private setProfileIcon(): void {
        const FIRST_NAME = this.commonService.getCurrentUserDetail('firstName');
        const LAST_NAME = this.commonService.getCurrentUserDetail('lastName');
        this.profilePicLetters = FIRST_NAME[0] + LAST_NAME[0];
    }

    private fetchEngagementsToMigrate(): void {
        this.$subscriptions.push(this.headerService.fetchEngagementsToMigrate()
            .subscribe((engagementMigrationCount: EngagementMigrationCount) => {
                this.headerService.hasPendingMigrations = this.checkReviewPending(engagementMigrationCount);
                this.headerService.migratedEngagementsCount = engagementMigrationCount;
            }, (error: any) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, "Engagement Error");
            }));
    }

    private checkEngagementsToMigrate(): void {
        if (!this.commonService.isEnableLegacyEngMig) return;
        if (this.headerService.migratedEngagementsCount) {
            this.engMigrationDetails.isEngagementMigrationPending = this.checkReviewPending(this.headerService.migratedEngagementsCount);
            this.showModalIfNeeded(this.headerService.migratedEngagementsCount);
            return;
        }
    }

    private showModalIfNeeded(count: EngagementMigrationCount): void {
        const ALLOWED_ROUTES = [
            '/migrated-engagements',
            '/create-sfi',
            '/entity-details'
        ];
        if (this.checkReviewPending(count) &&
            !ALLOWED_ROUTES.some(route => this.router.url.includes(route))) {
            this.setAndOpenModalContent(count);
        }
    }

    private checkReviewPending(count: EngagementMigrationCount): boolean {
        return count?.toReviewCount > 0 || count?.inProgressCount > 0;
    }

    private setAndOpenModalContent(engagementMigrationCount: EngagementMigrationCount): void {
        const { totalCount: TOTAL_COUNT, toReviewCount: REVIEW_COUNT, inProgressCount: IN_PROGRESS_COUNT } = engagementMigrationCount;
        if (REVIEW_COUNT === 0 && IN_PROGRESS_COUNT === 0) return;
        this.engMigrationDetails.isShowEngagementMigrationModal = true;
        this.engMigrationDetails.isInitialLogin = TOTAL_COUNT === REVIEW_COUNT;
        const MODAL_CONTENT = this.engMigrationDetails.isInitialLogin ? INITIAL_MODAL_TEXT : REMINDER_MODAL_TEXT;
        this.engMigrationDetails.engagementMigrationModal = {
            header: MODAL_CONTENT.header,
            message: MODAL_CONTENT.message,
            proceedText: MODAL_CONTENT.proceedText,
            closingText: MODAL_CONTENT.closingText
        };
        this.engMigrationDetails.engagementMigrationModalConfig.styleOptions.closeBtnClass = 'invisible';
        setTimeout(() => {
            openCommonModal(this.engagementMigrationModalID);
        }, 50);
    }

    private showDisclosureTab(): void {
        this.isShowDisclosureTab = this.commonService?.isShowFinancialDisclosure || this.commonService?.isShowOpaDisclosure 
            || this.commonService?.isShowTravelDisclosure || this.commonService?.isShowConsultingDisclosure;
    }

    private handleCreateButtonVisibilityOnRouteChange(): void {
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            this.isShowCreateButton = event.urlAfterRedirects.includes('coi/user-dashboard');
        });
    }

    private handleAttachmentEndPoint(): void {
        Object.assign(this.attachmentApiEndpoint, {
            attachmentTypeEndpoint: '/loadDisclAttachTypes',
            saveOrReplaceEndpoint: '/saveOrReplaceAttachments'
        });
    }

    private getActiveDisclosures(): Promise<boolean> {
        return new Promise((resolve) => {
            this.$subscriptions.push(
                this.headerService.getActiveDisclosure().subscribe(
                    (res: any) => {
                        this.headerService.setActiveDisclosures(res);
                        resolve(true);
                    }, (ERROR: any) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                        resolve(false);
                    }
                )
            );
        });
    }
 
    private createDeclarationActionMap(): void {
        this.declarationActionMap = new Map();
        this.commonService.activeDeclarationTypes?.forEach((declarationTypeConfig: DeclarationType) => {
            const DECLARATION_ACTION_TYPE = this.headerService.getCreateOrReviseDeclaration(declarationTypeConfig.declarationTypeCode);
            switch (DECLARATION_ACTION_TYPE) {
                case 'CREATE_DECLARATION': {
                    const LABEL = declarationTypeConfig.declarationType;
                    this.declarationActionMap.set(declarationTypeConfig.declarationType,
                        { label: LABEL, title: `Click here to create ${declarationTypeConfig.declarationType}`, action: 'MASTER' });
                    break;
                }
                case 'VIEW_DECLARATION': {
                    const LABEL = declarationTypeConfig.declarationType;
                    this.declarationActionMap.set(declarationTypeConfig.declarationType,
                        { label: LABEL, title: `Click here to view ${declarationTypeConfig.declarationType}`, action: 'MASTER' });
                    break;
                }
                case 'REVISE_DECLARATION': {
                    const LABEL = `${declarationTypeConfig.declarationType} Revision`;
                    this.declarationActionMap.set(declarationTypeConfig.declarationType,
                        { label: LABEL, title: `Click here to revise ${declarationTypeConfig.declarationType}`, action: 'REVISION' });
                    break;
                }
                default:
                    const LABEL = declarationTypeConfig.declarationType;
                    this.declarationActionMap.set(declarationTypeConfig.declarationType,
                        { label: LABEL, title: `Click here to view ${declarationTypeConfig.declarationType}`, action: 'MASTER' });
                    break;
            }
        });
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            const CONTENT = data.content;
            switch (data.uniqueId) {
                case 'TRIGGER_HEADER_TAB_COUNT_UPDATE':
                    if (CONTENT?.tabName === 'PROJECTS') {
                        this.getProjectTabCount();
                    }
                    break;
                case 'TRIGGER_ROUTER_NAVIGATION_END':
                    this.checkEngagementsToMigrate();
                    break;
                case 'TRIGGER_MIGRATION_COUNT_UPDATE':
                    this.fetchEngagementsToMigrate();
                    break;
                case 'TRIGGER_FCOI_DISCLOSURE_CREATION':
                    this.createOrReviseFCOIDisclosure(CONTENT);
                    break;
                case 'TRIGGER_OPA_DISCLOSURE_CREATION':
                    this.createOrReviseOpaDisclosure();
                    break;
                case 'TRIGGER_DECLARATION_DISCLOSURE_CREATION':
                    this.createOrReviseDeclaration(CONTENT?.declarationVersionType, CONTENT?.declarationTypeConfig);
                    break;
                case 'FETCH_PENDING_ACTION_ITEMS_COUNT':
                    this.checkIsPendingActionItem();
                    break;
                default: break;
            }
        }));
    }
    
    private getProjectTabCount(): void {
        this.$subscriptions.push(this.headerService.fetchMyProjectsCount()
            .subscribe((userProjectsCount: UserProjectsCountResponse) => {
                this.headerService.updateProjectTabCount(userProjectsCount);
            }, (error: any) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch header tab count.');
            }));
    }

    /**
     * Creates a new OPA disclosure or redirects to a pending one if it exists.
     * - If no active disclosures exist, initiates a new OPA disclosure.
     * - If a pending OPA disclosure exists, redirects to it.
     * - Otherwise, proceeds to revise the existing OPA disclosure.
     */
    private async createOrReviseOpaDisclosure(): Promise<void> {
        const RES = await this.getActiveDisclosures();
        if (!RES) { return; }
        const ACTIVE_OPA_DISCLOSURES = this.headerService.activeOPAs || [];
        if (ACTIVE_OPA_DISCLOSURES.length === 0) {
            this.createOPADisclosure();
            return;
        }
        const PENDING_OPA = ACTIVE_OPA_DISCLOSURES.find(disclosure => String(disclosure?.versionStatus) === String(OPA_VERSION_TYPE.PENDING));
        PENDING_OPA?.opaDisclosureId ? this.headerService.redirectToOPADisclosure(PENDING_OPA.opaDisclosureId) : this.reviseOPADisclosure();
    }

    private createOPADisclosure(): void {
        const PERSON_ID = this.commonService.getCurrentUserDetail('personID');
        const HOME_UNIT = this.commonService.getCurrentUserDetail('unitNumber');
        const API_REQUEST = this.headerService.createOPA(PERSON_ID, HOME_UNIT);
        this.handleOpaDisclosure(API_REQUEST, 'Failed to create OPA disclosure. Please try again later.');
    }

    private reviseOPADisclosure(): void {
        const ACTIVE_OPA = this.headerService.activeOPAs.find(d => d?.versionStatus === OPA_VERSION_TYPE.ACTIVE);
        if (!ACTIVE_OPA) return;
        const API_REQUEST = this.headerService.reviseOPA(ACTIVE_OPA.opaDisclosureId, ACTIVE_OPA.opaDisclosureNumber);
        this.handleOpaDisclosure(API_REQUEST, 'Failed to revise OPA disclosure. Please try again later.');
    }

    private handleOpaDisclosure(apiRequest: Observable<any>, errorMessage: string): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(apiRequest.subscribe({
                next: (res: OpaDisclosure) => {
                    this.isSaving = false;
                    if (res?.opaDisclosureId) {
                        this.router.navigate([OPA_CHILD_ROUTE_URLS.FORM], { queryParams: { disclosureId: res?.opaDisclosureId } });
                    } else {
                        this.commonService.showToast(HTTP_ERROR_STATUS, errorMessage);
                    }
                },
                error: (err: any) => { this.handleOpaCreationError(err, errorMessage); }
            }));
        }
    }

    private handleOpaCreationError(err: any, errorMessage: string): void {
        this.isSaving = false;
        const ERROR_MSG = err?.error;
        if (err?.status === 405) {
            this.commonService.concurrentUpdateAction = 'opa disclosure';
        } else if (err?.status === 406) {
            this.headerService.triggerDisclosureValidationModal(ERROR_MSG);
        } else {
            const MSG = err?.error?.errorMessage || errorMessage;
            this.commonService.showToast(HTTP_ERROR_STATUS, MSG);
        }
    }

    private createDeclaration(declarationTypeConfig: DeclarationType): void {
        const API_REQUEST = this.headerService.createDeclarationForm({ declarationTypeCode: declarationTypeConfig?.declarationTypeCode });
        this.handleDeclarationCreations(declarationTypeConfig, API_REQUEST, `Failed to create ${declarationTypeConfig?.declarationType}. Please try again later.`);
    }

    private reviseDeclaration(declarationTypeConfig: DeclarationType): void {
        const ACTIVE_OPA = this.headerService.activePendingDeclarations.find(declaration => 
            declaration?.versionStatus === DECLARATION_VERSION_TYPE.ACTIVE &&
            String(declaration?.declarationTypeCode) === String(declarationTypeConfig?.declarationTypeCode)
        );
        if (!ACTIVE_OPA) return;
        const API_REQUEST = this.headerService.reviseDeclarationForm({ declarationTypeCode: declarationTypeConfig?.declarationTypeCode });
        this.handleDeclarationCreations(declarationTypeConfig, API_REQUEST, `Failed to revise ${declarationTypeConfig?.declarationType}. Please try again later.`);
    }

    private handleDeclarationCreations(declarationTypeConfig: DeclarationType, apiRequest: Observable<any>, errorMessage: string): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(apiRequest.subscribe({
                next: (res: UserDeclaration) => {
                    this.isSaving = false;
                    if (res?.declaration?.declarationId) {
                        this.router.navigate([DECLARATION_ROUTE_URLS.FORM], { queryParams: { declarationId: res.declaration.declarationId } });
                    } else {
                        this.commonService.showToast(HTTP_ERROR_STATUS, errorMessage);
                    }
                },
                error: (err: any) => { this.handleDeclarationCreationError(err, errorMessage, declarationTypeConfig); }
            }));
        }
    }

    private handleDeclarationCreationError(err: any, errorMessage: string, declarationTypeConfig: DeclarationType): void {
        this.isSaving = false;
        if (err?.status === 405) {
            this.commonService.concurrentUpdateAction = `${declarationTypeConfig?.declarationType} declaration`;
        } else {
            const MSG = err?.error?.errorMessage || errorMessage;
            this.commonService.showToast(HTTP_ERROR_STATUS, MSG);
        }
    }

    /**
     * Creates a new FCOI disclosure or redirects to a pending one if it exists.
     * - If no active disclosures exist, initiates a new FCOI disclosure.
     * - If a pending FCOI disclosure exists, redirects to it.
     * - Otherwise, proceeds to revise the existing FCOI disclosure.
     */
    private async createOrReviseFCOIDisclosure(fcoiType: FcoiType): Promise<void> {
        const RES = await this.getActiveDisclosures();
        if (!RES) { return; }
        const ACTIVE_FCOI_DISCLOSURES = this.headerService.activeDisclosures || [];
        if (ACTIVE_FCOI_DISCLOSURES.length === 0) {
            this.createFCOIDisclosure(fcoiType);
            return;
        }
        const PENDING_FCOI = ACTIVE_FCOI_DISCLOSURES.find(disclosure => String(disclosure?.versionStatus) === String(FCOI_VERSION_TYPE.PENDING));
        PENDING_FCOI?.disclosureId ? this.headerService.redirectToFCOIDisclosure(PENDING_FCOI) : this.reviseFCOIDisclosure(fcoiType);
    }

    private createFCOIDisclosure(fcoiType: FcoiType): void {
        const FCOI_DISCLOSURE_RO: FCOIDisclosureCreateRO = {
            fcoiTypeCode: DISCLOSURE_TYPE.INITIAL,
            homeUnit: this.commonService.getCurrentUserDetail('unitNumber'),
            personId: this.commonService.getCurrentUserDetail('personID')
        };
        const API_REQUEST = this.headerService.createInitialDisclosure(FCOI_DISCLOSURE_RO);
        this.handleFCOIDisclosure(API_REQUEST, 'Failed to create disclosure. Please try again later.', fcoiType);
    }

    private reviseFCOIDisclosure(fcoiType: FcoiType): void {
        const ACTIVE_FCOI = this.headerService.activeDisclosures.find(d => d?.versionStatus === FCOI_VERSION_TYPE.ACTIVE);
        if (!ACTIVE_FCOI) return;
        this.fcoiReviseRO.disclosureId = ACTIVE_FCOI.disclosureId;
        const API_REQUEST = this.headerService.reviseFcoiDisclosure(this.fcoiReviseRO);
        this.handleFCOIDisclosure(API_REQUEST, 'Failed to revise disclosure. Please try again later.', fcoiType);
    }

    private handleFCOIDisclosure(apiRequest: Observable<any>, errorMessage: string, fcoiType: FcoiType): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(apiRequest.subscribe({
                next: (res: CoiDisclosure) => {
                    this.isSaving = false;
                    if (res?.disclosureId) {
                        this.router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: res?.disclosureId } });
                    } else {
                        this.commonService.showToast(HTTP_ERROR_STATUS, errorMessage);
                    }
                },
                error: (err: any) => { this.handleFCOICreationError(err, errorMessage, fcoiType); }
            }));
        }
    }

    private handleFCOICreationError(err: any, errorMessage: string, fcoiType: FcoiType): void {
        this.isSaving = false;
        const ERROR_MSG = err?.error;
        if (err?.status === 405) {
            this.commonService.concurrentUpdateAction = `${COMMON_DISCL_LOCALIZE.TERM_COI} disclosure`;
        } else if (err?.status === 406) {
            this.headerService.triggerDisclosureValidationModal(ERROR_MSG); 
        } else {
            this.commonService.showToast(HTTP_ERROR_STATUS, errorMessage);
        }
    }

    navigateForHomeIcon(): void {
        this.homeNavigation = '#' + USER_DASHBOARD_CHILD_ROUTE_URLS.MY_HOME_ROUTE_URL;
    }

    ngOnDestroy(): void {
        subscriptionHandler([...this.$subscriptions, ...this.headerService.$subscriptions]);
    }

    private clearLegacyMigrationDetails(): void {
        if (this.commonService.isEnableLegacyEngMig && this.engMigrationDetails.isEngagementMigrationPending) {
            this.headerService.migratedEngagementDashboardRO = new EngagementsMigDashboardRO();
        }
    }

    private navigateToLogout(): void {
        this.router.navigate(['/logout']);
    }

    private checkIsPendingActionItem(): void {
        this.$subscriptions.push(this.headerService.checkIsPendingActionItem().subscribe((data: ActionListCount) => {
            this.pendingActionItemCount = data?.count;
        },
        error => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }))
    }

    clearPasswordFields() {
        this.passwordValidation.clear();
        this.resetPassword = new ChangePassword();
    }

    isValidPassword(): boolean {
        this.passwordValidation.clear();
        this.passwordAtleast7Characters();
        this.confirmPasswordSame();
        return !this.passwordValidation.size;
    }

    passwordLengthValidator() {
        clearTimeout(this.timer.password);
        this.timer.password = setTimeout(() => {
            this.resetPassword.password = this.resetPassword.password.trim();
            this.passwordValidation.delete('password-length');
            this.passwordAtleast7Characters();
        });
    }

    checkSamePassword() {
        this.resetPassword.reEnterPassword = this.resetPassword.reEnterPassword.trim();
        if (this.resetPassword.reEnterPassword) {
            clearTimeout(this.timer.confirmPassword);
            this.timer.confirmPassword = setTimeout(() => {
                this.passwordValidation.delete('same-password');
                this.confirmPasswordSame();
            }, 500);
        }
    }

    async openCreateMenu(elementId: string) {
        await this.headerService.getAvailableDeclarations();
        this.createDeclarationActionMap();
        if (elementId) {
            this.createActionMenu.openMenu();
        }
    }

    private passwordAtleast7Characters() {
        if (this.resetPassword.password.length < 7) {
            this.passwordValidation.set('password-length', true);
        }
    }

    private confirmPasswordSame() {
        if (this.resetPassword.password !== this.resetPassword.reEnterPassword) {
            this.passwordValidation.set('same-password', true);
        }
    }

    showNotes() {
        this.commonService.isShowCreateNoteModal = true;
        setTimeout(() => {
            document.getElementById("textArea").focus();
        });
    }

    closeAddNote() {
        this.commonService.isShowCreateNoteModal = false;
        this.noteComment = '';
    }

    openHeaderEditorSlider(): void {
        let notesObj = new Note();
        notesObj.personId = this.commonService.getCurrentUserDetail('personID');
        delete notesObj.noteId;
        this.isShowHeaderAddNoteSlider = true;
        setTimeout(() => {
            this.commonService.$globalEventNotifier.next({ uniqueId: 'NOTES_EDITOR', content: {note: notesObj, sliderMode: 'EDIT', isEditMode: true} });
        });
    }

    updateAndCloseSlider(event: {notesObj: Note|null}): void {
        if(event?.notesObj?.noteId) {
            this.commonService.$updateNoteList.next(event?.notesObj);
        }
        this.isShowHeaderAddNoteSlider = false;
    }

    outputEventAction(event) {
        if (event.closeModal != null) {
            this.isShowCreateOrReviseModal = event.closeModal;
        }
    }

    openTravelDisclosure(): void {
        this.getCreateTravelRequestObject();
        this.router.navigate([CREATE_TRAVEL_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: null } }); // Redirect to travel engagements page
    }

    private getCreateTravelRequestObject(): void {
        sessionStorage.setItem('travelCreateModalDetails', JSON.stringify(
            {
                homeUnit: this.commonService.getCurrentUserDetail('unitNumber'),
                description: this.reviseObject.revisionComment,
                personId: this.commonService.getCurrentUserDetail('personID'),
                homeUnitName: this.commonService.getCurrentUserDetail('userName')
            }
        ));
    }

    async getActiveDisclosureAndOpenModal() {
        await this.getActiveDisclosures();
        this.isShowCreateOrReviseModal = true;
    }

    openProjectDisclosure(projectTypeCode?: string | number): void {
        this.commonService.openProjDisclCreateModal(projectTypeCode);
    }

    openReviseModal() {
        this.reviseObject = {revisionComment: null, disclosureId: null};
        this.reviseObject.revisionComment = '';
        this.triggeredFrom = 'FCOI_DISCLOSURE';
        this.isShowCreateOrReviseModal = true;
    }

    openCreateSFI() {
        this.router.navigate(['/coi/create-sfi/create'], { queryParams: { type: 'SFI' } });
    }

    openModalTriggeredFromChild() {
        this.$subscriptions.push(this.headerService.$openModal.subscribe((type: FcoiType | 'CREATE_TRAVEL_DISCLOSURE') => {
            if (['INITIAL', 'REVISION'].includes(type)) {
                this.openReviseModal();
            }
            if (type === 'CREATE_TRAVEL_DISCLOSURE') {
                this.openTravelDisclosure();
            }
        }));
    }

    createConsultingDisclosure(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const PERSON_ID = this.commonService.getCurrentUserDetail('personID');
            const HOME_UNIT = this.commonService.getCurrentUserDetail('unitNumber');
            this.$subscriptions.push(
                this.headerService.createConsultingForm(PERSON_ID, HOME_UNIT)
                    .subscribe((res: any) => {
                        this.isSaving = false;
                        if (res) {
                            this.router.navigate([CONSULTING_REDIRECT_URL], { queryParams: { disclosureId: res.disclosureId } });
                        } else {
                            this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to create consulting disclosure');
                        }
                    }, (error: any) => {
                        this.isSaving = false;
                        this.commonService.showToast(HTTP_ERROR_STATUS, 'Failed to create consulting disclosure');
                    }));
        }
    }

    changeTheme(themename: string) {
        document.querySelector("html").className = '';
        document.querySelector("html").classList.add(themename);
        $('#dissmiss-btn').click();
    }

    openPersonDetailsModal(): void {
        this.commonService.openPersonDetailsModal(this.commonService.getCurrentUserDetail('personID'));
    }


    // for closing notes popup while clicking escape key
    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            if (this.commonService.isShowCreateNoteModal) {
                this.closeAddNote();
            }
        }
    }

    openAttachmentModal(): void {
        const ATTACHMENT_MODAL_INFO = new COIAttachmentModalInfo();
        ATTACHMENT_MODAL_INFO.attachmentInputType = 'ADD';
        ATTACHMENT_MODAL_INFO.attachmentApiEndpoint = this.attachmentApiEndpoint;
        this.commonService.openCommonAttachmentModal(ATTACHMENT_MODAL_INFO);
    }

    reloadMyProjects(): void {
        this.headerService.triggerProjectsTabCount();
        this.commonService.$globalEventNotifier.next({ uniqueId: 'RELOAD_MY_PROJECTS' });
    }

    postConfirmation(event: ModalActionEvent): void {
        if (event.action === 'PRIMARY_BTN') {
            closeCommonModal(this.engagementMigrationModalID);
            setTimeout(() => {
                this.engMigrationDetails.isShowEngagementMigrationModal = false;
                this.engMigrationDetails.engagementMigrationModal = new COIEngagementMigrationModal();
                this.router.navigate(['/coi/migrated-engagements']);
            }, 200);
        }
    }

    openLogoutConfirmationModal(): void {
        this.headerService.logoutConfirmModalConfig.isOpenModal = true;
        this.navigateToLogout();
    }

    postLogoutConfirmation(event: ModalActionEvent): void {
        closeCommonModal(this.headerService.logoutConfirmModalConfig?.modalConfig?.namings?.modalName);
        const TIMEOUT_REF = setTimeout(() => {
            this.headerService.logoutConfirmModalConfig = {
                isOpenModal: false,
                modalConfig: new CommonModalConfig('coi-logout-confirm-modal', 'Exit', 'Cancel', '')
            };
            if (event.action === 'PRIMARY_BTN') {
                this.clearLegacyMigrationDetails();
                this.navigateToLogout();
            }
            clearTimeout(TIMEOUT_REF);
        }, 200);
    }

    /**
     * Creates or revises a declaration based on current state:
     * - Creates a new declaration if none exist.
     * - Redirects to a pending declaration of the given type if available.
     * - Otherwise, if action is revision then initiates a revision for the given declaration type.
     */
    async createOrReviseDeclaration(declarationVersionType: DeclarationVersionType, declarationTypeConfig: DeclarationType): Promise<void> {
        const IS_FETCHING_DECLARATION_SUCCESS = await this.headerService.getAvailableDeclarations();
        if (!IS_FETCHING_DECLARATION_SUCCESS) { return; }
        const AVAILABLE_DECLARATIONS = this.headerService.activePendingDeclarations?.filter(declaration =>
            String(declaration?.declarationTypeCode) === String(declarationTypeConfig?.declarationTypeCode)) || [];
        if (!AVAILABLE_DECLARATIONS.length) {
            this.createDeclaration(declarationTypeConfig);
            return;
        }
        const PENDING_DECLARATION = AVAILABLE_DECLARATIONS.find(({ versionStatus }) => versionStatus === DECLARATION_VERSION_TYPE.PENDING);
        if (PENDING_DECLARATION?.declarationId) {
            this.headerService.redirectToDeclaration(PENDING_DECLARATION.declarationId);
            return;
        }
        const ACTIVE_DECLARATION = AVAILABLE_DECLARATIONS.find(({ versionStatus }) => versionStatus === DECLARATION_VERSION_TYPE.ACTIVE);
        if (declarationVersionType === 'MASTER' && ACTIVE_DECLARATION?.declarationId) {
            this.headerService.redirectToDeclaration(ACTIVE_DECLARATION.declarationId);
            return;
        }
        if (declarationVersionType === 'REVISION') {
            this.reviseDeclaration(declarationTypeConfig);
            return;
        }
    }

    private calculateNavVisibility(): void {
        setTimeout(() => {
            const HEADER = document.getElementById('coi-header-card');
            const NAV_CONTAINER = document.getElementById('coi-header-responsive-nav');
            const RIGHT_SECTION = HEADER?.querySelector('.header-right-content');

            if (!HEADER || !NAV_CONTAINER) return;
            const ROOT = document.documentElement;
            ROOT.classList.remove('nav-collapsed');

            const HEADER_WIDTH = HEADER.clientWidth;
            const LOGO_WIDTH = HEADER.querySelector('.logo')?.clientWidth || 0;
            const RIGHT_SIDE_WIDTH = RIGHT_SECTION?.clientWidth || 0;
            const RESERVED_SPACE = LOGO_WIDTH + RIGHT_SIDE_WIDTH + 200;
            const AVAILABLE_WIDTH = HEADER_WIDTH - RESERVED_SPACE;

            const NAV_ITEMS = Array.from(NAV_CONTAINER.getElementsByTagName('li'));
            const REQUIRED_WIDTH = NAV_ITEMS.reduce((sum, item) => {
                const STYLE = window.getComputedStyle(item);
                return STYLE.display !== 'none' ? sum + item.clientWidth : sum;
            }, 0);
            this.shouldShowHamburger = REQUIRED_WIDTH > AVAILABLE_WIDTH;
            if (this.shouldShowHamburger) {
                ROOT.classList.add('nav-collapsed');
            }
        }, 0);
    }

    private openUserSupportSlider(): void {
        this.userSupportConfig.isOpenSlider = true;
        setTimeout(() => {
            openCoiSlider(this.userSupportConfig?.sliderId);
        });
    }

    fetchAndOpenUserSupportSlider(): void {
        if (!this.userSupportConfig?.isOpenSlider) {
            if (this.headerService.landingConfig?.supportAssistanceConfig) {
                this.openUserSupportSlider();
                return;
            }
            this.$subscriptions.push(
                this.headerService.getMetaDataForLanding()
                    .subscribe((res: any) => {
                        this.headerService.landingConfig = res;
                        this.openUserSupportSlider();
                    }, (error: any) => {
                        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                )
            );
        }
    }

    closeUserSupportSlider(): void {
        const TIMEOUT_REF = setTimeout(() => {
            this.userSupportConfig.copiedIndex = [];
            this.userSupportConfig.copyTimeouts = {};
            this.userSupportConfig.isOpenSlider = false;
            clearTimeout(TIMEOUT_REF);
        }, 500);
    }

    /**
     * Copies the given value to clipboard and manages copied state for the given index.
     * Prevents multiple quick clicks and resets the copied state after a timeout.
     *
     * @param copyValue - The text or number to be copied.
     * @param index - Index used to track the copied state in userSupportConfig.
     */
    copyToClipboard(copyValue: string | number, index: number): void {
        if (this.userSupportConfig.copiedIndex[index]) {
            return;
        }
        const COPY_CONTAINER = document.getElementById('copy-to-clipboard-container');
        copyToClipboard(copyValue, COPY_CONTAINER);
        this.userSupportConfig.copiedIndex[index] = true;
        if (this.userSupportConfig.copyTimeouts?.[index]) {
            clearTimeout(this.userSupportConfig.copyTimeouts[index]);
        }
        this.userSupportConfig.copyTimeouts[index] = setTimeout(() => {
            this.userSupportConfig.copiedIndex[index] = false;
            delete this.userSupportConfig.copyTimeouts[index];
        }, 1000);
    }

    openCreateCmpSlider(): void {
        const CMP_CONFIG = new CmpCreationConfig();
        const PERSON: Person = {
            personId: this.commonService.getCurrentUserDetail('personID'),
            fullName: this.commonService.getCurrentUserDetail('fullName'),
            emailAddress: this.commonService.getCurrentUserDetail('email'),
            primaryTitle: this.commonService.getCurrentUserDetail('primaryTitle'),
            unit: {
                unitNumber: this.commonService.getCurrentUserDetail('unitNumber'),
                unitName: this.commonService.getCurrentUserDetail('unitName'),
                displayName: this.commonService.getPersonLeadUnitDetails(this.commonService.currentUserDetails)
            }
        }
        CMP_CONFIG.cmpDetails.person = PERSON;
        CMP_CONFIG.disabledFields = { 'PERSON_SEARCH': true, SUB_AWARD_INVESTIGATOR: true };
        this.commonService.openCmpCreationSlider(CMP_CONFIG);
    }

}
