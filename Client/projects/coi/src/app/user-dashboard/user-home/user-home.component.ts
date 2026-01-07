import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../common/header/header.service';
import { DISCLOSURE_TYPE, CAROUSEL_INTERVAL, ENGAGEMENT_CREATE_URL, PROJECT_TYPE, COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, CONSULTING_REDIRECT_URL,
	CREATE_DISCLOSURE_ROUTE_URL, POST_CREATE_DISCLOSURE_ROUTE_URL, OPA_CHILD_ROUTE_URLS, 
	DISCLOSURE_CONFLICT_STATUS_BADGE,
	COI_REVIEW_STATUS_BADGE,
	OPA_REVIEW_STATUS_BADGE} from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { CoiDisclosure } from '../../disclosure/coi-interface';
import * as bootstrap from 'bootstrap';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FcoiType, OPADisclosureDetails } from '../../common/services/coi-common.interface';
import { deepCloneObject } from '../../common/utilities/custom-utilities';
import { UserHomeService } from './services/user-home.service';
import { CoiImageConfig, CoiQuickLink, LandingConfig } from './user-home.interface';
import { FcoiReviseRO } from '../../shared-components/shared-interface';
import { ActiveDisclosure } from '../user-disclosure/user-disclosure-interface';
import { COMMON_DISCL_LOCALIZE } from '../../app-locales';
import { UserDeclaration } from '../../declarations/declaration.interface';

