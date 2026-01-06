/**
 * Last updated by Arun Raj
 * Please refer the document: https://docs.google.com/document/d/1m4r-rgLT-j1cB7JpWKmmEYCxsXvDbvc5NGpwdEQCCBA/edit
 */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { ElasticConfigService } from './../../../../common/services/elastic-config.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import {
    getEndPointOptionsForCongressionalDistrict,
    getEndPointOptionsForCountry,
    getEndPointOptionsForOrganization,
} from '../../../../common/services/end-point.config';
import { ProposalHomeService } from '../../proposal-home.service';
import { environment } from '../../../../../environments/environment';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
import { DataStoreService } from '../../../services/data-store.service';
import { getOrganizationAddress, deepCloneObject } from '../../../../common/utilities/custom-utilities';
import { ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
    selector: 'app-organization',
    templateUrl: './organization.component.html',
    styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent implements OnInit, OnDestroy {
    @Input() result: any;

    isShowCollapse = true;
    isShowCard = false;
    isSaving = false;
    organizationSearchOptions: any = {};
    countrySearchOptions: any = {};
    districtHttpOptions: any = {};
    districtOptions: any = {};
    deployMap = environment.deployUrl;
    contactElasticOptions: any = {};
    rolodexSearchOptions: any = {};
    orgDetailsForCard: any = {
        congressionalDistrict: []
    };
    viewContactDetails: any = {};
    viewOrganizationDetails: any = {};
    districtObj: any = {
        proposalCongDistrictId: null,
        congDistrictCode: null,
        congressionalDistrict: null,
    };
    manuallyAddedDistricts: any = {
        proposalCongDistrictId: null,
        congressionalDistrict: {
            congDistrictCode: null,
            description: null,
            isActive: 'Y'
        },
    };
    clearOrganizationField;
    clearRolodexField: String;
    clearCountryField;
    clearDistrictField;
    clearDistField;
    clearContactField;
    rolodexId: number;
    isAddNonEmployeeModal = false;
    isShowPersonResultCard = false;
    selectedMemberObject: any = {};
    elasticSearchOptions: any = {};
    clearField;
    editIndex: number = null;
    districtArray: any = [];
    map = new Map();
    personDetails: any = {
        units: [],
        proposalPersonRole: null,
        department: ''
    };
    organizationObject: any = {
        proposalId: null,
        organizationTypeCode: null,
        organizationId: null,
        organization: null,
        organizationType: null,
        proposalCongDistricts: [],
        location: null,
    };
    modalOrganizationObject: any = {
        organizationId: null,
        organizationName: null,
        address: null,
        telexNumber: null,
        congressionalDistrict: {
            congDistrictCode: null,
            description: null,
            isActive: 'Y'
        },
        contactAddressId: null,
        cableAddress: null,
        vendorCode: null,
        dunsNumber: null,
        dodacNumber: null,
        cageNumber: null,
        countryCode: null,
        contactPersonName: null,
        country: null,
    };

    $subscriptions: Subscription[] = [];
    orgDeleteId: any;
    enableOrganizationLocation = false;
    isRolodexViewModal = false;
    type = 'ROLODEX';
    isTraining = false;
    id: string;
    personDescription: string;
    trainingStatus: string;
    getOrganizationAddress = getOrganizationAddress;
    proposalIdBackup = null;

    constructor(public _commonService: CommonService,
        public _autoSaveService: AutoSaveService,
        public _proposalHomeService: ProposalHomeService,
        private _elasticConfig: ElasticConfigService,
        private _dataStore: DataStoreService,
        private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        this.getProposalDetailsFromRoute();
        this.setEndPointSearchOptions();
        this.contactElasticOptions = this._elasticConfig.getElasticForRolodex();
        this.rolodexSearchOptions = this._elasticConfig.getElasticForOrganization();
        this.enableOrganizationLocation = this.result.enableOrganizationLocation;
        this.setDefaultOrganizationType();
    }

    private getProposalDetailsFromRoute() {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            if (this.proposalIdBackup != this.result.proposal.proposalId) {
                this.proposalIdBackup = params['proposalId'];
                this.clearProposalOrgValues();
            }
        }));
    }

    setDefaultOrganizationType(): void {
        this.organizationObject.organizationTypeCode = '3';
        this.organizationObject.organizationType = this.findTypeCodeObject('3');
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._autoSaveService.clearUnsavedChanges();
    }

    setEndPointSearchOptions() {
        this.organizationSearchOptions = getEndPointOptionsForOrganization();
        this.countrySearchOptions = getEndPointOptionsForCountry();
        this.districtHttpOptions = getEndPointOptionsForCongressionalDistrict();
        this.districtOptions = getEndPointOptionsForCongressionalDistrict();
    }

    organizationSelectFunction(event: any) {
        if (event) {
            this.setOrgDetailsForCard(event);
            this.organizationObject.organizationId = event.organizationId;
            this.organizationObject.organization = event;
            if (event.congressionalDistrict && event.congressionalDistrict.congDistrictCode) {
                this.setProposalCongDistricts(event.congressionalDistrict);
            } else {
                this.organizationObject.proposalCongDistricts = [];
            }
            this.isShowCard = true;
        } else {
            this.organizationObject.organizationId = '';
            this.isShowCard = false;
            this.organizationSearchOptions.defaultValue = null;
            this.organizationObject.proposalCongDistricts = [];
        }
    }

    setProposalCongDistricts(congressionalDistrict: any): void {
        const congDistrictObject: any = {};
        let isDuplicate = false;
        isDuplicate = this.organizationObject.proposalCongDistricts.find(
            element => element.congDistrictCode === congressionalDistrict.congDistrictCode) ? true : false;
        if (!isDuplicate) {
            congDistrictObject.congDistrictCode = congressionalDistrict.congDistrictCode;
            congDistrictObject.congressionalDistrict = congressionalDistrict;
            this.organizationObject.proposalCongDistricts.push(congDistrictObject);
        }
    }

    rolodexSelectFunction(event: any) {
        if (event) {
            this.organizationObject.rolodexId = event.rolodex_id;
            this.organizationObject.rolodex = this.setElasticRolodexDetails(event);
            this.isShowPersonResultCard = true;
            this.selectedMemberObject = JSON.parse(JSON.stringify(this.organizationObject.rolodex));
            this.selectedMemberObject.address = event.address;
            if (event.country) {
                this.organizationObject.rolodex.country = {};
                this.organizationObject.rolodex.country.countryName = event.country;
            }
            if (event.city) {
                this.organizationObject.rolodex.city = event.city;
            }
        } else {
            this.organizationObject.rolodexId = '';
            this.organizationObject.rolodex = {};
            this.isShowPersonResultCard = false;
            this.rolodexSearchOptions.defaultValue = null;
        }
        this.organizationObject.proposalCongDistricts = [];
    }

    setElasticRolodexDetails(event: any) {
        return {
            rolodexId: event.rolodex_id,
            addressLine1: null,
            addressLine2: null,
            addressLine3: null,
            city: null,
            comments: null,
            countryCode: null,
            county: null,
            emailAddress: event.email_address,
            faxNumber: null,
            firstName: event.first_name,
            lastName: event.last_name,
            middleName: event.middle_name,
            organization: null,
            ownedByUnit: null,
            phoneNumber: event.phone_number,
            postalCode: null,
            prefix: null,
            sponsorCode: null,
            state: null,
            suffix: null,
            title: null,
            createUser: event.create_user,
            active: true,
            updateUser: null,
            updateTimestamp: null,
            organizations: {
                organizationId: null,
                organizationName: event.organization,
                contactAddressId: null,
                address: null,
                cableAddress: null,
                telexNumber: null,
                congressionalDistrict: null,
                incorporatedIn: null,
                incorporatedDate: null,
                vendorCode: null,
                dunsNumber: null,
                dodacNumber: null,
                cageNumber: null,
                humanSubAssurance: null,
                scienceMisconductComplDate: null,
                animalWelfareAssurance: null,
                phsAcount: null,
                nsfInstitutionalCode: null,
                indirectCostRateAgreement: null,
                cognizantAuditor: null,
                updateTimestamp: null,
                isActive: true,
                updateUser: null,
                countryCode: null,
                country: null,
                contactPersonName: null,
                isPartneringOrganization: null
            },
            sponsor: null,
            designation: event.designation,
            fullName: event.full_name,
            country: null,
            createUserFullName: null
        };
    }

    /** Bind the value of rolodex to elastic search field after adding new non employee
    * @param rolodexObject
    */

    setRolodexPersonObject(rolodexObject) {
        if (rolodexObject.rolodex) {
            this.map.delete('organizationName');
            this.clearRolodexField = new String('false');
            this.organizationObject.rolodexId = rolodexObject.rolodex.rolodexId;
            this.organizationObject.rolodex = rolodexObject.rolodex;
            this.personDetails.fullName = rolodexObject.rolodex.fullName;
            this.personDetails.rolodexId = rolodexObject.rolodex.rolodexId;
            this.personDetails.designation = rolodexObject.rolodex.designation;
            this.rolodexSearchOptions.defaultValue = rolodexObject.rolodex.fullName;
            if (rolodexObject.rolodex.organizations) {
                this.rolodexSearchOptions.defaultValue = rolodexObject.rolodex.organizations ?
                rolodexObject.rolodex.organizations.organizationName : null;
                if (rolodexObject.rolodex.organizations.congressionalDistrict &&
                        rolodexObject.rolodex.organizations.congressionalDistrict.congDistrictCode) {
                    this.setProposalCongDistricts(rolodexObject.rolodex.organizations.congressionalDistrict);
                }
            } else {
                this.rolodexSearchOptions.defaultValue = rolodexObject.rolodex.organizationName ?
                rolodexObject.rolodex.organizationName : null;
            }
            this.selectedMemberObject = JSON.parse(JSON.stringify(rolodexObject.rolodex));
            this.selectedMemberObject.address =  this.setOrganizationAddress(rolodexObject.rolodex);
            this.isShowPersonResultCard = true;
        }
        $('#add-organization-modal').modal('show');
        this.isAddNonEmployeeModal = rolodexObject.nonEmployeeFlag;
    }

    setOrganizationAddress(rolodex) {
        let address = '';
        if (rolodex.addressLine1) {
            address = rolodex.addressLine1;
        }
        if (rolodex.addressLine2) {
            address = address ?  address + ', ' + rolodex.addressLine2 :  rolodex.addressLine2;
        }
        if (rolodex.addressLine3) {
            address = address ?  address + ', ' + rolodex.addressLine3 :  rolodex.addressLine3;
        }
        return address;
    }

    /**
     * @param  {any} event
     * Sets the details for showing in the card while selecting an Organization.
     */

    setOrgDetailsForCard(event: any) {
        this.orgDetailsForCard.organizationName = event ? event.organizationName : '';
        this.orgDetailsForCard.congressionalDistrict = event && event.congressionalDistrict ? event.congressionalDistrict.description : '';
        this.orgDetailsForCard.contactPersonName = event ? event.contactPersonName : '';
    }

    getAllDistrictsForCard(data: any) {
        const DIST_ARRAY = [];
        if (data.proposalCongDistricts.length > 0) {
            data.proposalCongDistricts.forEach(element => {
                DIST_ARRAY.push(element.congressionalDistrict.description);
            });
            return DIST_ARRAY;
        }
    }

    getOrganizationTypeObject(typeCode: string) {
        this.organizationObject.organizationType = this.findTypeCodeObject(typeCode);
        this.organizationObject.rolodex = null;
        this.organizationObject.rolodexId = null;
        this.organizationObject.organizationId = null;
        this.organizationObject.organization = null;
        this.isShowPersonResultCard = false;
        this.isShowCard = false;
        this.rolodexSearchOptions.defaultValue = null;
        this.organizationObject.location = null;
        this.organizationSearchOptions.defaultValue = null;
        this.clearOrganizationField = new String('true');
        this.rolodexSearchOptions.defaultValue = null;
        this.clearRolodexField = new String('true');
        this.organizationObject.proposalCongDistricts = [];
    }

    /**organization types 1 & 2 will be added by default on proposal creation */
    isShowOrganizationEndpoint(orgTypeCode: string) {
        return ['1', '2'].includes(orgTypeCode);
    }

    findTypeCodeObject(typeCode: string) {
        if (this.result.organizationType && this.result.organizationType.length) {
            return this.result.organizationType.find((element) => element.organizationTypeCode === typeCode);
        } else {
            return null;
        }
    }

    editOrganization(data: any, index: number) {
        this.editIndex = index;
        this.organizationObject = JSON.parse(JSON.stringify(data));
        this.organizationObject.proposalCongDistricts = this.organizationObject.proposalCongDistricts || [];
        if (this.isShowOrganizationEndpoint(this.organizationObject.organizationTypeCode)) {
            this.organizationSearchOptions.defaultValue =
                data && data.organization ? data.organization.organizationName : null;
        }
        this.clearOrganizationField = new String('false');
        this.clearRolodexField = new String('false');
        this.isShowCard = false;
        this.isShowPersonResultCard = false;
        if (!this.isShowOrganizationEndpoint(this.organizationObject.organizationTypeCode)) {
            if (data.rolodex.organizations) {
                this.rolodexSearchOptions.defaultValue = data.rolodex.organizations.organizationName;
            } else {
                this.rolodexSearchOptions.defaultValue = data.rolodex.organizationName;
            }
        }
        if (this.isShowOrganizationEndpoint(this.organizationObject.organizationTypeCode)) {
            this.isShowCard = true;
            this.setOrgDetailsForCard(data.organization);

        } else {
            this.isShowPersonResultCard = true;
            this.selectedMemberObject = JSON.parse(JSON.stringify(data.rolodex));
            this.selectedMemberObject.address =  this.setOrganizationAddress(data.rolodex);
        }
        this.organizationObject.location = data.location;
        this.map.clear();
        this.hideAddOrganizationModal();
    }

    setRequiredObjects() {
        this.organizationObject.proposalId = this.result.proposal.proposalId;
        this.organizationObject.proposalCongDistricts = this.organizationObject.proposalCongDistricts || [];
        if (this.editIndex === null || this.editIndex === undefined) {
            this.organizationObject.proposalOrganizationId = null;
            this.clearOrganizationField = new String('false');
        } else {
            this.organizationObject.proposalOrganizationId = this.getProposalOrganizationId();
        }
    }

    getProposalOrganizationId() {
        return this.result.proposalOrganizations[this.editIndex].proposalOrganizationId;
    }

    validateOrganizationFields() {
        this.map.clear();
        if (!this.organizationObject.organizationTypeCode || this.organizationObject.organizationTypeCode === 'null') {
            this.map.set('organizationType', 'organizationType');
        }
        if (this.isShowOrganizationEndpoint(this.organizationObject.organizationTypeCode) &&
            (!this.organizationSearchOptions.defaultValue || !this.organizationObject.organization)) {
            this.map.set('organizationName', 'organizationName');
        }
        if (!this.isShowOrganizationEndpoint(this.organizationObject.organizationTypeCode)
                && (!this.organizationObject.rolodexId)) {
            this.map.set('organizationName', 'organizationName');
        }
        return this.map.size > 0 ? false : true;
    }

    /** Here Proposal and Performing Organizations are handled.
     * organizationTypeCode = '1' -> Proposal Organization, organizationTypeCode = '2' -> Performing Organization.
     * Validation rule :- Should not add Proposal Organization or Performing Organization twice. But can Edit/Update
     * Performing Organization.
     */
    checkForTypeDuplication() {
        if (this.result.proposalOrganizations.length && ['1', '2'].includes(this.organizationObject.organizationTypeCode)) {
            return this.validateTypeRestriction();
        } else {
            this.map.delete('alreadyExist');
            return true;
        }
    }

    validateTypeRestriction() {
        if (this.organizationObject.organizationTypeCode === '2') {
            return this.validatePerformingOrganizationType();
        } else {
            return this.validateProposalOrganizationType();
        }
    }

    validatePerformingOrganizationType() {
        let currentIndex;
        currentIndex = this.result.proposalOrganizations.findIndex((org) => '2' === org.organizationTypeCode);
        if (currentIndex === -1) {
            this.map.delete('alreadyExist');
            return true;
        } else if ((this.editIndex != null && currentIndex === this.editIndex)) {
            this.map.delete('alreadyExist');
            return true;
        } else {
            this.map.set('alreadyExist', 'alreadyExist');
            return false;
        }
    }

    validateProposalOrganizationType() {
        let currentIndex;
        currentIndex = this.result.proposalOrganizations.findIndex((org) => '1' === org.organizationTypeCode);
        if (currentIndex === -1) {
            this.map.delete('alreadyExist');
            return true;
        } else if ((this.editIndex != null && currentIndex === this.editIndex)) {
            this.map.delete('alreadyExist');
            return true;
        } else {
            this.map.set('alreadyExist', 'alreadyExist');
            return false;
        }
    }

    checkIfAddressExistInRolodex(data) {
     return (data.organizationType.organizationTypeCode === '3' && !data.rolodex.addressLine1 &&
     !data.rolodex.addressLine2 && !data.rolodex.addressLine3);
    }

    addOrganization() {
        this.setRequiredObjects();
        if (this.validateOrganizationFields() && !this.isSaving && this.checkForTypeDuplication()) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._proposalHomeService
                    .saveOrUpdateProposalOrganization({ 'proposalOrganization': this.organizationObject })
                    .subscribe(
                        (data: any) => {
                            this.isSaving = false;
                            if (this.checkIfAddressExistInRolodex(data.proposalOrganization)) {
                                data.proposalOrganization.rolodex.addressLine1 = this.selectedMemberObject.address;
                            }
                            this.pushDataToArray(data);
                            this.showToast();
                            this.clearProposalOrgValues();
                            this.organizationObject.proposalCongDistricts = [];
                            this.hideAddOrganizationModal();
                        },
                        (err) => {
                            this._commonService.showToast(HTTP_ERROR_STATUS, (this.editIndex !== null) ? 'Failed to update Organization.' : 'Failed to add Organization.');
                            this.isSaving = false;
                        }
                    )
            );
        }
    }

    /**
     * @param  {any} data
     * Pushes the data into the array depends on Add/Update actions. For adding a new entry, just pushes the data into the array
     * and while updating, pushes the data into that particular index.
     */
    pushDataToArray(data: any) {
        if (this.editIndex == null) {
            this.result.proposalOrganizations.push(data.proposalOrganization);
        } else {
            this.result.proposalOrganizations[this.editIndex] = data.proposalOrganization;
        }
        this._dataStore.manualDataUpdate({ proposalOrganizations: this.result.proposalOrganizations });
    }

    clearProposalOrgValues() {
        this.organizationObject.organizationTypeCode = null;
        this.organizationObject.organizationId = null;
        this.organizationSearchOptions.defaultValue = null;
        this.clearOrganizationField = new String('true');
        this.districtHttpOptions.defaultValue = null;
        this.clearDistrictField = new String('true');
        this.isShowCard = false;
        this.isShowPersonResultCard = false;
        this.editIndex = null;
        this.organizationObject.proposalCongDistricts = [];
        this.map.clear();
        this.organizationObject.location = null;
        this.rolodexSearchOptions.defaultValue = null;
        this.clearRolodexField = new String('true');
        this.organizationObject.rolodex = null;
        this.organizationObject.rolodexId = null;
        this.setDefaultOrganizationType();
        this.organizationObject.rolodexId = null;
        this.organizationObject.rolodex = null;
    }

    showToast() {
        this.editIndex === null
            ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Organization added successfully.')
            : this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Organization updated successfully.');
    }

    addOrganizationManually() {
        if (this.validateFields() && !this.isSaving) {
            this.isSaving = true;
            if (this.manuallyAddedDistricts.congressionalDistrict.description !== null) {
                this.modalOrganizationObject.congressionalDistrict.description =
                    this.manuallyAddedDistricts.congressionalDistrict.description;
            } else if (!this.modalOrganizationObject.congressionalDistrict.congDistrictCode) {
                this.modalOrganizationObject.congressionalDistrict = null;
            }
            this.$subscriptions.push(
                this._proposalHomeService.saveOrUpdateOrganization({ 'organization': this.modalOrganizationObject }).subscribe(
                    (data: any) => {
                        this.isSaving = false;
                        this.setAddedOrgValuesForSave(data);
                        this.clearManuallyAddedOrgValues();
                        this.setOrgDetailsForCard(data.organization);
                        this.hideAddOrganizationModal();
                        this.isShowCard = true;
                        $('#addOrganizationModal').modal('hide');
                        $('#add-organization-modal').modal('show');
                    },
                    (err) => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to add Organization.');
                        this.isSaving = false;
                    }
                )
            );
        }
    }

    setAddedOrgValuesForSave(data: any) {
        this.organizationObject.organization = data.organization;
        this.organizationObject.organizationId = data.organization.organizationId;
        this.organizationSearchOptions.defaultValue = data && data.organization ? data.organization.organizationName : '';
        this.clearOrganizationField = new String('false');
        if (data.organization.congressionalDistrict && data.organization.congressionalDistrict.congDistrictCode) {
            this.setProposalCongDistricts(data.organization.congressionalDistrict);
        }
    }

    validateFields() {
        this.map.clear();
        if (!this.modalOrganizationObject.organizationId) {
            this.map.set('organizationId', 'organizationId');
        }
        if (!this.modalOrganizationObject.organizationName) {
            this.map.set('organizationNameM', 'organizationNameM');
        }
        if (
            !this.modalOrganizationObject.contactAddressId ||
            this.modalOrganizationObject.contactAddressId === null
        ) {
            this.map.set('contactId', 'contactId');
        }
        return this.map.size > 0 ? false : true;
    }

    clearManuallyAddedOrgValues() {
        this.modalOrganizationObject.organizationId = null;
        this.modalOrganizationObject.organizationName = null;
        this.modalOrganizationObject.contactAddressId = '';
        this.modalOrganizationObject.address = null;
        this.modalOrganizationObject.telexNumber = null;
        this.modalOrganizationObject.cableAddress = null;
        this.modalOrganizationObject.vendorCode = null;
        this.modalOrganizationObject.dunsNumber = null;
        this.modalOrganizationObject.dodacNumber = null;
        this.modalOrganizationObject.cageNumber = null;
        this.modalOrganizationObject.country = null;
        this.modalOrganizationObject.countryCode = null;
        this.contactElasticOptions.defaultValue = '';
        this.clearContactField = new String('true');
        this.countrySearchOptions.defaultValue = null;
        this.clearCountryField = new String('true');
        this.districtOptions.defaultValue = null;
        this.clearDistField = new String('true');
        if (this.modalOrganizationObject.congressionalDistrict) {
            this.resetCongressionalDistrictObj();
        }
    }

    resetCongressionalDistrictObj() {
        const CONG_DIST_OBJ = {
            congDistrictCode: null,
            description: null,
            isActive: 'Y'
        };
        this.modalOrganizationObject.congressionalDistrict = deepCloneObject(CONG_DIST_OBJ);
        this.manuallyAddedDistricts.congressionalDistrict = deepCloneObject(CONG_DIST_OBJ);
    }

    deleteOrganization() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._proposalHomeService.deleteProposalOrganization(this.orgDeleteId).subscribe(
                    () => {
                        this.result.proposalOrganizations.splice(this.editIndex, 1);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Organization deleted successfully.');
                        this.isSaving = false;
                        this.editIndex = null;
                        this._dataStore.manualDataUpdate({ proposalOrganizations: this.result.proposalOrganizations });
                    },
                    (err) => {
                        this.isSaving = false;
                        this.editIndex = null;
                    }
                )
            );
        }
    }

    countrySelectFunction(event: any) {
        if (event && event.countryCode) {
            this.modalOrganizationObject.country = {};
            this.modalOrganizationObject.country.countryName = event.countryName;
            this.modalOrganizationObject.country.countryCode = event.countryCode;
            this.modalOrganizationObject.countryCode = event.countryCode;
        } else {
            this.modalOrganizationObject.country = null;
            this.modalOrganizationObject.countryCode = null;
        }
    }

    getOrganizationDetails(index: number) {
        this.viewOrganizationDetails = this.result.proposalOrganizations[index];
    }

    getContactDetails(rolodexId) {
        this.isRolodexViewModal = true;
        this.personDescription = null;
          this.id = rolodexId;
          this.type = 'ROLODEX';
    }
    setPersonRolodexModalView(personRolodexObject) {
        this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
      }

    getFullAddress(data: any) {
        let fullAddress;
        if (data.rolodex.addressLine1) {
            fullAddress = data.rolodex.addressLine1;
        } else if (data.rolodex.addressLine1 && data.rolodex.addressLine2) {
            fullAddress = (data.rolodex.addressLine1 + ',' + ' ' + data.rolodex.addressLine2);
        } else if (data.rolodex.addressLine1 && data.rolodex.addressLine2 && data.rolodex.addressLine3) {
            fullAddress = (data.rolodex.addressLine1 + ',' + ' ' + data.rolodex.addressLine2 + ',' + ' ' + data.rolodex.addressLine3);
        } else {
            fullAddress = null;
        }
        return fullAddress;
    }

    checkForDuplicateDistrict(event: any) {
        let isDuplicate;
        if (this.organizationObject.proposalCongDistricts.length > 0 && event.searchString) {
            isDuplicate = !!this.organizationObject.proposalCongDistricts.find(
                (element) => element.congressionalDistrict.description === event.searchString);
        } else {
            isDuplicate = !!this.organizationObject.proposalCongDistricts.find(
                (element) => element.congressionalDistrict.congDistrictCode === event.congDistrictCode);
        }
        if (isDuplicate) {
            this.map.set('duplicateDistrictExist', 'duplicateDistrictExist');
            return false;
        } else {
            this.map.delete('duplicateDistrictExist');
            return true;
        }
    }

    districtSelectFunction(event: any) {
        if (event) {
            this.districtObj.proposalCongDistrictId = null;
            this.districtObj.congDistrictCode = event.congDistrictCode;
            this.districtObj.congressionalDistrict = event;
            if (this.checkForDuplicateDistrict(event)) {
                this.organizationObject.proposalCongDistricts.push(JSON.parse(JSON.stringify(this.districtObj)));
            }
            this.districtHttpOptions.defaultValue = '';
            this.clearDistrictField = new String('true');
        } else {
            this.districtObj.congDistrictCode = null;
            this.districtObj.congressionalDistrict = null;
        }
    }

    addDistrictToDatabase(event: any) {
        if (event) {
            this.manuallyAddedDistricts.proposalCongDistrictId = null;
            this.manuallyAddedDistricts.congDistrictCode = null;
            this.manuallyAddedDistricts.congressionalDistrict.description = event.searchString;
            if (this.checkForDuplicateDistrict(event)) {
                this.organizationObject.proposalCongDistricts.push(JSON.parse(JSON.stringify(this.manuallyAddedDistricts)));
            }
            this.districtHttpOptions.defaultValue = '';
            this.clearDistrictField = new String('true');
        } else {
            this.manuallyAddedDistricts.congressionalDistrict['description'] = null;
        }
    }

    districtSelectionFromAddModal(event: any, isNewValue = false) {
        this.resetCongressionalDistrictObj();
        if (isNewValue) {
            this.manuallyAddedDistricts.congressionalDistrict.congDistrictCode = null;
            this.manuallyAddedDistricts.congressionalDistrict.description = event ? event.searchString : null;
        } else {
            this.modalOrganizationObject.congressionalDistrict.congDistrictCode = event ? event.congDistrictCode : null;
            this.modalOrganizationObject.congressionalDistrict.description = event ? event.description : null;
        }
    }

    deleteSelectedDistrict(chip: any, index: number) {
        if (chip.proposalCongDistrictId && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._proposalHomeService.deleteProposalCongDistrict(chip.proposalCongDistrictId).subscribe(
                    () => {
                        this.organizationObject.proposalCongDistricts.splice(index, 1);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'District deleted successfully.');
                        this.isSaving = false;
                    },
                    (err) => {
                        this.isSaving = false;
                    }
                )
            );
        } else {
            this.organizationObject.proposalCongDistricts.splice(index, 1);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'District deleted successfully.');
        }
    }

    contactSelectFunction(event: any) {
        this.modalOrganizationObject.contactAddressId = event ? parseInt(event.rolodex_id, 10) : null;
        this.modalOrganizationObject.contactPersonName = event ? event.full_name : null;
    }

    setShowElasticResults(elasticResultShow) {
        this.isShowPersonResultCard = elasticResultShow.isShowElasticResults;
      }

    switchToNonEmployeeModal() {
        this.hideAddOrganizationModal();
        this.isAddNonEmployeeModal = true;
    }

    hideAddOrganizationModal() {
        $('#add-organization-modal').modal('hide');
    }

}
