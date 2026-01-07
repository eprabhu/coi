import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import {
    getEndPointOptionsForCostCentre, getEndPointOptionsForCountry, getEndPointOptionsForDepartment, getEndPointOptionsForFundCentre,
    getEndPointOptionsForGrandCode, getEndPointOptionsForLeadUnit, getEndPointOptionsForOrganization, getEndPointOptionsForProfitCentre,
    getEndPointOptionsForSponsor, getEndPointOptionsForKeyWords, getEndPointOptionsForRole
} from '../../../../common/services/end-point.config';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { BusinessRuleService } from '../../common/businessrule.service';
import { FunctionArgument, FunctionArgumentDetails, FunctionDetails } from '../rule-interfaces';

declare var $: any;

@Component({
    selector: 'app-rule-function-parameters',
    templateUrl: './rule-function-parameters.component.html',
    styleUrls: ['./rule-function-parameters.component.css']
})
export class RuleFunctionParametersComponent implements OnInit, OnDestroy {

    @Input() functionDetailsInput: Observable<FunctionDetails>;
    @Output() emitArguments: EventEmitter<any> = new EventEmitter<any>();

    functionDetails: FunctionDetails = new FunctionDetails();
    $subscriptions: Subscription[] = [];
    functionParameterData: FunctionArgumentDetails = new FunctionArgumentDetails();
    setFocusToElement = setFocusToElement;
    parseDateWithoutTimestamp = parseDateWithoutTimestamp;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    elasticSearchOptions: any = {};
    endPointSearchOptions: any = {};
    isDataChange = false;
    validationMap = new Map();

    searchObjectMapping = {
        'fibiPerson': 'prncpl_id',
        'awardFibi': 'award_number',
        'fibiProposal': 'proposal_id',
        'instituteProposal': 'proposal_id',
        'grantcall_elastic': 'grant_header_id',
        'sponsorName': 'sponsorCode',
        'unitName': 'unitNumber',
        'fibiOrganization': 'organizationId',
        'fibiCountry': 'countryCode',
        'fibiDepartment': 'unitNumber',
        'grantCodeName': 'grantCode',
        'costCenterName': 'costCenterCode',
        'fundCenterName': 'fundCenterCode',
        'profitCenterName': 'profitCenterCode',
        'keyWords': 'code',
        'fibiRole' : 'roleId'
    };
    searchDefaultValueMapping = {
        'fibiPerson': 'full_name',
        'awardFibi': 'title',
        'fibiProposal': 'title',
        'instituteProposal': 'title',
        'grantcall_elastic': 'title',
        'sponsorName': 'sponsorName',
        'unitName': 'unitName',
        'fibiOrganization': 'organizationName',
        'fibiCountry': 'countryName',
        'fibiDepartment': 'unitName',
        'grantCodeName': 'grantDetails',
        'costCenterName': 'costCenterDetails',
        'fundCenterName': 'fundCenterDetails',
        'profitCenterName': 'profitCenterDetails',
        'keyWords': 'description',
        'fibiRole' : 'roleName'
    };

    constructor(
        private _ruleService: BusinessRuleService,
        public _commonService: CommonService,
        private _elasticConfig: ElasticConfigService
    ) { }

    ngOnInit() {
        this.getFunctionDetails();
    }

