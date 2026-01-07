import { ProposalService } from './../../services/proposal.service';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CompareDetails, History } from '../interfaces';
import { ToolkitEventInteractionService } from '../toolkit-event-interaction.service';
import { Subscription, Subject } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ToolKitService } from '../tool-kit/tool-kit.service';
import { CommonService } from '../../../common/services/common.service';
import { openInNewTab } from '../../../common/utilities/custom-utilities';
/**
 * Written by Aravind P S
 * Acts as the parent component for review module.
 * From here we know which version of proposal is being compared.
 * The two possible outcomes are either view the version of the proposal or compare two versions
 * CurrentMethod hold the value of the what is current either VIEW or COMPARE.
 * We will be using CD on push to boost the performance since too many
 * components are available on the screen at a time.
 * we subscribe to events from the toolkit here the selected proposal will be always emitted
 * through compare/view event so this events has been subscribed here.
 * Then the value will be passed to child components through @input
 * Since we rely on onChanges in our child components to trigger when an event happen from
 * toolkit new String() constructor is used.
 */
@Component({
  selector: 'app-proposal-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ToolKitService]
})
export class ReviewComponent implements OnInit, OnDestroy {
  comparisonDetails: CompareDetails = {
    currentProposalId: '',
    baseProposalId: '',
    activeProposalId: '',
    activeProposalStatus: null
  };
  customElementCompare = new Subject();
  leftValue: any = {};
  rightValue: any = {};
  $subscriptions: Array<Subscription> = [];
  currentMethod: String;
  questionnaireComparisonDetails = {
    baseModuleItemCode: 3,
    baseSubitemCodes: [0],
    baseModuleItemKey: '',
    baseModuleSubItemKey: '',
    currentModuleItemCode: 3,
    currentModuleItemKey: '',
    currentSubItemCodes: [0],
    currentModuleSubItemKey: '',
    baseQuestionnaireMode: null,
    currentQuestionnaireMode: null,
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('userName'),
  };
  isCompare = false;
  isToolkitVisible = true;
  helpText: any = {};

  constructor(public _toolKitEvents: ToolkitEventInteractionService, private _CDRef: ChangeDetectorRef,
    private _toolKitService: ToolKitService, public _commonService: CommonService,
    public _proposalService: ProposalService) { }

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
        this.updateQuestionnaireComponent(data);
        this.updateCustomElement(data);
        this.currentMethod = new String('COMPARE');
        this._CDRef.markForCheck();
      }));
  }
  viewEvent() {
    this.$subscriptions.push(
      this._toolKitEvents.$viewEvent.subscribe((data: CompareDetails) => {
        if (data.baseProposalId) {
          this.comparisonDetails = data;
          this.updateQuestionnaireComponent(data);
          this.updateCustomElement(data);
          this.currentMethod = new String('VIEW');
          this._CDRef.markForCheck();
        }
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
    this.questionnaireComparisonDetails.currentModuleItemKey = data.currentProposalId || '';
    this.questionnaireComparisonDetails.baseModuleItemKey = data.baseProposalId || '';
    this.questionnaireComparisonDetails = Object.assign({}, this.questionnaireComparisonDetails);
  }

  updateCustomElement(data: CompareDetails) {
    const customElementCompare: any = {};
    customElementCompare.baseModuleItemCode = 3;
    customElementCompare.currentModuleItemCode = 3;
    customElementCompare.currentModuleItemKey = parseInt(data.currentProposalId, 10) || null;
    customElementCompare.baseModuleItemKey = parseInt(data.baseProposalId, 10) || null;
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

   /**
   * Get help texts for Proposal section codes 301 - Proposal General Information, 313 - Special Review,
   * 306 - Declaration Of Funding Support, 325 - Area Of Reserch
   */
    fetchHelpText() {
      this.$subscriptions.push(this._toolKitService.fetchHelpText({
        'moduleCode': 3, 'sectionCodes': [301, 313, 306, 325, 304, 302]
      }).subscribe((data: any) => {
            this.helpText = data;
      }));
    }

}
