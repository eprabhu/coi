/** Last updated by Ramlekshmy on 11-10-2019 */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { CommonService } from '../../../../common/services/common.service';
import { ProposalHomeService } from '../../proposal-home.service';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { setFocusToElement, validatePercentage } from '../../../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp, compareDates } from '../../../../common/utilities/date-utilities';
import { DataStoreService } from '../../../services/data-store.service';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-project-team',
    templateUrl: './project-team.component.html',
    styleUrls: ['./project-team.component.css']
})
export class ProjectTeamComponent implements OnInit, OnDestroy {
    @Input() result: any = {};
    @Input() dataVisibilityObj: any = {};
    @Input() proposalDataBindObj: any = {};

    elasticSearchOptionsPerson: any = {};
    clearField: String;
    editIndex: number = null;
    personDetails: any = {
        proposalProjectTeamId: null,
        acType: '',
        proposalId: '',
        personId: '',
        fullName: '',
        projectRole: '',
        nonEmployeeFlag: false,
        percentageCharged: null,
        startDate: '',
        endDate: '',
        isActive: true,
        updateUser: '',
    };
    tempViewPersonObject: any = {};
    selectedMemberObject: any = {};
    debounceTimer: any;
    isProjectTeamEmployee = true;
    isShowPersonResultCard = false;
    isError = false;
    isShowAddNonEmployeeModal = false;
    selectedPersonDetails: any = {};
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    isSaving = false;

    isRolodexViewModal = false;
    type = 'PERSON';
    isTraining = false;
    id: string;
    personDescription: string;
    trainingStatus: string;
    proposalIdBackup = null;

    constructor(public _commonService: CommonService,
        private _proposalHomeService: ProposalHomeService,
        private _elasticConfig: ElasticConfigService,
        private _dataStore: DataStoreService,
        private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        this.getProposalDetailsFromRoute();
        this.proposalDataBindObj.mandatoryList.clear();
        this.setEmployeeElasticOptions();
        this.dataVisibilityObj.isPersonData = true;
        this._dataStore.updateStore(['dataVisibilityObj'], this);

    }

    private getProposalDetailsFromRoute() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            if (this.proposalIdBackup != this.result.proposal.proposalId) {
                this.proposalIdBackup = params['proposalId'];
                this.resetPersonFields();
            }
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /**
     * if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search
     */
    changePersonType() {
        this.isShowPersonResultCard = false;
        this.clearField = new String('true');
        this.elasticSearchOptionsPerson.defaultValue = '';
        this.personDetails.nonEmployeeFlag = '';
        this.personDetails.personId = '';
        this.personDetails.fullName = '';
        if (this.isProjectTeamEmployee) {
            this.setEmployeeElasticOptions();
        } else {
            this.setNonEmployeeElasticOptions();
        }
    }

    /** sets Emplyoee Elastic search option */
    setEmployeeElasticOptions() {
        this.elasticSearchOptionsPerson = this._elasticConfig.getElasticForPerson();
        this.elasticSearchOptionsPerson.defaultValue = '';
        this.elasticSearchOptionsPerson.fontSize = '1rem';
    }

    /** sets Non Emplyoee Elastic search option */
    setNonEmployeeElasticOptions() {
        this.elasticSearchOptionsPerson = this._elasticConfig.getElasticForRolodex();
        this.elasticSearchOptionsPerson.fontSize = '1rem';
    }

    /**
     * @param  {} event
     * @param  {} type
     * set elastic search for the employee or non employee with respect to the person type selected
     */
    selectPerson(event) {
        if (event !== null) {
            this.isShowPersonResultCard = true;
            this.selectedMemberObject = event;
            this.personDetails.personId = this.isProjectTeamEmployee ? event.prncpl_id : event.rolodex_id ? event.rolodex_id : null;
            this.personDetails.designation = this.isProjectTeamEmployee ? event.primary_title : event.designation;
            this.personDetails.fullName = event.full_name;
        } else {
            this.personDetails.personId = null;
            this.personDetails.fullName = '';
            this.isShowPersonResultCard = false;
        }
    }

    /** Bind the value of rolodex to elastic search field after adding new non employee
    * @param rolodexObject
    */
    setRolodexPersonObject(rolodexObject) {
        if (rolodexObject.rolodex) {
            this.isError = false;
            this.proposalDataBindObj.mandatoryList.delete('personfullname');
            this.clearField = new String('false');
            this.elasticSearchOptionsPerson.defaultValue = rolodexObject.rolodex.fullName;
            this.personDetails.fullName = rolodexObject.rolodex.fullName;
            this.personDetails.personId = rolodexObject.rolodex.rolodexId;
            this.personDetails.designation = rolodexObject.rolodex.designation;
            this.isShowPersonResultCard = true;
            this.selectedMemberObject = rolodexObject.rolodex;
        }
        this.isShowAddNonEmployeeModal = rolodexObject.nonEmployeeFlag;
        $('#add-person-modal').modal('show');
    }

