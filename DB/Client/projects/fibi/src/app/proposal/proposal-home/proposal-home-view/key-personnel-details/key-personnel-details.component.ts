import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { ProposalHomeService } from '../../proposal-home.service';
import { environment } from '../../../../../environments/environment';
import { fileDownloader, setHelpTextForSubItems } from '../../../../common/utilities/custom-utilities';
import { ProposalPerson } from '../../../interface/proposal.interface';
import { Router } from '@angular/router';
import { ProposalService } from '../../../services/proposal.service';
import { CommonService } from '../../../../common/services/common.service';
import { TrainingDashboardRequest } from '../../../../admin-modules/person-training/person-training.interface';
import { HTTP_ERROR_STATUS } from '../../../../app-constants';
import {concatUnitNumberAndUnitName} from '../../../../common/utilities/custom-utilities';
declare var $: any;

@Component({
  selector: 'app-key-personnel-details',
  templateUrl: './key-personnel-details.component.html',
  styleUrls: ['./key-personnel-details.component.css']
})
export class KeyPersonnelDetailsComponent implements OnInit, OnChanges {
  @Input() dataVisibilityObj: any = {};
  @Input() result: any = {};
  @Input() helpText: any = {};
  selectedpersonDetails: any = {};
  $subscriptions: Subscription[] = [];
  deployMap = environment.deployUrl;
  isShowMoreOptions = false;
  uploadedFiles = [];
  isReverse: any;
  direction = 1;
  sortListBy: any;
  personCertificationHistory = [];
  isEnableViewMore = false;
  isMaintainRolodex = false;
  isMaintainPerson = false;
  isMaintainTraining = false;
  personDetails: any = {
    units: [],
    proposalPersonRole: null,
    department: ''
  };
  canShowCertification = false;
  canShowTraining = false;
  canViewTrainingDetails = false;


  isRolodexViewModal = false;
  type = 'PERSON';
  isTraining = false;
  id: string;
  personDescription: string;
  trainingStatus: string;
  proposalPersonId: string;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

  constructor(private _proposalHomeService: ProposalHomeService,
              private _router: Router,
              private _commonService: CommonService,
              public _proposalService: ProposalService) { }

  async ngOnInit() {
    await this.getPermissions();
    this.setCanShowCertificationAndTraining();
  }

  ngOnChanges() {
    if (Object.keys(this.helpText).length && this.helpText.keyPersons && this.helpText.keyPersons.parentHelpTexts.length) {
      this.helpText = setHelpTextForSubItems(this.helpText, 'keyPersons');
    }
  }

  async getPermissions() {
    this.isMaintainTraining = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
    this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
    this.isMaintainRolodex = await this._commonService.checkPermissionAllowed('MAINTAIN_ROLODEX');
  }

  /* download CV */
  downloadProposalPersonCV(attachment) {
    if (attachment.attachmentId != null) {
      this.$subscriptions.push(this._proposalHomeService.downloadProposalPersonAttachment(attachment.attachmentId)
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

  getPersonId(person: ProposalPerson) {
    return person.personId ? person.personId : person.rolodexId;
  }

  fetchKeyPersonDetails(person) {
    this.isRolodexViewModal = true;
    this.personDescription = person.proposalPersonRole.description;
    this.proposalPersonId = person.proposalPersonId;
    this.isTraining = this.canShowTraining;
    this.trainingStatus = person.trainingStatus;
    if (person.personId) {
      this.id = person.personId;
    } else {
      this.id = person.rolodexId;
      this.type = 'ROLODEX';
    }
  }

  setPersonRolodexModalView(personRolodexObject) {
    this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
    this.isTraining = false;
    this.trainingStatus = null;
    this.type = 'PERSON';
  }

  checkPersonViewPermission(person) {
    if (person.personId) {
      this.isEnableViewMore = this.isMaintainPerson || (person.personId === this._commonService.getCurrentUserDetail('personID'));
    } else {
      this.isEnableViewMore = this.isMaintainRolodex;
    }
  }

  setCanViewTrainingDetails(person) {
    this.canViewTrainingDetails = this.hasTrainingRightOrIsLoggedInUser(person);
  }

  hasTrainingRightOrIsLoggedInUser(person) {
    return this.isMaintainTraining ||
        (person.personId === this._commonService.getCurrentUserDetail('personID'));
  }

  private getPersonRes(person, res) {
    return person.personId ? res.person : res.rolodex;
  }


  updateSelectedPersonDetails(selectedPersonDetails, person) {
    this.selectedpersonDetails = selectedPersonDetails;
    this.selectedpersonDetails.proposalPersonRole = person.proposalPersonRole;
    this.selectedpersonDetails.trainingStatus = person.trainingStatus;
  }

  viewKeyPerson() {
    const a = document.createElement('a');
    if (this.selectedpersonDetails.hasOwnProperty('personId')) {
      a.href = '#/fibi/person/person-details?personId=' + this.selectedpersonDetails.personId;
    } else {
      a.href = '#/fibi/rolodex?rolodexId=' + this.selectedpersonDetails.rolodexId;
    }
    a.target = '_blank';
    a.click();
  }

  /**
   * sortResult - sort added personnel attachment in modal
   * @param type
   */
  sortResult(type) {
    this.isReverse = !this.isReverse;
    this.sortListBy = type;
    this.direction = this.isReverse ? 1 : -1;
  }

  /**
   * getVersion to get latest file version of attachment
   * @param files
   */
  getVersion(files) {
    this.uploadedFiles = files.filter(attachObj =>attachObj.documentStatusCode === 1);
  }

  navigateToCertification({proposalPersonId}: ProposalPerson) {
    this._router.navigate(['/fibi/proposal/certification'],
        {queryParamsHandling: 'merge', queryParams: {proposalPersonId: proposalPersonId}});
  }

  notifyPersonCertification(person: ProposalPerson) {
    this._proposalService.notifyModalData.next({
      mode: 'SINGLE',
      selectedPerson: JSON.parse(JSON.stringify(person))
    });
  }

  setCanShowCertificationAndTraining() {
    this.canShowCertification = this._proposalService.proposalSectionConfig['DP315']
        && this._proposalService.proposalSectionConfig['DP315'].isActive;
    this.canShowTraining = this._proposalService.proposalSectionConfig['347']
        && this._proposalService.proposalSectionConfig['347'].isActive;
  }
}
