import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HeaderService } from '../common/header/header.service';

@Injectable()
export class MigratedEngDeactivateRouteGuardService {

    constructor(private headerService: HeaderService) { }
    // Prevents navigation outside migration workflow if there are pending migrations, except for allowed routes
    canDeactivate(component: unknown, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): boolean {

        const ALLOWED_ROUTE_URLS = [
            '/coi/migrated-engagements/engagement-details',
            '/logout',
            '/coi/create-sfi/create',
            '/coi/entity-details/entity'
        ];
        const TARGET_URL = nextState?.url;
        //Allow navigation for selected URLs
        if (ALLOWED_ROUTE_URLS.some(path => TARGET_URL.includes(path))) {
            return true;
        }
        return !this.headerService.hasPendingMigrations;
    }
}
