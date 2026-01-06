import { EDITOR_CONFIURATION, HTTP_SUCCESS_STATUS } from './../../../app-constants';
import { subscriptionHandler } from './../../../common/utilities/subscription-handler';
import { CommonService } from './../../../common/services/common.service';
import { ElasticConfigService } from './../../../common/services/elastic-config.service';
/** Last updated by Arun Raj on 12-12-2019 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationEngineService } from '../services/notification-engine.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { deepCloneObject, removeUnwantedTags, scrollIntoView } from '../../../common/utilities/custom-utilities';
import { AuditLogService } from '../../../common/services/audit-log.service';

class AuditLog {
  'description': string;
  'isActive' : string;
  'message' : string;
  'moduleCode': string | number;
  'promptUser' : string;
  'recipients': [];
  'subModuleCode' : string | number;
  'subject': string;
}

class NotificationType extends AuditLog {
  'createTimestamp': number;
  'createUser': string;
  'module': {}
  'notificationRecipient': [] ; 
  'notificationTypeId': number; 
  'updateUser': string; 
  'updateTimestamp': number; 
  'isSystemSpecific': string;
}

@Component({
  selector: 'app-modify-notification',
  templateUrl: './modify-notification.component.html',
  styleUrls: ['./modify-notification.component.css'],
  providers: [AuditLogService,
		{ provide: 'moduleName', useValue: 'NOTIFICATION' }]
})
export class ModifyNotificationComponent implements OnInit, OnDestroy {

  isCcViewable: boolean;
  isBccViewable: boolean;
  placeholders: any = [];
  result: any = {};
  fibiPersons: any = [];
  warningMsgObj: any = {};
  elasticResultObject: any;
  pointOfContactObject: any = {};
  elasticSearchOptions: any = {};
  clearField: String;
  notificationId: any = null;
  notificationType: any = {
    notificationTypeId: '',
    moduleCode: '',
    subModuleCode: '',
    description: '',
    subject: '',
    message: '',
    promptUser: 'N',
    isActive: 'Y',
    isSystemSpecific: 'N',
    createUser: '',
    createTimestamp: null,
    updateUser: '',
    updateTimestamp: null,
    notificationRecipient: []
  };
  recipients: any = {
    notificationRecipientId: '',
    recipientPersonId: '',
    roleTypeCode: '',
    recipientType: '',
    createUser: '',
    createTimestamp: null,
    updateUser: '',
    updateTimestamp: null,
  };
  persons = [];
  role = 'N';
  send = 'TO';
  ruleAppliedToForHtml: any = {};
  ruleAppliedToName: any;
  resultData: any;
  appliedList: any;
  appliedListKeys: string[];
  mapRoles: any = {};
  roleCode: any;
  roleCodeTo: any = 'null';
  roleCodeCc: any = 'null';
  roleCodeBcc: any = 'null';
  module: string;
  deleteRecipient;
  IsShowStickyNote = false;
  stickyNoteContents: any = {
    noContentMessage: 'No placeholder available',
    contentHeader: 'Click on a placeholder to copy it',
    content: null
  };
  isSaving = false;

  public Editor = DecoupledEditor;
  editorConfig = EDITOR_CONFIURATION;
  $subscriptions: Subscription[] = [];
  before: any = {};

  constructor(private _notificationService: NotificationEngineService,
    private _activatedRoute: ActivatedRoute, private _elasticConfig: ElasticConfigService,
    private _router: Router, public _commonService: CommonService, private _auditLogService: AuditLogService
  ) { }

  ngOnInit() {
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
      this.notificationId = params['notificationTypeId'];
    }));
    this.getModules();
    const promise2 = this.getRoleTypes();
    let promise3 = null;
    if (this.notificationId != null) {
      promise3 = this.getNotificationById(this.notificationId);
    }
    Promise.all([promise2, promise3]).then((values) => {
      this.checkReceipientTypes();
    });
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
  /**
   * used to get selected object from elastic search
   * @param {} value
   */
  selectedPOC(value) {
    if (value) {
      this.pointOfContactObject = {};
      this.pointOfContactObject.fullName = value.full_name;
      this.pointOfContactObject.prncpl_id = value.prncpl_id;
      this.elasticSearchOptions = Object.assign({}, this.elasticSearchOptions);
      this.elasticSearchOptions.defaultValue = '';
      this.addPerson();
    }
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
   * used to add the notification recipient persons
   */
  addPerson() {
    this.clearField = new String('true');
    if (this.pointOfContactObject.fullName != null || this.pointOfContactObject.fullName !== undefined) {
      this.recipients = this._notificationService.addPerson(this.notificationType, this.pointOfContactObject, this.role, this.send);
      if (this.recipients != null) {
        this.notificationType.notificationRecipient.push(Object.assign({}, this.recipients));
      }
      this.pointOfContactObject.fullName = null;
      this.pointOfContactObject.prncpl_id = null;
    }
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
      this.notificationType.notificationRecipient.push(Object.assign({}, this.recipients));
    }
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
   * used to remove the recipient by recipient id
   * @param {} recipient
   */
  removeRecipient(recipient) {
    let before = {'notificationName' : this.notificationType.description,'recipients' : this.notificationType.notificationRecipient.map(e => e.recipientName)}
    this.$subscriptions.push(this._notificationService.removeRecipientById(recipient.notificationRecipientId).
      subscribe(data => {
        this.removePerson(recipient);
        let after = {'notificationName' : this.notificationType.description,'recipients' : this.notificationType.notificationRecipient.map(e => e.recipientName)}
        this._auditLogService.saveAuditLog('U', before, after, null, Object.keys(after), this.notificationId);
      }));
  }

  /**
   * used to remove the persons before save the notification
   * @param {} person
   */
  removePerson(person) {
    this.notificationType.notificationRecipient.splice(this.notificationType.notificationRecipient.indexOf(person), 1);
  }
  /**
   * used to get the notification by notificationId
   * @param {} notificationId
   */
  getNotificationById(notificationId) {
    return new Promise((resolve, reject) => {
      this.$subscriptions.push(this._notificationService.getNotificationById(notificationId).subscribe(
        data => {
          this.notificationType = data['notificationType'];
          this.before = this.prepareAuditLog(this.notificationType);
          this.updateEditorContent();
          this.getModules();
          resolve(true);
        }));
    });
  }
  /**
   * to save or update the notification
   */
  createOrUpdateNotification() {
    this.checkNotificationMandatoryFilled();
    (this.notificationId !== null && this.notificationId !== undefined && this.warningMsgObj.isShowWarning === false) ?
      this.updateNotification() : this.createNotification();
  }
  /**
   * Sets the notification objects while updating the notification.
   */
  updateNotification() {
    this.notificationType.updateTimestamp = new Date().getTime();
    this.notificationType.updateUser = this._commonService.getCurrentUserDetail('userName');
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._notificationService.modifyNotification(this.notificationType).subscribe((data: any) => {
        this.notificationType = data.notificationType;
        this.updateEditorContent();
        this.saveAuditLog('U');
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification saved successfully.');
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    }
  }

  private saveAuditLog(type): void {
    let after = this.prepareAuditLog(this.notificationType);
    this._auditLogService.saveAuditLog(type, type === 'I' ? {} : this.before, after, null, Object.keys(after), this.notificationId);
    this.before = this.prepareAuditLog(this.notificationType);
  }

  private prepareAuditLog(notificationDetails: NotificationType): AuditLog{
    let notificationAuditLog = deepCloneObject(notificationDetails);
    notificationAuditLog['recipients'] = notificationAuditLog.notificationRecipient.map(e => e.recipientName);
    let EXCLUDED_VALUES = ['createTimestamp', 'createUser', 'module', 'notificationRecipient', 'notificationTypeId', 'updateUser', 'updateTimestamp', 'isSystemSpecific'];
    Object.keys(notificationAuditLog).forEach((key) => {
      if (!EXCLUDED_VALUES.includes(key)) {
        notificationAuditLog[key] = notificationAuditLog[key] || "--NONE--";
      } else {
        delete notificationAuditLog[key];
      }
    });
    this.updateStringValues(notificationAuditLog);
    return notificationAuditLog;
  }

  updateStringValues(auditLog): void {
    auditLog.message = auditLog.message.replace(/<[^>]*>/g, '');
    auditLog.subModuleCode = auditLog.subModuleCode != '--NONE--' ? 
                                         this.getSubModuleDescription(auditLog.subModuleCode, auditLog.moduleCode) :
                                         '--NONE--'
    auditLog.moduleCode = this.resultData.find(ele => ele.MODULE_CODE === auditLog.moduleCode).DESCRIPTION;
  }

  getSubModuleDescription(subModuleCode, moduleCode): string {
      return this.appliedList[moduleCode].find(ele => ele.SUB_MODULE_CODE == subModuleCode).DESCRIPTION;
  }
  /**
   * Sets the notification objects while creating a new notification.
   */
  createNotification() {
    if (this.notificationType.description === '' || this.notificationType.moduleCode === ''
      || this.notificationType.subModuleCode === '' || this.notificationType.description == null
      || this.notificationType.moduleCode == null || this.notificationType.subModuleCode == null) {
      setTimeout(() => {
        scrollIntoView('notification-edit-card', 'start');
      }, 100);
    }
    if (this.warningMsgObj.isShowWarning === false && !this.isSaving) {
      this.isSaving = true;
      this.notificationType.createTimestamp = new Date().getTime();
      this.notificationType.createUser = this._commonService.getCurrentUserDetail('userName');
      this.$subscriptions.push(
        this._notificationService.createNotification(this.notificationType).subscribe((data: any) => {
          this.notificationType = data.notificationType;
          this.notificationId = data.notificationType.notificationTypeId;
          this.saveAuditLog('I');
          this.updateEditorContent();
          this._router.navigate(['fibi/notification/modifynotification'],
            { queryParams: { notificationTypeId: data.notificationType.notificationTypeId } });
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification has been created successfully.');
            this.isSaving = false;
        }, err => { this.isSaving = false; }));
    }
  }

  /**
   * To go back to notification list page
   */
  goBack() {
    this._router.navigate(['fibi/notification']);
  }

  /**
   * To get all modules and submodules
   */
  getModules() {
    this.$subscriptions.push(this._notificationService.getModules().
      subscribe(data => {
        this.resultData = data['moduleSubmoduleList'];
        this.appliedList = this._notificationService.groupBy(this.resultData, 'MODULE_CODE');
        if (this.notificationType.moduleCode !== '') {
          this.module = this.appliedList[this.notificationType.moduleCode].filter
            (item => item.SUB_MODULE_CODE === this.notificationType.subModuleCode)[0].DESCRIPTION;
          this.ruleAppliedToForHtml = {
            MODULE_CODE: this.notificationType.moduleCode,
            SUB_MODULE_CODE: this.notificationType.subModuleCode,
            DESCRIPTION: this.module
          };
          this.setStickyNotePlaceholders();
        }
        this.appliedListKeys = Object.keys(this.appliedList);
      }));
  }

  /**
   * To get the submodule by module change
   * @param {} module
   */
  moduleChange(module) {
    if (module === 'null') {
      this.result.selectedModule = null;
      this.result.subModules = [];
    } else {
      this.$subscriptions.push(this._notificationService.getSubModules(module).
        subscribe(data => {
          const value = data;
          this.result.subModules = value['subModules'];
        }));
    }
  }

  /**
   * To set the prompt user checkbox as it's value is either Y or N instead of boolean
   */
  promptUser(event) {
    this.notificationType.promptUser = event.target.checked ? 'Y' : 'N';
  }

  /**
   * To get the details of selected module and submodule code
   */
  onRuleAppliedToSelectionChange() {
    this.notificationType.moduleCode = this.ruleAppliedToForHtml.MODULE_CODE;
    this.notificationType.subModuleCode = this.ruleAppliedToForHtml.SUB_MODULE_CODE;
    this.ruleAppliedToName = this.ruleAppliedToForHtml.DESCRIPTION;
    this.setStickyNotePlaceholders();
  }

  /**
   * To set the placeholders on sticky note
   */
  setStickyNotePlaceholders() {
    this.$subscriptions.push(this._notificationService.getPlaceholders(this.notificationType.moduleCode).
      subscribe(data => {
        this.placeholders = data;
        this.stickyNoteContents.content = null;
        for (const placeholder of this.placeholders) {
          if (this.stickyNoteContents.content != null) {
            this.stickyNoteContents.content = this.stickyNoteContents.content +
              '<div class="mt-2"><b class="hand-cursor sticky-hover">{'
              + placeholder.argumentvalue + '}</b> - ' + placeholder.description + '</div>';
          } else {
            this.stickyNoteContents.content = '<div class="mt-2"><b class="hand-cursor sticky-hover">{'
              + placeholder.argumentvalue + '}</b> - ' + placeholder.description + '</div>';
          }
        }
      }));
  }

  /**
   * To check wether mandatory fields are filled or not
   */
  checkNotificationMandatoryFilled() {
    this.updateEditorContent();
    if (this.notificationType.description == null || this.notificationType.description === '' ||
      this.notificationType.moduleCode == null || this.notificationType.subModuleCode == null ||
      this.notificationType.moduleCode === '' || this.notificationType.subModuleCode === '' ||
      this.notificationType.subject == null || this.notificationType.subject === '' ||
      this.notificationType.message === null || this.notificationType.message === '') {
      this.warningMsgObj.isShowWarning = true;
    } else {
      this.warningMsgObj.isShowWarning = false;
    }
  }

  updateEditorContent(): void {
    this.notificationType.message = removeUnwantedTags(this.notificationType.message);
  }

  /**
   * @param {} object1
   * @param {} object2
   * This function executed from compareWith attribute of select tag to tell how object matches so that
   * select tag can set default value when oninit in 'Notification applies to' section
   */
  compareByCode(object1, object2) {
    return (object1.MODULE_CODE === object2.MODULE_CODE && object1.SUB_MODULE_CODE === object2.SUB_MODULE_CODE
      && object1.DESCRIPTION === object2.DESCRIPTION);
  }

  onStickyNoteClose(data) {
    this.IsShowStickyNote = data;
  }
}
