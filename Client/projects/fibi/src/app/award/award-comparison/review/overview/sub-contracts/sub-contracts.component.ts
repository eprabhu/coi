import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { AwardSubContracts } from '../../../comparison-constants';
import { CurrencyParserService } from '../../../../../common/services/currency-parser.service';
import { CommonService } from '../../../../../common/services/common.service';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';


/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches dat for
 * all these components in one service call.
 */
@Component({
  selector: 'app-sub-contracts',
  templateUrl: './sub-contracts.component.html',
  styleUrls: ['./sub-contracts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubContractsComponent implements OnChanges {

  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    awardId: '',
    awardNumber: '',
    sequenceNumber : null,
    moduleVariableSections: [],
    currentSequenceNumber: null,
    isActiveComparison: false
  };
  @Input() currentMethod: string;

  constructor( public currencyFormatter: CurrencyParserService, public _commonService: CommonService,
    private _toolKitEvents: ToolkitEventInteractionService) { }
  awardSubContracts: any = [];
  isSubcontractWidgetOpen = true;

  ngOnChanges () {
    if ( this.currentMethod + '' !== '') {
       this.currentMethod + '' === 'COMPARE'
       && (this._toolKitEvents.checkSectionTypeCode('112', this.comparisonData.moduleVariableSections)
       || this.comparisonData.isActiveComparison) ? this.compare() : this.setCurrentView();
    }
  }

  compare() {
    this.awardSubContracts = compareArray(this.comparisonData.base[AwardSubContracts.reviewSectionName],
      this.comparisonData.current[AwardSubContracts.reviewSectionName],
      AwardSubContracts.reviewSectionUniqueFields,
      AwardSubContracts.reviewSectionSubFields);
  }

  setCurrentView() {
    this.awardSubContracts = this.comparisonData.base[AwardSubContracts.reviewSectionName];
  }

}
