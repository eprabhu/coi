import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class NoteRouteGuard {
    constructor(private _commonService: CommonService) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this._commonService.canShowReporterNotes) {
            return true;
        } else {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return false;
        }
    }
}

@Injectable()
export class AttachmentRouteGuard {
    constructor(private _commonService: CommonService) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this._commonService.canShowReporterAttachments) {
            return true;
        } else {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return false;
        }
    }
}

@Injectable()
export class DisclosureRouteGuard {
    constructor(private _commonService: CommonService) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const IS_ANY_DISCLOSURE_ENABLED = this._commonService?.isShowFinancialDisclosure || this._commonService?.isShowOpaDisclosure ||
            this._commonService?.isShowTravelDisclosure || this._commonService?.isShowConsultingDisclosure;
        if (IS_ANY_DISCLOSURE_ENABLED) {
            return true;
        } else {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return false;
        }
    }
}

@Injectable()
export class ProjectRouteGuard {
    constructor(private _commonService: CommonService) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this._commonService.isShowFinancialDisclosure && this._commonService.activeProjectsTypes?.length) {
            return true;
        } else {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return false;
        }
    }
}

@Injectable()
export class UserEngagementResolveGuard {
    private readonly _moduleCode = 'SFI53';
    constructor(private _commonService: CommonService) { }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode)
    }
}
