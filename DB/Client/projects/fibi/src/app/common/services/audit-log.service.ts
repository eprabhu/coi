import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { deepCloneObject } from '../utilities/custom-utilities';
import { CommonService } from './common.service';
class Action {
    FIELD_METADATA: Array<string> = [];
    BEFORE: any = {};
    AFTER: any = {};
}
export class AuditLog {
    module = '';
    subModule = '';
    actionType = '';
    action = new Action();
    moduleItemKey = null;
    changes: any;
}

const EXCLUDED_VALUES = ['UPDATE_TIMESTAMP', 'UPDATE_USER'];
@Injectable()
export class AuditLogService {

    auditLog: AuditLog = new AuditLog();
    isAuditLogAvailableInModule = true;
    moduleName: string;

    constructor(@Inject('moduleName') moduleName: string,
        private _http: HttpClient, private _commonService: CommonService) {
        this.moduleName = moduleName;
        this.getModuleLogAvailable(moduleName);
    }

    getModuleLogAvailable(moduleName: string): void {
        this._http.get(`${this._commonService.baseUrl}/isAuditLogEnabled/${moduleName}`).subscribe((data: any) => {
            this.isAuditLogAvailableInModule = data.isActive;
        }, err => {
            this.isAuditLogAvailableInModule = true;
        });
    }

    triggerSaveAuditLog(auditLog): void {
        if (this.isAuditLogAvailableInModule) {
            this._http.post(this._commonService.baseUrl + '/auditLogAdminModule', auditLog).subscribe();
        }
    }

    saveAuditLog(actionType: 'I' | 'D' | 'U', before: any, after: any, subModuleName: string = null,
        fieldMetaData: Array<string>, moduleItemKey: string = null): void {
        this.auditLog = new AuditLog();
        this.auditLog.action.BEFORE = before || {};
        this.auditLog.action.AFTER = after || {};
        this.auditLog.actionType = actionType;
        this.auditLog.subModule = subModuleName;
        this.auditLog.module = this.moduleName;
        this.auditLog.moduleItemKey = moduleItemKey;
        this.auditLog.action.FIELD_METADATA = fieldMetaData;
        this.auditLog.changes = this.compareObject(deepCloneObject(this.auditLog.action.BEFORE),
                                                   deepCloneObject(this.auditLog.action.AFTER),
                                                   this.getSubFields(actionType, before, after),
                                                   actionType);
        this.removeExcludedValues();
        this.triggerSaveAuditLog(this.auditLog);
    }

    /**
     * this function prepares change string for audit log api it accepts before and after object
     * loop through each value and compare changes if the value type is array then compareStringArray function
     * will do string array comparison, if it is a key: value then before and after value will be compared to get changes
     * change - will contain string format of values that are changed in before and after changeLess - will contain values that 
     * are not changed in before and after, in case of insert/delete change string will be empty, then getComparedObjectString 
     * function prepares in required format based on different condition.
     */
    compareObject(before = {}, after = {}, subFields: Array<string>, actionType): string {
        before = before || {};
        after = after || {};
        let unmodified = '';
        let modified = '';
        let arrayModified = '';
        let arrayUnModified = '';
        subFields.forEach((key: string) => {
            const KEY = '\n' + key.toUpperCase() + ':';
            if ((before[key] && Array.isArray(before[key])) ||
                (after[key] && Array.isArray(after[key]))) {
                let arrayString = this.compareStringArray(before[key], after[key], key);
                if (arrayString.isArrayChanged) {
                    arrayModified += KEY + arrayString.finalString  + '\n';
                } else {
                    arrayUnModified += KEY + arrayString.finalString  + '\n';
                }
            } else {
                let afterVal = this.findDataInObject(after, key);
                let beforeVal = this.findDataInObject(before, key);
                if (actionType === 'U') {
                    afterVal = afterVal || afterVal === false ? afterVal : '--NONE--';
                    beforeVal = beforeVal ||  beforeVal === false ? beforeVal : '--NONE--';
                }
                const VALUE = this.getValue(afterVal, beforeVal);
                VALUE.includes('->') ? modified += KEY + VALUE 
                                     : unmodified += KEY + VALUE;
            }
        });
        return this.getFinalChangeString(modified, unmodified, arrayModified, arrayUnModified, actionType);
    }

