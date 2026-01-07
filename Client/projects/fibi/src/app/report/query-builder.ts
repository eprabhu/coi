import { DatePipe } from '@angular/common';
import { DEFAULT_DATE_FORMAT } from '../app-constants';
import { parseDateWithoutTimestamp } from '../common/utilities/date-utilities';

/**
 * Dynamic query builder for reporting purposes
 * Written by Mahesh SReenath V M - last edited 1/11/2019
 * for a given filters(search criteria), fields(columns), values entered on filters and module code
 * return a dynamic database query
 */

/**
 * @param  {any[]} filter
 * @param  {any[]} fields
 * @param  {any[]} values
 * @param  {number} moduleCode
 * return the query as output
 */
export function buildQuery(filter: any[], fields: any[], values: any[], reportType: any = []) {
    const selectedFields = setColumnFields(fields);
    let [conditions, joinWhereClause, reportCriteria] = setCriteria(filter, values);
    conditions = removeTrailingAND(conditions);
    joinWhereClause = joinWhereClause ? 'AND' + addSpace() + removeTrailingAND(joinWhereClause) : '';
    const reportView = setTableName(reportType);
    return { selectedFields, conditions, reportView, joinWhereClause, reportCriteria };
}
/**
 * returns an empty space this function written because it helps readability
 */
function addSpace() {
    return ' ';
}

function addPercentage(value) {
    return '%' + value + '%';
}

function addBraces(value) {
    return '(' + value + ')';
}
function convertToUpperCase(value) {
    return 'UPPER' + addBraces(value);
}

function addQuotation(value) {
    return '"' + value + '"';
}

