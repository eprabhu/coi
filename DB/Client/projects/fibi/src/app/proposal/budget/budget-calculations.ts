import { convertToValidAmount } from '../../common/utilities/custom-utilities';
import { getDuration } from '../../common/utilities/date-utilities';

export function calculatePeriodTotalCost(period, budgetData) {
    period.totalCost = 0;
    period.totalOfTotalCost = 0;
    period.totalDirectCost = !period.totalDirectCost ? 0 : period.totalDirectCost;
    period.totalIndirectCost = !period.totalIndirectCost ? 0 : period.totalIndirectCost;
    period.subcontractCost = !period.subcontractCost ? 0 : period.subcontractCost;
    period.costSharingAmount = !period.costSharingAmount ? 0 : period.costSharingAmount;
    period.underrecoveryAmount = !period.underrecoveryAmount ? 0 : period.underrecoveryAmount;
    period.totalInKind = !period.totalInKind ? 0 : period.totalInKind;
    period.totalModifiedDirectCost = !period.totalModifiedDirectCost ? 0 : period.totalModifiedDirectCost;
    period.totalCost = parseFloat(period.totalCost) + parseFloat(period.totalDirectCost) +
        parseFloat(period.totalIndirectCost) + parseFloat(period.subcontractCost);
    period.totalInKind = budgetData.isShowCostShareAndUnderrecovery && budgetData.isShowInKind ?
        parseFloat(period.costSharingAmount) + parseFloat(period.underrecoveryAmount) : period.totalInKind;
    period.totalOfTotalCost = parseFloat(period.totalOfTotalCost) + parseFloat(period.totalCost) +
        parseFloat(period.totalInKind);
    calculateBudgetTotalCost(budgetData);
}

export function calculateBudgetTotalCost(budgetData) {
    budgetData.budgetHeader.totalCost = 0;
    budgetData.budgetHeader.totalDirectCost = 0;
    budgetData.budgetHeader.totalIndirectCost = 0;
    budgetData.budgetHeader.totalSubcontractCost = 0;
    budgetData.budgetHeader.costSharingAmount = 0;
    budgetData.budgetHeader.underrecoveryAmount = 0;
    budgetData.budgetHeader.totalInKind = 0;
    budgetData.budgetHeader.totalOfTotalCost = 0;
    budgetData.budgetHeader.totalModifiedDirectCost = 0;
    if (budgetData.budgetHeader.budgetPeriods.length > 0) {
        budgetData.budgetHeader.budgetPeriods.forEach(period => {
            budgetData.budgetHeader.totalDirectCost += parseFloat(period.totalDirectCost);
            budgetData.budgetHeader.totalIndirectCost += parseFloat(period.totalIndirectCost);
            budgetData.budgetHeader.totalSubcontractCost += parseFloat(period.totalSubcontractCost);
            budgetData.budgetHeader.costSharingAmount += parseFloat(period.costSharingAmount);
            budgetData.budgetHeader.underrecoveryAmount += parseFloat(period.underrecoveryAmount);
            budgetData.budgetHeader.totalInKind += parseFloat(period.totalInKind);
            budgetData.budgetHeader.totalModifiedDirectCost += parseFloat(period.totalModifiedDirectCost);
            budgetData.budgetHeader.totalCost += parseFloat(period.totalCost);
            budgetData.budgetHeader.totalOfTotalCost += parseFloat(period.totalOfTotalCost);
        });
    }
}

/**
 * @param  {} person:- person object
 * @param  {} object: line item object
 * @param  {} period: selected period
 * currently generic calculation performs two type of calculation for ku and fibi base.
 */
