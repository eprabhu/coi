import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { GrantCommonDataService } from '../services/grant-common-data.service';

@Injectable()
export class RouteGuardService implements CanActivate {
    grantId = null;

    constructor(private _router: Router, public _commonData: GrantCommonDataService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.grantId = route.queryParamMap.get('grantId');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
            case 'ioi': return this.isSectionActive();
            default: return true;
        }
    }

    isSectionActive(): boolean {
        const isActive = (this._commonData.grandSectionConfig['1506'].isActive || this._commonData.grandSectionConfig['1514'].isActive
            || this._commonData.grandSectionConfig['1515'].isActive);
        return isActive ? isActive : this._router.navigate(['/fibi/grant/ioi/404'], {queryParams: {grantId: this.grantId}});
    }
}

