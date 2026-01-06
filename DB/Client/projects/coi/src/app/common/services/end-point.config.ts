import { DEFAULT_ENDPOINT_FETCH_LIMIT, LEAD_UNIT_OUTPUT_FORMAT } from "../../app-constants";
import { EndPointOptions } from "../../shared-components/shared-interface";
import { deepCloneObject } from "../utilities/custom-utilities";

const END_POINT_OPTIONS: any = {
    contextField: '',
    formatString: '',
    path: '',
    defaultValue: '',
    params: '',
    filterFields: ''
};

/**this function will return params after
 * setting fetchLimit, if no fetchLimit is given 
 * in params, then DEFAULT_ENDPOINT_FETCH_LIMIT 
 * will set, otherwise passed value will be used.
 **/
export function getParams(params) {
    if (params && !params.hasOwnProperty('fetchLimit')) {
        params['fetchLimit'] = DEFAULT_ENDPOINT_FETCH_LIMIT;
    }
    return params;
}

export function getEndPointOptionsForCoiAwardNumber(baseUrl = '') {
    END_POINT_OPTIONS.contextField = 'title';
    END_POINT_OPTIONS.formatString = 'moduleItemKey | accountNumber | title | sponsor | sponsorAwardNumber | unitName | PrincipalInvestigator';
    END_POINT_OPTIONS.path = baseUrl + '/' + 'loadAwardsForDisclosure';
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = null;
    return JSON.parse(JSON.stringify(END_POINT_OPTIONS));
}

export function getEndPointOptionsForProposalDisclosure(baseUrl = '') {
    END_POINT_OPTIONS.contextField = 'title';
    END_POINT_OPTIONS.formatString = '#moduleItemId - title';
    END_POINT_OPTIONS.path = baseUrl + '/' + 'loadProposalsForDisclosure';
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = null;
    return JSON.parse(JSON.stringify(END_POINT_OPTIONS));
}

export function getEndPointOptionsForProjects(baseUrl = '', moduleCode: string | number) {
    END_POINT_OPTIONS.contextField = 'projectNumber - projectTitle';
    END_POINT_OPTIONS.formatString = '#projectNumber - projectTitle';
    END_POINT_OPTIONS.path = baseUrl + '/' + `cmp/plan/project/summary`;
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = { moduleCode };
    return JSON.parse(JSON.stringify(END_POINT_OPTIONS));
}

export function getEndPointOptionsForStates(baseUrl = '', params = {}): EndPointOptions {
    END_POINT_OPTIONS.contextField = 'stateName';
    END_POINT_OPTIONS.formatString = 'stateName';
    END_POINT_OPTIONS.path = baseUrl + '/' + 'findState';
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = getParams(params);
    return JSON.parse(JSON.stringify(END_POINT_OPTIONS));
}

export function getEndPointOptionsForCaAdmin(baseUrl = ''): EndPointOptions {
    END_POINT_OPTIONS.contextField = 'fullName';
    END_POINT_OPTIONS.formatString = 'fullName';
    END_POINT_OPTIONS.path = baseUrl + '/coiCustom/' + 'findContractAdministrators';
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = null;
    return JSON.parse(JSON.stringify(END_POINT_OPTIONS));
}

export function getEndPointOptionsForOrganization(baseUrl = '', params = null): EndPointOptions {
    END_POINT_OPTIONS.contextField = 'organizationId - organizationName';
    END_POINT_OPTIONS.formatString = 'organizationId - organizationName';
    END_POINT_OPTIONS.path = baseUrl + '/coiCustom/' + 'findOrganizations';
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = params;
    return JSON.parse(JSON.stringify(END_POINT_OPTIONS));
}

export function getEndPointOptionsForLoggedPersonUnit(baseUrl = ''): EndPointOptions {
    END_POINT_OPTIONS.contextField = LEAD_UNIT_OUTPUT_FORMAT;
    END_POINT_OPTIONS.formatString = LEAD_UNIT_OUTPUT_FORMAT;
    END_POINT_OPTIONS.path = baseUrl + '/reviewerDashboard/units';
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = null;
    return JSON.parse(JSON.stringify(END_POINT_OPTIONS));
}

export function getEndPointOptionsForOPAPerson(baseUrl = ''): EndPointOptions {
    END_POINT_OPTIONS.contextField = 'personFullName';
    END_POINT_OPTIONS.formatString = 'personFullName';
    END_POINT_OPTIONS.path = baseUrl + '/personDisclRequirement/opaPersonSearch';
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = null;
    return deepCloneObject(END_POINT_OPTIONS);
}
