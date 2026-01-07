import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
    CONSULTING_REDIRECT_URL, CREATE_DISCLOSURE_ROUTE_URL, CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, DISCLOSURE_TYPE, OPA_CHILD_ROUTE_URLS, POST_CREATE_DISCLOSURE_ROUTE_URL, OPA_INITIAL_VERSION_NUMBER, PROJECT_TYPE,
    DISCLOSURE_CONFLICT_STATUS_BADGE, CONSULTING_REVIEW_STATUS_BADGE, CONSULTING_DISPOSITION_STATUS_BADGE, OPA_REVIEW_STATUS_BADGE, OPA_DISPOSITION_STATUS_BADGE,
    COI_DISPOSITION_STATUS_BADGE
} from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { Router } from '@angular/router';
import { UserDisclosureDetails } from '../../common/services/coi-common.interface';
import { COMMON_DISCL_LOCALIZE } from '../../app-locales';
import { TRAVEL_REVIEW_STATUS_BADGE } from '../../travel-disclosure/travel-disclosure-constants';

@Component({
    selector: 'app-shared-entire-disclosure-history',
    templateUrl: './shared-entire-disclosure-history.component.html',
    styleUrls: ['./shared-entire-disclosure-history.component.scss']
})
export class SharedEntireDisclosureHistoryComponent implements OnInit {

    @Output() CloseSlider: EventEmitter<any> = new EventEmitter<any>;
    @Input() disclosureItem: any;
    @Input() currentDisclosureDetails: UserDisclosureDetails;
    @Input() isLastElement: boolean;
    @Input() isOpenSlider: boolean;
    @Input() isTriggeredFromSlider = false;
    readMoreOrLess = [];
    isPurposeReadMore = false;
    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    hasSameDisclosure = false;
    opaInitialVersion = OPA_INITIAL_VERSION_NUMBER;
    PROJECT_TYPE = PROJECT_TYPE;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    disclosureConflictStatusBadgeClass = DISCLOSURE_CONFLICT_STATUS_BADGE;
    travelReviewStatusBadge = TRAVEL_REVIEW_STATUS_BADGE;
    opaDispositionStatusBadge = OPA_DISPOSITION_STATUS_BADGE;
    opaReviewStatusBadge = OPA_REVIEW_STATUS_BADGE;
    consultingDispositionStatusBadge = CONSULTING_DISPOSITION_STATUS_BADGE;
    consultingReviewStatusBadge = CONSULTING_REVIEW_STATUS_BADGE;
    coiDispositionStatusBadge = COI_DISPOSITION_STATUS_BADGE;
        
    constructor(public commonService: CommonService, private _router: Router) { }

    ngOnInit(): void {
        this.checkIfSameDisclosure();
    }

    redirectToDisclosure(): void {
        const { travelDisclosureId, opaDisclosureId, consultDisclId, reviewStatusCode, disclosureId } = this.disclosureItem;
        const REDIRECT_URL =
            travelDisclosureId ? CREATE_TRAVEL_DISCLOSURE_ROUTE_URL :
                opaDisclosureId ? OPA_CHILD_ROUTE_URLS.FORM :
                    consultDisclId ? CONSULTING_REDIRECT_URL :
                        reviewStatusCode === '1' ? CREATE_DISCLOSURE_ROUTE_URL :
                            POST_CREATE_DISCLOSURE_ROUTE_URL;
        const queryParams = { disclosureId: travelDisclosureId || disclosureId || opaDisclosureId || consultDisclId };
        sessionStorage.setItem('previousUrl', this._router.url);
        this.CloseSlider.next();
        this.redirectURL(REDIRECT_URL, queryParams);
    }

    private redirectURL(url: string, params: any = null): void {
		this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
			this._router.navigate([url], params ? { queryParams: params } : {});
		});
	}

    redirectToProject(): void {
        const { documentNumber, projectId, projectTypeCode, projectNumber } = this.disclosureItem || {};
        this.isOpenSlider ? this.commonService.openProjectHierarchySlider(projectTypeCode, projectNumber)
            : this.commonService.redirectToProjectDetails(projectTypeCode, (documentNumber || projectId));
    }

    // This function is used for check whether the user have Entity right or not,It may be useful for future implementation.
    // showViewButton() {
    //     return  this.commonService.getAvailableRight(['MANAGE_ENTITY', 'VIEW_ENTITY']) && !['manage-entity/'].some(ele => this._router.url.includes(ele))
    // }

    viewEntityDetails() {
        this.commonService.openEntityDetailsModal(this.disclosureItem.entityId);
    }

    private checkIfSameDisclosure(): void {
        const KEYS: string[] = [ 'disclosureId', 'consultDisclId', 'travelDisclosureId', 'opaDisclosureId', 'declarationId' ];
        this.hasSameDisclosure = KEYS.some( key => this.currentDisclosureDetails?.[key] && this.currentDisclosureDetails?.[key] === this.disclosureItem?.[key]);
    }

}
