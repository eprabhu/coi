import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, CanDeactivate, CanActivateChild, UrlTree } from '@angular/router';
import { CommonService } from './common.service';
import { Observable, Subscriber, Subscription, forkJoin, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from '../header/header.service';
import { EngagementMigrationCount } from './coi-common.interface';
import { USER_DASHBOARD_CHILD_ROUTE_URLS } from '../../app-constants';
@Injectable()
export class DashboardGuardService implements CanActivate {
    constructor(public _commonService: CommonService, private _http: HttpClient) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            if(!this._commonService.rightsArray.length) {
                forkJoin(this.generateHttpRequest()).subscribe((res: any) => {
                    if (res.length) {
                            this._commonService.assignFibiBasedRights(res[0]);
                            this._commonService.assignCOIBasedRights(res[1]);
                    }
                    observer.next(true);
                    return observer.complete();
                });
            } else {
                observer.next(true);
                return observer.complete();
            }
        });
    }

    generateHttpRequest() {
        const RO = [];
        RO.push(this._http.get(this._commonService.fibiUrl + '/getAllSystemRights'));
        RO.push(this._http.get(this._commonService.baseUrl + '/coiCustom/fetchAllCoiRights'));
        return RO;
    }
 }

@Injectable()
export class EngMigDashboardGuardService implements CanActivateChild {

    constructor(
        private headerService: HeaderService,
        private commonService: CommonService,
        private _router: Router
    ) { }

    private checkReviewPending(count: EngagementMigrationCount): boolean {
        return count?.toReviewCount > 0 || count?.inProgressCount > 0;
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        // Always allow these routes during engagement migration
        const ALLOWED_ROUTE_URLS = ['migrated-engagements', 'create-sfi', 'entity-details', 'error-handler', 'home',];
        const NAVIGATING_URL = state.url;
        const CURRENT_URL = this._router.url;
        //return true if engagement migration parameter is off
        if (!this.commonService.isEnableLegacyEngMig) return true;
        // If we already checked migrations
        if (this.headerService.migrationChecked) {
            // Allow navigation if  migration completed or navigating to allowed urls.
            if (!this.headerService.hasPendingMigrations || !childRoute.routeConfig?.path || ALLOWED_ROUTE_URLS.some(path => NAVIGATING_URL.includes(path))) {
                return true;
            }
            // If user is on an allowed page and migration is pending, block navigation to other pages.
            if (ALLOWED_ROUTE_URLS.some(path => CURRENT_URL.includes(path))) {
                return false;
            }
            this._router.navigate([USER_DASHBOARD_CHILD_ROUTE_URLS.MY_HOME_ROUTE_URL]);
            return false;
        }
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            this.headerService.fetchEngagementsToMigrate().subscribe(count => {
                this.headerService.hasPendingMigrations = this.checkReviewPending(count);
                this.headerService.migrationChecked = true;
                this.headerService.migratedEngagementsCount = count;
                observer.next(true);
                observer.complete();
            }, error => {
                observer.next(false);
                observer.complete();
            });
        });
    }
}
