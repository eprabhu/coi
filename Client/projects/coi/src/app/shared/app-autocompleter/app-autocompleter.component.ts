/**
 * auto-completer search component works on the basis of search string and arraylist
 */
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-autocompleter',
  templateUrl: './app-autocompleter.component.html',
  styleUrls: ['./app-autocompleter.component.scss'],
})
export class AppAutocompleterComponent implements OnChanges, OnInit {

  @Input() completerOptions: any = {};
  @Input() placeHolder;
  @Input() clearField;
  @Input() defaultValue;
  @Input() isError;
  @Input() isDisabled = false;
  @ViewChild('searchField', { static: true }) searchField: ElementRef;
  @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onEmpty: EventEmitter<any> = new EventEmitter<any>();
  searchText = '';
  tempSearchText = '';
  timer: any;
  results = [];
  counter = -1;
  arrayList: any[];
  tempResults: any[];

  constructor( private _ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.searchText = this.completerOptions.defaultValue || this.defaultValue || '';
    this.placeHolder = this.placeHolder || 'Search';
  }

  ngOnChanges() {
    if (!this.isError) {
      this.searchText = this.completerOptions.defaultValue || this.defaultValue || '';
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
   * @param  {any[]} items
   * @param  {any} searchText
   * Filter returned array with respect to filter fields is formmatted in string of label
   */
  getAutoCompleterResult(items: any[], searchText: any) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this._ref.markForCheck();
      this.results = [];
      searchText = searchText.toLowerCase();
      this.arrayList = this.getFilteredList(items, searchText);
      this.counter = -1;
      if (this.arrayList.length > 0) {
        this.arrayList.forEach((el, i) => {
          let label = this.completerOptions.formatString;
          Object.keys(el).forEach(k => {
            label = label.replace(k, this.arrayList[i][k] || '');
            label = label.replace(/null/g, '');
          });
          this.results.push({ 'label': label, 'value': el });
          this.tempResults = this.results.slice(0, 100);
        });
      } else {
        this.tempResults = [];
        this.onEmpty.emit({'searchString': this.searchText });
        this.tempResults.push({ 'label': 'No results' });
      }
    }, 500);
  }

  /**
   * @param  {any[]} items
   * @param  {string} searchText
   * Filter Array w.r.t search text anf filterFields
   */
  getFilteredList(items: any[], searchText: string) {
    return items.filter(row => {
      let concatString = '';
      for (const key in row) {
        if (this.completerOptions.filterFields.includes(key)) {
          concatString += row[key];
        }
      }
      if (concatString.toLowerCase().includes(searchText)) {
        return row;
      }
    });
  }

  /**
   * @param  {} value emit results on key enter mouse click to parent components
   */
  emitSelectedObject(value) {
    this.counter = -1;
    if (value) {
      this.onSelect.emit(value);
      setTimeout(() => {
        this.searchText = this.getSearchTextValue(value);
      });
    } else {
      setTimeout(() => {
        this.searchText = '';
      });
      this.onSelect.emit(null);
    }
    setTimeout(() => {
      this.completerOptions.defaultValue = this.searchText;
    });
    this.results = [];
  }

  getSearchTextValue(value): string {
    let lbl = this.completerOptions.contextField;
    Object.keys(value).forEach(k => { lbl = lbl.replace(new RegExp(k, 'g'), value[k]); });
    return lbl || this.searchText;
  }
  /**
   * @param  {} event
   *  handles the click outside the result box updates counter and slear results
   */
  hideSearchResults() {
    this.results = [];
    this.counter = -1;
  }
  /**
   * removes the highlight from the previous li node if true
   * updates the tempsearch value with user tped value for future refernce
   */
  removeHighlight() {
    const el = (document.getElementsByClassName('search-result-item')[this.counter] as HTMLInputElement);
    if (el) {
      el.classList.remove('highlight');
    } else {
      this.tempSearchText = this.searchText;
    }
  }
  /**
   * updates the li with 'highlight' class
   */
  addHighlight() {
    const el = (document.getElementsByClassName('search-result-item')[this.counter] as HTMLInputElement);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
      el.classList.add('highlight');
    }
  }
  /**
   * updates the search feild with temp value once user reaches the bootom or top of the list
   */
  updateSearchFeild() {
    this.counter === -1 || this.counter === document.getElementsByClassName('search-result-item').length ?
      this.searchText = this.tempSearchText :
      this.searchText =  this.results[this.counter].value &&
        this.results[this.counter].value[this.completerOptions.contextField] || this.searchText;
  }

  backSpaceEvent(): void {
    this.onSelect.emit(null);
    this.getAutoCompleterResult(this.completerOptions.arrayList , this.searchText);
  }

}
