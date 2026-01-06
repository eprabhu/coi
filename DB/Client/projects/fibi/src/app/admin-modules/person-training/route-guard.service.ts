import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class RouteGuardService implements CanActivate {

    constructor(private _router: Router, private _commonService: CommonService) {
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return await this.isRouteEnabled(state);
    }

    async isRouteEnabled(state: RouterStateSnapshot) {
        const isDashboardPath = getSpecificUrlPart(getPathWithoutParams(state.url), 3) === '';
        if (isDashboardPath) { return await this.hasMaintainTrainingRight(); }
        return (await this.hasMaintainTrainingRight() || this.hasFromInParameter(state));
    }

    async hasMaintainTrainingRight() {
        return await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
    }

    hasFromInParameter(state: any) {
        return Boolean(state._root.value.queryParams.from);
    }
}
