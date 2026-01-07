import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common/services/common.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  deployMap = environment.deployUrl;

  constructor(private _router: Router, private _commonService: CommonService) { }

  ngOnInit() {
    if (!this._commonService.enableSSO) {
      ['authKey', 'cookie', 'sessionId', 'currentTab'].forEach((item) => localStorage.removeItem(item));
      this._commonService.currentUserDetails = {};
    }
    this._commonService.rightsArray = [];
  }
  login() {
    (this._commonService.enableSSO === true) ? this._router.navigate( ['fibi/dashboard'] ) : this._router.navigate(['/login']);
  }
}

