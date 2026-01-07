/**
 * author : Mahesh Sreenath V M
 * a common elastic search component  currently only supports or condition for the Index fields
 * visit https://github.com/maheshpolus/elastic-search for updates and documents.
 * Visit https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event for more about paste event.
 */
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { AppElasticService } from './app-elastic.service';
import { SearchLengthValidatorOptions } from '../common.interface';

@Component({
	selector: 'app-elastic',
	templateUrl: './app-elastic.component.html',
	styleUrls: ['./app-elastic.component.scss'],
	providers: [AppElasticService]
})
export class AppElasticComponent implements OnChanges, OnInit {

    @Input() options: any = {};
    @Input() uniqueId = null;
    @Input() placeHolder: string;
    @Input() clearField: String;
    @Input() isError: boolean;
    @Input() isDisabled: boolean;
    @Input() searchType: string | null = '';
    @Input() addNewValue: 'ALLOW_ALL' | 'ALLOW_UNIQUE' | 'OFF' = 'OFF';
    @Input() duplicateFieldRestriction = [];
    @Input() canEmitSearchText = false; //If the search string given in the text box needs to be emitted from this endpoint, instead of the selected value, we should set it to true
    @Input() searchLimiterOptions = new SearchLengthValidatorOptions();
    @Output() selectedResult: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEmpty: EventEmitter<any> = new EventEmitter<any>();
    @Output() newValueSelect: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('searchField', { static: true }) searchField: ElementRef;
	searchText = '';
	isResultSelected = true;
	timer: any;
	results = [];
	counter = -1;
	query = {
		query: { bool: { should: [] } },
		sort: [{ _score: { order: 'desc' } }],
		highlight: { pre_tags: ['<strong>'], post_tags: ['</strong>'] }
	};
    isShowAddNewValueOption = false;
    canCallEmit = false;
    isLoading = false;
    emitValueTimeOut: ReturnType<typeof setTimeout>;
    searchTextEmitTimeOut: ReturnType<typeof setTimeout>;
    defaultValueTimeOut: ReturnType<typeof setTimeout>;
    isAPIFailed = false;
    apiErrorMessage = 'Search failed. Please clear and retry.';

	constructor(private _appElasticService: AppElasticService, private _ref: ChangeDetectorRef) { }

    ngOnInit() {
        this.searchText = this.options && this.options.defaultValue || '';
        this.setUniqueIdForSearchText();
    }

    setUniqueIdForSearchText() {
        this.searchField.nativeElement.id = this.uniqueId ? this.uniqueId : new Date().getTime().toString();
    }

