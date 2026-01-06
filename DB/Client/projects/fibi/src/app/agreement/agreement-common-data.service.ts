import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Subject } from 'rxjs';
import { CommonService } from '../common/services/common.service';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class AgreementCommonDataService {

    isAgreementDataChange = false;
    $agreementData = new BehaviorSubject<any>(null);
    $questionnaireData = new Subject();
    $locationChange = new Subject();
    isShowSaveButton = false;
    startDate = null;
    endDate = null;

    constructor(private _commonService: CommonService, private _route: ActivatedRoute) { }

    setAgreementData(agreementData) {
        this.$agreementData.next(agreementData);
    }

    getAgreementMode() {
        if (!this._route.snapshot.queryParamMap.get('agreementId')) {
            return this.$agreementData.getValue().agreementHeader.agreementStatusCode !== '1' ? false : true;
        } else {
            return this.isModifyAgreementRightAvailable();
        }
    }
    
    isModifyAgreementRightAvailable() {
        return (this.$agreementData.getValue().availableRights.includes('AGREEMENT_ADMINISTRATOR') ||
            this.$agreementData.getValue().availableRights.includes('MODIFY_ALL_AGREEMENT') ||
            this._commonService.getCurrentUserDetail('personID') === this.$agreementData.getValue().agreementHeader.requestorPersonId ||
            this.checkForPI() || this.checkForNegotiator())
            && (this.$agreementData.getValue().agreementHeader.agreementStatusCode === '1' ||
                this.$agreementData.getValue().agreementHeader.agreementStatusCode === '6') ? true : false;
    }

    /** People type id of PI is 3 */
    checkForPI() {
        const PI = this.$agreementData.getValue().agreementPeoples.find(person => person.peopleTypeId == 3);
        return PI && PI.personId === this._commonService.getCurrentUserDetail('personID') ? true : false; 
    }

    /** People type id of Negotiator is 2 */
    checkForNegotiator() {
        const NEGOTIATOR = this.$agreementData.getValue().agreementPeoples.find(person => person.peopleTypeId == 2);
        return NEGOTIATOR && NEGOTIATOR.personId === this._commonService.getCurrentUserDetail('personID') ? true : false; 
    }

    getStatusPermission() {
        return this.$agreementData.getValue().agreementHeader.agreementStatusCode !== '1' ? true : false;
    }

   
    /**
     * @param sectionCode
     * @param fieldCode
     * set sectionCodes to SECTIONCODES object
     * if section code and field code are available,then check the field is editable or not
     * if only section code is available then it returns the section as editable.
     * if section code is not available then check agreement mode
     */
    getSectionEditPermission(sectionCode = null, fieldCode = null) {
        const SECTIONCODES = this.$agreementData.getValue().sectionCodes || {};
        if (this.checkSectionCode(SECTIONCODES, sectionCode)) {
            return (fieldCode) ? this.checkFieldCode(SECTIONCODES[sectionCode], fieldCode) : true;
        } else {
            return this.getAgreementMode();
        }
    }
    /**
     * @param fieldArray
     * @param fieldCode
     * if field array contains field code then that field is editable
     * otherwise check agreement mode
     */
    checkFieldCode(fieldArray, fieldCode) {
       return fieldArray.includes(fieldCode) ? true : this.getAgreementMode();
    }
    /**
     * @param SECTIONCODES
     * @param sectionCode
     * returns true if the sectionCode is in the SECTIONCODES Object otherwise false.
     */
    checkSectionCode(SECTIONCODES, sectionCode) {
       return Object.keys(SECTIONCODES).includes(sectionCode);
    }
}
