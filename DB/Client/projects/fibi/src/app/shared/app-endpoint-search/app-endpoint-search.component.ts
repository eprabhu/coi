/**
 * A common http search component works on the basis of search string and endpoint
 */
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AppEndpointSearchService } from './app-endpoint-search.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { replaceFormatStringWithValue } from '../../common/utilities/custom-utilities';

@Component({
	selector: 'app-endpoint-search',
	templateUrl: './app-endpoint-search.component.html',
	styleUrls: ['./app-endpoint-search.component.css'],
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

	constructor(private _appEndpointSearchService: AppEndpointSearchService, private _ref: ChangeDetectorRef) { }

	ngOnInit() {
		this.searchText = this.httpOptions && this.httpOptions.defaultValue || '';
	}

	ngOnChanges() {
		if (!this.isError) {
			this.searchText = this.httpOptions && this.httpOptions.defaultValue || '';
		}
		this.clearField = '' + this.clearField;
		if (this.clearField === 'true') {
			this.searchText = '';
			this.results = [];
		}
		this.isError ? this.searchField.nativeElement.classList.add('is-invalid')
			: this.searchField.nativeElement.classList.remove('is-invalid');
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}
	/**
	 * calls an API with respect user inputs (path and search string) and the result is formatted in string of label
	 */
	getEndpointSearchResult(): void {
		if (this.httpOptions) {
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				const temporaryText = this.searchText.trim();
				this.newSearchText = this.addSearchText ? temporaryText : '';
				this.$subscriptions.push(
					this._appEndpointSearchService.endpointSearch(this.httpOptions.path, temporaryText, this.httpOptions.params)
						.subscribe((resultArray: any) => {
							this.results = [];
							this._ref.markForCheck();
							this.isResultSelected = this.httpOptions.defaultValue === this.searchText ? true : false;
							this.counter = -1;
							if (resultArray.length > 0) {
								if (this.httpOptions.formatString) {
									resultArray.forEach((el, i) => {
										const label = replaceFormatStringWithValue(this.httpOptions.formatString, resultArray[i]);
										this.results.push({ 'label': label, 'value': el });
									});
								}
							} else {
								this.onEmpty.emit({ 'searchString': this.searchText });
								if (!this.addSearchText) {
									this.results.push({ 'label': 'No results' });
								}
							}
						}));
			}, 500);
		}
	}
	/**
	 * call on focus this creates a empty search string call
	 * use this wisely if data is large it can cause error
	 */
	getEndpointSearchResultOnfocus(): void {
		if (this.searchOnFocus) {
			this.getEndpointSearchResult();
		}
	}

	/**
	 * @param  {} value emit results on key enter mouse click to parent components
	 */
	emitSelectedObject(value: any): void {
		this.counter = -1;
		if (value) {
			this.onSelect.emit(value);
			this.searchText = replaceFormatStringWithValue(this.httpOptions.contextField, value) || this.searchText;
		} else {
			this.searchText = '';
			this.onSelect.emit(null);
		}
		this.httpOptions.defaultValue = this.searchText;
		this.results = [];
	}

	backSpaceEvent(): void {
		this.onSelect.emit(null);
		this.getEndpointSearchResult();
	}
	
	hideSearchResults(): void {
		this.results = [];
		this.counter = -1;
	}

	getEndPointSearchValueOnFocusOut(): void {
		this.searchValue.emit(this.searchText === 'ADD_NEW_SEARCH_TEXT' ? this.newSearchText : this.searchText);
		this.searchText = this.isResultSelected ? this.searchText : '';
	}

	emitSearchText(searchText): void {
		this.onNewValueSelect.emit({ 'searchString': searchText });
	}

	controlSearchEmit(event) {
		this.isResultSelected = true;
		event.option.value === 'ADD_NEW_SEARCH_TEXT' ? this.emitSearchText(this.newSearchText) : this.emitSelectedObject(event.option.value ? event.option.value.value : null);
		this.newSearchText = '';
	}
}

