import { Component, OnDestroy, OnInit } from '@angular/core';
import { getTimeInterval } from '../../../common/utilities/date-utilities';
import { CommonService } from '../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { COI_MODULE_CODE, CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, DISCLOSURE_TYPE, ENGAGEMENT_ROUTE_URL, GLOBAL_ENTITY_MODULE_CODE, HTTP_SUCCESS_STATUS,
	USER_DASHBOARD_CHILD_ROUTE_URLS, OPA_CHILD_ROUTE_URLS, POST_CREATE_DISCLOSURE_ROUTE_URL, POST_CREATE_ENTITY_ROUTE_URL, POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL,
	TRAVEL_DISCLOSURE_FORM_ROUTE_URL, TRAVEL_MODULE_CODE, OPA_MODULE_CODE, 
	COI_DISPOSITION_STATUS} from '../../../app-constants';
import { ActionListInbox, FcoiReviseRO } from '../../../shared-components/shared-interface';
import { Router } from '@angular/router';
import { ActionListSliderConfig, DocumentTypes, DocumentActionStorageEvent, FcoiType, GlobalEventNotifier, InboxObject } from '../../../common/services/coi-common.interface';
import { HeaderService } from '../../../common/header/header.service';
import { ACTION_LIST_ICON, DEFAULT_ACTION_ICON, ACTION_LIST_MSG_TYPE_CODE, MODULE_CONSTANTS, ACTION_BANNER_TYPE_CODE, TRAVEL_VIEW_ARR, FCOI_CREATE_REVISE_ARR } from '../../../shared-components/action-list-slider/action-list-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { UserHomeService } from '../services/user-home.service';
import { ActionListSliderService } from '../../../shared-components/action-list-slider/action-list-slider.service';
import { TravelRO } from '../user-home.interface';
import { EntityDashboardTabs } from '../../../entity-dashboard/entity-dashboard.interface';
import { DECLARATION_LOCALIZE } from '../../../app-locales';
import { COI_DECLARATION_MODULE_CODE, DECLARATION_ROUTE_URLS } from '../../../declarations/declaration-constants';
import { COI_CMP_MODULE_CODE } from '../../../conflict-management-plan/shared/management-plan-constants';

@Component({
	selector: 'app-notification-action-list',
	templateUrl: './notification-action-list.component.html',
	styleUrls: ['./notification-action-list.component.scss']
})
export class NotificationActionListComponent implements OnInit, OnDestroy {

	inboxObject = new InboxObject();
	$subscriptions: Subscription[] = [];
	inboxDetails: any = [];
	modulePath = Object.assign({}, MODULE_CONSTANTS.paths);
	moduleList: any = [];
	ACTION_LIST_ICON = ACTION_LIST_ICON;
	DEFAULT_ACTION_ICON = DEFAULT_ACTION_ICON;
	ACTION_LIST_MSG_TYPE_CODE = ACTION_LIST_MSG_TYPE_CODE;

	//TODO code will be changed
	MODULE_CODE_FCOI = 22;
	canShowLoader = true;
	actionListSliderConfig = new ActionListSliderConfig();
	getTimeInterval = getTimeInterval;
	isCreateDisclosure = false;
	viewDisclosure = false;
	isRevise = false;
	DISCLOSURE_TYPE = DISCLOSURE_TYPE;
	actionListCount: number;
	TravelRO = new TravelRO();
	disclosureID: number;
	fcoiReviseRO = new FcoiReviseRO();
	declarationLocalize = DECLARATION_LOCALIZE;
	coiDispositionStatus = COI_DISPOSITION_STATUS;
    coiCreateReviseBtnArr = FCOI_CREATE_REVISE_ARR;
	
	constructor(public commonService: CommonService,
				private _actionListService: ActionListSliderService,
				private _router: Router,
				private _userHomeService: UserHomeService,
				public headerService: HeaderService
	) { }

	ngOnInit(): void {
		this.getActionList(false);
		this.setFCOITypeCode(this.headerService.activeDisclosures);
	}

	ngOnDestroy(): void {
		subscriptionHandler(this.$subscriptions);
	}

