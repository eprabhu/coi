import { DEFAULT_DATE_FORMAT } from '../../app-constants';

const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getTimeStampFromDateString(dateString: string) {
    if (checkForDateStringValidation(dateString)) {
        const dateObject = getDateObjectFromDateString(dateString, true);
        return (dateObject != null) ? (+ dateObject) : null;
    } else {
        return null;
    }
}

export function getDateObjectFromDateString(dateString: string, isValidDateString = false) {
    isValidDateString = isValidDateString ? isValidDateString : checkForDateStringValidation(dateString);
    if (isValidDateString) {
        return (DEFAULT_DATE_FORMAT.toLowerCase() === 'mm/dd/yyyy') ? new Date(dateString) : new Date(getUTCDateString(dateString, true));
    } else {
        return null;
    }
}

export function getDateStringFromTimeStamp(dateInTimeStamp: any) {
    const dateOrginal = new Date(dateInTimeStamp);
    const dateFormat = DEFAULT_DATE_FORMAT;

    const dateFormtSpliter = dateFormat.includes('/') ? '/' : (dateFormat.includes('-') ? '-' : ' ');
    const dateFormatArray = dateFormat.split(dateFormtSpliter);

    const dayIndex = getDayIndex(dateFormatArray);
    const monthIndex = getMonthIndex(dateFormatArray);
    const yearIndex = getYearIndex(dateFormatArray);

    const dayValue = getDayInCorrectFormat(dateOrginal.getDate(), dateFormatArray[dayIndex]);
    const monthValue = getMonthInCorrectFormat(dateOrginal.getMonth() + 1, dateFormatArray[monthIndex]);
    const yearValue = getYearInCorrectFormat(dateOrginal.getFullYear(), dateFormatArray[yearIndex]);

    const returnDateArray = [];
    returnDateArray[dayIndex] = dayValue;
    returnDateArray[monthIndex] = monthValue;
    returnDateArray[yearIndex] = yearValue;

    return returnDateArray.join(dateFormtSpliter);
}

export function checkForDateStringValidation(dateString: string) {
    const dateFormat = DEFAULT_DATE_FORMAT;

    const dateFormtSpliter = getDateSpliter(dateFormat);
    const dateStringSpliter = getDateSpliter(dateString);

    const dateFormatArray = dateFormat.split(dateFormtSpliter);
    const dateArray = dateString.split(dateStringSpliter);

    if (dateArray.length !== 3) {
        return false;
    } else {
        const dayIndex = getDayIndex(dateFormatArray);
        const monthIndex = getMonthIndex(dateFormatArray);
        const yearIndex = getYearIndex(dateFormatArray);

        const monthValue = checkMonth(dateArray[monthIndex]);
        const yearValue = checkYear(dateArray[yearIndex]);

        if (monthValue !== -1 && yearValue !== -1) { // valid month & year
            const dayValue = checkDay(dateArray[dayIndex], monthValue, yearValue);
            return (dayValue !== -1) ? true : false;
        } else { // invalid month & year
            return false;
        }
    }
}

export function compareDates(firstDateObject: any, secondDateObject: any, firstDateType = 'timeStamp', secondDateType = 'timeStamp') {
    const firstDate = (firstDateType !== 'dateObject') ? getValidDateObjectForConversion(firstDateObject, firstDateType) : firstDateObject;
    const secondDate = (secondDateType !== 'dateObject') ?
        getValidDateObjectForConversion(secondDateObject, secondDateType) : secondDateObject;
    return (firstDate !== null && secondDate !== null) ? compareDateObjects(firstDate, secondDate) : 100;
}

export function getCurrentTimeStamp() {
    return (+ new Date());
}

export function getDateObjectFromTimeStamp(dateInTimeStamp: any) {
    const temp_date = new Date(dateInTimeStamp);
    if (dateInTimeStamp && temp_date instanceof Date && !isNaN(temp_date.valueOf())) {
        const userTimezoneOffset = temp_date.getTimezoneOffset() * 60000;
        return new Date(temp_date.getTime() + userTimezoneOffset);
    } else {
        return null;
    }
}

export function getTimeStampFromDateObject(dateObject: any) {
    return (+ dateObject);
}


