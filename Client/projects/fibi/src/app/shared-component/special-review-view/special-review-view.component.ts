import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { COMPLIANCE_URL, HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';

declare var $: any;
@Component({
	selector: 'app-link-compliance-view',
	templateUrl: './special-review-view.component.html',
	styleUrls: ['./special-review-view.component.css']
})
export class LinkComplianceViewComponent implements OnInit {

	@Input() viewProtocolDetails: any = {};
	@Output() closeModal: EventEmitter<boolean> = new EventEmitter<boolean>();

	$subscriptions: Subscription[] = [];

	constructor(public _commonService: CommonService) { }

	ngOnInit() {
		$('#specialReviewView').modal('show');
	}

	emitClose() {
		this.viewProtocolDetails = null;
		this.closeModal.emit(false);
	}

	viewCompliance() {
		window.open(COMPLIANCE_URL, '_blank');
		this.emitClose();
	}
}
