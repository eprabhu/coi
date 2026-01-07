import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { setCompleterOptions, SponsorMaintenanceService } from '../sponsor-maintenance.service';
import { Subscription } from 'rxjs';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { deepCloneObject, isValidEmailAddress, phoneNumberValidation } from '../../../common/utilities/custom-utilities';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { SponsorAuditLog } from '../interface';

@Component({
  selector: 'app-sponsor-detail',
  templateUrl: './sponsor-detail.component.html',
  styleUrls: ['./sponsor-detail.component.css'],
  providers: [AuditLogService,
		{ provide: 'moduleName', useValue: 'SPONSOR' }]
})
export class SponsorDetailComponent implements OnInit, OnDestroy {

  sponsorDetails: any = {};
  map = new Map();
  isSaving = false;
  toast_message: string;
  $subscriptions: Subscription[] = [];
  departmentSearchOptions: any = {};
  clearField: String;
  countryClearField = new String('false');
  countrySearchOptions: any = {};
  sponsorId: any = null;
  countries: any = [];
  before: SponsorAuditLog;
  countryName: string;
  
  constructor(public _commonService: CommonService, private _sponsorService: SponsorMaintenanceService,
    private _activatedRoute: ActivatedRoute, private router: Router, private _auditLogService: AuditLogService) { }

