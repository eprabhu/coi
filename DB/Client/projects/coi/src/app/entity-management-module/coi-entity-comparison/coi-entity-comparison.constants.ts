import { EntityComparisonFieldConfig } from "./coi-entity-comparison.interface";


export const ENTITY_FIELD_CONFIGS: EntityComparisonFieldConfig[] = [
    {
        labelName: 'Entity Name',
        objectName: 'entityDetails?.entityName',
        class: 'col-md-12 col-lg-6',
        type: 'TEXT'
    },
    {
        labelName: 'Ownership Type',
        objectName: 'entityDetails?.entityOwnershipType?.description',
        class: 'col-md-12 col-lg-3',
        type: 'LOOKUP'
    },
    {
        labelName: 'Country',
        objectName: 'entityDetails?.country?.countryName',
        class: 'col-md-12 col-lg-3',
        type: 'LOOKUP'
    },
    {
        labelName: 'Primary Address',
        class: 'col-12 mt-3',
        type: 'SUB_HEAD',
        fieldConfig: [
            {
                labelName: 'Address Line 1',
                objectName: 'entityDetails?.primaryAddressLine1',
                class: 'col-12',
                type: 'TEXT'
            },
            {
                labelName: 'Address Line 2',
                objectName: 'entityDetails?.primaryAddressLine2',
                class: 'col-12',
                type: 'TEXT'
            },
            {
                labelName: 'City',
                objectName: 'entityDetails?.city',
                class: 'col-md-12 col-lg-4',
                type: 'TEXT'
            },
            {
                labelName: 'State/Province/Region',
                objectName: 'entityDetails?.stateDetails?.stateName',
                alternativeObjectName: 'entityDetails?.state',
                class: 'col-md-12 col-lg-4',
                type: 'LOOKUP'
            },
            {
                labelName: 'ZIP/Postal Code',
                objectName: 'entityDetails?.postCode',
                class: 'col-md-12 col-lg-4',
                type: 'TEXT'
            },
        ]
    },
    {
        labelName: 'Phone',
        objectName: 'entityDetails?.phoneNumber',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Email Address',
        objectName: 'entityDetails?.certifiedEmail',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Website',
        objectName: 'entityDetails?.websiteAddress',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'DUNS Number',
        objectName: 'entityDetails?.dunsNumber',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'UEI Number',
        objectName: 'entityDetails?.ueiNumber',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'CAGE Number',
        objectName: 'entityDetails?.cageNumber',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Human Subject Assurance',
        objectName: 'entityDetails?.humanSubAssurance',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Animal Welfare Assurance',
        objectName: 'entityDetails?.anumalWelfareAssurance',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'AAALAC (Animal Accreditation)',
        objectName: 'entityDetails?.animalAccreditation',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
];

export const ENTITY_OTHER_DETAILS_FIELD_CONFIGS: EntityComparisonFieldConfig[] = [
    {
        labelName: 'Start Date',
        objectName: 'entityDetails?.startDate',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'DATE',
        pipe: 'dateFormatter'
    },
    {
        labelName: 'Incorporation Date',
        objectName: 'entityDetails?.incorporationDate',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'DATE',
        pipe: 'dateFormatter'
    },
    {
        labelName: 'Incorporation In',
        objectName: 'entityDetails?.incorporatedIn',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'LOOKUP'
    },
    {
        labelName: 'Currency',
        objectName: 'entityDetails?.currencyCode',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Congressional District',
        objectName: 'entityDetails?.congressionalDistrict',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Federal Employer ID',
        objectName: 'entityDetails?.federalEmployerId',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Prior Name(s)',
        objectName: 'priorNames',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Foreign Name(s)',
        objectName: 'foreignNames',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Entity Short Name',
        objectName: 'entityDetails?.shortName',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Number of Employees',
        objectName: 'entityDetails?.numberOfEmployees',
        class: 'col-md-12 col-lg-6 col-xl-6',
        type: 'TEXT'
    },
    {
        labelName: 'Entity Business Type',
        objectName: 'entityDetails?.entityBusinessType?.description',
        class: 'col-md-12 col-lg-6 col-xl-6',
        type: 'TEXT'
    },
    {
        labelName: 'Activity Text',
        objectName: 'entityDetails?.activityText',
        class: 'col-12',
        type: 'TEXT'
    },
];

export const SPONSOR_DETAILS_FIELDS_CONFIG: EntityComparisonFieldConfig[] = [
    {
        labelName: 'Sponsor Code',
        objectName: 'sponsorDetailsResponseDTO?.sponsorCode',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'TEXT'
    },
    {
        labelName: 'Sponsor Acronym',
        objectName: 'sponsorDetailsResponseDTO?.acronym',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'LOOKUP'
    },
    {
        labelName: 'Sponsor Type',
        objectName: 'sponsorDetailsResponseDTO?.sponsorType?.description',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'LOOKUP'
    },
    {
        labelName: 'Sponsor Name',
        objectName: 'sponsorDetailsResponseDTO?.sponsorName',
        class: 'col-xl-8 col-lg-8 col-md-6 col-sm-12 col-12',
        type: 'LOOKUP'
    },
    {
        labelName: 'Country',
        objectName: 'sponsorDetailsResponseDTO?.country?.countryName',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'LOOKUP'
    },
    {
        labelName: 'Sponsor Address',
        class: 'col-12 mt-3',
        type: 'SUB_HEAD',
        fieldConfig: [
            {
                labelName: 'Address Line 1',
                objectName: 'sponsorDetailsResponseDTO?.primaryAddressLine1',
                class: 'col-12',
                type: 'TEXT'
            },
            {
                labelName: 'Address Line 2',
                objectName: 'sponsorDetailsResponseDTO?.primaryAddressLine2',
                class: 'col-12',
                type: 'TEXT'
            },
            {
                labelName: 'City',
                objectName: 'sponsorDetailsResponseDTO?.city',
                class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
                type: 'TEXT'
            },
            {
                labelName: 'State/Province/Region',
                objectName: 'sponsorDetailsResponseDTO?.stateDetails?.stateName',
                alternativeObjectName: 'sponsorDetailsResponseDTO?.state',
                class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
                type: 'LOOKUP'
            },
            {
                labelName: 'ZIP/Postal Code',
                objectName: 'sponsorDetailsResponseDTO?.postCode',
                class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
                type: 'TEXT'
            },
        ]
    },
    {
        labelName: 'Phone',
        objectName: 'sponsorDetailsResponseDTO?.phoneNumber',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'TEXT'
    },
    {
        labelName: 'Email Address',
        objectName: 'sponsorDetailsResponseDTO?.emailAddress',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'TEXT'
    },
    {
        labelName: 'Translated Name',
        objectName: 'sponsorDetailsResponseDTO?.translatedName',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'TEXT'
    },
    {
        labelName: 'DUNS Number',
        objectName: 'sponsorDetailsResponseDTO?.dunsNumber',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'TEXT'
    },
    {
        labelName: 'UEI Number',
        objectName: 'sponsorDetailsResponseDTO?.ueiNumber',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'TEXT'
    },
    {
        labelName: 'CAGE Number',
        objectName: 'sponsorDetailsResponseDTO?.cageNumber',
        class: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12',
        type: 'TEXT'
    },
    {
        labelName: 'Sponsor Comments',
        objectName: 'sponsorDetailsResponseDTO?.comments',
        class: 'col-12',
        type: 'TEXT'
    }
];

export const ORGANIZATION_DETAILS_FIELDS_CONFIG: EntityComparisonFieldConfig[] = [
    {
        labelName: 'Organization ID',
        objectName: 'subAwdOrgDetailsResponseDTO?.organizationId',
        class: 'col-md-12 col-lg-6',
        type: 'TEXT'
    },
    {
        labelName: 'Organization Type',
        objectName: 'subAwdOrgDetailsResponseDTO?.entityOrganizationType?.description',
        class: 'col-md-12 col-lg-6',
        type: 'LOOKUP'
    },
    {
        labelName: 'Organization Name',
        objectName: 'subAwdOrgDetailsResponseDTO?.organizationName',
        class: 'col-md-12 col-lg-6',
        type: 'TEXT'
    },
    {
        labelName: 'Country',
        objectName: 'subAwdOrgDetailsResponseDTO?.country?.countryName',
        class: 'col-md-12 col-lg-3',
        type: 'LOOKUP'
    },
    {
        labelName: 'Organization Address',
        class: 'col-12 mt-3',
        type: 'SUB_HEAD',
        fieldConfig: [
            {
                labelName: 'Address Line 1',
                objectName: 'subAwdOrgDetailsResponseDTO?.primaryAddressLine1',
                class: 'col-12',
                type: 'TEXT'
            },
            {
                labelName: 'Address Line 2',
                objectName: 'subAwdOrgDetailsResponseDTO?.primaryAddressLine2',
                class: 'col-12',
                type: 'TEXT'
            },
            {
                labelName: 'City',
                objectName: 'subAwdOrgDetailsResponseDTO?.city',
                class: 'col-md-12 col-lg-4',
                type: 'TEXT'
            },
            {
                labelName: 'State/Province/Region',
                objectName: 'subAwdOrgDetailsResponseDTO?.stateDetails?.stateName',
                alternativeObjectName: 'subAwdOrgDetailsResponseDTO?.state',
                class: 'col-md-12 col-lg-4',
                type: 'LOOKUP'
            },
            {
                labelName: 'ZIP/Postal Code',
                objectName: 'subAwdOrgDetailsResponseDTO?.postCode',
                class: 'col-md-12 col-lg-4',
                type: 'TEXT'
            },
        ]
    },
    {
        labelName: 'DUNS Number',
        objectName: 'subAwdOrgDetailsResponseDTO?.dunsNumber',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'UEI Number',
        objectName: 'subAwdOrgDetailsResponseDTO?.ueiNumber',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'CAGE Number',
        objectName: 'subAwdOrgDetailsResponseDTO?.cageNumber',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Human Subject Assurance',
        objectName: 'subAwdOrgDetailsResponseDTO?.humanSubAssurance',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Animal Welfare Assurance',
        objectName: 'subAwdOrgDetailsResponseDTO?.animalWelfareAssurance',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'AAALAC (Animal Accreditation)',
        objectName: 'subAwdOrgDetailsResponseDTO?.animalAccreditation',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Phone',
        objectName: 'subAwdOrgDetailsResponseDTO?.phoneNumber',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'NUMBER'
    },
    {
        labelName: 'Incorporation Date',
        objectName: 'subAwdOrgDetailsResponseDTO?.incorporatedDate',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'DATE',
        pipe: 'dateFormatter'
    },
    {
        labelName: 'Incorporation In',
        objectName: 'subAwdOrgDetailsResponseDTO?.incorporatedIn',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Congressional District',
        objectName: 'subAwdOrgDetailsResponseDTO?.congressionalDistrict',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Federal Employer ID',
        objectName: 'subAwdOrgDetailsResponseDTO?.federalEmployerId',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'TEXT'
    },
    {
        labelName: 'Number of Employees',
        objectName: 'subAwdOrgDetailsResponseDTO?.numberOfEmployees',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'NUMBER'
    },
    {
        labelName: 'SAM Expiration Date',
        objectName: 'subAwdOrgDetailsResponseDTO?.samExpirationDate',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'DATE',
        pipe: 'dateFormatterWithTimeZone'
    },
    {
        labelName: 'Sub-award Risk Assessment Date',
        objectName: 'subAwdOrgDetailsResponseDTO?.subAwdRiskAssmtDate',
        class: 'col-md-12 col-lg-6 col-xl-4',
        type: 'DATE',
        pipe: 'dateFormatterWithTimeZone'
    },
];

export const COMPLIANCE_DETAILS_FIELDS_CONFIG: EntityComparisonFieldConfig[] = [
    {
        labelName: 'COI Entity Type',
        objectName: 'complianceInfo?.coiEntityType?.description',
        class: 'col-12',
        type: 'TEXT'
    }
];
