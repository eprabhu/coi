import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, Subscriber, forkJoin } from 'rxjs';
import { ConsultingService } from './consulting.service';
import { catchError } from 'rxjs/operators';
import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS, REPORTER_HOME_URL } from '../../app-constants';
import { ConsultingFormDataStoreService } from './consulting-data-store.service';
import { NavigationService} from "../../common/services/navigation.service";
@Injectable()

export class ResolveServiceService {

    constructor(private _consultingService: ConsultingService, private _commonService: CommonService,
                private _router: Router, private _dataStore: ConsultingFormDataStoreService, private _navigationService: NavigationService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        this._consultingService.previousHomeUrl = this.setPreviousUrlPath(this._navigationService.navigationGuardUrl);
        this._consultingService.previousConsultingRouteUrl = sessionStorage.getItem('previousUrl') || '';
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            forkJoin(this.getHttpRequests(route)).subscribe((res: any[]) => {
                if (res[0]) {
                    this.updateConsultingDataStore(res[0]);
                    observer.next(true);
                    observer.complete();
                } else {
                    observer.next(false);
                    observer.complete();
                }
            });
        });

    }

    setPreviousUrlPath(previousUrl: string) {
        return previousUrl.includes('?') ? REPORTER_HOME_URL : previousUrl;
    }

    private updateConsultingDataStore(data: any) {
        this._dataStore.setStoreData({ consultingForm: data });
    }

    private getHttpRequests(route: ActivatedRouteSnapshot): Observable<any>[] {
        const HTTP_REQUESTS = [];
        const MODULE_ID = route.queryParamMap.get('disclosureId');
        if (MODULE_ID) {
            HTTP_REQUESTS.push(this.loadDisclosure(MODULE_ID));
        }
        return HTTP_REQUESTS;
    }

    private loadDisclosure(disclosureId: string) {
        return this._consultingService.loadConsultingFormHeader(disclosureId).pipe((catchError(error => this.redirectOnError(error))));
    }

    private redirectOnError(error) {
        this._commonService.showToast(HTTP_ERROR_STATUS, (error.error) ?
            error.error : 'Something went wrong. Please try again.');
        if (error.status === 403 && error.error !== 'DISCLOSURE_EXISTS') {
            this._commonService.forbiddenModule = '8';
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return new Observable(null);
        } else {
            this._router.navigate([REPORTER_HOME_URL]);
            return new Observable(null);
        }
    }

}
