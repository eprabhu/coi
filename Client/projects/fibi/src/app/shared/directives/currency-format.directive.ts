/**
 * Written by Krishnadas M
 * Modified by Ayush Mahadev
 * This is a directive for displaying any input field value as currecy format.
 * For that :
 * 1. we need to add the directive name 'appCurrencyFormat' to the field
 * 2. input type must be "text"
 * 3. Note that, it will only pass the value as string since the input type is text.
 * So if you want the value as number, you should change the value as parseFloat in the ngModelChange
 * function.
 * Param:
 * 1. initialValue: number = If the input field has an initial value to be fetch.
 * 2. currencyFormat = Currency format configured in app.config file.
 * 3. customCurrency = Custom Currency symbol. If this symbol hasnt passed,directive defautly take currencyFormat
 * 4. allowNegative = allow negative currency
 * 5. isNumberFormatOnly = apply number field formatting only to the input. eg: 1000 to 1,000
 */

import { Directive, HostListener, ElementRef, OnInit, Input, OnChanges } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CommonService } from '../../common/services/common.service';
import { CustomNumberPipe } from '../pipes/custom-number.pipe';
import { convertToValidAmount } from '../../common/utilities/custom-utilities';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[ngModel][appCurrencyFormat]',
    providers: [],
})
export class CurrencyFormatDirective implements OnInit, OnChanges {
    private element: any;
    @Input() initialValue: number;
    @Input() customCurrency: any;
    @Input() allowNegative: boolean;
    @Input() isNumberFormatOnly: boolean;
    currencyFormat;
    selected = false;

    constructor(
        private elementRef: ElementRef,
        private currencyPipe: CurrencyPipe,
        public _commonService: CommonService,
        private _customNumberPipe: CustomNumberPipe,
        private ngModel: NgModel
    ) {
        this.element = this.elementRef.nativeElement;
    }
    ngOnInit() {
        if (this.isNumberFormatOnly) {
            setTimeout(() => {
                this.formatNumberField(this.initialValue);
            }, 200);
        } else {
            this.valueToCurrencyFormat();
        }
    }
    /**
     * To trigger the directive when the value of a field is changed without using the respective input field.
     */
    ngOnChanges(changes) {
        if ((changes.inputValue && typeof (changes.inputValue.previousValue) === 'string' &&
            typeof (changes.inputValue.currentValue) === 'number') ||
            this.element.disabled || (changes.customCurrency && changes.customCurrency.previousValue !==
                changes.customCurrency.currentValue)) {
            this.valueToCurrencyFormat();
        }
    }
    /**
     * To convert value to currency format
     */
    valueToCurrencyFormat() {
        this.currencyFormat = this.customCurrency ? this.customCurrency : this._commonService.currencyFormat;
        const usd = parseFloat(String(this.initialValue).replace(/,/g, '').replace(this.currencyFormat, ''));
        if (usd && this.initialValue || this.initialValue === 0) {
            setTimeout(() => {
                this.element.value = this.currencyPipe.transform(usd, this.currencyFormat);
            }, 200);
        } else {
            this.element.value = null;
        }
    }
    /** Method is used for:
     * 1. Restricting '.' & '-' symbols, if already it has been entered once.
     * 2. Allowing only 2 digits to be entered after the decimal point.
     * 3. Allows '-' symbol to enetered only at the first position.
     * 4. Allows '.' only to be entered at last position or before 1 or 2 digits only
     *    (i.e., 123.567 not allowed, 1235.67 or 12356.7 or 123567. allowed).
   */
    restrictValues(value, event) {
        const decimalPlacesCount = (value.match(/[.]/g) && value.indexOf('.') >= 0) ? (value.length - (value.indexOf('.') + 1)) : 0;
        if ((value.match(/[.]/g) && event.key === '.') || (decimalPlacesCount >= 2 && this.element.selectionEnd > value.indexOf('.') &&
            !this.selected)) {
            event.preventDefault();
        }
        if ((value.match(/[-]/g) && event.key === '-') || (event.key === '-' && this.element.selectionEnd !== 0)) {
            event.preventDefault();
        }
        if (event.key === '.' && !value.match(/[.]/g) && (value.length - this.element.selectionEnd > 2)) {
            event.preventDefault();
        }
    }
    /**
    * To restrict alphabets & symbols on keypress
    */
    @HostListener('keypress', ['$event', '$event.target.value'])
    async onInput(event, value) {
        const pattern = this.allowNegative ? /^(-)|[0-9.]$/ : /[0-9.]/;
        if (!pattern.test(String.fromCharCode(event.charCode))) {
            return false;
        }
        await this.getSelection(this.element);
        this.restrictValues(value, event);
    }
    /**
     * To convert currency value to float number on focus
     */
    @HostListener('focus', ['$event.target.value', '$event'])
    onFocus(value, event) {
        const newValue = parseFloat(String(value).replace(/,/g, '').replace(this.currencyFormat, ''));
        if (newValue) {
            this.element.value = newValue;
        } else {
            this.element.value = null;
        }
        if (event.which === 9) {
            return false;
        }
    }
    /**
     *  To convert input value to currency format on focus out
     */
    @HostListener('blur', ['$event.target.value'])
    onBlur(value) {
        value = convertToValidAmount(value);
        this.ngModel.update.emit(value);
        if (this.isNumberFormatOnly) {
            this.formatNumberField(value);
        } else {
            setTimeout(() => {
                this.element.value = value && value !== '/' && value !== '.' ?
                    this.currencyPipe.transform(value, this.currencyFormat) : null;
            });
        }
    }

    /**function accept input, transforms and inserts number formatting using angular's decimal pipe
     * function will be triggered only if the field needs only number formatting eg: 1000 to 1,000
     * @param value
     */
    formatNumberField(value) {
        setTimeout(() => {
            this.element.value = this.element.value ? this._customNumberPipe.transform(value) : null;
        });
    }

    getText(elem) { // only allow input[type=text]/textarea
        if (elem.tagName === 'TEXTAREA' ||
            (elem.tagName === 'INPUT' && elem.type === 'text')) {
            return elem.value.substring(elem.selectionStart, elem.selectionEnd);
            // or return the return value of Tim Down's selection code here
        }
        return null;
    }

    getSelection(element) {
        return new Promise(async (resolve, reject) => {
            const txt = this.getText(element);
            this.selected = !!txt;
            resolve(true);
        });
    }
}
