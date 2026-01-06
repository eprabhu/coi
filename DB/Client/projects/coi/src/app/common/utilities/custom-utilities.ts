import * as bootstrap from 'bootstrap';
import { DEFAULT_UNIT_FORMAT } from '../../app-constants';
import { FormValidationList, MandatoryElementIds } from '../../shared/common.interface';

export type CodeDescriptionFormat = 'CODE - DESCRIPTION' | 'DESCRIPTION - CODE' | 'DESCRIPTION' | 'CODE';

/**
 * Takes a string and replaces words with values if they are present in the given object. null & empty brackets will be removed by default.
 * @param formatString
 * @param object
 */
export function replaceFormatStringWithValue(formatString: string, object: any): string {
    if (!formatString || !object || typeof object !== 'object') { return ''; }
    Object.keys(object).forEach(key => {
        formatString = formatString.replace(key, object[key] || '');
    });
    return formatString.replace(/null/g, '').replace('()', '');
}

/**
 * returns a string format of "<unitNumber> - <unitName>
 * @param sponsor
 */
export function getPersonLeadUnitDetails(unitData: any): string {
    if (unitData && (unitData.hasOwnProperty('homeUnit') || unitData.hasOwnProperty('homeUnitNumber')) && unitData.hasOwnProperty('homeUnitName')) {
        unitData['unitNumber'] = unitData.homeUnit || unitData.homeUnitNumber;
        unitData['unitName'] = unitData.homeUnitName;
        const HAS_VALUE = !!unitData['unitNumber'] || !!unitData['unitName'] || !!unitData.homeUnitNumber || !!unitData.homeUnitName;
        if (!HAS_VALUE) {
            return '';
        }
    }
    return replaceFormatStringWithValue(DEFAULT_UNIT_FORMAT, unitData);
}

/**
 * Formats the amount to a string representation with the appropriate number of decimal places.
 * If the amount is an integer, it will be displayed with two decimal places
 *          --(e.g., 75 -> '75.00').
 * If the amount has decimal places, it will be displayed with the original number of decimal places
 *          --(e.g., 75.767 -> '75.767').
 *
 * @param amount The amount to be formatted.
 * @returns The formatted amount as a string.
 */
export function getFormattedAmount(amount: number): string {
    if (amount) {
        return amount.toFixed(amount % 1 === 0 ? 2 : amount.toString().split('.')[1]?.length || 0);
    }
    return '0';
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
        let QUERY_PARAMS = '';
        queryParamKeys.forEach((key, index) => {
            if (queryParamValues[index]) {
                (index === 0) ? QUERY_PARAMS = key + '=' + queryParamValues[index] : QUERY_PARAMS = QUERY_PARAMS + '&' + key + '=' + queryParamValues[index];
            }
        });
        const COI_PATH = path.includes('/coi/') ? path : '/coi/' + path;
        const URL = window.location.origin + window.location.pathname + '#' + COI_PATH + QUERY_PARAMS;
        window.location.hash.split(/[/?]/).includes('dashboard') ? window.open(URL, '_self') : window.open(URL, URL);
    }
}

export function openSlider(sliderName: string = 'coi-slider'): void {
    document.body.classList.add('overflow-hidden');
    document.getElementById(`${sliderName}-overlay`).style.display = 'block';
    document.getElementById(`${sliderName}-overlay`).classList.add('overlay');

    setTimeout(() => {
        document.getElementById(sliderName).classList.add('slider-opened');
    });
}

export function closeSlider(sliderName: string = 'coi-slider'): void {
    document.getElementById(sliderName).classList.remove('slider-opened');

    setTimeout(() => {
        document.body.classList.remove('overflow-hidden');
        document.getElementById(`${sliderName}-overlay`).style.display = 'none';
    }, 500);
}

export function focusElementById(element_id: string): void {
    const focusElement: HTMLElement | null = document.getElementById(element_id);
    focusElement?.blur();
    focusElement?.focus();
}


export function openCoiSlider(element_id: string): void {
    setTimeout(() => {
        if (element_id) {
            document.body.classList.add('overflow-hidden');
            document.getElementById(`${element_id}-trigger-btn`)?.click();
        }
    });
}

