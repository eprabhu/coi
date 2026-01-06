import { Component, OnInit, Input, OnDestroy, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription ,  of ,  forkJoin } from 'rxjs';
import { CustomElementCompareService } from './custom-element-compare.service';
import {compareArray, compareStringArray} from "../../../../../fibi/src/app/common/utilities/array-compare";
import {subscriptionHandler} from "../../../../../fibi/src/app/common/utilities/subscription-handler";

interface CustomElementDetails {
  baseModuleItemCode: number;
  currentModuleItemCode: number;
  baseModuleItemKey: number;
  currentModuleItemKey: number;
}

interface CompareType {
  reviewSectionUniqueFields: Array<string>;
  reviewSectionSubFields: Array<string>;
}
/**
 * Written by Mahesh Sreenath V M
 * this compares two different version of custom elements.
 * Fetches data for custom elements based on moduleItemKeys present on the input.
 * The input is created as an observable so that there is no need to rely on ngOn changes.
 * like questionnaire comparison the answer of a custom element is converted into an array
 * which will contain the union of answers of compared custom elements.
 * the answer array is created based on the type of custom element.
 * isShowAccordion is used to configure expand/collapse accordion which is visible(true) by default
 */
@Component({
  selector: 'app-custom-element-compare',
  templateUrl: './custom-element-compare.component.html',
  styleUrls: ['./custom-element-compare.component.scss'],
  providers: [CustomElementCompareService]
})
export class CustomElementCompareComponent implements OnInit, OnDestroy {

  @Input() customElementDetails: Observable<CustomElementDetails>;
  @Input() compareDetails: CompareType = {
    reviewSectionSubFields: [],
    reviewSectionUniqueFields: ['customDataElementId']
  };
  @Output() updateAccordionStatus: EventEmitter<any> = new EventEmitter<any>();
  @Input() isShowAccordion: any = true;
  activeCustomElementDetails: CustomElementDetails;
  customElementCache = {};
  base = [];
  current = [];
  $subscriptions: Subscription[] = [];
  isCustomElementOpen = false;
  currentMethod = 'VIEW';
  constructor(private _customElementCompareService: CustomElementCompareService,
    private _CDRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.getCustomElementDetails();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * subscribes to the event that has been passed as input if base and current moduleItemKey is present
   * then we consider it as a comparison else it is considered as view.
   */
  getCustomElementDetails() {
    this.$subscriptions.push(this.customElementDetails.subscribe((data: CustomElementDetails) => {
      this.activeCustomElementDetails = data;
      data.baseModuleItemKey && data.currentModuleItemKey ?
        this.compareCustomElementDetails() : this.viewCustomElementDetails();
        this._CDRef.detectChanges();
    }));
  }

  viewCustomElementDetails() {
    this.currentMethod = 'VIEW';
    this.$subscriptions.push(this.getApplicableCustomData('base')
    .subscribe((data: any) => this.base = this.formatCustomElementAnswer(data.customElements)));
  }

  compareCustomElementDetails() {
    this.currentMethod = 'COMPARE';
    this.$subscriptions.push(forkJoin(this.getApplicableCustomData('base'), this.getApplicableCustomData('current'))
    .subscribe(data => {
      this.updateCache(this.getCacheName('base'), data[0]);
      this.updateCache(this.getCacheName('current'), data[1]);
      this.current = this.formatCustomElementAnswer(data[1].customElements);
      this.base = this.formatCustomElementAnswer(data[0].customElements);
      this.compareCustomElements();
      this._CDRef.markForCheck();
    }));
  }

  formatCustomElementAnswer(data: Array<any>): Array<any> {
    data.forEach(element => {
      element.ANSWERS = this.getAnswers(element);
    });
    return data;
  }

  getAnswers(customElement: any): Array<string> {
    if (['Radio Button', 'Number', 'String', 'Date', 'Text'].includes(customElement.filterType)) {
        return customElement.answers[0].value ? [customElement.answers[0].value] : [];
    } else if (['System Dropdown', 'Elastic Search', 'Autosuggest', 'User Dropdown'].includes(customElement.filterType)) {
      return customElement.answers[0].description ? [customElement.answers[0].description] : [];
    } else if (customElement.filterType === 'Check Box') {
      const answers = [];
      customElement.options.forEach((option, index) => {
        if (customElement.answers[index].value === 'true') {
          answers.push(option);
        }
      });
      return answers;
    }
  }
  /**
   * compares the custom elements for base and current. A clone of current is taken at because
   * first comparison will remove the elements in current due to reference,
   * once both custom elements are compared then we compare the answer of each custom element
   * with corresponding pair.
   */
  compareCustomElements() {
    const current = this.deepCopy(this.current);
    this.base = compareArray(this.base, current, this.compareDetails.reviewSectionUniqueFields,
      this.compareDetails.reviewSectionSubFields);
    this.base.forEach(customElement => {
      const INDEX = this.findInCurrent(customElement);
      const currentAnswers = INDEX !== -1 ? this.current[INDEX].ANSWERS : [];
      customElement.ANSWERS = compareStringArray(customElement.ANSWERS, currentAnswers);
      if (INDEX !== -1) {
        this.current.splice(INDEX, 1);
      }
    });
    this.current.forEach(element => {
      element.ANSWERS = compareStringArray([], element.ANSWERS);
      this.base.push(element);
    });
  }

  findInCurrent(baseCustomElement: any) {
    return this.current.findIndex(q => q.customDataElementId === baseCustomElement.customDataElementId);
  }

  getModuleItemCode(type: string): number {
    return type === 'base' ? this.activeCustomElementDetails.baseModuleItemCode : this.activeCustomElementDetails.currentModuleItemCode;
  }

  getModuleItemKey(type: string): number {
    return type === 'base' ? this.activeCustomElementDetails.baseModuleItemKey : this.activeCustomElementDetails.currentModuleItemKey;
  }

  getApplicableCustomData(type: string): Observable<any> {
    const moduleCode: number = this.getModuleItemCode(type);
    const moduleItemKey: number = this.getModuleItemKey(type);
    const cacheName = this.getCacheName(type);
    if (this.checkInCache(cacheName)) {
      return of(this.deepCopy(this.customElementCache[cacheName]));
    } else {
      return this._customElementCompareService.getCustomData(moduleCode, moduleItemKey);
    }
  }

  getCacheName(type: string): string {
    return this.getModuleItemCode(type).toString() + this.getModuleItemKey(type).toString();
  }

  checkInCache(cacheName: string): boolean {
    return !!Object.keys(this.customElementCache).find(key => key === cacheName);
  }

  updateCache(cacheName: string, data: any) {
    this.customElementCache[cacheName] = this.deepCopy(data);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * updateThe accordion Flag and emit the result to the parent component
   */
  updateIsShowAccordion() {
    this.isCustomElementOpen = !this.isCustomElementOpen;
    this.updateAccordionStatus.emit(this.isCustomElementOpen);
  }
}
