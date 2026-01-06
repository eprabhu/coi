import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { HeaderService } from '../../common/header/header.service';
import { CanDeactivate } from '@angular/router';
import { UserProjectsCountResponse } from '../../shared-components/configurable-project-list/configurable-project-list.interface';

@Injectable()
export class UserProjectResolverGuardService implements CanDeactivate<boolean> {

    constructor(private _headerService: HeaderService) {}

    canDeactivate(): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            this._headerService.fetchMyProjectsCount().subscribe((userProjectsCount: UserProjectsCountResponse) => {
                this._headerService.updateProjectTabCount(userProjectsCount);
                observer.next(true);
            }, (err: any) => {
                observer.next(true);
            });
        });
    }

}