  ngOnInit() {
   this.departmentSearchOptions = getEndPointOptionsForDepartment();
   this.getCountry();
   this.getSponsorLookUps();
   this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
      this.sponsorId = params['sponsorId'];
    }));
    if (this.sponsorId) {
      this.getSponsorById(this.sponsorId);
    }
  }

  getCountry() {
    this.$subscriptions.push(this._sponsorService.getCountryLookUp().subscribe((data) => {
      this.countries = data;
      this.countrySearchOptions = setCompleterOptions(this.countrySearchOptions, this.countries);
    }));
  }

  getSponsorById(sponsorId) {
    this.$subscriptions.push(this._sponsorService.getSponsorData(sponsorId).subscribe((data: any) => {
      if (data) {
        this.sponsorDetails = data;
        this.before = this.prepareAuditLogObject(deepCloneObject(this.sponsorDetails));
        this.setDefaultUnitValue();
        this.setDefaultCountryValue();
      }
    }));
  }

  setDefaultUnitValue() {
    if (this.sponsorDetails.unit && this.sponsorDetails.unit.unitName) {
        this.clearField = new String('false');
        this.departmentSearchOptions.defaultValue = this.sponsorDetails.unit.unitName;
    } else {
        this.departmentSearchOptions.defaultValue = '';
    }
  }

  setDefaultCountryValue() {
    if (this.sponsorDetails.country && this.sponsorDetails.country.countryName) {
        this.countryClearField = new String('false');
        this.countrySearchOptions.defaultValue = this.sponsorDetails.country.countryCode + '-' + this.sponsorDetails.country.countryName;
    } else {
        this.countrySearchOptions.defaultValue = '';
    }
  }

  maintainSponsor(type) {
    this.sponsorValidation();
    if ((this.map.size < 1)  && !this.isSaving) {
      this.isSaving = true;
      this.sponsorDetails.acType = type;
      if (type === 'I') {
        this.sponsorDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.sponsorDetails.createUser = this._commonService.getCurrentUserDetail('userName');
      }
      if (this.sponsorDetails.acType === 'I') {
        this.toast_message = 'Sponsor has successfully created.';
      } else if (this.sponsorDetails.acType === 'U') {
        // tslint:disable-next-line: triple-equals
        this.sponsorDetails.sponsorGroup  = this.sponsorDetails.sponsorGroup == '' ? null : this.sponsorDetails.sponsorGroup;
        this.toast_message = 'Sponsor successfully updated.';
      }
      let after = this.prepareAuditLogObject(deepCloneObject(this.sponsorDetails));
      this._commonService.showToast(HTTP_SUCCESS_STATUS, this.toast_message);
      this.$subscriptions.push(this._sponsorService.maintainSponsorData(this.sponsorDetails).subscribe((data: any) => {
        this.sponsorDetails = data;
        this.router.navigate(['/fibi/sponsor-maintenance/sponsor-view'],{ queryParams: { sponsorId: this.sponsorDetails.sponsorCode }})
        this.isSaving = false;
        if (type === 'I') {
          this._auditLogService.saveAuditLog('I', null, after, null, Object.keys(after), this.sponsorDetails.sponsorCode);
        } else if (type=== 'U') {
          this._auditLogService.saveAuditLog('U', this.before, after, null, Object.keys(after), this.sponsorDetails.sponsorCode);
        }
      }, err => { this.isSaving = false; }));
    }
  }

  /**
   * removing unwanted keys and values.
   * adding --None-- for empty values.
   * @param sponsor
   * @returns 
   */
  prepareAuditLogObject(sponsor): SponsorAuditLog {
    let auditLog = deepCloneObject(sponsor);
    delete auditLog.countryCode;
    delete auditLog.country;
    delete auditLog.unit;
    delete auditLog.unitNumber;
    delete auditLog.sponsorTypes;
    delete auditLog.sponsorCode;
    delete auditLog.acType;
    delete auditLog.updateTimestamp;
    Object.keys(auditLog).forEach(ele => {
      auditLog[ele] = auditLog[ele] || "--NONE--";
    });
    auditLog['COUNTRY'] = sponsor.countryCode ? sponsor.countryCode + ' - ' + sponsor.country.countryName : '--None--';
    auditLog['UNIT'] =  sponsor.unit ? sponsor.unit.unitNumber + '- ( ' + sponsor.unit.unitName + ')' : null;
    return auditLog;
  }

  /**
   * validates sponsor fields
   */
  sponsorValidation() {
    this.map.clear();
    if (!this.sponsorDetails.sponsorName ) {
      this.map.set('sponsorname', 'name');
    }
    if (!this.sponsorDetails.sponsorTypeCode) {
      this.map.set('sponsortype', 'type');
    }
    this.inputLengthRestrictionAcronym(this.sponsorDetails.acronym);
    this.emailValidation(this.sponsorDetails.emailAddress, 'email');
  }

  emailValidation(emailAddress, key) {
    this.map.delete(key);
    if (emailAddress && (!isValidEmailAddress(this.sponsorDetails.emailAddress))) {
        this.map.set(key, 'Please select a valid email address');
      }
  }

  phoneNumberValidationChecking(input, key: string) {
    this.map.delete(key);
    if (phoneNumberValidation(input)) {
      this.map.set(key, phoneNumberValidation(input));
    }
  }
  
  inputLengthRestrictionAcronym(acronym) {
    this.map.delete('acronym');
    if (acronym && (acronym.length > 10)) {
        this.map.set('acronym', '* The maximum acronym length is limited to 10 characters');
    }
  }

  departmentChangeFunction(result) {
    if (result) {
      this.sponsorDetails.unitNumber = result.unitNumber;
      this.sponsorDetails.unit = result;
    } else {
      this.sponsorDetails.unitNumber = null;
      this.sponsorDetails.unit = null;
    }
  }

  countryChangeFunction(countrySelectionEvent) {
    if (countrySelectionEvent) {
      this.sponsorDetails.countryCode = countrySelectionEvent.countryCode;
      this.sponsorDetails.country = countrySelectionEvent;
    } else {
      this.countryEmptyFunction(countrySelectionEvent);
    }
  }

  countryEmptyFunction(countryEmptySelectionEvent) {
    this.countrySearchOptions.defaultValue = countryEmptySelectionEvent ?
      countryEmptySelectionEvent.searchString : countryEmptySelectionEvent;
    this.sponsorDetails.countryCode = null;
  }

  loadSponsor() {
    return this.router.navigate(['fibi/sponsor-maintenance/sponsor-list']);
  }

   getSponsorLookUps() {
    this.$subscriptions.push(this._sponsorService.getNewSponsorData().subscribe((data: any) => {
      this.sponsorDetails = data;
    }));
  }

  cancelSponsorFields() {
    this.sponsorDetails = {};
    this.sponsorDetails.sponsorCode = null;
    this.sponsorDetails.active = true;
    this.clearField = new String('true');
    this.countryClearField = new String('true');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
