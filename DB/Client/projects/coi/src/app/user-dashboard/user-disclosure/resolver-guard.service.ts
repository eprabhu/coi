import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable, Subscriber} from 'rxjs';
import {HeaderService} from '../../common/header/header.service';

@Injectable()
export class ResolverGuardService implements CanActivate {

    constructor(private _headerService: HeaderService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            this._headerService.getActiveDisclosure().subscribe((res: any) => {
                this._headerService.setActiveDisclosures(res);
                observer.next(true);
            }, err => observer.next(false));
        });
    }

}
