import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { NotificationService } from './notification.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  notificationWidgetOpen = true;
  searchText: string;
  notificationList: any = [];
  isGroupExpanded: boolean[] = [];
  $subscriptions: Subscription[] = [];
  isSave = false;

  constructor(private _notificationService: NotificationService, private _commonService: CommonService) { }

  ngOnInit() {
    this.getUserPreferenceNotifications();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getUserPreferenceNotifications() {
    this.$subscriptions.push(this._notificationService.fetchUserNotification()
      .subscribe(data => {
        this.formatNotificationList(data);
      }));
  }

  /**
   *
   * @param notifications - notification array to be formatted
   * formats the object to an array of modules that encloses the list of notifications
   */
  formatNotificationList(notifications) {
    this.notificationList = [];
    const moduleNames = Object.keys(notifications);
    moduleNames.forEach(moduleName => {
      this.notificationList.push({ moduleName: moduleName, notificationListGrouped: notifications[moduleName] });
    });
    this.openAllGroupsByDefault();
  }

  activateOrDeactivateNotificationForUser(notificationOfGroup, moduleIndex, listIndex) {
    if (!this.isSave) {
      this.isSave = true;
      this.notificationList[moduleIndex].notificationListGrouped[listIndex].IS_SENT =
        !this.notificationList[moduleIndex].notificationListGrouped[listIndex].IS_SENT;
      this.$subscriptions.push(this._notificationService.activateOrDeactivateUserNotification({
        preferenceId: notificationOfGroup.PREFERENCE_ID,
        notificationTypeCode: notificationOfGroup.NOTIFICATION_TYPE_ID
      }).subscribe((data: any) => {
        if (data.activated) {
          this.notificationList[moduleIndex].notificationListGrouped[listIndex].IS_SENT = 1;
          this.notificationList[moduleIndex].notificationListGrouped[listIndex].PREFERENCE_ID = null;
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification activated');
        } else {
          this.notificationList[moduleIndex].notificationListGrouped[listIndex].IS_SENT = 0;
          this.notificationList[moduleIndex].notificationListGrouped[listIndex].PREFERENCE_ID = data.preferenceId;
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification deactivated');
        }
        this.isSave = false;
      }, err => {
        this.isSave = false;
        this.notificationList[moduleIndex].notificationListGrouped[listIndex].IS_SENT =
          !this.notificationList[moduleIndex].notificationListGrouped[listIndex].IS_SENT;
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
      }));
    }
  }

  openAllGroupsByDefault() {
    this.isGroupExpanded.length = this.notificationList.length;
    this.isGroupExpanded.fill(true);
  }

  showOrHideList(index) {
    this.isGroupExpanded[index] = !this.isGroupExpanded[index];
  }
}