	getActionList(type) {
		this.actionListSliderConfig.inboxObject.toPersonId = this.commonService.getCurrentUserDetail('personID');
		this.actionListSliderConfig.inboxObject.processed = type;
		this.actionListSliderConfig.inboxObject.itemsPerPage = this._userHomeService?.landingConfig?.actionListConfig?.maxCount;
		this.actionListSliderConfig.inboxObject.currentPage = 1;
		this.$subscriptions.push(this._actionListService.getActionList(this.actionListSliderConfig.inboxObject).subscribe((data: any) => {
			this.inboxDetails = data.inboxDetails.filter(item => item.alertType === ACTION_BANNER_TYPE_CODE);
			this.moduleList = data.modules;
			this.actionListCount = data.totalRecords;
			this.inboxDetails.forEach(element => {
				Object.keys(this.modulePath).forEach(key => {
					if (key === this.getModulePathKey(element)) {
						element.class = this.modulePath[key]?.class;
						element.name = this.modulePath[key]?.name;
					}
				});
			});
			this.canShowLoader = false;
		}, err => {
			this.canShowLoader = false;
		}));
	}

	getModulePathKey(el): string {
		return el.moduleCode !== 1 ? el.moduleCode.toString() : el.moduleCode.toString() + this.getAwardSubmoduleCode(el);
	}

	getAwardSubmoduleCode(el): string {
		return el.subModuleCode ? el.subModuleCode.toString() : '0';
	}

    goToActionPath(inbox: ActionListInbox, actionType: string) {
        switch (actionType) {
            case 'CREATE':
				this.handleFCOICreation('INITIAL');
                break;
            case 'REVISE':
				if (this.isRevise) {
					this.handleFCOICreation('REVISION');
				} else {
					this.setReviseDocumentAction('FCOI_DISCLOSURE');
					this.disclosureRedirection(inbox);
				}
				break;
			case 'CREATE_OPA_INITIAL':
			case 'CREATE_OPA_REVISION':
				const OPA_TYPE = actionType === 'CREATE_OPA_INITIAL' ? 'INITIAL' : 'REVISION';
				if (OPA_TYPE === 'REVISION') {
					this.setReviseDocumentAction('OPA_DISCLOSURE');
				}
				this.headerService.triggerOPACreation(OPA_TYPE);
				break;
            case 'CREATE_TRAVEL':
				this.fetchPersonEntity(inbox.moduleItemKey);
				break;
			case 'DECLARATION_REVISE':
				this.setReviseDocumentAction('DECLARATION');
				const DECLARATION_TYPE_CONFIG = this.commonService.getDeclarationTypeDetails(inbox?.subModuleCode) || null;
				this.headerService.triggerDeclarationCreation('REVISION', DECLARATION_TYPE_CONFIG);
				break;
			default:
				this.redirectToModules(inbox);
				break;
        }
    }

	private handleFCOICreation(fcoiType: FcoiType): void {
		this.headerService.triggerFCOICreation(fcoiType);
	}

    private redirectToModules(inbox: any): void {
        switch (inbox?.moduleCode?.toString()) {
            case COI_MODULE_CODE.toString():
                this.disclosureRedirection(inbox);
                break;
            case GLOBAL_ENTITY_MODULE_CODE.toString():
                this.entityRedirection(inbox);
                break;
            case TRAVEL_MODULE_CODE.toString():
                this.travelRedirection(inbox);
                break;
            case OPA_MODULE_CODE.toString():
                this.opaRedirection(inbox?.moduleItemKey, inbox?.messageTypeCode);
                break;
            case COI_DECLARATION_MODULE_CODE.toString():
                this.declarationRedirection(inbox?.moduleItemKey);
                break;
            case COI_CMP_MODULE_CODE.toString():
                this.redirectToCMP(inbox?.moduleItemKey);
                break;
            default:
                break;
        }
    }

