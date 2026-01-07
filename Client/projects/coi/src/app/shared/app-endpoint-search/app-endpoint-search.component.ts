/**
 * A common http search component works on the basis of search string and endpoint
 */
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AppEndpointSearchService } from './app-endpoint-search.service';
import { Subscription } from 'rxjs';
import { replaceFormatStringWithValue } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { SearchLengthValidatorOptions } from '../common.interface';

@Component({
    selector: 'app-endpoint-search',
    templateUrl: './app-endpoint-search.component.html',
    styleUrls: ['./app-endpoint-search.component.scss'],
    providers: [AppEndpointSearchService]
})
export class AppEndpointSearchComponent implements OnChanges, OnInit, OnDestroy {

    @Input() httpOptions: any = {};
    @Input() placeHolder: string;
    @Input() searchOnFocus = false;
    @Input() addSearchText = false;
    @Input() clearField: String;
    @Input() isError: boolean;
    @Input() isDisabled: boolean;
    @Input() enableCommaSeparator = false;
    @Input() uniqueId = null;
    @Input() canEmitSearchText = false; //If the search string given in the text box needs to be emitted from this endpoint, instead of the selected value, we should set it to true.
    @Input() searchLimiterOptions = new SearchLengthValidatorOptions();
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEmpty: EventEmitter<any> = new EventEmitter<any>();
    @Output() onNewValueSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() searchValue: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('searchField', { static: true }) searchField: ElementRef;
    @ViewChild('confirmProceedBtn', { static: true }) confirmProceedBtn: ElementRef;

    searchText = '';
    tempSearchText = '';
    isResultSelected = true;
    timer: any;
    results = [];
    counter = -1;
    $subscriptions: Subscription[] = [];
    newSearchText = '';
    pipeSeparatedText: string = '';
	isShowResultValue = false;
	content = '';
    canCallEmit = false;
    emitValueTimeOut: any;
    apiErrorMessage = 'Search failed. Please clear and retry.';
    isAPIFailed = false;

    constructor(private _appEndpointSearchService: AppEndpointSearchService, private _ref: ChangeDetectorRef) { }

    ngOnInit() {
        this.searchText = this.httpOptions && this.httpOptions.defaultValue || '';
    }

    ngOnChanges() {
        if (!this.isError) {
            this.searchText = this.httpOptions && this.httpOptions.defaultValue || '';
        }
        setTimeout(() => {
            this.clearField = '' + this.clearField;
            if (this.clearField === 'true') {
                this.searchText = '';
                this.results = [];
                this.clearField = new String('false');
            }
        });
        this.isError ? this.searchField.nativeElement.classList.add('is-invalid')
            : this.searchField.nativeElement.classList.remove('is-invalid');
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        if (this.emitValueTimeOut) {
            clearTimeout(this.emitValueTimeOut);
        }
    }

    getCommaSeparatedText(temporaryText: string) {
        if (this.addSearchText && this.enableCommaSeparator && temporaryText.includes(',')) {
            let SEPARATED_TEXT_LIST = temporaryText.split(',').filter(value => value.trim() != '');
            SEPARATED_TEXT_LIST.forEach((value, index) => {
                if (index == 0) {
                    this.pipeSeparatedText = `"` + value.trim() + `" `;
                } else {
                    this.pipeSeparatedText += ` | "` + value.trim() + `"`;
                }
            });
        } else {
            this.pipeSeparatedText = '';
        }
    }

