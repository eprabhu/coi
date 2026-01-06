import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { CompareData } from '../../../interfaces';
import { ProposalKPI } from '../../../comparison-constants';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches data for
 * all these components in one service call.
 */
@Component({
  selector: 'app-key-performance-indicator',
  templateUrl: './key-performance-indicator.component.html',
  styleUrls: ['./key-performance-indicator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyPerformanceIndicatorComponent implements OnChanges {

  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    proposalId: ''
  };
  @Input() currentMethod: string;
  isShowCollapse = true;
  proposalKpis = [];
  isCollapse = [true];
  currentKPI = [];

  constructor() { }

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges () {
    if ( this.currentMethod + '' !== '') {
       this.currentMethod + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
    }
  }
  /**
   * @returns void
   * 1.logic
   * 2.compare KPI of base with current
   * 3.loop through the compared output
   * 4.if the status is 0 then
   * 5.find the kpi from the current version
   * 6.compare the inner array of KPI's
   * We have a array of array lets say data = [A[B]] to compare here so the logic is to compare
   * so we compare KPI's of both versions first. Then if KPI status is 0 that
   * means present in both versions. otherwise its new or deleted no need to check the items
   * inside each KPI. So we go through each of KPI and find its match in current then
   * we compare the inner array inside the KPI(KPI terms). Yo achieve this need
   * to keep a copy of current KPI's since after the first comparison the data on the current
   * is lost. so currentKPI holds a copy of the data.
   */
  compare(): void {
    this.currentKPI = JSON.parse(JSON.stringify(  this.comparisonData.current[ProposalKPI.reviewSectionName]));
    this.proposalKpis = compareArray(this.comparisonData.base[ProposalKPI.reviewSectionName],
      this.comparisonData.current[ProposalKPI.reviewSectionName],
      ProposalKPI.reviewSectionUniqueFields, []);
    this.proposalKpis.forEach(kpi => {
      if (kpi.status === 0) {
        const current = this.findInCurrent(kpi.kpiTypeCode);
        kpi.proposalKPICriterias = compareArray(kpi.proposalKPICriterias,      
                    current.proposalKPICriterias,
                    ['kpiCriteriaTypeCode'], ['target']);
      }
    });
  }

  setCurrentView() {
    this.proposalKpis = this.comparisonData.base[ProposalKPI.reviewSectionName];
  }

  findInCurrent(code) {
    return this.currentKPI.find(kpi => kpi.kpiTypeCode === code);
  }
}
