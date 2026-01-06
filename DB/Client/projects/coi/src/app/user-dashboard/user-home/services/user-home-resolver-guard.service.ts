import { Injectable } from '@angular/core';
import { UserHomeService } from './user-home.service';
import { LandingConfig } from '../user-home.interface';
import { forkJoin, NextObserver, Observable, of } from 'rxjs';
import { HeaderService } from '../../../common/header/header.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG } from '../../../app-constants';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class UserHomeResolverGuardService implements CanActivate {

    constructor(private _commonService: CommonService,
                private _headerService: HeaderService,                
                private _userHomeService: UserHomeService) { }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: NextObserver<boolean>) => {
            forkJoin([
                this._userHomeService.getActiveDisclosure(),
                this._headerService.landingConfig ? of(this._headerService.landingConfig) : this._userHomeService.getMetaDataForLanding() 
            ]).subscribe((res: any) => {
                observer.next(true);
                this._headerService.setActiveDisclosures(res[0]);
                this._userHomeService.landingConfig = res[1];
                this._headerService.landingConfig = res[1];
            }, (err: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            });
        });
    }

}
