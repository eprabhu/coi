import { ENDPOINT_SPONSOR_OUTPUT_FORMAT } from '../../app-constants';
import { LEAD_UNIT_OUTPUT_FORMAT } from '../../app-constants';
import * as bootstrap from 'bootstrap';

/**
 * @param  {string} elementId
 * a function which scroll the element into view it will be scrolled into center of screen
 */
type scrollPositions = 'start' | 'center' | 'end' | 'nearest' | 'below-header';
export const scrollIntoView = (elementId: string, position: scrollPositions  = 'center') => {
    const ELEMENT: HTMLElement = document.getElementById(elementId);
    if (position === 'below-header') {
        const headerOffset = 250;
        const elementPosition = ELEMENT.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        return window.scrollTo({ behavior: 'smooth', top: offsetPosition });
    }
    return ELEMENT ? ELEMENT.scrollIntoView({ behavior: 'smooth', block: position }) : false;
};

/**
 * @param  {string} id
 * auto focus for the given element which will focus if the element is found otherwise return false
 */
export const setFocusToElement = (id: string) => {
    setTimeout(() => {
        const ELEMENT: HTMLElement = document.getElementById(id);
        return ELEMENT ? ELEMENT.focus() : false;
    },300);

};

export function pageScroll(elementId) {
    setTimeout( () => {
        const id = document.getElementById(elementId);
        if (id) {
            id.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

export function onKeyPress(event: any, patternType) {
    const pattern = patternType === 'date' ? /[0-9\+\-\/\ ]/ : /[0-9\a-zA-Z]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
        event.preventDefault();
    }
}

/**
 * validate and returns error if the input field is not b/w 0 and 100 and up to 2 decimal places
 * @param keyupValue
 */
export function validatePercentage(keyupValue) {
    const pattern = /(^100([.]0{1,2})?)$|(^\d{1,2}([.]\d{1,2})?)$/;
    return (keyupValue && !pattern.test(keyupValue)) ? 'Enter a valid percentage (%) between 0 - 100 and up to 2 decimal places.' : null;
}

/**
 * @param  {any} field
 * Restricts users from entering amount input fields more than 10 digits and also restricts
 * them from entering more than two digits after decimal part.
 * field - The particular input field which restricts users from entering the above case.
 * eg: Success cases :- 1234567890.00, 1234567.12, 123.23, etc
 * eg: Failure cases :- 12345678900(total 11 digits), 12345678900.122 etc
 */
export function inputRestrictionForAmountField(field: any) {
    const PATTERN = /^[+-]?(?:[0-9][0-9]{0,9}(?:\.\d{0,2})?|9999999999|9999999999.00|9999999999.99)$/;
    return (field > 0 && !PATTERN.test(field)) ? 'Enter the field with value as 10 digits up to 2 decimal places.' : null;
}
/**
 * '?' has to be added to path in function call; provided query param values are []
 * @param path : <String>current path where to redirect to. eg: path = 'agreement/agreementhome?agreementId='
 * @param queryParamKeys : Its accepts Array of all Keys queryParam eg: In awardId=8085, 'awardId' will be queryParamKey;
 * for paths without query params, pass queryParamKeys as [],
 * @param queryParamValues ; Its accepts Array of all Value, eg: In awardId=8085, '8085' is the queryParamValue;
 * for paths without query params, pass queryParamValues as [],
 * If index is 0, append key, value pair only, otherwise prefix '&' for each key value pair in the url
 */
export function openInNewTab(path: string, queryParamKeys: Array<any>, queryParamValues: Array<any>) {
    if (path && queryParamKeys && queryParamValues && queryParamKeys.length === queryParamValues.length) {
        let url = '';
        queryParamKeys.forEach((key, index) => {
            if (queryParamValues[index]) {
                (index === 0) ? url = key + '=' + queryParamValues[index] : url = url + '&' + key + '=' + queryParamValues[index];
            }
        });
        url = window.location.origin + window.location.pathname + '#/fibi/' + path + url;
        window.location.hash.split(/[/?]/).includes('dashboard') ? window.open(url, '_self') : window.open(url, '_blank');
    }
}
/**
 * @param  {} value
 * to convert an amount, entered as a string to valid amount.
 * Eg :-
 * For inputs 123, $123                  --->  returns 123
 * For inputs -123, -$123                --->  returns -123
 * For inputs 12,345, $123,45            --->  returns 12345
 * For inputs john40                     --->  returns 0
 * For inputs 12.34, $12.34,             --->  returns 12.34
 * For inputs -12.34, $-12.34, -$12.34   --->  returns -12.34
 */
export function convertToValidAmount(value) {
    if (typeof (value) === 'string') {
        value = value.replace(/,/g, '').trim();
        const isNegative = value.includes('-');
        value = isNegative ? value.substring(1) : value;
        value = value[0] === '.' ? 0 + value : value;
        value = parseFloat(value[0]) ? parseFloat(value) : parseFloat(value.substring(1));
        value = isNegative ? -1 * value : value;
        return isNaN(value) ? 0 : value;
    } else {
        return value;
    }
}

/**
 * @param  {} value
 * Remove script, image and svg tags from the string
 */
export function removeUnwantedTags(data) {
    if (data) {
        data = data.replace(/<.?script.*?>.*?<\/.*?script.*?>/igm, '')
            .replace(/<svg|<img .*?>/g, '').replace(/&nbsp;/gi, ' ');
    }
    return data;
}

/**
 * @param  {any} data -> For downloading attachments, pass data as data and for exports, pass data as data.body.
 * @param  {any} fileName -> This is the downloaded name. For exporting to pdf or excel, the fileName will be docHeading.
 * @param  {any=null} extension -> the type by which the file could download.
 *                                 For downloading attachments, no need to pass the extension and
 *                                 for exports, pass its corresponding extension type.
 */
export function fileDownloader(data: any, fileName: any = '', extension: string = '') {
    if (data) {
        const DOWNLOAD_CONTENT = getDownloadContent(fileName, extension);
        if ((window.navigator as any).msSaveOrOpenBlob) {
            (window.navigator as any).msSaveBlob(new Blob([data], { type: extension }), DOWNLOAD_CONTENT);
        } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(data);
            a.download = DOWNLOAD_CONTENT;
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    }
}

function getDownloadContent(fileName: string, extension: string) {
    return extension !== '' ? fileName + '.' + extension : fileName;
}

/**
 * * This function is used to remove array of the list of sub items that comes on response. This is because to remove index and convert to objects
   * so that you can easily display the help text using [] notation as used in html.
   * "value" is used as for obtaining the object name from help text in it.
 * @param helpText
 */

export function setHelpTextForSubItems(helpText, value: string) {
    helpText[value].parentHelpTexts.forEach(subItem => {
        const objectKey = Object.keys(subItem);
        helpText[value][objectKey[0]] = subItem[objectKey[0]];
    });
    return helpText;
}

/**
 * checks whether a given email address is valid or not.
 * @param emailAddress
 */
export function isValidEmailAddress(emailAddress: string): boolean {
    // tslint:disable-next-line: max-line-length
    const emailRgx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)| (".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRgx.test(String(emailAddress).trim().toLowerCase());
}

export function phoneNumberValidation(input: any) {
    const pattern = (/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[0-9]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/);
    if (!pattern.test(input)) {
        const newPattern = /^([a-zA-Z]|[0-9a-zA-Z])+$/;
        return (newPattern.test(input)) ? 'Alphabets cannot be added in  Phone number field.' : ' Please provide a valid phone number';
    } else {
        return null;
    }
}

export function getPathWithoutParams(url: string): string {
    if (url.includes('?')) {
        return url.split('?')[0];
    }
    return url;
}
/**
 * Takes a string and replaces words with values if they are present in the given object. null & empty brackets will be removed by default.
 * @param formatString
 * @param object
 */
export function replaceFormatStringWithValue(formatString: string, object: any): string {
    if (!formatString || !object) { return ''; }
    Object.keys(object).forEach(key => {
        formatString = formatString.replace(key, object[key] || '');
    });
    return formatString.replace(/null/g, '').replace('()', '');
}
/**
 * returns "sponsorCode - sponsorName (acronym)" -> Endpoint format based default value
 * @param sponsor
 */
export function getSponsorSearchDefaultValue(sponsor: any): string {
    return replaceFormatStringWithValue(ENDPOINT_SPONSOR_OUTPUT_FORMAT, sponsor);
}


/**
 * get the particular url part of a give full url string
 * eg:
 * url:      "/fibi/claims/claim-summary/advance"
 * position: 1(fibi), 2(claims), 3(claim-summary), 4(advance)etc.
 * @param url
 * @param position
 */
export function getSpecificUrlPart(url: string, position: number): string {
    return url.split('/')[position] || '';
}

/**
 * picks an object's specified key's value.
 * can pick directly 'key' or nested object 'key.childKey' etc from an object.
 * @param object  the object from which specific key's value needs to be retrieved.
 * @param keyName  key that need to be picked from the object. 'key' | 'key.nestedKey' | 'key.nestedKey.nestedKey2' etc
 * @returns  return either string, number, an object.
 */
export function getValueFromObject(object: any, keyName: string): any  {
    if (!object || !keyName) { return undefined; }

    const getKeyValue = (obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : '';
    const reduceKeyValue = (keys, dataObject) => keys.reduce((obj, key) => getKeyValue(obj, key), dataObject);

    // keys are in string format like 'a.b'
    if (keyName.includes('.')) {
        return reduceKeyValue(keyName.split('.'), object);
    }

    // keys which are directly accessible like 'a'
    return getKeyValue(object, keyName);
}

/**
 * check if an object is having no key value pairs.
 * checks explicitly if the given variable is of type Object.
 * @param obj
 */
export function isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
}
// Format string for unit number and unit name
export function concatUnitNumberAndUnitName(unitNumber: string, unitName: string): string {
    return unitNumber || unitName ? LEAD_UNIT_OUTPUT_FORMAT.replace('unitNumber', unitNumber).replace('unitName', unitName) : '';
}

export function deepCloneObject(obj: any): any {
    const nativeCloneFunction = (window as any).structuredClone;
    if (typeof nativeCloneFunction === 'function') {
        return nativeCloneFunction(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}

export function getOrganizationAddress(data: any) {
    let address = '';
    if (data.organization) {
        if (data.organization.address) {
            address = data.organization.address;
        }
        if (data.organization.country) {
            address = address ? address + ', ' + data.organization.country.countryName : data.organization.country.countryName;
        }
    } else {
        if (data.rolodex.addressLine1) {
            address = data.rolodex.addressLine1;
        }
        if (data.rolodex.addressLine2) {
            address = address ? address + ', ' + data.rolodex.addressLine2 : data.rolodex.addressLine2;
        }
        if (data.rolodex.city) {
                address = address ? address + ' <br>' + data.rolodex.city : data.rolodex.city;
        }

        if (data.rolodex.country) {
            if (data.rolodex.city) {
                    address = address ? address + ',' + data.rolodex.country.countryName : data.rolodex.country.countryName;
            } else {
                    address = address ? address + ' <br>' + data.rolodex.country.countryName : data.rolodex.country.countryName;
            }
        }
    }
    return address;
}

export const range = (min, max) => [...Array(max - min + 1).keys()].map(i => i + min);

export function hideModal(elementId: string) {
    let myModal = document.querySelector(`#${elementId} .btn-close`) as HTMLElement;
    myModal?.click();
}

export function openModal(elementId: string, options = null) {
    options = options || {
      backdrop: 'static',
      keyboard: true,
      focus: true
    }
    let myModal = new bootstrap.Modal(document.getElementById(elementId), options);
    myModal?.show();
  }
