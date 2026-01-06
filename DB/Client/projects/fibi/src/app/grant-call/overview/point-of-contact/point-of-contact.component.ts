import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { PointOfContactService } from './point-of-contact.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { GrantCommonDataService } from '../../services/grant-common-data.service';
import { CommonService } from '../../../common/services/common.service';
import { PointOfContact } from '../../grant-call-interfaces';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';

declare var $: any;
@Component({
    selector: 'app-point-of-contact',
    templateUrl: './point-of-contact.component.html',
    styleUrls: ['./point-of-contact.component.css']
})
export class PointOfContactComponent implements OnInit, OnDestroy {

    @Input() result: any = {};
    @Input() mode: any = {};

    pointOfContactObject = new PointOfContact();
    elasticSearchOptions: any = {};
    isPOCEmployeeChecked = true;
    clearField: String;
    pocObject: any = {};
    deleteIndex: any;
    pocId: any;
    isElasticError = false;
    POCWarningMsg: any;
    POCMailWarningMsg: any;
    showAddToAddressBookModal = false;
    warningMessage = new Map();
    isEditIndex: number = null;
    isRolodexViewModal = false;
    type = 'PERSON';
    isTraining = false;
    rolodexId: string;
    personDescription: string;
    selectedContactMember: any = {};
    isShowElasticResults = false;
    isSaving = false;
    $subscriptions: Subscription[] = [];

    constructor(private _elasticService: ElasticConfigService,
                private _pocService: PointOfContactService,
                private _commonData: GrantCommonDataService,
                public commonService: CommonService,
                private _elasticConfig: ElasticConfigService) { }

    ngOnInit() {
        this.pocObject.isShowAddPointOfContact = true;
        this.pocObject.POCEmail = 'support@polussoftware.com';
        this.elasticSearchOptions = this._elasticService.getElasticForPerson();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /** assigns selected elastic search result to an object
     * @param value
     */
    selectedPOC(value) {
        if (value) {
            this.selectedContactMember = value;
            this.isShowElasticResults = true;
            if (this.isEditIndex) {
                this.pointOfContactObject = deepCloneObject(this.result.grantCallContacts[this.isEditIndex]);
            }
            this.pointOfContactObject.fullName = value.full_name;
            this.pointOfContactObject.email = this.isPOCEmployeeChecked ? (this.result.grantCallPocDefaultMail ?
                this.result.grantCallPocDefaultMail : value.email_addr) : value.email_address;
            this.pointOfContactObject.mobile = this.isPOCEmployeeChecked ? value.phone_nbr : value.phone_number;
            this.pointOfContactObject.designation = this.isPOCEmployeeChecked ? value.primary_title : value.designation;
            this.pointOfContactObject.personId = this.isPOCEmployeeChecked ? value.prncpl_id : value.rolodex_id;
        } else {
            this.pointOfContactObject = new PointOfContact();
            this.isElasticError = false;
            this.POCWarningMsg = null;
            this.isShowElasticResults = false;
        }
    }

    onPersonTypeChange() {
        this.selectedPOC(null);
        this.setPersonSearchOptions();
    }

    setPersonSearchOptions(): void {
        this.elasticSearchOptions = this.isPOCEmployeeChecked ?
            this._elasticConfig.getElasticForPerson() : this._elasticConfig.getElasticForRolodex();
    }

    /** add point of contact after validations */
    addPointOfContact() {
        this.POCWarningMsg = null;
        this.POCMailWarningMsg = null;
        if (!this.pointOfContactObject.fullName) {
            this.isElasticError = true;
            this.POCWarningMsg = 'Please choose a person';
        } else {
            this.validatePerson();
        }
    }

    validatePerson() {
        if (this.pointOfContactObject.fullName.length > 0) {
            this.validateEmailAddress();
            this.getPersonDataDetails();
        }
    }

    /** shows a warning message if the email address is not valid. */
    validateEmailAddress() {
        if (this.pointOfContactObject.email != null && this.pointOfContactObject.email !== '') {
            this.POCMailWarningMsg = !this.invalidMailOrNot(this.pointOfContactObject.email) ?
                'Please enter a valid email address' : null;
        }
    }

    /** email input validation */
    invalidMailOrNot(mail) {
        // tslint:disable-next-line:max-line-length
        if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            .test(mail)) {
            return (true);
        }
        return (false);
    }

    getPersonDataDetails() {
        if (this.checkForPersonDuplication()) {
            this.isElasticError = true;
            this.POCWarningMsg = 'You have already added the same person';
        } else if (!this.POCMailWarningMsg && !this.POCWarningMsg) {
            this.fetchContactData();
            this.pocObject.isDataChange = true;
        }
    }

    isDuplicate(POC) {
        return (POC.personId === this.pointOfContactObject.personId) ? true : false;
    }

