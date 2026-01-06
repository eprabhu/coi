import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ProjectOutcomeService } from './project-outcome.service';

@Injectable()
export class OutcomeResolverService implements Resolve<any> {

  constructor(private _outcomeService: ProjectOutcomeService) { }

  resolve(route: ActivatedRouteSnapshot) {
    if (route.queryParamMap.get('awardId') != null) {
      return this._outcomeService.loadAllProjectOutcomes({
        'awardId': route.queryParamMap.get('awardId')
      });
    }
  }

}
