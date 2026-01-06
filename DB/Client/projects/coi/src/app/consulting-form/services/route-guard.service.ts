import { Injectable } from '@angular/core';
import { Observable, NextObserver } from 'rxjs';
import { ConsultingService } from './consulting.service';
import { CommonService } from '../../common/services/common.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { hideAutoSaveToast, openCommonModal } from '../../common/utilities/custom-utilities';

@Injectable()
export class RouteGuardService {

  constructor(private _commonService: CommonService, private _consultingService: ConsultingService) { }

    canActivate(): Observable<boolean> {
        return new Observable<boolean>((observer: NextObserver<boolean>) => {
            observer.next(true);
        });
    }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
        if (this._consultingService.isFormBuilderDataChangePresent && !this._commonService.hasChangesAvailable) {
            openCommonModal('consultingForm-unsaved-changes-modal');
            return false;
        }
        if (this._commonService.hasChangesAvailable) {
            this._commonService.isNavigationStopped = true;
            this._commonService.attemptedPath = nextState.url;
            this._commonService.appLoaderContent = 'Saving...';
            this._commonService.isShowLoader.next(true);
            const ELEMENTS = document.getElementsByClassName('invalid-feedback');
            const ERR_TOAST = document.getElementById('coi-retry-error-toast');
            if ((ERR_TOAST && !ERR_TOAST?.classList.contains('invisible')) || (ELEMENTS && ELEMENTS.length)) {
                this._commonService.isShowLoader.next(false);
            }
            return false;
        } else {
            this._commonService.isNavigationStopped = false;
            this._commonService.attemptedPath = '';
            hideAutoSaveToast('ERROR');        
            return true;
        }
    }

}
