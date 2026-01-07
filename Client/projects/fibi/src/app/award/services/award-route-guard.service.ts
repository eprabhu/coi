/** last updated by Ayush on 01-02-2021 **/

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { CommonDataService } from './common-data.service';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';

@Injectable()
export class AwardRouteGuardService implements CanActivate, CanDeactivate<boolean> {
    awardId = null;
    constructor(private _router: Router, public _commonData: CommonDataService, public _commonService: CommonService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.awardId = route.queryParamMap.get('awardId');
        if (!this.isRouteEnabled(state.url)) { return false; }
        return !!this.awardId;
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
            case 'overview': return this.isSectionActive('AW101');
            case 'comparison': return this.isSectionActive('AW119');
            case 'budget-expense': return this.isSectionActive('AW104');
            case 'dates': return this.isSectionActive('AW103');
            case 'reports': return this.isSectionActive('AW110');
            case 'terms-approval': return this.isSectionActive('AW112');
            case 'cost-share': return this.isSectionActive('AW106');
            case 'attachments': return this.isSectionActive('AW107');
            case 'expenditure': return this.isSectionActive('AW123');
            case 'hierarchy': return this.isSectionActive('AW115');
            case 'medusa': return this.isSectionActive('AW116');
            case 'route-log': return this.isSectionActive('AW118');
            case 'review': return this.isSectionActive('AW121');
            case 'questionnaire': return this.isSectionActive('AW109');
            case 'project-outcome': return this.isSectionActive('AW113');
            case 'permissions': return this.isSectionActive('AW114');
            case 'award-history': return this.isSectionActive('AW117');
            case 'other-information': return this.isSectionActive('AW120');
            case 'task': return this.isSectionActive('AW102');
            case 'payments': return this.isSectionActive('AW111');
            case 'manpower': return this.isSectionActive('AW105');
            case 'comments': return this.isSectionActive('AW122');
            default: return true;
        }
    }

    isSectionActive(sectionCode: string): boolean {
        const isActive = this._commonData.awardSectionConfig[sectionCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/award/overview'],
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
