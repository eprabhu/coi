import { validatePercentage, inputRestrictionForAmountField } from '../../common/utilities/custom-utilities';
import { compareDatesWithoutTimeZone, getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';

export function validatePersonDetails(personArray, period, personValidation) {
  personValidation = [];
  personArray.forEach((person, index) => {
    personValidation[index] = {};
    validatePercentageFields(person, personValidation[index]);
    if (person.budgetPersonId === undefined || person.budgetPersonId === null || person.budgetPersonId === 'null') {
      personValidation[index].personMsg = 'Select a person';
    }
    if (!person.startDate || person.startDate === null) {
      personValidation[index].stDateMsg = 'Select a start date';
    } else if (person.startDate < period.startDate) {
      personValidation[index].stDateMsg = 'Select a start date equal to or after period start date';
    } else if (person.startDate > period.endDate) {
      personValidation[index].endDateMsg = 'Select a start date equal to or before period end date';
    }
    if (!person.endDate || person.endDate === null) {
      personValidation[index].endDateMsg = 'Select an end date';
    } else if (person.endDate > period.endDate) {
      personValidation[index].endDateMsg = 'Select an end date equal to or before period end date';
    } else if (person.endDate < period.startDate) {
      personValidation[index].endDateMsg = 'Select an end date equal to or after period start date';
    } else if (person.endDate < person.startDate) {
      personValidation[index].endDateMsg = 'Select an end date after starting date';
    }
  });
  return personValidation;
}

export function validateBudgetDetail(budgetDetail, isInvalidLineItem) {
  const pattern = /^(?:[0-9][0-9]{0,3}(?:\.\d{0,2})?|9999|9999.00|9999.99)$/;
  isInvalidLineItem = {};
  if (budgetDetail.costElement === null || budgetDetail.costElement === undefined ||
    Object.keys(budgetDetail.costElement).length === 0) {
    isInvalidLineItem.costElement = 'Please select a cost element.';
  }
  if (budgetDetail.lineItemCost === null || budgetDetail.lineItemCost === 'NaN' ||
   (!budgetDetail.lineItemCost && !budgetDetail.isSystemGeneratedCostElement && budgetDetail.lineItemCost !== 0 )) {
    isInvalidLineItem.cost = 'Please fill line item cost.';
  }
  if (parseFloat(budgetDetail.quantity) > 0 && !pattern.test(budgetDetail.quantity)) {
    isInvalidLineItem.quantityMsg = 'Enter quantity value as 4 digits up to 2 decimal places.';
  }
  if (budgetDetail.lineItemCost) {
    inputDigitRestriction(budgetDetail.lineItemCost, isInvalidLineItem);
  }
  limitKeypress(budgetDetail.costSharingPercentage, 'COSTSHARE', isInvalidLineItem);
  return isInvalidLineItem;
}

export function inputDigitRestriction(field: any, isInvalidLineItem) {
  const AMOUNT_PATTERN_VALIDATION = inputRestrictionForAmountField(field);
  if (isInvalidLineItem && isInvalidLineItem.cost) {
    delete isInvalidLineItem.cost;
  }
  if (AMOUNT_PATTERN_VALIDATION) {
    isInvalidLineItem.cost = AMOUNT_PATTERN_VALIDATION;
  }
  return isInvalidLineItem;
}

export function validatePercentageFields(person, personValidation) {
  person.percentageEffort === undefined || person.percentageEffort === null
    ? (personValidation.effortMsg = 'Enter percentage effort')
    : limitKeypress(person.percentageEffort, 'EFFORT', personValidation);
  if (person.costSharingPercentage) {
    limitKeypress(person.costSharingPercentage, 'PERSONCOSTSHARE', personValidation);
  }
}

export function limitKeypress(value, type, validationObject) {
  const ISVALIDMSG = validatePercentage(value);
  validationObject = setValidationMessage(validationObject, type, ISVALIDMSG);
  return validationObject;
}

export function setValidationMessage(validationObject, type, ISVALIDMSG) {
  if (type === 'EFFORT') {
    ISVALIDMSG ? validationObject.effortMsg = ISVALIDMSG : delete validationObject.effortMsg;
  } else if (type === 'PERSONCOSTSHARE') {
    ISVALIDMSG ? validationObject.personChargedMsg = ISVALIDMSG : delete validationObject.personChargedMsg;
  } else if (type === 'COSTSHARE') {
    ISVALIDMSG ? validationObject.costShareMsg = ISVALIDMSG : delete validationObject.costShareMsg;
  }
  return validationObject;
}

/**
 * @param  {} period
 * validates the period data when clicks common save button
 */
export function periodDataValidation(period, lineItemValidations, isAutoCalc) {
  let isInvalidLineItem: any = {};
  const pattern = /^(?:[0-9][0-9]{0,3}(?:\.\d{0,2})?|9999|9999.00|9999.99)$/;
  period.budgetDetails.forEach((element, index) => {
    if (!element.isSystemGeneratedCostElement || (element.isSystemGeneratedCostElement && !isAutoCalc) ) {
      isInvalidLineItem = validateBudgetDetail(element, isInvalidLineItem);
      if (element.personsDetails && element.personsDetails.length) {
        isInvalidLineItem.personValidation = [];
        const PERSONVALIDATIONS = validatePersonDetails(element.personsDetails, period, isInvalidLineItem.personValidation);
        PERSONVALIDATIONS.every(item => checkObjectHasValues(item)) ?
          delete isInvalidLineItem.personValidation : isInvalidLineItem.personValidation = PERSONVALIDATIONS;
      }
      lineItemValidations[index] = isInvalidLineItem;
    }
  });
  return lineItemValidations;
}

/**
* @param  {any} event
* restricts inputs other than numbers
*/
export function inputRestriction(event: any) {
  const PATTERN = /[0-9\+\-\/\.\ ]/;
  if (!PATTERN.test(String.fromCharCode(event.charCode))) {
    event.preventDefault();
  }
}

export function checkObjectHasValues(item) {
  return Object.values(item).length === 0 ? true : false;
}

export function inputRestrictionForQuantityField(field: any) {
  const PATTERN = /^(?:[0-9][0-9]{0,3}(?:\.\d{0,2})?|9999|9999.00|9999.99)$/;
  return (field > 0 && !PATTERN.test(field)) ? 'Enter quantity value as 4 digits up to 2 decimal places.' : null;
}

export function validateLineItem(lineItemObj, isInvalidLineItem) {
  isInvalidLineItem = {};
  const costValiadation = [];
  if (!lineItemObj.costElementCode) {
    isInvalidLineItem.message = 'Please select a cost element.';
  }
   const quantityMessage = inputRestrictionForQuantityField(lineItemObj.quantity);
  if ( quantityMessage) {
      isInvalidLineItem.quantityMsg = quantityMessage;
  }
  lineItemObj.yearCosts.forEach((cost, index) => {
    if (cost) {
          costValiadation[index] = inputRestrictionForAmountField(cost);
          }
  });
  const COST_VALID = costValiadation.every(item => item == null) ? true : false;
  if (!COST_VALID) {
    isInvalidLineItem.cost = costValiadation;
  }
  return isInvalidLineItem;
}


/**
 * this function will return true if any one of the period dates is outside proposal
 * start and end dates if all the periods dates are within or equal to proposal dates 
 * it will return false
 * @param budgetPeriods
 * @param startDate
 * @param endDate
 */

 export function checkPeriodDatesOutside(budgetPeriods, startDate, endDate): any {
  return !!budgetPeriods.find(element =>
      (compareDatesWithoutTimeZone(element.startDate, getDateObjectFromTimeStamp(startDate)) === -1  ||
      compareDatesWithoutTimeZone(element.startDate, getDateObjectFromTimeStamp(endDate)) === 1 ||
      compareDatesWithoutTimeZone(element.endDate, getDateObjectFromTimeStamp(endDate)) === 1));
}

/*
* this function will return true if @param date is overlapped with other period dates,
* otherwise return false.
* @param budgetPeriods - periods array
* @param date
* @param periodIndex - period number of given date
*/
export function checkDateOverlapped(budgetPeriods, periodIndex, date): any {
  return !!budgetPeriods.find((element, index) =>
          ((compareDatesWithoutTimeZone(element.startDate, date) === 0 || compareDatesWithoutTimeZone(element.startDate, date) === -1) &&
          (compareDatesWithoutTimeZone(element.endDate, date) === 0 || compareDatesWithoutTimeZone(element.endDate, date) === 1) &&
          (periodIndex - 1) !== index));
}


/*
* this function will check whether given periods has either overlapped  dates or dates that are outside
* the proposal start and end dates, to display the error toast and invalid period
* validation in periods and total if both are not true
* then if any error toast existing will be removed
* @param budgetPeriods - periods array
* @param date
* @param periodIndex - period number of given date
*/
export function toggleErrorToast(budgetData, proposalData): void {
  if (checkIfDatesOverlapped(budgetData) ||
  checkPeriodDatesOutside(budgetData.budgetHeader.budgetPeriods, (proposalData.proposalStartDate),
  (proposalData.proposalEndDate))) {
          proposalData.$isShowDateWarning.next(true);
          proposalData.$isPeriodOverlapped.next(true);
  } else {
          proposalData.$isShowDateWarning.next(false);
          proposalData.$isPeriodOverlapped.next(false);
  }
}

/*
* this function will loop through periods array and pass each
* period start and end date to checkDateOverlapped
* function, if start date itself overlapped then true will be returned,
* else end date will be sent, if this date gets overlapped then also true will be returned
* if none of the period dates is overlapped, then false will be returned.
* @param budgetData - budget data.
*/
export function checkIfDatesOverlapped(budgetData): any {
  return !!budgetData.budgetHeader.budgetPeriods.find((periods, index) =>
     (checkDateOverlapped(budgetData.budgetHeader.budgetPeriods, periods.budgetPeriod, periods.startDate) ||
      checkDateOverlapped(budgetData.budgetHeader.budgetPeriods, periods.budgetPeriod, periods.endDate)));
}

/**
* compare proposal start and end dates with
* budget dates and set proposal date change variable to
* INC - if proposal dates are greater than budget dates
* DEC - if proposal dates are lesser than budget dates
* @param dateObject
* @param proposalData
*/
export function setProposalDateChange(dateObject, proposalData): void {
  if ((compareDatesWithoutTimeZone(dateObject.proposalStartDate, dateObject.budgetStartDate) === 1) ||
      (compareDatesWithoutTimeZone(dateObject.proposalEndDate, dateObject.budgetEndDate) === 1)) {
          proposalData.proposalDateChangeType = 'INC';
  } else if ((compareDatesWithoutTimeZone(dateObject.proposalStartDate, dateObject.budgetStartDate) === -1) ||
              (compareDatesWithoutTimeZone(dateObject.proposalEndDate, dateObject.budgetEndDate) === -1)) {
          proposalData.proposalDateChangeType = 'DEC';
  }
}

export function checkDatesAreNotEqual(proposalData, budgetStartDate, budgetEndDate): boolean {
  if ((compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(proposalData.proposalStartDate), budgetStartDate) !== 0) ||
      (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(proposalData.proposalEndDate), budgetEndDate) !== 0)) {
      return true;
  } else {
      return false;
  }
}

/**Method to validate budget total amount - budget total cost should not exceed maximum of 999,999,999.99 */
export function validateBudgetTotalCost(totalCost): boolean {
  const PATTERN = /^[+-]?(?:[0-9][0-9]{0,8}(?:\.\d{0,2})?|999999999|999999999.00|999999999.99)$/;
  return (totalCost > 0 && !PATTERN.test(totalCost)) ? true : false;
}

