import { OPA, OPAWorkFlow } from '../opa-interface';
import { Injectable } from '@angular/core';
import { OpaService } from './opa.service';
import { DataStoreService } from './data-store.service';
import { CommonService } from '../../common/services/common.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { extractAllApprovers } from '../../shared-components/workflow-engine2/workflow-engine-utility';
import { HTTP_ERROR_STATUS, OPA_CHILD_ROUTE_URLS, OPA_MODULE_CODE, OPA_REVIEW_RIGHTS, OPA_REVIEW_STATUS } from '../../app-constants';

@Injectable()
export class ReviewRouteGuardService {

	constructor(private _router: Router,
		private _opaService: OpaService,
		private _dataStore: DataStoreService,
		private _commonService: CommonService) {}

	async canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
		if (await this.isReviewTabVisible()) {
			return true;
		} else {
			this._router.navigate([OPA_CHILD_ROUTE_URLS.FORM], { queryParams: { disclosureId: route.queryParamMap.get('disclosureId') } });
		}
	}

	private async isReviewTabVisible(): Promise<boolean> {
		const OPA_DATA: OPA = this._dataStore.getData();
		const { PENDING, SUBMITTED, WITHDRAWN, RETURNED, ROUTING_IN_PROGRESS } = OPA_REVIEW_STATUS;
		const STATUS_CODE = OPA_DATA?.opaDisclosure?.reviewStatusType?.reviewStatusCode?.toString();
		const DISALLOWED_STATUSES = [PENDING, ROUTING_IN_PROGRESS, WITHDRAWN, RETURNED, SUBMITTED].map(status => status.toString());
		const IS_STATUS_ALLOWED = !DISALLOWED_STATUSES.includes(STATUS_CODE) || (this._dataStore.isRoutingReview && STATUS_CODE === ROUTING_IN_PROGRESS.toString());
		const IS_FLOW_ELIGIBLE = this._commonService.opaApprovalFlowType !== 'NO_REVIEW';
		if (IS_FLOW_ELIGIBLE && IS_STATUS_ALLOWED) {
			const IS_REVIEW_TAB_ALLOWED = this._commonService.getAvailableRight(OPA_REVIEW_RIGHTS);
			const HAS_ROUTING = (['ROUTING_REVIEW', 'ROUTING_AND_ADMIN_REVIEW'].includes(this._commonService.opaApprovalFlowType));
			const CAN_ROUTE_LOG_PERSON_REVIEW = HAS_ROUTING && this._commonService.enableRouteLogUserAddOpaReviewer;
			if (CAN_ROUTE_LOG_PERSON_REVIEW && !OPA_DATA?.workFlowResult?.opaDisclosure?.opaDisclosureId) {
				await this.fetchWorkFlowDetails(OPA_DATA?.opaDisclosure?.opaDisclosureId);
			}
			const WORK_FLOW_RESULT: OPAWorkFlow = this._dataStore.getData()?.workFlowResult;
			const IS_ROUTE_LOG_PERSON = extractAllApprovers(WORK_FLOW_RESULT)?.approverPersonIds?.includes(this._commonService.getCurrentUserDetail('personID'));
			return IS_REVIEW_TAB_ALLOWED || OPA_DATA?.isDepLevelAdmin || this._commonService.isOPAReviewer || OPA_DATA?.hasDeptLevelReviewerRight || IS_ROUTE_LOG_PERSON;
		} else {
			return false;
		}
	}

	private fetchWorkFlowDetails(opaDisclosureId: number | string): Promise<void> {
		return new Promise((resolve) => {
			this._opaService.fetchWorkFlowDetails(
				OPA_MODULE_CODE,
				opaDisclosureId
			).subscribe({
				next: (workFlowResult: any) => {
					const OPA_DATA: OPA = this._dataStore.getData();
					workFlowResult.opaDisclosure = OPA_DATA?.opaDisclosure;
					this._dataStore.updateStore(['workFlowResult'], { workFlowResult });
					resolve();
				},
				error: () => {
					this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching route log.');
					resolve();
				}
			});
		});
	}

}
