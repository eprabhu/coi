import { Component, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { ActivityService } from './activity.service';
import { AgreementCommonDataService } from '../../../agreement/agreement-common-data.service';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { Activity } from './activity-interface';

declare var $: any;
@Component({
	selector: 'app-negotiationActivity',
	templateUrl: './activity.component.html',
	styleUrls: ['./activity.component.css'],
	providers: [ActivityService]
})
export class ActivityComponent implements OnInit, OnChanges, OnDestroy {

	@Input() negotiationLookUp: any = {};
	@Input() negotiationLocationId: any = 'general';
	@Input() locationTypeCode: any;
	@Input() tempActivity: any;
	@Output() updatedActivities: EventEmitter<any> = new EventEmitter<any>();

	result: any = {};
	uploadedFile = [];
	negotiationsActivity: Activity;
	map = new Map();
	datePlaceHolder = DEFAULT_DATE_FORMAT;
	setFocusToElement = setFocusToElement;
	$subscriptions: Subscription[] = [];
	isShowActivityModal = false;
	activityTypeCode: any;
	dateObject= {
		startDate: null,
		endDate: null,
		followupDate: null
	}

	constructor(public _commonService: CommonService, private _activityService: ActivityService, 
				public _commonAgreementData: AgreementCommonDataService) { }

	ngOnInit() {
		$('#negotiationActivity').modal('show');
		this.getAgreementGeneralData();
		this.activityTypeCode = '10';
		if (this.tempActivity) {
			this.negotiationsActivity = JSON.parse(JSON.stringify(this.tempActivity));
			this.activityTypeCode = this.tempActivity.activityTypeCode;
			this.negotiationLocationId = this.tempActivity.negotiationLocationId ? this.tempActivity.negotiationLocationId : 'general';
			this.locationTypeCode = this.tempActivity.locationTypeCode ? this.tempActivity.locationTypeCode : '';
			this.setDates();
		}
	}

	setDates() {
		if (this.negotiationsActivity.startDate) {
			this.dateObject.startDate = getDateObjectFromTimeStamp(this.negotiationsActivity.startDate);
		}
		if (this.negotiationsActivity.endDate) {
			this.dateObject.endDate = getDateObjectFromTimeStamp(this.negotiationsActivity.endDate);
		}
		if (this.negotiationsActivity.followupDate) {
			this.dateObject.followupDate = getDateObjectFromTimeStamp(this.negotiationsActivity.followupDate);
		}
	}

	ngOnChanges() {
		this.clearModal();
	}

	getAgreementGeneralData() {
		this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
			if (data) {
				this.result = JSON.parse(JSON.stringify(data));
			}
		}));
	}

	updateAgreementStoreData() {
		this.result = JSON.parse(JSON.stringify(this.result));
		this._commonAgreementData.setAgreementData(this.result);
	}

	/**
	 * activityTypeCode 10 is Comment
	 */
	clearDatesAndValidationMap() {
		if (this.activityTypeCode == '10') {
			this.map.clear();
			this.clearDateObject();
		} else {
			this.map.delete('description');
		}
	}

	changeLocationTypeCode() {
		const LOCATION = this.negotiationLookUp.negotiationsLocations.find(location => location.negotiationLocationId == this.negotiationLocationId);
		this.locationTypeCode = LOCATION ? LOCATION.locationTypeCode : '';
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	setDateToTimeObject() {
		this.negotiationsActivity.startDate = this.dateObject.startDate ? parseDateWithoutTimestamp(this.dateObject.startDate) : null;
		this.negotiationsActivity.endDate = this.dateObject.endDate ? parseDateWithoutTimestamp(this.dateObject.endDate) : null;
		this.negotiationsActivity.followupDate = this.dateObject.followupDate ? parseDateWithoutTimestamp(this.dateObject.followupDate) : null;
	}
	
	addActiviy() {
		this.negotiationsActivity.activityTypeCode = this.activityTypeCode;
		this.activityValidation();
		this.dateValidation();
		if (this.map.size < 1) {
			this.negotiationsActivity.acType = this.tempActivity ? 'U' : 'I';
			this.negotiationsActivity.negotiationLocationId = this.negotiationLocationId && this.locationTypeCode 
															  ? this.negotiationLocationId : '';
			this.negotiationsActivity.negotiationId = this.negotiationLookUp.negotiationId;
			this.negotiationsActivity.locationTypeCode = this.locationTypeCode ? this.locationTypeCode : null;
			this.setTypeObject(this.negotiationsActivity);
			this.setDateToTimeObject();
			this.getAddedActivities();
		}
	}

	getAddedActivities() {
		if (this.negotiationLocationId === 'general') {
			this.negotiationsActivity.negotiationLocationId = '';
		}
		this.$subscriptions.push(this._activityService.setAttachment(this.negotiationsActivity, this.uploadedFile).subscribe(
			(data: any) => {
				this.updateActivtyList(data);
				this.isShowActivityModal = false;
				$('#negotiationActivity').modal('hide');
				this.emitActivity(data.negotiationActivity)
				this._commonService.showToast(HTTP_SUCCESS_STATUS,this.tempActivity?'Activity updated successfully.':'Activity added successfully.');
				this.uploadedFile = [];
				this.clearModal();
				this.updateAgreementStoreData();
			}));
	}

	emitActivity(activity) {
		this.updatedActivities.emit({ activity: activity, showModal: this.isShowActivityModal });
	}

	updateActivtyList(data) {
		if (this.tempActivity) {
			let editIndex = this.negotiationLookUp.negotiationsActivities.findIndex(activity => activity.negotiationsActivityId == this.tempActivity.negotiationsActivityId);
			this.negotiationLookUp.negotiationsActivities.splice(editIndex, 1);
			this.negotiationLookUp.negotiationsActivities.unshift(data.negotiationActivity);
		} else {
			this.negotiationLookUp.negotiationsActivities.unshift(data.negotiationActivity);
			this.result.negotiationsAttachments = data.negotiationsAttachments;
		}
	}
	
	activityValidation() {
		this.map.clear();
		if (this.activityTypeCode == '10' && !this.negotiationsActivity.description) {
			this.map.set('description', '*Please add comment');
		}
		if (this.negotiationsActivity.activityTypeCode == '' || this.negotiationsActivity.activityTypeCode == null) {
			this.map.set('activityType', '* Please select activity type');
		}
	}

	/**
	 * @param activity
	 * Get the object from Activity type and Location type values using type codes
	 */
	setTypeObject(activity) {
		activity.negotiationsActivityType = this.negotiationLookUp.negotiationsActivityTypes.find(element => element.activityTypeCode === activity.activityTypeCode);
		activity.negotiationsLocationType = this.negotiationLookUp.negotiationsLocationTypes.find(element => element.locationTypeCode === activity.locationTypeCode);
	}

	/**
	 * @param  {} filelist
	 * add new attactment to a specific activity
	 */
	addAttachments(filelist) {
		if (filelist && filelist.length > 0) {
			Array.from(filelist).forEach((element: any) => {
				this.uploadedFile.push(element);
			});
		}
	}

	dateValidation() {
		this.map.delete('date');
		if (this.dateObject.startDate && this.dateObject.endDate) {
            if (compareDates(this.dateObject.startDate, this.dateObject.endDate) === 1) {
                this.map.set('date', '* Please select an end date after start date');
            }
        }
	}

	clearModal() {
		this.activityTypeCode = '10';
		this.map.clear();
		this.uploadedFile = [];
		this.negotiationsActivity = {};
		this.clearDateObject();
	}

	clearDateObject() {
		this.dateObject.startDate = null;
		this.dateObject.endDate = null;
		this.dateObject.followupDate = null;
	}
}