function getValidDateObjectForConversion(dateData: any, dateFormat: string) {
    switch (dateFormat) {
        case 'timeStamp':
            return new Date(dateData);
        case 'dateString':
            return getDateObjectFromDateString(dateData);
    }
}

function compareDateObjects(firstDate: any, secondDate: any) {
    return (firstDate < secondDate) ? -1 : ((firstDate > secondDate) ? 1 : 0);
}
function compareTimeStampDates(firstDateObject: any, secondDateObject: any) {
    const firstDate = new Date(firstDateObject);
    const secondDate = new Date(secondDateObject);
    return compareDateObjects(firstDate, secondDate);
}
function compareDateString(firstDateString: string, secondDateString: string) {
    return compareDateObjects(getDateObjectFromDateString(firstDateString), getDateObjectFromDateString(secondDateString));
}

function getUTCDateString(dateString: string, isValidDateString = false) {
    isValidDateString = isValidDateString ? isValidDateString : checkForDateStringValidation(dateString);
    if (isValidDateString) {
        const dateFormat = DEFAULT_DATE_FORMAT;

        const dateFormtSpliter = getDateSpliter(dateFormat);
        const dateStringSpliter = getDateSpliter(dateString);

        const dateFormatArray = dateFormat.split(dateFormtSpliter);
        const dateArray = dateString.split(dateStringSpliter);

        const dayIndex = getDayIndex(dateFormatArray);
        const monthIndex = getMonthIndex(dateFormatArray);
        const yearIndex = getYearIndex(dateFormatArray);

        const returnDateArray = [];
        returnDateArray[1] = dateArray[dayIndex];
        returnDateArray[0] = dateArray[monthIndex];
        returnDateArray[2] = dateArray[yearIndex];

        return returnDateArray.join(dateFormtSpliter);
    } else {
        return null;
    }
}

function getDateSpliter(dateString: string) {
    return dateString.includes('/') ? '/' : (dateString.includes('-') ? '-' : ' ');
}

function checkMonth(monthString: string) {
    const month = parseInt(monthString, 10);
    return (Number.isNaN(month) || (month <= 0 || month >= 13)) ? -1 : month;
}
function checkDay(dayString: string, month: number, year: number) {
    const daysInMonth = getDaysInMonth(month, year);
    const day = parseInt(dayString, 10);
    return (Number.isNaN(day) || (day <= 0 || day >= daysInMonth)) ? -1 : day;
}
function checkYear(yearString: string) {
    const year = parseInt(yearString, 10);
    return (Number.isNaN(year) || (year <= 0 || year >= 3000)) ? -1 : year;
}
function getDaysInMonth(month, year) {
    // Here January is 1 based
    // Day 0 is the last day in the previous month
    return new Date(year, month, 0).getDate();
    // Here January is 0 based
    // return new Date(year, month+1, 0).getDate();
}
function getDayInCorrectFormat(dayNumber: number, dayFormat: string) {
    return (dayNumber <= 9) ? ('0' + dayNumber) : dayNumber;
}
export function getMonthInCorrectFormat(monthNumber: number, monthFormat: string) {
    switch (monthFormat) {
        case 'mm':
        case 'MM':
            return (monthNumber <= 9) ? ('0' + monthNumber) : monthNumber;
        case 'mmm':
        case 'MMM':
            return shortMonths[monthNumber];
    }
}
function getYearInCorrectFormat(yearNumber: number, yearFormat: string) {
    switch (yearFormat) {
        case 'yy':
        case 'YY':
            yearNumber = yearNumber % 100;
            return (yearNumber <= 9) ? ('0' + yearNumber) : yearNumber;
        case 'yyy':
        case 'YYY':
            yearNumber = yearNumber % 1000;
            return (yearNumber <= 9) ? ('00' + yearNumber) : (yearNumber <= 99 ? ('0' + yearNumber) : yearNumber);
        case 'yyyy':
        case 'YYYY':
            return yearNumber;
    }
}
function getMonthIndex(dateFormatArray: string[]) {
    const monthIndex = (dateFormatArray[0].includes('m') || dateFormatArray[0].includes('M')) ? 0 :
        ((dateFormatArray[1].includes('m') || dateFormatArray[1].includes('M')) ? 1 : 2);
    return monthIndex;
}

