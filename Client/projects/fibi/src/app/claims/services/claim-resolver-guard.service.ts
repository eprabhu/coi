/**
 * Author: Ayush Mahadev R
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of as observableOf, Subscriber } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { catchError } from 'rxjs/operators';
import { CommonDataService } from './common-data.service';
import { ClaimsService } from './claims.service';

@Injectable()
export class ClaimResolverGuardService implements CanActivate {

    private readonly _moduleCode = 'CL14';

    constructor(private _claimService: ClaimsService,
                private _router: Router,
                public _commonService: CommonService,
                public _commonData: CommonDataService) {
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            forkJoin(this.getHttpRequests(route.queryParamMap.get('claimId'))).subscribe((res: any[]) => {
                if (res.length > 1) {
                    this.updateSectionConfigData(res[1]);
                    this.hideManualLoader();
                }
                if (res[0]) {
                    this._commonData.setClaimData(res[0]);
                    observer.next(true);
                    observer.complete();
                } else {
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }

    updateSectionConfigData(data: any) {
        this._commonData.claimSectionConfig = this._commonService.getSectionCodeAsKeys(data);
    }

    getHttpRequests(claimId): Observable<any>[] {
        const HTTP_REQUESTS = [];
        HTTP_REQUESTS.push(this.loadClaimDetails({claimId}));
        if (!this.isSectionConfigAlreadyFetched()) {
            this.showManualLoader();
            HTTP_REQUESTS.push(this.getClaimsSectionConfig());
        }
        return HTTP_REQUESTS;
    }

    isSectionConfigAlreadyFetched() {
        return Object.keys(this._commonData.claimSectionConfig).length;
    }

    getClaimsSectionConfig() {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

    loadClaimDetails(claimId) {
        return this._claimService.loadClaimDetails(claimId).pipe(catchError(error => this.redirectOnError(error)));
    }

    redirectOnError(error) {
        if (error.status === 403) {
            this._commonService.forbiddenModule = '14';
            this._router.navigate(['/fibi/error/403']);
            return observableOf(null);
        } else {
            this._router.navigate(['/fibi/dashboard/claim-list']);
            return observableOf(null);
        }
    }

    hideManualLoader() {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
    }

    showManualLoader() {
        this._commonService.isManualLoaderOn = true;
    }
}
