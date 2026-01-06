import { Component, Input, OnChanges, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { environment } from '../../../../../../environments/environment';
import { OverviewService } from '../overview.service';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';
import { ProposalPersons } from '../../../comparison-constants';
import {ProposalService} from '../../../../services/proposal.service';
import { fileDownloader, setHelpTextForSubItems } from '../../../../../common/utilities/custom-utilities';
import { CommonService } from '../../../../../common/services/common.service';
import {concatUnitNumberAndUnitName} from '../../../../../common/utilities/custom-utilities';
import { DataStoreService } from '../../../../services/data-store.service';
declare var $: any;

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given proposalId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches data for
 * all these components in one service call.
 */
@Component({
  selector: 'app-key-personnel',
  templateUrl: './key-personnel.component.html',
  styleUrls: ['./key-personnel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyPersonnelComponent implements OnChanges, OnDestroy {

  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    proposalId: ''
  };
  @Input() currentMethod: string;
  @Input() helpText: any = {};

  isPersonData = true;
  proposalPersons: any = [];
  currentPersons = [];
  fileName: any = [];
  deployMap = environment.deployUrl;
  $subscriptions: Subscription[] = [];
  isKeyPersonWidgetOpen = true;
  canShowCertification = false;
  canShowTraining = false;
  configuration = {
    moduleItemCode: 3,
    moduleSubitemCodes: [3],
    moduleItemKey: null,
    moduleSubItemKey: '',
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
    enableViewMode: true,
    isEnableVersion: false,
    isChangeWarning: false
};

isReverse: any;
sortListBy: any;
direction = 1;
uploadedFiles: any;
attachmentPersonFullname: any;
nonEmployeeCertification: Boolean = true;
concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;


  constructor(private _overviewService: OverviewService,
              private _toolKitEvents: ToolkitEventInteractionService,
              private _proposalService: ProposalService,
              private _commonService: CommonService,
              private _dataStore: DataStoreService) {
  }


  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no proposal id available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges() {
    if (this.currentMethod + '' !== '') {
      this.currentMethod + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
    }
    this.setCanShowCertificationAndTraining();
    if (Object.keys(this.helpText).length && this.helpText.keyPersons && this.helpText.keyPersons.parentHelpTexts.length) {
      this.helpText = setHelpTextForSubItems(this.helpText, 'keyPersons');
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
   * we compare the inner Units array inside the proposalPersons. So achieve this need
   * to keep a copy of current key persons's since after the first comparison the data on the current
   * is lost. so currentPersons holds a copy of the data.
   * filename is save in temp variable so that it will be available on compare mode
   * (during compare the file name may contain html tags)
   * personId and rolodexId is set to proposalPersonAttachment and units
   * as primary key combination for compare array
   */
  compare(): void {
    this.setPersonId(this.comparisonData.base[ProposalPersons.reviewSectionName]);
    this.setPersonId(this.comparisonData.current[ProposalPersons.reviewSectionName]);
    this.currentPersons = JSON.parse(JSON.stringify(this.comparisonData.current[ProposalPersons.reviewSectionName]));
    this.proposalPersons = compareArray(this.comparisonData.base[ProposalPersons.reviewSectionName],
      this.comparisonData.current[ProposalPersons.reviewSectionName],
      ProposalPersons.reviewSectionUniqueFields,
      ProposalPersons.reviewSectionSubFields);
    this.proposalPersons.forEach((person, index) => {
      if (person.status === 0) {
        const current = this.findInCurrent(person.personId ? person.personId : person.rolodexId);
        person.units = compareArray(person.units,
          current.units, ['unitNumber', 'personId', 'rolodexId'], []);
        this.fileName[index] = person.proposalPersonAttachment.length ? person.proposalPersonAttachment[0].fileName : [];
        person.proposalPersonAttachment = compareArray(person.proposalPersonAttachment,
          current.proposalPersonAttachment, ProposalPersons.reviewSectionUniqueFields,
          ['fileName']);
      }
    });
  }

  openQuestionnaireModal(person) {
    this.configuration.moduleItemKey = this.comparisonData.proposalId || '';
    this.configuration.moduleSubItemKey = person.personId;
    this.configuration = {...this.configuration};
    $('#certificateQuestionnaireModal').modal('show');
  }

  setPersonId(personList) {
    personList.forEach(person => {
      person.units.map(v => Object.assign(v, { personId: person.personId, rolodexId: person.rolodexId }));
      person.proposalPersonAttachment.map(v => Object.assign(v, { personId: person.personId, rolodexId: person.rolodexId }));
    });
  }

  findInCurrent(code) {
    return this.currentPersons.find(person => person.personId === code || person.rolodexId === code);
  }

  setCurrentView() {
    this.proposalPersons = this.comparisonData.base[ProposalPersons.reviewSectionName];
    this.fileName = [];
  }

  /**
   * To dynamically create a download link and initiate click to download the desired file.
   */
  constructDownloadLink(attachment, URL, index) {
    const a = document.createElement('a');
    a.href = URL;
    a.download = this.fileName[index] || attachment.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /**
   * purpose: To hide and show depending on current view mode.
   */
  setCanShowCertificationAndTraining() {
    const isViewMode = this.currentMethod ? this.currentMethod.trim() === 'VIEW' : false;
    this.canShowCertification = isViewMode && this._proposalService.proposalSectionConfig['DP315']
        && this._proposalService.proposalSectionConfig['DP315'].isActive;
    this.canShowTraining = isViewMode && this._proposalService.proposalSectionConfig['347']
        && this._proposalService.proposalSectionConfig['347'].isActive;
    this.nonEmployeeCertification = this._dataStore.getData(['nonEmployeeCertification']).nonEmployeeCertification;
  }

  personAttachment(dataObject) {
    this.sortListBy = '';
    this.attachmentPersonFullname = dataObject.fullName;
    $('#showAttachment').modal('show');
  }

  getVersion(files) {
    this.uploadedFiles = files.filter(attachObj => attachObj.documentStatusCode === 1);
  }

  sortResult(type) {
    this.isReverse = !this.isReverse;
    this.sortListBy = type;
    this.direction = this.isReverse ? 1 : -1;

  }

  downloadProposalPersonCV(attachment) {
    if (attachment.attachmentId != null) {
      this.$subscriptions.push(this._overviewService.downloadProposalPersonAttachment(attachment.attachmentId)
        .subscribe(data => {
          fileDownloader(data, attachment.fileName);
        }));
    } else {
      const URL = 'data:' + attachment.mimeType + ';base64,' + attachment.attachment;
      const a = document.createElement('a');
      a.href = URL;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
    }
  }
}
