import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { AgreementService } from '../../agreement.service';
import { AgreementCommonDataService } from '../../agreement-common-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { DEFAULT_DATE_FORMAT, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { NegotiationService } from '../negotiation.service';

declare var $: any;

@Component({
  selector: 'app-general-comments',
  templateUrl: './general-comments.component.html',
  styleUrls: ['./general-comments.component.css']
})
export class GeneralCommentsComponent implements OnDestroy, OnInit, OnChanges {

  result: any = {};
  @Input() negotiationLookUp: any;
  $subscriptions: Subscription[] = [];
  negotiationLocationId: any = '';
  isShow = true;
  addedAttachments: any = [];
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  deleteIndex: any;
  negotiationActivityArray: any;
  tempNegotiationsActivity: any = {
    negotiationId: '',
    activityTypeCode: '',
    startDate: '',
    endDate: '',
    updateUser: '',
    followupDate: '',
    description: '',
    locationTypeCode: null,
    negotiationLocationId: ''
  };
  tempUploadedFile: any = [];
  map = new Map();
  deleteNegotiationId: any;
  locationName: string;
  isEditAttachment = false;
  editActivityId: any;
  currentAttachmentIndex: any;
  isShowModal = false;

  constructor(private _agreementService: AgreementService, public _commonAgreementData: AgreementCommonDataService,
    private _negoService: NegotiationService, public _commonService: CommonService) { }

  ngOnInit() {
    this.getAgreementGeneralData();
    this.getActivities();
    this.isActivityAdded();
  }

  ngOnChanges() {
    this.checkDeletedNegotiationId();
    this.getUpdatedActivities();
    this.deleteNegotiationId = '';
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getUpdatedActivities();
      }
    }));
    this.deleteNegotiationId = '';
  }

  /**
  * Get updated activities when the negotiationlookup changes
  */
  getUpdatedActivities() {
    if (!this.deleteNegotiationId) {
      this.getActivities();
    } else {
      this.getAllActivities();
    }
  }

  /**
  * check whether the deleted location is selected in the filter
  */
  checkDeletedNegotiationId() {
    this._negoService.$deleteLocationId.subscribe((data) => {
      if (data == this.negotiationLocationId) {
        this.deleteNegotiationId = data;
        this.negotiationLocationId = '';
      }
    });
  }

  /**
   * get added activities.
   */
  isActivityAdded() {
    this._agreementService.$isActivityAdded.subscribe((data) => {
      if (data) {
        this.getActivities();
      }
    });
  }

  /**
  * Get filter based activities
  */
  getActivities() {
    this.negotiationLocationId ? this.getIdBasedActivities() : this.getAllActivities();
  }

  /**
   * Get all activities when all is selected in filter
   */
  getAllActivities() {
    this.negotiationActivityArray = [];
    if (this.negotiationLookUp.negotiationsActivities) {
      this.negotiationActivityArray = this.negotiationLookUp.negotiationsActivities;
    }
  }

  /**
   * Get activities based on negotiationLocationId.
   */
  getIdBasedActivities() {
    if (this.negotiationLocationId === 'general') {
      this.getGeneralActivities();
    } else {
      this.getLocationBasedActivities();
    }
  }

  /**
  * get location based activities
  */
  getLocationBasedActivities() {
    this.negotiationActivityArray = [];
    this.negotiationLookUp.negotiationsActivities.forEach((activity: any) => {
      if (activity.negotiationLocationId == this.negotiationLocationId) {
        this.negotiationActivityArray.push(activity);
      }
    });
  }

  /**
   * get general activites
   */
  getGeneralActivities() {
    this.negotiationActivityArray = [];
    this.negotiationLookUp.negotiationsActivities.forEach((activity: any) => {
      if (!activity.negotiationLocationId) {
        this.negotiationActivityArray.push(activity);
      }
    });
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * delete user selected activity
   * @param deleteIndex
   */
  deleteActivity(deleteIndex) {
    const negotiationsActivityId = this.negotiationActivityArray[deleteIndex].negotiationsActivityId;
    this.negotiationActivityArray[deleteIndex].acType = 'D';
    this.$subscriptions.push(
      this._negoService.deleteActivity(this.negotiationActivityArray[deleteIndex])
        .subscribe((response: any) => {
          this.negotiationActivityArray.splice(deleteIndex, 1);
          if (this.negotiationLocationId) {
            this.changeLookUp(negotiationsActivityId);
          }
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Activity deleted successfully.');
        }));
  }

  /**
   * remove deleted activity from negotiationLookUp
   * @param id
   */
   changeLookUp(id) {
    let deleteIndex: any;
    this.negotiationLookUp.negotiationsActivities.forEach((element, index) => {
        if (element.negotiationsActivityId === id) {
          deleteIndex = index;
        }
      });
      this.negotiationLookUp.negotiationsActivities.splice(deleteIndex, 1);
      this.negotiationLookUp.negotiationsActivities = this.negotiationLookUp.negotiationsActivities;
  }

  editActivity(activity) {
    this.tempNegotiationsActivity = Object.assign({}, activity);
  }

  

  deleteAttachment(attachmentId, index, negotiationActivityID) {
    this.$subscriptions.push(this._negoService.deleteAttachmentByid(attachmentId).subscribe((data: any) => {
      this.negotiationActivityArray.forEach((activity) => {
        if (activity.negotiationsActivityId === negotiationActivityID) {
          activity.attachmentDataList.splice(index, 1);
        }
      });
      this.addedAttachments.splice(index, 1);
    }));
  }

  downloadAttachment(attachment) {
    this.$subscriptions.push(this._negoService.downloadAttachment(attachment.negotiationAttachmentId).subscribe((data: any) => {
      const a = document.createElement('a');
      const blob = new Blob([data], { type: data.type });
      a.href = URL.createObjectURL(blob);
      a.download = attachment.fileName;
      a.id = 'attachment';
      document.body.appendChild(a);
      a.click();
    },
      error => console.log('Error downloading the file.', error),
      () => {
        console.log('OK');
        document.body.removeChild(document.getElementById('attachment'));
      }));
  }

  updateNegotiationActivity(event) {
    if(event) {
      this._agreementService.$isActivityAdded.next(true);
      this.isShowModal = event.showModal;
    }
  }

  getActivityEditPermission(updateUser) {
    return (updateUser === this._commonService.getCurrentUserDetail('userName') ||
      this.result.availableRights.includes('AGREEMENT_ADMINISTRATOR')) &&
      this.result.agreementHeader.agreementStatusCode !== '3' &&
      this.result.agreementHeader.agreementStatusCode !== '4' ? true : false;
  }
}
