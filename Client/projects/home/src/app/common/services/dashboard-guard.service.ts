import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CommonService } from './common.service';
import { Observable, Subscriber } from 'rxjs';

@Injectable()
export class DashboardGuardService implements CanActivate {
    constructor(private _router: Router, public _commonService: CommonService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            if(this.isModuleConfigAlreadyFetched()) { return observer.next(true); }
            const authToken = this._commonService.getCurrentUserDetail('Authorization');
            if (authToken) {
                this.getDashboardActiveModules(observer);
            } else {
                this._router.navigate(['/login']);
                return observer.next(false);
            }
        });
    }

    isModuleConfigAlreadyFetched() {
        return Object.keys(this._commonService.dashboardModules).length;
    }

    /**
     * fetch all the dashboard UI tabs/modules and its active status to show or hide from view.
     * converts array to object where module names are the key and its value the whole object.
     * @param observer
     */
    private getDashboardActiveModules(observer: Subscriber<boolean>) {
        this._commonService.getDashboardActiveModules().subscribe((res: any) => {
            this._commonService.dashboardModules =
                res.moduleConfig.reduce((acc, obj) => ({ ...acc, [obj.moduleCode]: obj }), {});
            return observer.next(true);
        });
    }
}



