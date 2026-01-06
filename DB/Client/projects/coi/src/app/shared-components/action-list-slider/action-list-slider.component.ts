import { Component, OnDestroy, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DATE_PLACEHOLDER , POST_CREATE_DISCLOSURE_ROUTE_URL, POST_CREATE_ENTITY_ROUTE_URL, ENGAGEMENT_ROUTE_URL, HTTP_ERROR_STATUS,
  COMMON_ERROR_TOAST_MSG, DISCLOSURE_TYPE, COI_MODULE_CODE, GLOBAL_ENTITY_MODULE_CODE, OPA_CHILD_ROUTE_URLS, HTTP_SUCCESS_STATUS,
  TRAVEL_DISCLOSURE_FORM_ROUTE_URL, TRAVEL_MODULE_CODE, POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, USER_DASHBOARD_CHILD_ROUTE_URLS, OPA_MODULE_CODE, 
  COI_DISPOSITION_STATUS} from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { scaleOutAnimation, slideInAnimation } from '../../common/utilities/animations';
import { compareDates, isValidDateFormat, getDuration, getTimeInterval, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { openCoiSlider, closeCoiSlider, deepCloneObject, setFocusToElement } from '../../common/utilities/custom-utilities';
import { ActionListSliderService } from './action-list-slider.service';
import { ActionListInbox, FcoiReviseRO } from '../shared-interface';
import { ActionListSliderConfig, DocumentTypes, DocumentActionStorageEvent, FcoiType, InboxObject } from '../../common/services/coi-common.interface';
import { HeaderService } from '../../common/header/header.service';
import { ACTION_LIST_MSG_TYPE_CODE, ACTION_LIST_ICON, DEFAULT_ACTION_ICON, TRAVEL_VIEW_ARR, MODULE_CONSTANTS, FCOI_CREATE_REVISE_ARR } from './action-list-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { EntityDashboardTabs } from '../../entity-dashboard/entity-dashboard.interface';
import { DECLARATION_LOCALIZE } from '../../app-locales';
import { COI_DECLARATION_MODULE_CODE, DECLARATION_ROUTE_URLS } from '../../declarations/declaration-constants';
import { COI_CMP_MODULE_CODE } from '../../conflict-management-plan/shared/management-plan-constants';

class TravelRO {
    personEntityId: any;
    personEntityNumber: any;
    entityId: any;
    entityNumber: any;
    travelerFundingTypeCode = '2';
    travelDisclosureId = null;
}

@Component({
  selector: 'app-action-list-slider',
  templateUrl: './action-list-slider.component.html',
  styleUrls: ['./action-list-slider.component.scss'],
  animations: [
    slideInAnimation('0','12px', 400, 'slideUp'),
    slideInAnimation('0','-12px', 400, 'slideDown'),
    scaleOutAnimation('-2px','0', 200, 'scaleOut'),
  ],
  providers: [ActionListSliderService]
})
export class ActionListSliderComponent implements OnInit, OnDestroy {

  @ViewChild('fromDateInput', { static: false }) fromDateInput?: ElementRef;
  @ViewChild('toDateInput', { static: false }) toDateInput?: ElementRef;

  inboxDetails: any = [];
  $subscriptions: Subscription[] = [];
  modulePath = Object.assign({}, MODULE_CONSTANTS.paths);
  viewInboxSearch = false;
  inboxTab: 'PENDING' | 'PROCESSED' = 'PENDING';
  datePlaceHolder = DATE_PLACEHOLDER;
  setFocusToElement = setFocusToElement;
  moduleList: any = [];
  isInboxInfo = true;
  getTimeInterval = getTimeInterval;
  isLoading = false;
  actionListEntriesForBanner: any = [];
  description: any;
  fromDateValidationMap = false;
  toDateValidationMap = false;
  dateValidationMap: Map<string, string> = new Map();
  showSlider = false;
  MODULE_CODE_FCOI = 22;
  totalCount = 0;
  pageNumber = 1;
  isSearchFilterApplied = false;
  COI_ACTION_LIST_SLIDER_ID = 'coi-action-list-slider';
  sortSectionsList = [
    { variableName: 'alertType', fieldName: 'Priority' }
  ];
  sortMap: any = {};
  sortCountObj: any = {};
  ACTION_LIST_ICON = ACTION_LIST_ICON;
  DEFAULT_ACTION_ICON = DEFAULT_ACTION_ICON;
  ACTION_LIST_MSG_TYPE_CODE = ACTION_LIST_MSG_TYPE_CODE;
  DISCLOSURE_TYPE = DISCLOSURE_TYPE;
  isCreateDisclosure = false;
  viewDisclosure = false;
  isRevise = false;
  disclosureID: number;
  isActionListSortingEnabled = false;
  fcoiReviseRO = new FcoiReviseRO();
  declarationLocalize = DECLARATION_LOCALIZE;
  coiDispositionStatus = COI_DISPOSITION_STATUS;
  actionListSearchDates = {
    fromDate: null,
    toDate: null
  };
  coiCreateReviseBtnArr = FCOI_CREATE_REVISE_ARR;
  
  @Input() actionListSliderConfig = new ActionListSliderConfig();
  @Output() closeSlider = new EventEmitter<any>();

  constructor(private _actionListService: ActionListSliderService,
    private _router: Router,
    public commonService: CommonService,
    public headerService: HeaderService) { }

  ngOnInit() {
    this.isActionListSortingEnabled = this.commonService.isActionListSortingEnabled;
    this.getActiveDisclosure();
    this.clearInboxSearchField();
    this.getInboxTab();
    this.headerService.triggerProjectsTabCount();
    this.fetchPendingActionItemCount();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  private getActiveDisclosure(): void {
    this.$subscriptions.push(this.headerService.getActiveDisclosure().subscribe((res: any) => {
        this.headerService.setActiveDisclosures(res);
        this.setFCOITypeCode(this.headerService.activeDisclosures);
    }, (error: any) => {
      this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }));
  }

  actionsOnPageChange(event): void {
    if (this.pageNumber !== event) {
      this.pageNumber = event;
      this.getActionList();
    }
  }

  changeTab(inboxTab: 'PENDING' | 'PROCESSED'): void {
    this.inboxTab = inboxTab;
    this.pageNumber = 1;
    this.isInboxInfo = true;
    this.getActionList();
  }

  getActionList(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.inboxDetails = [];
      this.actionListSliderConfig.inboxObject.toPersonId = this.commonService.getCurrentUserDetail('personID');
      this.actionListSliderConfig.inboxObject.isViewAll = 'N';
      this.actionListSliderConfig.inboxObject.processed = this.inboxTab === 'PROCESSED';
      this.actionListSliderConfig.inboxObject.fromDate = parseDateWithoutTimestamp(this.actionListSearchDates.fromDate);
      this.actionListSliderConfig.inboxObject.toDate = parseDateWithoutTimestamp(this.actionListSearchDates.toDate);
      this.actionListSliderConfig.inboxObject.currentPage = this.pageNumber;
      this.actionListSliderConfig.inboxObject.itemsPerPage = 20;
      if (!this.isActionListSortingEnabled) {
        this.actionListSliderConfig.inboxObject.orderByFields = {};
      }
      this.$subscriptions.push(this._actionListService.getActionList(this.actionListSliderConfig.inboxObject).subscribe((data: any) => {
        this.inboxDetails = data.inboxDetails;
        this.totalCount = data.totalRecords;
        this.moduleList = data.modules;
        this.isLoading = false;
        this.inboxDetails.forEach(element => {
          Object.keys(this.modulePath).forEach(key => {
            if (key === this.getModulePathKey(element)) {
              element.class = this.modulePath[key].class;
              element.name = this.modulePath[key].name;
            }
          });
        });
        this.viewSlider();
      }, (err: any) => {
        this.isLoading = false;
        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG)
        if (!this.showSlider) {
            this.closeSlider.emit();
        }
    }));
    }
  }

  private getModulePathKey(el) {
    return el.moduleCode !== 1 ? el.moduleCode.toString() : el.moduleCode.toString() + this.getAwardSubmoduleCode(el);
  }

  private getAwardSubmoduleCode(el) {
    return el.subModuleCode ? el.subModuleCode.toString() : '0';
  }

    private handleFCOICreation(fcoiType: FcoiType): void {
        this.headerService.triggerFCOICreation(fcoiType);
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
        this.closeActionListSlider();
        const OPA_TYPE = actionType === 'CREATE_OPA_INITIAL' ? 'INITIAL' : 'REVISION';
        if (OPA_TYPE === 'REVISION') {
          this.setReviseDocumentAction('OPA_DISCLOSURE');
        }
        this.headerService.triggerOPACreation(OPA_TYPE);
        break;
      case 'CREATE_TRAVEL':
        this.fetchPersonEntity(inbox?.moduleItemKey);
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

  private redirectToModules(inbox: ActionListInbox): void {
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

    fetchPersonEntity(entityId) {
        this.$subscriptions.push(this._actionListService.getRelationshipEntityDetails(entityId).subscribe((data: any) => {
            if(data?.personEntity) {
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

    private entityRedirection(inbox: ActionListInbox): void {
        const { ENTITY_VERIFICATION_REQUIRED, INBOX_ENTITY_REFRESH_UNVERIFIED } = ACTION_LIST_MSG_TYPE_CODE;
        if ( [ENTITY_VERIFICATION_REQUIRED.toString(), INBOX_ENTITY_REFRESH_UNVERIFIED.toString()].includes(inbox?.messageTypeCode?.toString())) {
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

  private disclosureRedirection(inbox : ActionListInbox): void {
    if ([ACTION_LIST_MSG_TYPE_CODE.DISCLOSURE_REQUIRED].includes(inbox?.messageTypeCode)) {
      this.redirectURLWithSkipLocation(USER_DASHBOARD_CHILD_ROUTE_URLS.MY_PROJECTS_ROUTE_URL);
      return;
    } else {
      const params = { disclosureId: inbox.moduleItemKey };
      this.redirectURLWithSkipLocation(POST_CREATE_DISCLOSURE_ROUTE_URL, params);
      return;
    }
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

    private redirectURLWithSkipLocation(url: string, params: any = null): void {
        closeCoiSlider(this.COI_ACTION_LIST_SLIDER_ID);
        setTimeout(() => {
            this.showSlider = false;
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this._router.navigate([url], params ? { queryParams: params } : {});
            });
        }, 500);
    }

    private redirectURL(url: string, params: any = null): void {
        closeCoiSlider(this.COI_ACTION_LIST_SLIDER_ID);
        setTimeout(() => {
            this.showSlider = false;
            this._router.navigate([url], params ? { queryParams: params } : {});
        }, 500);
    }

  // this function calculates duration between the current date and expiration date using getduration function
  setDurationForEntries(CURRENT_DATE: any): void {
    this.actionListEntriesForBanner.forEach((element) => {
      element.duration = getDuration(CURRENT_DATE, element.expirationDate);
      element.message.description = this.getValueFromPlaceholder(element);
    });
  }

  getValueFromPlaceholder(element: any): any {
    this.description = element.message.description;
    return element && element.message ?
      this.getDisclosureType(element) : null;
  }

  // this function replace the NO_OF_DAYS placeholder with days count which calculated using the function setDurationForEntries
  getDisclosureType(element: any): any {
    if (element && element.message) {
      this.description = this.description
        .replace('{NO_OF_DAYS}', `${element.duration.durInDays}`);
      return this.description;
    }
  }

  clearInboxSearchField() {
    this.isSearchFilterApplied = false;
    this.pageNumber = 1;
    this.fromDateValidationMap = false;
    this.toDateValidationMap = false;
    this.clearSearchField();
    this.dateValidationMap.clear();
    this.getInboxTab();
    this.actionListSearchDates = { fromDate: null, toDate: null };
  }

  private clearSearchField() {
    this.actionListSliderConfig.inboxObject = new InboxObject();
  }

  getInboxTab() {
    if (!this.fromDateValidationMap && !this.toDateValidationMap && this.widgetDateValidation()) {
      if (this.actionListSearchDates.fromDate || this.actionListSearchDates.toDate) {
        this.isSearchFilterApplied = true;
      }
      this.getActionList();
      this.viewInboxSearch = false;
    }
  }

  // modulecode 8 means coi disclosure,22 -FCOI
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

    private viewSlider(): void {
        if (!this.showSlider) {
            this.showSlider = true;
            setTimeout(() => {
                openCoiSlider(this.COI_ACTION_LIST_SLIDER_ID);
            });
        }
    }

    closeActionListSlider(): void {
        closeCoiSlider(this.COI_ACTION_LIST_SLIDER_ID);
        setTimeout(() => {
            this.showSlider = false;
            this.closeSlider.emit();
        }, 500);
    }

  private widgetDateValidation(): boolean {
    this.dateValidationMap.clear();
    if (this.actionListSearchDates.fromDate) {
      if (compareDates(this.actionListSearchDates.fromDate, this.actionListSearchDates.toDate, 'dateObject', 'dateObject') === 1) {
        this.dateValidationMap.set('endDate', 'Please select an end date that comes after the start date.');
      }
    }
    return this.dateValidationMap.size === 0 ? true : false;
  }

  validateDateFormat() {
    const fromDate: string = this.fromDateInput.nativeElement.value?.trim();
    const toDate: string = this.toDateInput.nativeElement.value?.trim();
    this.dateValidationMap.clear();
    this.fromDateValidationMap = false;
    this.toDateValidationMap = false;
    if (!fromDate && !toDate) {
      return;
    }
    const isFromDateValid = !fromDate || isValidDateFormat({ _i: fromDate });
    const isToDateValid = !toDate || isValidDateFormat({ _i: toDate });
    if (!isFromDateValid && !isToDateValid) {
      this.fromDateValidationMap = true;
      this.toDateValidationMap = true;
      return;
    }
    if (!isFromDateValid) {
      this.fromDateValidationMap = true;
      this.toDateValidationMap = false
      return;
    }
    if (!isToDateValid) {
      this.toDateValidationMap = true;
      this.fromDateValidationMap = false;
      return;
    }
  }

  sortResult(sortFieldBy) {
    this.sortCountObj[sortFieldBy]++;
    if (this.sortCountObj[sortFieldBy] < 3) {
      this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'ASC' : 'DESC';
    } else {
      this.sortCountObj[sortFieldBy] = 0;
      delete this.sortMap[sortFieldBy];
    }
    this.actionListSliderConfig.inboxObject.orderByFields = deepCloneObject(this.sortMap);
    this.getActionList();
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

  canShowFCOIView(inboxData) {
    const { DISCLOSURE_REQUIRED, COI_RENEWAL_REQUIRED, FCOI_ENGAGEMENT_CREATE, FCOI_ENGAGEMENT_REVISE, TRAVEL_ENGAGEMENT_CREATE, OPA_ENGAGEMENT_CREATE, FCOI_FROM_TRAVEL_DISCLOSURE_REQUIRED, FCOI_ENGAGEMENT_WITHDRAW, REVISE_EXPIRED_DECLARATION, OPA_RENEWAL_REQUIRED } = ACTION_LIST_MSG_TYPE_CODE;
    const CODE_FOR_NO_VIEW = ![DISCLOSURE_REQUIRED, COI_RENEWAL_REQUIRED, FCOI_ENGAGEMENT_CREATE, FCOI_ENGAGEMENT_REVISE, TRAVEL_ENGAGEMENT_CREATE, OPA_ENGAGEMENT_CREATE, FCOI_FROM_TRAVEL_DISCLOSURE_REQUIRED, REVISE_EXPIRED_DECLARATION, OPA_RENEWAL_REQUIRED, FCOI_ENGAGEMENT_WITHDRAW].includes(inboxData?.messageTypeCode);
    return  CODE_FOR_NO_VIEW;
  }

  private fetchPendingActionItemCount(): void {
    this.commonService.$globalEventNotifier.next({ uniqueId: 'FETCH_PENDING_ACTION_ITEMS_COUNT' });
  }

  private declarationRedirection(declarationId: string | number): void {
    const PARAMS = { declarationId: declarationId };
    this.redirectURL(DECLARATION_ROUTE_URLS.FORM, PARAMS);
  }

  private redirectToCMP(cmpId: string | number): void {
    closeCoiSlider(this.COI_ACTION_LIST_SLIDER_ID);
    setTimeout(() => {
        this.showSlider = false;
        this.headerService.redirectToCMP(cmpId);
    }, 500);
  }

  private setReviseDocumentAction(targetModule: DocumentTypes): void {
    const DOCUMENT_ACTION: DocumentActionStorageEvent = { action: 'REVISE', triggeredFrom: 'ACTION_LIST', targetModule: targetModule, isModalRequired: false };
    this.headerService.setDocActionStorageEvent(DOCUMENT_ACTION);
    this.commonService.$globalEventNotifier.next({ uniqueId: 'DOC_ACTION_STORAGE_EVENT', content: DOCUMENT_ACTION });
  }
  
}
