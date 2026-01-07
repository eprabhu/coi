import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CompareDetails } from '../interfaces';
import { ToolkitEventInteractionService } from '../toolkit-event-interaction.service';
import { Subscription ,  Subject } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ToolKitService } from '../tool-kit/tool-kit.service';
import { CommonService } from '../../../common/services/common.service';
import { openInNewTab } from '../../../common/utilities/custom-utilities';
import { setHelpTextForSubItems } from '../../../common/utilities/custom-utilities';
import { CommonDataService } from '../../services/common-data.service';
/**
 * Written by Mahesh Sreenath V M
 * Acts as the parent component for review module.
 * From here we know which version of award is being compared.
 * The two possible outcomes are either view the version of the award or compare two versions
 * CurrentMethod hold the value of the what is current either VIEW or COMPARE.
 * We will be using CD on push to boost the performance since too many
 * components are available on the screen at a time.
 * we subscribe to events from the toolkit here the selected award will be always emitted
 * through compare/view event so this events has been subscribed here.
 * Then the value will be passed to child components through @input
 * Since we rely on onChanges in our child components to trigger when an event happen from
 * toolkit new String() constructor is used.
 */
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ToolKitService]
})
export class ReviewComponent implements OnInit, OnDestroy {
  comparisonDetails: CompareDetails = {
    currentAwardId: '',
    baseAwardId: '',
    awardNumber: '',
    sequenceNumber: null,
    awardSequenceStatus: '',
    moduleVariableSections: [],
    currentSequenceNumber: null,
    isActiveComparison: false,
    baseUnitNumber: '',
    currentUnitNumber: '',
    baseServiceRequestTypeCode: '',
    currentServiceRequestTypeCode: ''
  };
  customElementCompare = new Subject();
  leftValue: any = {};
  rightValue: any = {};
  $subscriptions: Array<Subscription> = [];
  currentMethod: String;
  questionnaireComparisonDetails = {
    baseModuleItemCode: 1,
    baseSubitemCodes: [0, 5, 6],
    baseModuleItemKey: '',
    baseModuleSubItemKey: 0,
    currentModuleItemCode: 1,
    currentModuleItemKey: '',
    currentSubItemCodes: [0, 5, 6],
    currentModuleSubItemKey: 0,
    baseQuestionnaireMode: 'ANSWERED',
    currentQuestionnaireMode: 'ANSWERED',
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('userName'),
  };
  isCompare = false;
  isToolkitVisible = true;
  helpText: any = {};
  isMasterAward = false;

  constructor(public _toolKitEvents: ToolkitEventInteractionService, private _CDRef: ChangeDetectorRef,
    private _toolKitService: ToolKitService, public _commonService: CommonService, public _commonData: CommonDataService) { }