export function closeCoiSlider(element_id: string): void {
    setTimeout(() => {
        if (element_id) {
            document.body.classList.remove('overflow-hidden');
            document.getElementById(`${element_id}-close-btn`)?.click();
        }
    });
}

export function checkForVowelInFirstLetter(word) {
    return ['a', 'e', 'i', 'o', 'u'].includes(word[0].toLowerCase()) ? `an ${word}` : `a ${word}`;
}

/**
 * Scrolls the page to a specified section by its ID, with an optional offset for the header.
 *
 * @param sectionId - The ID of the section to scroll to.
 * @param offsetTop - The offset top, which is subtracted from the scroll position.
 */
export function jumpToSection(sectionId: string | number = '', offset = 0) {
    const SECTION_ELEMENT: HTMLElement | null = document.getElementById(sectionId?.toString());
    // Scroll the element into view
    SECTION_ELEMENT?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Calculate the new scroll position
    const elementRect = SECTION_ELEMENT?.getBoundingClientRect();
    const offsetTop = window.pageYOffset + elementRect?.top - offset;

    // Apply the scroll offset
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
}

export function getFormattedSponsor(sponsorCode: any, sponsorName: any): string {
    return sponsorCode && sponsorName ? `${sponsorCode} - ${sponsorName}` : sponsorCode || sponsorName;
}

/**
 * Opens a common modal dialog by triggering its associated button click event.
 *
 * @param modalName - The name of the modal, used to construct the trigger button's ID.
 */
export function openCommonModal(modalName: string): void {
    const triggerBtn = document.getElementById(`${modalName}-trigger-btn`);
    if (triggerBtn) {
        triggerBtn.click();
        focusElementById(modalName);
    }
}

/**
 * Closes a common modal dialog by triggering its associated close button click event.
 *
 * @param modalName - The name of the modal, used to construct the close button's ID.
 */
export function closeCommonModal(modalName: string = 'common-modal'): void {
    const closeBtn = document.getElementById(`${modalName}-dismiss-btn`);
    if (closeBtn) {
        closeBtn.click();
    }
}

export function scrollToElementWithinBoundaries(focusElement: HTMLElement | undefined, boundaryTop = 0, boundaryBottom = 0, scrollableElement: HTMLElement | any = window) {
    if (focusElement) {
        const elementRect = focusElement.getBoundingClientRect();
        const scrollableRect = scrollableElement === window ? { top: 0, bottom: window.innerHeight } : scrollableElement.getBoundingClientRect();
        const scrollTop = scrollableElement === window ? window.pageYOffset : scrollableElement.scrollTop;

        const absoluteElementTop = elementRect.top + scrollTop - scrollableRect.top;
        const elementBottom = elementRect.bottom + scrollTop - scrollableRect.top;

        const scrollableTop = scrollTop + boundaryTop;
        const scrollableBottom = scrollTop + (scrollableElement === window ? window.innerHeight : scrollableElement.clientHeight) - boundaryBottom;

        if (absoluteElementTop < scrollableTop) {
            scrollableElement.scrollTo({
                top: absoluteElementTop - boundaryTop,
                behavior: 'smooth'
            });
        } else if (elementBottom > scrollableBottom) {
            scrollableElement.scrollTo({
                top: elementBottom - (scrollableElement === window ? window.innerHeight : scrollableElement.clientHeight) + boundaryBottom,
                behavior: 'smooth'
            });
        } else {
            focusElement.scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth'
            });
        }
    }
}

/**
 * Checks if a given `searchText` exists within an object based on specified search keys.
 *
 * @param object - The object to search within.
 * @param searchText - The text to search for. If empty, function returns `true`.
 * @param searchKeys - An array of keys or key definitions to guide the search.
 *   - String keys: direct property names or dot-notation for nested fields.
 *   - Combined keys: enclosed in `[]` (e.g., `[firstName - lastName]`) to check concatenated values.
 *   - Object keys: define parent-child relationships for nested or array properties.
 * @param needFullCheck - If `true`, recursively searches all object/array values beyond specified keys.
 *
 * @returns `true` if the `searchText` is found, otherwise `false`.
 *
 * ### Examples
 * ```ts
 * const OBJ = { firstName: 'John', lastName: 'Doe', address: { city: 'Boston' } };
 *
 * isExistSearchWord(OBJ, 'john', ['firstName'], false); // true
 * isExistSearchWord(OBJ, 'john doe', ['[firstName - lastName]'], false); // true
 * isExistSearchWord(OBJ, 'boston', [{ address: ['city'] }], false); // true
 * isExistSearchWord(OBJ, 'doe', [], true); // true (full recursive search)
 * ```
 */
