import { LEAD_UNIT_OUTPUT_FORMAT } from '../../app-constants';
import { deepCloneObject } from '../utilities/custom-utilities';

const completerOptions = {
    arrayList: [],
    contextField: '',
    filterFields: '',
    formatString: '',
    defaultValue: ''
};

export function getCompleterOptionsForLeadUnitWithCustField(arrayList = [], defaultValue = '') {
    completerOptions.arrayList = arrayList;
    completerOptions.contextField = 'UNIT_NUMBER - UNIT_NAME';
    completerOptions.formatString = 'UNIT_NUMBER - UNIT_NAME';
    completerOptions.defaultValue = defaultValue;
    completerOptions.filterFields = 'UNIT_NAME, UNIT_NUMBER';
    return JSON.parse(JSON.stringify(completerOptions));
}

export function getCompleterOptionsForLeadUnit(arrayList = [], defaultValue = '') {
    completerOptions.arrayList = arrayList;
    completerOptions.contextField = LEAD_UNIT_OUTPUT_FORMAT;
    completerOptions.formatString = LEAD_UNIT_OUTPUT_FORMAT;
    completerOptions.defaultValue = defaultValue;
    completerOptions.filterFields = 'unitName, unitNumber';
    return JSON.parse(JSON.stringify(completerOptions));
}

export function getCompleterOptionsForCategory(arrayList = [], defaultValue = '') {
    completerOptions.arrayList = arrayList;
    completerOptions.contextField = LEAD_UNIT_OUTPUT_FORMAT;
    completerOptions.formatString = LEAD_UNIT_OUTPUT_FORMAT;
    completerOptions.defaultValue = defaultValue;
    completerOptions.filterFields = 'unitName, unitNumber';
    return JSON.parse(JSON.stringify(completerOptions));
}

export function getCompleterOptionsForRole(arrayList = [], defaultValue = '') {
    completerOptions.arrayList = arrayList;
    completerOptions.contextField = 'roleName';
    completerOptions.formatString = 'roleName';
    completerOptions.defaultValue = defaultValue;
    completerOptions.filterFields = 'roleId, roleName';
    return deepCloneObject(completerOptions);
}
