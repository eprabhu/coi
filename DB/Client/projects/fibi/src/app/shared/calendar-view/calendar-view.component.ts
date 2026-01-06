/**Last edited by Mahesh Sreenath V M
 * fixed issues with date and missing years on year wise view
 */
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ObjectMapper, findDataInObject } from './ObjectMapper';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit, OnChanges {

  @Input() data = [];
  @Input() metaData: any = {};
  @Output() viewGrantCallEvent = new EventEmitter<any>();

  calendarList: any = [];
  arrayList = [];
  currentYear = null;
  objectKeys = [];
  yearRange: any = [];
  isAscending = false;
  activeHeader = null;
  constructor() { }

  ngOnInit() {
    this.objectKeys = Object.keys(this.metaData.color);
    this.yearRange = this.getYearRange(this.metaData.yearRange);
  }

  ngOnChanges() {
    this.currentYear = this.currentYear === null ? new Date().getFullYear() : this.currentYear;
    this.arrayList = Object.keys(this.metaData.headers);
    this.calendarList = ObjectMapper(this.data, this.metaData, this.currentYear);
  }
  /**
   * @param  {any} year
   * Returns the timestamps of starting year and ending year.
   */
  getTimeStamp(year: any) {
    const timeStamp = {};
    timeStamp['startingTimeStamp'] = this.getStartingTimeStamp(year);
    timeStamp['endingTimeStamp'] = this.getEndingTimeStamp(year);
    return timeStamp;
  }
  /**
   * @param  {number} startingYear
   * Returns the starting year timestamp.
   */
  getStartingTimeStamp(startingYear: number) {
    return new Date('01/01/' + startingYear).getTime();
  }
  /**
   * @param  {number} endingYear
   * Returns the ending year timestamp.
   */
  getEndingTimeStamp(endingYear: number) {
    return new Date('12/31/' + endingYear).getTime();
  }
  /**
   * @param  {} monthIndex
   * Sorts by month according to its index passed.
   * if data matches the month its pushed to sorted array otherwise to unsorted array
   * Multiples array are used to avoid confusion of sorting
   */
  sortByMonth(monthIndex) {
    const sortedArray = [];
    const unsortedArray = [];
    let resultArray = [];
    const dates = Object.keys(this.metaData.dates);
    this.data.forEach(element => {
      !this.checkElementsForSorting(element, monthIndex, dates) ? sortedArray.push(element) : unsortedArray.push(element);
    });
    resultArray = sortedArray.concat(unsortedArray);
    this.calendarList = ObjectMapper(resultArray, this.metaData, this.currentYear);
  }
  /**
   * @param  {any} element
   * @param  {number} monthIndex
   * @param  {any[]} dates
   * Returns true if the any one of the field in  metadata.dates is same as the current user selected month
   * to make it generic for all usecases no values are hardcoded.
   * every is used to solve the logic that atleast one of the date matches the user selected month.
   * which breaks at the first true condition.data is used because we need to find from full list of data
   * instead of current year. current year filtering will be done in object mapper
   * */
  checkElementsForSorting(element: any, monthIndex: number, dates: any[]) {
    return dates.every(key => {
      const data = findDataInObject(element, this.metaData.dates[key]);
      return  monthIndex === new Date(data).getMonth() ? false : true;
    });
  }
  /**
   * @param  {string} header
   * it uses the dynamic header value inside the calendarList created.
   * the multi conditional operator is used according to the value of isAscending flag.
   * first half is for ascending and second one is for descending.
   * 'one' and 'two' variables are created so that to.UpperCase() function need not to be called everytime.
   * which is a micro optimisation
   */
  sortByHeader(header: string) {
    this.activeHeader = header;
    this.calendarList.sort((a, b) => {
      const one  = a[header].toUpperCase();
      const two = b[header].toUpperCase();
      return this.isAscending ? (one > two ? -1 : one < two ? 1 : 0) : (one < two ? -1 : one > two ? 1 : 0);
    });
  }
  /**
   * @param  {any} year
   * @param  {} index
   * Fetches the data of the year selected and shows it on the calendar.
   **/
  switchYear(year: number) {
    this.currentYear = year;
    this.calendarList = ObjectMapper(this.data, this.metaData, this.currentYear);
  }
  /**
   * @param  {number} range
   * Returns the current year and equal number of years towards the right and left from the current year
   */
  getYearRange(range: number) {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = 1; i <= range; i++) {
      years = years.concat([currentYear + i, currentYear, currentYear - i]);
    }
    return new Set(years.sort());
  }

  emitRowDetails(grantDetails) {
    this.viewGrantCallEvent.emit(grantDetails);
  }

   /**
   * @param  {any} dates
   * Returns the corresponding ordinals with the given date.
   */
  getDateOrdinals(dates: any) {
    return ((dates === 1 || dates === 21 || dates === 31) ? 'st' :
            (dates === 2 || dates === 22) ?  'nd' : (dates === 3 || dates === 23) ? 'rd' : 'th');
  }
}