    /**
     * @param  {} type
     * @param  {} index
     * maintain person details such us add and edit person to the project team
     */
    maintainPersondetails(type) {
        this.projectTeamValidation();
        if (this.proposalDataBindObj.mandatoryList.size <= 0 && !this.isSaving) {
            this.isSaving = true;
            this.personDetails.acType = type;
            this.isProjectTeamEmployee ? this.personDetails.nonEmployeeFlag = 'N' : this.personDetails.nonEmployeeFlag = 'Y';
            (this.personDetails.isActive === true) ? this.personDetails.isActive = 'Y' : this.personDetails.isActive = 'N';
            this.personDetails.proposalId = this.result.proposal.proposalId;
            this.personDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.personDetails.startDate = parseDateWithoutTimestamp(this.personDetails.startDate);
            this.personDetails.endDate = parseDateWithoutTimestamp(this.personDetails.endDate);
            this.$subscriptions.push(this._proposalHomeService.addProjectTeam(this.personDetails).subscribe((data: any) => {
                if (type === 'I') {
                    this.result.proposalProjectTeams.push(data.projectTeam);
                } else {
                    this.result.proposalProjectTeams.splice(this.editIndex, 1, data.projectTeam);
                }
                this._dataStore.updateStore(['proposalProjectTeams'], this.result);
                if (this.editIndex !== null) {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Project Team updated successfully.');
                } else {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Project Team added successfully.');
                }
                this.resetPersonFields();
                this.isSaving = false;
                $('#add-person-modal').modal('hide');
            },
                err => { this._commonService.showToast(HTTP_ERROR_STATUS, (this.editIndex !== null) ? 'Updating Project Team failed. Please try again.' : 'Adding Project Team failed. Please try again.'); 
                this.isSaving = false; }
            ));
        }
    }

    /**
     * @param  {} person
     */
    /* fetches employee or non employee details based on the value of nonEmployeeFlag */
    fetchProjectTeamMemberDetails(person) {
        this.isRolodexViewModal = true;
        this.personDescription = person.projectRole;
        if (person.nonEmployeeFlag === 'N') {
          this.id = person.personId;
          this.type = 'PERSON';
        } else {
          this.id = person.personId;
          this.type = 'ROLODEX';
        }
    }

    setPersonRolodexModalView(personRolodexObject) {
        this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
        this.type = 'PERSON';
      }

    /**
     * @param  {} index
     * To edit project team
     */
    editProjectTeam(index) {
        this.editIndex = index;
        this.personDetails = Object.assign({}, this.result.proposalProjectTeams[index]);
        this.personDetails.startDate = getDateObjectFromTimeStamp(this.result.proposalProjectTeams[index].startDate);
        this.personDetails.endDate = getDateObjectFromTimeStamp(this.result.proposalProjectTeams[index].endDate);
        this.isProjectTeamEmployee = (this.result.proposalProjectTeams[index].nonEmployeeFlag === 'Y') ? false : true;
        (this.result.proposalProjectTeams[index].isActive === 'Y') ?
            this.personDetails.isActive = true : this.personDetails.isActive = false;
        if (this.isProjectTeamEmployee) {
            this.setEmployeeElasticOptions();
        } else {
            this.setNonEmployeeElasticOptions();
        }
        this.elasticSearchOptionsPerson = Object.assign({}, this.elasticSearchOptionsPerson);
        this.elasticSearchOptionsPerson.defaultValue = this.personDetails.fullName;
        this.clearField = new String('false');
        this.isError = false;
    }

    /**
     * @param  {} type
     * validation on adding and editing person data
     */
    projectTeamValidation() {
        this.proposalDataBindObj.mandatoryList.clear();
        this.isError = false;
        if (this.personDetails.fullName === '' || this.personDetails.fullName === undefined) {
            this.proposalDataBindObj.mandatoryList.set('personfullname', '* Please enter person name');
            this.isError = true;
        }
        if (this.personDetails.projectRole === '' || this.personDetails.projectRole === undefined) {
            this.proposalDataBindObj.mandatoryList.set('personRole', '* Please enter project role');
        }
        if (this.personDetails.startDate === '' || this.personDetails.startDate === undefined) {
            this.proposalDataBindObj.mandatoryList.set('activeFrom', '* Please select start date');
        }
        if (this.personDetails.endDate === '' || this.personDetails.endDate === undefined) {
            this.proposalDataBindObj.mandatoryList.set('activeTo', '* Please select end date');
        } else if (this.personDetails.startDate && this.personDetails.endDate) {
            this.validateDate();
        }
        this.compareProposalDates();
        if (this.personDetails.percentageCharged) {
            this.limitKeypress(this.personDetails.percentageCharged);
        }
    }