export function isExistSearchWord(object: any, searchText: string, searchKeys: Array<string | Record<string, any>>, needFullCheck: boolean): boolean {
    if (!searchText) return true;

    for (const SEARCH_KEY of searchKeys) {
        // --- Combined keys like "[firstName - lastName]" ---
        if (typeof SEARCH_KEY === 'string' && SEARCH_KEY.startsWith('[') && SEARCH_KEY.endsWith(']')) {
            const KEY_COMBINATION = SEARCH_KEY.slice(1, -1); // Remove the brackets
            const DELIMITER = KEY_COMBINATION.includes(' - ') ? ' - ' :
                              KEY_COMBINATION.includes(':') ? ':' : ' ';
            const KEYS = KEY_COMBINATION.split(DELIMITER).map(k => k.trim());
            const COMBINED_VALUE = KEYS.map(k => object[k] ? object[k].toString() : '').join(DELIMITER);
            if (doesValueMatchSearchText(COMBINED_VALUE, searchText)) return true;
        } 
        // --- Individual string keys (supports dot notation) ---
        else if (typeof SEARCH_KEY === 'string') {
            const VALUE_1 = SEARCH_KEY.split('.').reduce((o, k) => o?.[k], object);
            if (VALUE_1 && doesValueMatchSearchText(VALUE_1, searchText)) return true;
        } 
        // --- Parent-child keys as objects ---
        else if (typeof SEARCH_KEY === 'object' && SEARCH_KEY !== null) {
            for (const PARENT in SEARCH_KEY) {
                const CHILD_KEYS = SEARCH_KEY[PARENT]; // can be array of strings or nested objects
                const PARENT_VALUE = object[PARENT];
                if (!PARENT_VALUE) continue;
                // If PARENT_VALUE is an object, recursively check child keys
                if (typeof PARENT_VALUE === 'object' && !Array.isArray(PARENT_VALUE)) {
                    if (isExistSearchWord(PARENT_VALUE, searchText, CHILD_KEYS, needFullCheck)) return true;
                }
                // If PARENT_VALUE is an array, check each item recursively
                if (Array.isArray(PARENT_VALUE)) {
                    for (const ITEM of PARENT_VALUE) {
                        if (isExistSearchWord(ITEM, searchText, CHILD_KEYS, needFullCheck)) return true;
                    }
                }
                // If PARENT_VALUE is primitive, check child keys directly
                if (typeof PARENT_VALUE !== 'object') {
                    for (const CHILD_KEY of CHILD_KEYS) {
                        const VALUE_2 = PARENT_VALUE[CHILD_KEY];
                        if (VALUE_2 && doesValueMatchSearchText(VALUE_2, searchText)) return true;
                    }
                }
            }
        }
    }
    // --- Recursive full object/array search ---
    for (const KEY in object) {
        const VALUE_3 = object[KEY];
        if (needFullCheck && VALUE_3 && typeof VALUE_3 === 'object' && !Array.isArray(VALUE_3)) {
            if (isExistSearchWord(VALUE_3, searchText, searchKeys, needFullCheck)) return true;
        }
        if (needFullCheck && Array.isArray(VALUE_3)) {
            for (const ITEM of VALUE_3) {
                if (isExistSearchWord(ITEM, searchText, searchKeys, needFullCheck)) return true;
            }
        }
    }
    return false;
}

export function doesValueMatchSearchText(value: any, searchText: string): boolean {
    // Check if the current value contains the search text
    if (typeof value === 'string' || typeof value === 'number') {
        return value.toString().trim().toLowerCase().includes(searchText.trim().toLowerCase());
    }
    return false;
}