    checkForPersonDuplication() {
        for (const POC of this.result.grantCallContacts) {
            if (this.isDuplicate(POC)) {
                if (!POC.grantContactId || POC.grantContactId !== this.pointOfContactObject.grantContactId) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    /** sets the point of contact object and fetches the contact details of the selected person. */
    fetchContactData() {
        this.isElasticError = false;
        this.pointOfContactObject.isEmployee = this.isPOCEmployeeChecked;
        this.pointOfContactObject.grantCallId = this.result.grantCall.grantCallId;
        this.getContactDetails();
    }

    getContactDetails() {
        if (this.warningMessage.size == 0 && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._pocService.addPointOfContactData(
                { 'grantCallContact': this.pointOfContactObject, 'grantCallId': this.result.grantCallId }).subscribe(data => {
                    this.result.grantCallContacts = data;
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, this.isEditIndex !== null ?
                        'Point of Contact updated successfully.' : 'Point of Contact added successfully.');
                    this.updateGrantCallStoreData();
                    this.resetPointOfContactFields();
                    $('#add-point-of-contact-modal').modal('hide');
                    this.pointOfContactObject = new PointOfContact();
                    this.isSaving = false;
                }, err => {
                    this.isSaving = false;
                    this.commonService.showToast(HTTP_ERROR_STATUS, (this.isEditIndex !== null) ?
                        ('Updating Point of Contact failed. Please try again.') : ('Adding Point of Contact failed. Please try again.'));
                }));
        }
    }

    /**
    * setup grant call common data the values that changed after the service call need to be updatedinto the store.
    * every service call wont have all the all the details as reponse so
    * we need to cherry pick the changes and update them to the store.
    */
    updateGrantCallStoreData() {
        this.result = deepCloneObject(this.result);
        this._commonData.setGrantCallData(this.result);
    }

    fetchPersonDetails(pointOfContactObj) {
        this.isRolodexViewModal = true;
        this.personDescription = null;
        this.type = pointOfContactObj.isEmployee ? 'PERSON' : 'ROLODEX';
        this.rolodexId = pointOfContactObj.personId;
    }

    setPersonRolodexModalView(personRolodexObject) {
        this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
        this.type = 'PERSON';
    }

    setPOCObject(pocId, pocIndex) {
        this.deleteIndex = pocIndex;
        this.pocId = pocId;
    }

    deletePOC() {
        this.$subscriptions.push(this._pocService.deleteGrantCallContact({
            'grantCallId': this.result.grantCall.grantCallId,
            'grantContactId': this.pocId
        }).subscribe(data => {
            this.POCWarningMsg = null;
            this.result.grantCallContacts.splice(this.deleteIndex, 1);
            this.updateGrantCallStoreData();
        },
            _ => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Removing Point of Contact failed. Please try again.');
            },
            () => {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Point of Contact removed successfully.');
            }));
    }

    /** Bind the value of rolodex to elastic search field after adding new non employee
   * @param {} rolodexObject
   */
    setRolodexTeamObject(rolodexObject) {
        if (rolodexObject.rolodex) {
            this.isElasticError = false;
            this.POCWarningMsg = null;
            this.clearField = new String('false');
            this.elasticSearchOptions.defaultValue = rolodexObject.rolodex.fullName;
            this.pointOfContactObject.fullName = rolodexObject.rolodex.fullName;
            this.pointOfContactObject.email = rolodexObject.rolodex.emailAddress;
            this.pointOfContactObject.mobile = rolodexObject.rolodex.phoneNumber;
            this.pointOfContactObject.personId = rolodexObject.rolodex.rolodexId;
            this.pointOfContactObject.designation = rolodexObject.rolodex.designation;
            this.isShowElasticResults = true;
            this.selectedContactMember = rolodexObject.rolodex;
        }
        this.showAddToAddressBookModal = rolodexObject.nonEmployeeFlag;
        $('#add-point-of-contact-modal').modal('show');
    }

    inputRestriction(input) {
        this.warningMessage.clear();
        // tslint:disable-next-line:max-line-length
        const pattern = (/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[0-9]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/);
        if (!pattern.test(input)) {
            this.checkForInvalidPhoneNumber(input);
        }
    }

    checkForInvalidPhoneNumber(input) {
        if (/^[a-zA-Z]+$/.test(input)) {
            this.warningMessage.set('phoneNumberWarningAlphabets', 'Alphabets cannot be added in  Phone number field.');
        } else {
            this.warningMessage.set('phoneNumberWarning', 'Please add a valid number');
        }
    }

    /**
     * To fetch value from html table to controls for editing POC
     * @param index Id of the selected row
     */
    editPointOfContact(index) {
        this.isEditIndex = index;
        this.pointOfContactObject = deepCloneObject(this.result.grantCallContacts[index]);
        this.isPOCEmployeeChecked = this.pointOfContactObject.isEmployee;
        if (this.isPOCEmployeeChecked) {
            this.elasticSearchOptions = this._elasticService.getElasticForPerson();
        } else {
            this.elasticSearchOptions = this._elasticService.getElasticForRolodex();
        }
        this.elasticSearchOptions.defaultValue = this.pointOfContactObject.fullName;
        this.elasticSearchOptions = Object.assign({}, this.elasticSearchOptions);
        this.clearField = new String('false');
        this.isElasticError = false;
        this.POCWarningMsg = null;
    }

    /**
     * Reset details after save
     */
    resetPointOfContactFields() {
        this.pointOfContactObject = new PointOfContact();
        this.isPOCEmployeeChecked = true;
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.POCWarningMsg = null;
        this.POCMailWarningMsg = null;
        this.isElasticError = false;
        this.isShowElasticResults = false;
        this.isEditIndex = null;
        this.warningMessage.clear();
    }

    setShowElasticResults(elasticResultShow) {
        this.isShowElasticResults = elasticResultShow.isShowElasticResults;
    }

    switchToNonEmployeeModal() {
        this.showAddToAddressBookModal = true;
        this.hidePointOfContactModal();
    }

    hidePointOfContactModal() {
        $('#add-point-of-contact-modal').modal('hide');
    }

}
