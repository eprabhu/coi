import { Injectable, OnDestroy } from '@angular/core';
import { CanDeactivate, CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { ExtReviewerMaintenanceService } from '../external-reviewer-maintenance-service';

declare var $: any;
@Injectable()
export class RouteGuardService implements OnDestroy, CanActivate, CanDeactivate<boolean> {

    extReviewerId: string;

    constructor(private _extReviewerMaintenanceService: ExtReviewerMaintenanceService) { }

    canActivate( route: ActivatedRouteSnapshot) {
        this.extReviewerId = route.queryParamMap.get('externalReviewerId');
        if (this.extReviewerId) {
            return true;
        } else {
            return false;
        }
    }

    canDeactivate(): boolean {
        if (this._extReviewerMaintenanceService.isDataChange) {
            $('#saveAndExitModal').modal('show');
            return false;
        }
        return true;
    }

    ngOnDestroy() {

    }
}
