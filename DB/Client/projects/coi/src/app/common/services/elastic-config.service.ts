import { Injectable } from '@angular/core';
import {
    ELASTIC_FIBI_PERSON_OUTPUT_FORMAT, ELASTIC_ENTITY_FORMAT,
    ELASTIC_COI_OUTPUT_FORMAT,
    ELASTIC_ROLODEX_PERSON_OUTPUT_FORMAT,
    ELASTIC_AWARD_OUTPUT_FORMAT,
    ELASTIC_PROPOSAL_OUTPUT_FORMAT,
    ELASTIC_IP_OUTPUT_FORMAT,
    ELASTIC_GRANT_OUTPUT_FORMAT,
    ENTITY_DOCUMENT_STATUS_TYPE,
    ENTITY_VERIFICATION_STATUS,
    ELASTIC_ENTITY_DISPLAY_FIELDS,
    ELASTIC_ENTITY_SEARCH_FIELDS
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
    boost?: any;
    constructor(url) {
        this.url = url;
    }
}
@Injectable()
export class ElasticConfigService {
    url = '';
    deployMap = environment.deployUrl;
    indexValue = '';

    constructor() { }

    getElasticForPerson() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.contextField = 'full_name';
        elasticSearchOption.index = 'fibiperson' + this.indexValue;
        elasticSearchOption.type = 'person';
        elasticSearchOption.formatString = ELASTIC_FIBI_PERSON_OUTPUT_FORMAT;
        elasticSearchOption.fields = {
            prncpl_id: {}, full_name: {}, prncpl_nm: {}, email_addr: {},
            unit_display_name : {}, addr_line_1: {}, phone_nbr: {},
            is_faculty: {}, is_research_staff: {}
        };
        elasticSearchOption.size = 50;
        elasticSearchOption.boost = {'full_name' : 5};
        return elasticSearchOption;
    }

    getElasticForActiveVerifiedEntity() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.contextField = 'entity_name';
        elasticSearchOption.index = 'entity' + this.indexValue;
        elasticSearchOption.type = 'entity';
        elasticSearchOption.formatString = ELASTIC_ENTITY_FORMAT;
        elasticSearchOption.fields = ELASTIC_ENTITY_SEARCH_FIELDS;
        elasticSearchOption.formatFields = ELASTIC_ENTITY_DISPLAY_FIELDS;
        const elasticSearchOptionFilter = JSON.parse(JSON.stringify(elasticSearchOption));
        elasticSearchOptionFilter.extraConditions = {};
        elasticSearchOptionFilter.extraConditions = {
            must_not: [
              { match_phrase: { document_status_type_code: ENTITY_DOCUMENT_STATUS_TYPE.INACTIVE } },
              { match_phrase: { document_status_type_code: ENTITY_DOCUMENT_STATUS_TYPE.DUPLICATE } },
              { match_phrase: { entity_status_code: ENTITY_VERIFICATION_STATUS.UNVERIFIED } },
              { match_phrase: { entity_status_code: ENTITY_VERIFICATION_STATUS.MODIFYING } },
              { match_phrase: { version_status: 'ARCHIVE' } },
              { match_phrase: { version_status: 'PENDING' } }
            ]
          };
        return JSON.parse(JSON.stringify(elasticSearchOptionFilter));
    }

    getElasticForActiveEntity() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.contextField = 'entity_name';
        elasticSearchOption.index = 'entity' + this.indexValue;
        elasticSearchOption.type = 'entity';
        elasticSearchOption.formatString = ELASTIC_ENTITY_FORMAT;
        elasticSearchOption.fields = ELASTIC_ENTITY_SEARCH_FIELDS;
        elasticSearchOption.formatFields = ELASTIC_ENTITY_DISPLAY_FIELDS;
        const elasticSearchOptionFilter = JSON.parse(JSON.stringify(elasticSearchOption));
        elasticSearchOptionFilter.extraConditions = {};
        elasticSearchOptionFilter.extraConditions = {
            must_not: [
                { match_phrase: { version_status: 'ARCHIVE' } },
                { match_phrase: { version_status: 'PENDING' } }
            ]
        };
        return JSON.parse(JSON.stringify(elasticSearchOptionFilter));
    }

    getElasticForAllEntity() {
        const elasticSearchOption = new ElasticOption(this.url);
        elasticSearchOption.contextField = 'entity_name';
        elasticSearchOption.index = 'entity' + this.indexValue;
        elasticSearchOption.type = 'entity';
        elasticSearchOption.formatString = ELASTIC_ENTITY_FORMAT;
        elasticSearchOption.fields = ELASTIC_ENTITY_SEARCH_FIELDS;
        elasticSearchOption.formatFields = ELASTIC_ENTITY_DISPLAY_FIELDS;
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

}
