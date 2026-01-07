import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AgreementService } from '../../agreement.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { AgreementCommonDataService } from '../../agreement-common-data.service';
import { getEndPointOptionsForCountry, getEndPointOptionsForSponsor } from '../../../common/services/end-point.config';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
declare var $: any;

@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.css']
})
export class OrganisationComponent implements OnInit, OnDestroy {

  organizationSearchOptions: any = {};
  agreementSponsor: any = {};
  contactIndex = -1;
  organisationMap = new Map();
  agreementSponsorId = null;
  agreementSponsorContactId = null;
  contactPersons: any = {
    agreementSponsorContactType: null,
    salutation: null
  };
  result: any = {};
  clearOrgField: String;
  isSelectedOrganization = true;
  $subscriptions: Subscription[] = [];
  isOrganisationFormChanged = false;
  isOrganisationEditMode = false;
  isNewOrganisation = false;
  newObject: any = {
    organizationType: '',
    organisationCity: '',
    organisationState: '',
    organisationZipCode: '',
    organisationCountry: '',
    addressLine1: '',
    addressLine2: ''
  };
  sponsorIndex = null;
  isEditOrganisation = false;
  isDisabled = false;
  countrySearchOptions = {};
  clearCountryField;
  sponsorDetails: any = {};
  newType: string;
  isPartyChanged = false;
  isExistPrimarySponsor = false;
  isFetchedFirstTime = false;
  isShowOrganisation = true;
  selectedSponsor: any;
  isAddressCopied = false;
  showCopyOption = false;

  constructor(private _agreementService: AgreementService, public _commonService: CommonService,
    public _commonAgreementData: AgreementCommonDataService) { }

