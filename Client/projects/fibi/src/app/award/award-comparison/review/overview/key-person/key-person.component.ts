import { Component, Input, OnChanges, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { AwardPersons } from '../../../comparison-constants';
import { environment } from '../../../../../../environments/environment';
import { OverviewService } from '../overview.service';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { fileDownloader } from '../../../../../common/utilities/custom-utilities';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';
import {concatUnitNumberAndUnitName} from '../../../../../common/utilities/custom-utilities';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches data for
 * all these components in one service call.
 */
@Component({
  selector: 'app-key-person',
  templateUrl: './key-person.component.html',
  styleUrls: ['./key-person.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyPersonComponent implements OnChanges, OnDestroy {

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
  isPersonData = true;
  awardPersons: any = [];
  currentPersons = [];
  fileName: any = [];
  deployMap = environment.deployUrl;
  $subscriptions: Subscription[] = [];
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

  constructor(private _overviewService: OverviewService, private _toolKitEvents: ToolkitEventInteractionService) { }


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
        && (this._toolKitEvents.checkSectionTypeCode('104', this.comparisonData.moduleVariableSections)
          || this.comparisonData.isActiveComparison)
        ? this.compare() : this.setCurrentView();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * @returns void
   * 1.compare key persons of base with current
   * 2.loop through the compared output
   * 3.if the status is 0 then
   * 4.find the persons from the current version
   * 5.compare the inner array of key persons
   * We have a array of array lets say data = [A[B]] to compare here so the logic is to compare
   * so we compare key persons of both versions first. Then if person status is 0 that
   * means present in both versions. otherwise its new or deleted no need to check the items
   * inside each key person. So we go through each of Person and find its match in current then
   * we compare the inner Units array inside the awardPersons. So achieve this need
   * to keep a copy of current key persons's since after the first comparison the data on the current
   * is lost. so currentPersons holds a copy of the data.
   * filename is save in temp variable so that it will be available on compare mode
   * (during compare the file name may contain html tags)
   * personId and rolodexId is set to awardPersonAttachment and awardPersonUnits
   * as primary key combination for compare array
   */
  compare(): void {
    this.setPersonId(this.comparisonData.base[AwardPersons.reviewSectionName]);
    this.setPersonId(this.comparisonData.current[AwardPersons.reviewSectionName]);
    this.currentPersons = JSON.parse(JSON.stringify(this.comparisonData.current[AwardPersons.reviewSectionName]));
    this.awardPersons = compareArray(this.comparisonData.base[AwardPersons.reviewSectionName],
      this.comparisonData.current[AwardPersons.reviewSectionName],
      AwardPersons.reviewSectionUniqueFields,
      AwardPersons.reviewSectionSubFields);
    this.awardPersons.forEach((person, index) => {
      if (person.status === 0) {
        const current = this.findInCurrent(person.personId ? person.personId : person.rolodexId);
        person.awardPersonUnits = compareArray(person.awardPersonUnits,
          current.awardPersonUnits, ['unitNumber', 'personId', 'rolodexId'], []);
        this.fileName[index] = person.awardPersonAttachment.length ? person.awardPersonAttachment[0].fileName : [];
        person.awardPersonAttachment = compareArray(person.awardPersonAttachment,
          current.awardPersonAttachment, AwardPersons.reviewSectionUniqueFields,
          ['fileName']);
      }
    });
  }

  setPersonId(personList) {
    personList.forEach(person => {
      person.awardPersonUnits.map(v => Object.assign(v, { personId: person.personId, rolodexId: person.rolodexId }));
      person.awardPersonAttachment.map(v => Object.assign(v, { personId: person.personId, rolodexId: person.rolodexId }));
    });
  }

  findInCurrent(code) {
    return this.currentPersons.find(person => person.personId === code || person.rolodexId === code);
  }

  setCurrentView() {
    this.awardPersons = this.comparisonData.base[AwardPersons.reviewSectionName];
    this.fileName = [];
  }

  downloadAwardPersonCV(attachment, index) {
    this.$subscriptions.push(this._overviewService.downloadAwardPersonAttachment(attachment.attachmentId)
      .subscribe(data => {
        fileDownloader(data, this.fileName[index] || attachment.fileName);;
      }));
  };
}
