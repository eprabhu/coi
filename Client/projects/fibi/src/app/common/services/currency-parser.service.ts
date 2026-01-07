import { Injectable } from '@angular/core';
import { CustomCurrencyPipe } from '../../shared/pipes/custom-currency.pipe';
import { CustomNumberPipe } from '../../shared/pipes/custom-number.pipe';

@ Injectable()
export class CurrencyParserService {

constructor( private _currencyPipe: CustomCurrencyPipe, private _numberPipe: CustomNumberPipe) { }

    /**
     *author Mahesh Sreenath V M
     * modified by Ramlekshmy I
     * @export
     * @param {(number | string)} currency
     * @param {(boolean)} isCurrency
     * @returns
     * converts the timestamp into currency format currently hard coded into dd/mm/yyyy
     * 900000000000 format del 898899999 format ins
     */
    parseValues(currency, isCurrency) {
        if (currency) {
            const TAG = this.findTag(currency);
            const CURRENCY = this.formatCurrency(this.findValues(currency), isCurrency);
            return TAG ? this.addTagToCurrency(TAG, CURRENCY) : CURRENCY[0];
        } else {
            return '';
        }
    }

    /**
     * @param {(number | string)} number
     * call parseCurrency if parsing has to be done for amount fields from parent components
     * Sets isCurrency to true while calling parseNumber
     */
    parseCurrency(currency: number | string) {
        return this.parseValues(currency, true);
    }

    /**
     * @param {(number | string)} number
     * call parseNumber if parsing has to be done for number fields.
     * Sets isCurrency to false while calling parseNumber fn to transform value to number format eg: 1,100
     */
    parseNumber(number: number | string) {
        return this.parseValues(number, false);
    }

    /**
     *finds if there is any ins or del tag associated with the string
     this is because we enclose currencies in ins or del tag while comparing versions
     this help us find what tag has been used to enclose the data
     *
     * @param {(number | string)} currency
     * @returns
     */
    findTag(currency: number | string) {
        return currency.toString()[1] === 'i' ? 'ins' : currency.toString()[1] === 'd' ? 'del' : '';
    }
    /**
     *formats the currency and its is  considered as array because there may be two currencies to compare
     * @param {Array< string>} currency s
     * @param isCurrency
     * @returns
     */
    formatCurrency(currencies: Array<string>, isCurrency) {
        currencies = currencies.map(currency  => isCurrency ? this.setCurrencyFormat(currency ) : this.setNumberFormat(currency));
        return currencies;
    }
    /**
     *find the timestamp from the currency  given first we remove the tags and replace them with #.
      then splits the string to find the actual timestamps from the HTML string
     *
     * @param {(number | string)} currency
     * @returns
     */
    findValues(currency: number | string) {
        return currency.toString().replace(/<[^>]*>/g, '#').split('#').filter(Boolean);
    }

    /**
     *formats the given currency  to dd/mm/yyyy format
     *
     * @param {Date} currency
     * @returns
     */
    setCurrencyFormat(currency: any ) {
       return currency ? this._currencyPipe.transform(currency) : '';
    }

    /**
     *formats the given number with dollar seperator
     *
     * @param number
     * @returns
     */
    setNumberFormat(number) {
        return number ? this._numberPipe.transform(number) : null;
    }

    /**
     *add tags to the currency  field according to tag which was first initialized to it.
     we also check whether there another currency  that also need to enclosed in html tag
     the type of tag is found using the firstTag value.
     if first Tag is ins then ins will be used to enclose the currency  otherwise del in the case of
     currency [1] if the first tag is ins then del will be used since the currency [0] has already used ins tag
     *
     * @param {string} firstTag
     * @param {Array< string>} currencies
     * @returns
     */
    addTagToCurrency(firstTag: string, currencies: Array<string>) {
        currencies[0] = firstTag === 'ins' ? '<ins>' + currencies[0] + '</ins>' : '<del>' + currencies[0] + '</del>';
        if (currencies[1]) {
            currencies[0] += ' ' + firstTag === 'ins' ? '<del>' + currencies[1] + '</del>' : '<ins>' + currencies[1] + '</ins>';
        }
        return currencies[0];
    }
}
