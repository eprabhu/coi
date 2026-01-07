import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { CommonDataService } from '../services/common-data.service';

@Injectable()
export class RouteGuardService implements CanActivate, CanDeactivate<boolean> {
    awardId = null;
    constructor(private _router: Router, public _commonData: CommonDataService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.awardId = route.queryParamMap.get('awardId');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 4)) {
            case 'publications': return this.isSectionActive('194');
            case 'orcid': return this.isSectionActive('158');
            case 'achievements': return this.isSectionActive('157');
            case 'associations': return this.isSectionActive('115');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.awardSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/award/project-outcome/404'], {queryParams: {'awardId': this.awardId}});
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

