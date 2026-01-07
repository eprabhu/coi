// Last updated by Krishnanunni on 29-01-2020
import { Component, OnInit, OnDestroy, } from '@angular/core';
import { PersonMaintenanceService } from './person-maintenance.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { setFocusToElement, concatUnitNumberAndUnitName } from '../../common/utilities/custom-utilities';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { environment } from '../../../environments/environment';
import { getEndPointOptionsForDepartment } from '../../common/services/end-point.config';
import { NavigationService } from '../../common/services/navigation.service';
declare var $: any;

@Component({
  selector: 'app-person-maintenance',
  templateUrl: './person-maintenance.component.html',
  styleUrls: ['./person-maintenance.component.css'],
  animations: [fadeDown],

})
export class PersonMaintenanceComponent implements OnInit, OnDestroy {
  searchResults: any = [];
  elasticSearchOptions: any = {};
  debounceTimer: any;
  person: any = {};
  isAdvanceSearch = false;
  isShowAdvanceSearch = true;
  addPersonEmailWarningMsg: string;
  isPersonEdit = false;
  personId: any;
  showOrHideDataFlagsObj: any = {};
  result: any = {};
  sortMap: any = {};
  sortCountObj: any = {
    'personId': 0, 'firstName': 0, 'lastName': 0, 'middleName': 0, 'principalName': 0,
    'emailAddress': 0, 'mobileNumber': 0, 'homeUnit': 0, 'primaryTitle': 0
  };
  personRequestList: any = [];
  trainingDataList: any = [];
  isAdvanceSearchHomeUnitActive;
  map = new Map();
  homeUnitSearchOptions: any = {};
  clearField;
  isPassword = true;
  personRequestObject = {
    property1: '', property2: '', property3: '', property4: '', property5: '', property6: '', property7: '',
    property8: '', property9: '', property10: '',property11: '', property12: [], pageNumber: 20, sortBy: 'updateTimeStamp', sort: {}, reverse: 'DESC',
    currentPage: 1,
  };
  isMaintainUserRoles = false;
  isApplicationAdministrator = false;
  isMaintainDelegation = false;
  confirmPassword = null;
  isPersonUpdate = false;
  isMaintainWorks = false;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  deployUrl = environment.deployUrl;
  isMaintainPerson = false;
  helpInfo = false;
  statusCodes: any = [
    {code: 'A', description: 'Active'},
    {code: 'I', description: 'Inactive'}
  ];
  lookupValues: any = [];
  statusCodeOptions = 'EMPTY#EMPTY#true#true';
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  previousUrl = '';
  isMaintainTimeSheet = false;
  isMaintainTraining = false;
  havePersonDetails = false;
  isViewTimeSheet = false;

  constructor(public _personService: PersonMaintenanceService,
    private _elasticConfig: ElasticConfigService,
    public _commonService: CommonService,
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private _activatedRoute: ActivatedRoute) {
    }

  ngOnInit() {
    this.previousUrl = this.navigationService.previousURL;
    this.isShowAdvanceSearch = true;
    this._personService.isPersonEditOrView = false;
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    this.homeUnitSearchOptions = getEndPointOptionsForDepartment();
    this.personRequestObject.currentPage = 1;
    this.getPermissions();
    this.resetNavigationPath();
  }

