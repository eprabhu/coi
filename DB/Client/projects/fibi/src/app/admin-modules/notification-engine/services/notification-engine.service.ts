import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class NotificationEngineService {

  requestObject = {
    'notificationTypeId': null
  };
  recipients: any = {};
  sortCountObj: any = {};
  isSaving = false;

  constructor(private http: HttpClient, private _commonService: CommonService ) { }

  /**
   * Service call for create the notification
   * @param  {} notificationType
   */
  createNotification(notificationType) {
    return this.http.post(this._commonService.baseUrl + '/createNotification', { 'notificationType': notificationType });
  }
  /**
   * Service call for fetch all notifications
   * @param  {} notificationRequest
   */
  fetchAllNotifications(notificationRequest) {
    return this.http.post(this._commonService.baseUrl + '/getNotifications', notificationRequest);
  }
  /**
   * Service call for update notifications
   * @param  {} notificationType
   */
  modifyNotification(notificationType) {
      return this.http.post(this._commonService.baseUrl + '/modifyNotification',
      { 'notificationType': notificationType, 'personId': this._commonService.getCurrentUserDetail('personID') });
  }
  /**
   * Service call for get the notification by id
   * @param  {} notificationTypeId
   */
  getNotificationById(notificationTypeId) {
    return this.http.post(this._commonService.baseUrl + '/getNotificationById', { 'notificationTypeId': notificationTypeId });
  }
  /**
   * Service call for delete notification by id
   * @param  {} notificationRecipientId
   */
  removeRecipientById(notificationRecipientId) {
    return this.http.post(this._commonService.baseUrl + '/removeRecipientById', { 'notificationRecipientId': notificationRecipientId });
  }
  /**
   * Service call for getting the placeholder list
   */
  getPlaceholders(value) {
    return this.http.post(this._commonService.baseUrl + '/getNotificationPlaceholder', { 'moduleCode': value });
  }
  /**
   * Service call for get the module list
   */
  getModules() {
    return this.http.get(this._commonService.baseUrl + '/getBusinessRule');
  }
  getSubModules(value) {
    return this.http.post(this._commonService.baseUrl + '/getSubModules', { 'moduleCode': value });
  }
  /**
   * Service call for get the list of role description
   */
  getRoleTypes() {
    return this.http.get(this._commonService.baseUrl + '/getRoleDescription');
  }
  /**
   * Service call for to get the mail content based on the parameter
   * @param  {} requestObject
   */
  getNotificationContent(requestObject) {
    return this.http.post(this._commonService.baseUrl + '/getEmailContent', requestObject);
  }
  /**
   * Service call for the sending the mail
   * @param  {} requestObject
   */
  sendMail(requestObject) {
    return this.http.post(this._commonService.baseUrl + '/sendMailAtPrompt', requestObject);
  }
  /**
   * Service call for deleting the notification type by id
   * @param  {} notificationTypeId
   */
  removeNotificationById(notificationTypeId) {
    return this.http.post(this._commonService.baseUrl + '/removeNotificationById', { 'notificationTypeId': notificationTypeId });
  }
  /**
   * Service call for to group the module and submodules
   * @param  {} jsonData
   * @param  {} key
   */
  groupBy(jsonData, key) {
    return jsonData.reduce(function (objResult, item) {
      (objResult[item[key]] = objResult[item[key]] || []).push(item);
      return objResult;
    }, {});
  }
  /**
   * function used to add the recipient by role type in create and update notification
   * @param  {} notificationType
   * @param  {} role
   * @param  {} mapRoles
   * @param  {} roleCode
   * @param  {} send
   */
  addRoleType(notificationType, role, mapRoles, roleCode, send) {
    this.recipients.recipientName = null;
    this.recipients.recipientPersonId = null;
    if (notificationType.notificationRecipient.notificationRecipientId === undefined) {
      this.recipients.notificationRecipientId = null;
    }
    if (notificationType.notificationRecipient.find(x => parseInt(x.roleTypeCode, 0) === parseInt(roleCode, 0))) {
      return null;
    } else {
      if (role == 'N') {
        this.recipients.roleTypeCode = null;
      } else {
        this.recipients.roleTypeCode = roleCode;
        mapRoles.roleDescription.forEach((element, index) => {
          if (element.ROLE_TYPE_CODE == roleCode) {
            this.recipients.recipientName = element.DESCRIPTION;
          }
        });
        this.recipients.recipientType = send;
        this.recipients.createTimestamp = new Date().getTime();
        return this.recipients;
      }
    }
  }
  /**
   * function used to add the recipient as person in create and update notification
   * @param  {} notificationType
   * @param  {} pointOfContactObject
   * @param  {} role
   * @param  {} send
   */
  addPerson(notificationType, pointOfContactObject, role, send) {
    if (notificationType.notificationRecipient.notificationRecipientId == undefined) {
      this.recipients.notificationRecipientId = null;
    }
    if (notificationType.notificationRecipient.find(x => x.recipientPersonId === pointOfContactObject.prncpl_id)) {
      return null;
    } else {
      this.recipients.recipientName = pointOfContactObject.fullName;
      this.recipients.recipientPersonId = pointOfContactObject.prncpl_id;
      this.recipients.createUser = this._commonService.getCurrentUserDetail('userName');
      this.recipients.createTimestamp = new Date().getTime();
      this.recipients.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.recipients.updateTimestamp = new Date().getTime();
      if (role === 'N') {
        this.recipients.roleTypeCode = null;
      }
      this.recipients.recipientType = send;
      return this.recipients;
    }
  }
}
