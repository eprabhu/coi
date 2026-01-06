/** Last edited by Arun Raj on 12-12-2019*/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationEngineService } from '../services/notification-engine.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { AuditLogService } from '../../../common/services/audit-log.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: 'notifications-list.component.html',
  styleUrls: ['notifications-list.component.css'],
  providers: [AuditLogService,
		{ provide: 'moduleName', useValue: 'NOTIFICATION' }]
})
export class NotificationsListComponent implements OnInit, OnDestroy {
  notifications: any = [];
  result: any = {};
  notificationRequest: any = {};
  appliedList: any;
  resultData: any;
  moduleDescription: any;
  notificationId;
  searchText = '';
  $subscriptions: Subscription[] = [];
  isDesc = true;
  column = 'notificationTypeId';
  sortOrder = 1;
  helpInfo = false;

  constructor(private _notificationService: NotificationEngineService,
              public _commonService: CommonService, private _auditLogService: AuditLogService) { }

  ngOnInit() {
    this.getAllNotifications();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   *  To fetch all the notofications
   */
  getAllNotifications() {
    this.$subscriptions.push(this._notificationService.fetchAllNotifications(this.notificationRequest).
      subscribe(data => {
        if (data != null) {
          this.result = data;
          this.getModules();
        }
      }));
  }

  actionsOnPageChange(event) {
    this.notificationRequest.currentPage = event;
    this.getAllNotifications();
    this._commonService.pageScroll('pageScrollToTop');
  }
  /**
   * To get all modules and submodule
   */
  getModules() {
    this.$subscriptions.push(this._notificationService.getModules().
      subscribe(data => {
        this.resultData = data['moduleSubmoduleList'];
        this.appliedList = this._notificationService.groupBy(this.resultData, 'MODULE_CODE');
        this.result.notificationTypes.forEach((element, index) => {
          const MODULE = element.moduleCode;
          const SUBMODULE = element.subModuleCode;
          if (MODULE && SUBMODULE) {
            this.moduleDescription = this.appliedList[MODULE].filter(item => item.SUB_MODULE_CODE === SUBMODULE)[0].DESCRIPTION;
          }
          this.result.notificationTypes[index].module = [];
          this.result.notificationTypes[index].module.push(this.moduleDescription);
        });
        this.notifications = this.result.notificationTypes;
      }));
  }
  /**
   * Sort the notification list based on the parameter
   * @param  {} sortFieldBy
   */
  sortResult(sortFieldBy) {
    this.isDesc = !this.isDesc;
    this.column = sortFieldBy;
    this.sortOrder = this.isDesc ? 1 : -1;
  }

  /**
   * to delete the notification
   * @param  {} notificationTypeId
   */
  removeNotification(notificationTypeId) {
    let notification = this.notifications.find(ele => ele.notificationTypeId === notificationTypeId);
    let before = {'notificationId' : notificationTypeId ,'description': notification.description}
    this.$subscriptions.push(this._notificationService.removeNotificationById(notificationTypeId).subscribe(data => {
      this.getAllNotifications();
      this._auditLogService.saveAuditLog('D', before, {}, null, ['description'], notificationTypeId);
    }));
  }
}
