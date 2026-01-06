/** last updated by Ayush on 28-12-2020 **/

import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot} from '@angular/router';
import { CommonDataService } from './common-data.service';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';

@Injectable()
export class ProgressReportRouteGuardService implements CanActivate, CanDeactivate<boolean> {
    progressReportId = null;
    constructor(public _commonData: CommonDataService, private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.progressReportId = route.queryParamMap.get('progressReportId');
        if (!this.isRouteEnabled(state.url)) { return false; }
        return !!this.progressReportId;
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
            case 'overview': return this.isSectionActive('PR1601');
            case 'milestones': return this.isSectionActive('PR1602');
            case 'equipments': return this.isSectionActive('PR1604');
            case 'performance-indicator': return this.isSectionActive('PR1603');
            case 'attachments': return this.isSectionActive('PR1605');
            case 'route-log': return this.isSectionActive('PR1606');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.progressReportSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/progress-report/overview'],
            { queryParams: {progressReportId: this.progressReportId}});
    }

    canDeactivate() {
        if (this._commonData.isDataChange) {
            document.getElementById('tabDataChangebutton').click();
            return false;
        } else {
            return true;
        }

    }

}
