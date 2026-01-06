import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { CommonDataService } from '../services/common-data.service';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class RouteGuardService implements CanActivate, CanDeactivate<boolean> {
    awardId = null;
    constructor(private _router: Router, public _commonData: CommonDataService, public _commonService: CommonService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.awardId = route.queryParamMap.get('awardId');
        if (!this.isRouteEnabled(state.url)) {
            return false;
        }
        if (this.isAuthorizationRequiredRoute(state.url)) {
            return this.isAuthorized(state.url, route);
        }
        return !!this.awardId;
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 4)) {
            case 'expensetrack': return this.isSectionActive('114');
            case 'purchase': return this.isSectionActive('146');
            case 'revenue': return this.isSectionActive('147');
            case 'budget': return this.isSectionActive('102');
            case 'revenue-amount': return this.isSectionActive( '191');
            case 'committed-amount': return this.isSectionActive( '192');
            case 'actual-amount': return this.isSectionActive( '193');
            case 'claims': return this.isSectionActive('148');
            case 'budget-summary': return this.isSectionActive('509');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.awardSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/award/budget-expense/404'],
            {queryParams: {'awardId': this.awardId}});
    }

    /**
     * checks if route(s) needs auth/department level right checking.
     * @param url
     */
    isAuthorizationRequiredRoute(url: string): boolean {
        return url.includes('/claims');
    }

    /**
     * checks departmental rights for its specific route(s).
     * @param url
     * @param route
     */
    isAuthorized(url: string, route: ActivatedRouteSnapshot): boolean {
        if (url.includes('/claims') && this._commonData.departmentLevelRights.includes('VIEW_AWARD_CLAIM_TRACKING')) {
            return true;
        }
        setTimeout(() => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'You don\'t have access to this Module.');
        }, 2500);
        this._router.navigate(['fibi/award/overview'], {queryParams: {awardId: this.awardId}});
        return false;
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

