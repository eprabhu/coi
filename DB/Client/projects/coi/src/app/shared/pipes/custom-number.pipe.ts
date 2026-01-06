/**
 * author Ramlekshmy I
 * custom pipe for entire number formattings in fibi will be controlled here.
 * Developer can simply use the pipe name(eg: <span>{{lineItem?.quantity | customNumber}}</span).
 * Number format parameters are taken from app-constants
 * so that any format changes can be specified in the same variable(only single file change)
 */
import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {NUMBER_FORMAT} from "../../../../../fibi/src/app/app-constants";

@ Pipe({
  name: 'customNumber'
})
export class CustomNumberPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) { }

  transform(value: any): any {
    return this.decimalPipe.transform(value, NUMBER_FORMAT);
  }

}
