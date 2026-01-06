import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { ProposalOrganization } from '../../../comparison-constants';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';
import { CommonService } from '../../../../../common/services/common.service';
import { environment } from '../../../../../../environments/environment';
import { getOrganizationAddress } from '../../../../../common/utilities/custom-utilities';

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches dat for
 * all these components in one service call.
 */
@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnChanges {
  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    proposalId: ''
  };
  @Input() currentMethod: string;
  proposalOrganizations: any = [];
  deployMap = environment.deployUrl;
  isCollapse = true;
  currentOrganization: [];
  enableOrganizationLocation = false;
  getOrganizationAddress = getOrganizationAddress;

  constructor(public _commonService: CommonService) { }

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges() {
    if (this.currentMethod + '' !== '') {
      this.currentMethod + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
    }
    this.enableOrganizationLocation = this.comparisonData.base.enableOrganizationLocation;
  }

  /**
   * @returns void
   * compares the data of two versions of award contacts. here data is from parent so we simply
   * compares the data Array type is used since contacts type is Array.
   */
  compare(): void {
    this.currentOrganization = JSON.parse(JSON.stringify(  this.comparisonData.current[ProposalOrganization.reviewSectionName]));
    this.proposalOrganizations = compareArray(this.comparisonData.base[ProposalOrganization.reviewSectionName],
      this.comparisonData.current[ProposalOrganization.reviewSectionName],
      ProposalOrganization.reviewSectionUniqueFields,
      ProposalOrganization.reviewSectionSubFields);
    this.proposalOrganizations.forEach(e => {
        if (e.status === 0) {
          const current: any = this.findInCurrent(e.proposalOrganizationId);
          e.proposalCongDistricts = compareArray(e.proposalOrganizationId,
                      current ? current.proposalCongDistricts : [],
                      [], ['congDistrictCode']);
        }
      });
  }

  findInCurrent(code) {
    return this.currentOrganization.find((e: any) => e.congDistrictCode === code);
  }

  setCurrentView() {
    this.proposalOrganizations = this.comparisonData.base[ProposalOrganization.reviewSectionName];
  }

   /** default organization types which will be added on proposal creation are
         * 'Proposal Organization' (type code-1) & 'Performing Organization' (type code-2)*/
   isDefaultOrganizationType(orgTypeCode: string) {
    return ['1', '2'].includes(orgTypeCode);
  }
}
