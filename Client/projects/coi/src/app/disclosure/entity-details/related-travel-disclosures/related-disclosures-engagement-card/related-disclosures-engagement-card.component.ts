import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL,
         DASHBOARD_TRAVEL_DISCLOSURE_FIELD_ORDER, ENGAGEMENT_ROUTE_URL} from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { TravelDisclosure } from '../../../../travel-disclosure/travel-disclosure.interface';
import { openInNewTab } from '../../../../common/utilities/custom-utilities';
import { COMMON_DISCL_LOCALIZE } from '../../../../app-locales';
import { TRAVEL_DISCL_REVIEW_STATUS_TYPE, TRAVEL_DOCUMENT_STATUS_BADGE, TRAVEL_REVIEW_STATUS_BADGE } from 'projects/coi/src/app/travel-disclosure/travel-disclosure-constants';

@Component({
    selector: 'app-related-disclosures-engagement-card',
    templateUrl: './related-disclosures-engagement-card.component.html',
    styleUrls: ['./related-disclosures-engagement-card.component.scss']
})

export class RelatedDisclosuresEngagementCardComponent implements OnInit {

    @Input() disclosureItem: TravelDisclosure;

    isShowAllCountries = false;
    travelEngagementCardOrder = DASHBOARD_TRAVEL_DISCLOSURE_FIELD_ORDER;
    isCurrentDisclosure = false;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    travelReviewStatusBadge = TRAVEL_REVIEW_STATUS_BADGE;
    travelDocumentStatusBadge = TRAVEL_DOCUMENT_STATUS_BADGE;
    constructor(public commonService: CommonService, private _router: Router, private _route: ActivatedRoute) { }

    ngOnInit() {
        const QUERY_PARAMS = this._route.snapshot.queryParamMap;
        const DISCLOSURE_ID_PARAM = QUERY_PARAMS.get('disclosureId');
        const DISCLOSURE_ID = DISCLOSURE_ID_PARAM ? Number(DISCLOSURE_ID_PARAM) : null;
        this.isCurrentDisclosure = this._router.url.includes('travel-disclosure') && DISCLOSURE_ID === this.disclosureItem.travelDisclosureId;
    }

    redirectToDisclosure(): void {
        sessionStorage.setItem('engagementTab', 'RELATED_DISCLOSURES');
        if(this._router.url.includes(ENGAGEMENT_ROUTE_URL)) {
            sessionStorage.setItem('previousUrl', this._router.url);
        }
        const REDIRECT_URL = [TRAVEL_DISCL_REVIEW_STATUS_TYPE.RETURNED, TRAVEL_DISCL_REVIEW_STATUS_TYPE.WITHDRAWN, TRAVEL_DISCL_REVIEW_STATUS_TYPE.PENDING].includes(this.disclosureItem.reviewStatusCode) ? CREATE_TRAVEL_DISCLOSURE_ROUTE_URL : POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL;
        openInNewTab(REDIRECT_URL + '?', ['disclosureId'], [this.disclosureItem.travelDisclosureId]);
        this.commonService.$globalEventNotifier.next({ uniqueId: 'ENGAGEMENT_VIEW_DISCLOSURE' });
    }

}