@Component({
	selector: 'app-user-home',
	templateUrl: './user-home.component.html',
	styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {

	warning = "warning";
	notificationText = '';
	isShowNotification = false;

	hasPendingFCOI = false;
	hasFCOIDisclosure = false;
	cardOPADisclosure: OPADisclosureDetails = null;
	hasSubmittedDisclosure = false;
	deployMap = environment.deployUrl;
	DISCLOSURE_TYPE = DISCLOSURE_TYPE;
	$subscriptions: Subscription[] = [];
	fcoiDisclosureCard: CoiDisclosure = null;
	CAROUSEL_INTERVAL = CAROUSEL_INTERVAL;
	pendingInitialRevisionDisclosure: CoiDisclosure = null;
	quickLinks: CoiQuickLink[] = [];
	imageUrlConfig: CoiImageConfig[] = [];
	hasActiveFCOI = false;
	OPA_CHILD_ROUTE_URLS = OPA_CHILD_ROUTE_URLS;
	fcoiReviseRO = new FcoiReviseRO();
	activeDisclosureDetails: ActiveDisclosure;
	COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
	disclosureConflictStatusBadge = DISCLOSURE_CONFLICT_STATUS_BADGE;
	coiReviewStatusBadge = COI_REVIEW_STATUS_BADGE;
	opaReviewStatusBadge = OPA_REVIEW_STATUS_BADGE;

	constructor(
		public userHomeService: UserHomeService,
		public headerService: HeaderService,
		public commonService: CommonService,
		private _router: Router
	) { }

	async ngOnInit(): Promise<void> {
		const CAROUSEL = new bootstrap.Carousel('#coi-carousel-user-home'); // do not remove needed for bootstrap carousel slider
		this.setFCOITypeCode(this.headerService.activeDisclosures);
		this.setOPADisclosure(this.headerService.activeOPAs);
		this.initializeQuickLinks();
	}

	private async initializeQuickLinks(): Promise<void> {
		const CAN_REVISE_DISCLOSURE = this.checkDisclosureRevision(this.headerService.activeDisclosures);
		const LANDING_CONFIG: LandingConfig = deepCloneObject(this.userHomeService?.landingConfig);
		this.imageUrlConfig = LANDING_CONFIG?.imageUrlConfig.filter((imgConfig: CoiImageConfig) => imgConfig?.isActive);
		await this.headerService.getAvailableDeclarations();
		this.quickLinks = LANDING_CONFIG?.quickLinksConfig?.filter((linkConfig: CoiQuickLink) => {
			if (linkConfig?.isActive) {
				if (linkConfig?.actionType === 'REVISE_DISCLOSURE') {
					linkConfig.isActive = CAN_REVISE_DISCLOSURE;
				} else if (linkConfig?.actionType === 'VIEW_REVISED_DISCLOSURE') {
					linkConfig.isActive = !CAN_REVISE_DISCLOSURE && this.pendingInitialRevisionDisclosure?.fcoiTypeCode === DISCLOSURE_TYPE.REVISION;
				} else if (linkConfig.additionalInfo?.declarationTypeCode) {
					const DECLARATION_ACTION_TYPE = this.headerService.getCreateOrReviseDeclaration(linkConfig?.additionalInfo?.declarationTypeCode);
					const IS_ELIGIBLE = this.commonService.declarationEligibilityMap?.[linkConfig?.additionalInfo?.declarationTypeCode];
					linkConfig.isActive = DECLARATION_ACTION_TYPE === linkConfig.actionType && IS_ELIGIBLE;
				}
			}
			return linkConfig?.isActive;
		});
		this.fetchNotificationInfo(LANDING_CONFIG);
	}

	private checkDisclosureRevision(coiDisclosures): boolean {
		if (coiDisclosures.length !== 0) {
			return (
				coiDisclosures.length === 1 &&
				(coiDisclosures[0].versionStatus === 'ACTIVE' || coiDisclosures[0].versionStatus === 'ARCHIVE') &&
				coiDisclosures[0].dispositionStatusCode === '3'
			  );
		} else {
			return false;
		}
	}

	private fetchNotificationInfo(landingConfig: LandingConfig): void {
		this.notificationText = landingConfig?.notificationBannerText;
		this.isShowNotification = this.notificationText ? true : false;
	}

	private setOPADisclosure(opaDisclosures: any): void {
		this.cardOPADisclosure = opaDisclosures?.find((disclosure: any) => disclosure.dispositionStatusCode == 3 || disclosure.dispositionStatusCode == 1);
	}

	private setFCOITypeCode(coiDisclosures: any): void {
		this.hasPendingFCOI = false;
		this.hasFCOIDisclosure = false;
		this.hasSubmittedDisclosure = false;
		this.pendingInitialRevisionDisclosure = null;
		let ACTIVE_DISCLOSURE = null;
		coiDisclosures?.forEach((disclosure: any) => {
			// checking whether any initial or revision disclosure.
			if ([DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode)) {
				this.hasFCOIDisclosure = true;
				// checking whether the disclosure version is pending. (note: only one disclosure will be in pending state.)
				if (disclosure?.versionStatus == 'PENDING') {
					this.hasPendingFCOI = true;
					this.pendingInitialRevisionDisclosure = disclosure;
				} else {
					ACTIVE_DISCLOSURE = disclosure;
				}
			}
			if (([DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode)) && disclosure?.versionStatus !== 'PENDING') {
				this.activeDisclosureDetails = disclosure;
				this.hasActiveFCOI = true;
			}
		});
		this.fcoiDisclosureCard = ACTIVE_DISCLOSURE ? ACTIVE_DISCLOSURE : this.pendingInitialRevisionDisclosure;
	}

	navigateQuickLinks(link: CoiQuickLink): any {
		switch (link?.actionType) {
			case 'CREATE_ENGAGEMENTS':
				return this._router.navigate([ENGAGEMENT_CREATE_URL], { queryParams: { type: 'SFI' } });
			case 'REVISE_DISCLOSURE':
				return this.openFCOIModal('REVISION');
			case 'VIEW_REVISED_DISCLOSURE':
				return this.redirectToFCOIDisclosure(this.pendingInitialRevisionDisclosure);
			case 'CREATE_AWARD_DISCLOSURE':
				return this.commonService.openProjDisclCreateModal(PROJECT_TYPE.AWARD);
			case 'CREATE_OPA_DISCLOSURE':
				return this.createOPA();
			case 'CREATE_CONSULTING_DISCLOSURE':
				return this.createConsultingDisclosure();
			case 'CREATE_TRAVEL_DISCLOSURE':
				return this.headerService.$openModal.next('CREATE_TRAVEL_DISCLOSURE');
			case 'CREATE_DECLARATION':
				const DECLARATION_TYPE_CREATE = this.commonService.getDeclarationTypeDetails(link?.additionalInfo?.declarationTypeCode);
				return this.headerService.triggerDeclarationCreation('MASTER', DECLARATION_TYPE_CREATE);
			case 'REVISE_DECLARATION':
				const DECLARATION_TYPE_REVISE = this.commonService.getDeclarationTypeDetails(link?.additionalInfo?.declarationTypeCode);
				return this.headerService.triggerDeclarationCreation('REVISION', DECLARATION_TYPE_REVISE);
			case 'VIEW_DECLARATION':
				const DECLARATION_TYPE_VIEW = this.commonService.getDeclarationTypeDetails(link?.additionalInfo?.declarationTypeCode);
				return this.headerService.triggerDeclarationCreation('MASTER', DECLARATION_TYPE_VIEW);
			default:
				if (link?.navigateToUrl?.trim()) {
					this.userHomeService.openRedirectionPath(link?.navigateToUrl, link?.navigateToUrlType);
				};
				return;
		}
	}

	createOPA(): void {
		this.headerService.triggerOPACreation('INITIAL');
	}

	reviseOPA(): void {
		this.headerService.triggerOPACreation('REVISION');
    }

	createConsultingDisclosure(): void {
		this.$subscriptions.push(this.headerService.createConsultingForm(this.commonService.getCurrentUserDetail('personID'),
			this.commonService.getCurrentUserDetail('unitNumber'))
			.subscribe((res: any) => {
				if (res) {
					this._router.navigate([CONSULTING_REDIRECT_URL], { queryParams: { disclosureId: res.disclosureId } });
				} else {
					this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
				}
			}, err => this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG)
			));
	}

	redirectToFCOIDisclosure(disclosures: any): void {
		if (disclosures?.disclosureId) {
			sessionStorage.setItem('previousUrl', this._router.url);
			const IS_DISCLOSURE_EDITABLE = ['1', '5', '6'].includes(disclosures?.reviewStatusCode);
			const REDIRECT_URL = IS_DISCLOSURE_EDITABLE ? CREATE_DISCLOSURE_ROUTE_URL : POST_CREATE_DISCLOSURE_ROUTE_URL;
			this._router.navigate([REDIRECT_URL], { queryParams: { disclosureId: disclosures?.disclosureId } });
		}
	}

	openFCOIModal(type: FcoiType): void {
		this.headerService.$openModal.next(type);
	}

	handleFCOICreation(fcoiType: FcoiType): void {
		this.headerService.triggerFCOICreation(fcoiType);
	}

	openImageRedirectionPath(imgConfig: CoiImageConfig): void {
		if (imgConfig?.navigateToUrl?.trim()) {
			this.userHomeService.openRedirectionPath(imgConfig?.navigateToUrl, imgConfig?.navigateToUrlType);
		}
	}

	fcoiReviseButtonAction(): void {
        this.hasPendingFCOI ? this.redirectToFCOIDisclosure(this.pendingInitialRevisionDisclosure) : this.handleFCOICreation('REVISION');
    }

}
