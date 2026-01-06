import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { DegreeDetails } from '../person-rolodex-view-interfce';
import { PersonRolodexViewService } from '../person-rolodex-view.service';

@Component({
  selector: 'app-degree-details',
  templateUrl: './degree-details.component.html',
  styleUrls: ['./degree-details.component.css']
})
export class DegreeDetailsComponent implements OnInit, OnDestroy {
  @Input() personRolodexProposalPersonId;
  @Input() personRolodexIsViewMode;
  @Input() selectedPersonId;
  canShowAddDegreeSection = false;
  $subscriptions: Subscription[] = [];
  degreeType = [];
  degreeDetails = new DegreeDetails();
  personDegreeDetails: any = {};
  deleteDegreeId: number;
  mandatoryList = new Map();
  isSave = false;
  isMaintainPerson = false;
  constructor(public __rolodexViewServices: PersonRolodexViewService, public _commonService: CommonService) { }

  ngOnInit() {
    this.getDegreeType();
    this.getPersonDegree();
    this.getPermissions();
  }

  async getPermissions() {
    this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
  }

  showAddDegree() {
    this.canShowAddDegreeSection = true;
    this.mandatoryList.clear();
    this.degreeDetails = new DegreeDetails();
  }

  /**Either the key person is same as logged-in person or
   * person with MAINTAIN_PERSON right can only add degree to proposal key person.] */
  canAddDegree() {
    return (this.isMaintainPerson || (this.selectedPersonId === this._commonService.getCurrentUserDetail('personID')));
  }

  getDegreeType() {
    this.$subscriptions.push(this.__rolodexViewServices.getDegreeType().subscribe((data: any) => {
      this.degreeType = data;
    }, _err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Degree type failed. Please try again.')));
  }

  addDegree() {
    this.mandatoryList.clear();
    this.validateMandatoryFields();
    this.isSave = true;
    if (this.mandatoryList.size === 0  && this.isSave) {
      this.degreeDetails.proposalPersonId = this.personRolodexProposalPersonId;
      this.degreeDetails.degreeCode = this.degreeDetails.degreeType.degreeCode;
      this.$subscriptions.push(this.__rolodexViewServices.addDegree(this.degreeDetails).subscribe((data: any) => {
        this.personDegreeDetails = {};
        this.personDegreeDetails = data;
        this.clearDegreeDetails();
        this.isSave = false;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Degree added successfully.');
      }, _err => {
        this.isSave = false;
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving degree failed. Please try again.');
      }));
    }
  }

  clearDegreeDetails() {
    this.canShowAddDegreeSection = false;
    this.mandatoryList.clear();
    this.degreeDetails = new DegreeDetails();
  }

  validateMandatoryFields() {
    if (!this.degreeDetails.degreeType || this.degreeDetails.degreeType === 'null') {
      this.mandatoryList.set('degreeType', '* Please provide a degree type.');
    }
  }

  getPersonDegree() {
    this.$subscriptions.push(this.__rolodexViewServices.getPersonDegree(this.personRolodexProposalPersonId).subscribe((data: any) => {
      this.personDegreeDetails = data;
    }, _err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching person degree failed. Please try again.')));
  }

  deleteElement(index: number): void {
    this.cancelPerviousDelete();
    const period = document.getElementById(`period-${index}`);
    period.style.display = 'none';
    const deleteConfirmation = document.getElementById(`delete-confirmation-${index}`);
    deleteConfirmation.style.display = 'table-row';
    deleteConfirmation.classList.add('flip-top');
  }

  cancelPerviousDelete(): void {
    const existingDeleteConfirmation = document.querySelector('.flip-top');
    if (existingDeleteConfirmation) {
      const existingDeleteId = existingDeleteConfirmation.id.split('-');
      this.cancelDeleteElement(parseInt(existingDeleteId[2], 10));
    }
  }

  cancelDeleteElement(index: number): void {
    const deleteConfirmation = document.getElementById(`delete-confirmation-${index}`);
    deleteConfirmation.style.display = 'none';
    deleteConfirmation.classList.remove('flip-top');
    const period = document.getElementById(`period-${index}`);
    period.style.display = 'table-row';
    period.classList.add('flip-bottom');
  }


  deleteDegree(index) {
    this.$subscriptions.push(this.__rolodexViewServices.deleteDegree(this.deleteDegreeId).subscribe((data: any) => {
      this.personDegreeDetails.splice(index, 1);
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Degree deleted successfully.');
    }, _err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Degree failed. Please try again.')));
  }

  cancelDegreeAdd() {
   this.clearDegreeDetails();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
}
}
