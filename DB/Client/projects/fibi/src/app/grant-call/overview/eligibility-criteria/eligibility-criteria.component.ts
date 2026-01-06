import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { EligibilityCriteriaService } from './eligibility-criteria.service';
import { GrantCommonDataService } from '../../services/grant-common-data.service';
import { CommonService } from '../../../common/services/common.service';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';

declare var $: any;
@Component({
    selector: 'app-eligibility-criteria',
    templateUrl: './eligibility-criteria.component.html',
    styleUrls: ['./eligibility-criteria.component.css']
})
export class EligibilityCriteriaComponent implements OnInit, OnDestroy {

    @Input() result: any = {};
    @Input() mode: any = {};

    selectedEligibilityCriteria = null;
    selectedEligibilityType = null;
    elasticForEligibilitySearchOptions: any = {};
    selectedEligibilityTarget = null;
    clearFieldsEligibilityPerson: String;
    eligibilityValidation: any = {};
    selectedTarget: any = {};
    deptHttpOptions: any = {};
    deleteIndex: any;
    grantEligibilityId: any;
    clearDeptField: String;
    personRoles: any = [];
    isEligibilityWarning = false;
    isShowEligibility = true;
    isEditIndex: number;
    eligibilityObject: any = [];
    grantCallEligibilityId = null;
    grantEligibilityTargetId = null;
    isSaving = false;
    $subscriptions: Subscription[] = [];

    constructor(private _elasticService: ElasticConfigService,
                private _eligibilityService: EligibilityCriteriaService,
                private _commonData: GrantCommonDataService,
                public commonService: CommonService) { }

    ngOnInit() {
        this.personRoles = this.result.grantCallPersonRoles.filter(role => role.isMultiPi !== null);
        this.isShowEligibility = true;
        this.elasticForEligibilitySearchOptions = this._elasticService.getElasticForPerson();

    }
    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    addEligibility() {
        const tempObj: any = {};
        this.isEligibilityWarning = false;
        if (this.validateEligibilities()) {
            if (this.selectedEligibilityCriteria && this.selectedEligibilityType) {
                this.eligibilityRepetitionCheck();
                if (!this.isEligibilityWarning && !this.isSaving) {
                    this.saveEligibilityObject(tempObj);
                }
            }
        }
    }

    eligibilityRepetitionCheck() {
        this.result.grantCallEligibilities.forEach(value => {
            if (this.selectedEligibilityType.hasTarget) {
                if (value.proposalPersonRole.description === this.selectedEligibilityCriteria.description &&
                    (this.isEditIndex != null && value.grantEligibilityId !== this.eligibilityObject.grantEligibilityId || this.isEditIndex == null) &&
                    value.grantCallEligibilityType.description === this.selectedEligibilityType.description &&
                    value.grantEligibilityTarget.grantEligibiltyTargetType.eligibilityTargetTypeCode ===
                    this.selectedEligibilityTarget.eligibilityTargetTypeCode &&
                    value.grantEligibilityTarget.targetValueDescription === this.selectedTarget.targetValueDescription) {
                    this.isEligibilityWarning = true;
                }
                if (value.proposalPersonRole.description === this.selectedEligibilityCriteria.description &&
                    (this.isEditIndex != null && value.grantEligibilityId !== this.eligibilityObject.grantEligibilityId || this.isEditIndex == null) &&
                    value.grantCallEligibilityType.description === this.selectedEligibilityType.description &&
                    value.grantEligibilityTarget.grantEligibiltyTargetType.eligibilityTargetTypeCode ===
                    this.selectedEligibilityTarget.eligibilityTargetTypeCode && !this.selectedTarget.targetValueDescription) {
                    this.isEligibilityWarning = true;
                }
            } else {
                if (value.proposalPersonRole.description === this.selectedEligibilityCriteria.description &&
                    (this.isEditIndex != null && value.grantEligibilityId !== this.eligibilityObject.grantEligibilityId || this.isEditIndex == null) &&
                    value.grantCallEligibilityType.description === this.selectedEligibilityType.description) {
                    this.isEligibilityWarning = true;
                }
            }
            if (this.selectedEligibilityType.grantEligibilityTypeCode === value.grantCallEligibilityType.grantEligibilityTypeCode &&
                (this.isEditIndex != null && value.grantEligibilityId !== this.eligibilityObject.grantEligibilityId || this.isEditIndex == null) &&
                !this.selectedTarget.targetValueDescription && !this.selectedEligibilityType.description) {
                this.isEligibilityWarning = true;
            }
        });
    }

