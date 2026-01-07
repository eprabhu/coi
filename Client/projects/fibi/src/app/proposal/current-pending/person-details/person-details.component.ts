/**
 * Author: Aravind P S
 * Component for displaying person List and respective role of the current
 * proposals which is used as a tool for generating new reports
 * and navigation to that particular report
 */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { scrollIntoView } from '../../../common/utilities/custom-utilities';
import { slideHorizontal } from '../../../common/utilities/animations';
import { PersonEventInteractionService } from '../person-event-interaction.service';
import { ProposalService } from '../../services/proposal.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
declare var $: any;

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.css'],
  animations: [slideHorizontal]

})
export class PersonDetailsComponent implements OnInit, OnDestroy {
  isCurrentReviewTab = 'SECTION';
  currentActiveLink = 'REVIEW';
  requiredList: any = [];
  $subscriptions: Subscription[] = [];
  isPersonWidgetVisible = false;
  @Input() personDetails: any = {};
  scrollIntoView = scrollIntoView;

  constructor(public _eventService: PersonEventInteractionService,
    public _proposalService: ProposalService, private _commonService: CommonService) { }

  ngOnInit() {
    this.getPersonWidgetVisibility();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getPersonWidgetVisibility() {
    this.$subscriptions.push(this._eventService.$isPersonWidgetVisible.subscribe(data => {
      (this.isPersonWidgetVisible = data) ? this.collapsePersonWidget() : this.expandPersonWidget();
    }));
  }

  /**
   * Prepared array of object w.r.t selected persons and passes the event
   */
  generateReport() {
    this.requiredList = this.preparePersonObject();
    this._eventService.$personList.next(this.requiredList);
  }

  preparePersonObject() {
    return this.personDetails.proposalPersons
      .filter(e => e.isChecked).map(({ personId, isGenerated, rolodexId, proposalPersonRole, fullName }) => (
        {
          'personId': personId || rolodexId,
          'isGenerated': isGenerated,
          'roleName': proposalPersonRole.description,
          'personName': fullName,
          'nonEmployeeFlag': rolodexId ? true : false,
        }));
  }

  expandPersonWidget() {
    (document.getElementById('cp_tab_content') as HTMLElement).style.width = '100%';
  }

  collapsePersonWidget() {
    (document.getElementById('cp_tab_content') as HTMLElement).style.width = '78%';
  }

  /**
   * shows modal if any of the person is selected else display an error toast
   */
  checkGeneratePermission() {
    if (this.personDetails.proposalPersons.find(e => e.isChecked)) {
      $('#confirmGenerateModal').modal('show');
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Select at least one person for generating report.');
    }
  }
}
