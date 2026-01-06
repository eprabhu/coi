import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DATE_PLACEHOLDER } from '../../../../../../src/app/app-constants';
import { Constants } from '../../../../../../../fibi/src/app/common/constants/action-list.constants';
import { CommonService } from '../../../services/common.service';
import { setFocusToElement } from '../../../../../../../fibi/src/app/common/utilities/custom-utilities';
import { ExpandedActionListService } from './expanded-action-list.service';
import { subscriptionHandler } from '../../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { fadeInOutHeight } from '../../../../common/utilities/animations';
import { getDuration, getTimeInterval, parseDateWithoutTimestamp } from '../../../utilities/date-utilities';
import { COMMON_DISCL_LOCALIZE } from '../../../../app-locales';

@Component({
    selector: 'app-expanded-action-list',
    templateUrl: './expanded-action-list.component.html',
    styleUrls: ['./expanded-action-list.component.scss'],
    animations: [fadeInOutHeight]
})
export class ExpandedActionListComponent implements OnInit, OnDestroy {

    inboxObject: any = {
        moduleCode: null
    };
    inboxDetails: any = [];
    testInboxDeatils: any = [
        {
            inbox: {
                message: {
                    description: 'Disclosure Approved',
                    disclosureId: '66',
                    Proposal: ' #25849 - Start-up Research Grant (SRG) scheme'
                },
                messageTypeCode: '123',
                class: 'fresher',
                arrivalDate: '31/01/2015'
            },

        },

    ];
    $subscriptions: Subscription[] = [];
    modulePath = Object.assign({}, Constants.paths);
    viewInboxSearch = false;
    inboxTab = 'PENDING';
    datePlaceHolder = DATE_PLACEHOLDER;
    setFocusToElement = setFocusToElement;
    moduleList: any = [];
    isInboxInfo = true;
    getTimeInterval = getTimeInterval;
    isSaving = false;
    data = [];
    expirationdate: any;
    noOfDays: any;
    currentDate: number;
    time: { durInDays: number; durInMonths: number; durInYears: number; };
    actionListEntriesForBanner: any = [];
    description: any;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;

    constructor(private _actionListservice: ExpandedActionListService,
                private _router: Router,
                public _commonService: CommonService) { }

    ngOnInit() {
        this.clearInboxSearchField();
        this.fetchActionListForBanners();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getActionList(type) {
        if (!this.isSaving) {
            this.isSaving = true;
            this.inboxObject.toPersonId = this._commonService.getCurrentUserDetail('personID');
            this.inboxObject.isViewAll = 'N';
            this.inboxObject.processed = type;
            this.inboxObject.fromDate = parseDateWithoutTimestamp(this.inboxObject.fromDate);
            this.inboxObject.toDate = parseDateWithoutTimestamp(this.inboxObject.toDate);
            this.$subscriptions.push(this._actionListservice.getActionList(this.inboxObject).subscribe((data: any) => {
                this.inboxDetails = data.inboxDetails;
                this.moduleList = data.modules;
                this.isSaving = false;
                this.inboxDetails.forEach(element => {
                    Object.keys(this.modulePath).forEach(key => {
                        if (key === this.getModulePathKey(element)) {
                            element.class = this.modulePath[key].class;
                            element.name = this.modulePath[key].name;
                        }
                    });
                });
            }, err => { this.isSaving = false; }));
        }
    }

    getModulePathKey(el) {
        return el.moduleCode !== 1 ? el.moduleCode.toString() : el.moduleCode.toString() + this.getAwardSubmoduleCode(el);
    }

    getAwardSubmoduleCode(el) {
        return el.subModuleCode ? el.subModuleCode.toString() : '0';
    }

    getSubModulePath(el) {
        return this.modulePath[this.getModulePathKey(el)].subPath ? this.modulePath[this.getModulePathKey(el)].subPath : '';
    }

    getSubModuleKey(el) {
        return this.modulePath[this.getModulePathKey(el)].subPath ? el.subModuleItemKey : '';
    }

    goToActionPath(inbox, i) {
        if (inbox.moduleCode.toString() === '3') {
            if (inbox.messageTypeCode === '105') {
                localStorage.setItem('currentTab', 'PROPOSAL_HOME');
            } else if (['133', '134'].includes(inbox.messageTypeCode)) {
                localStorage.setItem('currentTab', 'CERTIFICATION');
                this._router.navigate(['fibi/proposal/certification'], { queryParams: { proposalId: inbox.moduleItemKey } });
                return;
            } else {
                localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
                this._router.navigate(['fibi/proposal/summary'], { queryParams: { proposalId: inbox.moduleItemKey } });
                return;
            }
        }
        window.open(window.location.origin + window.location.pathname + this.modulePath[this.getModulePathKey(inbox)].path
            + inbox.moduleItemKey + this.getSubModulePath(inbox) + this.getSubModuleKey(inbox), '_self');
    }

    markAsRead(id) {
        this.$subscriptions.push(this._actionListservice.openUnreadInbox(id).subscribe(data => { }));
    }

    getRequestObjectForBanner(): any {
        return {
            'moduleCodeList': [8, 24],
            'personId': this._commonService.getCurrentUserDetail('personID'),
            'alertType': 'B'
        };
    }

    fetchActionListForBanners() {
        const [REQUEST_OBJECT, CURRENT_DATE] = [this.getRequestObjectForBanner(), new Date().setHours(0, 0, 0, 0)];
        this.$subscriptions.push(this._actionListservice.getActionLogEntries(REQUEST_OBJECT).subscribe(
            (data: any) => {
                this.actionListEntriesForBanner = data;
                 this.setDurationForEntries(CURRENT_DATE);
            }));
    }

    // this function calculates duration between the current date and expiration date using getduration function
    setDurationForEntries(CURRENT_DATE: any): void {
        this.actionListEntriesForBanner.forEach((element) => {
            element.duration = getDuration(CURRENT_DATE, element.expirationDate);
            element.message.description = this.getValueFromPlaceholder(element);
        });
    }

    getValueFromPlaceholder(element: any): any {
        this.description = element.message.description;
        return element && element.message ?
            this.getDisclosureType(element) : null;
    }

     // this function replace the NO_OF_DAYS placeholder with days count which calculated using the function setDurationForEntries
    getDisclosureType(element: any): any {
        if (element && element.message) {
            this.description = this.description
            .replace('{NO_OF_DAYS}', `${element.duration.durInDays}`);
        return this.description;
        }
    }

    clearInboxSearchField() {
        this.inboxObject.moduleCode = null;
    }

    getInboxTab() {
        this.inboxTab === 'PENDING' ? this.getActionList(false) : this.getActionList(true);
        this.viewInboxSearch = false;
    }

    // modulecode 8 means coi disclosure,22 -FCOI
    getModuleCodeClass(moduleCode: number): string {
        switch (moduleCode) {
          case 24:
            return 'text-primary';
          case 8:
            return 'text-danger';
          case 22:
            return 'text-warning';
          default:
            return 'text-primary';
        }
      }

}


