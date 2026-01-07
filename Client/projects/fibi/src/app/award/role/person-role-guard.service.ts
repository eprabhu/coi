import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { CommonDataService } from '../services/common-data.service';
import { RoleService } from './role.service';

@Injectable()
export class PersonRoleResolveGuardService implements CanActivate {

  constructor(private _roleService: RoleService, private _commonDataService: CommonDataService) { }
  result: any;
  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    this.result = this._commonDataService.awardData.value;
    return new Promise<boolean>(async (resolve) => {
      if (parseInt(route.queryParamMap.get('awardId'), 10) === this.result.award.awardId) {
        this._roleService.fetchAwardPersonRoles(
          {
            'awardId': this.result.award.awardId,
            'awardNumber': this.result.award.awardNumber,
            'isActiveAward': this.result.award.awardSequenceStatus === 'ACTIVE' ? true : false
          }).subscribe((res: any) => {
            if (res) {
              this._roleService.$awardPersonRolesDetails.next(res);
              resolve(true);
            } else {
              resolve(false);
            }
          });
      }
    });
  }
}
