import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../../common/utilities/custom-utilities';
import { CommonDataService } from '../../services/common-data.service';

@Injectable()
export class SubrouteGuardService implements CanActivate {
    awardId = null;
    constructor(private _router: Router, public _commonData: CommonDataService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.awardId = route.queryParamMap.get('awardId');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 5)) {
            case 'periods-total': return this.isSectionActive('149');
            case 'personnel': return this.isSectionActive('150');
            case 'detailed-budget': return this.isSectionActive('151');
            case 'summary': return this.isSectionActive('152');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.awardSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/award/budget-expense/budget/404'],
            {queryParams: {'awardId': this.awardId}});
    }

    canDeactivate() {
        if (this._commonData.isAwardDataChange) {
            document.getElementById('awardTabChangebutton').click();
            return false;
        } else {
            return true;
        }
    }
}

