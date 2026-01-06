/** last updated by Ayush on 03-11-2020 **/

import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot} from '@angular/router';
import { CommonDataService } from './common-data.service';
import { CommonService } from '../../common/services/common.service';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { HTTP_ERROR_STATUS } from '../../app-constants';

@Injectable()
export class ClaimRouteGuardService implements CanActivate, CanDeactivate<boolean> {
    claimId = null;
    constructor(public _commonData: CommonDataService, private _router: Router, public _commonService: CommonService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.claimId = route.queryParamMap.get('claimId');
        if (!this.isRouteEnabled(state.url)) { return false; }
        if (this.isAuthorizationRequiredRoute(state.url)) {
            return this.isAuthorized(state.url, route);
        }
        return !!this.claimId;
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
            case 'overview': return this.isSectionActive('CL1401');
            case 'endorsement': return this.isSectionActive('CL1405');
            case 'invoice': return this.isSectionActive('CL1408');
            case 'claim-summary': return this.isSectionActive('CL1402');
            case 'manpower': return this.isSectionActive('CL1404');
            case 'details-breakdown': return this.isSectionActive('CL1403');
            case 'attachments': return this.isSectionActive('CL1406');
            case 'route-log': return this.isSectionActive('CL1407');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.claimSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/claims/overview'],
            {queryParams: {'claimId': this.claimId}});
    }

    /**
     * checks if route(s) needs auth/department level right checking.
     * @param url
     */
    isAuthorizationRequiredRoute(url: string): boolean {
        return url.includes('/details-breakdown');
    }

    /**
     * checks departmental rights for its specific route(s).
     * @param url
     * @param route
     */
    isAuthorized(url: string, _route: ActivatedRouteSnapshot): boolean {
        if (url.includes('/details-breakdown') && this._commonData.$claimData.getValue().availableRights.includes('CLAIM_MAINTAIN_DETAILED_BREAKDOWN')) {
            return true;
        }
        this.showErrorToast();
        this.navigateToOverview();
        return false;
    }

    navigateToOverview() {
        this._router.navigate(['fibi/claims/overview'], { queryParams: { claimId: this.claimId } });
    }

    showErrorToast() {
        setTimeout(() => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'You don\'t have access to this Module.');
        }, 2500);
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
