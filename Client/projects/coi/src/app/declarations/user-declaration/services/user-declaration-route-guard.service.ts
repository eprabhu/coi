import { Injectable } from "@angular/core";
import { Observable, Subscriber, forkJoin, of } from "rxjs";
import { UserDeclaration } from "../../declaration.interface";
import { UserDeclarationService } from "./user-declaration.service";
import { CommonService } from "../../../common/services/common.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { HTTP_ERROR_STATUS, REPORTER_HOME_URL } from "../../../app-constants";
import { NavigationService } from "../../../common/services/navigation.service";
import { DECLARATION_MODULE_CONFIGURATION_CODE } from "../../declaration-constants";
import { UserDeclarationDataStoreService } from "./user-declaration-data-store.service";
import { InformationAndHelpTextService } from "../../../common/services/informationAndHelpText.service";
import { hideAutoSaveToast, openCommonModal } from "../../../common/utilities/custom-utilities";

@Injectable()
export class UserDeclarationRouteGuardService {

    constructor(private _commonService: CommonService,
        private _navigationService: NavigationService,
        private _userDeclarationService: UserDeclarationService,
        private _useDeclarationDataStore: UserDeclarationDataStoreService,
        private _informationAndHelpTextService: InformationAndHelpTextService) {}

    /**
     * Guard to control access to the declaration route.
     * 
     * - Validates the presence of `declarationId` in query parameters.
     * - Fetches declaration data and section configuration if not already loaded.
     * - Updates data store and configuration before allowing access.
     * - Redirects to a 'FORBIDDEN' error route if data is missing or fetch fails.
     *
     * @param route ActivatedRouteSnapshot containing query parameters.
     * @param _state RouterStateSnapshot (not used).
     * @returns Observable<boolean> indicating if route can be activated.
     */
    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        this._userDeclarationService.previousHomeUrl = this.setPreviousUrlPath(this._navigationService.navigationGuardUrl);
        this._userDeclarationService.previousRouteUrl = sessionStorage.getItem('previousUrl') || '';
        const CERTIFICATION_ID: string | null = route.queryParamMap.get('declarationId');
        if (!CERTIFICATION_ID) {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return of(false);
        }
        const IS_SECTION_CONFIG_ALREADY_FETCHED = this.isSectionConfigAlreadyFetched();
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            forkJoin({
                SECTION_CONFIG: IS_SECTION_CONFIG_ALREADY_FETCHED ? of(undefined) : this.getModuleConfiguration(),
                CERTIFICATION_DATA: this.fetchDeclarationById(CERTIFICATION_ID),
            }).subscribe({
                next: (result: { CERTIFICATION_DATA: any; SECTION_CONFIG: any }) => {
                    if (result.SECTION_CONFIG !== undefined) {
                        this.updateSectionConfig(result.SECTION_CONFIG);
                    }
                    if (result.CERTIFICATION_DATA) {
                        this.updateDataStore(result.CERTIFICATION_DATA);
                        observer.next(true);
                    } else {
                        observer.next(false); // Defensive fallback
                    }
                    observer.complete();
                },
                error: (_error: any) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch declaration details.');
                    this._commonService.navigateToErrorRoute('FORBIDDEN');
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }

    private updateSectionConfig(sectionData: any): void {
        this._useDeclarationDataStore.moduleSectionConfig = this._commonService.getSectionCodeAsKeys(sectionData);
        this.setModuleConfiguration();
    }

    private updateDataStore(data: any): void {
        this._userDeclarationService.clearDeclarationServiceData();
        this._useDeclarationDataStore.setStoreData(data);
    }

    private fetchDeclarationById(declarationId: string): Observable<UserDeclaration> {
        return this._userDeclarationService.fetchDeclarationById(declarationId);
    }

    private isSectionConfigAlreadyFetched(): boolean {
        return Object.keys(this._useDeclarationDataStore.moduleSectionConfig)?.length > 0;
    }

    private getModuleConfiguration(): Observable<any> {
        return this._commonService.getDashboardActiveModules(DECLARATION_MODULE_CONFIGURATION_CODE);
    }

    private setModuleConfiguration(): void {
        this._informationAndHelpTextService.moduleConfiguration = this._useDeclarationDataStore.moduleSectionConfig;
    }

    private setPreviousUrlPath(previousUrl: string): string {
        return previousUrl.includes('?') ? REPORTER_HOME_URL : previousUrl;
    }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
        if (this._userDeclarationService.isFormBuilderDataChangePresent && !this._commonService.hasChangesAvailable) {
            openCommonModal(this._userDeclarationService.unSavedConfirmModalConfig.namings.modalName);
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
