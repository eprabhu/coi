/**@author Mahesh Sreenath V M
 * compares to arrays for given primary key and sub fields
 * base stands for the latest version created and
 * current stands for the current version being compared
 *  status 1  - newly addded to the base;
 *  status 0  - same in both(according to given primary keys)
 *  status -1 - was in current not available in base
*/
import { compareString } from './string-compare';

let currentArray = [];
let primaryKey = null;
let comparedArray = [];
let subFieldsToCompare = [];
/**
 * @param  {} base=[]
 * @param  {} current=[]
 * @param  {string} key
 * @param  {string} subFields
 * iterates over the base to find difference returns a new array with status
 * and sub fields changed in them as HTML tags.
 */
export function compareArray(base = [], current = [], key: Array<string>, subFields: Array<string>) {
    currentArray = [];
    comparedArray = [];
    base = base ? base : [];
    current = current ? current : [];
    primaryKey = key;
    subFieldsToCompare = subFields;
    if (base.constructor === Array && current.constructor === Array) {
        currentArray = current;
        base.forEach(element => {
            element.status = findInCurrent(element) ? 0 : 1;
            comparedArray.push(element);
        });
        currentArray.forEach(element => {
            element.status = -1;
            comparedArray.push(element);
        });
    }
    return comparedArray;
}
/**
 * @param  {object} base
 * @param  {object} current
 * @param  {number} index
 * iterates over the given sub fields of the object to compare uses string diff checker
 */
function checkInOtherFields(base: object, current: object, index: number) {
    subFieldsToCompare.forEach((key: string) => {
        const CURRENT = findDataInObject(current, key);
        const BASE = findDataInObject(base, key);
        const COMPARED_VALUE = compareString(updateToString(CURRENT), updateToString(BASE));
        if (COMPARED_VALUE) { updateComparedData(base, key, COMPARED_VALUE); }
    });
    return removeElement(index);
}
/**
 * @param  {object} base
 * for a given object finds the primary keys and looks for them in the old object
 * return the index if they do match;
 * only need to check other sub fields if primary keys match
 */
function findInCurrent(base: object) {
    const PRIMARY_KEYS = primaryKey;
    const index = currentArray.findIndex((current: object) => {
        return PRIMARY_KEYS.every((key: string) => findDataInObject(current, key) === findDataInObject(base, key));
    });
    return index === -1 ? false : checkInOtherFields(base, currentArray[index], index);
}
/**
 * @param  {} index
 * removes the element from the current version used for comparison.
 */
function removeElement(index) {
    currentArray.splice(index, 1);
    return true;
}
/**
 * @param  {} value
 * converts the given input into string
 * if the value matches Y or N updates the value to yes and No respectively
 */
function updateToString(value) {
    value = value || value === 0 ? value.toString() : '';
    return value === 'Y' || value === 'N' ? updateYnN(value) : value;
}
/**
 * @param  {} value
 * updates Y to yes and N to No
 */
function updateYnN(value) {
    return value === 'Y' ? 'Yes' : 'No';
}

function findDataInObject(data: any, path: string) {
    path.split('.').every(p => data[p] || data[p] === 0 ? data = data[p] : false);
    return typeof (data) === 'string' || typeof (data) === 'number' ? data : '';
}

function updateComparedData(data: any, path: string, value: string | number) {
    const paths = path.split('.');
    paths.slice(0, -1).forEach(p => {
        if (data[p] || data[p] === 0) {
            data = data[p]
        } else {
            data[p] = {};
            data = data[p];
        }
    }); 
    data[paths[paths.length - 1]] = value;
}

export function compareStringArray(base: Array<string> = [], current: Array<string> = []) {
    const result = [];
    base.forEach(B => {
        const Index = current.findIndex(C => C === B);
        result.push(compareString(current[Index] || '', B));
        if (Index !== -1) {
            current.splice(Index, 1);
        }
    });
    current.forEach(C => result.push(compareString(C, '')));
    return result;
}

/**
 * Function to compare two string arrays and check if they are different
 */
export function haveStringArraysChanged(base: string[] = [], current: string[] = []): boolean {
    if (base.length !== current.length) {
        return true;
    }

    const SORTED_BASE = [...base].sort();
    const SORTED_CURRENT = [...current].sort();

    for (let i = 0; i < SORTED_BASE.length; i++) {
        if (SORTED_BASE[i] !== SORTED_CURRENT[i]) {
            return true;
        }
    }

    return false;
}
