

import { DEFAULT_DATE_FORMAT } from '../app-constants';
import { parseDateWithoutTimestamp } from '../common/utilities/date-utilities';
import { DatePipe } from '@angular/common';

export function getValuesForBirt(filter, values) {
	const birtValues = {};
	Object.keys(values).forEach(K => {
		if (values[K].length || Object.keys(values[K]).length) {
			const TYPE = getTypeFromFilters(K, filter);
			birtValues[K] = getValueForFilterType(values[K], TYPE);
		}
	});
	return birtValues;
}

function getValueForFilterType(value, filterType) {
	if (filterType === 'EQUAL' || filterType === 'LIKE') {
		return getValueForLikeandEqual(value);
	} else if (filterType === 'IN') {
		return addCriteriaForIN(value);
	} else if (filterType === 'BETWEEN') {
		return addCriteriaForBETWEEN(value);
	} else if (filterType === 'BIRTEQUAL') {
		return addCriteriaForSINGLEDATE(value.from);
	}

}
function addCriteriaForIN(values: Array<any>) {
	let inCriteria = '(';
	values.forEach(value => inCriteria += addSingleQuotes(value) + ',');
	inCriteria = removeTrailingComma(inCriteria) + ')';
	return inCriteria;
}

function getTypeFromFilters(key: string, filters: Array<any>) {
	const filter = filters.find(F => F.columnName === key);
	return filter.queryType;
}

function getValueForLikeandEqual(value: Array<any>) {
	return value[0];
}

function addCriteriaForBETWEEN(values: any) {
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
		BETWEEN_CRITERIA = 'BETWEEN' + addSpace() + FROM + addSpace() + 'AND' + addSpace() + TO;
	} else if (TO === '' && FROM !== '') {
		BETWEEN_CRITERIA = '>' + addSpace() + FROM;
	} else if (TO !== '' && FROM === '') {
		BETWEEN_CRITERIA = '<' + addSpace() + TO;
	}
	return BETWEEN_CRITERIA;
}

function addSpace() {
	return ' ';
}

function removeTrailingComma(value) {
	return value.slice(0, value.length - 1);
}

function addSingleQuotes(value) {
	// tslint:disable: quotemark
	value = value.toString().replace(/'/g, "\\'");
	return "'" + value + "'";
}

function formatDate(date) {
	date = parseDateWithoutTimestamp(date);
	return addSingleQuotes(date);
}

function addCriteriaForSINGLEDATE(value) {
	value = new Date(value);
	return ('0' + (value.getMonth() + 1)).slice(-2) + '/' + ('0' + value.getDate()).slice(-2) + '/' + value.getFullYear();
}

export function setCriteria(filters: any[], values: any) {
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
	let selectedCriteria = '';
	const queryCriteria = [];
	const KEYS_IN_VALUE = Object.keys(values);
	filters.forEach(filter => {
		if (findInValues(KEYS_IN_VALUE, filter.columnName)) {
			switch (filter.queryType) {
				case 'IN':
					selectedCriteria = getSelectedCriteriaForIN(filter, values[filter.columnName]);
					selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
					break;
				case 'BETWEEN':
					selectedCriteria = getSelectedCriteriaForBETWEEN(filter, values[filter.columnName]);
					selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
					break;
				case 'BETWEEN_NUMBER':
					selectedCriteria = getSelectedCriteriaForBETWEEN_NUMBER(filter, values[filter.columnName]);
					selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
					break;
				case 'LIKE':
					selectedCriteria = getSelectedCriteriaForLIKE(filter, values[filter.columnName]);
					selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
					break;
				case 'EQUAL':
					selectedCriteria = getSelectedCriteriaForLIKE(filter, values[filter.columnName]);
					selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
					break;
				case 'BIRTEQUAL':
					selectedCriteria = getSelectedCriteriaForBirtDate(filter, values[filter.columnName]);
					selectedCriteria ? queryCriteria.push(selectedCriteria) : '';
					break;
			}
		}
	});
	criteria = criteria === '' ? criteria : 'WHERE' + addSpace() + criteria;
	return queryCriteria;
}

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
		TO = formatDate(values.to);
	}
	if (values.from) {
		FROM = formatDate(values.from);
	}
	if (TO !== '' && FROM !== '') {
		BETWEEN_CRITERIA = filter.displayName + addSpace() + 'between' + addSpace() + FROM + addSpace() + '&' + addSpace() + TO;
	} else if (TO === '' && FROM !== '') {
		BETWEEN_CRITERIA = filter.displayName + addSpace() + 'greater than' + addSpace() + FROM;
	} else if (TO !== '' && FROM === '') {
		BETWEEN_CRITERIA = filter.displayName + addSpace() + 'less than' + addSpace() + TO;
	}
	return BETWEEN_CRITERIA;
}

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
	let LIKE_CRITERIA = '';
	values = values.map(f => f.trim()).filter(Boolean);
	values.forEach(value => {
		if (filter.filterType === 'year_start' || filter.filterType === 'year_end') {
			value = parseDate(value);
		}
		LIKE_CRITERIA +=  addQuotation(value) + addSpace() + 'or' + addSpace();
	});
	return removeTrailingLowerCaseOR(LIKE_CRITERIA_CONSTANT + LIKE_CRITERIA);
}

function getSelectedCriteriaForBirtDate(filter, values) {
	return Object.keys(values).length > 0 ? selectedCriteriaForBirtDate(filter, values) : '';
}

function selectedCriteriaForBirtDate(filter, values) {
	let FROM = '';
	let BETWEEN_CRITERIA = '';
	if (values.from) {
		FROM = parseDate(values.from);
	}
	if (FROM !== '') {
		BETWEEN_CRITERIA = filter.displayName + 'contains' + addSpace() + FROM;
	}
	return BETWEEN_CRITERIA;
}

function findInValues(KeysInValue: any[], columnName: string) {
	return !!KeysInValue.find(key => columnName === key);
}

function addQuotation(value) {
	return '"' + value + '"';
}

function removeTrailingLowerCaseOR(value) {
	value = value.replace(/or([^or]*)$/, '$1');
	return value;
}

function parseDate(date) {
    date = parseDateWithoutTimestamp(date);
    const datePipe = new DatePipe('en-US');
    date = datePipe.transform(date, DEFAULT_DATE_FORMAT);
    return addSingleQuotes(date);
}
