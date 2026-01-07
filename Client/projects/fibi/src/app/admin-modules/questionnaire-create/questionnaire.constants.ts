export const Constants = {
    newQuestion : {
        'QUESTION_ID': 1,
        'QUESTION': '',
        'DESCRIPTION': null,
        'HELP_LINK': null,
        'ANSWER_TYPE': 'Radio',
        'ANSWER_LENGTH': null,
        'NO_OF_ANSWERS': 1,
        'LOOKUP_TYPE': null,
        'LOOKUP_NAME': null,
        'LOOKUP_FIELD': null,
        'GROUP_NAME': 'G0',
        'GROUP_LABEL': null,
        'HAS_CONDITION': 'N',
        'SHOW_QUESTION': false,
        'COMPLETION_FLAG': null,
        'ANSWERS': {},
        'QUESTIONNAIRE_ID': null,
        'ATTACHMENT_ID': null,
        'QUESTIONNAIRE_ANSWER_ID': null,
        'QUESTIONNAIRE_ANSWER_HEADER_ID': null,
        'ANSWER_NUMBER': null,
        'ANSWER_LOOKUP_CODE': null,
        'EXPLANATION': null,
        'UPDATE_TIMESTAMP': null,
        'UPDATE_USER': null,
        'AC_TYPE': 'I',
        'HIDE_QUESTION': false,
        'QUESTION_NUMBER': null,
        'QUESTION_VERSION_NUMBER': 0,
        'PARENT_QUESTION_ID': null,
        'NEW_VALUE': true
    },
    newOption : {
        'QUESTION_OPTION_ID': null,
        'OPTION_NUMBER': null,
        'QUESTION_ID': null,
        'EXPLANTION_LABEL': null,
        'OPTION_LABEL': null,
        'REQUIRE_EXPLANATION': null,
        'AC_TYPE': 'I',
    },
    newCondition : {
        'GROUP_NAME': null,
        'CONDITION_TYPE': 'EQUALS',
        'QUESTION_CONDITION_ID': null,
        'CONDITION_VALUE': null,
        'QUESTION_ID': null,
        'AC_TYPE': 'I',
    },
    editorConfig: {
        'editable': true,
        'spellcheck': true,
        'height': '100px',
        'minHeight': '0',
        'width': 'auto',
        'minWidth': '0',
        'translate': 'yes',
        'enableToolbar': true,
        'showToolbar': true,
        'placeholder': 'Enter text here...',
        'imageEndPoint': '',
        'toolbar': [
            ['bold', 'italic', 'underline', 'superscript', 'subscript'],
            ['fontName', 'fontSize', 'color'],
            ['justifyLeft', 'justifyCenter', 'justifyRight'],
            ['paragraph', 'blockquote', 'removeBlockquote', 'horizontalLine', 'orderedList', 'unorderedList'],
        ]
      },
      newUsage : {
        'QUESTIONNAIRE_USAGE_ID': null,
        'AC_TYPE': 'I',
        'MODULE_ITEM_CODE': null,
        'MODULE_SUB_ITEM_CODE': null,
        'QUESTIONNAIRE_ID': null,
        'QUESTIONNAIRE_LABEL': null,
        'IS_MANDATORY': false,
        'RULE_ID': null,
        'RULE': null,
        'MODULE_NAME': '',
        'SUB_MODULE_NAME': '',
        'SORT_ORDER': null,
      }
};


export const SearchConstants = {

    person: [
        { key: 'Principle Name', value: 'prncpl_nm' },
        { key: 'Full Name', value: 'full_name' },
        { key: 'Principal Id', value: 'prncpl_id' }
    ],

    rolodex: [
        { key: 'Full Name', value: 'full_name' },
        { key: 'Rolodex Id', value: 'rolodex_id' }
    ],

    award: [
        { key: 'Award Number', value: 'award_number' },
        { key: 'Award Title', value: 'title' },
        { key: 'LeadUnit Number', value: 'lead_unit_number' },
        { key: 'LeadUnit Name', value: 'lead_unit_name' },
    ],

    instituteproposal: [
        { key: 'Proposal Title', value: 'title' },
        { key: 'Proposal Id', value: 'proposal_id' },
        { key: 'Proposal Type', value: 'proposal_type' },
        { key: 'Proposal Number', value: 'proposal_number' }
    ],

    proposal: [

        { key: 'Proposal Id', value: 'proposal_id' },
        { key: 'Proposal Title', value: 'title' },
        { key: 'Full Name', value: 'full_name' },
        { key: 'Proposal Type', value: 'type' },
    ],

    grantcallElastic: [

        { key: 'GrantHeader Id', value: 'grant_header_id' },
        { key: 'Grantcall Title', value: 'title' },
        { key: 'Grant Type', value: 'grant_type' },
    ],

    sponsor: [

        { key: 'Sponsor Name', value: 'sponsorName' },
        { key: 'Sponsor Code', value: 'sponsorCode' },
    ],

    leadUnit: [

        { key: 'Unit Name', value: 'unitName' },
        { key: 'Unit Number', value: 'unitNumber' },
        { key: 'Unit Detail', value: 'unitDetail' },
    ],

    organization: [

        { key: 'Organization Id', value: 'organizationId' },
        { key: 'Organization Name', value: 'organizationName' },
    ],

    country: [

        { key: 'Country Code', value: 'countryCode' },
        { key: 'Country Name', value: 'countryName' },
    ],

    department: [

        { key: 'Unit Number', value: 'unitNumber' },
        { key: 'Unit Detail', value: 'unitDetail' },
        { key: 'Unit Name', value: 'unitName' },
    ],

    profitCenter: [

        { key: 'Profit Center Code', value: 'profitCenterCode' },
        { key: 'Profit Center Name', value: 'profitCenterName' }
    ],

    grantCodeName: [

        { key: 'Grantcode Code', value: 'grantCode' },
        { key: 'Grantcode Name', value: 'grantCodeName' },
        { key: 'Grantcode Type', value: 'grantType' }
    ],

    costCenter: [

        { key: 'Cost Center Code', value: 'costCenterCode' },
        { key: 'Cost Center Name', value: 'costCenterName' }

    ],

    fundCenter: [

        { key: 'Fund Center Code', value: 'fundCenterCode' },
        { key: 'Fund Center Name', value: 'fundCenterName' }
    ],
    
    claimTemplate: [

        { key: 'Claim Code', value: 'claimTemplateCode' },
        { key: 'Claim Template Name', value: 'description' }
    ]

};
