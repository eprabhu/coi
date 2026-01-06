import { getDateObjectFromTimeStamp } from "../../common/utilities/date-utilities";

/**
 * Written By Mahesh Sreenath V M
 * A wrapper function which maps the data into a calender view format
 * Last edited on 12-11-2019
 */
export function ObjectMapper(data: any, metadata: any, currentYear: number) {
    return Array.isArray(data) ? formatData(data, metadata, currentYear ) : [];
}
/**
 * @param  {any} data
 * @param  {any} metadata
 * @param  {number} currentYear
 * Returns an array of formatted data for the calendar view.
 *   data format is [{
 *   data: actual given data,
 *   months: array of months with color to be shown
 *   dates: array with corresponding dates
 * }]
 */
function formatData(data: any, metadata: any, currentYear: number) {
    const dataList = [];
    let newData = {};
    const isColorFillEnabled = checkForFillInMetaData(metadata);
    const isColorEnabled =  checkForcolorInMetaData(metadata);
    data.forEach(d => {
        newData = setHeaders(d, metadata);
        newData['data'] = JSON.parse(JSON.stringify(d));
        const { monthArray = [], datesArray = [] } = setMonths(d, metadata, isColorFillEnabled, isColorEnabled, currentYear);
        newData['months'] = monthArray;
        newData['dates'] = datesArray;
        dataList.push(JSON.parse(JSON.stringify(newData)));
    });
    return dataList;
}
/**
 * @param  {any} data
 * @param  {any} metadata
 * Returns an object of headers from the metadata wich is passed.
 * All the values for headers given in the meta dat will be assigned from here
 */
function setHeaders(data: any, metadata: any) {
    const headerData = {};
    Object.keys(metadata.headers).forEach((k) => headerData[k] = findDataInObject(data, metadata.headers[k]));
    return headerData;
}
/**
 * @param  {any} data
 * @param  {any} metadata
 * @param  {boolean} isFillEnabled
 * @param  {boolean} isColorEnabled
 * @param  {number} currentYear
 * It creates an empty month array and after creating a month object, it finds the positions of month array where data is present
 * and returns the month array .Month object is created so that
 * it help to easily find the corresponding dates to be plotted in the calender view.
 * fill color is called in before plot so that plot color will be the last one in the monthArray
 * since fill color fill from start to end rather than in between
 */
function setMonths(data: any, metadata: any, isFillEnabled: boolean, isColorEnabled: boolean , currentYear: number) {
    let monthArray = ['', '', '', '', '', '', '', '', '', '', '', ''];
    const datesArray = ['', '', '', '', '', '', '', '', '', '', '', ''];
    const monthObject = createMonthObject(data, metadata.dates, currentYear, datesArray);
    monthArray = isFillEnabled ? fillColor(monthArray, monthObject, metadata.fill, metadata.fillColor) : monthArray;
    monthArray = isColorEnabled ? plotColorToMonths(monthArray, monthObject, metadata.color) : monthArray;
    return { monthArray, datesArray };
}
/**
 * @param  {any} data
 * @param  {any} dates
 * @param  {number} currentYear
 * @param  {any} datesArray
 * return an Object which contains month details and the correponding date in the month date is plotted in the datesArray.
 * Object will contain the corresponding value for the details given in the metadata for dates
 */
function createMonthObject(data: any, dates: any, currentYear: number, datesArray: any) {
    const months = {};
    Object.keys(dates).forEach(key => {
        const date = findDataInObject(data, dates[key]);
        const month = getMonthFromDate(date, currentYear);
        datesArray[month] = getDate(date, currentYear);
        months[key] = month || month === 0 ?  month : null;
    });
    return months;
}

/**
 * @param  {} date
 * @param  {} currentYear
 * Determines the year from the date given and checks if the year <= passed current year
 * then gets the exact date from the date passed.
 */
function getDate(date, currentYear) {
    if (getDateObjectFromTimeStamp(date).getFullYear() === currentYear) {
       return getDateObjectFromTimeStamp(date).getDate();
    }
}
/**
 * @param  {any} monthArray
 * @param  {any} monthObject
 * @param  {any} color
 * Plots the respective colors to the positions of month array where data is present.
 */
function plotColorToMonths(monthArray: any, monthObject: any, color: any) {
    Object.keys(monthObject).forEach(key => {
        if (monthObject[key] != null) {
            monthArray.splice(monthObject[key], 1, color[key]);
        }
    });
    return monthArray;
}
/**
 * @param  {any} monthArray
 * @param  {any} monthObject
 * @param  {any} fill
 * @param  {string} fillColor
 * It checks if the month object has a start and a fill color, then it creates a starting and an ending posisition and
 * fills the color in between with the fill color passed.
 */
function fillColor(monthArray: any, monthObject: any, fill: any, fillingColor: string) {
    if ( monthObject[fill['start']] && fillingColor) {
        monthArray.fill(fillingColor, monthObject[fill['start']], monthObject[fill['end']]);
    }
    return monthArray;
}
/**
 * @param  {any} data
 * @param  {string} path
 * Returns the value of data when data and its path is given as input.
 */
export function findDataInObject(data: any, path: string) {
    path.split('.').every(p => data[p] ? data = data[p] : false);
    return data;
}
/**
 * @param  {} date
 * @param  {} currentYear
 * Determines the year from the date given and checks if the year matches withe current year passed
 * then gets the index of month from the current date.
 */
function getMonthFromDate(date, currentYear) {
    if (getDateObjectFromTimeStamp(date).getFullYear() === currentYear) {
        return getDateObjectFromTimeStamp(date).getMonth();
    }
}
/**
 * @param  {} metadata
 * Returns true if the keys of fill property of metadata has length = 2, otherwise false.
 * we can only allow to fill between two different values.
 */
function checkForFillInMetaData(metadata) {
    return Object.keys(metadata.fill).length === 2 ? true : false;
}
/**
 * @param  {} metadata
 * Returns true if the keys of color property of metadata has length > 0, otherwise false.
 */
function checkForcolorInMetaData(metadata) {
    return Object.keys(metadata.color).length > 0 ? true : false;
}
