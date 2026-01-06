/**
 * Author: Aravind P S
 * Component for displaying additional details of each
 * award/proposals which can be modified by the user
 */
import { Component, Input, OnInit } from '@angular/core';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { inputRestrictionForAmountField, validatePercentage } from '../../../common/utilities/custom-utilities';
import { CurrentPendingService } from '../current-pending.service';

@Component({
  selector: 'app-additional-details',
  templateUrl: './additional-details.component.html',
  styleUrls: ['./additional-details.component.css']
})
export class AdditionalDetailsComponent implements OnInit {
  elasticSearchOptions: any = {};
  @Input() moduleDetails: any = {};
  @Input() personDetails: any = {};
  personSearchOptions: any = {};
  cpReportProjectDetailExt: any = {};
  isEmployeeFlag = true;
  mandatoryList = new Map();

  constructor(public _commonService: CommonService, private _elasticConfig: ElasticConfigService,
    private _cpService: CurrentPendingService) { }

  ngOnInit() {
    this.personSearchOptions = this._elasticConfig.getElasticForPerson();
    this.setDefaultValue();
  }

  setDefaultValue() {
    this.cpReportProjectDetailExt = JSON.parse(JSON.stringify(this.moduleDetails.cpReportProjectDetailExt));
    this.personSearchOptions.defaultValue = this.cpReportProjectDetailExt.leadPrincipalInvestigator;
  }

  /** changeMemberType - if a person is employee then sets
   * fibi person elastic search otherwise sets fibi rolodex elastic search
   * */
  changeMemberType() {
    (this.cpReportProjectDetailExt.leadPiNonEmployeeFlag) ? this.setElasticRolodexOption() : this.setElasticPersonOption();
  }

  setElasticRolodexOption() {
    this.personSearchOptions = this._elasticConfig.getElasticForRolodex();
  }

  setElasticPersonOption() {
    this.personSearchOptions = this._elasticConfig.getElasticForPerson();
  }

  /**limitKeypress - limit the input field b/w 0 and 100 with 2 decimal points
   * @param {} value
   */
  limitKeypress(value) {
    this.mandatoryList.delete('percentageOfEffort');
    if (validatePercentage(value)) {
      this.mandatoryList.set('percentageOfEffort', validatePercentage(value));
    }
  }

  /**selectPersonName - sets contact details w.r.t to the contact person type
   * @param event
   */
  selectPerson(event) {
    if (event) {
      this.cpReportProjectDetailExt.leadPIPersonId =
        this.cpReportProjectDetailExt.leadPiNonEmployeeFlag ? event.rolodex_id : event.prncpl_id;
      this.cpReportProjectDetailExt.leadPrincipalInvestigator = event.full_name;
    } else {
      this.cpReportProjectDetailExt.leadPIPersonId = null;
      this.cpReportProjectDetailExt.leadPrincipalInvestigator = null;
    }
  }

  updateCurrentAndPendingDetails() {
    if (this.mandatoryList.size === 0) {
      this.cpReportProjectDetailExt.updateUser = this._commonService.getCurrentUserDetail('userName');
      this._cpService.saveCurrentPendingList(this.cpReportProjectDetailExt)
      .subscribe((data: any) => {
        this.moduleDetails.cpReportProjectDetailExt = data.cpReportProjectDetailExt;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Project details updated successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Project details failed. Please try again.');
      });
    }
  }

  /**
   * @param  {any} field
   * @param  {any} key
   * Restricts users from entering amount input fields more than 10 digits and also restricts
   * them from entering more than two digits after decimal part.
   * field - The particular input field which restricts users from entering the above case.
   * key = mandatory warning map key
   */
  inputDigitRestriction(field: any, key: string) {
    this.mandatoryList.delete(key);
    if (inputRestrictionForAmountField(field)) {
      this.mandatoryList.set(key, inputRestrictionForAmountField(field));
    }
  }
}
