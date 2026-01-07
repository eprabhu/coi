import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../common.service';
import { getPathWithoutParams, getSpecificUrlPart } from '../../../../../../fibi/src/app/common/utilities/custom-utilities';
import { COI_CONFIGURATIONS_RIGHTS, ENTITY_DASHBOARD_RIGHTS, PROJECT_DASHBOARD_RIGHTS } from '../../../app-constants';

@Injectable()
export class AdminRouteGuardService {

    constructor(public _commonService: CommonService) { }

    async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        localStorage.setItem('currentUrl', state.url);
        return await this.isPathRightAccessible(state);
    }

    private async isPathRightAccessible(state: RouterStateSnapshot): Promise<boolean> {
        if (await this.isPathAllowed(state)) {
            return true;
        } else {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return false;
        }
    }


    private async isPathAllowed(state: RouterStateSnapshot): Promise<boolean> {
        const path = getPathWithoutParams(getSpecificUrlPart(state.url, 2));
        if (this.isRightCheckingNeeded(path)) { return await this.hasPathRights(path); }
        return true;
    }

    private isRightCheckingNeeded(pathName: string): boolean {
        if (!pathName) { return false; }
        const PATHS = ['admin-dashboard', 'opa-dashboard', 'entity-dashboard', 'configuration', 'project-dashboard'];
        return PATHS.includes(pathName);
    }

    private async hasPathRights(path: string): Promise<boolean> {
        const IS_SHOW_OPA_DASHBOARD = this._commonService.isShowOpaDisclosure;
        const IS_SHOW_PROJECT_DASHBOARD = this._commonService.isShowFinancialDisclosure;
        switch (path) {
            case 'entity-dashboard': return this._commonService.getAvailableRight(ENTITY_DASHBOARD_RIGHTS);
            case 'configuration': return this._commonService.getAvailableRight(COI_CONFIGURATIONS_RIGHTS);
            case 'opa-dashboard': return this._commonService.checkOPARights() && IS_SHOW_OPA_DASHBOARD;
            case 'admin-dashboard': return this._commonService.checkFCOIDashboardRights('DISCLOSURES_AND_CMP');
            case 'project-dashboard': return this._commonService.getAvailableRight(PROJECT_DASHBOARD_RIGHTS) && IS_SHOW_PROJECT_DASHBOARD;
            default: return true;
        }
    }

}
