import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../../services/common-data.service';
import { ToolKitService } from './tool-kit.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { History, Section, CompareDetails } from '../interfaces';
import { scrollIntoView } from '../../../common/utilities/custom-utilities';
import { ToolkitEventInteractionService } from '../toolkit-event-interaction.service';
import { AwardSection } from '../comparison-constants';
import { slideHorizontal } from '../../../common/utilities/animations';
import { ActivatedRoute } from '@angular/router';
import { HTTP_ERROR_STATUS, ETHICS_SAFETY_LABEL, AREA_OF_RESEARCH } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';

@Component({
  selector: 'app-tool-kit',
  templateUrl: './tool-kit.component.html',
  styleUrls: ['./tool-kit.component.css'],
  animations: [slideHorizontal]
})
export class ToolKitComponent implements OnDestroy, OnInit {
  isCurrentReviewTab = 'SECTION';
  awardSetupLabel = 'Award Setup';
  $subscriptions: Subscription[] = [];
  awardVersionsData: Array<History> = [];
  sections: Array<Section> = AwardSection;
  scrollIntoView = scrollIntoView;
  leftVersion: History;
  rightVersion: History;
  isToolkitVisible = true;
  isCompareFlag = false;
  currentActiveLink = 'REVIEW';
  filter = [
    { commentType: null },
    { commentStatus: null },
    { reviewer: null },
    { all: false }
  ];
  filterCommentReviewersList: any;
  deBounceTimer: any;
  sectionCommentsCount: any = {};
  masterVersion: History;
  isMasterCompare = false;

