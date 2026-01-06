/**
 * auto-completer search component works on the basis of search string and arraylist
 */
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-autocompleter',
  templateUrl: './app-autocompleter.component.html',
  styleUrls: ['./app-autocompleter.component.css'],
})
export class AppAutocompleterComponent implements OnChanges, OnInit {

  @Input() completerOptions: any = {};
  @Input() placeHolder: string = '';
  @Input() clearField: string | undefined;
  @Input() defaultValue: string = '';
  @Input() isError: any;
  @Input() isDisabled = false;
  @ViewChild('searchField', { static: true }) searchField: ElementRef | undefined;
  @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onEmpty: EventEmitter<any> = new EventEmitter<any>();
  searchText = '';
  tempSearchText = '';
  timer: any;
  results: any[] = [];
  counter = -1;
  isActive = false;
  arrayList: any[] = [];
  tempResults: any[] = [];

  constructor(private _ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.searchText = this.completerOptions.defaultValue || this.defaultValue || '';
    this.placeHolder = this.placeHolder || 'Search';
  }

  ngOnChanges() {
    if (!this.isError) {
      this.searchText = this.completerOptions.defaultValue || this.defaultValue || '';
    }
    this.clearField = '' + this.clearField;
    if (this.clearField === 'true') {
      this.searchText = '';
      this.results = [];
    }
    if(this.searchField) {
      this.isError ? this.searchField.nativeElement.classList.add('is-invalid')
          : this.searchField.nativeElement.classList.remove('is-invalid');
    }
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
      this.isActive = true;
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
  emitSelectedObject(value: any) {
    this.counter = -1;
    if (value) {
      this.onSelect.emit(value);
      this.searchText = this.getSearchTextValue(value);
    } else {
      this.searchText = '';
      this.onSelect.emit(null);
    }
    this.completerOptions.defaultValue = this.searchText;
    this.results = [];
    this.isActive = false;
  }

  getSearchTextValue(value: { [x: string]: any; }): string {
		let lbl = this.completerOptions.contextField;
		Object.keys(value).forEach(k => { lbl = lbl.replace(new RegExp(k, 'g'), value[k]); });
		return lbl || this.searchText;
	}
  /**
   * @param  {} event used to update counter value for keyboard event listner
   */
  upArrowEvent(event: { preventDefault: () => void; }) {
    event.preventDefault();
    this.removeHighlight();
    this.counter >= 0 ? this.counter-- : this.counter = document.getElementsByClassName('search-result-item').length - 1;
    this.addHighlight();
    this.updateSearchFeild();
  }
  /**
   * @param  {} event  used to update counter value for keyboard event listner and adds a highlight class
   */
  downArrowEvent(event: { preventDefault: () => void; }) {
    event.preventDefault();
    this.removeHighlight();
    this.counter < document.getElementsByClassName('search-result-item').length - 1 ? this.counter++ : this.counter = -1;
    this.addHighlight();
    this.updateSearchFeild();
  }
  /**
   * @param  {} event
   *  handles the click outside the result box updates counter and slear results
   */
  hideSearchResults() {
    this.isActive = false;
    this.results = [];
    this.counter = -1;
  }
  /** listens for enter key event . triggers the click on selected li
   */
  enterKeyEvent() {
    (document.getElementsByClassName('search-result-item')[this.counter] as HTMLInputElement).click();
    (document.activeElement as HTMLInputElement).blur();
    this.hideSearchResults();
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
}