    createTravel(): void {
        this.getCreateTravelRequestObject();
        this._router.navigate([CREATE_TRAVEL_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: null } }); // Redirect to travel engagements page
    }

    private getCreateTravelRequestObject(): void {
        sessionStorage.setItem('travelCreateModalDetails', JSON.stringify(
            {
                homeUnit: this.commonService.currentUserDetails.unitNumber,
                description: 'Travel Disclosure Created',
                personId: this.commonService.getCurrentUserDetail('personID'),
                homeUnitName: this.commonService.currentUserDetails.userName
            }
        ));
    }

	private entityRedirection(inbox: ActionListInbox): void {
		const { ENTITY_VERIFICATION_REQUIRED, INBOX_ENTITY_REFRESH_UNVERIFIED } = ACTION_LIST_MSG_TYPE_CODE;
		if ([ENTITY_VERIFICATION_REQUIRED.toString(), INBOX_ENTITY_REFRESH_UNVERIFIED.toString()].includes(inbox?.messageTypeCode?.toString())) {
			if (INBOX_ENTITY_REFRESH_UNVERIFIED.toString() === inbox?.messageTypeCode?.toString()) {
				const TAB_NAME: EntityDashboardTabs = 'DUNS_REFRESH_ENTITIES';
				sessionStorage.setItem('currentEntityDashboardTab', TAB_NAME);
				sessionStorage.setItem('isShowComparisonBtn', 'true');
			}
			const PARAMS = { entityManageId: inbox?.moduleItemKey };
			this.redirectURL(POST_CREATE_ENTITY_ROUTE_URL, PARAMS);
			return;
		} else {
			const PARAMS = { personEntityId: inbox?.moduleItemKey, personEntityNumber: inbox?.subModuleItemKey };
			this.redirectURLWithSkipLocation(ENGAGEMENT_ROUTE_URL, PARAMS);
			return;
		}
	}

	private disclosureRedirection(inbox: ActionListInbox): void {
		if ([ACTION_LIST_MSG_TYPE_CODE.DISCLOSURE_REQUIRED].includes(inbox?.messageTypeCode)) {
			this.redirectURLWithSkipLocation(USER_DASHBOARD_CHILD_ROUTE_URLS.MY_PROJECTS_ROUTE_URL);
		} else {
			const params = { disclosureId: inbox.moduleItemKey };
			this.redirectURLWithSkipLocation(POST_CREATE_DISCLOSURE_ROUTE_URL, params);
		}
	}

	private redirectURLWithSkipLocation(url: string, params: any = null): void {
		this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
			this._router.navigate([url], params ? { queryParams: params } : {});
		});
	}

	private redirectURL(url: string, params: any = null): void {
		this._router.navigate([url], params ? { queryParams: params } : {});
	}

	redirectToActionListSlider() {
		this.actionListSliderConfig.inboxObject.toPersonId = this.commonService.getCurrentUserDetail('personID');
		this.actionListSliderConfig.inboxObject.processed = false;
		this.actionListSliderConfig.inboxObject.itemsPerPage = 3;
		this.actionListSliderConfig.inboxObject.currentPage = 1;
		this.actionListSliderConfig.inboxObject.orderByFields = { alertType: 'DESC' };
		this.commonService.openActionListSlider(this.actionListSliderConfig.inboxObject);
	}

	getModuleCodeClass(moduleCode: number): string {
		switch (moduleCode) {
			case GLOBAL_ENTITY_MODULE_CODE:
				return 'text-primary';
			case COI_MODULE_CODE:
				return 'text-danger';
			case this.MODULE_CODE_FCOI:
				return 'text-warning';
			default:
				return 'text-primary';
		}
	}

	private setFCOITypeCode(coiDisclosures: any): void {
		this.isCreateDisclosure = false;
		this.viewDisclosure = false;
		this.isRevise = false;
		if (coiDisclosures.length !== 0) {
			if (
				coiDisclosures.length === 1 &&
				['ACTIVE', 'ARCHIVE'].includes(coiDisclosures[0].versionStatus) &&
				[this.coiDispositionStatus?.APPROVED, this.coiDispositionStatus?.EXPIRED].includes(coiDisclosures[0].dispositionStatusCode)
			) {
				this.isRevise = true;
			} else {
				this.disclosureID = coiDisclosures.length > 1 ? coiDisclosures[1]?.disclosureId : coiDisclosures[0]?.disclosureId;
				this.viewDisclosure = true;
			}
		} else {
			this.isCreateDisclosure = true;
		}
	}

	canShowFCOIView(inboxData: any) {
		const { DISCLOSURE_REQUIRED, COI_RENEWAL_REQUIRED, FCOI_ENGAGEMENT_CREATE, FCOI_ENGAGEMENT_REVISE, TRAVEL_ENGAGEMENT_CREATE, OPA_ENGAGEMENT_CREATE, FCOI_FROM_TRAVEL_DISCLOSURE_REQUIRED, FCOI_ENGAGEMENT_WITHDRAW, REVISE_EXPIRED_DECLARATION, OPA_RENEWAL_REQUIRED } = ACTION_LIST_MSG_TYPE_CODE;
		const CODE_FOR_NO_VIEW = ![DISCLOSURE_REQUIRED, COI_RENEWAL_REQUIRED, FCOI_ENGAGEMENT_CREATE, FCOI_ENGAGEMENT_REVISE, TRAVEL_ENGAGEMENT_CREATE, OPA_ENGAGEMENT_CREATE, FCOI_FROM_TRAVEL_DISCLOSURE_REQUIRED, REVISE_EXPIRED_DECLARATION, OPA_RENEWAL_REQUIRED, FCOI_ENGAGEMENT_WITHDRAW].includes(inboxData?.messageTypeCode);
		return  CODE_FOR_NO_VIEW;
	}

	fetchPersonEntity(entityId) {
		this.$subscriptions.push(this._actionListService.getRelationshipEntityDetails(entityId).subscribe((data: any) => {
			if (data?.personEntity) {
				let travelDisclosureRO = new TravelRO();
				travelDisclosureRO.personEntityId = data?.personEntity?.personEntityId;
				travelDisclosureRO.personEntityNumber = data?.personEntity?.personEntityNumber;
				travelDisclosureRO.entityId = data?.personEntity?.entityId;
				travelDisclosureRO.entityNumber = data?.personEntity?.entityId;
				travelDisclosureRO.travelerFundingTypeCode = '2';
				travelDisclosureRO.travelDisclosureId = null;
				this.createTravelAPI(travelDisclosureRO);
			}
		}));
	}

	createTravelAPI(travelDisclosureRO) {
		this.$subscriptions.push(this._actionListService.createTravelDisclosure(travelDisclosureRO).subscribe((data: any) => {
			if (data) {
				this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Travel Disclosure Saved Successfully.');
				this._router.navigate([TRAVEL_DISCLOSURE_FORM_ROUTE_URL],
					{ queryParams: { disclosureId: data.travelDisclosureId } });
			}
		}));
	}

    private travelRedirection(inbox: ActionListInbox): void {
        if (TRAVEL_VIEW_ARR.includes(inbox.messageTypeCode)) {
            const PARAMS = { disclosureId: inbox?.moduleItemKey };
            this.redirectURLWithSkipLocation(POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, PARAMS);
        }
    }

    private opaRedirection(opaDisclosureId: string | number, messageTypeCode: string | number): void {
        const PARAMS = { disclosureId: opaDisclosureId };
        if (messageTypeCode?.toString() === ACTION_LIST_MSG_TYPE_CODE.OPA_DISCLOSURE_WAITING_FOR_APPROVAL.toString()) {
            this.redirectURL(OPA_CHILD_ROUTE_URLS.ROUTE_LOG, PARAMS);
            return;
        }
        this.redirectURL(OPA_CHILD_ROUTE_URLS.FORM, PARAMS);
    }

	
	private declarationRedirection(declarationId: string | number): void {
		const PARAMS = { declarationId: declarationId };
		this.redirectURL(DECLARATION_ROUTE_URLS.FORM, PARAMS);
	}

	private redirectToCMP(cmpId: string | number): void {
		this.headerService.redirectToCMP(cmpId);
	}

	private setReviseDocumentAction(type: DocumentTypes): void {
		const DOCUMENT_ACTION: DocumentActionStorageEvent = { action: 'REVISE', triggeredFrom: 'ACTION_LIST', targetModule: type, isModalRequired: false };
		this.headerService.setDocActionStorageEvent(DOCUMENT_ACTION);
		this.commonService.$globalEventNotifier.next({ uniqueId: 'DOC_ACTION_STORAGE_EVENT', content: DOCUMENT_ACTION });
	}

}
