import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SfiService } from '../../disclosure/sfi/sfi.service';
import { UserEntitiesService } from "./user-entities.service";
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, CREATE_TRAVEL_DISCLOSURE_ROUTE_URL, ENGAGEMENT_SLIDER_ID, } from '../../app-constants';
import { Subject, interval } from 'rxjs';
import { debounce, switchMap } from 'rxjs/operators';
import { listAnimation, fadeInOutHeight, leftSlideInOut } from '../../common/utilities/animations';
import { hideModal, openCoiSlider, closeCoiSlider } from '../../common/utilities/custom-utilities';
import { FetchEachOrAllEngagementsRO, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { PERSON_ENGAGEMENT_MESSAGE_LIST } from '../../no-info-message-constants';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';

@Component({
  selector: 'app-user-entities',
  templateUrl: './user-entities.component.html',
  styleUrls: ['./user-entities.component.scss'],
  animations: [listAnimation, fadeInOutHeight, leftSlideInOut],
  providers: [UserEntitiesService]
})
export class UserEntitiesComponent implements OnInit, OnDestroy {
  sfiDashboardRequestObject = new FetchEachOrAllEngagementsRO();
  $subscriptions = [];
  entityArray = [];
  filteredEntityArray = [];
  searchText = '';
  result: any;
  showSlider = false;
  entityId: any;
  isEnableActivateInactivateSfiModal: boolean;
  entityName: any;
  personEntityId: any;
  personEntityNumber: any;
  updatedRelationshipStatus: String;
  $debounceEventForEntities = new Subject();
  $fetchSFI = new Subject();
  isSearchTextHover = false;
  isLoading = false;
  isHideFilterSearchAndShowCreate = false;
  isConcurrency = false;
  sliderElementId = '';
  relationshipDetails: any = {};
  relationshipMainTypes: any[] =[];;
  entityDetails: any = {};
  isTravelDisclosure = false;
  travelDisclosureId: any;
  travelDisclosureRO: any = {};
  selectedEngagement: any = {};
  selectedEngagementId: number;
  isSignificantFinInterest = false;
  noDataMessage = PERSON_ENGAGEMENT_MESSAGE_LIST;

  constructor(private _userEntityService: UserEntitiesService, private _router: Router,
    private _sfiService: SfiService, private _commonService: CommonService, private elementRef: ElementRef,
  private _activatedRoute: ActivatedRoute, private _informationAndHelpTextService: InformationAndHelpTextService) {
  }

  ngOnInit(): void {
    sessionStorage.removeItem('engagementTab');
    this._commonService.previousUrlBeforeActivate = '';
    this.listenToGlobalNotifier();
    this.isCreateTravelDisclosure();
    this.travelDisclosureId = this._activatedRoute.snapshot.queryParamMap.get('disclosureId');
    this.fetchMyEntities();
    this.sfiDashboardRequestObject.filterType = this.isTravelDisclosure ? 'COMPLETE' : 'ALL';
    this.$fetchSFI.next();
    this.getSearchList();
    window.scrollTo(0,0);
    this._informationAndHelpTextService.moduleConfiguration = this._commonService.getSectionCodeAsKeys(this._activatedRoute.snapshot.data.moduleConfig);
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

 fetchMyEntities() {
    this.sfiDashboardRequestObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.$subscriptions.push(this.$fetchSFI.pipe(
      switchMap(() => {
        this.isLoading = true;
        return this._userEntityService.getSFIDashboard(this.sfiDashboardRequestObject)
      })).subscribe((data: any) => {
      this.result = data;
      if (this.result) {
        this.filteredEntityArray = data.personEntities || [];
        this.loadingComplete();
      }
    }), (err) => {
      this.loadingComplete();
      this.filteredEntityArray = [];
    });
  }

  private listenToGlobalNotifier(): void {
    this.$subscriptions.push(
      this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
        if (event.uniqueId === 'TRAVEL_DISCLOSURE_ENGAGEMENT_ID') {
          this.selectedEngagementId = event?.content?.personEntityId;
        } else if (event.uniqueId === 'ENGAGEMENT_VIEW_DISCLOSURE') {
            sessionStorage.removeItem('engagementTab');
            closeCoiSlider(this.sliderElementId);
            this.hideSfiNavBar();
        }
      })
    );
  }

  private loadingComplete() {
    if (this.sfiDashboardRequestObject.filterType === 'ALL' && !this.searchText && this.sfiDashboardRequestObject.currentPage === 1) {
      this.isHideFilterSearchAndShowCreate = this.filteredEntityArray.length == 0 ? true : false;
    }
    this.isLoading = false;
}

  viewEntityDetails(entities) {

    this._router.navigate(['/coi/entity-details/entity'], { queryParams: { personEntityId: entities.coiFinancialEntityId, personEntityNumber: entities.personEntityNumber } })
  }

  setFilter(type = 'ALL') {
    this.searchText = '';
    this.filteredEntityArray = [];
    this.sfiDashboardRequestObject.filterType = type;
    this.sfiDashboardRequestObject.currentPage = 1;
    this.sfiDashboardRequestObject.searchWord = '';
    this.$fetchSFI.next();
  }

removeEntityId() {
    this._router.navigate([], {
      queryParams: {entityId: null},
      queryParamsHandling: 'merge'
    })
  }

  getRelationshipTypes(relationshipTypes) {
    if(relationshipTypes) {
      return relationshipTypes.split(',').map((type: any) => {
        const lowercase = type.toLowerCase();
        return ' ' + lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
      }).join(',');
    }
  }

  actionsOnPageChangeEvent(event) {
    if (this.sfiDashboardRequestObject.currentPage != event) {
      this.sfiDashboardRequestObject.currentPage = event;
      this.$fetchSFI.next();
    }
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

  deleteSFIConfirmation(event) {
    this.personEntityId = event.eId;
    this.entityName = this.filteredEntityArray.find(ele => ele.personEntityId === this.personEntityId).coiEntity.entityName;
    document.getElementById('hidden-delete-button').click();
  }

  viewSlider(event) {
    this.showSlider = event.flag;
    this.entityId = event.entityId;
    this.sliderElementId = ENGAGEMENT_SLIDER_ID + this.entityId;
    openCoiSlider(this.sliderElementId);
  }

  getEntities() {
    this.sfiDashboardRequestObject.currentPage = 1;
    this.$debounceEventForEntities.next('');
  }

  getSearchList() {
    this.$subscriptions.push(this.$debounceEventForEntities.pipe(debounce(() => interval(800))).subscribe((data: any) => {
      this.sfiDashboardRequestObject.searchWord = this.searchText;
      this.$fetchSFI.next();
    }
    ));
  }

  hideSfiNavBar() {
    setTimeout(() => {
        if(this.showSlider) {
            this.$fetchSFI.next();
        }
        this.showSlider = false;
        this.entityId = null;
        this.sliderElementId = '';
    },500);
}

closeActivateInactivateSfiModal(event) {
  this.isEnableActivateInactivateSfiModal = false;
  if(event) {
    this.$fetchSFI.next();
  }
}

deleteSFI() {
  this.$subscriptions.push(this._sfiService.deleteSFI(this.personEntityId).subscribe((data:any) => {
      this.sfiDashboardRequestObject.currentPage = 1;
      this.$fetchSFI.next();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Engagements deleted successfully.');
  }, err=> {
    if (err.status === 405) {
      hideModal('deleteSFIConfirmationModal');
      this.isConcurrency = true;
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Engagements deletion canceled.');
    }
  }));
}

clearSearchText() {
  this.searchText = '';
  this.sfiDashboardRequestObject.searchWord = '';
  this.$fetchSFI.next();
}


addSFI(type) {
  this._router.navigate(['/coi/create-sfi/create'], { queryParams: { type: 'SFI' } });
}

  isCreateTravelDisclosure() {
    this.isTravelDisclosure = [CREATE_TRAVEL_DISCLOSURE_ROUTE_URL].some(item => this._router.url.includes(item));
  }

  selectTravelEngagement(SFIObject) {
    this.selectedEngagement = SFIObject;
    this.confirmTravelEngagement();
    // Commenting out the code that triggers the confirmation modal, as it is not required based on the current requirements. Retaining the code for potential future use in case a confirmation is needed before selecting an engagement.
    // document.getElementById('travel-create-confirmation-modal').click();
  }

  confirmTravelEngagement() {
    this.travelDisclosureRO.personEntityId = this.selectedEngagement.personEntityId;
    this.travelDisclosureRO.personEntityNumber = this.selectedEngagement.personEntityNumber;
    this.travelDisclosureRO.entityId = this.selectedEngagement.entityId;
    this.travelDisclosureRO.entityNumber = this.selectedEngagement.entityNumber;
    this.travelDisclosureRO.travelerFundingTypeCode = '2'; // EXTERNAL
    this.travelDisclosureRO.travelDisclosureId = parseInt(this.travelDisclosureId) || null;
    this._commonService.$globalEventNotifier.next(
      {
        uniqueId: 'SELECT_ENGAGEMENT_TRAVEL_DISCLOSURE',
        content: this.travelDisclosureRO
      });
  }

}
