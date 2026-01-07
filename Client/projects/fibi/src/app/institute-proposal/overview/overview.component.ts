import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InstituteProposalService } from '../services/institute-proposal.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';
import { InstituteProposal, InstProposal } from '../institute-proposal-interfaces';
import { OverviewService } from './overview.service';
import { WebSocketService } from '../../common/services/web-socket.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  isModifyIp = false;
  generalDetails: InstProposal;
  helpText: any;
  constructor(
    private _dataStore: DataStoreService,
    public _instituteService: InstituteProposalService,
    public _overviewService: OverviewService,
    public webSocket: WebSocketService) { }

   ngOnInit() {
    this.getAvailableRights();
    this.getDataStoreEvent();
    this.fetchHelpText();
  }

  fetchHelpText() {
    this.$subscriptions.push(this._overviewService.fetchHelpText({
      'moduleCode': 2,
      'sectionCodes': [201]
    }).subscribe((data: any) => {
      this.helpText = data;
    }));
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getDataStoreEvent() {
    this.$subscriptions.push(this._dataStore.dataEvent
      .subscribe((data: any) => {
        if (data.includes('availableRights') || data.includes('instProposal')) {
          this.getAvailableRights();
        }
      }));
  }
  getAvailableRights() {
    const data: InstituteProposal = this._dataStore.getData(['availableRights', 'instProposal']);
    this.generalDetails = data.instProposal;
    this._overviewService.generalDetails = data.instProposal;
    this.isModifyIp = data.availableRights.includes('MODIFY_INST_PROPOSAL') && this.generalDetails.proposalSequenceStatus === 'PENDING';
    const isKey = 'IP' + '#' + (data.instProposal ? data.instProposal.proposalId : null);
    if (this.isModifyIp && !this.webSocket.isLockAvailable(isKey)) {
      this.isModifyIp = false;
    }
  }

}
