import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { EXT_USER_REGN_LINK } from '../../app-constants';
@Component({
  selector: 'app-unauthorised',
  templateUrl: './unauthorised.component.html',
  styleUrls: ['./unauthorised.component.css']
})
export class UnauthorisedComponent implements OnInit {

  constructor(public _commonService: CommonService) { }
  isShowApprovalMessage = false;
  message = ''

  ngOnInit() {
    localStorage.clear();
    this.checkExternalUserStatus();
  }

  navigateToExternalUserRegn(userName, email, fullName) {
    if (EXT_USER_REGN_LINK) {
      window.open(`${EXT_USER_REGN_LINK}?name=${userName}&email=${email}&fname=${fullName}`, '_self');
    }
  }

  /**
   * isExternal = true - if person is not in person table but in external table
   * isExternal = false - if person is not in person table and not in external table
   * isExternal = false & userEmail = null - > error since Fibi cannot continue the registration without email
   */
  checkExternalUserStatus() {
    const user = this._commonService.currentUserDetails;
    if (!user.isExternalUser && user.userName) {
      this.navigateToExternalUserRegn(user.userName, user.email, user.fullName);
    } else if (user.isExternalUser && user.userName) {
      this.isShowApprovalMessage = true;
      this.message = 'You are yet to be approved by Fibi Admin.Please contact your university for further details'
    } else {
      this.isShowApprovalMessage = true;
      this.message = 'You have issues with your Authentication. Please contact your support team.'
    }
  }

}
