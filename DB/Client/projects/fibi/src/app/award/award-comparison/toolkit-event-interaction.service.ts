import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { CompareDetails, Section } from './interfaces';
import { AwardSection } from './comparison-constants';
@Injectable()
export class ToolkitEventInteractionService {

  constructor() { }
  sections: Array<Section> = AwardSection;
  $compareEvent = new Subject<CompareDetails>();
  $viewEvent = new BehaviorSubject<CompareDetails>({
    baseAwardId: '',
    currentAwardId: '',
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
  });
  $currentHeader = new BehaviorSubject<any>({});
  $isCompareActive = new BehaviorSubject<boolean>(false);
  $compareFromHeader = new Subject();
  $versionCommentList = new BehaviorSubject<any>([]);
  $sectionCommentsCount = new Subject<any>();
  $filter = new BehaviorSubject([]);
  $isToolkitVisible = new BehaviorSubject(true);
  isReviewCommentsActive = false;
  awardSequenceStatus = new BehaviorSubject('');

  getSequenceCommentsForSection(sectionCode, data) {
    // tslint:disable-next-line:triple-equals
    return data.filter(list => list.reviewSectionCode == sectionCode);
  }

  groupBySection(data) {
    const sectionComments: any = {};
    const totalCommentsOnSection: any = {};
    this.sections.forEach(e => {
      if (this.getSequenceCommentsForSection(e.reviewSectionCode, data).length) {
        sectionComments[e.reviewSectionCode] = this.getSequenceCommentsForSection(e.reviewSectionCode, data);
        totalCommentsOnSection[e.reviewSectionCode] = sectionComments[e.reviewSectionCode].length;
      }
    });
    this.$sectionCommentsCount.next(totalCommentsOnSection);
    return sectionComments;
  }

  checkSectionTypeCode(sectionId, sectionCodes) {
    if (sectionCodes && sectionCodes.length > 0) {
      return sectionCodes.find(section => section.sectionCode === sectionId) ? true : false;
    } else {
      return false;
    }
  }
}
