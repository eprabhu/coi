import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonService } from '../common/services/common.service';
import { ResearchSummaryConfigService } from '../common/services/research-summary-config.service';
import { DashboardService } from './dashboard.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { CompleterOptions } from '../service-request/service-request.interface';
import {getCompleterOptionsForCategory} from '../common/services/completer.config';



@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css'],
    providers: [],
})

export class DashboardComponent implements OnInit, OnDestroy {



    unitAdministrators: any = [];
    selectedUnit = null;
    $isExpenditureVolume;
    $isResearchSummary;
    $isAwardedProposal;
    $isAwardBysponsor;
    $isProposalBySponsor;
    $inProgressproposal;
    $isActionList;
    $isSupportList;
    expenditureVolumWidget = true;
    researchSummaryWidget = true;
    awardedProposalBySponsorWidget = true;
    awardBysponsorTypesWidget = true;
    proposalBySponsorTypesWidget = true;
    inProgressproposalBySponsorWidget = true;
    @ViewChild('configurationBar', { static: false }) configurationBar: ElementRef;
    showConfiguringOption = false;
    isApplicationAdministrator = false;
    isNDAAdministrator = false;
    isGroupAdministrator = false;
    isAgreementAdministrator = false;
    $subscriptions: Subscription[] = [];
    researchSummaryConfig: any;
    categoryCompleterOptions: CompleterOptions = new CompleterOptions();

    @ViewChild('mainHeaders', { static: true }) mainHeaders: ElementRef;

    constructor(public _researchSummaryConfigService: ResearchSummaryConfigService,
        public _dashboardService: DashboardService,
        public _commonService: CommonService) {
        document.addEventListener('mouseup', this.offClickHandlerDashboardConf.bind(this));
        document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this));
    }


    offClickMainHeaderHandler(event: any) {
        if (window.innerWidth < 992) {
            const ELEMENT = <HTMLInputElement>document.getElementById('navbarResponsive');
            if (!this.mainHeaders.nativeElement.contains(event.target)) {
                if (ELEMENT.classList.contains('show')) {
                    document.getElementById('responsiveColapse').click();
                }
            }
        }
    }

    ngOnInit() {
        /** subscription for chart widget status */
        this.$isExpenditureVolume = this._researchSummaryConfigService.expenditureVolume;
        this.$isResearchSummary = this._researchSummaryConfigService.researchSummary;
        this.$isAwardedProposal = this._researchSummaryConfigService.awardedProposal;
        this.$isAwardBysponsor = this._researchSummaryConfigService.awardBysponsor;
        this.$isProposalBySponsor = this._researchSummaryConfigService.proposalBySponsor;
        this.$inProgressproposal = this._researchSummaryConfigService.inProgressproposal;
        this.$isActionList = this._researchSummaryConfigService.notifyActionList;
        this.$isSupportList = this._researchSummaryConfigService.supportList;
        this.getPermissions();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

// The function is used for closing nav dropdown at mobile screen
    offClickHandlerDashboardConf(event: any) {
        if (window.innerWidth < 992) {
            if (this.configurationBar) {
                if (!this.configurationBar.nativeElement.contains(event.target)) {
                    this.showConfiguringOption = false;
                }
            }
        }
    }
    setWidgetStatus(widget, value) {
        localStorage.setItem(widget, String(value));
    }

    async getPermissions() {
        this.isNDAAdministrator = await this._commonService.checkPermissionAllowed('NDA_ADMINISTRATOR');
        this.isApplicationAdministrator = await this._commonService.checkPermissionAllowed('APPLICATION_ADMINISTRATOR');
        this.isAgreementAdministrator = await this._commonService.checkPermissionAllowed('AGREEMENT_ADMINISTRATOR');
        this.isGroupAdministrator = await this._commonService.checkPermissionAllowed('VIEW_ADMIN_GROUP_AGREEMENT');
    }

    resetTabData() {
        this.unitAdministrators.length = 0;
        this._researchSummaryConfigService.isResearchSummary = false;
    }
}
