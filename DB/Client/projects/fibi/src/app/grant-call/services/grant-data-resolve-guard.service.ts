/**
 * Author: Ayush Mahadev R
 * Implemented to fetch and check all the departmentLevelRights for sub-route guards.
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of as observableOf, Subscriber } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { GrantCommonDataService } from './grant-common-data.service';
import { GrantCallService } from './grant.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AwardDataResolveGuardService implements CanActivate {

    private readonly _moduleCode = 'GC15';

    constructor(public _grandCommonData: GrantCommonDataService,
                public _commonService: CommonService,
                private _grantService: GrantCallService,
                private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            forkJoin(this.getHttpRequests(route.queryParamMap.get('grantId'))).subscribe((res: any[]) => {
                if (res.length > 1) {
                    this.updateSectionConfig(res[1]);
                    this.hideManualLoader();
                }
                if (res[0]) {
                    this._grandCommonData.setGrantCallData(res[0]);
                    observer.next(true);
                    observer.complete();
                } else {
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }


    updateSectionConfig(data: any) {
        this._grandCommonData.grandSectionConfig = this._commonService.getSectionCodeAsKeys(data);
    }

    getHttpRequests(grantCallId: any) {
        const HTTP_REQUESTS = [];
        if (grantCallId == null) {
            HTTP_REQUESTS.push(this.loadCreateGrantCall());
        } else {
            HTTP_REQUESTS.push(this.loadGrantCallById(grantCallId));
        }
        if (!this.isSectionConfigAlreadyFetched()) {
            this.showManualLoader();
            HTTP_REQUESTS.push(this.getGrantCallSectionConfig());
        }
        return HTTP_REQUESTS;
    }

    getGrantCallSectionConfig() {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

    isSectionConfigAlreadyFetched() {
        return Object.keys(this._grandCommonData.grandSectionConfig).length;
    }

    loadCreateGrantCall() {
        return this._grantService.createGrantCall();
    }

    loadGrantCallById(grantCallId: any) {
        return this._grantService.loadGrantById({grantCallId}).pipe(catchError(error => this.redirectOnError(error)));
    }

    redirectOnError(error) {
        console.log('Retrieval error', error);
        if (error.status === 403) {
            this._commonService.forbiddenModule = '15';
            this._router.navigate(['/fibi/error/403']);
            return observableOf(null);
        } else {
            this._router.navigate(['/fibi/dashboard/grantCall']);
            return observableOf(null);
        }
    }

    showManualLoader() {
        this._commonService.isManualLoaderOn = true;
    }

    hideManualLoader() {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
    }
}
