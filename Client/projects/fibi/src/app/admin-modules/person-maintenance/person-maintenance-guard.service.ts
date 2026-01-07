import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { getPathWithoutParams, getSpecificUrlPart } from '../../common/utilities/custom-utilities';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class PersonMaintenanceGuardService implements CanActivate {
  constructor(private _router: Router, public _commonService: CommonService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const personID = next.queryParamMap.get('personId');
    const isLoggedInPerson = personID === this._commonService.getCurrentUserDetail('personID');
    return (isLoggedInPerson || this.isModuleRights(state.url));
  }

  isModuleRights(currentUrl: string): Promise<boolean> {
    switch (getSpecificUrlPart(getPathWithoutParams(currentUrl), 3)) {
      case 'orcid': return this.isAvailableRights(['MAINTAIN_ORCID_WORKS']);
      case 'delegation': return this.isAvailableRights(['MAINTAIN_DELEGATION']);
      case 'timesheet': return this.isAvailableRights(['MAINTAIN_KEY_PERSON_TIMESHEET', 'VIEW_KEY_PERSON_TIMESHEET']);
      case 'training': return this.isAvailableRights(['MAINTAIN_TRAINING']);
      case 'degree': return this.isAvailableRights(['MAINTAIN_PERSON']);
      default: return this._router.navigate(['/fibi/error/403']);
    }
  }

  async isAvailableRights(rightsArray: string[]) {
    for (const right of rightsArray) {
      if (await this._commonService.checkPermissionAllowed(right)) {
        return true;
      }
    }
    return this._router.navigate(['/fibi/error/403']);
  }
}