  ngOnInit() {
    this.organizationSearchOptions = getEndPointOptionsForSponsor();
    this.getAgreementGeneralData();
    this.countrySearchOptions = getEndPointOptionsForCountry();
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        if (this.isFetchedFirstTime) {
          data.agreementSponsors = this.result.agreementSponsors;
        }
        this.result = JSON.parse(JSON.stringify(data));
        this.isOrganisationEditMode = this._commonAgreementData.getSectionEditPermission('102');
      }
    }));
  }

  /** Initializes objects when user clicks 'Add Organisation' button. */
  initializeLookupValues() {
    this.setDefaultRoleAndParty();
    this.clearOrgField = new String('true');
    this.newObject.organizationType = null;
    this.agreementSponsor.agreementSponsorId = null;
    this.agreementSponsor.address = null;
    this.newObject.organisationCity = '';
    this.newObject.organisationState = '';
    this.newObject.organisationZipCode = '';
    this.newObject.organisationCountry = '';
    this.newObject.addressLine1 = '';
    this.newObject.addressLine2 = '';
    this.isDisabled = false;
  }

  /**
   * @param  {} event
   * Triggers when a sponsor is selected.
   */
  organizationSelectFunction(event) {
    if (event) {
      this.agreementSponsor.sponsorName = event.sponsorName;
      this.agreementSponsor.address = event.addressLine1 ? event.addressLine1.concat(event.addressLine2) : '';
      this.agreementSponsor.sponsorCode = event.sponsorCode;
      this.agreementSponsor.sponsor = event;
      this.agreementSponsor.agreementRequestId = this.result.agreementHeader.agreementRequestId;
      this.newObject.organizationType = event.sponsorType ? event.sponsorType.description : '';
      this.newObject.organisationCity = event.sponsorLocation;
      this.newObject.organisationState = event.state ? event.state : '';
      this.newObject.addressLine1 = event.addressLine1 ? event.addressLine1 : '';
      this.newObject.addressLine2 = event.addressLine2 ? event.addressLine2 : '';
      this.newObject.organisationZipCode = event.postalCode ? event.postalCode : '';
      this.newObject.organisationZipCode = event.postalCode ? event.postalCode : '';
      this.newObject.organisationCountry = event.country ? event.country.countryName : null;
      this.isDisabled = true;
    } else {
      this.organizationEmptyFunction();
    }
    this.isOrganisationFormChanged = true;
  }

  checkIfPrimarySponsorExist() {
    return this.result.agreementSponsors.find( s => s.agreementSponsorType && s.agreementSponsorType.agreementSponsorTypeCode === '1') ?
    true : false;
   }

  /** Sets the 'Role' dropdown with value as 'Sponsor' and Agreement Party with 'Primary'
   * by default for the first time when the user adds an organisation.
   */
  setDefaultRoleAndParty() {
    if (!this.result.agreementSponsors.length || !this.checkIfPrimarySponsorExist()) {
      this.agreementSponsor.sponsorRoleTypeCode = '1';
      this.agreementSponsor.agreementSponsorTypeCode = '1';
    } else if (this.isEditOrganisation && this.result.agreementSponsors.length &&
      this.agreementSponsor.sponsorRoleTypeCode === '1' && this.agreementSponsor.agreementSponsorTypeCode === '1') {
      this.agreementSponsor.sponsorRoleTypeCode = '1';
      this.agreementSponsor.agreementSponsorTypeCode = '1';
    } else {
      this.agreementSponsor.sponsorRoleTypeCode = null;
      this.agreementSponsor.agreementSponsorTypeCode = null;
    }
    this.getAgreementParty(this.agreementSponsor.agreementSponsorTypeCode);
    this.setRoleDropdownValue();
  }

  /**
   * @param  {string} typeCode
   * Sets the sponsorType Object before adding organisation.
   */
  getAgreementParty(typeCode: string) {
    this.agreementSponsor.agreementSponsorType = this.result.agreementSponsorTypes.find(element =>
      (element.agreementSponsorTypeCode === typeCode));
  }

  /**
   * @param  {string} roleTypeCode
   * Sets the sponsorRole object when user selects different values from 'Role' dropdown.
   */
  setRoleDropdownValue() {
    this.agreementSponsor.sponsorRole =
      this.result.sponsorRoles.find(role => role.sponsorRoleTypeCode === this.agreementSponsor.sponsorRoleTypeCode);
  }

  /**
   * @param  {string} code
   * Sets the sponsorType object from its code.
   */
  getSponsorType() {
    this.sponsorDetails.sponsorType = this.result.sponsorTypes.find(element => element.code === this.newType);
    this.sponsorDetails.sponsorTypeCode = this.newType;
  }

  organizationEmptyFunction() {
    this.agreementSponsor.sponsorName = null;
    this.agreementSponsor.address = null;
    this.result.agreementHeader.agreementSponsorTypeCode = '';
    this.isDisabled = false;
    this.newObject = {};
  }

  /**
   * @param  {} countrySelectionEvent
   * Sets the country objects when selecting a country.
   */
  countryChangeFunction(countrySelectionEvent) {
    this.isOrganisationFormChanged = true;
    if (countrySelectionEvent) {
      this.sponsorDetails.countryCode = countrySelectionEvent.countryCode;
      this.sponsorDetails.country = countrySelectionEvent;
    } else {
      this.sponsorDetails.country = null;
    }
  }

  /**
   * @param event
   * sets manually entered value as organization name
   */
  getSearchValue(event) {
    this.agreementSponsor.sponsorName = event.searchString;
    this.isOrganisationFormChanged = true;
    this.isSelectedOrganization = false;
    this.newType = null;
    this.sponsorDetails.sponsorName = event.searchString;
    this.setSponsorDetails();
  }

  /** Prepares the object for saving newly added organisation into DB. */
  setSponsorDetails() {
    this.sponsorDetails.acType = 'I';
    this.sponsorDetails.addressLine1 = this.agreementSponsor.addressLine1;
    this.sponsorDetails.addressLine2 = this.agreementSponsor.addressLine2;
    this.sponsorDetails.addressLine3 = null;
    this.sponsorDetails.active = true;
    this.sponsorDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.sponsorDetails.createUser = this._commonService.getCurrentUserDetail('userName');
    this.sponsorDetails.emailAddress = null;
    this.sponsorDetails.phoneNumber = null;
    this.sponsorDetails.responseMessage = null;
    this.sponsorDetails.rolodexId = null;
    this.sponsorDetails.rolodexName = null;
    this.sponsorDetails.sponsorCode = null;
    this.sponsorDetails.sponsorLocation = null;
    // this.sponsorDetails.isAdminVerified = false;
    this.sponsorDetails.updateTimestamp = new Date().getTime();
  }

  /** Triggers when user clicks 'Add' button in Add Organisation modal. */
  addOrganisationDetails() {
    this.saveOrUpdateOrganisation();
    this._commonService.showToast(HTTP_SUCCESS_STATUS, this.isEditOrganisation?"Sponsor/Organization updated successfully.":" Sponsor/Organization added successfully.");
    
  }

  /**
   *commented code : if entered organization is manually entered asks user confirmation to add that to organization name drop down
   *calls save or update organization call.
   */
  saveOrUpdateOrganisation() {
    if (this.validateNameAndSponsor()) {
      this.isSelectedOrganization ? this.saveOrUpdateOrganisationServiceCall() : this.saveOrganisationToSearch();
    }
  }

  /** Validates organisation name and checks if any duplicate primary sponsor exists. */
  validateNameAndSponsor() {
    this.organisationMap.clear();
    if (!this.agreementSponsor.sponsorName) {
      this.organisationMap.set('organisation', 'organisation');
    }
    if (this.checkForDuplicatePrimarySponsor()) {
      this.organisationMap.set('duplicateSponsor', 'duplicateSponsor');
    }
    if (!this.isSelectedOrganization && !this.newType) {
      this.organisationMap.set('type', 'type');
    }
    return this.organisationMap.size > 0 ? false : true;
  }

  /** Restricts user from adding multiple primary sponsors. */
  checkForDuplicatePrimarySponsor() {
    const PRIMARY = this.result.agreementSponsors.find(element => element.agreementSponsorType &&
      element.agreementSponsorType.agreementSponsorTypeCode === '1');
    if (PRIMARY) {
      if (this.agreementSponsor.agreementSponsorTypeCode === '1') {
        return PRIMARY.agreementSponsorId === this.agreementSponsor.agreementSponsorId ? false : true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * @param  {} agreementSponsor
   * Triggers when user add an organisation which is already in the list.
   */
  saveOrUpdateOrganisationServiceCall(agreementSponsor = this.agreementSponsor) {
    const REQUEST_DATA = {
      agreementSponsor: agreementSponsor,
      agreementRequestId: this.result.agreementHeader.agreementRequestId
    };
    this.$subscriptions.push(this._agreementService.saveOrUpdateOrganisation(REQUEST_DATA).subscribe((data: any) => {
      this.agreementSponsor.agreementSponsorId = data.agreementSponsorId;
      this.result.agreementSponsors = data.agreementSponsors;
      this.isOrganisationFormChanged = false;
      this.isNewOrganisation = false;
      this.agreementSponsor = {};
      this.clearContactDetails();
      this._commonAgreementData.setAgreementData(this.result);
      $('#add-organization-modal').modal('hide');
      this.isSelectedOrganization = true;
      this.isEditOrganisation = false;
    }, err => {
    }));
  }

  /** saves manually added new Organisation to DB */
  saveOrganisationToSearch() {
    this.sponsorDetails.sponsorLocation = this.newObject.organisationCity;
    this.sponsorDetails.postalCode = this.newObject.organisationZipCode;
    this.sponsorDetails.state = this.newObject.organisationState;
    this.sponsorDetails.addressLine1 = this.newObject.addressLine1;
    this.sponsorDetails.addressLine2 = this.newObject.addressLine2;
    this.$subscriptions.push(this._agreementService.maintainSponsorData(this.sponsorDetails).subscribe((data: any) => {
      this.setObjectsFromNewSponsor(data);
      this.saveOrUpdateOrganisationServiceCall(this.agreementSponsor);
    }));
  }

  setObjectsFromNewSponsor(data: any) {
    this.agreementSponsor.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    // this.agreementSponsor.agreementSponsorId = null;
    this.agreementSponsor.sponsorCode = data.sponsorCode;
    this.agreementSponsor.sponsorName = data.sponsorName;
    this.newObject.addressLine1 = data.addressLine1;
    this.newObject.addressLine2 = data.addressLine2;
    this.newObject.organisationCity = data.sponsorLocation;
    this.newObject.organisationState = data.state;
    this.newObject.organisationZipCode = data.postalCode;
  }

  /** Clears the contact object. */
  clearContactDetails() {
    this.contactPersons = { agreementSponsorContactType: null, salutation: null, agreementSponsorContactId: '' };
    this.contactIndex = -1;
    this.organisationMap.clear();
    this.isAddressCopied = false;
    this.selectedSponsor = {};
  }

  /**
   * @param  {any} sponsors
   * The contact type will be set as 'Primary' by default for the first added contact for each organisation.
   */
  setDefaultContact(sponsors: any) {
    this.selectedSponsor = sponsors;
    this.isAddressAvailable();
    if (!sponsors.agreementSponsorContacts.length) {
      this.contactPersons.sponsorContactTypeCode = '1';
      this.contactPersons.agreementSponsorContactType =
        this.result.agreementSponsorContactTypes.find(e => e.sponsorContctTypeCode === '1');
    } else {
      this.contactPersons.agreementSponsorContactType = null;
    }
  }

  /**
   * @param  {any} organisation
   * Edit and updates the organisation.
   */
  editOrganisation(organisation: any) {
    this.organisationMap.clear();
    this.clearOrgField = new String(false);
    this.agreementSponsor = JSON.parse(JSON.stringify(organisation));
    this.organizationSearchOptions.defaultValue = this.agreementSponsor.sponsorName;
    this.organizationSearchOptions = JSON.parse(JSON.stringify(this.organizationSearchOptions));
    this.newObject.organizationType = this.agreementSponsor.sponsor ? this.agreementSponsor.sponsor.sponsorType.description : null;
    this.newObject.organisationCity = this.agreementSponsor.sponsor ? this.agreementSponsor.sponsor.sponsorLocation : null;
    this.newObject.organisationState = this.agreementSponsor.sponsor ? this.agreementSponsor.sponsor.state : null;
    this.newObject.organisationZipCode = this.agreementSponsor.sponsor ? this.agreementSponsor.sponsor.postalCode : null;
    this.newObject.organisationCountry = this.agreementSponsor.sponsor && this.agreementSponsor.sponsor.country ?
      this.agreementSponsor.sponsor.country.countryName : null;
    this.newObject.addressLine1 = this.agreementSponsor.sponsor ? this.agreementSponsor.sponsor.addressLine1 : null;
    this.newObject.addressLine2 = this.agreementSponsor.sponsor ? this.agreementSponsor.sponsor.addressLine2 : null;
  }

  /** Validates contact before save. */
  validateContactDetails() {
    this.organisationMap.clear();
    if (!this.contactPersons.sponsorContactTypeCode || this.contactPersons.sponsorContactTypeCode === 'null') {
      this.organisationMap.set('contactType', 'contactType');
    }
    if (!this.contactPersons.contactPersonName) {
      this.organisationMap.set('contactPerson', 'contactPerson');
    }
    if (!this.contactPersons.contactEmailId || this.emailValidation()) {
      this.organisationMap.set('email', 'email');
    }
    if (this.checkDuplicatePrimaryContact()) {
      this.organisationMap.set('contactTypeDuplication', 'contactType');
    }
    if (this.contactPersons.salutation === 'null') {
      this.contactPersons.salutation = null;
    }
    return this.organisationMap.size > 0 ? false : true;
  }

  emailValidation() {
    // tslint:disable-next-line:max-line-length
    if (this.contactPersons.contactEmailId) {
      const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)| (".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return (!(email.test(String(this.contactPersons.contactEmailId).toLowerCase()))) ? true : false;
    } else {
      return false;
    }
  }

  /** checks primary contact appears more than ones  */
  checkDuplicatePrimaryContact() {
    if (this.contactPersons.contactPersonName) {
      if (!this.agreementSponsor.agreementSponsorContacts) {
        this.agreementSponsor.agreementSponsorContacts = [];
      }
      const INDEX = this.agreementSponsor.agreementSponsorContacts.findIndex(contact => contact.sponsorContactTypeCode === '1');
      return (INDEX > -1 && INDEX !== this.contactIndex && this.contactPersons.sponsorContactTypeCode === '1') ?
        true : false;
    } else {
      return false;
    }
  }

  agreementTypeChange() {
    this.contactPersons.sponsorContactTypeCode = this.contactPersons.agreementSponsorContactType.sponsorContctTypeCode;
  }

  /**
   * @param  {string} type
   * Saves the contact to DB.
   */
  saveOrUpdateOrganisationContact(type: string) {
    if (this.validateContactDetails()) {
      const agreementSponsorContact: any = this.contactPersons;
      agreementSponsorContact.agreementSponsorId = this.result.agreementSponsors[this.sponsorIndex].agreementSponsorId;
      agreementSponsorContact.updateUser = this._commonService.getCurrentUserDetail('userName');
      agreementSponsorContact.agreementRequestId = this.result.agreementHeader.agreementRequestId;
      this._agreementService.saveOrUpdateOrganisationContact({ 'agreementSponsorContact': agreementSponsorContact }).
        subscribe((data: any) => {
          this.updateContactData(data.agreementSponsorContact, type);
          this._commonService.showToast(HTTP_SUCCESS_STATUS,type=='edit'?'Contact updated successfully.':'Contact saved successfully.');
        });
    }
    if (!this.organisationMap.size) {
      $('#add-contacts-modal').modal('hide');
    }
  }

  /** updates contact data after save or update */
  updateContactData(agreementSponsorContact, type) {
    if (type === 'edit') {
      this.result.agreementSponsors[this.sponsorIndex].agreementSponsorContacts[this.contactIndex] = agreementSponsorContact;
    } else {
      if (!this.result.agreementSponsors[this.sponsorIndex].agreementSponsorContacts) {
        this.result.agreementSponsors[this.sponsorIndex].agreementSponsorContacts = [];
      }
      this.result.agreementSponsors[this.sponsorIndex].agreementSponsorContacts.push(agreementSponsorContact);
    }
    this.clearContactDetails();
    this.agreementSponsor = {};
    this._commonAgreementData.setAgreementData(this.result);
  }

  /**
   * @param  {number} id
   * @param  {any} agreementSponsorContactId
   * @param  {number} sponsorIndex
   * Sets the required indexes for deleting contacts w.r.t its Organisation.
   */
  setContactDeleteDetails(id: number, agreementSponsorContactId: any, sponsorIndex: number) {
    this.contactIndex = id;
    this.sponsorIndex = sponsorIndex;
    this.agreementSponsorContactId = agreementSponsorContactId;
  }

  /** Deletes the contact based in index. */
  deleteAgreementSponsorContact() {
    this._agreementService.deleteAgreementSponsorContact({ 'agreementSponsorContactId': this.agreementSponsorContactId }).subscribe(
      (_data: any) => {
        this.result.agreementSponsors[this.sponsorIndex].agreementSponsorContacts.splice(this.contactIndex, 1);
        this._commonAgreementData.setAgreementData(this.result);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Contact deleted successfully.');
        this.clearContactDetails();
      });
    $('#delete-organisation-contact-modal').modal('hide');
  }

  /** Deletes an organisation. */
  deleteSponsor() {
    const id = this.result.agreementSponsors[this.sponsorIndex].agreementSponsorId;
    this._agreementService.deleteAgreementSponsor({ 'agreementSponsorId': id }).subscribe(
      (_data: any) => {
        this.result.agreementSponsors.splice(this.sponsorIndex, 1);
        this._commonAgreementData.setAgreementData(this.result);
        this._commonService.showToast(HTTP_SUCCESS_STATUS," Sponsor/Organization deleted successfully.");
      },
      err => { this._commonService.showToast(HTTP_ERROR_STATUS, "Deleting Sponsor/Organization failed. Please try again."); });
    $('#deleteSponsorModal').modal('hide');
  }

  /**
   * @param  {number} i
   * Sets the required index for deleting an Organisation.
   */
  setSponsorDeleteDetails(i: number) {
    this.sponsorIndex = i;
  }

  /**
   * @param  {any} sponsor
   * @param  {number} index
   * Sets the required index for editing a contact.
   */
  editContact(sponsor: any, index: number) {
    this.clearContactDetails();
    this.contactIndex = index;
    this.contactPersons = Object.assign({}, sponsor.agreementSponsorContacts[index]);
    this.contactPersons.agreementSponsorContactType =
      this.result.agreementSponsorContactTypes.find(e => e.sponsorContctTypeCode === this.contactPersons.sponsorContactTypeCode);
    this.selectedSponsor = sponsor;
    this.isAddressAvailable();
  }

   /**
   * If copy option selected, then contact person address will default to sponsor address
   * by combining addressLin1,addressLine2,city,state,zipcode 
   * of the corresponding sponsor.
   * @param checkboxevent 
   */
    setContactAddress(checkboxevent) {
      if (checkboxevent.target.checked) {
        const ADDRESS_1 = (this.selectedSponsor.sponsor.addressLine1 ? this.selectedSponsor.sponsor.addressLine1 + ', ' : '');
        const ADDRESS_2 = (this.selectedSponsor.sponsor.addressLine2 ? this.selectedSponsor.sponsor.addressLine2 + ', ' : '');
        const CITY = (this.selectedSponsor.sponsor.sponsorLocation ? this.selectedSponsor.sponsor.sponsorLocation + ', ' : '');
        const STATE = (this.selectedSponsor.sponsor.state ? this.selectedSponsor.sponsor.state + ', ' : '');
        const ZIP = (this.selectedSponsor.sponsor.postalCode ? this.selectedSponsor.sponsor.postalCode.toString() + ', ' : '');
        this.isAddressCopied = true;
        this.contactPersons.contactAddressLine = ADDRESS_1 + ADDRESS_2 + CITY + STATE + ZIP;
        this.contactPersons.contactAddressLine = this.contactPersons.contactAddressLine.replace(/,([^,]*)$/, '$1');
      } else {
        this.isAddressCopied = false;
        this.contactPersons.contactAddressLine = '';
      }
    }

    isAddressAvailable() {
      this.showCopyOption = (this.selectedSponsor.sponsor.addressLine1 || this.selectedSponsor.sponsor.addressLine2 
                            || this.selectedSponsor.sponsor.sponsorLocation || this.selectedSponsor.sponsor.state 
                            || this.selectedSponsor.sponsor.postalCode);
    }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
