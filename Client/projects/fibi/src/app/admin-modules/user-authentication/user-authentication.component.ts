import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserAuthenticationService } from './user-authentication.service';

declare var $: any;

@Component({
  selector: 'app-user-authentication',
  templateUrl: './user-authentication.component.html',
  styleUrls: ['./user-authentication.component.css']
})
export class UserAuthenticationComponent implements OnInit {

  externalUsersList = [];
  extUserRequestObj: any = {};
  selectedUser: any = {};
  helpInfo = false;
  isDesc = false;
  column = '';
  direction: number = -1;
  $subscriptions: Subscription[] = [];
  searchText: string;
  adminComments: string;
  validationMap = new Map();
  userLoginActivity: any = {};
  loginUser = null;

  constructor(private _userAuthenticationService: UserAuthenticationService) { }

  ngOnInit() {
    this.extUserRequestObj = {
      'reverse': '',
      'sortBy': ''
    };
    this.getExternalUserDetails();
  }

  getExternalUserDetails() {
    this.$subscriptions.push(this._userAuthenticationService.getExternalUserDetails(this.extUserRequestObj)
      .subscribe((data: any) => {
        data = data || [];
        data.map(D => {
          if (D.verifiedFlag === 'D') {
            D.verifiedDescription = 'Deactivated';
          }
          if (D.verifiedFlag === 'P') {
            D.verifiedDescription = 'Pending';
          }
          if (D.verifiedFlag === 'A') {
            D.verifiedDescription = 'Approved';
          }
          if (D.verifiedFlag === 'R') {
            D.verifiedDescription = 'Rejected';
          }
        });
        this.externalUsersList = data;
      }));
  }

  updateApproveReject(actionType, userDetails) {
    if (this.validateConfirmation(actionType)) {
      const personIndex = this.externalUsersList.findIndex(item => item.personId === userDetails.personId);
      const requestObject = {
        'personId': userDetails.personId,
        'fullName': userDetails.fullName,
        'userName': userDetails.userName,
        'emailAddress': userDetails.emailAddress,
        'fundingOffice': userDetails.fundingOffice,
        'organizationName': userDetails.organizationName,
        'verifiedFlag': actionType,
        'verifiedAt': userDetails.verifiedAt,
        'verifiedBy': userDetails.verifiedBy,
        'adminComments': this.adminComments
      };
      this.$subscriptions.push(this._userAuthenticationService.updateApproveReject(requestObject)
        .subscribe((data: any) => {
          this.externalUsersList[personIndex] = Object.assign([], data);
          this.adminComments = '';
          this.closeModal(actionType);
          this.resetFilter()
        }));
    }
  }

  closeModal(actionType: string): void {
    actionType === 'R' ? $('#rejectExtUserModal').modal('hide') : $('#deactivateExtUserModal').modal('hide');
  }

  /**
   * @param  {}
   * sortClick()-sorts according to the order
   * order of sorting is decided by isDesc flag
   */
  sortClick(columnName: string): void {
    this.column = columnName;
    this.isDesc = !this.isDesc;
    this.direction = this.isDesc ? 1 : -1;
  }

  private resetFilter(): void {
    const temp = this.searchText;
    this.searchText = '';
    setTimeout(() => {
      this.searchText = temp
    });
  }

  validateConfirmation(actionType: string): boolean {
    this.validationMap.clear();
    if (actionType !== 'A' && !this.adminComments) {
      this.validationMap.set('comment', 'Please enter a comment');
    }
    return this.validationMap.size ? false : true;
  }

  cancelAction(): void {
    this.adminComments = '';
    this.validationMap.clear();
  }

  getExternalUserLoginDetails(userName) {
    this.$subscriptions.push(this._userAuthenticationService.getExternalUserLoginDetails({ 'userName': userName })
      .subscribe((data: any) => {
        this.userLoginActivity = data;
        document.getElementById('loginTimeModalButton').click();
      }));
  }

}
