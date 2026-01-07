// Last updated by Krishnanunni on 29-11-2019
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ProjectTeamService {

  constructor(private http: HttpClient, private _commonService: CommonService) { }

  maintainProjectTeam(team) {
    return this.http.post( this._commonService.baseUrl + '/saveOrUpdateAwardProjectTeam',
    {'awardProjectTeam': team, 'awardId': team.awardId} );
  }

  deleteProjectTeam(team) {
    return this.http.post( this._commonService.baseUrl + '/deleteAwardProjectTeam', team );
  }

  getRolodexData(rolodexId) {
    return this.http.post(this._commonService.baseUrl + '/getRolodexDetailById', {'rolodexId': rolodexId});
  }

}
