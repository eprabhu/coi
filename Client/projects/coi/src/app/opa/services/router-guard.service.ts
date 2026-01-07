import {Injectable} from '@angular/core';
import {NextObserver, Observable, Subscription} from 'rxjs';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {hideAutoSaveToast, openCommonModal} from '../../common/utilities/custom-utilities';
import {OpaService} from './opa.service';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class RouterGuardService {
    $subscriptions: Subscription[] = [];

    constructor(private _opaService: OpaService, private _commonService: CommonService) {
    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: NextObserver<boolean>) => {
            observer.next(true);
        });
    }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): any {
        if (this._opaService.isFormBuilderDataChangePresent && !this._commonService.hasChangesAvailable) {
            openCommonModal('opa-unsaved-changes-modal');
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