  ngOnInit(): void {
    this.comparisonEvent();
    this.viewEvent();
    this.getCurrentHeader();
    this.getCompareValue();
    this.getToolkitVisibility();
    this.fetchHelpText();
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  comparisonEvent(): void {
    this.$subscriptions.push(
      this._toolKitEvents.$compareEvent.subscribe((data: CompareDetails) => {
        this.comparisonDetails = data;
        if (this._toolKitEvents.checkSectionTypeCode('124', this.comparisonDetails.moduleVariableSections)
        || this.comparisonDetails.isActiveComparison) {
          this.updateQuestionnaireComponent(data);
        }
        if (this._toolKitEvents.checkSectionTypeCode('120', this.comparisonDetails.moduleVariableSections)
        || this.comparisonDetails.isActiveComparison) {
          this.updateCustomElement(data);
        }
        this.getAndSetCurrentVersionComments(data.baseAwardId);
        this.currentMethod = new String('COMPARE');
        this._CDRef.markForCheck();
      }));
  }

  viewEvent() {
    this.$subscriptions.push(
      this._toolKitEvents.$viewEvent.subscribe((data: CompareDetails) => {
        if (data.baseAwardId) {
          this.comparisonDetails = data;
          this.updateQuestionnaireComponent(data);
          this.updateCustomElement(data);
          this.getAndSetCurrentVersionComments(data.baseAwardId);
          this.currentMethod = new String('VIEW');
          this._CDRef.markForCheck();
        }
      }));
  }

  getAndSetCurrentVersionComments(baseAwardId) {
    this._toolKitService.getAllReviewComments(
      {'awardId': baseAwardId,
       'awardNumber': this.comparisonDetails.awardNumber
      }).subscribe((data: any) => {
      this._toolKitEvents.$versionCommentList.next(data.awardReviewComments);
      this.setSectionCommentsCount();
    });
  }

  setSectionCommentsCount() {
    this.$subscriptions.push(this._toolKitEvents.$versionCommentList.subscribe(data => {
      this._toolKitEvents.groupBySection(data);
    }));
  }

  getCurrentHeader() {
    this.$subscriptions.push(this._toolKitEvents.$currentHeader.subscribe(data => this.setHeaderValues(data)));
  }

  setHeaderValues(data: any) {
    this.leftValue = data.leftVersion;
    this.rightValue = data.rightVersion || {};
  }

  getToolkitVisibility() {
    this.$subscriptions.push(this._toolKitEvents.$isToolkitVisible.subscribe(data => {
      this.isToolkitVisible = data;
      this._CDRef.markForCheck();
    }));
  }

  updateQuestionnaireComponent(data: CompareDetails) {
    this.questionnaireComparisonDetails.currentModuleItemKey = data.currentAwardId || '';
    this.questionnaireComparisonDetails.baseModuleItemKey = data.baseAwardId || '';
    this.questionnaireComparisonDetails.baseSubitemCodes =
      this.getQuestionnaireSubModules(this.comparisonDetails.baseServiceRequestTypeCode, this.comparisonDetails.sequenceNumber);
    this.questionnaireComparisonDetails.currentSubItemCodes =
      this.getQuestionnaireSubModules(this.comparisonDetails.currentServiceRequestTypeCode, this.comparisonDetails.currentSequenceNumber);
    this.questionnaireComparisonDetails = Object.assign({}, this.questionnaireComparisonDetails);
  }

  /*
   * 7 (ProjectClosureRequest - PCR) and the Submit Closure Request(SCR) -21
   */
  getQuestionnaireSubModules(variationType, awardSequenceNumber): Array<number> {
    if (variationType === '7' || awardSequenceNumber === 0) {
      return [0, 5, 6];
    } else if  (variationType === '21') {
      return [0, 5];
    } else {
      return [0];
    }
  }

  updateCustomElement(data: CompareDetails) {
    const customElementCompare: any = {};
    customElementCompare.baseModuleItemCode = 1;
    customElementCompare.currentModuleItemCode = 1;
    customElementCompare.currentModuleItemKey = parseInt(data.currentAwardId, 10) || null;
    customElementCompare.baseModuleItemKey =  parseInt(data.baseAwardId, 10) || null;
    this.customElementCompare.next(customElementCompare);
  }

  onShowChanges(value) {
      this._toolKitEvents.$isCompareActive.next(value);
      this._toolKitEvents.$compareFromHeader.next(value);
  }
  getCompareValue() {
    this.$subscriptions.push(this._toolKitEvents.$isCompareActive.subscribe(data => {
      this.isCompare = data;
      this._CDRef.markForCheck();
    }));
  }

  toggleToolkitVisibility() {
    this.isToolkitVisible = !this.isToolkitVisible;
    this._toolKitEvents.$isToolkitVisible.next(this.isToolkitVisible);
  }

  gotoVariationRequest(requestId) {
    openInNewTab('service-request?', ['serviceRequestId'], [requestId]);
  }

  fetchHelpText() {
    this.$subscriptions.push(this._toolKitService.fetchHelpText({
      'moduleCode': 1, 'sectionCodes': [102, 113, 125]
    }).subscribe((data: any) => {
      this.helpText = data;
      this.checkHelpTextForBudgetLineItems();
   }));
  }

  checkHelpTextForBudgetLineItems() {
    if (Object.keys(this.helpText).length && this.helpText.budget && this.helpText.budget.parentHelpTexts.length) {
      this.helpText = setHelpTextForSubItems(this.helpText, 'budget');
    }
  }
}
