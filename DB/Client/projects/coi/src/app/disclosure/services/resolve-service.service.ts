import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable, Subscriber, Subscription} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CommonService} from '../../common/services/common.service';
import {CoiService} from './coi.service';
import {DataStoreService} from './data-store.service';
import {
    CREATE_DISCLOSURE_ROUTE_URL,
    HTTP_ERROR_STATUS,
    REPORTER_HOME_URL,
    POST_CREATE_DISCLOSURE_ROUTE_URL,
    DISCLOSURE_REVIEW_STATUS,
    FCOI_REVIEWER_REVIEW_STATUS_TYPE,
    COMMON_ERROR_TOAST_MSG
} from '../../app-constants';
import {NavigationService} from '../../common/services/navigation.service';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
import { DefineRelationshipDataStoreService } from '../define-relationship/services/define-relationship-data-store.service';
import { DefineRelationshipService } from '../define-relationship/services/define-relationship.service';
import { ExtendedProjRelDataStoreService } from '../extended-project-relation-summary/services/extended-project-relation-data-store.service';
import { ExtendedProjectRelationService } from '../extended-project-relation-summary/services/extended-project-relation.service';

@Injectable()
export class ResolveServiceService {

    private readonly _moduleCode = 'COI8';

    $subscriptions: Subscription[] = [];
    constructor(
        private _commonService: CommonService,
        private _dataStore: DataStoreService,
        private _coiService: CoiService,
        private _router: Router,
        private _navigationService: NavigationService,
        private _defineRelationshipService: DefineRelationshipService,
        private _extendedProjRelService: ExtendedProjectRelationService,
        private _defineRelationshipDataStore: DefineRelationshipDataStoreService,
        private _extendedProjRelDataStoreService: ExtendedProjRelDataStoreService,
        private _informationAndHelpTextService : InformationAndHelpTextService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        // Clear define relationship data
        this.clearRelationshipServiceCaches();
        this._coiService.previousHomeUrl = this.setPreviousUrlPath(this._navigationService.navigationGuardUrl);
        this._coiService.previousDisclosureRouteUrl = sessionStorage.getItem('previousUrl') || '';
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            this.resolveDisclosureId(route).then(() => {
                forkJoin(this.getHttpRequests(route)).subscribe((res: any[]) => {
                    if (res.length > 1) {
                        this.updateSectionConfig(res[1]);
                    }
                    if (res[0]) {
                        this.updateProposalDataStore(res[0]);
                        this.rerouteIfWrongPath(_state.url, res[0].coiDisclosure, route);
                        const { COMPLETED, REVIEW_IN_PROGRESS, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED } = DISCLOSURE_REVIEW_STATUS;
                        if ([REVIEW_IN_PROGRESS, COMPLETED, REVIEW_ASSIGNED, ASSIGNED_REVIEW_COMPLETED].includes(res[0].coiDisclosure?.coiReviewStatusType?.reviewStatusCode)) {
                            this.getCoiReview(res[0].coiDisclosure, observer);
                        } else {
                            observer.next(true);
                            observer.complete();
                        }
                    } else {
                        observer.next(false);
                        observer.complete();
                    }
                });
            })
        });

    }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
        if (this._dataStore.isPendingWithdrawRequest) {
            this._dataStore.emitValidationModalOpen.next(true);
            this._dataStore.attemptedPath = nextState.url;
            return false;
        } else {
            this._dataStore.attemptedPath = '';
            return true;
        }
    }

    private clearRelationshipServiceCaches(): void {
        this._extendedProjRelService.clearAllServiceData();
        this._defineRelationshipDataStore.setStoreData([]);
        this._defineRelationshipService.clearAllServiceData();
        this._extendedProjRelDataStoreService.setStoreData([]);
    }

    // 2 - void => dispositionStatusCode
    // 1 - pending, 5 - withdrawn, 6 - returned => reviewStatusCode
    rerouteIfWrongPath(currentPath: string, coiDisclosure: any, route) {
        const { reviewStatusCode, personId, dispositionStatusCode, isNewEngagementAdded } = coiDisclosure;
        const IS_DISCLOSURE_VOID = dispositionStatusCode === '2';
        const IS_CREATE_URL = currentPath.includes('create-disclosure');
        const IS_READY_FOR_REVIEW = !['1', '5', '6'].includes(reviewStatusCode);
        const IS_CREATE_PERSON = personId === this._commonService.currentUserDetails.personID;
        let reRoutePath;
        if (!IS_CREATE_URL && !IS_READY_FOR_REVIEW && IS_CREATE_PERSON && !IS_DISCLOSURE_VOID && !isNewEngagementAdded) {
            reRoutePath = CREATE_DISCLOSURE_ROUTE_URL;
        } else if (IS_CREATE_URL && (isNewEngagementAdded || IS_READY_FOR_REVIEW || IS_DISCLOSURE_VOID || (!IS_READY_FOR_REVIEW && !IS_CREATE_PERSON))) {
            reRoutePath = POST_CREATE_DISCLOSURE_ROUTE_URL;
        }
        if (reRoutePath) {
            this._router.navigate([reRoutePath], { queryParams: { disclosureId: route.queryParamMap.get('disclosureId') } });
        }
    }

    setPreviousUrlPath(previousUrl: string) {
        return previousUrl.includes('?') ? REPORTER_HOME_URL : previousUrl;
    }

    private updateProposalDataStore(data: any) {
        this._dataStore.setStoreData(data);
    }

    private resolveDisclosureId(route: ActivatedRouteSnapshot): Promise<string | null> {
        const MODULE_ID = route.queryParamMap.get('disclosureId');
        const PROJECT_TYPE = route.queryParamMap.get('projectType');
        const PERSON_ID = route.queryParamMap.get('personId');
        const MODULE_ITEM_KEY = route.queryParamMap.get('moduleItemKey');
        if (MODULE_ID) {
            return Promise.resolve(MODULE_ID);
        }
        if (PROJECT_TYPE && PERSON_ID && MODULE_ITEM_KEY) {
            return new Promise((resolve, reject) => {
                this._coiService.getProjectDisclosureId(PROJECT_TYPE, PERSON_ID, MODULE_ITEM_KEY)
                    .subscribe({
                        next: async (res: any) => {
                            await this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: res?.disclosureId } });
                            reject(res);
                        },
                        error: () => {
                            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                            this._router.navigate([REPORTER_HOME_URL]);
                            resolve(null);
                        }
                    });
            });
        }
        return Promise.resolve(null);
    }

    private getHttpRequests(route: ActivatedRouteSnapshot): Observable<any>[] {
        const HTTP_REQUESTS = [];
        const MODULE_ID = route.queryParamMap.get('disclosureId');
        if (MODULE_ID) { HTTP_REQUESTS.push(this.loadDisclosure(MODULE_ID)); }
        if (!this.isSectionConfigAlreadyFetched()) {
            HTTP_REQUESTS.push(this.getDisclosureSectionConfig());
        } else {
            this.setModuleConfiguration();
        }
        return HTTP_REQUESTS;
    }

    private loadDisclosure(disclosureId: string) {
        return this._coiService.loadDisclosure(disclosureId).pipe((catchError(error => this.redirectOnError(error))));
    }

    private redirectOnError(error) {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to load disclosure');
        if (error.status === 403 && error.error !== 'DISCLOSURE_EXISTS') {
            this._commonService.forbiddenModule = '8';
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return new Observable(null);
        } else {
            this._router.navigate([REPORTER_HOME_URL]);
            return new Observable(null);
        }
    }

    getCoiReview(coiDisclosure: any, observer: any) {
        this.$subscriptions.push(
            this._coiService.getCoiReview(coiDisclosure.disclosureId, coiDisclosure.dispositionStatusCode).subscribe((res: any) => {
                this._coiService.isReviewActionCompleted = this._coiService.isAllReviewsCompleted(res);
                const REVIEWER_DETAILS = this.getLoggedInReviewerInfo(res);
                if (REVIEWER_DETAILS) {
                    this._coiService.isStartReview = REVIEWER_DETAILS.reviewStatusTypeCode?.toString() === FCOI_REVIEWER_REVIEW_STATUS_TYPE.ASSIGNED?.toString();
                    this._coiService.isCompleteReview = REVIEWER_DETAILS.reviewStatusTypeCode?.toString() === FCOI_REVIEWER_REVIEW_STATUS_TYPE.IN_PROGRESS?.toString();
                    this._coiService.isDisclosureReviewer = true;
                    this._coiService.$SelectedReviewerDetails.next(REVIEWER_DETAILS);
                    this._coiService.currentReviewForAction = REVIEWER_DETAILS;
                }
                this._dataStore.updateStore(['coiReviewerList'], { coiReviewerList: res });
                observer.next(true);
                observer.complete();
            }, _err => {
                observer.next(false);
                observer.complete();
                this._router.navigate([this._coiService.previousHomeUrl]);
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
            }));
    }

    getLoggedInReviewerInfo(coiReviewerList): any {
        const REVIEWER_DETAILS = coiReviewerList?.find(item => item?.assigneePersonId === this._commonService.getCurrentUserDetail('personID') && item?.reviewStatusTypeCode?.toString() !== FCOI_REVIEWER_REVIEW_STATUS_TYPE.COMPLETED?.toString());
        return REVIEWER_DETAILS;
    }

    isSectionConfigAlreadyFetched() {
        return Object.keys(this._dataStore.disclosureSectionConfig).length;
    }

    getDisclosureSectionConfig() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }

    updateSectionConfig(sectionData: any): void {
        this._dataStore.disclosureSectionConfig = this._commonService.getSectionCodeAsKeys(sectionData);
        this.setModuleConfiguration();
    }

    setModuleConfiguration() {
        this._informationAndHelpTextService.moduleConfiguration = this._dataStore.disclosureSectionConfig;
    }

}