function getYearIndex(dateFormatArray: string[]) {
    const yearIndex = (dateFormatArray[0].includes('y') || dateFormatArray[0].includes('Y')) ? 0 :
        ((dateFormatArray[1].includes('y') || dateFormatArray[1].includes('Y')) ? 1 : 2);
    return yearIndex;
}

function getDayIndex(dateFormatArray: string[]) {
    const yearIndex = (dateFormatArray[0].includes('dd') || dateFormatArray[0].includes('DD')) ? 0 :
        ((dateFormatArray[1].includes('DD') || dateFormatArray[1].includes('dd')) ? 1 : 2);
    return yearIndex;
}

export function compareDatesWithoutTimeZone(firstDateObject: any,
    secondDateObject: any, firstDateType = 'timeStamp', secondDateType = 'timeStamp') {
    const firstDate = (firstDateType !== 'dateObject') ? getValidDateObjectForConversion(firstDateObject, firstDateType) : firstDateObject;
    const secondDate = (secondDateType !== 'dateObject') ?
        getValidDateObjectForConversion(secondDateObject, secondDateType) : secondDateObject;
    return (firstDate !== null && secondDate !== null) ?
        compareDateObjects(removeTimeZoneFromDateObject(firstDate), removeTimeZoneFromDateObject(secondDate)) : 100;
}

export function removeTimeZoneFromDateObject(date) {
    return new Date(date).setHours(0, 0, 0, 0);
}

export function getTimeInterval(previousDate) {
    let timeString = '';
    const dateNow = getCurrentTimeStamp();
    if (previousDate < dateNow) {
        const seconds = Math.floor((dateNow - (previousDate)) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const DATEOBJ = getDuration(previousDate, dateNow);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            timeString = getTimeIntervalInDays(timeString, DATEOBJ);
        }
        if (days === 0) {
            timeString = getTimeIntervalInHours(timeString, hours, minutes, days);
        }
        if (days === 0 && hours === 0 && minutes === 0) {
            timeString = timeString.concat('just now');
        }
    } else {
        timeString = timeString.concat('just now');
    }
    return (timeString);
}

function getTimeIntervalInDays(timeString, DATEOBJ) {
    timeString = timeString.concat(DATEOBJ.durInYears !== 0 ? DATEOBJ.durInYears + ' year(s) ' : '');
    timeString = timeString.concat(DATEOBJ.durInMonths !== 0 ? DATEOBJ.durInMonths + ' month(s) ' : '');
    timeString = timeString.concat(DATEOBJ.durInDays !== 0 ? DATEOBJ.durInDays + ' day(s) ' : '');
    timeString = timeString.concat('ago');
    return timeString;
}

function getTimeIntervalInHours(timeString, hours, minutes, days) {
    hours = hours - (days * 24);
    minutes = minutes - (days * 24 * 60) - (hours * 60);
    // seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
    timeString = timeString.concat(hours !== 0 ? hours + ' hr(s) ' : '');
    timeString = timeString.concat(hours === 0 && minutes !== 0 ? minutes + ' min(s) ' : '');
    timeString = timeString.concat(hours !== 0 || minutes !== 0 ? ' ago' : '');
    return timeString;
}

export function parseDateWithoutTimestamp(dateValue: any) {
    const date = new Date(dateValue);
    if (dateValue && date instanceof Date && !isNaN(date.valueOf())) {
        return (date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2));
    } else {
        return null;
    }
}


