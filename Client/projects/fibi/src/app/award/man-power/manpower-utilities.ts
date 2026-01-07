import { compareDates, getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';

/**
 * @param  {} list
 * @param  {} value
 * @param  {} manpowerResourceId
 * For calculating the sum for Initial committed cost
 */
export function calculateArraySum(list: any, value: string, manpowerResourceId: number) {
  let result = 0;
  if (list.length) {
    list.forEach(element => {
      if (element.manpowerResourceId !== manpowerResourceId) {
        result = result + element[value];
      }
    });
  }
  return result;
}
/**
 * @param  {any} resourceList
 * @param  {number} budgetAmount
 * @param  {number} sapCommittedAmount
 * to calculate uncommitted amount for a resource
 */
export function calculateUncommittedAmount(resourceList: any, budgetAmount: number, sapCommittedAmount: number) {
  let initialCommitted: any = [], initialSum = 0;
  if (resourceList.length) {
    initialCommitted = resourceList.filter(resource => resource.committedCost === null &&
      (!resource.workdayPositionRequisition || resource.workdayPositionRequisition &&
      !['Filled', 'Closed', 'Frozen'].includes(resource.workdayPositionRequisition.jobRequisitionStatus)));
    initialSum = calculateArraySum(initialCommitted, 'plannedSalary', null);
  }
  return budgetAmount - (sapCommittedAmount + initialSum);
}
/**
 * @param  {} manpowerResourceId
 * @param  {} updatedData
 * for updating the resource from the list of added resources
 */
export function updateEditedManpowerResource(manpowerCategory: any, index: number, updatedData: any) {
  manpowerCategory.awardManpowerResource.splice(index, 1, updatedData);
}
/**
 * @param  {} updatedDate
 * to push data to the resource list
 */
export function addResourceToList(manpowerCategory: any, updatedDate: any) {
  manpowerCategory.awardManpowerResource.push(updatedDate);
}
/**
 * @param  {any} resourceList
 * @param  {any} newResource
 * @param  {any} resourceIdType
 * Checks if a resource is already added within same date period as that in the list.
 * Returns true if the resource overlap occurs and false else where.
 * cases: if the resource added has same start date or end date or has dates between the start date and end date
 * from the resource list and the new person
 * resourceIdType select the which object to iterate from
 */
export function personDuplicationCheck(categoryList: any, newResource: any, resourceIdType: string) {
  let resourceArray: any = [];
  categoryList.forEach(category => {
    const duplication = personDuplication(category.awardManpowerResource, newResource, resourceIdType);
    resourceArray = resourceArray.concat(duplication);
  });
  let value = {costAllocation: 0};
  if (resourceArray.length) {
    value = resourceArray.reduce(function (previousValue, currentValue) {
      return {'costAllocation': previousValue.costAllocation + currentValue.costAllocation};
    });
  }
  return (value.costAllocation + parseFloat(newResource.costAllocation)) > 100 ? true : false;
}
/**
 * @param  {any} resourceList
 * @param  {any} newResource
 * Checks if a resource is already added within same date period as that in the list.
 * Returns true if the resource overlap occurs and false else where.
 * cases: if the resource added has same start date or end date or has dates between the start date and end date
 * from the resource list and the new person
 */
function personDuplication(resourceList: any, newResource: any, resourceIdType: string) {
  return resourceList.filter(resource => resource.manpowerResourceId !== newResource.manpowerResourceId &&
    resource[resourceIdType] && newResource[resourceIdType] &&
    resource[resourceIdType] === newResource[resourceIdType] && resource.positionId &&
    compareDatesForOverlap(resource.chargeStartDate ? resource.chargeStartDate : resource.planStartDate,
      resource.chargeEndDate ? resource.chargeEndDate : resource.planEndDate,
      newResource.chargeStartDate ? newResource.chargeStartDate : newResource.planStartDate,
      newResource.chargeEndDate ? newResource.chargeEndDate : newResource.planEndDate));
}

export function compareDatesForOverlap(startDate: any, endDate: any, newStartDate: any, newEndDate: any) {
    const START_DATE = getDateObjectFromTimeStamp(startDate);
    const END_DATE = getDateObjectFromTimeStamp(endDate);
  return startDate && endDate && newStartDate && newEndDate && (
    (compareDates(START_DATE, newStartDate) !== 1 && compareDates(END_DATE, newStartDate) !== -1) ||
    (compareDates(START_DATE, newEndDate) !== 1 && compareDates(END_DATE, newEndDate) !== -1) ||
    (compareDates(START_DATE, newStartDate) !== -1 && compareDates(START_DATE, newEndDate) !== 1) ||
    (compareDates(END_DATE, newStartDate) !== -1 && compareDates(END_DATE, newEndDate) !== 1));
}
/**
 * @param  {any} field
 * function to check if the input is whole number
 */
export function inputWholeNumbers(field: any) {
  const PATTERN = /^\d+$/;
  return (!field || !PATTERN.test(field)) ? 'Enter the field with value as whole numbers.' : null;
}
/**
 * @param  {any=[]} array
 * for removing the duplications from the resource list. This functions ignores the unassigned resources
 */
function removeIfDuplicateExists(array: any = []) {
  return array.reduce((unique, o) => {
    if (!unique.some(obj => obj.positionId && o.positionId && obj.positionId === o.positionId)) {
      unique.push(o);
    }
    return unique;
  }, []);
}
/**
 * @param  {any} approvedHeadCount
 * @param  {any=[]} resourceList
 * for validating the actual head count and approved head count in staff category
 * checks if resources with distinct position ids are equal or less than approved head count
 * person id - 999999999100 for avoiding this person from the count as it comes from migration
 */
export function validateApproverHeadCount(approvedHeadCount: any, resourceList: any = [], isCheckingFromList = false) {
  resourceList = filterManpowerHeadCount(resourceList);
  if (compareResourceLength(isCheckingFromList, approvedHeadCount, resourceList)) {
    return false;
  } else {
    const resourceWithoutDuplication = removeIfDuplicateExists(resourceList);
    return resourceWithoutDuplication.length !== resourceList.length &&
    compareResourceLength(isCheckingFromList, approvedHeadCount, resourceWithoutDuplication) ? false : true;
  }
}

function filterManpowerHeadCount(resourceList: any = []): any {
  return resourceList.filter(resource => filterConditionsForHeadCount(resource));
}

function filterConditionsForHeadCount(resource: any = {}): boolean {
  const startDate = getDateObjectFromTimeStamp(resource.chargeStartDate ? resource.chargeStartDate : resource.planStartDate);
  const endDate = getDateObjectFromTimeStamp(resource.chargeEndDate ? resource.chargeEndDate : resource.planEndDate);
  return resource.personId !== '999999999100' && !['5', '8'].includes(resource.manpowerPositionStatus.positionStatusCode)
  && (compareDates(startDate, getSystemDate()) !== 1 && compareDates(endDate, getSystemDate()) !== -1);
}

/**
 * @param  {boolean} isCheckingFromList
 * @param  {any} approvedHeadCount
 * @param  {any=[]} resourceArray
 * Function compares the resource length according to the boolean value which represents place
 * from which it is called list or add resource modal
 */
function compareResourceLength(isCheckingFromList: boolean, approvedHeadCount: any, resourceArray: any = []) {
  return isCheckingFromList ? (approvedHeadCount >= resourceArray.length) : (approvedHeadCount > resourceArray.length);
}
/**
 * @param  {} sequence
 * @param  {string} resourceUniqueId
 * for splitting the sequence number form the resource unique id and comparing it with the award sequence number
 */
export function compareSequenceNumber(sequence, resourceUniqueId: string) {
  const sequenceNumber = resourceUniqueId ? resourceUniqueId.split('_')[1] : null;
  return sequence == sequenceNumber;
}
/**
 * @param  {any} date1
 * @param  {any} date2
 * for calculating the number of days between 2 dates
 */
export function getNumberOfDays(date1: any, date2: any) {
  return (date1 - date2) / (1000 * 60 * 60 * 24);
}

export function getSystemDate() {
    return new Date().setHours(0, 0, 0, 0);
}
