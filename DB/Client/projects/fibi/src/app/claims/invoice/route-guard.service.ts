import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot} from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { CommonDataService } from '../services/common-data.service';

@Injectable()
export class RouteGuardService implements CanActivate, CanDeactivate<boolean> {
    claimId = null;
    constructor(public _commonData: CommonDataService, private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.claimId = route.queryParamMap.get('claimId');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string) {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 4)) {
            case 'summary': return this.isSectionActive('1413');
            case 'details': return this.isSectionActive('1412');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.claimSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/claims/invoice/404'], { queryParams: { claimId: this.claimId } });
    }

    canDeactivate() {
        if (this._commonData.isClaimDataChange) {
            document.getElementById('claimTabChangebutton').click();
            return false;
        } else {
            return true;
        }
    }
}
