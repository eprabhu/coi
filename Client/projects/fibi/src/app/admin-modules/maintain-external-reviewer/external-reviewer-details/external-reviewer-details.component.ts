import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExtReviewerMaintenanceService } from '../external-reviewer-maintenance-service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ExternalReviewerExt, ExtReviewer } from '../reviewer-maintenance.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { environment } from '../../../../environments/environment';
declare var $: any;
@Component({
    selector: 'app-external-reviewer-details',
    templateUrl: './external-reviewer-details.component.html',
    styleUrls: ['./external-reviewer-details.component.css']
})

export class ExternalReviewerDetailsComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    extReviewer: ExtReviewer = {};
    externalReviewerRt: ExternalReviewerExt = {};
    mode: string;
    isMaintainReviewer = false;
    lookUpData: any;
    deployMap = environment.deployUrl;
    externalReviewDetails: any = null;

    constructor(
        public _extReviewerMaintenanceService: ExtReviewerMaintenanceService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _commonService: CommonService
    ) { }

    async ngOnInit() {
        this.isMaintainReviewer = await this._extReviewerMaintenanceService.getMaintainReviewerPermission();
        this.setInitialValues();
        this.getExternalReviewerData();
        this.setQueryParams();
        this._extReviewerMaintenanceService.navigationUrl = this._router.url.split('?')[0];
    }

    private setQueryParams() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            if (this._extReviewerMaintenanceService.mode && this._extReviewerMaintenanceService.mode != params.mode) {
                this._extReviewerMaintenanceService.$externalReviewerDetails.next(this.externalReviewDetails);
            }
            if (params.mode) {
                this._extReviewerMaintenanceService.mode = params.mode;
            }
        }));
    }

    setInitialValues() {
        this.lookUpData = this._extReviewerMaintenanceService.lookUpData;
    }

    getExternalReviewerData(): void {
        this.$subscriptions.push(this._extReviewerMaintenanceService.$externalReviewerDetails.subscribe((data: any) => {
            this.externalReviewDetails = data;
            if (data.extReviewer) {
                this.extReviewer = data.extReviewer;
                this.externalReviewerRt = data.externalReviewerExt ? data.externalReviewerExt : null;
            }
        }));
    }

    closeSaveAndExitModal() {
        $('#saveAndExitModal').modal('hide');
        this._extReviewerMaintenanceService.isDataChange = false;
        this._extReviewerMaintenanceService.navigationUrl ? this.redirectToTabs() : this.redirectToFibiDashboard();
    }

    redirectToTabs() {
        this._router.navigate([this._extReviewerMaintenanceService.navigationUrl], { queryParamsHandling: "merge" });
        this._extReviewerMaintenanceService.navigationUrl = '';
    }

    redirectToFibiDashboard() {
        this._router.navigate([this._commonService.dashboardNavigationURL]);
        this._commonService.dashboardNavigationURL = '';
    }

  regeneratePassword() {
    this.$subscriptions.push(
      this._extReviewerMaintenanceService
        .resetExternalReviewerPassword(this.extReviewer.externalReviewerId)
        .subscribe((data) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Password Regenerated and Mailed to user successfully.', 5000);
        }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.'))
    );
  }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
