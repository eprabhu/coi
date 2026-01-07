import { Injectable } from '@angular/core';
import {
    ELASTIC_FIBI_PERSON_OUTPUT_FORMAT, ELASTIC_AWARD_OUTPUT_FORMAT,
    ELASTIC_ROLODEX_PERSON_OUTPUT_FORMAT,
    ELASTIC_IP_OUTPUT_FORMAT, ELASTIC_PROPOSAL_OUTPUT_FORMAT, ELASTIC_GRANT_OUTPUT_FORMAT,
    ELASTIC_COI_OUTPUT_FORMAT, ELASTIC_IACUC_OUTPUT_FORMAT, ELASTIC_IRB_OUTPUT_FORMAT,
    ELASTIC_AGREEMENT_OUTPUT_FORMAT, ELASTIC_ORGANIZATION_OUTPUT_FORMAT, ELASTIC_EXTERNAL_REVIEWER_OUTPUT_FORMAT
} from '../../app-constants';
import { environment } from '../../../environments/environment';

class ElasticOption {
    url: string;
    formatString: string;
    fields: any;
    index: string;
    type: string;
    contextField: string;
    icons: any;
    formatFields: any;
    size: number;
    extraConditions?: object;
    constructor(url) {
        this.url = url;
    }
}
@Injectable()
export class ElasticConfigService {
    url = '';
    deployMap = environment.deployUrl;

    constructor() { }