export function genericCalculations(person, object, period, budgetData) {
    const personArray = object.personsDetails;
    if ((object.costElement !== null && object.costElement !== undefined)) {
        if (object.isSystemGeneratedCostElement !== true ||
            (object.isSystemGeneratedCostElement || !budgetData.budgetHeader.isAutoCalc)) {
            let personTotalSalary: any = 0;
            if (!budgetData.isCalculationWithPredefinedSalary ) {
                calculatePersonSalary(person, object, budgetData.isCalculationWithPredefinedSalary );
                personTotalSalary = roleUpPersonSalary(personArray);
                object.lineItemCost = (personArray.length > 0 && personArray[0].budgetPersonId) ? personTotalSalary : object.lineItemCost;
            } else {
                setNewLineItemCost(object);
                if (object.costElement.ceRate.length && object.costElement.ceRate[0].rate > 0) {
                    object.lineItemCost = setFinalLineItemCost(period, object.costElement.ceRate[0].rate, object);
                    calculatePersonSalary(person, object, budgetData.isCalculationWithPredefinedSalary );
                    personTotalSalary = roleUpPersonSalary(personArray);
                    object.lineItemCost = (personTotalSalary >= 0) ? personTotalSalary : object.lineItemCost;
                }
            }
            if (object.lineItemCost && typeof(object.lineItemCost) === 'string' && object.lineItemCost !== '.') {
                object.lineItemCost = convertToValidAmount(object.lineItemCost);
            }
            calculateCostShare(object, person, budgetData.budgetHeader.isAutoCalc);
            setPersonFundRequested(person);
            const COSTSHARINGAMOUNT = roleUpCostShare(personArray);
            object.costSharingAmount = COSTSHARINGAMOUNT > 0 ? COSTSHARINGAMOUNT : object.costSharingAmount;
            object.costSharingAmount = (object.costSharingAmount > 0) ? parseFloat(object.costSharingAmount).toFixed(2) : 0;
            calculateFundRequested(object);
        }
        return object;
    }
}

/**
 * @param  {} person
 * @param  {} object
 * calculates person salary and applied person salary
 * person salary:- salary over the start date and end date
 * applied salary :- person salary * (effort%/100)
 */
export function calculatePersonSalary(person, object, isPredefinedSalary) {
    let monthlySalary = 0;
    if (object.budgetCategory.budgetCategoryTypeCode === 'P') {
        if (!isPredefinedSalary && person.budgetPerson) {
            monthlySalary = person.budgetPerson.durationCost;
        } else if (isPredefinedSalary && person.budgetPerson) {
            monthlySalary = object.costElement.ceRate[0].rate;
        }
        if (person.startDate && person.budgetPerson && person.endDate) {
            const DURATION = getDuration(person.startDate, person.endDate);
            person.endDate = new Date(person.endDate);
            const noOfDays = new Date((person.endDate).getFullYear(), (person.endDate).getMonth() + 1, 0).getDate();
            person.salary = (((DURATION.durInYears * 12 + DURATION.durInMonths) * monthlySalary) +
                (DURATION.durInDays * (monthlySalary / noOfDays)));
            person.salary = parseFloat(person.salary).toFixed(2);
            if (person.percentageEffort > 0) {
                person.salaryRequested = (person.salary * (person.percentageEffort / 100));
                person.salaryRequested = parseFloat(person.salaryRequested).toFixed(2);
            } else {
                person.salaryRequested = 0;
            }
        } else {
            person.salaryRequested = 0;
        }
    }
}

export function roleUpPersonSalary(personArray) {
    let personTotalSalary = 0;
    if (personArray.length > 0 && Object.getOwnPropertyNames(personArray[0]).length > 2) {
        personArray.forEach(element => {
            if (element.salaryRequested) {
                personTotalSalary = personTotalSalary + parseFloat(element.salaryRequested);
            }
        });
    }
    return (personTotalSalary).toFixed(2);
}

/**
* @param  {} object
* for personal cost elements by default a rate value is given, sts that as default line item cost
*/
export function setNewLineItemCost(object) {
    if (object.costElement.ceRate.length > 0 && object.costElement.ceRate[0].rate > 0 &&
        object.budgetCategory.budgetCategoryTypeCode === 'P') {
        object.lineItemCost = object.costElement.ceRate[0].rate;
        object.ceBaseRate = object.costElement.ceRate[0].rate;
    } else {
        object.ceBaseRate = object.lineItemCost;
    }
}

