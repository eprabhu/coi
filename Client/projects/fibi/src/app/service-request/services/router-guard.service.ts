import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { ServiceRequestService } from './service-request.service';

declare var $: any;

@Injectable()
export class RouterGuardService {

    serviceRequestId = null;

    constructor(
        private _serviceRequestService: ServiceRequestService,
        private _router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.serviceRequestId = route.queryParamMap.get('serviceRequestId');
        return this.isRouteEnabled(state.url);
    }

    canDeactivate(component, currentRoute: ActivatedRouteSnapshot): boolean {
        this.serviceRequestId = currentRoute.queryParamMap.get('serviceRequestId');
        if (this.serviceRequestId && this._serviceRequestService.isServiceRequestDataChange) {
            $('#service-request-tab-change-confirmation').modal('show');
            return false;
        } else {
            return true;
        }
    }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
            case 'overview': return this.isSectionActive('SR2001');
            case 'comments': return this.isSectionActive('SR2002');
            case 'history': return this.isSectionActive('SR2003');
            case 'route-log': return this.isSectionActive('SR2004');
            case 'questionnaire': return this.isSectionActive('SR2005');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._serviceRequestService.sectionConfigurations[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/service-request/overview'],
            { queryParams: { serviceRequestId: this.serviceRequestId } });
    }

}
