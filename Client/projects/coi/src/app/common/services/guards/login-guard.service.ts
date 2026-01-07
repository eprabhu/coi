import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';
import { HeaderService } from '../../header/header.service';
import { openCommonModal } from '../../utilities/custom-utilities';

@Injectable()
export class LoginGuard {
    constructor(private _router: Router, public _commonService: CommonService) { }
    canActivate(): boolean {
        if (!this._commonService.enableSSO) {
            return true;
        } else {
            this._router.navigate(['error/401']);
            return false;
        }
}

}

@Injectable()
export class LogoutGuard {

    constructor(private _commonService: CommonService, private _headerService: HeaderService) {}

    canActivate(): boolean {
        if (this._headerService.logoutConfirmModalConfig.isOpenModal) {
            this.openLogoutConfirmationModal();
            return false;
        } else {
            return true;
        }
    }

    private openLogoutConfirmationModal(): void {
        const IS_ENABLE_SSO = this._commonService.enableSSO;
        this._headerService.logoutConfirmModalConfig.modalConfig.namings.primaryBtnName = IS_ENABLE_SSO ? 'Exit' : 'Logout';
        this._headerService.logoutConfirmModalConfig.modalConfig.ADAOptions.primaryBtnTitle = IS_ENABLE_SSO ? 'Click here to exit application' : 'Click here to logout';
        this._headerService.logoutConfirmModalConfig.modalConfig.ADAOptions.primaryBtnAriaLabel = IS_ENABLE_SSO ? 'Click here to exit application' : 'Click here to logout';
        const TIMEOUT_REF = setTimeout(() => {
            openCommonModal(this._headerService.logoutConfirmModalConfig?.modalConfig?.namings?.modalName);
            clearTimeout(TIMEOUT_REF);
        }, 200);
    }

}
