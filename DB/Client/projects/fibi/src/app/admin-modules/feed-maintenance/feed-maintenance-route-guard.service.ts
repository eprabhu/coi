import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class FeedMaintenanceRouteGuardService implements CanActivate {

  constructor(private _router: Router, private _commonService: CommonService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    return this.isAuthorized(state.url, route);
  }

  /**
   * checks departmental rights for its specific route(s).
   * @param url
   * @param route
   */
  async isAuthorized(url: string, route: ActivatedRouteSnapshot) {
    if (url.includes('/sap-feed') && (await this._commonService.checkPermissionAllowed('MAINTAIN_SAP_FEED') ||
        await this._commonService.checkPermissionAllowed('VIEW_SAP_FEED') ||
        await this._commonService.checkPermissionAllowed('MAINTAIN_INTERFACE_PROCESSING'))) {
      return true;
    }
    if (url.includes('/sap-feed') && !(await this._commonService.checkPermissionAllowed('MAINTAIN_SAP_FEED') &&
      await this._commonService.checkPermissionAllowed('VIEW_SAP_FEED')) &&
      await this._commonService.checkPermissionAllowed('MAINTAIN_MANPOWER_FEED')) {
      this._router.navigate(['/fibi/feed-maintenance/manpower-feed']);
      return true;
    }
    if (url.includes('/manpower-feed') && await this._commonService.checkPermissionAllowed('MAINTAIN_MANPOWER_FEED')) {
      return true;
    }
    if (url.includes('/invoice-feed')&& (await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_FEED') ||
        await this._commonService.checkPermissionAllowed('VIEW_INVOICE_FEED') ||
        await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_INTERFACE_PROCESSING'))) {
      return true;
    }
    if (url.includes('/sap-feed') && !(await this._commonService.checkPermissionAllowed('MAINTAIN_SAP_FEED') &&
      await this._commonService.checkPermissionAllowed('VIEW_SAP_FEED')) && !await this._commonService.checkPermissionAllowed('MAINTAIN_MANPOWER_FEED')
      && (await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_FEED') || await this._commonService.checkPermissionAllowed('VIEW_INVOICE_FEED'))) {
      this._router.navigate(['/fibi/feed-maintenance/invoice-feed']);
      return true;
    }
    setTimeout(() => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'You don\'t have access to this Module.');
    }, 2500);
    this._router.navigate(['/fibi/admin-dashboard']);
    return false;
  }

}
