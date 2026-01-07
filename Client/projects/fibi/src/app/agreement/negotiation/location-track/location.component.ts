import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { NegotiationService } from '../negotiation.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { scrollIntoView } from '../../../common/utilities/custom-utilities';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { AgreementCommonDataService } from '../../agreement-common-data.service';
import { AgreementService } from '../../agreement.service';
import { environment } from '../../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-nego-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit, OnDestroy, OnChanges {

  @Input() result: any = {};
  @Input() negotiationLookUp: any = {};

  locationData: any = null;
  statusData: any = null;
  map = new Map();
  $subscriptions: Subscription[] = [];
  elasticSearchOptions: any = {};
  locationObject: any = {};
  locationDetails: any = {};
  clearField: String;
  deleteindex;
  locationIndex: any;
  isAgreementAdministrator = false;
  isGroupAdministrator = false;
  tempLocation: any = {};
  assigneePersonId: any;
  uploadedFiles: any = [];
  attachmentWarninMsg = null;
  isLocationEdit = false;
  isLocationViewMode = true;
  isShowStartReviewButton = false;
  currentUserId = '';
  completeReviewObject: any = {
    agreementNote: {}
  };
  completeLocationId: any;
  isLocation = true;
  editIndex: any;
  showMoreOptions = false;
  setLocationData: any;
  negotiationLocationId: any;
  sortBy: any;
  direction = 1;
  isDesc: any;
  description: any;
  locationDescription: any;
  locationTypeCode: any;
  deployMap = environment.deployUrl;
  isShowActivityModal = false;

  constructor(private _negotiationService: NegotiationService, public _commonService: CommonService,
    private _agreementService: AgreementService, private _elasticConfigService: ElasticConfigService,
    private _commonAgreementData: AgreementCommonDataService) { }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  ngOnInit() {
    this.elasticSearchOptions = this._elasticConfigService.getElasticForPerson();
    this.isAgreementAdministrator = this.result.availableRights.includes('AGREEMENT_ADMINISTRATOR');
    this.isGroupAdministrator = this.result.availableRights.includes('VIEW_ADMIN_GROUP_AGREEMENT');
    this.currentUserId = this._commonService.getCurrentUserDetail('personID');
    this.isShowStartReviewButton = this.checkForStartReviewButton();
  }

  checkRequesterId() {
    return (this.result.agreementHeader.requestorPersonId === this._commonService.getCurrentUserDetail('personID')) ? true : false;
  }

  ngOnChanges() {
    if (Object.entries(this.negotiationLookUp).length > 0) {
      this.negotiationLookUp.negotiationLocationStatuses.forEach((value) => {
        if (value.locationStatusCode === 1) { this.statusData = value; }
      });
    }
    this.setLocationMode();
  }

  setDefaultStatus() {
    this.statusData = this.negotiationLookUp.negotiationLocationStatuses.find(x => x.locationStatusCode === '1');
  }

  /**
   * set location data based on id.
   * @param id
   */
  setLocationDataForActivity(id) {
    this.negotiationLookUp.negotiationsLocations.forEach((element, index) => {
      if (index === id) {
        this.negotiationLocationId = element.negotiationLocationId;
        this.locationTypeCode = element.locationTypeCode;
      }
    });
  }

  setLocationMode() {
    this.isLocationViewMode = ['3', '4', '8', '9', '10'].includes(this.result.agreementHeader.agreementStatusCode);
  }

  sortResult(type) {
    this.sortBy = type;
    this.direction = this.isDesc ? 1 : -1;
  }
  /**
    * sets new location for negotiation activity
    */
  saveLocation() {
    this.map.clear();
    this.setLocationObject();
    if (this.checkLocationMandatory() && !this.checkDuplication()) {
      this.$subscriptions.push(this._negotiationService.setNewLocation(this.locationObject).subscribe((data: any) => {
        this.negotiationLookUp.negotiationsLocations = data.negotiationsLocations;
        this.updateActivities();
        this.clearLocationObject();
        this.result.negotiationsLocations = data.negotiationsLocations;
        this.updateAwardStoreData();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, this.isLocationEdit?'Location updated successfully.':'Location saved successfully.');
      },err => { this.clearLocationObject(); }));
    }
    if (!this.map.size) {
      $('#add-location-modal').modal('hide');
    }
  }

  /**
   * update activites corresponding to edited location.
   */
  updateActivities() {
    this.negotiationLookUp.negotiationsActivities.forEach(activity => {
      if (activity.negotiationLocationId === this.locationObject.negotiationLocationId) {
        activity.negotiationsLocation = this.locationObject;
      }
    });
  }

  updateAwardStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonAgreementData.setAgreementData(this.result);
    this._commonAgreementData.isShowSaveButton = false;
  }

  checkDuplication() {
    let isDuplicate = false;
    isDuplicate = this.negotiationLookUp.negotiationsLocations.find((el: any, index) => {
      if (el.locationTypeCode === this.locationObject.locationTypeCode && this.locationIndex !== index
        && el.assigneePersonId === this.locationObject.assigneePersonId) {
        return el.locationStatusCode !== '3' ? true : false;
      }
    });
    if (isDuplicate) {
      this.map.set('location', '* Already a review is Inprogress/Assigned in this location.');
    } else {
      this.map.delete('location');
    }
    return isDuplicate;
  }

  setLocationObject() {
    this.locationObject.negotiationId = this.result.agreementHeader.negotiationId;
    this.locationObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.locationObject.createUser = this._commonService.getCurrentUserDetail('userName');
    this.locationObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.locationObject.negotiationsLocationType = this.locationData;
    this.locationObject.description = this.description;
    this.locationObject.locationTypeCode = this.locationData ? this.locationData.locationTypeCode : null;
    this.locationObject.negotiationLocationStatus = this.statusData;
    this.locationObject.locationStatusCode = this.statusData ? this.statusData.locationStatusCode : null;
  }

  checkLocationMandatory() {
    this.map.clear();
    if (this.locationObject.locationTypeCode === 'null' || !this.locationObject.locationTypeCode) {
      this.map.set('location', '* Please select a location.');
    }
    if (this.locationObject.locationStatusCode === 'null' || !this.locationObject.locationStatusCode) {
      this.map.set('status', '* Please select a status.');
    }
    return this.map.size > 0 ? false : true;
  }

  selectUserElasticResult(event) {
    this.locationObject.assigneePersonId = event ? event.prncpl_id : null;
  }

  editLocation(index) {
    this.map.clear();
    this.locationIndex = index;
    this.editIndex = index;
    this.isLocationEdit = true;
    this.locationDetails = JSON.parse(JSON.stringify(this.negotiationLookUp.negotiationsLocations[index]));
    this.locationObject.negotiationLocationId = this.locationDetails.negotiationLocationId;
    this.locationObject.createTimestamp = this.locationDetails.createTimestamp;
    this.locationObject.assigneePersonId = this.locationDetails.assigneePersonId;
    this.locationData = this.negotiationLookUp.negotiationsLocationTypes.
      find(value => this.locationDetails.locationTypeCode === value.locationTypeCode);
    this.statusData = this.negotiationLookUp.negotiationLocationStatuses.
      find(value => this.locationDetails.locationStatusCode === value.locationStatusCode);
    this.description = this.locationDetails.description;
    this.clearField = new String('false');
    this.elasticSearchOptions.defaultValue = this.locationDetails.person ? this.locationDetails.person.fullName : '';
    scrollIntoView('locationId');
  }

  /**Delete location*/
  deleteLocation(deleteindex) {
    const negotiationLocationId = this.negotiationLookUp.negotiationsLocations[deleteindex].negotiationLocationId;
    this.$subscriptions.push(this._negotiationService.deleteNegotiationLocation({
      'negotiationId': this.result.agreementHeader.negotiationId,
      'negotiationLocationId': this.negotiationLookUp.negotiationsLocations[deleteindex].negotiationLocationId,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    }).subscribe((data: any) => {
      this.negotiationLookUp.negotiationsLocations = data.negotiationsLocations;
      this.result.negotiationsLocations = data.negotiationsLocations;
      this.clearLocationObject();
      this._negotiationService.$deleteLocationId.next(negotiationLocationId);
      this._commonAgreementData.$locationChange.next(true);
      this.updateAwardStoreData();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Location deleted successfully');
    }));
  }

  clearLocationObject() {
    this.description = '';
    this.locationObject = {};
    this.locationData = null;
    this.statusData = null;
    this.clearField = new String('true');
    this.elasticSearchOptions.defaultValue = '';
    // this.isLocationEdit = false;
    this.map.clear();
    this.locationIndex = null;
  }

  /**
   * LocationTypeCode and its corresponding locations.
   * 1 -> ORS
   * 2 -> Legal
   * 3 -> TMI
   * 4 -> 3rd Party
   * 5 -> Other Party
   * 6 -> HOD
   * LocationStatusCode and its status.
   * 1 -> Assigned
   * 2 -> InProgress
   * 3 -> Completed
   * To hide 'HOD, Legal, Third party options from the location dropdown while any of these review is in in-progress.
   */
  filterLocationLookUp() {
    if (this.negotiationLookUp.negotiationsLocations.length > 0) {
      const INDEX = this.negotiationLookUp.negotiationsLocations.findIndex(location => location.locationStatusCode === '2' &&
        ['2', '4', '6'].includes(location.locationTypeCode));
      return (['1', '2', '3'].includes(this.result.agreementHeader.workflowStatusCode) || INDEX > -1) && !this.isLocationEdit ?
        this.filterFromNegotiationLookUp() : this.negotiationLookUp.negotiationsLocationTypes;
    } else {
      return this.negotiationLookUp.negotiationsLocationTypes;
    }
  }

  filterFromNegotiationLookUp() {
    return this.negotiationLookUp.negotiationsLocationTypes.filter(item =>
      (item.locationTypeCode !== '2' && item.locationTypeCode !== '4' && item.locationTypeCode !== '6'));
  }

  startReview(negotiationLocationId) {
    const startReviewObject: any = {};
    startReviewObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    startReviewObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    startReviewObject.negotiationId = this.result.agreementHeader.negotiationId;
    startReviewObject.personId = this._commonService.getCurrentUserDetail('personID');
    startReviewObject.negotiationLocationId = negotiationLocationId;
    this.$subscriptions.push(this._agreementService.startReview(startReviewObject)
      .subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review started successfully.');
        this.negotiationLookUp.negotiationsLocations = data.negotiationsLocations;
        this.result.negotiationsLocations = data.negotiationsLocations;
        this.updateAwardStoreData();
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Start Review action failed. Please try again.'); }));
  }

  checkForStartReviewButton() {
    return (this.result.agreementHeader.agreementStatusCode !== '3'
      && this.result.agreementHeader.agreementStatusCode !== '4');
  }

  setObjectForReviewCompletion() {
    this.completeReviewObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.completeReviewObject.negotiationId = this.result.agreementHeader.negotiationId;
    this.completeReviewObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.completeReviewObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.completeReviewObject.agreementNote.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.completeReviewObject.agreementNote.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.completeReviewObject.negotiationLocationId = this.completeLocationId;
  }

  completeReview() {
    this.setObjectForReviewCompletion();
    this.getReviewCompletionData();
  }

  getReviewCompletionData() {
    this.$subscriptions.push(this._agreementService.completeReview(this.completeReviewObject)
      .subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review completed successfully.');
        this.result.agreementHeader = data.agreementHeader;
        this.result.negotiationsLocations = data.negotiationsLocations;
        this.negotiationLookUp.negotiationsLocations = data.negotiationsLocations;
        this.result.agreementComments = data.agreementComments;
        this.updateAwardStoreData();
        this.completeReviewObject.agreementNote.note = null;
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Complete Review action failed. Please try again.'); }));
  }

  initializeValues() {
    this.setDefaultStatus();
  }

  updateNegotiationActivity(event) {
    this._agreementService.$isActivityAdded.next(true);
    this.isShowActivityModal = event.showModal;
  }
}
