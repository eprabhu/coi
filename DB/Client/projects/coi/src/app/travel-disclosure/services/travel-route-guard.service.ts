import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { forkJoin, Observable, Subscriber } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { TravelDataStoreService } from './travel-data-store.service';
import { TravelDisclosureService } from './travel-disclosure.service';
import { NavigationService } from '../../common/services/navigation.service';
import { TravelCreateModalDetails, TravelDisclosure } from '../travel-disclosure.interface';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanDeactivate, Navigation, Router, RouterStateSnapshot} from '@angular/router';
import { CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, REPORTER_HOME_URL, HTTP_ERROR_STATUS, POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, COI_MODULE_CODE, TRAVEL_DISCLOSURE_RIGHTS, COMMON_ERROR_TOAST_MSG } from '../../app-constants';
import { hideAutoSaveToast, openCommonModal } from '../../common/utilities/custom-utilities';
import { CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS } from '../travel-disclosure-constants';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
import { ModulesConfiguration } from '../../shared/common.interface';


@Injectable()
export class TravelRouteGuardService implements CanActivate, CanDeactivate<boolean> {

    private readonly _moduleCode = 'TD24';

    constructor(private _router: Router,
                private _commonService: CommonService,
                private _activatedRoute: ActivatedRoute,
                private _service: TravelDisclosureService,
                private _dataStore: TravelDataStoreService,
                private _navigationService: NavigationService,
                private _informationAndHelpTextService: InformationAndHelpTextService) {
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | Observable<boolean> {
        this._dataStore.setStoreData(new TravelDisclosure());
        this._service.isAdminDashboard = this._router.url.includes('admin-dashboard');
        this._service.previousTravelDisclRouteUrl = sessionStorage.getItem('previousUrl') || '';
        const DISCLOSURE_ID = route.queryParamMap.get('disclosureId');
        const HTTP_REQUESTS = this.getHttpRequests(DISCLOSURE_ID);
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            if (!HTTP_REQUESTS.length) {
                observer.next(true);
                observer.complete();
                return;
            }
            forkJoin(HTTP_REQUESTS).subscribe((res: any[]) => {
                const TRAVEL_DISCLOSURE: TravelDisclosure = res[0];
                if (res.length > 1 && DISCLOSURE_ID) {
                    this.updateSectionConfig(res[1]);
                } else if (!DISCLOSURE_ID) {
                    this.updateSectionConfig(res[0]);
                }
                if (TRAVEL_DISCLOSURE && DISCLOSURE_ID) {
                    this.updateTravelDataStore(TRAVEL_DISCLOSURE);
                    this.reRouteIfWrongPath(_state.url, TRAVEL_DISCLOSURE.reviewStatusCode, TRAVEL_DISCLOSURE.personId, route);
                    this.setPreviousModuleUrl();
                    observer.next(true);
                } else if (this.hasHomeAndPersonId()) {
                    observer.next(true);
                } else {
                    this._router.navigate([REPORTER_HOME_URL]);
                    observer.next(false);
                }
                observer.complete();
            });
        });
    }

    private getHttpRequests(disclosureId: string | number): Observable<any>[] {
        const HTTP_REQUESTS = [];
        if (disclosureId) {
            HTTP_REQUESTS.push(this.loadTravelDisclosure(disclosureId));
        }
        if (!this.isSectionConfigAlreadyFetched()) {
            HTTP_REQUESTS.push(this.getDisclosureSectionConfig());
        } else {
            this.setModuleConfiguration();
        }
        return HTTP_REQUESTS;
    }

    private getDisclosureSectionConfig(): Observable<ModulesConfiguration> {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

    private isSectionConfigAlreadyFetched(): number {
        return Object.keys(this._dataStore.travelSectionConfig).length;
    }

    private updateSectionConfig(sectionData: ModulesConfiguration): void {
        this._dataStore.travelSectionConfig = this._commonService.getSectionCodeAsKeys(sectionData);
        this.setModuleConfiguration();
    }

    private setModuleConfiguration(): void {
        this._informationAndHelpTextService.moduleConfiguration = this._dataStore.travelSectionConfig;
    }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
        const CURRENT_NAVIGATION: Navigation | null = this._router.getCurrentNavigation();
        const NAVIGATION_GUARD_URL: string = CURRENT_NAVIGATION?.finalUrl?.toString() || '';
        const HAS_TRAVEL_DISCLOSURE_ID: boolean = !!this._activatedRoute.snapshot.queryParamMap.get('disclosureId');
        const HAS_CREATE_TRAVEL_DISCLOSURE_URL: boolean = NAVIGATION_GUARD_URL.includes('create-travel-disclosure');
        const HAS_CREATE_TRAVEL_ENGAGEMENT_URL: boolean = this._router.url.includes('create-travel-disclosure/engagements');
    
        if (this._service.isAllowNavigation) {
            this._service.isAllowNavigation = false;
            return true;
        }

        if (this._service.travelDataChanged || (this._service.isFormBuilderDataChangePresent && !this._commonService.hasChangesAvailable) || (!HAS_CREATE_TRAVEL_DISCLOSURE_URL && !HAS_TRAVEL_DISCLOSURE_ID && !HAS_CREATE_TRAVEL_ENGAGEMENT_URL)) {
            openCommonModal('travel-unsaved-changes-modal');
            return false;
        }

        if (HAS_TRAVEL_DISCLOSURE_ID) {
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

    private hasHomeAndPersonId(): boolean {
        const travelCreateModalDetails: TravelCreateModalDetails = this._dataStore.getCreateModalDetails();
        return !!travelCreateModalDetails?.homeUnit && !!travelCreateModalDetails?.personId;
    }

    private setPreviousModuleUrl(): void {
        this._service.PREVIOUS_MODULE_URL = this._navigationService.navigationGuardUrl;
    }

    private loadTravelDisclosure(disclosureId): Observable<TravelDisclosure> {
        return this._service.loadTravelDisclosure(disclosureId).pipe((catchError(error => this.redirectOnError(error))));
    }

    private updateTravelDataStore(data: TravelDisclosure): void {
        this._dataStore.setStoreData(data);
    }

    private reRouteIfWrongPath(currentPath: string, reviewStatusCode: string, personId: string, route): void {
        const hasCreateTravelPath = currentPath.includes('create-travel-disclosure');
        const hasCreateUserRight = this._service.isCheckLoggedUser(personId);
        const isEditPage = CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS.includes(reviewStatusCode);

        let reRoutePath = null;

        if (isEditPage) {
            reRoutePath = hasCreateUserRight ? this.getPathForEditPage(hasCreateUserRight, hasCreateTravelPath) : this.getPathForViewPage(hasCreateUserRight, hasCreateTravelPath);
        } else {
            reRoutePath = this.getPathForViewPage(hasCreateUserRight, hasCreateTravelPath);
        }

        if (reRoutePath) {
            this._router.navigate([reRoutePath], { queryParams: { disclosureId: route.queryParamMap.get('disclosureId') } });
        }
    }

    private getPathForEditPage(hasCreateUserRight: boolean, hasCreateTravelPath: boolean): string | null {
        if (hasCreateUserRight && !hasCreateTravelPath) {
            return CREATE_TRAVEL_DISCLOSURE_ROUTE_URL;
        }
        return null;
    }

    private getPathForViewPage(hasCreateUserRight: boolean, hasCreateTravelPath: boolean): string | null {
        const hasAdminViewRight = this._commonService.getAvailableRight(TRAVEL_DISCLOSURE_RIGHTS);
         if (hasCreateTravelPath && (hasAdminViewRight || hasCreateUserRight)) {
            return POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL;
        }
        return null;
    }

    private redirectOnError(error): Observable<any> {
        this._commonService.showToast(HTTP_ERROR_STATUS, (error.error) ?
            error.error : COMMON_ERROR_TOAST_MSG);
        if (error.status === 403 && error.error !== 'DISCLOSURE_EXISTS') {
            this._commonService.forbiddenModule = COI_MODULE_CODE.toString();
            this.redirectToErrorPage();
            return new Observable(null);
        } else {
            this._router.navigate([REPORTER_HOME_URL]);
            return new Observable(null);
        }
    }

    private redirectToErrorPage(): void {
        this._commonService.navigateToErrorRoute('FORBIDDEN');
    }
}
