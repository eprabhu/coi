import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PersonnelService } from './personnel.service';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { CommonService } from '../../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { DEFAULT_DATE_FORMAT } from '../../../../app-constants';
import { setFocusToElement, inputRestrictionForAmountField } from '../../../../common/utilities/custom-utilities';
import { Subscription, SubscriptionLike as ISubscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { ActivatedRoute } from '@angular/router';
import { BudgetDataService } from '../../budget-data.service';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';

@Component({
  selector: 'app-personnel',
  templateUrl: './personnel.component.html',
  styleUrls: ['./personnel.component.css']
})
export class PersonnelComponent implements OnInit, OnDestroy {

  @Output() isPersonAdded = new EventEmitter();
  personsResultData: any = {};
  tbnPersonsList: any = [];
  personnelTypes = [
    { name: 'Award Persons', value: 'P' },
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
  isPersonAddedInLineItem = null;
  clearField: String;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  private $awardBudgetData: ISubscription;
  private $awardBudgetPersonData: ISubscription;
  awardBudgetData: any = {};
  currentUrl= null;
  currencyFormatter;
  isEditPerson: any = [];
  isSaving = false;

  constructor(private _elasticConfig: ElasticConfigService, private _personnelService: PersonnelService,
    public _commonService: CommonService, public _budgetDataService: BudgetDataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.currencyFormatter = this._commonService.currencyFormat;
    this.subscribeBudgetData();
    this.subscribeAwardPersonData();
    this.personsDetails.personType = 'P';
    this.completerOptions.contextField = 'personName';
    this.completerOptions.filterFields = 'personName';
    this.completerOptions.formatString = 'personName';
    this.currentUrl = this.route.snapshot.url[0].path;
  }
  subscribeBudgetData() {
    this.$awardBudgetData = this._budgetDataService.awardBudgetData.subscribe((data: any) => {
      this.awardBudgetData = data ? Object.assign({}, data) : null;
    });
  }
  subscribeAwardPersonData() {
    this.$awardBudgetPersonData = this._budgetDataService.awardBudgetPersonData.subscribe((data: any) => {
      this.personsResultData = data;
      this.personsResultData.awardBudgetPersonList = this.personsResultData.awardBudgetPersonList ?
          this.personsResultData.awardBudgetPersonList : [];
          this.setIsPersonEdit();
    });
  }
  setIsPersonEdit() {
    this.isEditPerson = [];
    this.personsResultData.awardBudgetPersonList.forEach(element => {
      this.isEditPerson.push(false);
    });
  }
  ngOnDestroy() {
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
    this.clearTBNPersonDetails();
    this.elasticSearchOptions.defaultValue = '';
    if (this.personsDetails.personType === 'E') {
      this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    } else if (this.personsDetails.personType === 'N') {
      this.elasticSearchOptions = this._elasticConfig.getElasticForRolodex();
    } else if (this.personsDetails.personType === 'T') {
      this.completerOptions.arrayList = this.personsResultData.tbnPersons;
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
    this.personsDetails.personId = null;
    this.personsDetails.rolodexId = null;
    this.personsDetails.personName = null;
    if (value !== null) {
      if (this.personsDetails.personType === 'E') {
        this.personsDetails.personId = value.prncpl_id;
        this.personsDetails.personName = value.full_name;
      } else if (this.personsDetails.personType === 'N') {
        value.organization = (value.organization == null) ? '' : value.organization;
        value.first_name = (value.first_name == null) ? '' : value.first_name;
        value.middle_name = (value.middle_name == null) ? '' : value.middle_name;
        value.last_name = (value.last_name == null) ? '' : value.last_name;
        this.personsDetails.rolodexId = value.rolodex_id;
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
    if (event !== null) {
      this.personsDetails.tbnId = event.tbnId;
      this.personsDetails.tbnPerson = event;
    } else {
      this.clearTBNPersonDetails();
    }
  }

  clearTBNPersonDetails() {
    this.personsDetails.tbnId = null;
    this.personsDetails.tbnPerson = null;
    this.completerOptions.defaultValue = null;
  }

  /**
   *If searched person is a proposal person sets the person id
   */
  personnelNameChange() {
    this.personsDetails.personId = null;
    this.personsDetails.personName = null;
    if (this.personnelSearchText !== 'null') {
      const proposalPerson = this.personsResultData.awardPersons.find(person => person.fullName === this.personnelSearchText);
      this.personsDetails.personId = proposalPerson.personId ? proposalPerson.personId : proposalPerson.rolodexId;
      this.personsDetails.personName = proposalPerson.fullName;
    }
  }
  setPersonSalary() {
    this.personsDetails.jobCodes = this.personsResultData.jobCode.find(item => item.jobCode === this.personsDetails.jobCode);
  }
  /**
   * inserts a new person
   */
  addPerson(personsDetails, personAddedFrom) {
    this.personValidation(personsDetails, null);
    if (this.map.size < 1 && !this.isSaving) {
      this.isSaving = true;
      personsDetails.appointmentType = this.personsResultData.appointmentType.
        find(item => item.code === personsDetails.appointmentTypeCode);
      if (personAddedFrom === 'DETAILEDBUDGET' && !personsDetails.jobCode) {
        personsDetails.jobCode = this.personsResultData.jobCode.find(item => item.jobCode === personsDetails.jobCode);
        personsDetails.calculationBase = personsDetails.jobCode.monthSalary;
      }
      personsDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
      personsDetails.updateTimeStamp = new Date().getTime();
      personsDetails.budgetHeaderId = this.awardBudgetData.awardBudgetHeader.budgetId;
      personsDetails.effectiveDate = parseDateWithoutTimestamp(this.personsDetails.effectiveDate);
      personsDetails.salaryAnniversaryDate = parseDateWithoutTimestamp(this.personsDetails.salaryAnniversaryDate);
      this.$subscriptions.push(this._personnelService.saveOrUpdateAwardBudgetPerson({
        'awardBudgetPerson': personsDetails, 'awardId': this.awardBudgetData.awardId})
        .subscribe((data: any) => {
          if (data.budgetPersonId) {
            this.personsResultData.awardBudgetPersonList.push(data);
            this.isPersonAdded.emit(data);
            this.resetPersonObject();
            this._budgetDataService.setAwardBudgetPersonList(this.personsResultData);
            // close modal if person added from 'ADD OTHER PERSON' popup
            if (document.getElementById('add-person-modal-clear')) { document.getElementById('add-person-modal-clear').click(); }
          }
          (personAddedFrom !== 'DETAILEDBUDGET') ?
              this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person added successfully.') : '';
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
  editPerson(index) {
    this.index = index;
    this.map.clear();
    this.setIsPersonEdit();
    this.isEditPerson[index] = true;
    this.personsDetails = JSON.parse(JSON.stringify(this.personsResultData.awardBudgetPersonList[this.index]));
    this.personsDetails.effectiveDate = getDateObjectFromTimeStamp(this.personsDetails.effectiveDate);
    this.personsDetails.salaryAnniversaryDate = getDateObjectFromTimeStamp(this.personsDetails.salaryAnniversaryDate);
    if (this.personsDetails.personType === 'T') {
      this.completerOptions.arrayList = this.personsResultData.tbnPersons;
      this.completerOptions.defaultValue = this.personsResultData.awardBudgetPersonList[this.index].tbnPerson.personName;
    } else if (this.personsDetails.personType === 'P') {
      this.personnelSearchText = this.personsResultData.awardBudgetPersonList[this.index].personName;
    } else if (this.personsDetails.personType === 'E') {
      this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
      this.elasticSearchOptions.defaultValue = this.personsResultData.awardBudgetPersonList[this.index].personName;
    } else if (this.personsDetails.personType === 'N') {
      this.elasticSearchOptions = this._elasticConfig.getElasticForRolodex();
      this.elasticSearchOptions.defaultValue = this.personsResultData.awardBudgetPersonList[this.index].personName;
    }
    setTimeout(() => {
      document.getElementById('addPersonId').scrollIntoView({ block: 'end' });
    }, 0);
  }

  updatePerson() {
    this.personValidation(this.personsDetails, this.index);
    if (this.map.size < 1 && !this.isSaving) {
      this.isSaving = true;
      this.personsDetails.appointmentType = this.personsResultData.appointmentType.
        find(item => item.code === this.personsDetails.appointmentTypeCode);
      this.personsDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.personsDetails.updateTimeStamp = new Date().getTime();
      this.personsDetails.effectiveDate = parseDateWithoutTimestamp(this.personsDetails.effectiveDate);
      this.personsDetails.salaryAnniversaryDate = parseDateWithoutTimestamp(this.personsDetails.salaryAnniversaryDate);
      this.updatePersonServiceCall().then(data => {
        this.resetPersonObject();
        setTimeout(() => {
          document.getElementById(this.index).scrollIntoView({ block: 'end' });
        }, 0);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person updated successfully.');
        this.isSaving = false;
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating person details failed. Please try again.');
        this.isSaving = false;
      });
    }
  }
  updatePersonServiceCall() {
    return new Promise((resolve, reject) => {
      this.$subscriptions.push(this._personnelService.saveOrUpdateAwardBudgetPerson({
        'awardBudgetPerson': this.personsDetails, 'awardId': this.awardBudgetData.awardId})
        .subscribe((data: any) => {
          this.personsResultData.awardBudgetPersonList.splice(this.index, 1, data);
          resolve(true);
        }, err=>{
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating person details failed. Please try again.');
        }));
    });
  }
  deletePerson(index) {
    this.$subscriptions.push(
      this._personnelService.deletePerson({
        'budgetPersonId': this.personsResultData.awardBudgetPersonList[index].budgetPersonId,
        'budgetHeaderId': this.awardBudgetData.awardBudgetHeader.budgetId,
        'awardId': this.awardBudgetData.awardId,
        'userName': this._commonService.getCurrentUserDetail('userName')
      })
        .subscribe((data: any) => {
          this.personsResultData.awardBudgetPersonList = data.awardBudgetPersonList;
          this.resetPersonObject();
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
      this.personsResultData.awardBudgetPersonList.forEach((element, id) => {
        // tslint:disable:triple-equals
        /** triple equals is disabled here to avoid type conversion while checking
         * eg : person.personType == 'E' true ; person.personType === 'E' false
         */
        if (index == null || id !== index) {
          if (element.jobCode == person.jobCode && element.appointmentTypeCode == person.appointmentTypeCode) {
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
    if (!person.jobCode || person.jobCode === 'null') {
      this.map.set('jobtype', 'jobtype');
    }
    if (!person.appointmentTypeCode || person.appointmentTypeCode === 'null') {
      this.map.set('appoinmenttype', 'appoinmenttype');
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
    this.personnelSearchText = null;
    this.setIsPersonEdit();
  }

  checkBudgetPersonAddedInBudget(person) {
    this.isPersonAddedInLineItem = null;
      this._personnelService.checkAwardBudgetPersonAddedInBudget({'budgetPersonDetailId': person.budgetPersonId}).subscribe((data: any) => {
        this.isPersonAddedInLineItem = data;
        document.getElementById('award-person-delete-modal-btn').click();
      });
  }
}
