import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PersonnelService } from './personnel.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { setFocusToElement, inputRestrictionForAmountField } from '../../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { BudgetDataService } from '../../services/budget-data.service';
import { ActivatedRoute } from '@angular/router';
import { AutoSaveService } from '../../../common/services/auto-save.service';

declare var $: any;

@Component({
    selector: 'app-personnel',
    templateUrl: './personnel.component.html',
    styleUrls: ['./personnel.component.css']
})
export class PersonnelComponent implements OnInit, OnDestroy {

    @Input() isNested = false;
    @Output() isPersonAdded = new EventEmitter();
    budgetData: any = {};
    personsData: any = {};
    tbnPersonsList: any = [];
    personnelTypes = [
        { name: 'Proposal Persons', value: 'P' },
        { name: 'Employee', value: 'E' },
        { name: 'Non-Employee', value: 'N' },
        { name: 'To Be Named', value: 'T' }
    ];
    elasticSearchOptions: any = {};
    personsDetails: any = {};
    personnelSearchText = null;
    index;
    completerOptions: any = {};
    map = new Map();
    clearField: string;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    isEditPerson: any = [];
    currentUrl = null;
    warningMessage = null;
    isSaving = false;
    hasUnsavedChanges = false;

    constructor(private _elasticConfig: ElasticConfigService, private _personnelService: PersonnelService,
        public _commonService: CommonService, public _budgetDataService: BudgetDataService,
        private route: ActivatedRoute, private _autoSaveService: AutoSaveService) { }

