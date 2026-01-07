import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { SharedModule } from '../../../shared/shared.module';
import { EDITOR_CONFIGURATION, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, OPA_MODULE_CODE } from '../../../app-constants';
import { closeCoiSlider, deepCloneObject, openCoiSlider } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { PERSON_NOTIFICATION_SLIDER_ID, RECIPIENT_TYPE_OPTIONS } from '../../reviewer-dashboard-constants';
import { ContactPersonDetails, NotificationDetails, NotificationObject, NotificationTypeRO, PersonDetails, Recipient, RecipientGroup } from '../../reviewer-dashboard.interface';
import { Subscription } from 'rxjs';
import { ReviewerDashboardService } from '../../services/reviewer-dashboard.service';
import { removeUnwantedTags } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { CommonService } from '../../../common/services/common.service';
import { FormsModule } from '@angular/forms';
import { PersonNotificationHistoryComponent } from './person-notification-history/person-notification-history.component';

@Component({
    selector: 'app-person-notification',
    templateUrl: './person-notification.component.html',
    styleUrls: ['./person-notification.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule, FormsModule, PersonNotificationHistoryComponent]
})
export class PersonNotificationComponent implements OnInit {

    @Input() notificationSliderData: { personDetailsForSlider: PersonDetails, personIndex: number, personDetailsList?: PersonDetails[] };
    @Output() closePage: EventEmitter<any> = new EventEmitter<any>();

    notificationTypeRO: NotificationTypeRO = new NotificationTypeRO();
    notificationObject: NotificationObject = new NotificationObject();
    defaultKeypersonDetails = new Recipient();
    public Editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIGURATION;
    validationMap = new Map<string, string>();
    notificationTemplates = [];
    templateOptions = 'EMPTY#EMPTY#false#false';
    selectedTemplateLookUpList = [];
    isCcViewable: boolean = false;
    isBccViewable: boolean = false;
    isEditorFocused = false;
    elasticSearchOptionsForTo: any = {};
    elasticSearchOptionsForCc: any = {};
    elasticSearchOptionsForBcc: any = {};
    clearField: String;
    $subscriptions: Subscription[] = [];
    recipientGroup: RecipientGroup = 'TO';
    isOpenSlider = false;
    activeTab: 'NEW_NOTIFICATION' | 'PAST_NOTIFICATIONS' = 'NEW_NOTIFICATION';
    notificationList: NotificationDetails[] = [];
    personNotificationSliderID = PERSON_NOTIFICATION_SLIDER_ID;
    recipientType = RECIPIENT_TYPE_OPTIONS;


    /**
    * This host listener is used to keep the background scroll fixed at the top at all times.
    */
    @HostListener('window:scroll')
    onScroll(): void {
        if (this.isEditorFocused) {
            window.scrollTo(0, 0);
        }
    }

    constructor(public reviewerDashboardService: ReviewerDashboardService, private _commonService: CommonService,
        private _elasticConfig: ElasticConfigService
    ) { }

    ngOnInit(): void {
        this.fetchAllNotificationTemplates();
        this.setElasticPersonOptions();
        this.setDefaultKeypersonDetails();
        this.getSentNotificationHistory();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getSentNotificationHistory(): void {
        const REQ_OBJ = {
            moduleCode: OPA_MODULE_CODE,
            subModuleItemKey: this.defaultKeypersonDetails.recipientPersonId,
            actionType: 'PERS_DISC_REQ_NOTIFY'
        }
        this.$subscriptions.push(this.reviewerDashboardService.getPersonNotificationHistory(REQ_OBJ).subscribe((data: NotificationDetails[]) => {
            this.notificationList = data;
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching notification history');
        }))
    }

    private viewSlider(): void {
        if (!this.isOpenSlider) {
            this.isOpenSlider = true;
            setTimeout(() => {
                openCoiSlider(this.personNotificationSliderID);
            });
        }
    }

    private setDefaultKeypersonDetails(): void {
        const KEYPERSON = this.notificationSliderData?.personDetailsForSlider;
        const PERSON_LIST = this.notificationSliderData?.personDetailsList;
        if (PERSON_LIST?.length > 0) {
            PERSON_LIST.forEach(person => {
                const RECIPIENT = new Recipient();
                RECIPIENT.recipientName = person.personFullName;
                RECIPIENT.recipientPersonId = person.personId;
                this.notificationObject.recipients.push(RECIPIENT);
            });
            this.notificationObject.subModuleItemKey = null;
        } else if (KEYPERSON) {
            this.defaultKeypersonDetails.recipientName = KEYPERSON.personFullName;
            this.defaultKeypersonDetails.recipientPersonId = KEYPERSON.personId;
            this.notificationObject.recipients.push(this.defaultKeypersonDetails);
            this.notificationObject.subModuleItemKey = this.defaultKeypersonDetails.recipientPersonId;
        }
    }

    private validateMandatoryFields(): void {
        this.notificationObject.message = removeUnwantedTags(this.notificationObject.message);
        this.validationMap.clear();
        const TO_RECIPIENTS = this.notificationObject.recipients.filter(e => e.recipientType === this.recipientType.TO)
        if (TO_RECIPIENTS.length === 0) {
            this.validationMap.set('recipients', 'Please add at least one recipient.');
        }
        if (!this.notificationObject.subject) {
            this.validationMap.set('subject', 'Please provide the subject.');
        }
        if (!this.notificationObject.message) {
            this.validationMap.set('message', 'Please provide the message.');
        }
    }

    private fetchAllNotificationTemplates(): void {
        this.notificationTemplates = [];
        this.notificationObject = new NotificationObject();
        this.$subscriptions.push(this._commonService.fetchAllNotifications(this.notificationTypeRO)
            .subscribe((data: any) => {
                if (data != null) {
                    this.notificationTemplates = data?.notificationTypes;
                }
                this.viewSlider();
            },
                (error: any) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Notification templates fetch failed, please try again.');
                    this.viewSlider();
                }
            ));
    }

    private addPerson(pointOfContactObject: any): void {
        this.clearField = new String('true');
        if (pointOfContactObject.personId) {
            const RECIPIENT = this.addPersonDetails(pointOfContactObject, this.recipientGroup);
            if (RECIPIENT) {
                this.notificationObject.recipients.push(deepCloneObject(RECIPIENT));
            }
            pointOfContactObject.fullName = null;
            pointOfContactObject.personId = null;
        }
    }

    private addPersonDetails(pointOfContactObject, recipientGroup): any {
        const NEW_RECIPIENT = {
            recipientName: pointOfContactObject.fullName,
            recipientPersonId: pointOfContactObject.personId,
            recipientType: recipientGroup
        }
        return NEW_RECIPIENT
    }

    private duplicateRecipientValidation(msg: string): void {
        this.validationMap.clear();
        switch (this.recipientGroup) {
            case this.recipientType.TO:
                this.validationMap.set('duplicateRecipientTo', msg);
                break;
            case this.recipientType.CC:
                this.validationMap.set('duplicateRecipientCc', msg);
                break;
            case this.recipientType.BCC:
                this.validationMap.set('duplicateRecipientBcc', msg);
                break;
            default:
        }
    }

    private setElasticPersonOptions(): void {
        this.elasticSearchOptionsForTo = this._elasticConfig.getElasticForPerson();
        this.elasticSearchOptionsForCc = this._elasticConfig.getElasticForPerson();
        this.elasticSearchOptionsForBcc = this._elasticConfig.getElasticForPerson();
    }

    private checkForRecipientType(deleteUserRecipientType, notificationObjectRecipientType): boolean {
        return deleteUserRecipientType === notificationObjectRecipientType;
    }

    private getMailPreview(notificationTypeId) {
        const MAIL_PREVIEW_RO = {
            notificationTypeId: notificationTypeId,
            moduleCode: this.notificationTypeRO.moduleCode,
            moduleItemKey: this.notificationObject.moduleItemKey,
        }
        this.$subscriptions.push(this.reviewerDashboardService.getMailPreviewById(MAIL_PREVIEW_RO).subscribe((res: any) => {
            this.notificationObject.message = res.body;
            this.notificationObject.subject = res.subject;
        },
            (error: any) =>
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Notification details fetch failed. Please try again.')
        ));
    }

    /**
    * used to get selected object from elastic search
    * @param {} value
    */
    private selectedPOC(value): void {
        if (value) {
            const POINT_OF_CONTACT_OBJECT = {
                fullName: value.full_name,
                personId: value.prncpl_id
            };
            this.setElasticPersonOptions();
            this.addPerson(POINT_OF_CONTACT_OBJECT);
        }
    }

    closeSlider(): void {
        closeCoiSlider(this.personNotificationSliderID);
        setTimeout(() => {
            this.isOpenSlider = false;
            this.clearNotificationFields();
            this.closePage.emit();
        }, 500);
    }

    public onReady(editor): void {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

    sendNotification(): void {
        this.validateMandatoryFields();
        if (!this.validationMap.size) {
            this.$subscriptions.push(
                this.reviewerDashboardService.sendNotification(this.notificationObject).subscribe(response => {
                    if (response.includes('successfully')) {
                        this.getSentNotificationHistory();
                        this.clearNotificationFields();
                        this.isCcViewable = false;
                        this.isBccViewable = false;
                        this.setDefaultKeypersonDetails();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification sent successfully.');
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Notification failed.');
                    }
                }, (error: any) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Sending Notification failed. Please try again.');
                }));
        }
    }

    onEditorFocus(): void {
        this.isEditorFocused = true;
    }

    onEditorBlur(): void {
        this.isEditorFocused = false;
    }

    selectedRecipient(value: ContactPersonDetails): void {
        this.validationMap.clear();
        if (value.email_addr) {
            if (!this.notificationObject.recipients.find(recipient => recipient.recipientPersonId === value.prncpl_id && recipient.recipientType === this.recipientGroup)) {
                this.selectedPOC(value);
            }
            else {
                this.duplicateRecipientValidation('Person already added. Please choose a different person.');
                this.setElasticPersonOptions();
                this.clearField = new String('true');
            }
        }
    }

    clearNotificationFields(): void {
        this.notificationObject.message = '';
        this.notificationObject.subject = '';
        this.notificationObject.recipients = [];
        this.clearField = new String('true');
        this.validationMap.clear();
        this.selectedTemplateLookUpList = [];
    }

    removeRecipient(recipient: any): void {
        const INDEX = this.notificationObject.recipients.findIndex(item =>
            ((recipient.recipientPersonId && item.recipientPersonId === recipient.recipientPersonId) && this.checkForRecipientType(item.recipientType, recipient.recipientType))
        );
        this.notificationObject.recipients.splice(INDEX, 1);
    }

    onTemplateSelect(event): void {
        const NOTIFICATION_TYPE_ID = event?.[0]?.notificationTypeId;
        NOTIFICATION_TYPE_ID && this.getMailPreview(Number(NOTIFICATION_TYPE_ID));
        this.notificationObject.notificationTypeId = NOTIFICATION_TYPE_ID;
    }

    openTab(tabName: 'NEW_NOTIFICATION' | 'PAST_NOTIFICATIONS'): void {
        this.activeTab = tabName;
    }

}