    /**
     * 
     * this function forms change string for excel in required format
     * with Changed Values/Unchanged Values heading appended
     * if array change available, then it will be listed in
     * --Changed values-- heading, and other static values will be
     * listed in --Unchanged Values--in case of insert/delete
     * (changed values and array change empty) string (key: value pair)
     * without heading will be returned.
     */
    getFinalChangeString(modified, unmodified, arrayModified, arrayUnModified, acType): string {
        const COMMON_MODIFIED_STRING = '\n\n--Changed Values--\n';
        const COMMON_UNMODIFIED_STRING = '--Unchanged Values--\n';
        const COMBINED_STRING = COMMON_UNMODIFIED_STRING + unmodified + (arrayUnModified ? arrayUnModified.substring(0, arrayUnModified.length-1) : '') + 
                                COMMON_MODIFIED_STRING + (modified ? modified + '\n': '');
        if (arrayModified) {
            if (acType === 'U') {
                return COMBINED_STRING + arrayModified;
            } else {
                return unmodified + (arrayUnModified ? arrayUnModified : '') + (arrayModified ? arrayModified : '');
            }
        } else if (modified) {
            return COMBINED_STRING;
        } else {
            return acType === 'U' ? COMMON_UNMODIFIED_STRING + unmodified + (arrayUnModified ? arrayUnModified : '') : unmodified;
        }
    }

    getValue(after: any, before: any): string {
        if ((after || after === false) && (before|| before === false)) {
            return before != after ? this.updateToString(before) + ' -> ' + this.updateToString(after)
                                   : this.updateToString(after);
        } else if (after || after === false) {
            return this.updateToString(after);
        } else if (before || before === false) {
            return this.updateToString(before);
        } else {
            return '';
        }
    }

    /**
     * this function forms change string for array
     * variables, we use key to specify the values in which action is done.
     * insert values, deleted values and current values are converted
     * to string and final string is prepared by combining 
     * all three values with corresponding headings.
     */
    compareStringArray(before: Array<string> = [], after: Array<string> = [], key: string): any {
        const KEY = key.toUpperCase();
        let existingString = '\n\n<CURRENT ' + KEY + '>\n' + this.getStringFromArray(after);
        let insertArr = after.filter(ele => !before.includes(ele));
        let insertString= '\n\n<INSERTED ' + KEY + '>\n' + this.getStringFromArray(insertArr);
        let deleteArr = before.filter(ele => !after.includes(ele));
        let deleteString = '\n\n<REMOVED ' + KEY + '>\n' + this.getStringFromArray(deleteArr);
        let finalString = insertString + deleteString + existingString;
        let isArrayChanged = insertArr.length || deleteArr.length ? true : false;
        return {finalString, isArrayChanged} ;
    }

    getStringFromArray(inputArray: Array<any>) {
        return inputArray.length ? inputArray.join(',\n') : '--NONE--';
    }

    /**
     * this function gets
     * changed values of the array in string format,
     * it will be either deleted values or
     * added values so corresponding text is added
     * based on isDeleted flag.
     */
    getChangeString(changedArr, isDeleted, key) {
        let changedString = '';
        if (isDeleted) {
            changedString += '\n<DELETED ' + key + '>\n' + changedArr.join(',\n');
        } else {
            changedString += '\n\n<NEWLY ADDED ' + key + '>\n' + changedArr.join(',\n');
        }
        return changedString;
    }

    /**
     * this function converts all input values to string
     * and in case of Y/N or true/false it changes it to yes / no.
     */
    updateToString(value: any): string {
        value = value != null && value != undefined ? value.toString() : '';
        return ['Y', 'N', 'true', 'false'].includes(value) ? value === 'Y' || value === 'true' ? 'Yes' : 'No' : value;
    }

    /**
     * this function return value of string 
     * and number type values.
     */
    findDataInObject(data: any, path: string): any {
        path.split('.').every(p => data[p] != null && data[p] != undefined  ? data = data[p] : false);
        return typeof (data) === 'string' || typeof (data) === 'number' || typeof (data) === 'boolean' ? data : '';
    }

    /**
     * this function gets subFields ie., array of keys of before and after
     * object, and if the key has anything from EXCLUDED_VALUE it will be removed      
     * We should have all the keys from both object, 
     * any one object may contain extra key
     * so we are combining both keys in case of update.
     */
    getSubFields(actionType, before, after) {
        let subFields = [];
        if (actionType === 'U') {
            subFields = [...new Set(Object.keys(after).concat(Object.keys(before)))];
        } else {
            subFields = actionType === 'I' ? Object.keys(after) : Object.keys(before);
        }
        subFields = subFields.filter(ele => !EXCLUDED_VALUES.includes(ele));
        return subFields;
    }

    /**
     * this function removes keys in EXCLUDED_VAL array from before 
     * and after object if exists.
     */
    removeExcludedValues(): void {
        EXCLUDED_VALUES.forEach((ele) => {
            if (this.auditLog.action.BEFORE && this.auditLog.action.BEFORE[ele]) {
                delete this.auditLog.action.BEFORE[ele];
            }
            if (this.auditLog.action.AFTER && this.auditLog.action.AFTER[ele]) {
                delete this.auditLog.action.AFTER[ele];
            }
        });
    }

}