/*
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

export function inputRestrictionForNumberField(input: any) {
    const pattern = /[0-9\+\-\/\ ]/;
    if (!pattern.test(input)) {
        return true;
    } else {
        return null;
    }
}

export function restrictDecimalInput(event: Event, maxBefore = 10, maxAfter = 2): void {
    const INPUT = event.target as HTMLInputElement;
    const VALUE = INPUT.value;
    const PATTERN = new RegExp(`^(\\d{0,${maxBefore}})(\\.\\d{0,${maxAfter}})?`);
    const MATCH = VALUE.match(PATTERN);
    if (MATCH) {
        INPUT.value = MATCH[0];
    } else {
        INPUT.value = '';
    }
}


/**
 * check if an object is having no key value pairs.
 * checks explicitly if the given variable is of type Object.
 * @param obj
 */
export function isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
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

export function hideModal(elementId: string) {
    let myModal = document.querySelector(`#${elementId} .btn-close`) as HTMLElement;
    myModal?.click();
}

export function deepCloneObject(obj: any): any {
    const nativeCloneFunction = (window as any).structuredClone;
    if (typeof nativeCloneFunction === 'function') {
        return nativeCloneFunction(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}

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
    }, 300);

};

/**
 * Resets all radio buttons within a group by the specified name.
 *
 * @param {string} radioGroupName - The name attribute of the radio button group to reset.
 */
export function resetRadioButtons(radioGroupName: string): void {
    const RADIO_INPUTS: NodeListOf<HTMLInputElement> = document.querySelectorAll(`input[name="${radioGroupName}"]`);
    RADIO_INPUTS.forEach((radio: HTMLInputElement) => {
        radio.checked = false;
    });
}

export function combineAddress(primaryAddress1: string = '', primaryAddress2: string = '') {
   primaryAddress1 = primaryAddress1?.trim();
   primaryAddress2 = primaryAddress2?.trim();
   return [primaryAddress1, primaryAddress2].filter(Boolean).join(', ');
}

/**
* restrict input fields to numbers
* @param event
*/
export function inputNumberRestriction(event: any): void {
    const PATTERN = /[0-9]/;
    if (!PATTERN.test(String.fromCharCode(event.charCode))) {
        event.preventDefault();
    }
}

export function showAutoSaveToast(type: 'SUCCESS' | 'ERROR'): void {
    const SUCCESS_TOAST = document.getElementById('success-toast');
    const ERROR_TOAST = document.getElementById('coi-retry-error-toast');
    if (type === 'SUCCESS') {
        SUCCESS_TOAST?.classList.remove('invisible');
        ERROR_TOAST?.classList.add('invisible');
    } else {
        ERROR_TOAST?.classList.remove('invisible');
        SUCCESS_TOAST?.classList.add('invisible');
    }
}

export function hideAutoSaveToast(type: 'SUCCESS' | 'ERROR'): void {
    const SUCCESS_TOAST = document.getElementById('success-toast');
    const ERROR_TOAST = document.getElementById('coi-retry-error-toast');
    if (type === 'SUCCESS') {
        SUCCESS_TOAST?.classList.add('invisible');
    } else {
        ERROR_TOAST?.classList.add('invisible');
    }
}

/**
 * Validates whether the given string is a valid website URL.
 * Accepts all valid TLDs (e.g., .com, .org, .edu, .gov, .net, .io, .info, etc.)
 * 
 * Regex breakdown:
 *  ^(https?:\/\/)?    → Optional "http://" or "https://" at the start
 *  (www\.)?           → Optional "www." prefix
 *  [a-zA-Z0-9-]+      → Domain name (letters, numbers, hyphens)
 *  \.[a-zA-Z]{2,}     → Top-level domain (TLD) with 2 or more letters
 *  (:\d+)?            → Optional port (e.g., :8080)
 *  (\/[^\s]*)?        → Optional path (e.g., /about)
 *  $                  → End of string
 * 
 * @param url - The website URL to validate as a string.
 * @returns A boolean indicating whether the URL is valid.
 */
export function isValidWebsite(url: string): boolean {
    const URL_REGEX = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
    return URL_REGEX.test(url.trim());
}

/**
 * Calculates the count of filled properties in the provided object.
 * @param object The object to check.
 * @param propertiesToCheck Array of property names to evaluate.
 * @returns The count of filled properties.
 */
export function calculateFilledProperties(object: any, propertiesToCheck: readonly string[]): number {
    if (!Object.keys(object).length || !propertiesToCheck) {
        return 0;
    }
    return propertiesToCheck.reduce((count, property) => {
        const VALUE = object[property];

        // Check if the property is filled
        if (Array.isArray(VALUE)) {
            return count + (VALUE.length ? 1 : 0);
        } else if (VALUE) {
            return count + 1;
        }
        return count;
    }, 0);
}

