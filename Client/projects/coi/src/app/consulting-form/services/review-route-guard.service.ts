import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class ReviewRouteGuardService {

    constructor() {}

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): any {
            return true;
      }
}