  resetNavigationPath() {
    this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
      if (params.personId) {
        this.havePersonDetails = true;
      } else {
        this.havePersonDetails = true;
        this._personService.isPersonEditOrView = false;
        this.personRequestList = [];
      }
    }));
  }

  ngOnDestroy() {
    this._personService.personDisplayCard = null;
    subscriptionHandler(this.$subscriptions);
  }

  focusToPersonSearch() {
    if (this.isShowAdvanceSearch === true) {
      setTimeout(() => {
        (document.getElementsByClassName('app-elastic-search')[0] as HTMLElement).focus();
      }, 0);
    }
  }

  /** clear all advanced search fields */
  clear() {
    this.personRequestObject.property1 = '';
    this.personRequestObject.property2 = '';
    this.personRequestObject.property3 = '';
    this.personRequestObject.property4 = '';
    this.personRequestObject.property5 = '';
    this.personRequestObject.property6 = '';
    this.personRequestObject.property7 = '';
    this.personRequestObject.property8 = '';
    this.personRequestObject.property9 = '';
    this.personRequestObject.property10 = '';
    this.personRequestObject.property11 = '';
    this.personRequestObject.property12 = [];
    this.lookupValues = [];
    this.clearField = new String('true');
    this.map.clear();
    this.clearElasticAndBack();
  }
  /**selected sort field is assigned to the sort request object.
   * sort field value is  incremented  and condition is check for assigning the sort type into sort  array object,
   *  which allows multiple sorting.
  * @param sortFieldBy
  */
  sortResult(sortFieldBy) {
    this.sortCountObj[sortFieldBy]++;
    this.personRequestObject.sortBy = sortFieldBy;
    if (this.sortCountObj[sortFieldBy] < 3) {
      if (this.personRequestObject.sortBy === sortFieldBy) {
        this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
      }
    } else {
      this.sortCountObj[sortFieldBy] = 0;
      delete this.sortMap[sortFieldBy];
    }
    this.personRequestObject.sort = this.sortMap;
    this.loadPersonList();
  }

  /**
   * Load person list for advance search and sorting
   */
  loadPersonList() {
    this.$subscriptions.push(this._personService.getPersonList(this.personRequestObject)
      .subscribe(data => {
        this.result = data || [];
        if (this.result !== null) {
          if (this.result.persons.length) {
            this.personRequestList = this.result.persons;
            this.isAdvanceSearch = true;
            this.isShowAdvanceSearch = true;
            this.focusToPersonSearch();
          }
          // else if (this.result.persons.length === 1 && !this.isAdvanceSearch) {
          //   this.personRequestList = null;
          //   this.person = this.result.persons[0];
          //   this.isPersonView = true;
          //   this.isShowAdvanceSearch = false;
          //   this.showOrHideDataFlagsObj.isPersonViewData = true;
          //   this.showOrHideDataFlagsObj.isOrganizationViewData = true;
          //   this.showOrHideDataFlagsObj.isOtherViewData = true;
          // }
          else {
            this.personRequestList = null;
            this.isAdvanceSearch = true;
            this.isShowAdvanceSearch = true;
            this.focusToPersonSearch();
          }
        }
      }));
  }

  advanceSearch() {
    this.personRequestObject.currentPage = 1;
    this.loadPersonList();
  }

  backToPersonLIst() {
    this.clear();
    this.elasticSearchOptions = Object.assign({}, this.elasticSearchOptions);
    this.elasticSearchOptions.defaultValue = '';
  }
  async getPermissions() {
    this.isMaintainUserRoles = await this._commonService.checkPermissionAllowed('MAINTAIN_USER_ROLES');
    this.isApplicationAdministrator = await this._commonService.checkPermissionAllowed('APPLICATION_ADMINISTRATOR');
    this.isMaintainWorks = await this._commonService.checkPermissionAllowed('MAINTAIN_ORCID_WORKS');
    this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
    this.isMaintainDelegation = await this._commonService.checkPermissionAllowed('MAINTAIN_DELEGATION');
    this.isMaintainTraining = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
    this.isMaintainTimeSheet = await this._commonService.checkPermissionAllowed('MAINTAIN_KEY_PERSON_TIMESHEET');
    this.isViewTimeSheet = await this._commonService.checkPermissionAllowed('VIEW_KEY_PERSON_TIMESHEET');
  }
  actionsOnPageChange(event) {
    this.personRequestObject.currentPage = event;
    this.loadPersonList();
    this._commonService.pageScroll('pageScrollToTop');
  }
  selectUserElasticResult(result) {
    if (result) {
      this._router.navigate(['/fibi/person/person-details'],
        { queryParams: { 'personId': result.prncpl_id } });
      this._personService.isPersonEdit = false;
    }
  }
  homeUnitChangeFunction(result) {
    if (result) {
        this.personRequestObject.property8 = result.unitNumber;
    } else {
      this.personRequestObject.property8 = '';
    }
  }
  /**
   * Used to clear elastic search field when clicking back button from person view
   */
  clearElasticAndBack() {
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    this.homeUnitSearchOptions = getEndPointOptionsForDepartment();
  }

  setPersonCardDetails(person) {
    this._personService.personDisplayCard = person;
  }

  isLoginUserDetails() {
    const personId = this._activeRoute.snapshot.queryParamMap.get('personId');
    return personId === this._commonService.getCurrentUserDetail('personID');
  }
    /**
   * @param  {} data
   * @param  {} template
   * to get the values of the lookups in advanced search which returns string value
   */
     onLookupSelect(data, template) {
      this.lookupValues[template] = data;
      this.personRequestObject[template] = data.length ? data.map(d => d.code) : [];
    }

  redirectToBack() {
    if (this.isMaintainPerson) {
      this._personService.isPersonEditOrView = false;
      this._router.navigate(['fibi/person']);
    } else {
      this._router.navigateByUrl(this.previousUrl);
    }
  }
}
