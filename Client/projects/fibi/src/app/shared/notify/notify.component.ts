import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { NotifyService } from './notify.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, EDITOR_CONFIURATION } from '../../app-constants';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { removeUnwantedTags } from '../../common/utilities/custom-utilities';
import {
    CertificationLogRO,
    PersonNotificationMailLog,
    PersonNotifyMailRO,
    ProposalPerson
} from '../common.interface';

@Component({
    selector: 'app-notify',
    templateUrl: './notify.component.html',
    styleUrls: ['./notify.component.css']
})
export class NotifyComponent implements OnInit, OnDestroy {

    @Input() moduleItemKey;
    @Input() moduleCode;
    @Input() moduleName;
    @Input() availableRights: string[] = [];
    @Input() isEditMode = false;
    @Input() enableCertification = false;
    @Output() isShowNotificationModal: EventEmitter<boolean> = new EventEmitter<boolean>();

    proposalPersons: ProposalPerson[] = [];
    togglePersons: boolean[] = [];
    multiplePersonNotifications = [];
    notificationMap: any = {};
    isSaving = false;
    hasNotifyRight = false;
    elasticSearchOptions: any = {};
    clearField: String;
    roleId = null;
    recipientList: any = [];
    notificationObject: any = {
        subject: '',
        body: '',
        moduleItemKey: '',
        recipients: []
    };
    type: 'person' | 'role' | 'certification' = 'person';
    public Editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIURATION;
    recipients: any = {};
    roles: any;
    validationMap = new Map();
    $subscriptions: Subscription[] = [];

    constructor(private _elasticConfig: ElasticConfigService, private _notifyService: NotifyService,
        public _commonService: CommonService) { }

    ngOnInit() {
        this.getRoleTypes();
        this.setElasticPerson();
        this.openNotificationModal();
        this.checkAndEnableCertificationsFeature();
    }

