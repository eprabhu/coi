import { Component, Input, OnDestroy, OnChanges, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { BudgetDataService } from '../../services/budget-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { genericCalculations } from '../budget-calculations';
import { inputRestriction, inputDigitRestriction, limitKeypress } from '../budget-validations';
import { CommonService } from '../../../common/services/common.service';
import { PersonnelService } from '../personnel/personnel.service';
import { getEndPointOptionsForCostElements } from '../../../common/services/end-point.config';

declare var $: any;

@Component({
    selector: '[app-line-items]',
    templateUrl: './line-items.component.html',
    styleUrls: ['./line-items.component.css']
})

export class LineItemsComponent implements OnDestroy, OnChanges {

    @Input() lineItemData: any = {};
    @Input() isInvalidLineItem: any = {};
    @Input() currentPeriodData: any = [];
    @Input() rowType: string = null;
    @Input() helpText: any = {};
    @Output() isLineItemActions = new EventEmitter();
    @Output() emitChange = new EventEmitter();
    budgetData: any = {};
    clearField;
    endpointSearchOptions: any;
    $subscriptions: Subscription[] = [];
    systemGeneratedCostCodes = [];
    genericCalculations = genericCalculations;
    inputRestriction = inputRestriction;
    inputDigitRestriction = inputDigitRestriction;
    limitKeypress = limitKeypress;
    personValidation: any[];
    personsResultData: any = {};

    constructor(
        public _budgetDataService: BudgetDataService,
        public _commonService: CommonService,
        private _personnelService: PersonnelService
    ) { }

    ngOnChanges() {
        this.subscribeBudgetData();
        this.subscribePersonData();
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? data : {};
            if (this.budgetData) {
                this.onInit();
            }
        }));
    }

    subscribePersonData() {
        this.$subscriptions.push(this._budgetDataService.personData.subscribe((data: any) => {
            this.personsResultData = data ? data : {};
        }));
    }

    onInit() {
        if (this.budgetData.isSysGeneratedCostElementEnabled) {
            this.systemGeneratedCostCodes.push(this.budgetData.sysGeneratedCostElements[0].budgetCategoryCode);
            this.systemGeneratedCostCodes.push(500); // for Budget Category Total - Cost element duplication issue
            this.endpointSearchOptions =
                getEndPointOptionsForCostElements('findCostElementsByParams', { 'budgetCategoryCodes': this.systemGeneratedCostCodes });
        } else {
            this.endpointSearchOptions = getEndPointOptionsForCostElements('findCostElement');
        }
        this.endpointSearchOptions.defaultValue = this.lineItemData.costElement ? this.lineItemData.costElement.costElementDetail : '';
    }

    /**
   * @param  {} selectedResult
   * @param  {} period
   * sets selected cost element.
   * personal items focus is set next to %effort
   * non personal items focus is set next to description
   */
    costElementChange(selectedResult) {
        if (selectedResult !== null) {
            this.lineItemData.costElement = selectedResult;
            this.lineItemData.costElementCode = selectedResult.costElement;
            this.lineItemData.budgetCategory = selectedResult.budgetCategory;
            this.lineItemData.budgetCategoryCode = selectedResult.budgetCategoryCode;
            this.setUnsavedChanges(true);
            this.setFocusField();
            this.setPersonData();
            genericCalculations(this.lineItemData.personsDetails[0], this.lineItemData, this.currentPeriodData, this.budgetData);
            this.isInvalidLineItem.costElement = null;
        } else {
            !this.lineItemData.budgetDetailId ? this.lineItemActions('CLEAR_ADD') : this.checkPersonExist();
        }
    }

    setFocusField() {
        if (this.lineItemData.budgetCategory.budgetCategoryTypeCode === 'P') {
            setTimeout(() => {
                !this.lineItemData.personsDetails[0].budgetPersonId ?
                    document.getElementById('personNameId').focus() : document.getElementById('personEffortId').focus();
            });
        } else {
            setTimeout(() => {
                const ID = this.lineItemData.budgetDetailId ?
                    'lineItemDescriptionID' + this.lineItemData.budgetDetailId : 'lineItemDescriptionID';
                document.getElementById(ID).focus();
            });
        }
    }

    setPersonData() {
        if (this.lineItemData.budgetCategory.budgetCategoryTypeCode === 'P') {
            this.lineItemData.personsDetails = [{ startDate: this.currentPeriodData.startDate, endDate: this.currentPeriodData.endDate }];
            this.setTbnPerson();
        } else {
            this.lineItemData.personsDetails = [];
        }
    }

    /**
    * @param  {} object
    * @param  {} person
    * If tbn is attached with cost elemnent while selecting then saves the tbn person to person list and sets the person to the tbn
    */
    setTbnPerson() {
        const PERSON = this.getPerson();
        if (PERSON) {
            this.lineItemData.personsDetails[0].budgetPersonId = PERSON.budgetPersonId;
            this.lineItemData.personsDetails[0].budgetPerson = PERSON;
        } else {
            if (this.lineItemData.costElement.tbnId !== null &&
                this.lineItemData.budgetCategory.budgetCategoryTypeCode === 'P' && !this.lineItemData.personsDetails[0].budgetPersonId) {
                this.$subscriptions.push(this._personnelService.addOrUpdatePerson(this.setPersonRequestObject())
                    .subscribe((data: any) => {
                        if (data.budgetPersonId) {
                            this.lineItemData.personsDetails[0].budgetPersonId = data.budgetPersonId;
                            this.lineItemData.personsDetails[0].budgetPerson = data;
                            genericCalculations(this.lineItemData.personsDetails[0], this.lineItemData, this.currentPeriodData, this.budgetData);
                            this.personsResultData.budgetPersonList.push(data);
                            this._budgetDataService.setBudgetPersonData(this.personsResultData);
                        }
                    }));
            }
        }
    }

    getPerson() {
        return this.personsResultData.budgetPersonList.find(budgetPerson =>
            budgetPerson.personType === 'T' &&
            budgetPerson.tbnId == this.lineItemData.costElement.tbnId &&
            budgetPerson.jobCodeType == this.lineItemData.costElement.tbnPerson.jobCode &&
            budgetPerson.appointmentTypeCode === '6');
    }

    setPersonRequestObject() {
        const PERSONDETAILS: any = {};
        PERSONDETAILS.tbnPerson = this.lineItemData.costElement.tbnPerson;
        PERSONDETAILS.appointmentTypeCode = '6';
        PERSONDETAILS.personType = 'T';
        PERSONDETAILS.jobCodeType = this.lineItemData.costElement.tbnPerson.jobCode;
        PERSONDETAILS.tbnId = this.lineItemData.costElement.tbnId;
        PERSONDETAILS.appointmentType = this.personsResultData.appointmentType.
            find(item => item.code === PERSONDETAILS.appointmentTypeCode);
        if (!PERSONDETAILS.jobCode) {
            PERSONDETAILS.jobCode = this.personsResultData.jobCode.find(item => item.jobCode === PERSONDETAILS.jobCodeType);
            PERSONDETAILS.calculationBase = PERSONDETAILS.jobCode.monthSalary;
        }
        PERSONDETAILS.updateUser = this._commonService.getCurrentUserDetail('userName');
        PERSONDETAILS.budgetId = this.budgetData.budgetHeader.budgetId;
        return { budgetPerson: PERSONDETAILS };
    }

    lineItemActions(type) {
        const DATA = {
            lineItemData: this.lineItemData,
            popUpType: type
        };
        this.isLineItemActions.emit(DATA);
    }

    checkPersonExist() {
        if (!this.lineItemData.personsDetails.length) {
            this.lineItemActions('CLEAR_EDIT');
        } else {
            this.endpointSearchOptions = Object.assign({}, this.endpointSearchOptions);
            this.endpointSearchOptions.defaultValue = this.lineItemData.costElement.costElementDetail;
            $('#costElementChangeWarnModal').modal('show');
        }
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
            budgetPerson: null,
            startDate: this.currentPeriodData.startDate,
            endDate: this.currentPeriodData.endDate
        };
        if (this.lineItemData.costElement.tbnId) {
            PERSON.budgetPersonId = this.getTbnPerson();
            PERSON.budgetPerson = this.getTbnPerson().budgetPersonId;
            this.lineItemData.personsDetails.push(PERSON);
            genericCalculations(PERSON, this.lineItemData, this.currentPeriodData, this.budgetData);
        } else {
            this.lineItemData.personsDetails.push(PERSON);
        }
    }

    getTbnPerson() {
        return this.personsResultData.budgetPersonList.
            find(item => item.tbnId === this.lineItemData.costElement.tbnId &&
                item.jobCodeType === this.lineItemData.costElement.tbnPerson.jobCode);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setUnsavedChanges(flag: boolean) {
        this._budgetDataService.budgetDataChanged = flag;
        this.emitChange.emit(true);
    }

}