    getElasticForPerson() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.contextField = 'full_name';
        elasticSearchOption.index = 'coiperson_prod';
        elasticSearchOption.type = 'person';
        elasticSearchOption.formatString = ELASTIC_FIBI_PERSON_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            prncpl_id: {}, full_name: {}, prncpl_nm: {}, email_addr: {},
            unit_number: {}, unit_name: {}, addr_line_1: {}, phone_nbr: {},
            is_faculty: {}, is_research_staff: {}
        };
        elasticSearchOption.size = 50;
        return elasticSearchOption;
    }

    getElasticForRolodex() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'fibirolodex';
        elasticSearchOption.type = 'rolodex';
        elasticSearchOption.contextField = 'full_name';
        elasticSearchOption.formatString = ELASTIC_ROLODEX_PERSON_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            first_name: {}, middle_name: {}, full_name: {},
            last_name: {}, organization: {}, rolodex_id: {}, email_address: {}, create_user: {}
        };
        elasticSearchOption.formatFields = {
            first_name: {}, middle_name: {}, full_name: {}, organization: {},
            last_name: {}, rolodex_id: {}, email_address: {}, create_user: {}
        };

        elasticSearchOption.icons = {
            organization:
            '<span><img src="' + this.deployMap + 'assets/images/org-icon-6.svg" class="mr-2"></span>'
            };
        elasticSearchOption.size = 50;
        return elasticSearchOption;
    }

    getElasticForOrganization() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'fibirolodex';
        elasticSearchOption.type = 'rolodex';
        elasticSearchOption.contextField = 'organization';
        elasticSearchOption.formatString = ELASTIC_ORGANIZATION_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            organization: {}, rolodex_id: {},
            email_address: {}, create_user: {}, address: {}
        };
        elasticSearchOption.formatFields = {
            full_name: {}, organization: {}, rolodex_id: {},
            email_address: {}, create_user: {}, address: {}
        };
        elasticSearchOption.icons = {
            organization:
                '<span><img src="' + this.deployMap + 'assets/images/org-icon-6.svg" class="mr-2"></span>',
            full_name: '<i aria-hidden="true" class="fa fa-user-circle text-danger mr-2"></i>'
        };
        elasticSearchOption.size = 50;
        return elasticSearchOption;
    }


    getElasticForAward() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'awardfibi';
        elasticSearchOption.type = 'award';
        elasticSearchOption.contextField = 'award_number';
        elasticSearchOption.formatString = ELASTIC_AWARD_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            award_number: {}, pi_name: {}, sponsor: {}, account_number: {},
            lead_unit_number: {}, lead_unit_name: {}, title: {}, grant_call_name: {}
        };
        return elasticSearchOption;
    }

    getElasticForIP() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'instituteproposal';
        elasticSearchOption.type = 'institute_proposal';
        elasticSearchOption.contextField = 'title';
        elasticSearchOption.formatString = ELASTIC_IP_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            proposal_id: {}, title: {}, pi_full_name: {}, lead_unit_name: {},
            activity_type: {}, proposal_type: {}, status: {}, sponsor: {}, proposal_number: {}
        };
        const elasticSearchOptionFilter = JSON.parse(JSON.stringify(elasticSearchOption));
        elasticSearchOptionFilter.extraConditions = {};
        elasticSearchOptionFilter.extraConditions = {must_not: {match_phrase: {proposal_sequence_status: 'ARCHIVE'}}};
        return JSON.parse(JSON.stringify(elasticSearchOptionFilter));
    }

    getElasticForProposal() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'fibiproposal';
        elasticSearchOption.type = 'fibiproposal';
        elasticSearchOption.contextField = 'proposal_id';
        elasticSearchOption.formatString = ELASTIC_PROPOSAL_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            proposal_id: {}, title: {}, full_name: {}, category: {},
            type: {}, status: {}, sponsor: {}, lead_unit_name: {}
        };
        const elasticSearchOptionFilter = JSON.parse(JSON.stringify(elasticSearchOption));
        elasticSearchOptionFilter.extraConditions = {};
        elasticSearchOptionFilter.extraConditions = {must_not: {term: {status_code: '35'}}};
        return JSON.parse(JSON.stringify(elasticSearchOptionFilter));
    }

    getElasticForGrantCall() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'grantcall';
        elasticSearchOption.type = 'grantcall';
        elasticSearchOption.contextField = 'title';
        elasticSearchOption.formatString = ELASTIC_GRANT_OUTPUT_FORMAT;
        elasticSearchOption.fields = { grant_header_id: {}, title: {}, grant_type: {}, status: {}, sponsor: {}, funding_scheme: {} };
        return elasticSearchOption;
    }

    getElasticForCoi() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'coifibi';
        elasticSearchOption.type = 'coi';
        elasticSearchOption.contextField = 'coi_disclosure_number';
        elasticSearchOption.formatString = ELASTIC_COI_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            coi_disclosure_number: {}, full_name: {}, disclosure_disposition: {},
            disclosure_status: {}, module_item_key: {}
        };
        return elasticSearchOption;
    }

    getElasticForIacuc() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'iacucfibi';
        elasticSearchOption.type = 'iacuc';
        elasticSearchOption.contextField = 'protocol_number';
        elasticSearchOption.formatString = ELASTIC_IACUC_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            protocol_number: {}, title: {}, lead_unit_number: {}, lead_unit_name: {},
            status: {}, person_name: {}, protocol_type: {}
        };
        return elasticSearchOption;
    }

    getElasticForIrb() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'irbfibi';
        elasticSearchOption.type = 'irb';
        elasticSearchOption.contextField = 'protocol_number';
        elasticSearchOption.formatString = ELASTIC_IRB_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            protocol_number: {}, title: {}, lead_unit_number: {},
            status: {}, lead_unit_name: {}, person_name: {}
        };
    }
    getElasticForAgreement() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'agreementfibi';
        elasticSearchOption.type = 'agreement';
        elasticSearchOption.contextField = 'agreement_request_id';
        elasticSearchOption.formatString = ELASTIC_AGREEMENT_OUTPUT_FORMAT;
        elasticSearchOption.fields = { agreement_request_id: {}, title: {}, agreement_type: {}, unit_name: {},
										agreement_status: {}, principal_person_full_name: {}, aa_person_full_name: {},
										sponsor_name: {},  requestor_full_name: {}};
        return elasticSearchOption;
    }


    getElasticForExternalReviewer() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.index = 'fibireviewer';
        elasticSearchOption.type = 'reviewer';
        elasticSearchOption.contextField = 'full_name';
        elasticSearchOption.formatString = ELASTIC_EXTERNAL_REVIEWER_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            prncpl_id: {}, full_name: {}, prncpl_nm: {}, email_addr: {}, country_name: {},
            aff_description: {}, country_code: {}, aff_code: {}, sk_description: {}, last_name: {}, academic_rank: {}, hindex: {},
        };
        const elasticSearchOptionFilter = JSON.parse(JSON.stringify(elasticSearchOption));
        elasticSearchOptionFilter.extraConditions = {};
        elasticSearchOptionFilter.extraConditions = {must_not: {match_phrase: {reviewer_status: 'I'}}};
        return JSON.parse(JSON.stringify(elasticSearchOptionFilter));
    }

}
