import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { AwardContacts } from '../../../comparison-constants';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches dat for
 * all these components in one service call.
 */
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsComponent implements OnChanges {

  constructor(private _toolKitEvents: ToolkitEventInteractionService) { }
  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    awardId: '',
    awardNumber: '',
    sequenceNumber: null,
    moduleVariableSections: [],
    currentSequenceNumber: null,
    isActiveComparison: false
  };
  @Input() currentMethod: string;
  contactDataFlag: any;
  awardContacts: any = [];
  isWidgetOpen = true;

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges() {
    if (this.currentMethod + '' !== '') {
      this.currentMethod + '' === 'COMPARE'
        && (this._toolKitEvents.checkSectionTypeCode('106', this.comparisonData.moduleVariableSections)
          || this.comparisonData.isActiveComparison) ? this.compare() : this.setCurrentView();
    }
  }

  /**
   * @returns void
   * compares the data of two versions of award contacts. here data is from parent so we simply
   * compares the data Array type is used since contacts type is Array.
   */
  compare(): void {
    this.awardContacts = compareArray(this.comparisonData.base[AwardContacts.reviewSectionName],
      this.comparisonData.current[AwardContacts.reviewSectionName],
      AwardContacts.reviewSectionUniqueFields,
      AwardContacts.reviewSectionSubFields);
  }

  setCurrentView() {
    this.awardContacts = this.comparisonData.base[AwardContacts.reviewSectionName];
  }
}
