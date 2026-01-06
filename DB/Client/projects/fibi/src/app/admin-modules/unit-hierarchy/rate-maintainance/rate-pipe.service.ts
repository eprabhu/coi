import { Injectable } from '@angular/core';

@Injectable()
export class RatePipeService {
sortedArray: any;
  constructor() { }
  sortAnArray(array, column, direction) {
    return this.sortedArray = array.sort(function (a, b) {
      if (a[column] === '' || a[column] === null || typeof a[column] === 'undefined') {
        return 1 * direction;
      }
      if (b[column] === '' || b[column] === null || typeof b[column] === 'undefined') {
        return -1 * direction;
      }
      if (column === 'instituteRate' || column === 'fiscalYear') {
        if ((a[column]) <= (b[column])) {
          return -1 * direction;
        }
        if ((a[column]) > (b[column])) {
          return 1 * direction;
        }
      }
      if (column === 'startDate' || column === 'updateTimestamp') {
        if (Number(new Date(a[column])) <= Number(new Date(b[column]))) {
          return -1 * direction;
        }
        if (Number(new Date(a[column])) > Number(new Date(b[column]))) {
          return 1 * direction;
        }
      }
      if (column === 'updateUser' || column === 'onOffCampusFlag') {
        if (((a[column]).toString()).toLowerCase() <= ((b[column]).toString()).toLowerCase()) {
          return -1 * direction;
        }
        if (((a[column]).toString()).toLowerCase() > ((b[column]).toString()).toLowerCase()) {
          return 1 * direction;
        }
      }
      if (((a[column].description).toString()).toLowerCase() <= ((b[column].description).toString()).toLowerCase()) {
        return -1 * direction;
      }
      if (((a[column].description).toString()).toLowerCase() > ((b[column].description).toString()).toLowerCase()) {
        return 1 * direction;
      }
    });
  }

}
