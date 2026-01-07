import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { getEndPointOptionsForDepartment } from '../../common/services/end-point.config';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';

@Component({
  selector: 'app-proposal-submitted-by-leadunit',
  templateUrl: './proposal-submitted-by-leadunit.component.html',
  styleUrls: ['./proposal-submitted-by-leadunit.component.css'],
  animations: [fadeDown]
})
export class ProposalSubmittedByLeadunitComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  isShowLoader = false;
  proposalByLeadUnitData: any = [];
  proposalByLeadUnitDataHeading: any = [];
  widgetDescription: any;
  totalProposalCount: number;
  currentFY: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;
  selectedUnitNumber = null;
  selectedUnitName = '';
  clearLeadUnitField;
  leadUnitHttpOptions: any = {};
  totalAwardedProposalCount: number;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
              private _researchSummaryConfigService: ResearchSummaryConfigService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(25);
    this.getSelectedUnit();
    this.leadUnitHttpOptions = Object.assign({}, getEndPointOptionsForDepartment());
  }

  getProposalByLeadUnitData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: this.selectedUnitNumber, tabName: 'PROPOSAL_SUBMITTED_BY_LEAD_UNIT' })
      .subscribe((data: any) => {
        this.proposalByLeadUnitData = data.widgetDatas || [];
        this.getTotalSubmittedProposal();
        this.getTotalAwardedProposal();
        this.currentFY = this._researchSummaryWidgetService.getCurrentFinancialYear();
        // this.proposalByLeadUnitDataHeading = this.proposalByLeadUnitData.splice(0, 1)[0];
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  getSelectedUnit() {
    this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe(data => {
      if (data) {
          this.selectedUnitNumber =  data.unitNumber;
          this.selectedUnitName = data.unitName;
      } else {
          this.selectedUnitNumber = null;
          this.selectedUnitName = '';
      }
      this.getProposalByLeadUnitData();
  }));
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  /**
   * {number} is the column number or the value the sum should be taken
   */
   getTotalSubmittedProposal(): void {
    this.totalProposalCount = this._researchSummaryWidgetService.getSumOfColumn(this.proposalByLeadUnitData, 1);
  }

  getTotalAwardedProposal(): void {
    this.totalAwardedProposalCount = this._researchSummaryWidgetService.getSumOfColumn(this.proposalByLeadUnitData, 3);
  }

  /**
   * @param unit - selected lead unit from search
   */
  onLeadUnitSelection(unit): void {
    if (unit) {
      this.selectedUnitNumber = unit.unitNumber;
      this.selectedUnitName = unit.unitName;
      this.clearLeadUnitField = new String('true');
      this.getProposalByLeadUnitData();
    }
  }

  removeUnit(): void {
    this.selectedUnitNumber = null;
    this.selectedUnitName = '';
    this.getProposalByLeadUnitData();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