    getFunctionDetails(): void {
        this.$subscriptions.push(
            this.functionDetailsInput.subscribe((data: any) => {
                if (data) {
                    this.validationMap.clear();
                    this.functionDetails = data;
                    (!this.functionDetails.singleRule.FUNCTION_PARAMETERS || !this.functionDetails.singleRule.FUNCTION_PARAMETERS.length) ?
                        this.getFunctionParameters() : this.getExistingFunctionParameters();
                }
            })
        );
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getExistingFunctionParameters(): void {
        this.functionParameterData.functionArguments = this.functionDetails.singleRule.FUNCTION_PARAMETERS;
        this.functionParameterData.functionName = this.functionDetails.singleRule.LVALUE;
        this.setDefaultParameterValues();
    }

    getFunctionParameters(): void {
        this.$subscriptions.push(
            this._ruleService.getFunctionParameters(this.functionDetails.functionName)
                .subscribe((data: any) => {
                    this.functionParameterData = data;
                    this.functionDetails.singleRule.FUNCTION_PARAMETERS = this.functionParameterData.functionArguments;
                    this.setDefaultParameterValues();
                }));
    }

    setDefaultParameterValues(): void {
        this.setValueToParameters();
        this.setDefaultValues(this.functionParameterData.functionArguments);
        if (this.functionParameterData.functionArguments.length) {
            $('#add-function-parameters').modal('show');
        }
    }

    setValueToParameters(): void {
        if (this.functionDetails.singleRule.EXPRESSION_ARGUMENTS && this.functionDetails.singleRule.EXPRESSION_ARGUMENTS.length) {
            this.functionParameterData.functionArguments.forEach((parameter: any) => {
                const EXISTING_ARGUMENT = this.getExistingArgument(parameter.ARGUMENT_NAME);
                if (EXISTING_ARGUMENT) {
                    parameter.VALUE = EXISTING_ARGUMENT.VALUE;
                    parameter.VALUE_DESCRIPTION = EXISTING_ARGUMENT.VALUE_DESCRIPTION;
                    parameter.RULES_EXPERSSION_ID = EXISTING_ARGUMENT.RULES_EXPERSSION_ID;
                    parameter.RULE_ID = EXISTING_ARGUMENT.RULE_ID;
                }
                parameter.BUSINESS_RULE_EXP_ARGS_ID = EXISTING_ARGUMENT ? EXISTING_ARGUMENT.BUSINESS_RULE_EXP_ARGS_ID : 0;
            });
        }
    }

    getExistingArgument(value: string): FunctionArgument {
        return this.functionDetails.singleRule.EXPRESSION_ARGUMENTS.find((parameter: any) => parameter.ARGUMENT_NAME === value
            && parameter.FUNCTION_NAME === this.functionParameterData.functionName);
    }
    /**
    * @param  {} argumentList
    * sets the default value if any based on fieldType.
    */
    setDefaultValues(argumentList: Array<FunctionArgument>): void {
        argumentList.forEach(element => {
            switch (element.LOOKUP_TYPE) {
                case 'Elastic': this.setElasticOptions(element); break;
                case 'EndPoint': this.setEndpointOptions(element); break;
                case 'System': break;
                default: element.VALUE_DESCRIPTION = element.VALUE; break;
            }
        });
    }

    setElasticOptions(parameter: FunctionArgument): void {
        this.elasticSearchOptions[parameter.ARGUMENT_LABEL] = this.getElasticOptions(parameter);
        this.elasticSearchOptions[parameter.ARGUMENT_LABEL].defaultValue = parameter.VALUE_DESCRIPTION ?
            parameter.VALUE_DESCRIPTION : null;
    }

    getElasticOptions(parameter: FunctionArgument): any {
        switch (parameter.LOOKUP_WINDOW_NAME) {
            case 'fibiProposal': return this._elasticConfig.getElasticForProposal();
            case 'fibiPerson': return this._elasticConfig.getElasticForPerson();
            case 'awardFibi': return this._elasticConfig.getElasticForAward();
            case 'instituteProposal': return this._elasticConfig.getElasticForProposal();
            case 'grantcall_elastic': return this._elasticConfig.getElasticForGrantCall();
            default: return null;
        }
    }

    setEndpointOptions(parameter: FunctionArgument): void {
        this.endPointSearchOptions[parameter.ARGUMENT_LABEL] = this.getEndpointOptions(parameter);
        this.endPointSearchOptions[parameter.ARGUMENT_LABEL].defaultValue = parameter.VALUE_DESCRIPTION ?
            parameter.VALUE_DESCRIPTION : null;
    }

    getEndpointOptions(parameter: FunctionArgument): any {
        switch (parameter.LOOKUP_WINDOW_NAME) {
            case 'sponsorName': return getEndPointOptionsForSponsor();
            case 'unitName': return getEndPointOptionsForLeadUnit();
            case 'fibiDepartment': return getEndPointOptionsForDepartment();
            case 'fibiOrganization': return getEndPointOptionsForOrganization();
            case 'fibiCountry': return getEndPointOptionsForCountry();
            case 'profitCenterName': return getEndPointOptionsForProfitCentre();
            case 'grantCodeName': return getEndPointOptionsForGrandCode();
            case 'costCenterName': return getEndPointOptionsForCostCentre();
            case 'fundCenterName': return getEndPointOptionsForFundCentre();
            case 'keyWords': return getEndPointOptionsForKeyWords();
            case 'fibiRole': return getEndPointOptionsForRole();
            default: return null;
        }
    }

    setSearchFilterValue(data, parameter: FunctionArgument): void {
        if (data) {
            parameter.VALUE = data[this.searchObjectMapping[parameter.LOOKUP_WINDOW_NAME]] ?
                data[this.searchObjectMapping[parameter.LOOKUP_WINDOW_NAME]] : null;
            parameter.VALUE_DESCRIPTION = data[this.searchDefaultValueMapping[parameter.LOOKUP_WINDOW_NAME]];
        } else {
            parameter.VALUE = '';
        }
    }

    onLookupSelect(data: any, parameter: FunctionArgument): void {
        parameter.VALUE = data.length ? data[0].code : null;
        parameter.VALUE_DESCRIPTION = data.length ? data[0].description : null;
    }

    emitDataChange(): void {
        if (this.validateParameters()) {
            this.setExpressionArguments();
            $('#add-function-parameters').modal('hide');
            this.emitArguments.emit(this.functionDetails);
        }
    }

    setExpressionArguments(): void {
        this.mapFunctionArguments(this.functionParameterData.functionArguments);
        this.functionDetails.singleRule.EXPRESSION_ARGUMENTS = this.functionParameterData.functionArguments;
    }

    mapFunctionArguments(list: any = []): void {
        list.map((parameter: any) => {
            parameter.FUNCTION_NAME = this.functionParameterData.functionName;
        });
    }

    validateParameters(): boolean {
        this.validationMap.clear();
        this.functionParameterData.functionArguments.forEach((param: any) => {
            if (!param.VALUE) {
                this.validationMap.set(param.ARGUMENT_LABEL, '');
            }
        });
        return this.validationMap.size === 0;
    }

    clearFunctionDetails(): void {
        this.functionParameterData = new FunctionArgumentDetails();
        this.functionDetails = new FunctionDetails();
    }

}
