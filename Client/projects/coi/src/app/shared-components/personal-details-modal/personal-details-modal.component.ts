import { Component, Input, OnInit, HostListener, OnDestroy } from '@angular/core';
import { PersonDetailsModalService } from './person-details-modal.service';
import { Subscription } from 'rxjs';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { COIPersonModalConfig } from '../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-personal-details-modal',
    templateUrl: './personal-details-modal.component.html',
    styleUrls: ['./personal-details-modal.component.scss'],
    providers: [PersonDetailsModalService]
})
export class PersonalDetailsModalComponent implements OnInit, OnDestroy {

    @Input() personModalConfig = new COIPersonModalConfig();

    currentTab = 'PERSON_DETAILS';
    $subscriptions: Subscription[] = [];
    personDetails: any;
    rolodexDetails: any;
    canShowPersonDetails = false;
    canShowRolodexDetails = false;

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.commonService.closePersonDetailsModal(false);
        }
    }

    constructor(private _personService: PersonDetailsModalService, public commonService: CommonService) { }

    ngOnInit(): void {
        if (this.personModalConfig?.personId) {
            this.personModalConfig?.personType === 'PERSON' ? this.getPersonData() : this.getRolodexPersonData();
            this.currentTab = this.personModalConfig?.personType === 'PERSON' ? 'PERSON_DETAILS' : 'ROLODEX_DETAILS';
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getPersonData(): void {
        this.$subscriptions.push(this._personService.getPersonData(this.personModalConfig?.personId)
            .subscribe((data: any) => {
                this.personDetails = data;
                document.getElementById('coi-person-view-modal-trigger-btn')?.click();
            }, (_error: any) => {
                this.clearModalDataAndShowToast();
            }));
    }

    private getRolodexPersonData(): void {
        this.$subscriptions.push(this._personService.getRolodexPersonData(this.personModalConfig?.personId)
            .subscribe((data: any) => {
                this.rolodexDetails = data;
                document.getElementById('coi-person-view-modal-trigger-btn')?.click();
            }, (_error: any) => {
                this.clearModalDataAndShowToast();
            }));
    }

    // This function is currently not in use. It can be utilized in the future if right-checking for person or Rolodex details is required.
    // private setPersonBtnRights(): void {
    //     const isLoggedInPerson = this.personModalConfig?.personId === this.commonService.currentUserDetails.personID;
    //     this.canShowPersonDetails = (isLoggedInPerson || this.commonService.getAvailableRight(['MAINTAIN_PERSON', 'APPLICATION_ADMINISTRATOR']));
    //     this.canShowRolodexDetails = (isLoggedInPerson || this.commonService.getAvailableRight(['MAINTAIN_ROLODEX', 'APPLICATION_ADMINISTRATOR']));
    // }

    private clearModalDataAndShowToast(): void {
        this.commonService.personModalConfig = new COIPersonModalConfig();
        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }

    viewPersonDetails(): void {
        this.commonService.redirectToPersonDetails(this.personModalConfig.personId, this.personModalConfig.personType);
    }

}
