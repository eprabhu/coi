import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanDeactivate } from '@angular/router';
import { HTTP_ERROR_STATUS } from '../app-constants';
import { CommonService } from '../common/services/common.service';
import { AgreementCommonDataService } from './agreement-common-data.service';

@Injectable()
export class AgreementRouteGuardService implements CanActivate, CanDeactivate<boolean> {

  constructor(private _router: Router, public _commonservice: AgreementCommonDataService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return route.queryParamMap.get('agreementId') ? true : false;
  }

 canDeactivate() {
   if (this._commonservice.isAgreementDataChange) {
       document.getElementById('agreementTabChangebutton').click();
       return false;
   } else {
       return true;
   }

 }

}

@Injectable()
export class CreateAgreementGuard implements CanActivate {
    canCreateAgreement = false;
    isCreateParameterEnabled = false;
    constructor(private _router: Router, private _commonService: CommonService) { }
    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        if (!route.queryParamMap.get('agreementId')) {
            this.isCreateParameterEnabled = this._commonService.isCreateAgreement;
            this.canCreateAgreement = await this._commonService.checkPermissionAllowed('CREATE_AGREEMENT');
           if(!this.isCreateParameterEnabled && !this.canCreateAgreement) {
                this._router.navigate(['/fibi/dashboard']);
                setTimeout(() => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'You don\'t have the right to create an Agreement');
                }, 1000);
            } else {
                return true;  
            }            
        } else {
            return true;
        }
    }
}

@Injectable()
export class AdminTabsGuard  implements CanActivate {
    isAgreementAdministrator = false;
    isGroupAdministrator = false;
    constructor(private _router: Router, private _commonService: CommonService) { }
    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
           this.isAgreementAdministrator = await this._commonService.checkPermissionAllowed('AGREEMENT_ADMINISTRATOR');
           this.isGroupAdministrator = await this._commonService.checkPermissionAllowed('VIEW_ADMIN_GROUP_AGREEMENT');
            if (this.isAgreementAdministrator || this.isGroupAdministrator) {
                return true;
            } else {
                this._router.navigate(['/fibi/dashboard']);
            }
    }
}

