// Last updated by Krishnanunni on 29-11-2019
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationEngineService } from '../services/notification-engine.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-view-notification',
  templateUrl: './view-notification.component.html',
  styleUrls: ['./view-notification.component.css']
})
export class ViewNotificationComponent implements OnInit, OnDestroy {

  isToViewable: boolean;
  isCcViewable: boolean;
  isBccViewable: boolean;
  notificationType: any = {};
  notificationId: any;
  ruleAppliedToForHtml: string;
  ruleAppliedToName: any;
  resultData: any;
  appliedList: any = [];
  appliedListKeys: string[];
  module: any;
  userValue: any = [];
  mapRoles: any = {};
  $subscriptions: Subscription[] = [];

  constructor(public _notificationService: NotificationEngineService,
    public _activatedRoute: ActivatedRoute,
    public _router: Router) { }

  ngOnInit() {
    this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
      this.notificationId = params['notificationTypeId'];
    }));
    const promise2 = this.getRoleTypes();
    const promise3 = this.getNotificationById(this.notificationId);
    Promise.all([promise2, promise3]).then((values) => {
      this.checkReceipientTypes();
    });
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * To get the notification details by notification id
   * @param  {} notificationId
   */
  getNotificationById(notificationId) {
    return new Promise((resolve, reject) => {
      this.$subscriptions.push(this._notificationService.getNotificationById(notificationId).
        subscribe(data => {
          this.notificationType = data['notificationType'];
          this.getModules();
          this.ruleAppliedToForHtml = '' + ((this.notificationType.moduleCode * 10) + this.notificationType.subModuleCode) + '';
          resolve(true);
        }));
    });
  }

  /**
   * used to get the roleTypes to apply notification
   */
  getRoleTypes() {
    return new Promise((resolve, reject) => {
      this.$subscriptions.push(this._notificationService.getRoleTypes().
        subscribe(data => {
          this.mapRoles = data;
          resolve(true);
        }));
    });
  }
  /**
   * This function see if there consists atleast one receipient on Cc or Bcc and show the corresponding Div
   */
  checkReceipientTypes() {
    if (this.notificationType.notificationRecipient.length > 0) {
      for (const receipient of this.notificationType.notificationRecipient) {
        if (receipient.recipientType === 'TO') {
          this.isToViewable = true;
        } else if (receipient.recipientType === 'CC') {
          this.isCcViewable = true;
        } else if (receipient.recipientType === 'BCC') {
          this.isBccViewable = true;
        }
      }
    }
  }
  /**
   * To go back to notification list page
   */
  goBack() {
    this._router.navigate(['/fibi/notification']);
  }
  /**
   * To get module description
   */
  getModules() {
    this.$subscriptions.push(this._notificationService.getModules().
      subscribe(data => {
        this.resultData = data['moduleSubmoduleList'];
        this.appliedList = this._notificationService.groupBy(this.resultData, 'MODULE_CODE');
        this.module = this.appliedList[this.notificationType.moduleCode].filter(item =>
          item.SUB_MODULE_CODE === this.notificationType.subModuleCode)[0].DESCRIPTION;
      }));
  }

}