    saveEligibilityObject(tempObj) {
        this.isSaving = true;
        if (this.grantCallEligibilityId !== null) {
            tempObj.grantEligibilityId = this.grantCallEligibilityId;
        }
        tempObj.personId = this.selectedEligibilityCriteria.id;
        tempObj.grantCallId = this.result.grantCall.grantCallId;
        tempObj.proposalPersonRole = this.selectedEligibilityCriteria;
        tempObj.grantEligibilityTypeCode = this.selectedEligibilityType.grantEligibilityTypeCode;
        tempObj.grantCallEligibilityType = this.selectedEligibilityType;
        tempObj.updateTimestamp = new Date().getTime();
        tempObj.updateUser = this.commonService.getCurrentUserDetail('userName');
        tempObj.grantEligibilityTarget = (this.selectedEligibilityType && this.selectedEligibilityType.hasTarget) ? {} : null;
        if (this.selectedEligibilityType.hasTarget) {
            this.isEligibilityTargetPresent(tempObj);
        }
        this.$subscriptions.push(this._eligibilityService.addGrantCallEligibility({
            'grantCallId': this.result.grantCall.grantCallId,
            'grantCallEligibility': tempObj,
            'updateUser': this.commonService.getCurrentUserDetail('userName')
        }).subscribe(data => {
            this.result.grantCallEligibilities = data;
            this.updateGrantCallStoreData();
        },
            _ => {
                this.isSaving = false;
                this.commonService.showToast(HTTP_ERROR_STATUS, (this.isEditIndex !== null ? 'Updating' : 'Adding') + ' Eligibility failed. Please try again.');
            },
            () => {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Eligibility' + (this.isEditIndex !== null ? ' updated ' : ' added ') + 'successfully');
                $('#add-eligibility-modal').modal('hide');
                this.resetEligibilityFields();
                this.isSaving = false;
            }));
    }

    isEligibilityTargetPresent(tempObj) {
        tempObj.grantEligibilityTarget.grantEligibilityTargetId = this.grantEligibilityTargetId ? this.grantEligibilityTargetId : null;
        tempObj.grantEligibilityTarget.eligibilityTargetTypeCode = this.selectedEligibilityTarget.eligibilityTargetTypeCode;
        tempObj.grantEligibilityTarget.targetCategoryTypeCode = this.selectedEligibilityTarget.categoryTypeCode;
        tempObj.grantEligibilityTarget.targetCategoryType = this.selectedEligibilityTarget.description;
        tempObj.grantEligibilityTarget.grantEligibiltyTargetType = this.selectedEligibilityTarget;
        if (this.selectedEligibilityTarget.eligibilityTargetTypeCode === '2' ||
            this.selectedEligibilityTarget.eligibilityTargetTypeCode === '3') {
            tempObj.grantEligibilityTarget.targetValue = this.selectedTarget.targetValue;
            tempObj.grantEligibilityTarget.targetValueDescription = this.selectedTarget.targetValueDescription;
        }
        tempObj.grantEligibilityTarget.updateTimestamp = new Date().getTime();
        tempObj.grantEligibilityTarget.updateUser = this.commonService.getCurrentUserDetail('userName');
    }

    validateEligibilities() {
        this.eligibilityValidation = {};
        if (!this.selectedEligibilityCriteria || this.selectedEligibilityCriteria === 'null') {
            this.eligibilityValidation.criteriaMsg = 'Criteria is required';
        }
        if ((!this.selectedEligibilityType || this.selectedEligibilityType === 'null')) {
            this.eligibilityValidation.requirementMsg = 'Requirement is required';
        }
        if (this.selectedEligibilityType && this.selectedEligibilityType.hasTarget &&
            (!this.selectedEligibilityTarget || this.selectedEligibilityTarget === 'null')) {
            this.eligibilityValidation.targetMsg = 'Target is required';
        }
        if (this.selectedEligibilityType && this.selectedEligibilityType.hasTarget && this.selectedEligibilityTarget !== null
            && this.selectedEligibilityTarget.eligibilityTargetTypeCode == '2' && this.selectedTarget !== null &&
            (!this.selectedTarget.targetValue || this.selectedTarget.targetValue === 'null')) {
            this.eligibilityValidation.unitMsg = 'Unit is required';
        }
        if (this.selectedEligibilityType && this.selectedEligibilityType.hasTarget && this.selectedEligibilityTarget !== null
            && this.selectedEligibilityTarget.eligibilityTargetTypeCode == '3' && this.selectedTarget !== null &&
            (!this.selectedTarget.targetValue || this.selectedTarget.targetValue === 'null')) {
            this.eligibilityValidation.personMsg = 'Person is required';
        }
        return (this.isEmptyObject(this.eligibilityValidation)) ? true : false;
    }