    ngOnInit() {
        if (!this.isNested) {
            this._budgetDataService.BudgetTab = 'PERSONNEL';
        }
        this.personsDetails.personType = 'P';
        this.personsDetails.jobCodeType = null;
        this.completerOptions.contextField = 'personName';
        this.completerOptions.filterFields = 'personName';
        this.completerOptions.formatString = 'personName';
        // the below commented code is for ku
        this.personsDetails.appointmentTypeCode = '6';
        this.currentUrl = this.route.snapshot.url[0].path;
        this.subscribeBudgetData();
        this.subscribePersonData();
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? Object.assign({}, data) : {};
        }));
    }

    subscribePersonData() {
        this.$subscriptions.push(this._budgetDataService.personData.subscribe((data: any) => {
            this.personsData = data ? Object.assign({}, data) : {};
            if (this.personsData.budgetPersonList) {
                this.setIsPersonEdit();
            }
        }));
    }

    setIsPersonEdit() {
        this.isEditPerson = [];
        this.personsData.budgetPersonList.forEach(element => {
            this.isEditPerson.push(false);
        });
    }

    ngOnDestroy() {
        this.setUnsavedChanges(false);
        subscriptionHandler(this.$subscriptions);
    }

    /**
     * onselecting personnel type as employee or nonemployee sets the required elastic configurations
     */
    setElasticConfig() {
        this.map.clear();
        this.personnelSearchText = '';
        this.personsDetails.personId = null;
        this.personsDetails.rolodexId = null;
        this.personsDetails.tbnId = null;
        this.elasticSearchOptions.defaultValue = '';
        if (this.personsDetails.personType === 'E') {
            this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        } else if (this.personsDetails.personType === 'N') {
            this.elasticSearchOptions = this._elasticConfig.getElasticForRolodex();
        } else if (this.personsDetails.personType === 'T') {
            this.completerOptions.arrayList = this.personsData.tbnPersons;
            this.completerOptions.contextField = 'personName';
            this.completerOptions.filterFields = 'personName';
            this.completerOptions.formatString = 'personName';
        }
    }

    /**
     * @param  {} value
     * If person is an employee sets the personId
     * If person is an non employee sets the rolodexId
     */
    selectedPersonnel(value) {
        this.setUnsavedChanges(true);
        this.personsDetails.personId = null;
        this.personsDetails.rolodexId = null;
        this.personsDetails.personName = null;
        if (value !== null) {
            if (this.personsDetails.personType === 'E') {
                this.personsDetails.personId = value.prncpl_id;
                this.personsDetails.personName = value.full_name;
                this.personsDetails.nonEmployeeFlag = false;
            } else if (this.personsDetails.personType === 'N') {
                value.organization = (value.organization == null) ? '' : value.organization;
                value.first_name = (value.first_name == null) ? '' : value.first_name;
                value.middle_name = (value.middle_name == null) ? '' : value.middle_name;
                value.last_name = (value.last_name == null) ? '' : value.last_name;
                this.personsDetails.rolodexId = value.rolodex_id;
                this.personsDetails.nonEmployeeFlag = true;
                if ((value.first_name === null || value.first_name === '') &&
                    (value.middle_name === null || value.middle_name === '') &&
                    (value.last_name === null || value.last_name === '')) {
                    this.personsDetails.personName = value.organization;
                } else {
                    this.personsDetails.personName = '';
                    this.personsDetails.personName = value.last_name + ' , ' +
                        value.middle_name + ' ' +
                        value.first_name;
                }
            }
        }
    }

    /**
     * on selecting a 'to be named' type as person type sets the tbnId
     */
    tbnChangeFunction(event) {
        this.setUnsavedChanges(true);
        if (event !== null) {
            this.personsDetails.tbnId = event.tbnId;
            this.personsDetails.tbnPerson = event;
        } else {
            this.personsDetails.tbnId = null;
            this.personsDetails.tbnPerson = null;
        }
        this.personsDetails.nonEmployeeFlag = true;
    }

    /**
     *If searched person is a proposal person sets the person id
     */
    personnelNameChange() {
        this.personsDetails.personId = null;
        this.personsDetails.personName = null;
        if (this.personnelSearchText !== 'null') {
            const proposalPerson = this.personsData.proposalPersons.find(person => person.fullName === this.personnelSearchText);
            this.personsDetails.personId = proposalPerson.personId ? proposalPerson.personId : proposalPerson.rolodexId;
            this.personsDetails.personName = proposalPerson.fullName;
            this.personsDetails.nonEmployeeFlag = false;
        }
    }
    setPersonSalary() {
        this.personsDetails.jobCode = this.personsData.jobCode.find(item => item.jobCode === this.personsDetails.jobCodeType);
        // the below commented code is for ku
        // this.personsDetails.calculationBase = this.personsDetails.jobCode.monthSalary;
    }

    /**
     * inserts a new person
     */
    addPerson(personsDetails, budgetTab) {
        this.personValidation(personsDetails, null);
        if (this.map.size < 1 && !this.isSaving) {
            this.isSaving = true;
            personsDetails.appointmentType = this.personsData.appointmentType.
                find(item => item.code === personsDetails.appointmentTypeCode);
            personsDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
            personsDetails.budgetId = this.budgetData.budgetHeader.budgetId;
            personsDetails.effectiveDate = parseDateWithoutTimestamp(personsDetails.effectiveDate);
            this.$subscriptions.push(this._personnelService.addOrUpdatePerson({ budgetPerson: personsDetails })
                .subscribe((data: any) => {
                    if (data.budgetPersonId) {
                        this.personsData.budgetPersonList.push(data);
                        this._budgetDataService.setBudgetPersonData(this.personsData);
                        this.isPersonAdded.emit(data);
                        this.resetPersonObject();
                    }
                    if (budgetTab !== 'DETAILEDBUDGET') {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person added successfully.');
                    }
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Person failed. Please try again.');
                    this.isSaving = false;
                }));
        }
    }

    /**
     * @param  {} index
     * binds the selected row of values to personsDetails object for editing
     * binds personnelType and names with respect to the personType given
     */
    editPerson() {
        this.map.clear();
        this.setIsPersonEdit();
        this.isEditPerson[this.index] = true;
        this.personsDetails = JSON.parse(JSON.stringify(this.personsData.budgetPersonList[this.index]));
        this.personsDetails.effectiveDate = getDateObjectFromTimeStamp(this.personsDetails.effectiveDate);
        if (this.personsDetails.personType === 'T') {
            this.completerOptions.arrayList = this.personsData.tbnPersons;
            this.completerOptions.defaultValue = this.personsData.budgetPersonList[this.index].tbnPerson.personName;
        } else if (this.personsDetails.personType === 'P') {
            this.personnelSearchText = this.personsData.budgetPersonList[this.index].personName;
        } else if (this.personsDetails.personType === 'E') {
            this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
            this.elasticSearchOptions.defaultValue = this.personsData.budgetPersonList[this.index].personName;
        } else if (this.personsDetails.personType === 'N') {
            this.elasticSearchOptions = this._elasticConfig.getElasticForRolodex();
            this.elasticSearchOptions.defaultValue = this.personsData.budgetPersonList[this.index].personName;
        }
        setTimeout(() => {
            document.getElementById('addPersonId').scrollIntoView({ block: 'end' });
        }, 0);
    }

    updatePerson() {
        this.personValidation(this.personsDetails, this.index);
        if (this.map.size < 1 && !this.isSaving) {
            this.isSaving = true;
            this.personsDetails.appointmentType = this.personsData.appointmentType.
                find(item => item.code === this.personsDetails.appointmentTypeCode);
            this.personsDetails.effectiveDate = parseDateWithoutTimestamp(this.personsDetails.effectiveDate);
            this.updatePersonServiceCall().then(data => {
                this._budgetDataService.setBudgetPersonData(this.personsData);
                this.resetPersonObject();
                setTimeout(() => {
                    document.getElementById(this.index).scrollIntoView({ block: 'end' });
                }, 0);
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person updated successfully.');
                this.isSaving = false;
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Person failed. Please try again.');
                this.isSaving = false;
            });
        }
    }

    updatePersonServiceCall() {
        return new Promise((resolve, reject) => {
            this.$subscriptions.push(this._personnelService.addOrUpdatePerson({ budgetPerson: this.personsDetails })
                .subscribe((data: any) => {
                    this.personsData.budgetPersonList.splice(this.index, 1, data);
                    resolve(true);
                }));
        });
    }

    deletePerson(index) {
        this.$subscriptions.push(
            this._personnelService.deletePerson({
                'budgetPersonDetailId': this.personsData.budgetPersonList[index].budgetPersonId,
                'budgetId': this.budgetData.budgetHeader.budgetId
            })
                .subscribe((data: any) => {
                    this.personsData.budgetPersonList = data.budgetPersonList;
                    this._budgetDataService.setBudgetPersonData(this.personsData);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person deleted successfully.');
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Person failed. Please try again.');
                }));
    }

    findPersonType(type) {
        const PERSONTYPE = this.personnelTypes.find(item => item.value === type);
        return PERSONTYPE.name;
    }

    /**
     * @param  {} person
     * checks empty validations
     */
    personValidation(person, index) {
        this.map.clear();
        if (!person.personType || person.personType === null) {
            this.map.set('persontype', 'persontype');
        }
        if ((person.personType === 'E' && !person.personId) || (person.personType === 'E' && person.personId === null)) {
            this.map.set('person', 'person');
        } else if ((this.personsDetails.personType === 'N' && !person.rolodexId) || person.personType === 'N' && person.rolodexId === null) {
            this.map.set('person', 'person');
        } else if ((person.personType === 'T' && !person.tbnId) || (person.personType === 'T' && person.tbnId === null)) {
            this.map.set('person', 'person');
        } else if ((person.personType === 'P' && !person.personId) || (person.personType === 'P' && person.personId === null)) {
            this.map.set('personp', 'personp');
        } else {
            this.personsData.budgetPersonList.forEach((element, id) => {
                // tslint:disable:triple-equals
                /** triple equals is disabled here to avoid type conversion while checking
                 * eg : person.personType == 'E' true ; person.personType === 'E' false
                 */
                if (index == null || id !== index) {
                    if (element.jobCodeType == person.jobCodeType && element.appointmentTypeCode == person.appointmentTypeCode) {
                        if (person.personType == 'E' || person.personType == 'P') {
                            if (person.personId == element.personId) {
                                this.map.set('personrepeat', 'person');
                            }
                        } else if (person.personType === 'N') {
                            if (person.rolodexId == element.rolodexId) {
                                this.map.set('personrepeat', 'person');
                            }
                        } else if (person.personType === 'T') {
                            if (person.tbnId == element.tbnId) {
                                this.map.set('personrepeat', 'person');
                            }
                        }
                    }
                }
            });
        }
        if (!person.jobCodeType || person.jobCodeType === 'null') {
            this.map.set('jobtype', 'jobtype');
        }
        if (!person.appointmentTypeCode || person.appointmentTypeCode === 'null') {
            this.map.set('appoinmenttype', 'appoinmenttype');
        }
        if (!person.effectiveDate || person.effectiveDate === null) {
            // this.personWarningMsg = 'Select a effective date';
        }
        if (this.personsDetails.calculationBase) {
            this.inputDigitRestriction(this.personsDetails.calculationBase, 'baseSalary');
        }
    }

    inputDigitRestriction(field: any, key: string) {
        this.map.delete(key);
        if (inputRestrictionForAmountField(field)) {
            this.map.set(key, inputRestrictionForAmountField(field));
        }
    }

    resetPersonObject() {
        this.map.clear();
        this.personsDetails = {};
        this.personsDetails.personType = 'P';
        this.personnelSearchText = '';
        this.personsDetails.appointmentTypeCode = '6';
        this.setIsPersonEdit();
        this.setUnsavedChanges(false);
    }

    checkBudgetPersonAddedInBudget(budgetPersonId, type) {
        this.$subscriptions.push(this._personnelService.checkBudgetPersonAddedInBudget({ 'budgetPersonDetailId': budgetPersonId })
            .subscribe((data: any) => {
                if (data) {
                    this.warningMessage = type === 'DELETE' ?
                        'Can\'t delete this person as it is being used in detailed budget.' :
                        'Can\'t edit this person as it is being used in detailed budget.';
                    $('#proposalBudgetPersonActionWarnModal').modal('show');
                } else {
                    type === 'DELETE' ?
                        $('#personDeleteProposalBudget').modal('show') :
                        this.editPerson();
                }
            }));
    }

    setUnsavedChanges(flag: boolean) {
        if(this.isNested) { return; }
        if (this.hasUnsavedChanges !== flag) {
            this._autoSaveService.setUnsavedChanges('Personnel', 'proposal-budget-personnel', flag);
        }
        this._budgetDataService.budgetDataChanged = flag;
        this.hasUnsavedChanges = flag;
    }

}