function addSingleQuotes(value) {
    // tslint:disable-next-line: quotemark
    value = value.toString().replace(/'/g, "\\'");
    return "'" + value + "'";
}

function removeTrailingComma(value) {
    return value.slice(0, value.length - 1);
}
function removeTrailingAND(value) {
    value = value.replace(/AND([^AND]*)$/, '$1');
    return value;
}
function removeTrailingOR(value) {
    value = value.replace(/OR([^OR]*)$/, '$1');
    return value;
}
function removeTrailingLowerCaseOR(value) {
    value = value.replace(/or([^or]*)$/, '$1');
    return value;
}

function removeTrailingLowerCaseComma(value) {
    value = value.replace(/,([^,]*)$/, '$1');
    return value;
}
/**
 * @param  {any[]} fields
 * checks for user defined fields if its empty return * to represent all columns in table
 */
function setColumnFields(fields: any[]) {
    return fields.length === 0 ? '*' : getColumnFields(fields);
}
/**
 * @param  {any[]} fields
 * returns a comma separated string of fields
 */
function getColumnFields(fields: any[]) {
    let selectedColumns = '';
    fields.forEach(column => selectedColumns += addSpace() + column.columnName + ',');
    selectedColumns = removeTrailingComma(selectedColumns);
    return selectedColumns;
}
/**
 * @param  {number} moduleCode
 * return corresponding table for a given module code
 */
function setTableName(reportType: any) {
    return getTableName(reportType);
}

function getTableName(reportType: any = {}) {
    return reportType.viewName;
}
/**
 * @param  {any[]} filters
 * @param  {any} values
 * checks if there is any filter added by user if no return an empty string
 */
function setCriteria(filters: any[], values: any) {
    return filters.length > 0 ? getCriteria(filters, values) : ['', '', ''];
}
/**
 * @param  {any[]} filters
 * @param  {any} values
 * return a string includes all the the Where conditions
 * the filter is only added if corresponding filter have user entered values in them
 */
function getCriteria(filters: any[], values: any) {
    let criteria = '';
    let innerClause = '';
    let selectedCriteria = '';
    const queryCriteria = [];
    const KEYS_IN_VALUE = Object.keys(values);
    filters.forEach(filter => {
        if (findInValues(KEYS_IN_VALUE, filter.columnName)) {
            switch (filter.queryType) {
                case 'IN':
                    let dataIN = getCriteriaForIN(filter, values[filter.columnName]);
                    dataIN = dataIN === '' ? '' : dataIN + addSpace() + 'AND' + addSpace();
                    filter.innerJoin === 'Y' ? innerClause += dataIN : criteria += dataIN;
                    selectedCriteria = getSelectedCriteriaForIN(filter, values[filter.columnName]);
                    selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
                    break;
                case 'BETWEEN':
                    let dataBETWEEN = getCriteriaForBETWEEN(filter, values[filter.columnName]);
                    dataBETWEEN = dataBETWEEN === '' ? '' : dataBETWEEN + addSpace() + 'AND' + addSpace();
                    filter.innerJoin === 'Y' ? innerClause += dataBETWEEN : criteria += dataBETWEEN;
                    selectedCriteria = getSelectedCriteriaForBETWEEN(filter, values[filter.columnName]);
                    selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
                    break;
                case 'BETWEEN_NUMBER':
                    let dataBETWEEN_NUMBER = getCriteriaForBETWEEN_NUMBER(filter, values[filter.columnName]);
                    dataBETWEEN_NUMBER = dataBETWEEN_NUMBER === '' ? '' : dataBETWEEN_NUMBER + addSpace() + 'AND' + addSpace();
                    filter.innerJoin === 'Y' ? innerClause += dataBETWEEN_NUMBER : criteria += dataBETWEEN_NUMBER;
                    selectedCriteria = getSelectedCriteriaForBETWEEN_NUMBER(filter, values[filter.columnName]);
                    selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
                    break;
                case 'LIKE':
                    let dataLIKE = getCriteriaForLIKE(filter, values[filter.columnName]);
                    dataLIKE = dataLIKE === '' ? '' : dataLIKE + addSpace() + 'AND' + addSpace();
                    filter.innerJoin === 'Y' ? innerClause += dataLIKE : criteria += dataLIKE;
                    selectedCriteria = getSelectedCriteriaForLIKE(filter, values[filter.columnName]);
                    selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
                    break;
            }
        }
    });
    criteria = criteria === '' ? criteria : 'WHERE' + addSpace() + criteria;
    // FOR SMU TEMPORArY FIX
    // if (!KEYS_IN_VALUE.includes('PERSON_NAME') && !KEYS_IN_VALUE.includes('PERSON_ROLE')) {
    //     criteria = criteria ? criteria + 'PERSON_ROLE_ID = 3' : criteria + 'WHERE PERSON_ROLE_ID = 3';
    // } else if (values['PERSON_NAME'] && !values['PERSON_NAME'].length && !values['PERSON_ROLE']) {
    //     criteria = criteria ? criteria + 'PERSON_ROLE_ID = 3' : criteria + 'WHERE PERSON_ROLE_ID = 3';
    // } else if (values['PERSON_NAME'] && !values['PERSON_NAME'].length && values['PERSON_ROLE'] && !values['PERSON_ROLE'].length ) {
    //     criteria = criteria ? criteria + 'PERSON_ROLE_ID = 3' : criteria + 'WHERE PERSON_ROLE_ID = 3';
    // } else if (values['PERSON_ROLE'] && !values['PERSON_ROLE'].length) {
    //     criteria = criteria ? criteria + 'PERSON_ROLE_ID = 3' : criteria + 'WHERE PERSON_ROLE_ID = 3';
    // } else if(values['PERSON_NAME'] && values['PERSON_NAME'].length) {
    //   values['PERSON_NAME'][0] = values['PERSON_NAME'][0].trim();
    //   values['PERSON_NAME'].filter(n => n);
    //    if (!values['PERSON_NAME'].length) {
    //     criteria = criteria ? criteria + 'PERSON_ROLE_ID = 3' : criteria + 'WHERE PERSON_ROLE_ID = 3';
    //    }
    // }
    return [criteria, innerClause, queryCriteria];
}

/**
 * @param  {any[]} KeysInValue
 * @param  {string} columnName
 * return true if filter have an entry of it in user entered values
 * (only checks if the key is available doesn't look if the key has any value
 * since value changing logic is different for different Query types
 * eg ARRAY for IN and Object for BETWEEN
 */
function findInValues(KeysInValue: any[], columnName: string) {
    return !!KeysInValue.find(key => columnName === key);
}
/**
 * @param  {any} filter
 * @param  {any} value
 * return true if there is vales in corresponding filter its only for 'IN' type since the values will be of type ARRAY
 */
function getCriteriaForIN(filter: any, values: any) {
    return values.length > 0 ? addCriteriaForIN(filter, values) : '';
}
/**
 * @param  {any} filter
 * @param  {any} values
 * return a string with corresponding column name and comma separated values in an IN() clause
 */
function addCriteriaForIN(filter: any, values: any) {
    let inCriteria = filter.columnName + addSpace() + 'IN(';
    values.forEach(value => inCriteria += addSingleQuotes(value.trim()) + ',');
    inCriteria = removeTrailingComma(inCriteria) + ')';
    return inCriteria;
}
/**
 * @param  {any} filter
 * @param  {any} value
 * return true if there is vales in corresponding filter its only for 'IN' type since the values will be of type ARRAY
 */
function getSelectedCriteriaForIN(filter: any, values: any) {
    return values.length > 0 ? selectedCriteriaForIN(filter, values) : '';
}
/**
 * @param  {any} filter
 * @param  {any} values
 * return a string with corresponding display name and comma separated values followed by ':'.
 */
function selectedCriteriaForIN(filter: any, values: any) {
    let inCriteria = filter.displayName + addSpace() + 'contains' + addSpace();
    values.forEach(value => inCriteria += addSingleQuotes(value) + ',');
    inCriteria = removeTrailingComma(inCriteria);
    return inCriteria;
}

/**
 * @param  {any} filter
 * @param  {any} values
 * checks or any corresponding values in user entered values list since BETWEEN clause return Object
 * Object.keys is used to determine the condition
 */
function getCriteriaForBETWEEN(filter: any, values: any) {
    return Object.keys(values).length > 0 ? addCriteriaForBETWEEN(filter, values) : '';
}
/**
 * @param  {any} filter
 * @param  {any} values
 * return a query string with values for the filter if both start and end values are found BETWEEN
 * is used else GREATER THAN or LESS THAN is used
 */
function addCriteriaForBETWEEN(filter: any, values: any) {
    let TO = '';
    let FROM = '';
    let BETWEEN_CRITERIA = '';
    if (values.to) {
        TO = formatDate(values.to);
    }
    if (values.from) {
        FROM = formatDate(values.from);
    }
    if (TO !== '' && FROM !== '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + 'BETWEEN' + addSpace() + FROM + addSpace() + 'AND' + addSpace() + TO;
    } else if (TO === '' && FROM !== '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + '>=' + addSpace() + FROM;
    } else if (TO !== '' && FROM === '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + '<=' + addSpace() + TO;
    }
    return BETWEEN_CRITERIA;
}
/**
 * @param  {any} filter
 * @param  {any} values
 * checks or any corresponding values in user entered values list since BETWEEN clause return Object
 * Object.keys is used to determine the condition
 */
function getSelectedCriteriaForBETWEEN(filter: any, values: any) {
    return Object.keys(values).length > 0 ? selectedCriteriaForBETWEEN(filter, values) : '';
}
/**
 * @param  {any} filter
 * @param  {any} values
 * return a query string with values for the filter if both start and end values are found BETWEEN
 * is used else GREATER THAN or LESS THAN is used
 */
function selectedCriteriaForBETWEEN(filter: any, values: any) {
    let TO = '';
    let FROM = '';
    let BETWEEN_CRITERIA = '';
    if (values.to) {
        TO = parseDate(values.to);
    }
    if (values.from) {
        FROM = parseDate(values.from);
    }
    if (TO !== '' && FROM !== '') {
        BETWEEN_CRITERIA = filter.displayName + addSpace() + 'between' + addSpace() + FROM + addSpace() + '&' + addSpace() + TO;
    } else if (TO === '' && FROM !== '') {
        BETWEEN_CRITERIA = filter.displayName + addSpace() + 'greater than or equal to' + addSpace() + FROM;
    } else if (TO !== '' && FROM === '') {
        BETWEEN_CRITERIA = filter.displayName + addSpace() + 'less than or equal to' + addSpace() + TO;
    }
    return BETWEEN_CRITERIA;
}
/**
 * @param  {any} filter
 * @param  {any} values
 * checks or any corresponding values in user entered values list since BETWEEN_NUMBER clause return Object
 * Object.keys is used to determine the condition
 */
function getCriteriaForBETWEEN_NUMBER(filter: any, values: any) {
    return Object.keys(values).length > 0 ? addCriteriaForBETWEEN_NUMBER(filter, values) : '';
}
/**
 * @param  {any} filter
 * @param  {any} values
 * return a query string with values for the filter if both start and end values are found BETWEEN
 * is used else GREATER THAN or LESS THAN is used
 */
function addCriteriaForBETWEEN_NUMBER(filter: any, values: any) {
    let TO = '';
    let FROM = '';
    let BETWEEN_CRITERIA = '';
    if (values.to) {
        TO = values.to;
    }
    if (values.from) {
        FROM = values.from;
    }
    if (TO !== '' && FROM !== '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + 'BETWEEN' + addSpace() + FROM + addSpace() + 'AND' + addSpace() + TO;
    } else if (TO === '' && FROM !== '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + '>' + addSpace() + FROM;
    } else if (TO !== '' && FROM === '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + '<' + addSpace() + TO;
    }
    return BETWEEN_CRITERIA;
}

/**
 * @param  {any} filter
 * @param  {any} values
 * checks or any corresponding values in user entered values list since BETWEEN_NUMBER clause return Object
 * Object.keys is used to determine the condition
 */
function getSelectedCriteriaForBETWEEN_NUMBER(filter: any, values: any) {
    return Object.keys(values).length > 0 ? selectedCriteriaForBETWEEN_NUMBER(filter, values) : '';
}
/**
 * @param  {any} filter
 * @param  {any} values
 * return a query string with values for the filter if both start and end values are found BETWEEN
 * is used else GREATER THAN or LESS THAN is used
 */
function selectedCriteriaForBETWEEN_NUMBER(filter: any, values: any) {
    let TO = '';
    let FROM = '';
    let BETWEEN_CRITERIA = '';
    if (values.to) {
        TO = values.to;
    }
    if (values.from) {
        FROM = values.from;
    }
    if (TO !== '' && FROM !== '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + 'between' + addSpace() + FROM + addSpace() + '&' + addSpace() + TO;
    } else if (TO === '' && FROM !== '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + 'greter than' + addSpace() + FROM;
    } else if (TO !== '' && FROM === '') {
        BETWEEN_CRITERIA = filter.columnName + addSpace() + 'less than' + addSpace() + TO;
    }
    return BETWEEN_CRITERIA;
}

function getCriteriaForLIKE(filter: any, values: any) {
    return values.length && values[0] ? addCriteriaForLIKE(filter, values) : '';
}
/**
 * @param  {any} filter
 * @param  {any} values
 * creates like query LIKE_CRITERIA_CONSTANt is the constant which should be added before adding new like criteria.
 * value[0] i taken because the search string wil be on array[0]. this method is used so that once 
 * if free text gets IN query it will work automatically.
 */
function addCriteriaForLIKE(filter: any, values: any) {
    const LIKE_CRITERIA_CONSTANT = addSpace() + convertToUpperCase(filter.columnName) + addSpace() + 'LIKE' + addSpace();
    let LIKE_CRITERIA = '';
    values = values.map(f => f.trim()).filter(Boolean);
    values.forEach(value => {
        LIKE_CRITERIA += LIKE_CRITERIA_CONSTANT + convertToUpperCase(addSingleQuotes(addPercentage(value))) + addSpace() + 'OR';
    });
    return addBraces(removeTrailingOR(LIKE_CRITERIA));
}
function getSelectedCriteriaForLIKE(filter: any, values: any) {
    return values.length && values[0] ? selectedCriteriaForLIKE(filter, values) : '';
}
/**
 * @param  {any} filter
 * @param  {any} values
 * creates like query LIKE_CRITERIA_CONSTANt is the constant which should be added before adding new like criteria.
 * value[0] i taken because the search string wil be on array[0]. this method is used so that once
 * if free text gets IN query it will work automatically.
 */
function selectedCriteriaForLIKE(filter: any, values: any) {
    const LIKE_CRITERIA_CONSTANT = filter.displayName + addSpace() + 'contains' + addSpace();
    let LIKE_CRITERIA = LIKE_CRITERIA_CONSTANT;
    values = values.map(f => f.trim()).filter(Boolean);
    values.forEach(value => {
        LIKE_CRITERIA += addQuotation(value) + addSpace() + ',' + addSpace();
    });
    LIKE_CRITERIA = removeTrailingLowerCaseOR(LIKE_CRITERIA);
    return removeTrailingLowerCaseComma(LIKE_CRITERIA);
}
/**
 * @param  {Date} date
 * will return a date format for which will work for searching in DB
 * YYYY-mm-dd
 */
export function formatDate(date) {
    date = parseDateWithoutTimestamp(date);
    return addSingleQuotes(date);
}
/**
 * @param  {Date} date
 * will return a date format which will be DEFAULT_DATE_FORMAT of FIBI
 */
function parseDate(date) {
    date = parseDateWithoutTimestamp(date);
    const datePipe = new DatePipe('en-US');
    date = datePipe.transform(date, DEFAULT_DATE_FORMAT);
    return addSingleQuotes(date);
}
