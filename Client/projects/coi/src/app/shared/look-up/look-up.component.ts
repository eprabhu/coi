/**
 * a dynamic drop down with multiselect
 * Author :- Mahesh Sreenath V M
 * @INPUT() -selectedLookUpList - this is used for passing already saved values
 * @INPUT() - options -TABLE_NAME#COLUM_NAME#MULTILPLE#search
 * @OUTPUT() - selectedResult[] - if the selection is not multiple then will send an ARRAY- select from ARRAY[0];
 * if user selects nothing or null(--select--) will emit an empty ARRAY[]
 * @INPUT() - isExternalArray -boolean value which decides to take the data service from service call or list manually passed
 * @INPUT() - externalArray -List which is displayed in the lookup value. The Input for options should be passed with dummy values
 * which includes the multiple select and search options. The array passed should be a list of object which has code and description.
 * Dummy options example: options = 'EMPTY#EMPTY#true#true';
 * will add this to github  once its finalized till then please contact the author for bug -
 * email @ mahesh.sreenath@polussoftware.com
 * Last Updated by Jobin Sebastian
 */

import { Component, Input, OnChanges, ViewChild, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { LookUpService } from './look-up.service';
import { Subscription } from 'rxjs';
import { MatOption } from '@angular/material/core';
import { LookupFilterPipe } from './lookup-filter.pipe';
import {subscriptionHandler} from '../../../../../fibi/src/app/common/utilities/subscription-handler';

interface LookUp {
  code: number | string;
  description: string;
  isChecked?: boolean;
}

@Component({
  selector: 'app-look-up',
  templateUrl: './look-up.component.html',
  styleUrls: ['./look-up.component.scss'],
  providers: [LookUpService, LookupFilterPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LookUpComponent implements OnChanges, OnDestroy {

  selection: any = [];
  lookUpList: Array<LookUp> = [];
  isMultiple = false;
  isEnableSearch = false;
  searchText = '';
  lookUpRequestObject = {
    lookUpTableName: '',
    lookUpTableColumnName: ''
  };
  lookupTitle = '';
  $subscriptions: Subscription[] = [];
  filterSelectionBkp = [];
  isDataChanged = false;
  zIndexTimer: ReturnType< typeof setTimeout > | null = null;
  resetzIndexTimer: ReturnType< typeof setTimeout > | null = null;

  @Input() selectedLookUpList: Array<LookUp> = [];
  @Input() defaultValue: any;
  @Input() isError;
  @Input() title = '';
  @Input() options: string;
  @Input() isExternalArray = false;
  @Input() externalArray: any = [];
  @Input() isDisabled;
  @Input() uniqueId = null;
  @Input() customClass = '';
  @Input() needResultOnEachSelection = false;
  @Input() isClearNeeded = false;
  @Input() zIndex = '10613';
  @Output() selectedResult: EventEmitter<Array<LookUp>> = new EventEmitter<Array<LookUp>>();
  @ViewChild('lookupSelectAll') lookupSelectAll: MatOption;
  @ViewChild('mySelect') mySelect;

  constructor(private _dropDownService: LookUpService, private _changeRef: ChangeDetectorRef, private lookupFilterPipe: LookupFilterPipe) { }

  ngOnInit() {
    this.setUniqueIdForSearchText();
  }

  ngOnChanges() {
    if(!this.needResultOnEachSelection) {
      this.searchText = '';
    }
    this.updateLookUpSettings();
    if (this.isExternalArray) {
        this.lookUpList = this.externalArray;
    }
    if (this.selectedLookUpList?.length || this.defaultValue) {
      this.getLookUpValues();
    } else {
      this.lookupTitle = this.title || '';
      this.selection = [];
    }
  }

  setUniqueIdForSearchText() {
    this.uniqueId = this.uniqueId || new Date().getTime().toString();
  }

  ngOnDestroy() {
    if (this.zIndexTimer) {
        clearTimeout(this.zIndexTimer);
    }
    if (this.resetzIndexTimer) {
        clearTimeout(this.resetzIndexTimer);
    }
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * update the settings of the component. # vialue is used as a delimiter since it allows us to
   * modify the components consuming this library to change settings through by just passing one variable.
   * which is mostly driven from JSON files(reports,code-table etc) which in result reduce the total file size
   */
  private updateLookUpSettings() {
    const OPTIONS = this.options.split('#');
    this.lookUpRequestObject.lookUpTableName = OPTIONS[0];
    this.lookUpRequestObject.lookUpTableColumnName = OPTIONS[1];
    this.isMultiple = (OPTIONS[2] === 'true') || (OPTIONS[2] === 'TRUE') ? true : false;
    this.isEnableSearch = (OPTIONS[3] === 'true') || (OPTIONS[3] === 'TRUE') ? true : false;
  }
  /**
   * returns look up values from the DB its only triggered once since  the lookup values will not be changed :P
   * this function is triggered on focus if list is empty ( 0 == false !0 = true)
   */
  private getLookUpValues() {
    if (!this.lookUpList.length) {
      if (this.isExternalArray) {
        this.lookUpList = this.externalArray;
        this.setSelections();
      } else {
        this.$subscriptions.push(this._dropDownService.getLookupData(this.lookUpRequestObject)
          .subscribe((data: Array<LookUp>) => {
            this.lookUpList = data;
            this.setSelections();
            setTimeout(() => {
                if (!this.selectedLookUpList?.length && !this.defaultValue) {
                    this.mySelect.open();
                    this.setZIndex();
                }
            });
            this._changeRef.markForCheck();
          }));
      }
    } else {
      this.setSelections();
    }
  }

    setZIndex(): void {
        this.zIndexTimer = setTimeout(() => {
            const OVERLAY_CONTAINER_ELEMENT = document.querySelector('.cdk-overlay-container') as HTMLElement;
            const IS_MAT_SELECT_OPEN = OVERLAY_CONTAINER_ELEMENT.querySelector('.mat-mdc-select-panel');
            if (OVERLAY_CONTAINER_ELEMENT && IS_MAT_SELECT_OPEN) {
                OVERLAY_CONTAINER_ELEMENT.style.setProperty('z-index', this.zIndex, 'important');
            }
        }, 100);
    }

    onSelectClosed(): void {
        this.resetzIndexTimer = setTimeout(() => {
            const OVERLAY_CONTAINER_ELEMENT = document.querySelector('.cdk-overlay-container') as HTMLElement;
            const IS_MAT_SELECT_OPEN = OVERLAY_CONTAINER_ELEMENT.querySelector('.mat-mdc-select-panel');
            if (!IS_MAT_SELECT_OPEN) {
                OVERLAY_CONTAINER_ELEMENT.style.removeProperty('z-index');
            }
        }, 50);
    }

    private setSelections() {
        if (!this.selectedLookUpList?.length && !this.defaultValue) return;
        this.setSelectedLookUpList();
        if (!this.isMultiple) {
            if (this.defaultValue) {
                this.selectedLookUpList = this.lookUpList.filter(e => e.code === this.defaultValue || e.description === this.defaultValue);
            }
            const select = this.selectedLookUpList.find(e => e.code || e.description);
            if (select) {
                this.selection = select.code || select.description;
                this.setLookupTitle();
            }
        } else {
            this.selection = this.selectedLookUpList.map(e => e.code || e.description) || [];
            this.setLookupTitle();
        }
        this.checkIfAllOptionsSelected();
    }

  private setSelectedLookUpList() {
    if (!this.selectedLookUpList?.length) return;
    this.selectedLookUpList.forEach(element => {
      const foundValue = this.lookUpList.find(e => (e.description && e.description === element.description) || (e.code && e.code === element.code));
      if (foundValue) {
        element.code = foundValue.code;
        element.description = foundValue.description;
      }
    });
  }

  private selectOrUnSelectAllLookUp(isSelectAll: boolean) {
    this.selection = [];
    if (isSelectAll) {
      this.selection.push('SELECT_ALL');
      this.getLookupListForSelectAll().forEach((L: LookUp) => {
        this.selection.push(L.code || L.description);
      });
    } else {
        this.lookupTitle = this.title || '';
    }
  }

  getLookupListForSelectAll() {
    return this.isEnableSearch ? this.lookupFilterPipe.transform(this.lookUpList, this.searchText) : this.lookUpList;
  }

    emitDataToParentComponent(): void {
        const EMIT_DATA = (!this.isMultiple && !this.selection) ? [] : this.selectedDescription();
        this.selectedLookUpList = EMIT_DATA;
        this.setLookupTitle();
        this.isDataChanged && this.selectedResult.emit(EMIT_DATA);
        this.filterSelectionBkp = [];
        this.mySelect?.focus();
        this.isDataChanged = false;
        this.searchText = null;
        this.onSelectClosed();
    }

    private selectedDescription(): Array<LookUp> {
        return this.lookUpList.filter(ele => {
            if ((this.isMultiple && this.selection.includes(ele.code || ele.description)) ||
                (!this.isMultiple && (this.selection == ele.code || this.selection == ele.description))) return ele;
        });
    }

    showLookUpList() {
        return !this.lookUpList.length ? this.getLookUpValues() : null;
    }

    checkIfAllOptionsSelected(): void {
        if (this.isMultiple && !this.searchText) {
            this.filterSelectionBkp = [];
        }
        if (!this.isMultiple) return;
        this.selection = [...(new Set([...this.selection, ...this.filterSelectionBkp]))];
        const selectedArray = this.selection.filter((ele: any) => ele != 'SELECT_ALL');
        if (selectedArray?.length != this.lookUpList?.length) {
            this.selection = selectedArray;
        }
        if (selectedArray?.length == this.lookUpList?.length) {
            this.selectOrUnSelectAllLookUp(true);
        }
        if (this.lookupSelectAll?.active) {
            this.selectOrUnSelectAllLookUp(this.lookupSelectAll.selected);
        }
        this.selectedLookUpList = this.selectedDescription();
    }

  setLookupTitle() {
    this.lookupTitle = this.selectedLookUpList?.map(e => e.description || e.code).toString() || '';
  }

    emitSelectedDetails(): void {
        if(this.needResultOnEachSelection && this.isMultiple) {
            this.selectedLookUpList = this.selectedDescription();
            this.selectedResult.emit(this.selectedLookUpList);
        }
    }

    @HostListener('window:scroll', ['$event'])
    onScroll() {
        if (this.mySelect.panelOpen) {
            const OVERLAY = this.mySelect._overlayDir?.overlayRef;
            if (OVERLAY) {
                OVERLAY.updatePosition();
            }
        }
    }

}