	ngOnChanges() {
		if (!this.isError) {
			this.searchText = this.options && this.options.defaultValue || '';
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

	/**
	 * makes a elastic host connection and the result is formatted in string of label with bold tags
	 * for matching fields
	 */
	getElasticResult(): void {
		if (this.options) {
            this.isShowAddNewValueOption = false;
			clearTimeout(this.timer);
			this.timer = setTimeout(() => {
				this.isResultSelected = false;
				const temporaryText = this.searchText.trim();
				this.queryBuilder(temporaryText);
				const url = this.options.url + this.options.index + '/' + '_search?size=' + (this.options.size || 20);
                this.isLoading = true;
				this._appElasticService.search(url, this.query).then((rst: any) => {
                    this.isAPIFailed = false;
                    this.isLoading = false;
					this._ref.markForCheck();
					this.results = [];
					this.counter = -1;
					const src = ((rst.hits || {}).hits || []).map((hit) => hit._source);
					const hgt = ((rst.hits || {}).hits || []).map((hit) => hit.highlight);
                    if (this.addNewValue !== 'OFF' && temporaryText) {
                        this.setIsShowAddAction(this.duplicateFieldRestriction.length ? this.duplicateFieldRestriction : [this.options.contextField], src);
                    }
					if (this.options.formatString) {
						let fieldsArray = [];
                        if (this.options.formatFields) {
                            fieldsArray = Object.keys(this.options.formatFields);
                        } else {
                            fieldsArray = Object.keys(this.options.fields);
                        }
						src.forEach((el: any, i: number) => {
							let lbl = this.options.formatString;
							fieldsArray.forEach(k => {
								lbl = lbl.replace(new RegExp(k, 'g'), this.getValueFromResponse(hgt[i][k], src[i][k], k));
							});
							lbl = lbl.replace(/null/g, '');
							lbl = el.external === 'Y' ? lbl + '<span class=\'badge badge-warning ml-3\'>External</span>' : lbl;
							this.results.push({ 'label': lbl, 'value': el });
						});
					} else {
						src.forEach((el: any, i: number) => {
							let lbl = '';
							Object.keys(this.options.fields).forEach(k => {
								lbl = ((hgt[i][k] || src[i][k]) != null) ? lbl + (hgt[i][k] || src[i][k]) + '|' : lbl + '';
							});
							lbl = lbl.slice(0, -1);
							lbl = el.external === 'Y' ? lbl + '<span class=\'badge badge-warning ml-3\'>External</span>' : lbl;
							this.results.push({ 'label': lbl, 'value': el });
						});
					}
					if (!this.results.length && !this.canEmitSearchText) {
						this.onEmpty.emit({ 'searchString': this.searchText });
                        this.results = [];
						this.results.push({ 'label': 'No results' });
					}
				}, error => {
                    this.isLoading = false;
                    this.isAPIFailed = true;
                    this.results = [];
					this.results.push({ 'label': this.apiErrorMessage });
				});
			}, this.options && this.options.debounceTime || 500);
		}
	}

	getValueFromResponse( highlight: string| number, source: string| number, value: string) {
		 const content = highlight || source;
		 if (content) {
			return this.checkForIcon(value) + content;
		 } else {
			return '';
		 }
	}

	checkForIcon(k) {
		return this.options.icons && this.options.icons[k] ? this.options.icons[k] : '';
	}

	queryBuilder(searchText: string): void {
		this.query.highlight['fields'] = this.options.fields;
		let condition: any = {};
		this.query.query.bool = { should: [] };
		Object.keys(this.options.fields).forEach(field => {
			condition = Object.assign({}, condition);
			condition.match = {};
			condition.match[field] = { query: searchText.toLowerCase(), operator: 'or' };
			condition.match[field] = this.options.boost && this.options.boost[field] ?
        	{ ...condition.match[field], ...{ boost: this.options.boost[field] } } : condition.match[field];
			this.query.query.bool.should.push(condition);
		});
		if (this.options.extraConditions) {
			this.query.query.bool = {...this.query.query.bool, ...this.options.extraConditions};
		}
	}

	/**
	 * @param  {} value emit results on key enter mouse click to parent components
	 */
    emitSelectedObject(value: any): void {
        this.counter = -1;
        if (value) {
            this.canEmitSearchText ? this.emitSearchText(value) : this.emitSelectedValueFromList(value);
        } else {
            this.isResultSelected = true;
            this.searchTextEmitTimeOut = setTimeout(() => {
                this.searchText = '';
            }, 10);
            this.selectedResult.emit(null);
        }
        this.defaultValueTimeOut = setTimeout(() => {
            this.options.defaultValue = this.searchText;
        }, 10);
        this.results = [];
    }

    private emitSearchText(value: any): void {
        if (typeof value === 'string') {
            this.selectedResult.emit({ value_source: 'DEFAULT_SEARCH_TEXT', value: value });
        } else {
           this.emitSelectedValueFromList(value);
        }
    }

    private emitSelectedValueFromList(value: any): void {
        this.isResultSelected = true;
        this.selectedResult.emit(value);
        this.emitValueTimeOut = setTimeout(() => {
            this.searchText = this.getSearchTextValue(value);
        }, 10);
    }

	getSearchTextValue(value): string {
		let lbl = this.options.contextField;
		Object.keys(value).forEach(k => { lbl = lbl.replace(new RegExp(k, 'g'), value[k]); });
		return lbl || this.searchText;
	}

	backSpaceEvent(): void {
		this.selectedResult.emit(null);
		this.getElasticResult();
	}
	/**
	 * @param  {} event
	 *  handles the click outside the result box updates counter and clear results
	 */
    hideSearchResults(): void {
        if (!this.canEmitSearchText) {
            this.searchText = this.isResultSelected ? this.searchText : '';
        }
        this.results = [];
        this.counter = -1;
        this.isShowAddNewValueOption = false;
        if (this.canCallEmit && !this.isResultSelected) {
            this.emitSelectedObject(this.searchText);
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

    private setIsShowAddAction(fieldsArray: any[], dataSource: any[]) {
        let MATCH_FOUND = null;
        for (const element of dataSource) {
            if (!MATCH_FOUND) {
                MATCH_FOUND = fieldsArray.find((field: any) => String(element[field]).toLowerCase() === this.searchText.toLowerCase());
            }
        }
        if ((this.searchText && !MATCH_FOUND && this.addNewValue === 'ALLOW_UNIQUE') || (this.searchText && this.addNewValue === 'ALLOW_ALL')) {
            this.isShowAddNewValueOption = true;
        }
    }

    elasticOptionSelect(event: any): void {
        if (typeof event === 'string' && this.canEmitSearchText) {
            this.emitSelectedObject(event);
        } else {
            event.option.id === 'ADD_NEW_VALUE' ? this.newValueSelect.emit(event.option.value) : this.emitSelectedObject(event.option.value ? event.option.value.value : null);
        }
    }

    ngOnDestroy() {
        if (this.emitValueTimeOut) {
            clearTimeout(this.emitValueTimeOut);
        }
        if (this.defaultValueTimeOut) {
            clearTimeout(this.defaultValueTimeOut);
        }
        if (this.searchTextEmitTimeOut ) {
            clearTimeout(this.searchTextEmitTimeOut );
        }
    }

}
