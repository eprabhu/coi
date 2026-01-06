// Last updated by Krishnanunni on 04-03-2020
import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { getDateObjectFromTimeStamp, compareDates, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { CommonDataService } from '../../services/common-data.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { ProjectTeamService } from './project-team.service';
import { setFocusToElement, scrollIntoView, validatePercentage } from '../../../common/utilities/custom-utilities';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
declare var $: any;

@Component({
  selector: 'app-project-team',
  templateUrl: './project-team.component.html',
  styleUrls: ['./project-team.component.css']
})
export class ProjectTeamComponent implements OnInit, OnDestroy, OnChanges {

  showTeamCard = false;
  awardProjectTeam: any = {};
  isProjectTeamEmployee = true;
  projectTeamElasticOptions: any = {};
  deleteindex: any;
  selectedPersonDetails: any = {};
  isTeamEdit = false;
  editIndex;
  clearField: String;
  isShowCollapse = true;
  selectedMemberObject: any = {};
  isAddNonEmployeeTeamModal = false;
  isSaving = false;

  @Input() map: any = {};
  @Input() result: any = {};
  @Input() personnelLookupData: any = {};
  @Input() isEditable: boolean;
  isHighlighted: any = false;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];

  isRolodexViewModal = false;
  type = 'PERSON';
  isTraining = false;
  id: string;
  personDescription: string;
  trainingStatus: string;

  constructor(private _commonData: CommonDataService, private _elasticConfig: ElasticConfigService,
    private _projectTeamService: ProjectTeamService, public _commonService: CommonService) { }

  ngOnInit() {
    this.map.clear();
    this.setCommonAwardData();
    this.setElasticPersonOption();
  }

  ngOnChanges() {
    this.isHighlighted = this._commonData.checkSectionHightlightPermission('105');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
    * To fetch basic award details that are required for identifing which award is currently on.
    */
  setCommonAwardData() {
    this.awardProjectTeam.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        if (data.award.awardId) {
          this.awardProjectTeam.awardId = data.award.awardId;
          this.awardProjectTeam.awardNumber = data.award.awardNumber;
          this.awardProjectTeam.sequenceNumber = data.award.sequenceNumber;
          this.awardProjectTeam.isActive = true;
        }
      }
    }));
  }

  /**
   * Set Elastic search option for Fibi Person if the user selects 'Employee' radio button under project team
   */
  setElasticPersonOption() {
    this.projectTeamElasticOptions = this._elasticConfig.getElasticForPerson();
  }

  /**
   * Set Elastic search option for Fibi rolodex if the user selects 'Non-Employee' radio button under project team
   */
  setElasticRolodexOption() {
    this.projectTeamElasticOptions = this._elasticConfig.getElasticForRolodex();
  }

  setDateFormatWithoutTimeStamp() {
    this.awardProjectTeam.startDate = parseDateWithoutTimestamp(this.awardProjectTeam.startDate);
    this.awardProjectTeam.endDate = parseDateWithoutTimestamp(this.awardProjectTeam.endDate);
  }

  /**
   * @param  {} index
   * This function is called when a user edit a project team from list.
   * Here index parameter is used to identify which list (from array of objects) the user try to edit
   */
  editProjectTeam(index) {
    this.map.clear();
    this.showTeamCard = false;
    this.awardProjectTeam = Object.assign({}, this.result.awardProjectTeams[index]);
    this.awardProjectTeam.startDate = getDateObjectFromTimeStamp(this.result.awardProjectTeams[index].startDate);
    this.awardProjectTeam.endDate = getDateObjectFromTimeStamp(this.result.awardProjectTeams[index].endDate);
    this.isProjectTeamEmployee = this.result.awardProjectTeams[index].nonEmployeeFlag ? false : true;
    this.isProjectTeamEmployee ? this.setElasticPersonOption() : this.setElasticRolodexOption();
    this.projectTeamElasticOptions.defaultValue = this.awardProjectTeam.fullName;
    this.clearField = new String('false');
    scrollIntoView('teamrole');
  }

  /**
  * if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search.
  * This function is triggered when ever the person type changes between Employee and Non-Employee
  */
  changeMemberType() {
    this.clearField = new String('true');
    this.projectTeamElasticOptions.defaultValue = '';
    this.showTeamCard = false;
    delete this.awardProjectTeam['personId'];
    this.map.clear();
    (this.isProjectTeamEmployee) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
    this.awardProjectTeam.nonEmployeeFlag = this.isProjectTeamEmployee ? false : true;
  }

  /**
   * setup award common data the values that changed after the service call need to be updatedinto the store.
   * every service call wont have all the all the details as reponse so
   * we need to cherry pick the changes and update them to the store.
   */
  updateAwardStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setAwardData(this.result);
  }

  /**
   * @param  {} deleteindex
   * delete added project team details w.r.t user selection indicating deleteindex as the index of object to be deleted.
   */
  deleteTeam(deleteindex) {
    this.$subscriptions.push(this._projectTeamService.deleteProjectTeam({
      'awardId': this.result.awardProjectTeams[deleteindex].awardId,
      'awardPersonalId': this.result.awardProjectTeams[deleteindex].awardProjectTeamId
    }).subscribe(data => {
      this.result.awardProjectTeams.splice(deleteindex, 1);
      this.updateAwardStoreData();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Project Team removed successfully.');
    },
    (err: any) => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing from Project Team failed. Please try again.');
    }
    ));
  }

  /**
   * validation on adding and editing projectTeam data
   */
  projectTeamValidation() {
    this.map.clear();
    if (!this.awardProjectTeam.personId) {
      this.projectTeamElasticOptions.errorMessage = 'Please provide a person name.';
      this.map.set('projectfullname', 'fullname');
    }
    if (this.awardProjectTeam.projectRole === 'null' || !this.awardProjectTeam.projectRole) {
      this.map.set('projectrole', 'Please specify a role.');
    }
    if (!this.awardProjectTeam.startDate) {
      this.map.set('projectstartdate', 'Please select start date.');
    }
    if (!this.awardProjectTeam.endDate) {
      this.map.set('projectenddate', 'Please select end date.');
    }
    // dont change null, written to exclude 0 condition, !null and !0 is true
    if (this.awardProjectTeam.percentageCharged == null) {
      this.map.set('projectpercentage', 'Please enter % Charged.');
    } else {
      this.limitKeypress(this.awardProjectTeam.percentageCharged);
    }
    this.validateDate();
    if (this.result.awardProjectTeams && this.result.awardProjectTeams.length) {
      for (const PERSON of this.result.awardProjectTeams) {
        this.duplicateValidation(PERSON);
      }
    }
    return this.map.size ? false : true;
  }

  /**
   * @param {} PERSON
   * validation for duplicate person when adding and editing keypersonnal
   */
  duplicateValidation(PERSON) {
    if (this.isDuplicatePerson(PERSON)) {
      if (!PERSON.awardProjectTeamId || (PERSON.awardProjectTeamId !== this.awardProjectTeam.awardProjectTeamId)) {
        this.projectTeamElasticOptions.errorMessage = 'You have already added ' + this.awardProjectTeam.fullName + '.';
        this.clearField = new String('false');
        this.map.set('projectfullname', 'fullname');
        this.showTeamCard = false;
      }
    }
  }

  /**
   * @param {} PERSON
   * Returns true if duplicate person found when add or edit
   */
  isDuplicatePerson(PERSON) {
    // tslint:disable-next-line:triple-equals
    return (PERSON.personId == this.awardProjectTeam.personId) ? true : false;
  }

  /**
   * resets the project team details fields
   */
  resetTeamFields() {
    this.awardProjectTeam = {};
    this.setCommonAwardData();
    this.projectTeamElasticOptions.defaultValue = '';
    this.projectTeamElasticOptions.errorMessage = null;
    this.clearField = new String('true');
    this.isTeamEdit = false;
    this.isProjectTeamEmployee = true;
    this.setElasticPersonOption();
    this.map.clear();
  }

  /**
    * @param  {} value
    * limit the input field b/w 0 and 100 with 2 decimal points
    */
  limitKeypress(value) {
    this.map.delete('projectpercentage');
    if (validatePercentage(value)) {
      this.map.set('projectpercentage', validatePercentage(value));
    }
  }

  /**
    * @param  {} value
    * To set person id and full name if an employee is selected from elastic search
    */
  setEmployeeDetails(value) {
    this.awardProjectTeam.personId = value.prncpl_id;
    this.awardProjectTeam.fullName = value.full_name;
    this.awardProjectTeam.designation = value.primary_title;
  }

  /**
   * @param  {} value
   * In this function the personId is given even for rolodex as award project team non-employee is identified
   * with personId (for employee and non-employee) and nonemployee flag given from backend.
   */
  setNonEmployeeDetails(value) {
    this.awardProjectTeam.personId = parseInt(value.rolodex_id, 10);
    value.first_name = value.first_name || '';
    value.middle_name = value.middle_name || '';
    value.last_name = value.last_name || '';
    value.organization = !value.organization ? '' : value.organization;
    this.awardProjectTeam.fullName = value.full_name ? value.full_name :
      !value.first_name && !value.middle_name && !value.last_name ?
        value.organization : value.last_name + ' , ' + value.middle_name + value.first_name;
    this.awardProjectTeam.designation = value.designation;
  }

  /**clearPersonDetails - clears person's Id, and choosed departments if person is cleared or not valid */
  clearPersonDetails() {
    delete this.awardProjectTeam['personId'];
    this.map.delete('projectfullname');
    this.projectTeamElasticOptions.errorMessage = null;
    this.showTeamCard = false;
  }

  /**
   * @param  {} value
   * To retrieve id and full name from elastic search result and assign to project team object
   */
  selectProjectTeamPerson(value) {
    if (value) {
      this.showTeamCard = true;
      this.selectedMemberObject = value;
      this.isProjectTeamEmployee ? this.setEmployeeDetails(value) : this.setNonEmployeeDetails(value);
    } else {
      this.clearPersonDetails();
    }
  }

  /** Bind the value of rolodex to elastic search field after adding new non employee
   * @param {} rolodexObject
   */
  setRolodexTeamObject(rolodexObject) {
    if (rolodexObject.rolodex) {
      this.projectTeamElasticOptions.errorMessage = null;
      this.map.delete('projectfullname');
      this.clearField = new String('false');
      this.projectTeamElasticOptions.defaultValue = rolodexObject.rolodex.fullName;
      this.awardProjectTeam.fullName = rolodexObject.rolodex.fullName;
      this.awardProjectTeam.personId = rolodexObject.rolodex.rolodexId;
      this.awardProjectTeam.designation = rolodexObject.rolodex.designation;
      this.showTeamCard = true;
      this.selectedMemberObject = rolodexObject.rolodex;
    }
    this.isAddNonEmployeeTeamModal = rolodexObject.nonEmployeeFlag;
    $('#add-person-modal').modal('show');
  }

  /**
   * @param  {} type
   * @param  {} index
   * maintain project team details such as add and edit person to the project team
   */
  saveOrUpdateProjectTeam(type) {
    if (this.projectTeamValidation() && !this.isSaving) {
      this.isSaving = true;
      this.setCommonAwardData();
      this.setDateFormatWithoutTimeStamp();
      this.$subscriptions.push(this._projectTeamService.maintainProjectTeam(this.awardProjectTeam).subscribe((data: any) => {
        if (type === 'I') {
          if (this.result.awardProjectTeams) {
            this.result.awardProjectTeams.push(data.awardProjectTeam);
          } else {
            this.result.awardProjectTeams = [];
            this.result.awardProjectTeams.push(data.awardProjectTeam);
          }
        } else {
          this.result.awardProjectTeams.splice(this.editIndex, 1, data.awardProjectTeam);
        }
        if (this.isTeamEdit) {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Project Team updated successfully.');
        } else {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Project Team added successfully.');
        }
        this.resetTeamFields();
        this.updateAwardStoreData();
        this.showTeamCard = false;
        this.isSaving = false;
        $('#add-person-modal').modal('hide');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, (!this.isTeamEdit ? 'Adding ' : 'Updating ') + 'to Project Team failed. Please try again.');
        this.isSaving = false;
      }));
    }
  }

  /**
  * @param rolodexObject
  * fetches project team member details based on employee or non employee
  */
  fetchProjectTeamMemberDetails(awardProjectTeam) {
    this.isRolodexViewModal = true;
    this.personDescription = awardProjectTeam.projectRole;
    if (!awardProjectTeam.nonEmployeeFlag) {
      this.id = awardProjectTeam.personId;
      this.type = 'PERSON';
    } else {
      this.id = awardProjectTeam.personId;
      this.type = 'ROLODEX';
    }
  }

  setPersonRolodexModalView(personRolodexObject) {
    this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
    this.type = 'PERSON';
  }

  /**
    * Validates whether the end date is selected after the start date.
    */
  validateDate() {
    if (this.awardProjectTeam.startDate && this.awardProjectTeam.endDate) {
      if (compareDates(this.awardProjectTeam.startDate, this.awardProjectTeam.endDate) === 1) {
        this.map.set('projectenddate', 'Please select an end date after start date.');
      }else {
        this.dateValidationBeforeAction(this.awardProjectTeam.endDate, 'projectenddate', 'Please select an end date after start date.');
      }
    }
    this.compareProposalDates();
  }

  /* Function navigates to desired page to view details of a person */
  viewPersonDetails() {
    const a = document.createElement('a');
    if (this.selectedPersonDetails.hasOwnProperty('personId')) {
      a.href = '#/fibi/person/person-details?personId=' + this.selectedPersonDetails.personId;
    } else {
      a.href = '#/fibi/rolodex?rolodexId=' + this.selectedPersonDetails.rolodexId;
    }
    a.target = '_blank';
    a.click();
    a.remove();
  }
  /** Clears validation as soon as date gets picked and also shows validation when field gets cleared.
  *  This validation occurs before action(save or proceed).
  * */
  dateValidationBeforeAction(dateToCheck: any, mappedString: string, validationMessage: string) {
    this.map.delete(mappedString);
    if (!dateToCheck) {
      this.map.set(mappedString, validationMessage);
    }
  }

  private compareProposalDates() {
    const AWARD_START_DATE = getDateObjectFromTimeStamp(this._commonData.beginDate);
    const AWARD_END_DATE = getDateObjectFromTimeStamp(this._commonData.finalExpirationDate);
    if (this.awardProjectTeam.startDate) {
        if (compareDates(this.awardProjectTeam.startDate, AWARD_END_DATE) === 1) {
            this.map.set('projectstartdate', '* Choose a opening date on or before the award end date');
        }
        if (compareDates(this.awardProjectTeam.startDate, AWARD_START_DATE) === -1) {
            this.map.set('projectstartdate',
                '* Choose a opening date between award start and end Dates');
        }
    }
    if (this.awardProjectTeam.endDate) {
        if (compareDates(this.awardProjectTeam.endDate, AWARD_START_DATE) === -1) {
            this.map.set('projectenddate', '* Choose a closing date on or after the award start date');
        }
        if (compareDates(this.awardProjectTeam.endDate, AWARD_END_DATE) === 1) {
            this.map.set('projectenddate', '* Choose a closing date between award start and end dates');
        }
    }
}
setShowElasticResults(elasticResultShow) {
  this.showTeamCard = elasticResultShow.isShowElasticResults;
}

switchToNonEmployeeModal(){
  $('#add-person-modal').modal('hide');
}

}
