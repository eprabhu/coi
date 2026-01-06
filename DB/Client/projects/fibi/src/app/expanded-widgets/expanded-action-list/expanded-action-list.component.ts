import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT } from '../../app-constants';
import { Constants } from '../../common/constants/action-list.constants';
import { CommonService } from '../../common/services/common.service';
import { setFocusToElement } from '../../common/utilities/custom-utilities';
import { getTimeInterval, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedActionListService } from './expanded-action-list.service';

@Component({
  selector: 'app-expanded-action-list',
  templateUrl: './expanded-action-list.component.html',
  styleUrls: ['./expanded-action-list.component.css']
})
export class ExpandedActionListComponent implements OnInit, OnDestroy {

  inboxObject: any = {
    moduleCode: null
  };
  inboxDetails: any = [];
  $subscriptions: Subscription[] = [];
  modulePath = Object.assign({}, Constants.paths);
  viewInboxSearch = false;
  inboxTab = 'PENDING';
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  moduleList: any = [];
  isInboxInfo = true;
  getTimeInterval = getTimeInterval;
  isSaving = false;

  constructor(private _actionList: ExpandedActionListService, private _router: Router,
    public _commonService: CommonService) { }

  ngOnInit() {
    this.clearInboxSearchField();
    this.getActionList(false);
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
      this.$subscriptions.push(this._actionList.getActionList(this.inboxObject).subscribe((data: any) => {
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
    this.$subscriptions.push(this._actionList.openUnreadInbox(id).subscribe(data => { }));
  }

  clearInboxSearchField() {
    this.inboxObject.moduleCode = null;
  }

  getInboxTab() {
    this.inboxTab === 'PENDING' ? this.getActionList(false) : this.getActionList(true);
    this.viewInboxSearch = false;
    // this.clearInboxSearchField();
  }
}