export function getCodeDescriptionFormat(code: string | number, description: string, format: CodeDescriptionFormat = 'CODE - DESCRIPTION'): string {
    if (!code && !description) { return ''; }
    let result: string = format;
    if (!code || !description) { 
        result = result.replace(' - ', '');
    }
    return result.replace('CODE', String(code || '')).replace('DESCRIPTION', description || '');
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
 * Adds or removes a field from the search fields array based on the includeInSearch flag.
 * - If includeInSearch is true and field isn't present, adds the field
 * - If includeInSearch is false and field exists, removes the field
 * @param searchFields - Array of current search fields (modified in-place)
 * @param fieldName - Field name to add/remove
 * @param includeInSearch - Flag determining whether to include the field
 */
export function updateSearchField(searchFields: string[], fieldName: string, includeInSearch: boolean): void {
  const FIELD_INDEX = searchFields.indexOf(fieldName);
  if (includeInSearch && FIELD_INDEX === -1) {
    searchFields.push(fieldName);
  } else if (!includeInSearch && FIELD_INDEX > -1) {
    searchFields.splice(FIELD_INDEX, 1);
  }
}

/**
 * Sanitizes raw HTML input by allowing only a safe subset of tags and attributes.
 * - Disallows dangerous tags like <script>, <iframe>, <video>, etc.
 * - Allows basic formatting tags like <b>, <i>, <p>, <a>, <ul>, <li>, etc.
 * - Filters unsafe attributes such as JavaScript URLs or unsupported properties
 * - Automatically adds security attributes (rel="noopener noreferrer", target="_blank") to <a> tags
 *
 * @param rawHtml - The raw HTML string to be sanitized
 * @returns A cleaned and secure HTML string safe for rendering in the DOM
 */
export function sanitizeHtml(rawHtml: string): string {
    const PARSER = new DOMParser();
    const DOC = PARSER.parseFromString(rawHtml, 'text/html');
    const FRAGMENT = document.createDocumentFragment();
    for (const child of Array.from(DOC.body.childNodes)) {
        const SANITIZED = sanitizeNode(child);
        if (SANITIZED) {
            FRAGMENT.appendChild(SANITIZED);
        }
    }
    const CONTAINER = document.createElement('div');
    CONTAINER.appendChild(FRAGMENT);
    return CONTAINER.innerHTML;
}

function sanitizeNode(node: Node): Node | null {
    const ALLOWED_TAGS = ['b', 'i', 'u', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'span'];
    const ALLOWED_ATTRIBUTES: Record<string, string[]> = {};
    ALLOWED_TAGS.forEach(tag => {
        ALLOWED_ATTRIBUTES[tag] = ['class'];
    });
    ALLOWED_ATTRIBUTES['a'].push('href', 'target', 'rel');
    if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent || '');
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const ELEMENT = node as HTMLElement;
        const TAG_NAME = ELEMENT.tagName.toLowerCase();
        if (!ALLOWED_TAGS.includes(TAG_NAME)) {
            return document.createDocumentFragment();
        }
        const CLEAN_ELEMENT = document.createElement(TAG_NAME);
        const ALLOWED_ATTRS = ALLOWED_ATTRIBUTES[TAG_NAME] || [];
        for (const attr of ALLOWED_ATTRS) {
            const VALUE = ELEMENT.getAttribute(attr);
            if (attr === 'href' && VALUE && !VALUE.startsWith('http') && !VALUE.startsWith('https') && !VALUE.startsWith('mailto')) {
                continue;
            }
            if (VALUE !== null) {
                CLEAN_ELEMENT.setAttribute(attr, VALUE);
            }
        }

        // Enforce rel and target for <a> tags
        if (TAG_NAME === 'a') {
            CLEAN_ELEMENT.setAttribute('rel', 'noopener noreferrer');
            if (!CLEAN_ELEMENT.hasAttribute('target')) {
                CLEAN_ELEMENT.setAttribute('target', '_blank');
            }
        }

        // Recursively sanitize children
        for (const child of Array.from(ELEMENT.childNodes)) {
            const SANITIZED_CHILD = sanitizeNode(child);
            if (SANITIZED_CHILD) {
                CLEAN_ELEMENT.appendChild(SANITIZED_CHILD);
            }
        }
        return CLEAN_ELEMENT;
    }
    return null;
}