    /**
	 * calls an API with respect user inputs (path and search string) and the result is formatted in string of label
	 */
	getEndpointSearchResult(): void {
		if (this.httpOptions) {
            this.isShowResultValue = false;
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				const temporaryText = this.searchText.trim();
                this.isShowResultValue = false;
				this.newSearchText = this.addSearchText ? temporaryText : '';
                this.$subscriptions.push(
                    this._appEndpointSearchService.endpointSearch(this.httpOptions.path, temporaryText, this.httpOptions.params)
                        .subscribe((resultArray: any) => {
                            this.results = [];
                            this._ref.markForCheck();
                            this.isResultSelected = this.httpOptions.defaultValue === this.searchText ? true : false;
                            this.counter = -1;
                            this.isAPIFailed = false;
                            if (resultArray.length > 0) {
                                if (this.httpOptions.formatString) {
                                    resultArray.forEach((el, i) => {
                                        const label = replaceFormatStringWithValue(this.httpOptions.formatString, resultArray[i]);
                                        this.results.push({ 'label': label, 'value': el });
                                    });
                                }
                                setTimeout(() => {
                                    this.content = this.results.length + ' data found. Please use your arrow keys to navigate';
                                    this.isShowResultValue = true;
                                }, 1500);
                            } else {
                                this.onEmpty.emit({ 'searchString': this.searchText });
                                if (!this.addSearchText && !this.canEmitSearchText) {
                                    this.results.push({ 'label': 'No results' });
                                }
                                setTimeout(() => {
                                    this.content = 'No data found. Please search with another value';
                                    this.isShowResultValue = true;
                                }, 1500);
                            }
                        }, err => {
                                this.isAPIFailed = true;
                                this.isShowResultValue = true;
                                this.results = [];
            					this.results.push({ 'label': this.apiErrorMessage });
                        }
                    ));
			}, 500);
		}
	}
  setUnquieIdForSearchText() {
    this.searchField.nativeElement.id = this.uniqueId ?  this.uniqueId : Math.random() + '';
  }
    /**
     * call on focus this creates a empty search string call
     * use this wisely if data is large it can cause error
     */
    getEndpointSearchResultOnfocus(): void {
        if (this.searchOnFocus) {
            this.getEndpointSearchResult();
        } else {
            this.newSearchText = '';
            this.pipeSeparatedText = '';
        }
    }

    /**
     * @param  {} value emit results on key enter mouse click to parent components
     */
    emitSelectedObject(value: any): void {
        this.counter = -1;
        if (value) {
            this.canEmitSearchText ? this.emitSearchedText(value) : this.emitSelectedValueFromList(value);
        } else {
            this.isResultSelected = true;
            setTimeout(() => {
                this.searchText = '';
            });
            this.onSelect.emit(null);
        }
        setTimeout(() => {
            this.httpOptions.defaultValue = this.searchText;
        });
        this.results = [];
    }

    private emitSearchedText(value: any): void {
        if (typeof value === 'string') {
            this.onSelect.emit({ value_source: 'DEFAULT_SEARCH_TEXT', value: value });
        } else {
            this.emitSelectedValueFromList(value);
        }
    }

    private emitSelectedValueFromList(value: any): void {
        this.isResultSelected = true;
        this.onSelect.emit(value);
        this.emitValueTimeOut = setTimeout(() => {
            this.searchText = replaceFormatStringWithValue(this.httpOptions.contextField, value);
        });
    }

    backSpaceEvent(): void {
        this.onSelect.emit(null);
        this.getEndpointSearchResult();
    }

    getEndPointSearchValueOnFocusOut(): void {
        this.searchValue.emit(this.searchText === 'ADD_NEW_SEARCH_TEXT' ? this.newSearchText : this.searchText);
        setTimeout(() => {
            if(!this.canEmitSearchText) {
                this.searchText = this.isResultSelected ? this.searchText : '';
            }
        });
        this.newSearchText = '';
        this.results = [];
        if(this.canCallEmit && !this.isResultSelected) {
            this.emitSelectedObject(this.searchText);
        }
    }

    emitSearchText(searchText, isPipeSeparated): void {
        if (this.enableCommaSeparator) {
            let selectedKeyword = [];
            if (isPipeSeparated) {
                if (searchText.includes('|')) {
                    searchText = searchText.replace(/"/g, '');
                }
                selectedKeyword = searchText.split('|').map(str => str.trim());;
                this.onNewValueSelect.emit(selectedKeyword);
            } else {
                selectedKeyword.push(searchText);
                this.onNewValueSelect.emit(selectedKeyword);
            }

        } else {
            this.onNewValueSelect.emit({ 'searchString': searchText });
        }
    }

    controlSearchEmit(event: any) {
        if(typeof event === 'string' && this.canEmitSearchText) {
            this.emitSelectedObject(event);
        } else {
            this.emitSelectedValue(event);
        }
        this.newSearchText = '';
    }

    private emitSelectedValue(event: any): void {
        if (event.option.id === 'ADD_NEW_SEARCH_TEXT') {
            this.isResultSelected = true;
            this.emitSearchText(this.newSearchText, false)
        } else if (event.option.id === 'PIPE_SELECTED_VALUE') {
            this.isResultSelected = true;
            this.emitSearchText(this.pipeSeparatedText, true)
        } else {
            this.emitSelectedObject(event.option.value ? event.option.value.value : null)
        }
    }

    emitText(): void {
        if (!this.isResultSelected && this.canEmitSearchText) {
            if (this.results.length === 0) {
                this.emitSelectedObject(this.searchText);
            } else {
                this.canCallEmit = true;
            }
        }
    }

}
