/**
 * a dynamic drop down with multiselect
 * Author :- Mahesh Sreenath V M
 * @INPUT() -selectedLookUpList - this is used for passing already saved values
 * @INPUT() - options -TABLE_NAME#COLUM_NAME#MULTILPLE#search
 * @OUTPUT() - seletedlist[] - if the selection is not multiple then will send an ARRAY- select from ARRAY[0];
 * if user selects nothing or null(--select--) will emit an empty ARRAY[]
 * @INPUT() - isExternalArray -boolean value which decides to take the data service from service call or list manually passed
 * @INPUT() - externalArray -List which is displayed in the lookup value. The Input for options should be passed with dummy values
 * which includes the multiple select and search options. The array passed should be a list of object which has code and description.
 * Dummy options example: options = 'EMPTY#EMPTY#true#true';
 * will add this to github  once its finalized till then please contact the author for bug -
 * email @ mahesh.sreenath@polussoftware.com
 * Last Updated by Jobin Sebastian
 */

import { Component, Input, OnChanges, ViewChild, ElementRef, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LookUpService } from './look-up.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

interface LookUp {
  code: number;
  description: string;
  isChecked?: boolean;
}

@Component({
  selector: 'app-look-up',
  templateUrl: './look-up.component.html',
  styleUrls: ['./look-up.component.css'],
  providers: [LookUpService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LookUpComponent implements OnChanges, OnDestroy {
  debounceTimer: any;
  counter: number;
  results: any[];
  tempSearchText: string;
  selection = 'none';
  lookUpList: Array<LookUp> = [];
  isActive = false;
  lookUpType = '';
  isMultiple = false;
  isEnableSearch = false;
  searchText = '';
  isSelectAll = false;
  lookUpRequestObject = {
    lookUpTableName: '',
    lookUpTableColumnName: ''
  };
  $subscriptions: Subscription[] = [];
  @Input() selectedLookUpList: Array<LookUp> = [];
  @Input() defaultValue: any;
  @Input() isError;
  @Input() options: string;
  @Input() isExternalArray = false;
  @Input() externalArray: any = [];
  @Input() isDisabled;
  @Output() selectedResult: EventEmitter<Array<LookUp>> = new EventEmitter<Array<LookUp>>();
  @ViewChild('dropdownOverlay', { static: true }) dropdownOverlay: ElementRef;
  @ViewChild('searchField', { static: true }) searchField: ElementRef;

  constructor(private _dropDownService: LookUpService, private _changeRef: ChangeDetectorRef) { }

  ngOnChanges() {
    this.selectedLookUpList = this.selectedLookUpList || [];
    this.lookUpList = this.lookUpList.length ? this.mapLookUpData(this.lookUpList) : [];
    this.isSelectAll = this.lookUpList.length && this.lookUpList.length === this.selectedLookUpList.length ? true : false;
    this.updateLookUpSettings();
    this.setSelectedValue();
    if (!this.isMultiple) {
      this.selection = this.defaultValue || this.selection;
    }
    this.isError ? this.searchField.nativeElement.classList.add('is-invalid')
      : this.searchField.nativeElement.classList.remove('is-invalid');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * update the settings of the component. # value is used as a delimiter since it allows us to
   * modify the components consuming this library to change settings through by just passing one variable.
   * which is mostly driven from JSON files(reports,codetable etc) which in result reduce the total file size
   */
  updateLookUpSettings() {
    const OPTIONS = this.options.split('#');
    this.lookUpRequestObject.lookUpTableName = OPTIONS[0];
    this.lookUpRequestObject.lookUpTableColumnName = OPTIONS[1];
    this.isMultiple = (OPTIONS[2] === 'true') || (OPTIONS[2] === 'TRUE') ? true : false;
    this.isEnableSearch = (OPTIONS[3] === 'true') || (OPTIONS[3] === 'TRUE') ? true : false;
  }
  /**
   * returns look up values from the DB its only triggred once since  the lookup values will not be changed :P
   * this function is triggred on focus if list is empty ( 0 == false !0 = true)
   */
  getLookUpValues() {
    if (!this.lookUpList.length) {
      if (this.isExternalArray) {
        this.lookUpList = this.mapLookUpData(this.externalArray);
      } else {
        this.$subscriptions.push(this._dropDownService.getLookupData(this.lookUpRequestObject)
          .subscribe((data: Array<LookUp>) => {
            this.lookUpList = this.mapLookUpData(data);
            this._changeRef.markForCheck();
          }));
      }
    }
  }
  setSelectedValue() {
    this.selection = this.isMultiple ? this.selectedLookUpList.length + ' selected' :
      this.selectedLookUpList[0] ? this.selectedLookUpList[0].description : '--select--';
  }

  selectOrUnselectLookUpwithSpace() {
    const lookup: LookUp = this.lookUpList[this.counter];
    if (lookup) {
      lookup.isChecked = !lookup.isChecked;
      this.selectOrUnSelectLookupItem(lookup);
    }
  }
  /**
   * @param  {LookUp} lookUp
   * neagative condition chcking is used so that even if lookup doesn't come we can handle that in add rather that remove.
   * which is becoz on isMultiple = false conditions a null value will be emitted I have handled that scenario in addToSelectedLookupList
   */
  selectOrUnSelectLookupItem(lookUp: LookUp) {
    lookUp && !lookUp.isChecked ? this.removeFromSelectedLookupList(lookUp) : this.addToSelectedLookupList(lookUp);
  }

  selectOrUnSelectAllLookUp(status: boolean) {
    this.selectedLookUpList = [];
    this.lookUpList.forEach((L: LookUp) => {
      L.isChecked = status;
      this.selectOrUnSelectLookupItem(L);
    });
    this.setSelectedValue();
  }
  /**
   * @param  {Array<LookUp>} lookUpList
   * moves the selected items to the top of the list it helps user to see what they have selected
   */
  setSelectedItemsToTop(lookUpList: Array<LookUp>) {
    return lookUpList.sort(a => a.isChecked === true ? -1 : a.isChecked === false ? 1 : 0);
  }

  /**
   * @param  {LookUp} lookUp
   * if mulfiple is not enabled it will always add to the 0th element.the lookuplist is emptied becoz I handled
   * the empty selection here if user selects null the list is cleared only in the case of isMultiple = false
   */
  addToSelectedLookupList(lookUp: LookUp) {
    if (this.isMultiple) {
      this.selectedLookUpList.push(Object.assign({}, lookUp));
    } else {
      lookUp ? this.selectedLookUpList[0] = Object.assign({}, lookUp) : this.selectedLookUpList = [];
      this.hideLookUpList();
    }
    this.setSelectedValue();
  }

  removeFromSelectedLookupList(lookUp: LookUp) {
    this.selectedLookUpList.splice(this.findLookupIndex(lookUp), 1);
    this.setSelectedValue();
  }

  findLookupIndex(lookUp: LookUp) {
    return this.selectedLookUpList.findIndex((L: LookUp) => L.code === lookUp.code || L.description === lookUp.description);
  }
  /**
   * @param  {Array<LookUp>} lookUpList
   * this function updates the data with isChecked value which is used for selection in UI
   */
  mapLookUpData(lookUpList: Array<LookUp>) {
    return lookUpList.map((d: LookUp) => { d['isChecked'] = this.checkInSelectedLookupList(d); return d; });
  }
  /**
   * @param  {LookUp} lookUp
   * here either decription or code is checked bcoz at times the developer using this library may not be able to give
   * both code and description all values should be true on the case of isMultiple = false which helps us to use
   * same function for both single and multiple
   */
  checkInSelectedLookupList(lookUp: LookUp) {
    return !!this.selectedLookUpList
      .find((L: LookUp) => L.code === lookUp.code || L.description === lookUp.description) || !this.isMultiple;
  }

  hideLookUpList() {
    this.setLookUpListStatus(false);
    this.updateOverlayState(false);
    this.counter = -1;
    this.searchText = '';
    if (this.isMultiple) {
      this.lookUpList = this.setSelectedItemsToTop(this.lookUpList);
    }
    this.emitDatatoParentComponent();
  }

  emitDatatoParentComponent() {
    this.selectedResult.emit(this.selectedLookUpList);
  }

  showLookUpList() {
    this.setLookUpListStatus(true);
    this.updateOverlayState(true);
    return !this.lookUpList.length ? this.getLookUpValues() : null;
  }

  updateOverlayState(condition: boolean) {
    this.dropdownOverlay.nativeElement.style.display = condition ? 'block' : 'none';
  }

  setLookUpListStatus(status: boolean) {
    this.isActive = status;
  }

  /**
   * @param  {} event used to update counter value for keyboard event listner
   */
  upArrowEvent(event) {
    event.preventDefault();
    this.removeHighlight();
    this.counter >= 0 ? this.counter-- : this.counter = document.getElementsByClassName('search-result-item').length - 1;
    this.addHighlight();
    this.updateSearchFeild();
  }
  updateSearchFeild() {

  }
  /**
   * @param  {} event  used to update counter value for keyboard event listner and adds a highlight class
   */
  downArrowEvent(event) {
    event.preventDefault();
    this.removeHighlight();
    this.counter < document.getElementsByClassName('search-result-item').length - 1 ? this.counter++ : this.counter = -1;
    this.addHighlight();
    this.updateSearchFeild();
  }

  /** listens for enter key event . triggers the click on selected li
   */
  enterKeyEvent() {
    (document.getElementsByClassName('search-result-item')[this.counter] as HTMLInputElement).click();
    (document.activeElement as HTMLInputElement).blur();
    this.hideLookUpList();
  }
  /**
   * removes the highlight from the previous li node if true
   * updates the tempsearch value with user tped value for future refernce
   */
  removeHighlight() {
    const el = (document.getElementsByClassName('search-result-item')[this.counter] as HTMLInputElement);
    if (el) {
      el.classList.remove('highlight');
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
}