    isEmptyObject(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    selectedPerson($event) {
        if ($event !== null) {
            this.selectedTarget = {};
            this.selectedTarget.targetValue = $event.prncpl_id;
            this.selectedTarget.targetValueDescription = $event.full_name;
            this.eligibilityValidation.personMsg = '';
        } else {
            this.selectedTarget.targetValue = null;
        }
    }
    getSelectedDepartment($event) {
        if ($event !== null) {
            this.selectedTarget = {};
            this.selectedTarget.targetValue = $event.unitNumber;
            this.selectedTarget.targetValueDescription = $event.unitName;
            this.eligibilityValidation.unitMsg = '';
        } else {
            this.selectedTarget.targetValue = null;
        }
    }

    selectedCriteria() {
        if (this.selectedEligibilityCriteria !== null) {
            this.eligibilityValidation.criteriaMsg = '';
        }
    }

    selectedRequirement() {
        if (this.selectedEligibilityType !== null) {
            this.eligibilityValidation.requirementMsg = '';
            this.selectedEligibilityTarget = null;
        }
    }

    selectedTargetType() {
        if (this.selectedEligibilityTarget !== null) {
            this.eligibilityValidation.targetMsg = '';
            this.deptHttpOptions = getEndPointOptionsForDepartment();
            this.elasticForEligibilitySearchOptions = this._elasticService.getElasticForPerson();
            this.eligibilityValidation.personMsg = null;
            this.eligibilityValidation.unitMsg = null;
        }
    }

    setEligibilityDeleteObject(grantEligibilityId, index) {
        this.grantEligibilityId = grantEligibilityId;
        this.deleteIndex = index;
    }

    deleteEligibilityCriteria() {
        this.$subscriptions.push(this._eligibilityService.deleteGrantCallEligibility({
            'grantCallId': this.result.grantCall.grantCallId,
            'grantEligibilityId': this.grantEligibilityId
        }).subscribe(() => {
            this.result.grantCallEligibilities.splice(this.deleteIndex, 1);
            this.updateGrantCallStoreData();
        },
            _ => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Removing Eligibility failed. Please try again.');
            },
            () => {
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Eligibility removed successfully.');
            }));
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

    editEligibility(eligibility, index) {
        this.isEditIndex = index;
        this.eligibilityObject = eligibility;
        this.grantCallEligibilityId = this.eligibilityObject.grantEligibilityId;
        this.setLookupFind(eligibility);
        if (this.selectedEligibilityType != null && this.selectedEligibilityType.hasTarget) {
            this.grantEligibilityTargetId = this.eligibilityObject.grantEligibilityTarget.grantEligibilityTargetId;
        }
        if (this.selectedEligibilityTarget) {
            if (this.selectedEligibilityTarget.eligibilityTargetTypeCode == 3 && this.selectedEligibilityType.hasTarget == true && this.selectedEligibilityType != null) {
                this.elasticForEligibilitySearchOptions.defaultValue = this.eligibilityObject.grantEligibilityTarget.targetValueDescription;
                this.selectedTarget.targetValue = this.eligibilityObject.grantEligibilityTarget.targetValue;
                this.deptHttpOptions.defaultValue = '';
            } else if (this.selectedEligibilityTarget.eligibilityTargetTypeCode == 2 && this.selectedEligibilityType.hasTarget == true && this.selectedEligibilityType != null) {
                this.deptHttpOptions.defaultValue = this.eligibilityObject.grantEligibilityTarget.targetValueDescription;
                this.elasticForEligibilitySearchOptions.defaultValue = '';
                this.selectedTarget.targetValue = this.eligibilityObject.targetValue;
            } else {
                this.deptHttpOptions.defaultValue = null;
                this.elasticForEligibilitySearchOptions.defaultValue = null;
            }
        }
    }

    setLookupFind(eligibility) {
        const resultOfEligibility = eligibility;
        this.selectedEligibilityCriteria = resultOfEligibility.proposalPersonRole ?
            this.personRoles.find(role => role.id === resultOfEligibility.proposalPersonRole.id) : null;
        this.selectedEligibilityType = resultOfEligibility.grantCallEligibilityType ?
            this.result.grantCallEligibilityTypes.find(type =>
                type.grantEligibilityTypeCode === resultOfEligibility.grantCallEligibilityType.grantEligibilityTypeCode) : null;
        if (this.selectedEligibilityType != null && this.selectedEligibilityType.hasTarget) {
            this.selectedEligibilityTarget = resultOfEligibility.grantEligibilityTarget.grantEligibiltyTargetType ?
                this.result.grantEligibiltyTargetTypes.find(target =>
                    target.eligibilityTargetTypeCode === resultOfEligibility.grantEligibilityTarget.grantEligibiltyTargetType.eligibilityTargetTypeCode) : null;
        }
    }

    resetEligibilityFields() {
        this.isEditIndex = null;
        this.grantCallEligibilityId = null;
        this.selectedEligibilityCriteria = null;
        this.selectedEligibilityType = null;
        this.selectedEligibilityTarget = null;
        this.deptHttpOptions.defaultValue = '';
        this.grantEligibilityTargetId = null;
        this.isEligibilityWarning = false;
        this.selectedTarget = {};
        this.elasticForEligibilitySearchOptions = this._elasticService.getElasticForPerson();
        this.eligibilityValidation = {};
    }

}
