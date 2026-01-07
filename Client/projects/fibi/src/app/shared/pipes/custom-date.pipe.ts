/**
 * author MaheshSreenath V M
 * custom pipe for Fibi entire date format for fibi will be controlled here.
 * The date formats for the application will be used from the app.constants.ts
 * pipe will currently support 3 types LONG Date SHORT Date(default) and
 * TIME(time in hours minutes and seconds)
 * change the format in app constants as required.
 * please see this document for more details
 * https://docs.google.com/document/d/1dv1dJGwFxK1nSgpoz7flBxDzt7ZJFjdz8-dFsNG_Lhs/edit?pli=1
 * Only TECHNICAL TEAM is allowed to edit this file.
 */
import { DEFAULT_DATE_FORMAT, LONG_DATE_FORMAT, TIME_FORMAT } from '../../app-constants';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';

@Pipe({
  name: 'dateFormatter'
})
export class DateFormatPipe extends DatePipe implements PipeTransform {
  transform(value: any, ...args: string[]): any {
    return value ? super.transform(getDateObjectFromTimeStamp(value), createCustomFormat(args)) : '';
  }
}

@Pipe({
  name: 'dateFormatterWithTimeZone'
})
export class DateFormatPipeWithTimeZone extends DatePipe implements PipeTransform {
  transform(value: any, ...args: string[]): any {
    return value ? super.transform(value, createCustomFormat(args)) : '';
  }
}

function createCustomFormat(args) {
  let format = DEFAULT_DATE_FORMAT;
  args.forEach(arg => {
    format = arg === 'long' ?  LONG_DATE_FORMAT : arg === 'time' ? TIME_FORMAT : format;
  });
  return format;
}
