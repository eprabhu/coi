import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fadeDown } from '../../common/utilities/animations';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import {getEndPointOptionsForDepartment} from '../../common/services/end-point.config';

@Component({
  selector: 'app-institute-proposal-submitted-by-Lead-unit',
  templateUrl: './institute-proposal-submitted-by-Lead-unit.component.html',
  styleUrls: ['./institute-proposal-submitted-by-Lead-unit.component.css'],
  animations: [fadeDown]
})
export class InstituteProposalSubmittedByLeadUnitComponent implements OnInit {

  $subscriptions: Subscription [] = [];
  ipSubmittedByLeadUnits:any = [];
  widgetDescription: any;
  isDesc: boolean;
  direction: number;
  column: number;
  isShowLoader = false;
  totalPendingCount: number;
  totalNotFundedCount: number;
  totalFundedCount: number;
  totalWithdrawnCount: number;
  selectedUnitNumber = null;
  selectedUnitName = '';
  clearLeadUnitField;
  leadUnitHttpOptions: any = {};
  currentFY: any;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
    private _researchSummaryConfigService: ResearchSummaryConfigService,
    private _router: Router
    ) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(34);
    this.getSelectedUnit();
    this.leadUnitHttpOptions = Object.assign({}, getEndPointOptionsForDepartment());
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  getResearchDetails() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.getResearchSummaryDatasByWidget(
      {unitNumber: this.selectedUnitNumber, tabName: 'INSTITUTE_PROPOSAL_BY_LEAD_UNIT'}).subscribe((data: any) => {
      this.ipSubmittedByLeadUnits = data.widgetDatas || [];
      this.currentFY = this._researchSummaryWidgetService.getCurrentFinancialYear();
      this.getTotalSubmittedInstituteProposal();
      this.isShowLoader = false;
    }, err => {this.isShowLoader = false ; }));

  }

  getDetailsIpSubmittedLeadUnit(viewDetails,tabName,noOfCount) {
    if (noOfCount !== null) {
      this._router.navigate(['/fibi/expanded-widgets/ip-leadunit'],
      {
        queryParams: {
          unitName: viewDetails[0],
          UN: viewDetails[5],
          tabName: tabName
        }
      });
    } 
  }
  getTotalSubmittedInstituteProposal() {
      this.totalPendingCount = this._researchSummaryWidgetService.getSumOfColumn(this.ipSubmittedByLeadUnits, 1);
      this.totalNotFundedCount = this._researchSummaryWidgetService.getSumOfColumn(this.ipSubmittedByLeadUnits, 2);
      this.totalFundedCount = this._researchSummaryWidgetService.getSumOfColumn(this.ipSubmittedByLeadUnits, 3);
      this.totalWithdrawnCount = this._researchSummaryWidgetService.getSumOfColumn(this.ipSubmittedByLeadUnits, 4);
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
      this.getResearchDetails();
  }));
  }

  /**
   * @param unit - selected lead unit from search
   */
  onLeadUnitSelection(unit): void {
    if (unit) {
      this.selectedUnitNumber = unit.unitNumber;
      this.selectedUnitName = unit.unitName;
      this.clearLeadUnitField = new String('true');
      this.getResearchDetails();
    }
  }

  removeUnit(): void {
    this.selectedUnitNumber = null;
    this.selectedUnitName = '';
    this.getResearchDetails();
  }

  ngOnDestroy(){
     subscriptionHandler(this.$subscriptions);
  }
}
