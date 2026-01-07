import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForSponsor } from '../../../common/services/end-point.config';
import { fadeDown } from '../../../common/utilities/animations';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { SponsorMaintenanceService } from '../sponsor-maintenance.service';
import {concatUnitNumberAndUnitName} from "../../../common/utilities/custom-utilities"
@Component({
  selector: 'app-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.css'],
  animations: [fadeDown]
})
export class SponsorListComponent implements OnInit, OnDestroy {

  isAdvanceSearch = false;
  isAdvanceSearchUnitActive;
  departmentName = '';
  sponsorDetails: any = {};
  clearField: String;
  sponsorList: any = [];
  sponsor: any = {};
  sponsorRequestObject = {
    property1: '', property2: '', property3: '', property4: '', property5: '', property6: '', property7: '',
    property8: '', property9: '', pageNumber: 20, sortBy: 'updateTimeStamp', sort: {}, reverse: 'DESC',
    currentPage: 1,
  };
  isShowAdvanceSearchOptions = false;
  isShowAdvanceSearch = true;
  result: any = {};
  showAdvanceSearchList = false;
  sortMap: any = {};
  sponsorSearchOptions: any = {};
  sortCountObj = {
    'sponsorType': 0, 'sponsorName': 0, 'sponsorCode': 0, 'acronym': 0,
    'sponsorLocation': 0, 'unitNumber': 0
  };
  isMaintainSponsor = false;
  $subscriptions: Subscription[] = [];
  isSaving = false;
  helpInfo = false;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  constructor(public _commonService: CommonService, private _elasticConfig: ElasticConfigService,
    private _sponsorService: SponsorMaintenanceService, public _router: ActivatedRoute,private router: Router) { }

  ngOnInit() {
    this.isShowAdvanceSearch = true;
    this.sponsorRequestObject.currentPage = 1;
    this.getPermissions();
    this.getSponsorLookUps();
    this.sponsorSearchOptions = getEndPointOptionsForSponsor();
    this.loadSponsor(1);
  
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  async getPermissions() {
    this.isMaintainSponsor = await this._commonService.checkPermissionAllowed('MAINTAIN_SPONSOR');
  }

  getSponsorLookUps() {
    this.$subscriptions.push(this._sponsorService.getNewSponsorData().subscribe((data: any) => {
      this.sponsorDetails = data;
    }));
  }

  focusToSponsorSearch() {
    if (this.isShowAdvanceSearch === true) {
      setTimeout(() => {
        (document.getElementsByClassName('app-endpoint-search')[0] as HTMLElement).focus();
      }, 0);
    }
  }



  sponsorChangeFunction(result, type) {
      return this.router.navigate(['fibi/sponsor-maintenance/sponsor-view'], { queryParams: { sponsorId: result.sponsorCode } });

  }
  
  /** fetch sponsor list */
  loadSponsor(pageNumber = 1) {
    this.sponsorSearchOptions.defaultValue = null;
    this.sponsorRequestObject.currentPage = pageNumber;
    this.$subscriptions.push(this._sponsorService.fetchSponsorData(this.sponsorRequestObject)
      .subscribe(data => {
        this.result = data || [];
        if (this.result.sponsors.length > 1) {
          this.sponsorList = this.result.sponsors;
          this.showAdvanceSearchList = true;
          this.isShowAdvanceSearch = true;
          this.focusToSponsorSearch();
        } else if (this.result.sponsors.length === 1 && !this.showAdvanceSearchList) {
          this.sponsor = this.result.sponsors[0];
          this.showAdvanceSearchList = false;
          this.isShowAdvanceSearch = false;;
        } else {
          this.sponsorList = this.result.sponsors;
          this.showAdvanceSearchList = true;
          this.isShowAdvanceSearch = true;
        }
      }));
  }
  /** show and hide advance search feature
 * @param event
 */
  showAdvanceSearch(event: any) {
    event.preventDefault();
    this.isShowAdvanceSearchOptions = !this.isShowAdvanceSearchOptions;
    this.clear();
  }

  /** clear all advanced search fields */
  clear() {
    this.sponsorRequestObject.property1 = '';
    this.sponsorRequestObject.property2 = '';
    this.sponsorRequestObject.property3 = '';
    this.sponsorRequestObject.property4 = '';
    this.sponsorRequestObject.property5 = '';
    this.sponsorRequestObject.property6 = '';
    this.sponsorRequestObject.property7 = '';
    this.departmentName = '';
  }

  /** sorts results based on fields
 * @param sortFieldBy
 */
  sortResult(sortFieldBy) {
    this.sortCountObj[sortFieldBy]++;
    this.sponsorRequestObject.sortBy = sortFieldBy;
    if (this.sortCountObj[sortFieldBy] < 3) {
      if (this.sponsorRequestObject.sortBy === sortFieldBy) {
        this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
      }
    } else {
      this.sortCountObj[sortFieldBy] = 0;
      delete this.sortMap[sortFieldBy];
    }
    this.sponsorRequestObject.sort = this.sortMap;
    this.loadSponsor(1);
  }

  /**
 * @param  {} contactTypeCode
 * Function for find and return the description of designation based on contactTypeCode
 */
  getDesignationDescription(sponsorTypeCode) {
    let typeDescription: any = {};
    if (this.sponsorDetails.sponsorTypes && sponsorTypeCode) {
      typeDescription = this.sponsorDetails.sponsorTypes.find(code =>
        code.code === (sponsorTypeCode));
      return typeDescription.description;
    }
  }

}
