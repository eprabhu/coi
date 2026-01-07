import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { InstituteProposalService } from './institute-proposal.service';

@Injectable()
export class RouteGuardService implements CanActivate, CanDeactivate<boolean> {
    instituteProposalId = null;
    constructor(private _instituteService: InstituteProposalService,
        private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.instituteProposalId = route.queryParamMap.get('instituteProposalId');
        return this.isRouteEnabled(state.url);
    }

    canDeactivate() {
        if (this._instituteService.isInstituteProposalDataChange) {
            document.getElementById('instituteProposalTabChangebutton').click();
            return false;
        } else {
            return true;
        }
      }

    isRouteEnabled(currentUrl: string): boolean {
        switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
            case 'overview': return this.isSectionActive('IP201');
            case 'attachments': return this.isSectionActive('IP202');
            case 'medusa': return this.isSectionActive('IP203');
            case 'budget': return this.isSectionActive('IP204');
            case 'comments': return this.isSectionActive('IP206');
            case 'ip-comparison': return this.isSectionActive('IP207');
            default: return true;
        }
    }

    isSectionActive(moduleCode: string): boolean {
        const isActive = this._instituteService.ipSectionConfig[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/instituteproposal/overview'],
            { queryParams: { instituteProposalId: this.instituteProposalId } });
    }
}
