import { Router } from "@angular/router";
import { CommonService } from "../services/common.service";
import { environment } from '../../../environments/environment';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DECLARATION_RIGHTS } from '../../declarations/declaration-constants';
import { COI_CONFIGURATIONS_RIGHTS, ENTITY_DASHBOARD_RIGHTS } from "../../app-constants";
import { COMMON_DISCL_LOCALIZE, DECLARATION_LOCALIZE } from "../../app-locales";

@Component({
    selector: 'app-left-nav-bar',
    templateUrl: './left-nav-bar.component.html',
    styleUrls: ['./left-nav-bar.component.scss']
})
export class LeftNavBarComponent implements OnInit {

    deployMap = environment.deployUrl;
    isNavExpanded = false;
    canViewAdminDashboard = false;
    canViewEntityDashboard = false;
    canViewFCOIDashboard = false;
    canViewReviewerDashboard = true;
    canViewOPADashboard = false;
    canViewProjectDashboard = false;
    canViewDeclarationDashboard = true;
    declarationLocalize = DECLARATION_LOCALIZE;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;

    @ViewChild('sideBarMenu', {static: true}) sideBarMenu: ElementRef;

    constructor(private _commonService: CommonService, public _router: Router) {
        document.addEventListener('mouseup', this.offClickSideBarHandler.bind(this));
    }

    ngOnInit() {
        this.checkUserHasRight();
    }

    offClickSideBarHandler(event) {
        if (this.isNavExpanded) {
            this.toggleNavBar(!this.isNavExpanded);
        }
    }

    toggleNavBar(quickClose = false) {
        if (quickClose) {
            this.isNavExpanded = !this.isNavExpanded;
        } else {
            setTimeout(() => { this.isNavExpanded = !this.isNavExpanded; }, 200);
        }
    }

    checkUserHasRight(): void {
        const IS_SHOW_OPA_DASHBOARD = this._commonService.isShowOpaDisclosure;
        const IS_SHOW_PROJECT_DASHBOARD = this._commonService.isShowFinancialDisclosure;
        const IS_SHOW_DECLARATION_DASHBOARD = this._commonService.activeDeclarationTypes?.length > 0;
        this.canViewEntityDashboard = this._commonService.getAvailableRight(ENTITY_DASHBOARD_RIGHTS);
        this.canViewAdminDashboard = this._commonService.getAvailableRight(COI_CONFIGURATIONS_RIGHTS);
        this.canViewFCOIDashboard = this._commonService.checkFCOIDashboardRights('DISCLOSURES_AND_CMP');
        this.canViewOPADashboard = this._commonService.checkOPARights() && IS_SHOW_OPA_DASHBOARD;
        this.canViewProjectDashboard = this._commonService.checkProjectDashboardRight() && IS_SHOW_PROJECT_DASHBOARD;
        this.canViewDeclarationDashboard = this._commonService.getAvailableRight(DECLARATION_RIGHTS) && IS_SHOW_DECLARATION_DASHBOARD;
        this.canViewReviewerDashboard = (this._commonService.checkFCOIDashboardRights('DISCLOSURE_ONLY')) || (this._commonService.checkOPARights() && IS_SHOW_OPA_DASHBOARD);
    }

    scrollToTop(): void {
        window.scrollTo(0,0);
    }
}
