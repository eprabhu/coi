/**
 * Currently this component have a direct service injection from ProposalService hence
 * cannot be reused outside proposal mode.
 * When needing to use it globally, change ProposalService to appropriate global modal service.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CertificationNotificationLogService } from './certification-notification-log.service';
import {
    CertificationLogRO,
    NotificationModalConfig,
    PersonNotificationMailLog,
    PersonNotifyMailRO,
    ProposalPerson
} from '../../proposal/interface/proposal.interface';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ProposalService } from '../../proposal/services/proposal.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../../proposal/services/data-store.service';

declare var $: any;

@Component({
    selector: 'app-certification-notification-log-modal',
    templateUrl: './certification-notification-log-modal.component.html',
    styleUrls: ['./certification-notification-log-modal.component.css'],
    providers: [CertificationNotificationLogService]
})
export class CertificationNotificationLogModalComponent implements OnInit, OnDestroy {

    proposalId: number;
    isSaving = false;
    isEditMode = false;
    isNotifyAll: boolean;
    hasModifyProposalRight = false;
    togglePersons: boolean[] = [];
    selectedPerson: ProposalPerson;
    proposalPersons: ProposalPerson[] = [];
    notifications: PersonNotificationMailLog[] = [];
    multiplePersonNotifications = [];
    notificationMap: any = {};
    $subscriptions: Subscription[] = [];
    result: any;
    dataDependencies = ['availableRights'];


    constructor(private _certificationService: CertificationNotificationLogService,
        private _proposalService: ProposalService,
        private _commonService: CommonService,
        private _dataStore: DataStoreService,
        private _route: ActivatedRoute) {
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    getProposalId(): number {
        return Number(this._route.snapshot.queryParams['proposalId']);
    }

    ngOnInit(): void {
        this.getAvailableRight();
        this.listenDataChangeFromStore();
        this.listenForDataChange();
    }

    listenForDataChange() {
        this.$subscriptions.push(this._proposalService.notifyModalData.subscribe((data: NotificationModalConfig) => {
            this.showModeSpecificNotifications(data);
            this.setEditMode();
        }));
    }

    private listenDataChangeFromStore() {
		this.$subscriptions.push(
			this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
				if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                    this.getAvailableRight();
				}
			})
		);
	}

    getAvailableRight() {
        this.result = this._dataStore.getData(this.dataDependencies);
        this.setRightChecking();
    }

    private showModeSpecificNotifications(data: NotificationModalConfig) {
        if (data.mode === 'ALL') {
            this.isNotifyAll = true;
            this.clearNotifications();
            this.getAllPersonsAndShowModal();
        } else {
            this.isNotifyAll = false;
            this.selectedPerson = data.selectedPerson;
            this.showNotificationLog();
        }
    }

    setEditMode() {
        this.isEditMode = this._proposalService.proposalMode === 'edit';
    }

    setRightChecking() {
        this.hasModifyProposalRight = this.result.availableRights.includes('MODIFY_PROPOSAL');
    }

    generateCertificationLogRO(person: ProposalPerson = null): CertificationLogRO {
        return { moduleCode: 3, moduleItemKey: this.getProposalId(), property1: person.personId };
    }

    showNotificationLog() {
        this.$subscriptions.push(this._certificationService
            .getPersonCertificationMailLog(this.generateCertificationLogRO(this.selectedPerson))
            .subscribe((res: PersonNotificationMailLog[]) => {
                this.triggerModal('show');
                this.notifications = res;
            }, _err => this.showErrorMessage('Notification details fetch failed. Please try again.')));
    }

    generateCertificationMailRO(type: string = null): PersonNotifyMailRO {
        if (type) {
            return { proposalId: this.getProposalId() };
        }
        return { personId: this.getSelectedPersonId().personId, proposalId: this.getProposalId(),
                 personCertified: this.selectedPerson.personCertified || false };
    }

    notifyAgain(type: string = null) {
        if (!this.isSaving) {
            this.isSaving = true;
            this.showManualLoader();
            this.$subscriptions.push(this._certificationService
                .sendPersonCertificationMail(this.generateCertificationMailRO(type))
                .subscribe((_res: any) => {
                    setTimeout(() => {
                        if (type) { this.triggerModal('hide'); this.selectedPerson = null; }
                        this.notifications.push({ mailSentFlag: 'Y', sendDate: new Date().getTime() });
                        this.showSuccessMessage('Notification sent successfully.');
                        setTimeout(() => { this.isSaving = false; this.hideManualLoader(); });
                    }, 1000);
                }, _err => this.showErrorMessage('Notification failed to send. Please try again.')));
        }
    }

    showManualLoader() {
        this._commonService.isManualLoaderOn = true;
    }

    hideManualLoader() {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
    }

    triggerModal(action: 'show' | 'hide') {
        $('#certification-notification-log').modal(action);
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

    private fetchPersonNotifications(person: ProposalPerson, index: number) {
        this.$subscriptions.push(this._certificationService
            .getPersonCertificationMailLog(this.generateCertificationLogRO(person))
            .subscribe((res: PersonNotificationMailLog[]) => {
                this.notificationMap[person.proposalPersonId] = res;
                this.multiplePersonNotifications[index] = res;
                this.togglePersons[index] = !this.togglePersons[index];
            }, _err => this.showErrorMessage('Notification details fetch failed. Please try again.')));
    }

    private showPersonNotificationFromMap(index: number, person: ProposalPerson) {
        this.multiplePersonNotifications[index] = this.notificationMap[person.proposalPersonId];
        this.togglePersons[index] = !this.togglePersons[index];
    }

    private getAllPersonsAndShowModal() {
        this.$subscriptions.push(this._certificationService
            .getProposalPersonsForCertification({proposalId: this.getProposalId()})
            .subscribe((res: { proposalPersons: ProposalPerson[] }) => {
                this.proposalPersons = res.proposalPersons;
                this.triggerModal('show');
            }, _err => this.showErrorMessage('Notification details fetch failed. Please try again.')));
    }

    private showSuccessMessage(message: string) {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, message);
    }

    private showErrorMessage(message: string) {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }

    private clearNotifications() {
        this.selectedPerson = null;
        this.notificationMap = {};
        this.notifications = [];
        this.togglePersons = [];
        this.multiplePersonNotifications = [];
    }

    private getSelectedPersonId(person: ProposalPerson = null) {
        return {
            personId: person ? this.getPersonId(person) : this.getPersonId(this.selectedPerson),
            isNonEmployee: person ? Boolean(person.rolodexId) : Boolean(this.selectedPerson.rolodexId)
        };
    }

    private getPersonId(person: ProposalPerson) {
        return person.personId || person.rolodexId;
    }
}
