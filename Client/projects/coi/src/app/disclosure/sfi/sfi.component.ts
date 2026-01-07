import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject, Subscription, interval } from 'rxjs';
import { SfiService } from './sfi.service';
import {subscriptionHandler} from "../../../../../fibi/src/app/common/utilities/subscription-handler";
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG, PROJECT_TYPE } from '../../app-constants';
import { debounce, switchMap } from 'rxjs/operators';
import { COI } from '../coi-interface';
import { fadeInOutHeight, leftSlideInOut, listAnimation } from '../../common/utilities/animations';
import { jumpToSection, openCoiSlider } from '../../common/utilities/custom-utilities';
import { DISCLOSURE_ENGAGEMENT_MESSAGE_LIST } from '../../no-info-message-constants';
import { EngagementSortType, FetchEachOrAllEngagementsRO } from '../../common/services/coi-common.interface';

@Component({
    selector: 'app-sfi',
    templateUrl: './sfi.component.html',
    styleUrls: ['./sfi.component.scss'],
    animations: [listAnimation, fadeInOutHeight, leftSlideInOut]
})
export class SfiComponent implements OnInit, OnDestroy {

    @ViewChild('viewSFIDetailsOverlay', { static: true }) viewSFIDetailsOverlay: ElementRef;
    @Input() isTriggeredFromSlider = false;
    @Input() reviewStatus = '';
    @Input() isEditMode = false;
    @Input() personId= '';
    @Input() focusSFIId = '';
    @Input() coiData = new COI();
    @Input() dispositionStatusCode: string = null;
    @Input() isShowRiskLevel = false;
    @Input() uniqueId = '';
    @Input() sortType: EngagementSortType = '';
    @Output() sfiActions = new EventEmitter<any>();

    $subscriptions: Subscription[] = [];
    coiFinancialEntityDetails: any[] = [];
    searchText: string;
    searchResult = [];
    disclosureId: any;
    dependencies = ['coiDisclosure', 'numberOfSFI'];
    filterType = 'ALL';
    currentPage = 1;
    count: any;
    showSlider = false;
    scrollHeight: number;
    entityId: any;
    personEntityId: any;
    entityName: any;
    updatedRelationshipStatus: string;
    entityDetails: any;
    relationshipDetails: any;
    relationshipMainTypes: any[] =[];;
    expandInfo = false;
    isEnableActivateInactivateSfiModal: boolean;
    $debounceEvent = new Subject();
    $fetchSFIList = new Subject();
    isSearchTextHover = false;
    isLoading = false;
    personEntityNumber: any;
    sliderElementId = '';
    PROJECT_TYPE = PROJECT_TYPE;
    noDataMessage = '';
    isSignificantFinInterest = false;

    constructor(
        private _sfiService: SfiService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _commonService: CommonService) {
    }

