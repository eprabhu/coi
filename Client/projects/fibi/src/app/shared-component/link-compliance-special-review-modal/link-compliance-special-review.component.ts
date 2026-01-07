import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { setFocusToElement } from '../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS } from '../../app-constants';
import { LInkComplianceSearchObject } from './link-compliance.interface';
import { LinkComplianceService } from './link-compliance.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { getEndPointOptionsForSponsor } from '../../common/services/end-point.config';

declare var $: any;

@Component({
	selector: 'app-link-compliance-special-review',
	templateUrl: './link-compliance-special-review.component.html',
	styleUrls: ['./link-compliance-special-review.component.css'],
	providers: [LinkComplianceService]
})
export class LinkComplianceSpecialReviewComponent implements OnInit, OnDestroy {

	@Input() reviewTypes: any = [];
	@Input() specialReviewApprovalTypes: any = [];
	@Input() specialReviewBindObject: any;
	@Input() reviewType: any;
	@Output() linkProtocol: EventEmitter<any> = new EventEmitter<any>();

	map = new Map();
	isIntegrated = false;
	datePlaceHolder = DEFAULT_DATE_FORMAT;
	specialReviewDateWarningMsg = null;
	setFocusToElement = setFocusToElement;
	linkComplianceObject: LInkComplianceSearchObject = new LInkComplianceSearchObject();
	$subscriptions: Subscription[] = [];
	searchProtocolList: any = [];
	clearInvestigatorField: String;
	elasticPersonSearchOptions: any = {};
	isEmployeeFlag = true;
	fundingSearchOptions: any = {};
	isExtensionEnabled = false;
	isSearch = false;

	constructor(public _commonService: CommonService, private _elasticConfig: ElasticConfigService,
		private _linkComplianceService: LinkComplianceService) { }

	ngOnInit() {
		$('#addNewReview').modal('show');
		this.setLinkComplianceObject();
		this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
		this.fundingSearchOptions = getEndPointOptionsForSponsor();
		this.linkComplianceObject.isEmployeeFlag = true;
	}

	setLinkComplianceObject(): void {
		this.linkComplianceObject.specialReviewTypeCode = this.reviewType.specialReviewTypeCode;
		this.linkComplianceObject.protocolNumber = this.specialReviewBindObject.protocolNumber;
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	emitReviewData(protocol?): void {
		this.linkProtocol.emit(protocol);
	}

	loadProtocolDetail() {
		if (this.linkComplianceObject.protocolStatusCode === 'null') {
			return this.linkComplianceObject.protocolStatusCode = null;
		}
		this.linkComplianceObject.expirationDate = parseDateWithoutTimestamp(this.linkComplianceObject.expirationDate);
		this.$subscriptions.push(
			this._linkComplianceService.loadProtocolDetail(this.linkComplianceObject).subscribe((data: any) => {
				this.searchProtocolList = data.acProtocols && data.acProtocols.length ? data.acProtocols : data.irbProtocols;
				this.isSearch = true;
			},
			err => {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Loading protocols failed. Please try again.');
			}));
	}

	changeMemberType() {
		this.linkComplianceObject.personId = '';
		this.linkComplianceObject.isEmployeeFlag = !this.linkComplianceObject.isEmployeeFlag;
		this.clearInvestigatorField = new String('true');
		this.elasticPersonSearchOptions.defaultValue = '';
		this.isEmployeeFlag ? this.setElasticPersonOption() : this.setElasticRolodexOption();
	}

	setElasticPersonOption() {
		this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
	}

	setElasticRolodexOption() {
		this.elasticPersonSearchOptions = this._elasticConfig.getElasticForRolodex();
	}

	selectedFilter(event) {
		this.linkComplianceObject.personId = event ? this.isEmployeeFlag ? event.prncpl_id : event.rolodex_id : '';
	}

	emptyValidationKeyup(event) {
		if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
			this.linkComplianceObject.personId = '';
		}
	}

	fundingSourceSearch(event) {
		this.linkComplianceObject.fundingSourceTypeCode = event ? event.sponsorCode : null;
	}
}