    private checkAndEnableCertificationsFeature() {
        if (this.enableCertification) {
            this.hasNotifyRight = this.availableRights.includes('MODIFY_PROPOSAL') && this.isEditMode;
        }
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

    setElasticPerson() {
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    /**
     * sets elastic configuration for 'person', if person is choosen as recipient
     */
    toggleRecipient() {
        this.validationMap.delete('duplicateRecipient');
        if (this.type === 'person') {
            this.setElasticPerson();
        } else if (this.type === 'certification') {
            this.getAllPersonCertifications();
        }
    }

    getAllPersonCertifications() {
        this.$subscriptions.push(this._notifyService
            .getProposalPersonsForCertification({proposalId: this.moduleItemKey})
            .subscribe((res: { proposalPersons: ProposalPerson[] }) => {
                this.proposalPersons = res.proposalPersons;
            }, _err => this.showErrorMessage('Notification details fetch failed. Please try again.')));
    }

    notifyAgain() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._notifyService
                .sendPersonCertificationMail(this.generateCertificationMailRO())
                .subscribe((_res: any) => {
                    document.getElementById('close-notification-modal').click();
                    this.showSuccessMessage('Notification sent successfully.');
                    setTimeout(() => this.isSaving = false);
                }, _err => this.showErrorMessage('Notification failed to send. Please try again.')));
        }
    }

    generateCertificationMailRO(): PersonNotifyMailRO {
        return { proposalId: this.moduleItemKey };
    }

    /**
     * used to get object of selected person from elastic search
     * if the selected person exists in 'notificationObject.recipients' array , validation message is shown.
     * Otherwise pushes to notificationObject.recipients array. 'recipientList' array is used to show selected person in chips.
     * @param  {} value
     */
    selectedRecipient(value) {
        this.toggleRecipient();
        this.recipients.email_address = value.email_addr;
        if (this.recipients.email_address) {
            if (!this.notificationObject.recipients.find(recipient => recipient.emailAddress === value.email_addr)) {
                this.recipientList.push({ value: value.email_addr, code: null });
                this.notificationObject.moduleItemKey = this.moduleItemKey;
                this.setRecipients(value);
            } else {
                this.validationMap.set('duplicateRecipient', '* This person has already added');
            }
        }
    }

    /**
     * @param  {} event
     * if the selected role exists in 'notificationObject.recipients' array , validation message is shown.
     * Otherwise pushes to notificationObject.recipients array. 'recipientList' array is used to show selected role in chips.
     */
    selectRoleType(event) {
        this.validationMap.delete('duplicateRecipient');
        setTimeout(() => { this.roleId = null; });
        this.roles.roleDescription.forEach(element => {
            if (element.ROLE_TYPE_CODE === parseInt(event, 10)) {
                if (!this.notificationObject.recipients.find(recipient => recipient.roleTypeCode === event)) {
                    this.setRecipients(event);
                    this.recipientList.push({ value: element.DESCRIPTION, code: element.ROLE_TYPE_CODE });
                } else {
                    this.validationMap.set('duplicateRecipient', '* Role has already added');
                }
            }
        });
    }

    /**
     * data.code exists only in the case where role is choosen as recipient
     * if person is choosen as recipient,index to remove the recipient is finded by checking selected recipient object
     * exist in notificationObject.recipients array or not
     * @param  {} data
     */
    removeRecipient(data) {
        if (!data.code) {
            const Index = this.notificationObject.recipients.findIndex(item =>
                (item.toString().toLowerCase().includes(data.value.toLowerCase())));
            this.notificationObject.recipients.splice(Index, 1);
        } else {
            const Index = this.notificationObject.recipients.find(role => role.roleTypeCode === data.code);
            this.notificationObject.recipients.splice(Index, 1);
        }
    }

    /**
    * sends notification if all mandatory fields are filled
    */
    sendNotification() {
        this.validateMandatoryFields();
        if (this.validationMap.size === 0) {
            this.notificationObject.moduleItemKey = this.moduleItemKey;
            this.notificationObject.body = this.notificationObject.body.concat(this.setNotificationLinkInformation());
            this.$subscriptions.push(
                this._notifyService.sendEmailNotification(this.notificationObject, this.setNotificationServiceName()).subscribe(response => {
                    if (response === 'success') {
                        document.getElementById('close-notification-modal').click();
                        this.emitNotificationFlag(false);
                        this.clearNotifyFields();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification sent successfully.');
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Notification failed.');
                    }
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Sending Notification failed. Please try again.');
                }));
        }
    }
    /**
    * checks whether mandatory fields are filled or not
    */
    validateMandatoryFields() {
        this.notificationObject.body = removeUnwantedTags(this.notificationObject.body);
        this.validationMap.clear();
        if (this.notificationObject.recipients.length === 0) {
            this.validationMap.set('recipients', '* Please add Recipient');
        }
        if (!this.notificationObject.subject) {
            this.validationMap.set('subject', ' * Please select Subject  ');
        }
        if (!this.notificationObject.body) {
            this.validationMap.set('body', '* Please add Message');
        }
    }

    /**
     * used to get the roleTypes to apply notification
     */
    getRoleTypes() {
        this.$subscriptions.push(this._notifyService.getRoleTypes({ 'moduleCode': this.moduleCode, 'subModuleCode': 0 }).subscribe(data => {
            this.roles = data;
        }));
    }

    /**
     * clear notification fields
     */
    clearNotifyFields() {
        this.notificationObject.body = '';
        this.notificationObject.subject = '';
        this.notificationObject.recipients = [];
        this.recipientList = [];
        this.roleId = null;
        this.type = 'person';
        this.clearField = new String('true');
        this.validationMap.clear();
    }

    /**
     * @param  {} value
     * This function is triggered whenever we send notification or close modal to emit the modal condition as false to parent component
     */
    emitNotificationFlag(value) {
        this.isShowNotificationModal.emit(value);
    }
    /**
     * returns notification service name based on module code
     */
    setNotificationServiceName() {
        let notifyServiceCallName;
        switch (this.moduleCode) {
            case 1: notifyServiceCallName = '/awardInvitation'; break;
            case 3: notifyServiceCallName = '/proposalInvitation'; break;
            case 15: notifyServiceCallName = '/grandInvitation'; break;
            case 13: notifyServiceCallName = '/agreementInvitation'; break;
            default: notifyServiceCallName = null;
        }
        return notifyServiceCallName;
    }

    /**
     * @param  {} value
     * prepares recipient object and pushes to recipients array in notification object
     * email address exists only if person is chosen as recipient
     * roleTypeCode exists only if role is chosen as recipient
     */
    setRecipients(value) {
        const recipientObj: any = {};
        recipientObj.emailAddress = value.email_addr ? value.email_addr : null;
        recipientObj.recipientType = 'TO';
        recipientObj.roleTypeCode = value.prncpl_id ? null : value;
        this.notificationObject.recipients.push(recipientObj);
    }

    /**
     *sets Notification link information according to module name such as proposal,grant call or award
    */
    setNotificationLinkInformation() {
        return `<br>Follow the <a href= ${window.location.href} > link </a> to view ` + this.moduleName;
    }

    /**
     * Opens Notification Modal by clicking modal's id
     */
    openNotificationModal() {
        document.getElementById('app-notify-btn').click();
    }

    showPersonNotification(index: number, person: ProposalPerson) {
        if (!this.togglePersons[index]) {
            this.fetchOrShowPersonNotificationDetails(person, index);
        } else {
            this.togglePersons[index] = !this.togglePersons[index];
        }
    }
    private fetchOrShowPersonNotificationDetails(person: ProposalPerson, index: number) {
        if (this.notificationMap[person.proposalPersonId]) {
            this.showPersonNotificationFromMap(index, person);
        } else {
            this.fetchPersonNotifications(person, index);
        }
    }

    private showPersonNotificationFromMap(index: number, person: ProposalPerson) {
        this.multiplePersonNotifications[index] = this.notificationMap[person.proposalPersonId];
        this.togglePersons[index] = !this.togglePersons[index];
    }

    generateCertificationLogRO(person: ProposalPerson = null): CertificationLogRO {
        return { moduleCode: 3, moduleItemKey: this.moduleItemKey, property1: person.personId };
    }

    private fetchPersonNotifications(person: ProposalPerson, index: number) {
        this.$subscriptions.push(this._notifyService
            .getPersonCertificationMailLog(this.generateCertificationLogRO(person))
            .subscribe((res: PersonNotificationMailLog[]) => {
                this.notificationMap[person.proposalPersonId] = res;
                this.multiplePersonNotifications[index] = res;
                this.togglePersons[index] = !this.togglePersons[index];
            }, _err => this.showErrorMessage('Notification details fetch failed. Please try again.')));
    }

    private showErrorMessage(message: string) {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }

    private showSuccessMessage(message: string) {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, message);
    }
}
