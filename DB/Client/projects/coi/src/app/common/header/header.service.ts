import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../services/common.service';
import { ActiveDisclosure } from "../../user-dashboard/user-disclosure/user-disclosure-interface";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import { EngagementMigrationCount, COIValidationModalConfig, FcoiType, OPAType, DeclarationVersionType, DocumentActionStorageEvent } from '../services/coi-common.interface';
import { UserProjectsCountRO, UserProjectsCountResponse } from '../../shared-components/configurable-project-list/configurable-project-list.interface';
import { COMMON_ERROR_TOAST_MSG, CREATE_DISCLOSURE_ROUTE_URL, DISCLOSURE_REVIEW_STATUS, ENTITY_SOURCE_TYPE_CODE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, OPA_CHILD_ROUTE_URLS, OPA_VERSION_TYPE, POST_CREATE_DISCLOSURE_ROUTE_URL } from '../../app-constants';
import { FCOIDisclosureCreateRO, FcoiReviseRO } from '../../shared-components/shared-interface';
import { Router } from '@angular/router';
import { EngagementsMigDashboardRO } from '../../migrated-engagements/migrated-engagements-interface';
import { Declaration, DeclarationType, UserDeclaration } from '../../declarations/declaration.interface';
import { DECLARATION_ROUTE_URLS, DECLARATION_VERSION_TYPE } from '../../declarations/declaration-constants';
import { CommonModalConfig } from '../../shared-components/common-modal/common-modal.interface';
import { LandingConfig } from '../../user-dashboard/user-home/user-home.interface';
import { environment } from '../../../environments/environment';
import { FormValidationList, PersistentNotifications, QuestionnaireEvent } from '../../shared/common.interface';
import { CMP_ROUTE_URLS } from '../../conflict-management-plan/shared/management-plan-constants';
import { deepCloneObject, fileDownloader, openInNewTab } from '../utilities/custom-utilities';
import { EntityUpdateClass, EntityCreationResponse } from '../../entity-management-module/shared/entity-interface';
import { COIAttachment } from '../../attachments/attachment-interface';

@Injectable()
export class HeaderService {

    migrationChecked = false;
    hasPendingMigrations = false;
    migratedEngagementsCount = new EngagementMigrationCount();
    migratedEngagementDashboardRO = new EngagementsMigDashboardRO();
    activeDisclosures: ActiveDisclosure[] = [];
    activeOPAs = [];
    activePendingDeclarations: Declaration[] = [];
    projectTabCount: UserProjectsCountResponse = {
        totalCount: 0
    };
    opaCreationType: OPAType | null = null;
    $openModal = new Subject<FcoiType | 'CREATE_TRAVEL_DISCLOSURE'>();
    logoutConfirmModalConfig = {
        isOpenModal: false,
        modalConfig: new CommonModalConfig('coi-logout-confirm-modal', 'Exit', 'Cancel', '')
    };
    landingConfig: LandingConfig | null = null;
    $globalPersistentEventNotifier: PersistentNotifications = {
        $questionnaire: new BehaviorSubject<QuestionnaireEvent | null>(null),
        $formValidationList: new BehaviorSubject<FormValidationList[]>([]),
        $validationScrollId: new BehaviorSubject<string>('')
    };
    $subscriptions: Subscription[] = [];

    constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) { }

    updateProjectTabCount(projectTabCount: UserProjectsCountResponse): void {
        projectTabCount.totalCount = Object.keys(projectTabCount)
            .filter(key => key !== 'totalCount')
            .reduce((sum, key) => sum + (projectTabCount[key as keyof UserProjectsCountResponse] || 0), 0);
        this.projectTabCount = projectTabCount;
    }

    triggerProjectsTabCount(): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_HEADER_TAB_COUNT_UPDATE', content: { tabName: 'PROJECTS' } });
    }

    triggerMigrationEngagementCount(): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_MIGRATION_COUNT_UPDATE', content: { tabName: 'PROJECTS' } });
    }

    triggerOPACreation(opaType: OPAType): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_OPA_DISCLOSURE_CREATION', content: { opaType } });
    }

    getActiveDisclosure() {
        return this._http.get(this._commonService.baseUrl + '/getActiveDisclosures');
    }

    getMetaDataForLanding(): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Cache-Control', 'no-store');
        headers = headers.append('Pragma', 'no-cache');
        return this._http.get(environment.deployUrl + 'assets/landing/landing-config.json', { headers });
    }

    saveOrUpdatePersonNote(req: any) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdatePersonNote', req);
    }

    createOPA(personId, homeUnit) {
        return this._http.post(this._commonService.baseUrl + '/opa/createOPA', { personId, homeUnit });
    }

    createConsultingForm(personId, homeUnit) {
        return this._http.post(this._commonService.baseUrl + '/consultingDisclosure/create', { personId, homeUnit });
    }

    fetchMyProjectsCount(params = new UserProjectsCountRO()): Observable<object> {
        return this._http.post(`${this._commonService.baseUrl}/project/fetchMyProjectsCount`, params);
    }

    reviseOPA(opaDisclosureId: number, opaDisclosureNumber: any): Observable<object> {
        return this._http.post(this._commonService.baseUrl + '/opa/reviseOPA', {
            opaDisclosureId,
            personId: this._commonService.getCurrentUserDetail('personID'),
            homeUnit: this._commonService.getCurrentUserDetail('unitNumber'),
            opaDisclosureNumber
        });
    }

    isDisclosureCreationAllowed(): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/getDisclosureCreationDetails`);
    }

    fetchEngagementsToMigrate(): Observable<EngagementMigrationCount> {
        return this._http.get<EngagementMigrationCount>(`${this._commonService.baseUrl}/engagementMigration/checkMigration`);
    }

    triggerFCOICreation(fcoiType: FcoiType): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_FCOI_DISCLOSURE_CREATION', content: { fcoiType } });
    }

    createInitialDisclosure(params: FCOIDisclosureCreateRO): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/fcoiDisclosure`, params);
    }

    reviseFcoiDisclosure(fcoiReviseRO: FcoiReviseRO): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/reviseDisclosure', fcoiReviseRO);
    }

    triggerDisclosureValidationModal(errorMsg: string): void {
        const CONFIG = new COIValidationModalConfig();
        CONFIG.triggeredFrom = 'DISCLOSURE_CREATION_VALIDATION';
        CONFIG.modalHeader = 'Attention';
        CONFIG.errorMsgHeader = '';
        CONFIG.validationType = 'VIEW_ONLY';
        CONFIG.errorList = [errorMsg];
        CONFIG.modalConfig.namings.secondaryBtnName = 'Close';
        this._commonService.openCOIValidationModal(CONFIG);
    }

    /**
     * Sets the OPA creation type based on active disclosures.
     * - Sets 'INITIAL' if there are no active OPA disclosures.
     * - Sets 'REVISION' if an active OPA exists and meets revision criteria:
     *     - Frequency is 'PERIODIC' and the current date is within the allowed period, OR
     *     - Frequency is 'YEARLY'.
     * - Sets null if no button should be shown.
     */
    setOpaInitialOrReviseButtonType(): void {
        if (!this.activeOPAs.length) {
            this.opaCreationType = 'INITIAL';
            return;
        }
        const ACTIVE_DISCLOSURE = this.activeOPAs.find(d => d?.versionStatus === OPA_VERSION_TYPE.ACTIVE);
        if (!ACTIVE_DISCLOSURE) {
            this.opaCreationType = null;
            return;
        }
        const IS_DATE_VALID = this._commonService.getDateIsBetweenPeriod(ACTIVE_DISCLOSURE);
        const OPA_FREQUENCY = this._commonService.opaFrequency;
        const CAN_REVISE = (OPA_FREQUENCY === 'PERIODIC' && IS_DATE_VALID) || OPA_FREQUENCY === 'YEARLY';
        this.opaCreationType = CAN_REVISE ? 'REVISION' : null;
    }

    redirectToOPADisclosure(opaDisclosureId: number | string | null): void {
        if (opaDisclosureId) {
            sessionStorage.setItem('previousUrl', this._router.url);
            this._router.navigate([OPA_CHILD_ROUTE_URLS.FORM], { queryParams: { disclosureId: opaDisclosureId } });
        }
    }

    redirectToFCOIDisclosure(disclosureDetails: ActiveDisclosure): void {
        if (disclosureDetails?.disclosureId) {
            sessionStorage.setItem('previousUrl', this._router.url);
            const IS_DISCLOSURE_EDITABLE = [DISCLOSURE_REVIEW_STATUS.PENDING, DISCLOSURE_REVIEW_STATUS.RETURNED, DISCLOSURE_REVIEW_STATUS.WITHDRAWN].includes(disclosureDetails?.reviewStatusCode);
            const REDIRECT_URL = IS_DISCLOSURE_EDITABLE ? CREATE_DISCLOSURE_ROUTE_URL : POST_CREATE_DISCLOSURE_ROUTE_URL;
            this._router.navigate([REDIRECT_URL], { queryParams: { disclosureId: disclosureDetails?.disclosureId} });
        }
    }

    setActiveDisclosures(disclosuresList: any): void {
        this.activeDisclosures = disclosuresList?.coiDisclosures || [];
        this.activeOPAs = disclosuresList?.opaDisclosure || [];
        this._commonService.opaFrequency = this.activeOPAs[0]?.opaCycles?.frequency;
        this.setOpaInitialOrReviseButtonType();
    }

    triggerDeclarationCreation(declarationVersionType: DeclarationVersionType, declarationTypeConfig: DeclarationType): void {
        if (!declarationTypeConfig) {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            this.removeDocActionStorageEvent();
            return;
        }
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_DECLARATION_DISCLOSURE_CREATION', content: { declarationVersionType, declarationTypeConfig } });
    }

    createDeclarationForm(param: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/declaration/create', param);
    }

    reviseDeclarationForm(param: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/declaration/revise', param);
    }

    getAvailableDeclarationsApi(): Observable<any> {
        const PERSON_ID = this._commonService.getCurrentUserDetail('personID');
        return this._http.get(this._commonService.baseUrl + `/declaration/getAvailableDeclarations/${PERSON_ID}`);
    }

    redirectToDeclaration(declarationId: number | string | null): void {
        if (declarationId) {
            sessionStorage.setItem('previousUrl', this._router.url);
            this._router.navigate([DECLARATION_ROUTE_URLS.FORM], { queryParams: { declarationId: declarationId } });
        }
    }

    redirectToCMP(cmpId: string | number, path: string = CMP_ROUTE_URLS.DETAILS, openingType: 'NEW_TAB' | 'CURRENT_TAB' = 'CURRENT_TAB'): void {
        if (!cmpId) {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            return;
        };
        sessionStorage.setItem('previousUrl', this._router.url);
        const FINAL_URL = path.replace('CMP_ID', cmpId.toString());
        if (openingType === 'NEW_TAB') {
            return openInNewTab(FINAL_URL, [], []);
        }
        this._router.navigate([FINAL_URL]);
    }

    downloadCmpAttachment(attachment: COIAttachment): Promise<'DOWNLOADED' | 'ERROR'> {
        return new Promise((resolve) => {
            this.$subscriptions.push(this.downloadCmpAttachmentApi(attachment?.attachmentId).subscribe({
                next: (data: EntityCreationResponse) => {
                    fileDownloader(data, attachment.fileName);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment downloaded successfully');
                    resolve('DOWNLOADED');
                },
                error: () => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in creating entity.');
                    resolve('ERROR');
                }
            }));
        });
    }

    downloadCmpAttachmentApi(attachmentId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/cmp/attachment/download`, {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

    checkIsPendingActionItem(): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/coiCustom/getPendingActionItemsCount`);
    }

    getAdminDetails(moduleCode: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/adminGroup/adminPersons/${moduleCode}`);
    }

    createManagementPlan(payload: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/cmp/plan', payload);
    }
    
    setDocActionStorageEvent(data: DocumentActionStorageEvent): void {
        sessionStorage.setItem('docActionStorageEvent', JSON.stringify(data));
    }

    getDocActionStorageEvent(): DocumentActionStorageEvent | null {
        const DATA = sessionStorage.getItem('docActionStorageEvent');
        return DATA ? JSON.parse(DATA) : null;
    }
    
    removeDocActionStorageEvent(): void {
        sessionStorage.removeItem('docActionStorageEvent');
    }

    /**
     * Creates or revises a declaration based on current state:
     * - Creates a new declaration if none exist.
     * - Redirects to a pending declaration of the given type if available.
     * - Otherwise, if action is revision then initiates a revision for the given declaration type.
     */
    getCreateOrReviseDeclaration(declarationTypeCode: string | number): 'REVISE_DECLARATION' | 'CREATE_DECLARATION' | 'VIEW_DECLARATION' | null {
        if (!declarationTypeCode) {
            return null;
        }
        const AVAILABLE_DECLARATIONS = this.activePendingDeclarations?.filter(declaration =>
            String(declaration?.declarationTypeCode) === String(declarationTypeCode)) || [];
        if (!AVAILABLE_DECLARATIONS.length) {
            return 'CREATE_DECLARATION';
        }
        const PENDING_DECLARATION = AVAILABLE_DECLARATIONS.find(({ versionStatus }) => versionStatus === DECLARATION_VERSION_TYPE.PENDING);
        if (PENDING_DECLARATION?.declarationId && !AVAILABLE_DECLARATIONS.some(decl => decl.versionStatus === DECLARATION_VERSION_TYPE.ACTIVE)) {
            return 'VIEW_DECLARATION';
        } else {
            return 'REVISE_DECLARATION';
        }
    }

    getAvailableDeclarations(): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this._commonService.activeDeclarationTypes?.length) {
                resolve(false);
                return;
            }
            this.$subscriptions.push(
                this.getAvailableDeclarationsApi()
                    .subscribe((res: UserDeclaration) => {
                        this.activePendingDeclarations = res?.declarations || [];
                        resolve(true);
                    }, (ERROR: any) => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                        resolve(false);
                    }
                )
            );
        });
    }

    private getCreateEntityPayload(entityRequestFields: EntityUpdateClass): EntityUpdateClass {
        const ENTITY_REQUEST_FIELDS = deepCloneObject(entityRequestFields);
        const MODIFIED_PAYLOAD: EntityUpdateClass = { ...ENTITY_REQUEST_FIELDS };
        delete MODIFIED_PAYLOAD.entityRequestFields?.country;
        delete MODIFIED_PAYLOAD.entityRequestFields?.stateDetails;
        delete MODIFIED_PAYLOAD.entityRequestFields?.coiEntityType;
        delete MODIFIED_PAYLOAD.entityRequestFields?.entityOwnershipType;
        MODIFIED_PAYLOAD.entityId = null;
        return MODIFIED_PAYLOAD;
    }

    createNewEntity(entityCreationModalObj: any): Promise<EntityCreationResponse | null> {
        return new Promise((resolve) => {
            const PAYLOAD = this.getCreateEntityPayload(entityCreationModalObj);
            this.$subscriptions.push(this._commonService.createEntity(PAYLOAD).subscribe({
                next: (data: EntityCreationResponse) => {
                    resolve(data || null);
                },
                error: () => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in creating entity.');
                    resolve(null);
                }
            }));
        });
    }

}
