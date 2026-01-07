import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  linkSelected = 'THEMES';
  isApplicationAdministrator = false;
  sapBatchId: any;

  constructor(public _commonService: CommonService) { }

  ngOnInit() {
    this.getPermissions();
  }

  async getPermissions() {
    this.isApplicationAdministrator = await this._commonService.checkPermissionAllowed('APPLICATION_ADMINISTRATOR');
  }

}
