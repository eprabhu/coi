import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ReviewerDashboardRouteGuardService implements CanActivate {

    constructor(private _commonService: CommonService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const IS_SHOW_OPA_DASHBOARD = this._commonService.isShowOpaDisclosure;
        // Check if user has COI reviewer rights OR OPA reviewer rights or Administrator rights
        const HAS_ACCESS = (this._commonService.checkFCOIDashboardRights('DISCLOSURE_ONLY')) || (this._commonService.checkOPARights() && IS_SHOW_OPA_DASHBOARD);
        if (!HAS_ACCESS) {
            this._commonService.navigateToErrorRoute('FORBIDDEN'); // Adjust redirect path as needed
            return false;
        }
        return true;
    }

}