/**
 * Utility function to copy a value to clipboard.
 * 
 * @param copyValue - The text or number to copy.
 * @param copyContainer - The container element to temporarily hold the textarea (defaults to document.body).
 */
export function copyToClipboard(copyValue: string | number, copyContainer: HTMLElement = document.body): void {
    const TEXT_AREA_ELEMENT = document.createElement("textarea");
    TEXT_AREA_ELEMENT.value = copyValue?.toString() || '';
    copyContainer.appendChild(TEXT_AREA_ELEMENT);
    TEXT_AREA_ELEMENT.select();
    document.execCommand("copy");
    copyContainer.removeChild(TEXT_AREA_ELEMENT);
}

/**
 * Arranges a flat list of form validation items into a structured hierarchy.
 *
 * @param list - The flat list of validation items to be arranged.
 * @returns A new array where questionnaire parents include their nested child questions.
 * 
*/
export function arrangeFormValidationList(list: any[]): any[] {
    const RESULT: any[] = [];
    const PARENT_MAP = new Map<string, any>();
    list?.forEach(item => {
        const KEY = `${item.sectionId}_${item.componentId}`;
        if (item.componentType === "QN") {
            if (!item.questionId) {
                const PARENT: any = { ...item, questionnaire: [] };
                PARENT_MAP.set(KEY, PARENT);
                RESULT.push(PARENT);
            } else {
                PARENT_MAP.get(KEY)?.questionnaire?.push(item) ?? RESULT.push(item);
            }
        } else {
            RESULT.push(item);
        }
    });
    return RESULT;
}

/**
 * Finds the first unanswered mandatory form element ID for a given form.
 *
 * @param list - The list of form validation items to search through.
 * @param formId - The form ID to locate within the validation list.
 * @returns An object containing:
 * - `elementId`: The ID of the first unanswered mandatory element (or empty if not found).
 * - `buttonId`: The ID of a scroll button (used when no direct element is available).
 */
export function getFirstUnansweredMandatoryFormElementId(list: FormValidationList[], formId: string): MandatoryElementIds {
    const DATA = list?.find(item => item.formBuilderId.toString() === formId)
    if (!DATA) { return { elementId: '', buttonId: '' }; }
    if (DATA.componentType === 'QN') {
        if (DATA.questionnaire?.length && DATA.questionnaire[0]) {
            return {
                elementId: `FB-ques_${DATA.questionnaire[0].componentId}-${DATA.questionnaire[0].questionId}`,
                buttonId: ''
            };
        }
        return {
            elementId: '',
            buttonId: `scrollToMandatoryQuestion-btn-${DATA.sectionId}`
        };
    }
    return {
        elementId: DATA.componentId.toString(),
        buttonId: ''
    };
}

export function getScreenMeasurement(element: any = window): any {
    // Get viewport width and height
    const width: number = element.innerWidth || document.documentElement.clientWidth;
    const height: number = element.innerHeight || document.documentElement.clientHeight;
    const COI_SCROLL = document.body.getBoundingClientRect();

    // Get positions of left, right, top, and bottom edges
    const left: number = COI_SCROLL?.left ? (COI_SCROLL.left + 10) : ( element.screenLeft ?? element.screenX );
    const top: number = element.screenTop ?? element.screenY;
    const right: number = COI_SCROLL?.right ? (COI_SCROLL.right - 10) : ( left + width );
    const bottom: number = top + height;

    return {left, right, top, bottom, height, width}
}

export function  adjustCoordinates(elementToAdjust: HTMLElement, left: number, top: number): { left: number, top: number } {
    const screen = getScreenMeasurement();
    const elementRect = elementToAdjust.getBoundingClientRect();
    top = top < screen.top ? screen.top : top;
    top = top + elementRect.height > screen.bottom ? screen.bottom - elementRect.height - 3 : top;
    left = left < screen.left ? screen.left : left;
    left = left + elementRect.width> screen.right ? screen.right - elementRect.width - 3 : left;
    return { left, top };
}