export function getDuration(startDate: Date | any, endDate: Date | any, isIncludeStartDate = true, isIncludeEndDate = true) {
    let actualStartDate = new Date(startDate);
    let actualEndDate = new Date(endDate);
    actualStartDate = (isIncludeStartDate) ? actualStartDate : new Date(actualStartDate.setDate(actualStartDate.getDate() + 1));
    actualEndDate = (isIncludeEndDate) ? actualEndDate : new Date(actualEndDate.setDate(actualEndDate.getDate() - 1));
    startDate = getStartDateAfterRemovingIncompleteMonth(actualStartDate, actualEndDate);
    endDate = getEndDateAfterRemovingIncompleteMonth(actualEndDate, actualStartDate);
    let years = 0, months = 0, days = 0;
    let currentMonth = startDate.getMonth();
    let currentYear = startDate.getFullYear();
    let differenceInDays = getDifferenceInDays(startDate, endDate);
    let daysInCurrentMonth = getNumberOfDaysInAMonth(currentMonth, currentYear);
    while (differenceInDays > 0 && (differenceInDays >= daysInCurrentMonth)) {
        differenceInDays = differenceInDays - daysInCurrentMonth;
        months += 1;
        currentMonth = currentMonth + 1;
        if (months == 12) {
            years += 1;
            months = 0;
        }
        if (currentMonth === 12) {
            currentMonth = 0;
            currentYear += 1;
        }
        daysInCurrentMonth = getNumberOfDaysInAMonth(currentMonth, currentYear);
    }
    days = differenceInDays > 0 ? differenceInDays : 0;
    daysInCurrentMonth = 0;
    if (actualStartDate !== startDate) {
        days += getNumberOfDaysInAMonth(actualStartDate.getMonth(), actualStartDate.getFullYear()) - actualStartDate.getDate() + 1;
        daysInCurrentMonth = getNumberOfDaysInAMonth(actualStartDate.getMonth(), actualStartDate.getFullYear());
    }
    if (actualEndDate !== endDate) {
        days += actualEndDate.getDate();
        daysInCurrentMonth = daysInCurrentMonth === 0 ?
            getNumberOfDaysInAMonth(actualEndDate.getMonth(), actualEndDate.getFullYear()) : daysInCurrentMonth;
    }
    daysInCurrentMonth = daysInCurrentMonth === 0 ?
        getNumberOfDaysInAMonth(actualStartDate.getMonth(), actualStartDate.getFullYear()) : daysInCurrentMonth;
    if (days >= daysInCurrentMonth) {
        days -= daysInCurrentMonth;
        months += 1;
        if (months == 12) {
            years += 1;
            months = 0;
        }
    }
    return { durInDays: days, durInMonths: months, durInYears: years }
}

function getDifferenceInDays(startDate: Date, endDate: Date): number {
    const start = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    let numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return numberOfDays;
}

function getNumberOfDaysInAMonth(month, year): number {
    const numberOfDays = {
        0: 31,
        2: 31,
        3: 30,
        4: 31,
        5: 30,
        6: 31,
        7: 31,
        8: 30,
        9: 31,
        10: 30,
        11: 31
    };
    return (month !== 1) ? numberOfDays[month] : ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) ? 29 : 28;
}

function getStartDateAfterRemovingIncompleteMonth(startDate: Date, actualEndDate: Date) {
    if (startDate.getDate() === 1) {
        return startDate;
    } else {
        const newStartDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
        return newStartDate >= actualEndDate ? startDate : newStartDate;
    }
}

function getEndDateAfterRemovingIncompleteMonth(endDate: Date, actualStartDate: Date) {
    let numberOfDaysInMonth = getNumberOfDaysInAMonth(endDate.getMonth(), endDate.getFullYear());
    if (endDate.getDate() === numberOfDaysInMonth) {
        return endDate;
    } else {
        let previousMonth = endDate.getMonth() - 1 >= 0 ? endDate.getMonth() - 1 : 11;
        let currentYear = endDate.getFullYear();
        if (previousMonth === 11) {
            currentYear -= 1;
        }
        numberOfDaysInMonth = getNumberOfDaysInAMonth(previousMonth, currentYear);
        const newEndDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, numberOfDaysInMonth);
        return newEndDate <= actualStartDate ? endDate : newEndDate;
    }
}

/**
 * this function date object from date picker is given 
 * in valid date format. input value for this function will
 * be moment object.
 * Here, if date is selected from picker the type of _i will be 
 * date object, so it will be in correct format.
 * if it is typed value, type of _i will be string.
 * in that case _i will be checked with date regular expression.
 * If incorrect date or month is entered momentObject will be null and
 * false will be return.
 * @param event
 */
export function isValidDateFormat(event: any) {
    if (event) {
        if (typeof (event._i) == 'object') {
            return true;
        } else {
            if ((event._i.match(/^\d{2}\/\d{2}\/(\d{4})$/))) {
                return true;
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}

// calculation of no. of days between two date
export function getTotalNoOfDays(startDate, endDate): number {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const Difference_In_Time = endDate.getTime() - startDate.getTime();
    const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    return Difference_In_Days;
}


