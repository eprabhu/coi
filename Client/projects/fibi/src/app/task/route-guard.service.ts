import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {CommonDataService} from '../award/services/common-data.service';

@Injectable()
export class RouteGuardService implements CanActivate {
    awardId = null;
    constructor(private _router: Router, public _commonData: CommonDataService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.awardId = next.queryParamMap.get('awardId');
        return this.isSectionActive();
    }

    isSectionActive(): boolean {
        const isActive = this._commonData.awardSectionConfig['143'].isActive || this._commonData.awardSectionConfig['144'].isActive;
        return isActive ? isActive :  this._router.navigate(['/fibi/award/overview'],
            {queryParams: {'awardId': this.awardId}});
    }
}


