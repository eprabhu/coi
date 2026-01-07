import { Component, Input, OnDestroy, OnChanges, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BudgetDataService } from '../../services/budget-data.service';
import { genericCalculations } from '../budget-calculations';
import { DEFAULT_DATE_FORMAT, HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { BudgetService } from '../budget.service';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { checkObjectHasValues, inputRestriction, limitKeypress, validatePersonDetails } from '../budget-validations';

declare var $: any;

@Component({
    selector: 'app-personnel-line-items',
    templateUrl: './personnel-line-items.component.html',
    styleUrls: ['./personnel-line-items.component.css']
})
export class PersonnelLineItemsComponent implements OnDestroy, OnChanges {

    @Input() lineItemData: any = {};
    @Input() personValidation: any = [{}];
    @Input() currentPeriodData: any = {};
    @Output() isLineItemActions = new EventEmitter();
    @Output() emitChange = new EventEmitter();
    personsResultData: any = {};
    tempPerson: any = {};
    budgetData: any = {};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    $subscriptions: Subscription[] = [];
    genericCalculations = genericCalculations;
    setFocusToElement = setFocusToElement;
    inputRestriction = inputRestriction;
    limitKeypress = limitKeypress;

    constructor(
        public _commonService: CommonService,
        public _budgetDataService: BudgetDataService,
        private _budgetService: BudgetService
    ) { }

    ngOnChanges() {
        this.subscribeBudgetData();
        this.subscribePersonData();
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? data : {};
        }));
    }

    subscribePersonData() {
        this.$subscriptions.push(this._budgetDataService.personData.subscribe((data: any) => {
            this.personsResultData = data ? data : {};
        }));
    }

    /**
       * @param  {} period
       * initialy sets one person object to add
       * if validations are satisfied allows multiple person to add
       * if we choose personal line item with tbn person, that tbn is set to the person by default
       */
    addMultiplePerson() {
        const PERSON = {
            budgetPersonId: null,
            startDate: this.currentPeriodData.startDate,
            endDate: this.currentPeriodData.endDate,
            budgetPerson: null
        };
        if (this.lineItemData.costElement.tbnId) {
            const SELECTED_PERSON = this.getTbnPerson();
            PERSON.budgetPersonId = SELECTED_PERSON.budgetPersonId;
            PERSON.budgetPerson = SELECTED_PERSON;
            this.setNewPerson(PERSON);
            genericCalculations(PERSON, this.lineItemData, this.currentPeriodData, this.budgetData);
        } else {
            this.setNewPerson(PERSON);
        }
    }

    setNewPerson(PERSON) {
        if (!this.lineItemData.personsDetails.length) {
            this.lineItemData.personsDetails.push(PERSON);
        } else {
            this.personValidation = validatePersonDetails(this.lineItemData.personsDetails, this.currentPeriodData, this.personValidation);
            if (this.personValidation.every(item => checkObjectHasValues(item))) {
                this.lineItemData.personsDetails.push(PERSON);
            }
        }
    }

    getTbnPerson() {
        return this.personsResultData.budgetPersonList.
            find(item => item.tbnId === this.lineItemData.costElement.tbnId &&
                item.jobCodeType === this.lineItemData.costElement.tbnPerson.jobCode);
    }

    deletePerson(person, index) {
        this.tempPerson = person;
        if (person.budgetPersonDetailId) {
            this.isLineItemActions.emit({ popUpType: 'PERSON_DELETE', lineItemData: this.lineItemData, person: person });
        } else {
            this.lineItemData.personsDetails.splice(index, 1);
            this.genericCalculations({}, this.lineItemData, this.currentPeriodData, this.budgetData);
            this.personValidation = [];
            if (this.lineItemData.personsDetails.length === 0 && !this.lineItemData.budgetDetailId) {
                this.lineItemData.personsDetails.push({ startDate: this.currentPeriodData.startDate, endDate: this.currentPeriodData.endDate });
            }
        }
    }

    deletePersonServiceCall(tempPerson) {
        const REQUESTOBJ = {
            budgetPeriodId: this.currentPeriodData.budgetPeriod,
            budgetPersonDetailId: tempPerson.budgetPersonDetailId,
            budgetHeader: this.budgetData.budgetHeader,
            activityTypeCode: this._budgetDataService.activityTypeCode,
            grantTypeCode: this._budgetDataService.grantTypeCode
        };
        this.$subscriptions.push(this._budgetService.deletePersonLineItem(REQUESTOBJ)
            .subscribe((data: any) => {
                this.budgetData.budgetHeader = data.budgetHeader;
                this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
                this._budgetDataService.setProposalBudgetData(this.budgetData);
                this.personValidation = [];
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person deleted successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Person failed. Please try again.');
            }));
    }

    /**
   * @param  {} event
   * @param  {} person
   * trigger the person add modal when ever user chooses add other person from person dropdown
   * tempPerson holds the reference to the current edited person
   */
    triggerPersonsModal(event, person) {
        this.tempPerson = person;
        if (event.target.value === 'otherPersons') {
            $('#budgrtPersonAddModal').modal('show');
            event.target.value = person.budgetPersonId = null;
        }
    }

    /**
     * @param  {} event
     * after adding a person to personal drop down, the added person is set as chose person
     */
    setAddedPerson(event) {
        this.tempPerson.budgetPersonId = event.budgetPersonId;
        document.getElementById('addPersonCloseId').click();
        this.setPersonObject(this.tempPerson);
    }

    setPersonObject(person) {
        this.setUnsavedChanges(true);
        person.budgetPerson = this.personsResultData.budgetPersonList.find(item => item.budgetPersonId == person.budgetPersonId);
        genericCalculations(person, this.lineItemData, this.currentPeriodData, this.budgetData);
    }

    setLimitKeyPressObject(personIndex, person, type) {
        this.personValidation[personIndex] =
            this.personValidation[personIndex] ? this.personValidation[personIndex] : {};
        type === 'EFFORT' ? limitKeypress(person.percentageEffort, type, this.personValidation[personIndex]) :
            limitKeypress(person.costSharingPercentage, type, this.personValidation[personIndex]);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setUnsavedChanges(flag: boolean) {
        this._budgetDataService.budgetDataChanged = flag;
        this.emitChange.emit(true);
    }

}