    /**
     * @param  {} deleteindex
     * delete added person details w.r.t user selection
     */
    deletePerson(deleteindex) {
        this.result.proposalProjectTeams[deleteindex].acType = 'D';
        this.$subscriptions.push(
            this._proposalHomeService.addProjectTeam((this.result.proposalProjectTeams.splice(deleteindex, 1)[0])).subscribe(data => {
                this._dataStore.updateStore(['proposalProjectTeams'], this.result);
            },
                err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Project Team failed. Please try again.'); },
                () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Project Team removed successfully.'); }));
    }

    /** resets the person details fields */
    resetPersonFields() {
        this.personDetails = {};
        this.isProjectTeamEmployee = true;
        this.setEmployeeElasticOptions();
        this.personDetails.isActive = true;
        this.clearField = new String('true');
        this.elasticSearchOptionsPerson.defaultValue = '';
        this.editIndex = null;
        this.isShowPersonResultCard = false;
        this.proposalDataBindObj.mandatoryList.clear();
    }

    /**
      * @param  {} value
      * limit the input field b/w 0 and 100 with 2 decimal points
    */
    limitKeypress(value) {
        this.proposalDataBindObj.mandatoryList.delete('projectpercentage');
        if (validatePercentage(value)) {
            this.proposalDataBindObj.mandatoryList.set('projectpercentage', validatePercentage(value));
        }
    }

    /* opens a new tab with employee or non-employee details based on personId */
    viewProjectTeamMemberDetails() {
        const a = document.createElement('a');
        a.href = this.selectedPersonDetails.hasOwnProperty('personId') ?
            '#/fibi/person/person-details?personId=' + this.selectedPersonDetails.personId :
            '#/fibi/rolodex?rolodexId=' + this.selectedPersonDetails.rolodexId;
        a.target = '_blank';
        a.click();
    }
    /** Clears validation as soon as date gets picked and also shows validation when field gets cleared.
     *  This validation occurs before action(save or proceed).
    * */
    dateValidationBeforeAction(dateToCheck: any, mappedString: string, validationMessage: string) {
        this.proposalDataBindObj.mandatoryList.delete(mappedString);
        if (!dateToCheck) {
            this.proposalDataBindObj.mandatoryList.set(mappedString, validationMessage);
        }
    }

    validateDate() {
        if (this.personDetails.startDate && this.personDetails.endDate) {
            if (compareDates(this.personDetails.startDate, this.personDetails.endDate) === 1) {
                this.proposalDataBindObj.mandatoryList.set('activeTo', '* Please select a closing date after opening date');
            } else {
                this.dateValidationBeforeAction(this.personDetails.endDate, 'activeTo', 'Please select a closing date after opening date');
            }
        }
    }

    private compareProposalDates() {
        if (this.personDetails.startDate) {
            if (compareDates(this.personDetails.startDate, this.result.proposal.endDate) === 1) {
                this.proposalDataBindObj.mandatoryList.set('activeFrom', '* Choose a opening date on or before the proposal end date');
            }
            if (compareDates(this.personDetails.startDate, this.result.proposal.startDate) === -1) {
                this.proposalDataBindObj.mandatoryList.set('activeFrom',
                    '* Choose a opening date between proposal start and end Dates');
            }
        }
        if (this.personDetails.endDate) {
            if (compareDates(this.personDetails.endDate, this.result.proposal.startDate) === -1) {
                this.proposalDataBindObj.mandatoryList.set('activeTo', '* Choose a closing date on or after the proposal start date');
            }
            if (compareDates(this.personDetails.endDate, this.result.proposal.endDate) === 1) {
                this.proposalDataBindObj.mandatoryList.set('activeTo', '* Choose a closing date between proposal start and end dates');
            }
        }
    }

    setShowElasticResults(elasticResultShow) {
        this.isShowPersonResultCard = elasticResultShow.isShowElasticResults;
      }

    switchToNonEmployeeModal() {
        $('#add-person-modal').modal('hide');
        this.isShowAddNonEmployeeModal = true;
    }

}
