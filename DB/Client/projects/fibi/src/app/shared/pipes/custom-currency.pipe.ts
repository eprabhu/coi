/**
 * author Saranya T Pillai
 * custom pipe for Fibi entire currency for fibi will be controlled here.
 * Developer can simply use the pipe name(eg: <span>{{periodTotal?.lineItemCost | customCurrency}}</span).
 * Parameters are handled from here.
 */
import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {

  constructor(public _commonService: CommonService,
    private currencyPipe: CurrencyPipe) { }
  /**
    * Decimal representation options, specified by a string
    * in the following format:<br>
    * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
    *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
    * Default is `1`.
    *   - `minFractionDigits`: The minimum number of digits after the decimal point.
    * Default is `2`.
    *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
    * Default is `2`.
   */
  transform(value: any, fractionDigits: any = null): any {
    const digitsInfo = fractionDigits ? `1.${fractionDigits}-${fractionDigits}` : null;
    return this.currencyPipe.transform(value, this._commonService.currencyFormat, 'symbol', digitsInfo);
  }
}