  constructor(public _commonData: CommonDataService, private _toolKitService: ToolKitService,
    public _toolKitEvents: ToolkitEventInteractionService, private route: ActivatedRoute,
    public _commonService: CommonService) { }
  ngOnInit() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data && data.award.awardId) {
        this.$subscriptions.push(this._toolKitService.getAwardHistoryInfo(
          { 'awardNumber': data.award.awardNumber, 'isAwardHistoryTab' : false })
          .subscribe((result: any) => {
            this.awardVersionsData = this.formatAwardHistory(result.awards);
            this.leftVersion = this.awardVersionsData[this.getCurrentVersion()];
            const MASTER_INDEX = this.getIndexOfMaster();
            if (MASTER_INDEX !== -1) {
              this.masterVersion = this.awardVersionsData.splice(MASTER_INDEX, 1)[0];
              // this.awardVersionsData.unshift(this.masterVersion);
            }
            this.viewAward(this.leftVersion);
          }));
      }
    }));
    this.getCompareValue();
    this.getCompareFromHeader();
    this.getCurrentLocation();
    this.getToolkitVisibility();
    this.checkSpecialReviewHidden();
    this.getSectionCommentsCount();
  }

  ngOnDestroy() {
    this._toolKitEvents.awardSequenceStatus.next('');
    subscriptionHandler(this.$subscriptions);
  }

  getIndexOfMaster() {
    return this.awardVersionsData.findIndex(e => e.sequenceNumber === 0);
  }

  getSectionCommentsCount() {
    this.$subscriptions.push(this._toolKitEvents.$sectionCommentsCount.subscribe(data => {
      this.sectionCommentsCount = data || {};
    }));
  }
  // If EnableSpecialReview parameter is false. Special Review entry is removed from sections array
  checkSpecialReviewHidden() {
    if (!this._commonService.isEnableSpecialReview) {
      this.sections = this.sections.filter((eachSection) => eachSection.reviewSectionCode !== 113);
    } else {
      const specialReviewSection = this.sections.find((eachSection) => eachSection.reviewSectionCode === 113);
      specialReviewSection.reviewSectionDescription = ETHICS_SAFETY_LABEL;
    }
    const areaOfResearchSection = this.sections.find((eachSection) => eachSection.reviewSectionCode === 125);
      areaOfResearchSection.reviewSectionDescription = AREA_OF_RESEARCH;
  }
  scrollToSection(id: string) {
    scrollIntoView(id);
  }

  getCurrentVersion() {
    const awardId: any = this.route.snapshot.queryParamMap.get('awardId');
    return this.getAwardIndex(awardId);
  }

  getAwardIndex(awardId) {
    // tslint:disable-next-line:triple-equals
    return this.awardVersionsData.findIndex(a => a.awardId == awardId);
  }

  getToolkitVisibility() {
    this.$subscriptions.push(this._toolKitEvents.$isToolkitVisible.subscribe(data => {
      (this.isToolkitVisible = data) ? this.collapseToolKit() : this.expandToolKit();
    }));
  }

  getCurrentLocation() {
    this.currentActiveLink = window.location.href.includes('comparison/comments') ? 'COMMENTS' : 'REVIEW';
  }
  formatAwardHistory(data: Array<any>): Array<History> {
    const historyList: Array<History> = [];
    data.map(d => {
      const history: any = {};
      history.awardId = d.awardId;
      history.awardNumber = d.awardNumber;
      history.sequenceNumber = d.sequenceNumber;
      history.serviceRequestType = d.serviceRequestType && d.serviceRequestType.description || this.awardSetupLabel;
      history.serviceRequestDescription = d.serviceRequest && d.serviceRequest.description || this.awardSetupLabel;
      history.serviceRequestSubject = d.serviceRequestSubject || this.awardSetupLabel;
      history.submissionDate = d.submissionDate;
      history.title = d.title;
      history.serviceRequestTypeCode = d.serviceRequestType ? d.serviceRequestType.typeCode : null;
      history.submitUserFullName = d.submitUserFullName;
      history.createUserFullName = d.createUserFullName;
      history.awardStatus = d.awardStatus.description || '';
      history.isAwardActive = ['PENDING', 'ACTIVE'].includes(d.awardSequenceStatus);
      history.awardSequenceStatus = d.awardSequenceStatus;
      history.serviceRequestId = d.serviceRequest ? d.serviceRequest.serviceRequestId : null;
      history.moduleVariableSections = d.moduleVariableSections;
      history.unitNumber = d.leadUnit.unitNumber;
      historyList.push(history);
    });
    return historyList;
  }

  switchVersions() {
    if (this.rightVersion && this.leftVersion) {
      const tempVersion = this.rightVersion;
      this.rightVersion = this.leftVersion;
      this.leftVersion = tempVersion;
    }
  }

  /**
   * UNCOMMENT getFilterCommentReviewersList() IN THIS FUNCTION WHEN "isCurrentReviewTab = ‘FILTERS’" scenario is used IN HTML
   */
  viewAward(version) {
    this.leftVersion = version;
    this.rightVersion = null;
    this.setHeader(version, null);
    const ViewData: CompareDetails = {
      baseAwardId: version.awardId.toString(),
      currentAwardId: '',
      awardNumber: version.awardNumber,
      sequenceNumber: version.sequenceNumber,
      awardSequenceStatus: version.awardSequenceStatus,
      moduleVariableSections: [],
      currentSequenceNumber: null,
      isActiveComparison: false,
      baseUnitNumber: version.unitNumber,
      currentUnitNumber: '',
      baseServiceRequestTypeCode: version.serviceRequestTypeCode,
      currentServiceRequestTypeCode: ''
    };
    this._toolKitEvents.$viewEvent.next(ViewData);
    this._toolKitEvents.$isCompareActive.next(false);
    this._toolKitEvents.awardSequenceStatus.next(version.awardSequenceStatus);
    // this.getFilterCommentReviewersList(ViewData.baseAwardId);
  }

  compareAwardVersions(data) {
    this.isMasterCompare = data === 'Master' ? true : false;
    this.setHeader(this.leftVersion, this.rightVersion);
    const CompareData: CompareDetails = {
      baseAwardId: this.leftVersion.awardId.toString(),
      currentAwardId: this.rightVersion.awardId.toString(),
      awardNumber: this.leftVersion.awardNumber,
      sequenceNumber: this.leftVersion.sequenceNumber,
      awardSequenceStatus: this.leftVersion.awardSequenceStatus,
      moduleVariableSections: this.leftVersion.moduleVariableSections,
      currentSequenceNumber: this.rightVersion.sequenceNumber,
      isActiveComparison: this.isMasterCompare,
      baseUnitNumber: this.leftVersion.unitNumber,
      currentUnitNumber: this.rightVersion.unitNumber,
      currentServiceRequestTypeCode: this.rightVersion.serviceRequestTypeCode,
      baseServiceRequestTypeCode: this.leftVersion.serviceRequestTypeCode
    };
    this._toolKitEvents.$compareEvent.next(CompareData);
  }

  setHeader(leftVersion = null, rightVersion = null) {
    const CompareVersions = {
      leftVersion: leftVersion || this.leftVersion,
      rightVersion: rightVersion || {},
    };
    this._toolKitEvents.$currentHeader.next(CompareVersions);
  }

  updateToolkitView() {
    this.isToolkitVisible = !this.isToolkitVisible;
    this._toolKitEvents.$isToolkitVisible.next(this.isToolkitVisible);
  }

  expandToolKit() {
    (document.getElementById('award_tab_content') as HTMLElement).style.width = '100%';
  }

  collapseToolKit() {
    (document.getElementById('award_tab_content') as HTMLElement).style.width = '75%';
  }

  onShowChanges(value) {
    if (value) {
      this._toolKitEvents.$isCompareActive.next(true);
      this._toolKitEvents.$compareFromHeader.next(true);
    } else {
      this._toolKitEvents.$isCompareActive.next(false);
      this._toolKitEvents.$compareFromHeader.next(false);
    }
  }

  getCurrentHeader() {
    this.$subscriptions.push(this._toolKitEvents.$currentHeader.subscribe(data => this.setHeaderValues(data)));
  }

  getCompareValue() {
    this.$subscriptions.push(this._toolKitEvents.$isCompareActive.subscribe(data =>
      this.isCompareFlag = data));
  }

  getCompareFromHeader() {
    this.$subscriptions.push(this._toolKitEvents.$compareFromHeader.subscribe(data => {
      if (data) {
        this.checkForComparisonVersion(data);
      } else {
        this.viewAward(this.leftVersion);
      }
    }));
  }

  checkForComparisonVersion(data) {
    if (this.masterVersion && Object.keys(this.masterVersion).length) {
      this.rightVersion = this.masterVersion;
      this.compareAwardVersions(data);
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'No previous version available to compare.');
      this._toolKitEvents.$isCompareActive.next(false);
    }
  }

  getRequiredVersion(currentVersion) {
    for (let index = this.getAwardIndex(this.leftVersion.awardId) + 1; index < this.awardVersionsData.length; index++) {
      if (this.awardVersionsData[index].serviceRequestTypeCode === currentVersion.serviceRequestTypeCode) {
        this.rightVersion = this.awardVersionsData[index]; break;
      }
    }
    if (!this.rightVersion) {
      this.rightVersion = this.awardVersionsData[this.awardVersionsData.length - 1];
    }
    return this.rightVersion;
  }

  setHeaderValues(data: any) {
    this.leftVersion = data.leftVersion;
    this.rightVersion = data.rightVersion || {};
  }

  /**
   * Uncomment this code when 'isCurrentReviewTab = "FILTERS"' section in html is used.
   */
  // getFilterCommentReviewersList(baseAwardId) {
  //   this.$subscriptions.push(this._toolKitService.getFilterCommentReviewersList({ 'awardId': baseAwardId })
  //     .subscribe((data: any) => {
  //       this.filterCommentReviewersList = data.persons;
  //       this.clearFilter();
  //     }));
  // }

  updateFilterChange() {
    this._toolKitEvents.$filter.next(this.filter);
  }

  updateFilterChangeAll() {
    this.updateFilterChange();
  }

  clearFilter() {
    this.filter = [
      { commentType: null },
      { commentStatus: null },
      { reviewer: null },
      { all: false }
    ];
    this.updateFilterChange();
  }
}
