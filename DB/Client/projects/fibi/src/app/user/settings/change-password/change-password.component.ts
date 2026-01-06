import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangePasswordService } from './change-password.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  passwordObj: any = {};
  isCurrentPassword = true;
  isNewPassword = true;
  isConfirmPassword = true;
  changePasswordWidgetOpen = true;
  $subscriptions: Subscription[] = [];

  constructor(private _changePasswordService: ChangePasswordService, public _commonService: CommonService) { }

  ngOnInit() {
    this.clear();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  changePassword() {
    this.passwordObj.isFilled = this.passwordObj.current === null || this.passwordObj.new === null || this.passwordObj.confirm === null ||
      this.passwordObj.current === undefined || this.passwordObj.new === undefined ||
      this.passwordObj.confirm === undefined ?
      false : true;
    this.passwordObj.isExist = this.passwordObj.new !== null && this.passwordObj.current !== null &&
      this.passwordObj.new === this.passwordObj.current ? true : false;
    if (this.passwordObj.new !== null && this.passwordObj.confirm !== null) {
      this.passwordObj.isMatched = this.passwordObj.new === this.passwordObj.confirm ? true : false;
    }
    if (this.passwordObj.isFilled && !this.passwordObj.isExist && this.passwordObj.isMatched) {
      const reqObj: any = {};
      reqObj.password = this.passwordObj.current;
      reqObj.newPassword = this.passwordObj.new;
      reqObj.personId = this._commonService.getCurrentUserDetail('personID');
      this.$subscriptions.push(this._changePasswordService.changePassword(reqObj).subscribe(data => {
        let result: any = {};
        result = data || [];
        this.passwordObj.isInvalid = result.oldPasswordErrorMessage !== null ? true : false;
        if (result.updatePasswordMessage !== null) {
          this.passwordObj.message = result.updatePasswordMessage;
        } else if (result.oldPasswordErrorMessage !== null) {
          this.passwordObj.message = result.oldPasswordErrorMessage;
        }
      },
        error => { },
        () => {
          document.getElementById('changePasswordWarning').click();
        }));
    }
  }

  clear() {
    this.passwordObj.message = null;
    this.passwordObj.isInvalid = this.passwordObj.isExist = false;
    this.passwordObj.isMatched = this.passwordObj.isFilled = true;
    this.passwordObj.current = this.passwordObj.new = this.passwordObj.confirm = null;
  }

}
