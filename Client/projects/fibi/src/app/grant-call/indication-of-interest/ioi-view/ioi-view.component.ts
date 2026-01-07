    import { Component, OnInit, OnDestroy } from '@angular/core';
    import { ActivatedRoute, Router } from '@angular/router';
    import { IndicationOfInterestService } from '../indication-of-interest.service';
    import { Subscription } from 'rxjs';
    import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
    import { GrantCommonDataService } from '../../services/grant-common-data.service';
    import { CommonService } from '../../../common/services/common.service';

    @Component({
      selector: 'app-ioi-view',
      templateUrl: './ioi-view.component.html',
      styleUrls: ['./ioi-view.component.css']
    })
    export class IoiViewComponent implements OnInit, OnDestroy {
      grantCallIOIId: any;
      result: any = {};
      ioiFetchValues: any = {};
      teamMemberList = [];
      grantCallId: any;
      $subscriptions: Subscription[] = [];
      currency;

    constructor(public _ioiService: IndicationOfInterestService,
                private route: ActivatedRoute,
                private _commonData: GrantCommonDataService,
                private _router: Router,
                private _commonService: CommonService) { }

    configuration: any = {
        moduleItemCode: null,
        moduleSubitemCodes: [1],
        moduleItemKey: '',
        moduleSubItemKey: 0,
        actionUserId: this._commonService.getCurrentUserDetail('personID'),
        actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
        enableViewMode: false,
        isChangeWarning: true,
        isEnableVersion: true,
        questionnaireNumbers: []
    };

    ngOnInit() {
        this.grantCallIOIId = this.route.snapshot.queryParams['ioiId'];
        this.getGrantCallGeneralData();
        this.loadIOIbyGrant();
        this._commonData.$isIoiActive.next(false);
        this.currency = this._commonService.currencyFormat;
        this.setQuestionnaireMode();
    }

    setQuestionnaireMode() {
        this.configuration.enableViewMode = this.route.snapshot.routeConfig.path === 'view' ? [1] : [0];
    }

    getGrantCallGeneralData() {
        this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
            if (data) {
                this.result = JSON.parse(JSON.stringify(data));
                this.grantCallId = this.result.grantCall.grantCallId;
            }
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._commonData.$isIoiActive.next(true);
    }

    /**
     * @param  {this.grantCallId}} when grant call id and update user is  passed lookup data will load for ioi.
     * @param  {updateUser}} when grant call id and update user is  passed lookup data will load for ioi.
     * @param  {this.grantCallIOIId}} when the grantCallIOIId is not null, the function edits the previously created IOI.
     */
    loadIOIbyGrant() {
        this.$subscriptions.push(this._ioiService.fetchDetails({
            'grantCallId': this.grantCallId,
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'grantCallIOIId': this.grantCallIOIId
        }).subscribe(data => {
            this.ioiFetchValues = data;
            this.updateConfigurationData();
            if (this.ioiFetchValues.grantCallIOI.grantCallIOIMembers.length > 0) {
                this.teamMemberList = this.ioiFetchValues.grantCallIOI.grantCallIOIMembers;
            }
        }));
    }

    updateConfigurationData() {
        if (this.ioiFetchValues.grantCallIOIQuestionnaire) {
            this.configuration.questionnaireNumbers = [this.ioiFetchValues.grantCallIOIQuestionnaire.questionnaireId];
            this.configuration.moduleSubItemCode = 1;
            this.configuration.moduleSubItemKey = this.ioiFetchValues.grantCallIOIId || this.grantCallIOIId;
            this.configuration.moduleItemCode = 15;
            this.configuration.moduleItemKey =  this.result.grantCall.grantCallId;
            this.configuration = JSON.parse(JSON.stringify(this.configuration));
        }
    }

    goBackToIOI() {
        this._router.navigate(['fibi/grant/ioi/list'], { queryParamsHandling: 'merge' });
    }
}
