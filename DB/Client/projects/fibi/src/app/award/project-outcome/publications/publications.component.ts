import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectOutcomeService } from '../project-outcome.service';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_SUCCESS_STATUS } from '../../../app-constants';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css']
})
export class PublicationsComponent implements OnInit, OnDestroy {

  isPublications = false;
  searchOptions: any = {
    property1: '',
    property2: '',
    property3: null,
    property4: '',
  };
  publicationList: any = {};
  isPublicationSelected = false;
  selectedPublication: any = {};
  awardPublication: any = {};
  awardPublicationList: any = [];
  isPublicationExist: any;
  publicationWarningText: string;
  clearPublicationField: String;
  awardPublicationId;
  deleteIndex;
  publicationDetails: any = {};
  $subscriptions: Subscription[] = [];
  isSaving = false;
  isDesc = false;
  sort: any = {
    sortColumn: '',
    sortOrder: -1
  };

  constructor(public _outcomeService: ProjectOutcomeService, private _commonService: CommonService) { }

  ngOnInit() {
    this.findPublications();
    this.awardPublicationList = this._outcomeService.outcomesData.awardPublications;
    this.isPublications = this.awardPublicationList.length ? true : false;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * @param  {} event
   * assign emitted response from endpoint search to publication Object
   */
  onPublicationSelect(event) {
    if (event) {
      this.selectedPublication = event;
      this.isPublicationSelected = true;
    } else {
      this.isPublicationSelected = false;
      this.publicationWarningText = null;
    }
  }

  setPublicationObject(publication) {
    this.awardPublication.awardId = this._outcomeService.awardData.awardId;
    this.awardPublication.awardNumber = this._outcomeService.awardData.awardNumber;
    this.awardPublication.publicationId = publication.publicationId;
    this.awardPublication.sequenceNumber = this._outcomeService.awardData.sequenceNumber;
    this.awardPublication.publication = publication;
  }

  /**
   * returns value if publiction already added in the list
   */
  duplicationCheckForPublication(): void {
    return this.awardPublicationList.find(element =>
      element.publicationId === this.awardPublication.publicationId);
  }
  /**
   * save publiction to the selected award
   */
  linkPublication(index) {
    this.setPublicationObject(this.publicationList.publications[index]);
    this.isPublicationExist = this.duplicationCheckForPublication();
    if (!this.isPublicationExist && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._outcomeService.linkAwardPublication(this.awardPublication).subscribe(data => {
        this.awardPublicationList.push(data);
        this.isPublications = true;
        this.isPublicationSelected = false;
        this.clearPublicationSearchField();
        this.isPublications = this.awardPublicationList.length ? true : false;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Publication linked successfully.');
        this.publicationWarningText = null;
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    } else {
      this.publicationWarningText = 'Publication already linked. Please use a different Publication.';
      this.isSaving = false;
    }
  }
  /**
   * @param  {} index
   * @param  {} publicationId
   * Delete publication w.r.t the publiction id
   */
  deletePublication(index, publicationId) {
    this.awardPublicationList.splice(index, 1);
    this.$subscriptions.push(this._outcomeService.deletePublication({
      'awardPublicationId': publicationId, 'updateUser': this._commonService.getCurrentUserDetail('userName')
    })
      .subscribe(data => {
        this.clearPublicationSearchField();
        this.isPublications = this.awardPublicationList.length ? true : false;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Publication removed successfully.');
        this.publicationWarningText = null;
      }));
  }
  /**
   * sets default value and clears search field of publication
   */
  clearPublicationSearchField(): void {
    this.searchOptions = {};
    this.searchOptions.property3 = null;
    this.publicationList.publications = [];
  }

  findPublications(): void {
    if (!this.isSaving) {
      this.isSaving = true;
      this.trimSpaceInTextField();
      this._outcomeService.findPublications(this.searchOptions).subscribe(data => {
        this.publicationList = data;
        this.isSaving = false;
      }, err => { this.isSaving = false; });
    }
  }

  sortPublication(columnName) {
    this.isDesc = !this.isDesc;
    this.sort.sortColumn = columnName;
    this.sort.sortOrder = this.isDesc ? 1 : -1;
  }

  trimSpaceInTextField() {
    ['property1', 'property2', 'property4'].forEach(textField => this.searchOptions[textField] = this.searchOptions[textField] && this.searchOptions[textField].trim())
  }

  redirectUrl(url) {
    url.includes('http') ? window.open(url, '_blank') : window.open('//' + url, '_blank');
  }

}