    ngOnInit() {
        this.getSfiDetails();
        this.$fetchSFIList.next();
        this.getSearchList();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getSfiDetails() {
        this.$subscriptions.push(this.$fetchSFIList.pipe(
            switchMap(() => {
                this.getNoDataMessage(this.filterType);
                this.isLoading = true;
                return this._commonService.fetchEachOrAllEngagements(this.getRequestObject())
            })).subscribe((data: any) => {
            if (data) {
                this.count = data.count;
                this.coiFinancialEntityDetails = data.personEntities;
                this.isLoading = false;
                setTimeout(() => {
                    if(this.focusSFIId) {
                        const offset = (document.getElementById('COI-DISCLOSURE-HEADER')?.getBoundingClientRect().height + 100);
                        jumpToSection(this.focusSFIId, offset);
                        const ELEMENT = document.getElementById(this.focusSFIId);
                        ELEMENT?.classList?.add('error-highlight-card');
                        this.focusSFIId = null;
                    }
            });
            }
        }, (_error: any) => {
            if (_error.status === 405) {
                this.sfiActions.emit({concurrentUpdateAction: 'Disclosure'});
            } else {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }
        }));
    }

    getRequestObject() {
        const requestObj = new FetchEachOrAllEngagementsRO();
        requestObj.currentPage = this.currentPage;
        requestObj.disclosureId = !this.isTriggeredFromSlider ? this._activatedRoute.snapshot.queryParamMap.get('disclosureId') : null;
        requestObj.filterType = this.filterType;
        requestObj.pageNumber = 10;
        requestObj.personId = this.personId;
        requestObj.reviewStatusCode = this.reviewStatus;
        requestObj.searchWord = this.searchText;
        requestObj.sortType = this.sortType;
        requestObj.dispositionStatusCode = this.dispositionStatusCode;
        return requestObj;
    }

    viewSlider(event) {
        this.showSlider = event.flag;
        this.entityId = event.entityId;
        this.sliderElementId = `disclosure-sfi-slider-${this.entityId}`;
        openCoiSlider(this.sliderElementId);
    }

    setFilter(filterType) {
        this.filterType = filterType;
        this.currentPage = 1;
        this.searchText = '';
        this.coiFinancialEntityDetails = [];
        this.$fetchSFIList.next();
    }

    removeEntityId() {
        this._router.navigate([], {
          queryParams: {entityId: null},
          queryParamsHandling: 'merge'
        })
      }

    actionsOnPageChange(event) {
        if (this.currentPage != event) {
            this.currentPage = event;
            this.$fetchSFIList.next();
        }
    }

    hideSfiNavBar() {
        setTimeout(() => {
            this.showSlider = false;
            this.entityId = null;
            this.sliderElementId = '';
        }, 500);
    }

    deleteSFIConfirmation(event, i) {
        this.personEntityId = event.eId;
        this.entityName = this.coiFinancialEntityDetails.find(ele => ele.personEntityId === this.personEntityId).coiEntity.entityName;
        document.getElementById('hidden-delete-button').click();
    }

    deleteSFI() {
        this._sfiService.deleteSFI(this.personEntityId).subscribe((data:any) => {
            this.currentPage = 1;
            this.$fetchSFIList.next();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Engagement deleted successfully.');
        }, err=> {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Engagement deletion canceled.');
        })
      }

      activateDeactivateEvent(event) {
        this.entityDetails = event?.coiEntity;
        this.relationshipDetails = event?.validPersonEntityRelTypes;
        this.relationshipMainTypes = event?.perEntDisclTypeSelections;
        this.isEnableActivateInactivateSfiModal = true;
        this.personEntityId = event?.personEntityId;
        this.entityName = event?.coiEntity?.entityName;
        this.isSignificantFinInterest = event?.isSignificantFinInterest;
        this.updatedRelationshipStatus = event?.versionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        this.personEntityNumber = event?.personEntityNumber;
      }

      closeActivateInactivateSfiModal(event) {
          this.isEnableActivateInactivateSfiModal = false;
          if(event) {
            this.$fetchSFIList.next();
        }
      }

      getEntities() {
        this.currentPage = 1;
        this.$debounceEvent.next('');
      }

      getSearchList() {
        this.$subscriptions.push(this.$debounceEvent.pipe(debounce(() => interval(1000))).subscribe((data: any) => {
          this.$fetchSFIList.next();
        }
        ));
      }

      clearSearchText() {
        this.searchText = '';
        this.$fetchSFIList.next();
      }

    private getNoDataMessage(filterType: string): void {
        let message = DISCLOSURE_ENGAGEMENT_MESSAGE_LIST?.[filterType] || '';
        if (filterType === 'ALL') {
            message += this.isTriggeredFromSlider ? '' : DISCLOSURE_ENGAGEMENT_MESSAGE_LIST?.['ADD_NEW_ENGAGEMENT'];
        }
        this.noDataMessage = this.searchText ? DISCLOSURE_ENGAGEMENT_MESSAGE_LIST?.['NO_SEARCH_RESULT'] : message;
    }
}
