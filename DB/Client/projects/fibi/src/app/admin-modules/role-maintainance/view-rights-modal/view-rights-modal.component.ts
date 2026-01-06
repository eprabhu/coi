import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ViewRightsModalService } from './view-rights-modal.service';

declare var $: any;

@Component({
	selector: 'app-view-rights-modal',
	templateUrl: './view-rights-modal.component.html',
	styleUrls: ['./view-rights-modal.component.css'],
	providers: [ViewRightsModalService]
})
export class ViewRightsModalComponent implements OnInit, OnDestroy {

	@Input() roleId: any;
	@Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

	roleOverview: any;
	$subscriptions: Subscription[] = [];

	constructor(private _viewRightsService: ViewRightsModalService, private _commonService: CommonService) { }

	ngOnInit() {
		this.viewRoleDetails();
	}

	viewRoleDetails(): void {
		this.$subscriptions.push(this._viewRightsService.viewRoleOverview(this.roleId).subscribe(
			(data: any) => {
				this.roleOverview = data;
				$('#roleModal').modal('show');
			}, err => {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in loading Rights list. Please try again.');
			}));
	}

	closeRightModal(): void {
		this.closeModal.emit();
		$('#roleModal').modal('hide');
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

}
