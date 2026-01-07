import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { SharedModule } from '../../../shared/shared.module';
import { CoiDashboardDisclosures } from '../../../admin-dashboard/admin-dashboard.interface';
import { CONSULTING_REDIRECT_URL, DASHBOARD_TRAVEL_DISCLOSURE_FIELD_ORDER, POST_CREATE_DISCLOSURE_ROUTE_URL, POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL } from '../../../app-constants';
import { ReviewerDashboardService } from '../../services/reviewer-dashboard.service';
import { CommonService } from '../../../common/services/common.service';
import { Router } from '@angular/router';
import { CoiReviewCommentSliderService } from '../../../shared-components/coi-review-comments-slider/coi-review-comment-slider.service';
import { CoiDashboardCardEvent } from '../../../shared-components/coi-disclosure-dashboard-card/coi-disclosure-dashboard-card.component';

@Component({
    selector: 'app-shared-disclosure-card',
    templateUrl: './shared-disclosure-card.component.html',
    styleUrls: ['./shared-disclosure-card.component.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule, SharedComponentModule, FormSharedModule]
})
export class SharedDisclosureCardComponent implements OnInit {

    // @Input() cardType: CoiDashboardDisclosureType = 'TRAVEL';
        @Input() disclosureDetails: any = null;
        @Input() cardOrder = DASHBOARD_TRAVEL_DISCLOSURE_FIELD_ORDER;
        @Input() isShowAssignAdminBtn = false;
        @Input() isShowCommentButton = false;

    @Output() cardActions = new EventEmitter<CoiDashboardCardEvent>();

    loginPersonId = '';
    coiList = [];

    constructor(public reviewerDashboardService: ReviewerDashboardService, public commonService: CommonService, private _router: Router,
        private _coiReviewCommentSliderService: CoiReviewCommentSliderService
    ) { }

    ngOnInit() {
        this.loginPersonId = this.commonService.getCurrentUserDetail('personID');
        // this.getDashboardDetails();
    }

    

    redirectToDisclosure(coi) {
        sessionStorage.setItem('previousUrl', this._router.url);
        const redirectUrl = coi?.travelDisclosureId ? POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL : coi?.disclosureId ? CONSULTING_REDIRECT_URL : POST_CREATE_DISCLOSURE_ROUTE_URL;
        this._router.navigate([redirectUrl],
            { queryParams: { disclosureId: coi?.travelDisclosureId || coi?.coiDisclosureId || coi?.disclosureId } });
    }

    // openReviewComment(): void {
    //     this.cardActions.emit({
    //         action: 'COMMENTS',
    //         cardType: this.cardType,
    //         disclosureDetails: this.disclosureDetails
    //     });
    // }

    openReviewComment(disclosureData: CoiDashboardDisclosures): void {
        this._coiReviewCommentSliderService.initializeReviewCommentSlider(disclosureData);
    }

}
