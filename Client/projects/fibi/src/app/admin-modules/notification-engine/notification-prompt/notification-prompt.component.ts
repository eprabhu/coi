import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationEngineService } from '../services/notification-engine.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';

@Component({
  selector: 'app-notification-prompt',
  templateUrl: './notification-prompt.component.html',
  styleUrls: ['./notification-prompt.component.css']
})

export class NotificationPromptComponent implements OnInit, OnDestroy {

  isCcViewable: boolean;
  isBccViewable: boolean;
  elasticResultObject: any;
  warningMsgObj: any = {};
  pointOfContactObject: any = {};
  elasticSearchOptions: any = {};
  mapRoles: any = {};
  notificationId: any;
  id: any;
  requestObject: any = {};
  fibiPersons: any = [];
  subject: string;
  message: string;
  notificationType: any = {
    notificationRecipient: []
  };
  emailRecipient: any = [];
  recipients: any = {
    recipientPersonId: '',
    roleTypeCode: '',
    recipientType: '',
    recipientName: ''
  };
  role = 'N';
  send = 'TO';
  roleCode: any;
  roleCodeTo: any = 'null';
  roleCodeCc: any = 'null';
  roleCodeBcc: any = 'null';
  clearField: String;
  moduleCode: string;
  promptObject = JSON.parse(sessionStorage.getItem('promptObject'));
  $subscriptions: Subscription[] = [];

  constructor(private _commonService: CommonService,
    private _notificationService: NotificationEngineService,
    private _activatedRoute: ActivatedRoute, private _elasticConfig: ElasticConfigService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
      this.notificationId = params['notificationTypeId'];
      this.id = params['sectionId'];
      this.moduleCode = params['section'];
    }));
    this.requestObject.notificationTypeId = this.notificationId;
    this.requestObject.moduleItemKey = this.id;
    this.requestObject.moduleCode = this.moduleCode;
    const promise2 = this.getRoleTypes();
    const promise3 = this.getNotificationById(this.notificationId);
    Promise.all([promise2, promise3]).then((values) => {
      this.findPersonDescription();
      this.checkReceipientTypes();
    });
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * used to get selected object from elastic search
   * @param  {} value
   */
  selectedPOC(value) {
    this.pointOfContactObject = {};
    this.pointOfContactObject.fullName = value.full_name;
    this.pointOfContactObject.prncpl_id = value.prncpl_id;
    this.addPerson();
  }
  /**
   * used to add the notification recipient persons
   */
  addPerson() {
    this.recipients = {};
    this.clearField = new String('true');
    this.recipients = this._notificationService.addPerson(this.notificationType, this.pointOfContactObject, this.role, this.send);
    if (this.recipients != null) {
      this.emailRecipient.push(Object.assign({}, this.recipients));

    }
    this.pointOfContactObject.fullName = null;
    this.pointOfContactObject.prncpl_id = null;
  }
  /**
   * used to add the notification recipient by role
   */
  addRoleType(type) {
    switch (type) {
      case 'to':
        this.roleCode = this.roleCodeTo;
        setTimeout(() => { this.roleCodeTo = 'null'; });
        break;
      case 'cc':
        this.roleCode = this.roleCodeCc;
        setTimeout(() => { this.roleCodeCc = 'null'; });
        break;
      case 'bcc':
        this.roleCode = this.roleCodeBcc;
        setTimeout(() => { this.roleCodeBcc = 'null'; });
        break;
      default:
        this.roleCode = null;
    }
    this.recipients = this._notificationService.addRoleType(this.notificationType, this.role, this.mapRoles, this.roleCode, this.send);
    if (this.recipients != null) {
      this.emailRecipient.push(Object.assign({}, this.recipients));
    }
  }
  /**
   * used to remove the persons before save the notification
   * @param  {} person
   */
  removePerson(person) {
    this.emailRecipient.splice(this.emailRecipient.indexOf(person), 1);
  }
  /**
   * This function see if there consists atleast one receipient on Cc or Bcc and show the corresponding Div
   */
  checkReceipientTypes() {
    if (this.notificationType.notificationRecipient.length > 0) {
      for (const receipient of this.notificationType.notificationRecipient) {
        if (receipient.recipientType === 'CC') {
          this.isCcViewable = true;
        } else if (receipient.recipientType === 'BCC') {
          this.isBccViewable = true;
        }
      }
    }
  }
  /**
   * used to add the notification recipient by role
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
  * To get the notification details by notification id
  * @param  {} notificationId
  */
  getNotificationById(notificationId) {
    return new Promise((resolve, reject) => {
      this.$subscriptions.push(this._notificationService.getNotificationById(notificationId).subscribe(
        data => {
          this.notificationType = data['notificationType'];
          resolve(true);
        }));
    });
  }
  /**
   * used to set the recipient name and details after checking the fibi person list
   */
  findPersonDescription() {
    this.notificationType.notificationRecipient.forEach(element => {
      if (element.roleTypeCode == null) {
        const userValue = this.fibiPersons.find((person) => {
          return person[0] == element.recipientPersonId;
        });
        element.recipientName = userValue[1];
      } else {
        const description = this.mapRoles.roleDescription.find(function (role) {
          return role.ROLE_TYPE_CODE == element.roleTypeCode;
        });
        element.recipientName = description.DESCRIPTION;
      }
    });
  }
  /**
   * To send mail to the recipients
   */
  sendMail() {
    this.requestObject.subject = this.promptObject.subject;
    this.requestObject.body = this.promptObject.body;
    this.requestObject.recipients = this.emailRecipient;
    this.requestObject.notificationTypeId = this.notificationId;
    this.requestObject.moduleItemKey = this.id;
    this.requestObject.moduleCode = this.moduleCode;
    this.requestObject.prompted = true;
    this.$subscriptions.push(this._notificationService.sendMail(this.requestObject).
      subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, data);
      },
        err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'An error encountered.');
        }));
    this._router.navigate(['/fibi/dashboard/proposalList']);
  }
  /**
   * To go back to proposal list
   */
  goBack() {
    this._router.navigate(['/fibi/dashboard/proposalList']);
  }
}
