/** last updated by Aravind on 12-11-2019 **/

import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate, Router} from '@angular/router';
import { GrantCommonDataService } from './grant-common-data.service';
import {getPathWithoutParams, getSpecificUrlPart} from '../../common/utilities/custom-utilities';

@Injectable()
export class GrantRouteGuardService implements CanActivate, CanDeactivate<boolean> {
    grantId = null;
    constructor(public _commonData: GrantCommonDataService, private _router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.grantId = route.queryParamMap.get('grantId');
        if (!this.isRouteEnabled(state.url)) { return false; }
        return !!this.grantId;
    }

    isRouteEnabled(currentUrl: string) {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
            case 'overview': return this.isSectionActive('GC1501');
            case 'attachments': return this.isSectionActive('GC1502');
            case 'ioi': return this.isSectionActive('GC1503');
            case 'kpi': return this.isSectionActive('GC1504');
            case 'scoring-criteria': return this.isSectionActive('GC1507');
            case 'evaluation': return this.isSectionActive('GC1508');
            case 'submitted-proposals': return this.isSectionActive('GC1505');
            case 'history': return this.isSectionActive('GC1506');
            case 'other-information': return this.isSectionActive('GC1509');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._commonData.grandSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/grant/overview'],
            { queryParams:{grantId: this.grantId}});
    }

    canDeactivate() {
       if (this._commonData.isGrantCallDataChange) {
           document.getElementById('grantTabChangebutton').click();
           return false;
       } else {
           return true;
       }
    }
}