export function setFinalLineItemCost(period, monthlySalary, object) {
    if (object.budgetCategory.budgetCategoryTypeCode === 'P' && monthlySalary > 0) {
        const DURATION = getDuration(period.startDate, period.endDate);
        period.endDate = new Date(period.endDate);
        const noOfDays = new Date((period.endDate).getFullYear(), (period.endDate).getMonth() + 1, 0).getDate();
        const FINAL_COST =  (((DURATION.durInYears * 12 + DURATION.durInMonths) * monthlySalary) +
            (DURATION.durInDays * (monthlySalary / noOfDays)));
        return FINAL_COST.toFixed(2);
    } else {
        return object.lineItemCost;
    }
}

export function calculateCostShare(object, person, isAutoCalc) {
    if (!object.isSystemGeneratedCostElement || (object.isSystemGeneratedCostElement && !isAutoCalc)) {
        object.costSharingAmount = null;
        if (object.budgetCategory.budgetCategoryTypeCode === 'P' && person.salaryRequested > 0) {
            person.costSharingAmount = person.salaryRequested * (person.costSharingPercentage / 100);
            person.costSharingAmount = (person.costSharingPercentage > 0) ? parseFloat(person.costSharingAmount).toFixed(2) : 0;
            object.costSharingPercentage = null;
        } else if (object.lineItemCost > 0 && object.costSharingPercentage > 0) {
            object.costSharingAmount = (object.lineItemCost * parseFloat(object.costSharingPercentage)) / 100;
        }
    }
    object.costSharingAmount = (object.costSharingAmount > 0) ? parseFloat(object.costSharingAmount).toFixed(2) : null;
}

export function roleUpCostShare(personArray) {
    let costSharingAmount = 0;
    personArray.forEach(element => {
        costSharingAmount = costSharingAmount + parseFloat(element.costSharingAmount);
    });
    return costSharingAmount;
}

export function setPersonFundRequested(person) {
    if (person) {
        person.salaryRequested = person.salaryRequested === null ? 0 : person.salaryRequested;
        person.costSharingAmount = person.costSharingAmount === null || !person.costSharingAmount ? 0 : person.costSharingAmount;
        person.sponsorRequestedAmount = parseFloat(person.salaryRequested) - parseFloat(person.costSharingAmount);
        person.sponsorRequestedAmount = parseFloat(person.sponsorRequestedAmount).toFixed(2);
    }
}

export function calculateFundRequested(object) {
    object.sponsorRequestedAmount = null;
    if (object.costSharingAmount && object.lineItemCost) {
        object.lineItemCost = object.lineItemCost ? parseFloat(object.lineItemCost) : object.lineItemCost;
        object.costSharingAmount = object.costSharingAmount ? parseFloat(object.costSharingAmount) : object.costSharingAmount;
        object.sponsorRequestedAmount = object.lineItemCost - object.costSharingAmount;
        object.sponsorRequestedAmount =
            object.sponsorRequestedAmount ? parseFloat(object.sponsorRequestedAmount).toFixed(2) : object.sponsorRequestedAmount;
    } else {
        object.sponsorRequestedAmount = object.lineItemCost;
    }
}

export function reCalculatePersonsalary(budgetData, excludePeriodNo) {
    budgetData.budgetHeader.budgetPeriods.forEach(period => {
        if (period !== excludePeriodNo) {
            periodWiseSalaryCalculation(period, budgetData);
        }
    });
    return budgetData;
}

export function periodWiseSalaryCalculation(period, budgetData) {
    period.budgetDetails.forEach(lineItem => {
        lineItemWiseSalaryCalculation(lineItem, period, budgetData);
    });
    return period;
}

export function lineItemWiseSalaryCalculation(lineItem, period, budgetData) {
    if (lineItem.budgetCategory.budgetCategoryTypeCode === 'P' && !lineItem.isSystemGeneratedCostElement) {
        if (lineItem.personsDetails && lineItem.personsDetails.length > 0) {
            lineItem.personsDetails.forEach(person => {
                lineItem = genericCalculations(person, lineItem, period, budgetData);
            });
        } else {
            lineItem = genericCalculations({}, lineItem, period, budgetData);
        }
    }
    return lineItem;
}
