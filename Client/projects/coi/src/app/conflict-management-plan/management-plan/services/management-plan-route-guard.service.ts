import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { ManagementPlanService } from "./management-plan.service";
import { CommonService } from "../../../common/services/common.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { HTTP_ERROR_STATUS, REPORTER_HOME_URL } from "../../../app-constants";
import { NavigationService } from "../../../common/services/navigation.service";
import { ManagementPlanDataStoreService } from "./management-plan-data-store.service";
import { InformationAndHelpTextService } from "../../../common/services/informationAndHelpText.service";
import { hideAutoSaveToast, openCommonModal } from "../../../common/utilities/custom-utilities";
import { CmpRouteGuard } from "../../shared/management-plan.interface";
import { catchError, map, tap } from "rxjs/operators";

@Injectable()
export class ManagementPlanRouteGuardService {

    constructor(private _commonService: CommonService,
        private _navigationService: NavigationService,
        private _managementPlanService: ManagementPlanService,
        private _managementPlanDataStore: ManagementPlanDataStoreService,
        private _informationAndHelpTextService: InformationAndHelpTextService) {}

    /**
     * Guard to control access to the declaration route.
     * 
     * - Validates the presence of `declarationId` in query parameters.
     * - Fetches CMP Header and section configuration if not already loaded.
     * - Updates data store and configuration before allowing access.
     * - Redirects to a 'FORBIDDEN' error route if data is missing or fetch fails.
     *
     * @param route ActivatedRouteSnapshot containing query parameters.
     * @param _state RouterStateSnapshot (not used).
     * @returns Observable<boolean> indicating if route can be activated.
     */
    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        this._managementPlanService.previousHomeUrl = this.setPreviousUrlPath(this._navigationService.navigationGuardUrl);
        this._managementPlanService.previousRouteUrl = sessionStorage.getItem('previousUrl') || '';
        const CMP_ID: string | null = route.firstChild?.paramMap.get('CMP_ID') || null;
        if (!CMP_ID) {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return of(false);
        }
        return this._managementPlanService.fetchEntireManagementPlan(CMP_ID).pipe(
            tap((result: CmpRouteGuard) => {
                if (result?.SECTION_CONFIG !== undefined) {
                    this.updateSectionConfig(result.SECTION_CONFIG);
                }
                this.updateDataStore(result);
                this._managementPlanService.rerouteIfWrongPath(_state.url, result?.CMP_HEADER?.plan);
            }),
            map(() => true),
            catchError((error: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch management plan details.');
                this._commonService.navigateToErrorRoute('FORBIDDEN');
                return of(false);
            })
        );
    }

    private updateSectionConfig(sectionData: any): void {
        this._managementPlanDataStore.moduleSectionConfig = this._commonService.getSectionCodeAsKeys(sectionData);
        this.setModuleConfiguration();
    }

    private updateDataStore(managementPlan: CmpRouteGuard): void {
        this._managementPlanService.clearManagementPlanServiceData();
        this._managementPlanDataStore.setRouteGuardStoreData(managementPlan);
    }

    private setModuleConfiguration(): void {
        this._informationAndHelpTextService.moduleConfiguration = this._managementPlanDataStore.moduleSectionConfig;
    }

    private setPreviousUrlPath(previousUrl: string): string {
        return previousUrl.includes('?') ? REPORTER_HOME_URL : previousUrl;
    }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
        if (this._managementPlanService.isFormBuilderDataChangePresent && !this._commonService.hasChangesAvailable) {
            openCommonModal(this._managementPlanService.unSavedConfirmModalConfig.namings.modalName);
            return false;
        }
        if (this._commonService.hasChangesAvailable) {
            this._commonService.isNavigationStopped = true;
            this._commonService.attemptedPath = nextState.url;
            this._commonService.appLoaderContent = 'Saving...';
            this._commonService.isShowLoader.next(true);
            const ELEMENTS = document.getElementsByClassName('invalid-feedback');
            const ERR_TOAST = document.getElementById('coi-retry-error-toast');
            if ((ERR_TOAST && !ERR_TOAST?.classList.contains('invisible')) || (ELEMENTS && ELEMENTS.length)) {
                this._commonService.isShowLoader.next(false);
            }
            return false;
        } else {
            this._commonService.isNavigationStopped = false;
            this._commonService.attemptedPath = '';
            hideAutoSaveToast('ERROR');
            return true;
        }
    }

}
