import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { CommonDataService } from '../services/common-data.service';

@Injectable()
export class RouteGuardService implements CanActivate {
    awardId = null;
    constructor(private _router: Router, public _commonData: CommonDataService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.awardId = route.queryParamMap.get('awardId');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 4)) {
            case 'terms': return this.isSectionActive('110');
            case 'approval': return this.isSectionActive('119');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.awardSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/award/terms-approval/404'], {queryParams: {'awardId': this.awardId}})
    }
}
