import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {getPathWithoutParams, getSpecificUrlPart} from '../../common/utilities/custom-utilities';
import {CommonDataService} from '../services/common-data.service';

@Injectable()
export class RouteGuardService implements CanActivate {
    progressReportId = null;
    constructor(public _commonData: CommonDataService, private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.progressReportId = route.queryParamMap.get('progressReportId');
        return this.isRouteEnabled(state.url);
    }

    isRouteEnabled(currentUrl: string) {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 4)) {
            case 'details': return this.isSectionActive('1605');
            case 'summary': return this.isSectionActive('1606');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.progressReportSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/progress-report/performance-indicator/404'],
            { queryParams: {progressReportId: this.progressReportId}});
    }
}
