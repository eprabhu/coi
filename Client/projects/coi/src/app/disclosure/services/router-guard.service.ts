import { Injectable } from '@angular/core';
import { DataStoreService } from './data-store.service';
import { NextObserver, Observable, Subscription, forkJoin } from 'rxjs';
import { COI, ProjectSfiRelations } from '../coi-interface';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { CoiService, certifyIfQuestionnaireCompleted } from './coi.service';
import { openCommonModal } from '../../common/utilities/custom-utilities';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../app-constants';
import { DefineRelationshipService } from '../define-relationship/services/define-relationship.service';
import { DefineRelationshipDataStoreService } from '../define-relationship/services/define-relationship-data-store.service';
import { EvaluateValidationRO } from '../../common/services/coi-common.interface';

@Injectable()
export class RouterGuardService  {

    $subscriptions: Subscription[] = [];
    ModuleId: string;
    certificationText: string;
     REQUESTREPORTDATA = {
        coiDisclosure: {
            disclosureId: 'ModuleId',
            certificationText: 'certificationText'
        }
    };
    error: string;

    constructor(private _router: Router,
                private _coiService: CoiService,
                private _dataStore: DataStoreService,
                private _commonService: CommonService,
                private _defineRelationshipService: DefineRelationshipService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        this._coiService.certificationResponseErrors = [];
        this.ModuleId = route.queryParamMap.get('disclosureId');
        const disclosureId = this.ModuleId ? Number(this.ModuleId) : null;
        return new Observable<boolean>((observer: NextObserver<boolean>) => {
           forkJoin(this._coiService.getApplicableQuestionnaire(this.getApplicationQuestionnaireRO()), this.evaluateValidation())
                .subscribe((res: any) => {
                    if (res) {
                        this.checkQuestionnaireCompleted(res[0]);
                        observer.next(true);
                    } else {
                        observer.next(true);
                    }
                    res[1].map((error) => {
                        this._coiService.certificationResponseErrors.push( error);
                    });
                }, (err: any) => {
                    if (err.status === 405) {
                        this._coiService.concurrentUpdateAction = 'Certification';
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                });
        });
    }

    /**
     * Determines whether navigation away from the current route is allowed.
     * This method handles unsaved changes and auto-save scenarios for disclosures,
     * ensuring that the user is properly prompted before leaving the page if there are changes or errors.
     *
     * @param component - The current component instance.
     * @param currentRoute - The current activated route snapshot.
     * @param currentState - The current router state snapshot.
     * @param nextState - The next router state snapshot.
     * @returns `true` if navigation is allowed; otherwise, `false`.
     */
    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
        if (this._commonService.isEngagementChangesAvailable) {
            this._commonService.openAddSFILeaveModal();
            return false;
        }

        // DOM references for validation and retry toast elements
        const VALIDATION_ELEMENTS = document.getElementsByClassName('invalid-feedback');
        const RETRY_TOAST = document.getElementById('coi-retry-error-toast');
        const HAS_VISIBLE_RETRY_TOAST = RETRY_TOAST && !RETRY_TOAST.classList.contains('invisible');
        const HAS_VALIDATION_ELEMENTS = VALIDATION_ELEMENTS && VALIDATION_ELEMENTS.length > 0;
        const HAS_ANY_ERROR = this._defineRelationshipService.mandatoryList.size > 0;

        // Handle unsaved disclosure changes
        if (this._dataStore.dataChanged) {
            openCommonModal('disclosure-unsaved-changes-modal');
            return false;
        }

        // Handle auto-save changes
        if (this._commonService.hasChangesAvailable) {
            this._commonService.isNavigationStopped = true;
            this._commonService.attemptedPath = nextState.url;
            this._commonService.appLoaderContent = 'Saving...';
            this._commonService.isShowLoader.next(true);

            // Check for validation errors or retry toast visibility
            if (HAS_VISIBLE_RETRY_TOAST || HAS_VALIDATION_ELEMENTS || HAS_ANY_ERROR) {
                const IS_QUESTIONNAIRE_URL = this._router.url.includes('coi/create-disclosure/screening');
                const IS_RELATIONSHIP_URL = this._router.url.includes('coi/create-disclosure/relationship');
                this._coiService.unSavedModules = IS_RELATIONSHIP_URL ?  'Relationships' : IS_QUESTIONNAIRE_URL ? 'Screening Questionnaire' : 'Disclosure';
                this._commonService.isShowLoader.next(false);
                this.focusErrorField();
                openCommonModal('disclosure-unsaved-changes-modal');
            }
            return false;
        }

        // Proceed with navigation if no changes or errors exist
        this._commonService.isNavigationStopped = false;
        this._commonService.attemptedPath = '';
        this._commonService.hasChangesAvailable = false;

        setTimeout(() => {
            // Reset auto-save spinner and hide toast notifications
            this._commonService.autoSaveSavingSpinner = 'HIDE';
            this._commonService.hideSuccessErrorToast();
        });
        return true;
    }

    /**
     * This function is used to focus and scroll to the first error field in the UI.
     * It retrieves the first key from the mandatory list, identifies the associated project,
     * scrolls to the corresponding project section, and sets focus on the error field.
     */
    private focusErrorField(): void {
        const FIRST_KEY_IN_LIST = this._defineRelationshipService.mandatoryList.keys()?.next()?.value;
        if (!FIRST_KEY_IN_LIST) { return; }
        const COI_DISCL_PROJECT_ENTITY_REL_ID = FIRST_KEY_IN_LIST?.replace('CONFLICT_STATUS_', '')?.replace('CONFLICT_COMMENT_', '');
        const PROJECT_SFI_RELATIONS_LIST: ProjectSfiRelations[] = this._defineRelationshipDataStore.getFilteredStoreData();
        const PROJECT_INDEX = PROJECT_SFI_RELATIONS_LIST?.findIndex(relation =>
            relation.coiDisclEntProjDetails?.some(details => details.coiDisclProjectEntityRelId == COI_DISCL_PROJECT_ENTITY_REL_ID)
        );
        if (PROJECT_INDEX === -1) { return; }
        const SCROLLSPY_ELEMENT = document.getElementById(`COI_PROJECT_SFI_RELATION_${PROJECT_INDEX}`);
        SCROLLSPY_ELEMENT?.scrollIntoView({ behavior: 'auto' });
        setTimeout(() => {
            const FOCUS_ELEMENT = document.getElementById(FIRST_KEY_IN_LIST);
            FOCUS_ELEMENT?.scrollIntoView({ behavior: 'smooth', block: 'center' });;
        });
    }

    getApplicationQuestionnaireRO() {
        return {
            'moduleItemCode': 8,
            'moduleSubItemCode': 0,
            'moduleSubItemKey': 0,
            'moduleItemKey': this.ModuleId,
            'actionUserId': this._commonService.getCurrentUserDetail('personID'),
            'actionPersonName': this._commonService.getCurrentUserDetail('fullName'),
            'questionnaireMode': 'ACTIVE_ANSWERED_UNANSWERED'
        };
    }

    checkQuestionnaireCompleted(res) {
        let errorArray = certifyIfQuestionnaireCompleted(res);
        if(errorArray && errorArray.length) {
            errorArray.forEach(ele => this._coiService.certificationResponseErrors.push(ele));
        }
    }

    private evaluateValidation(): Observable<any> {
        const COI_DATA: COI = this._dataStore.getData();
        const EVALUATE_VALIDATION_RO: EvaluateValidationRO = this._coiService.getEvaluateValidationRO(COI_DATA?.coiDisclosure);
        return this._coiService.evaluateValidation(EVALUATE_VALIDATION_RO);
    }

}
