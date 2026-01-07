import { CompareType, Section } from './interfaces';

export const GeneralDetails: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'proposal',
    reviewSectionType: 'Object',
    reviewSectionUniqueFields: [],
    reviewSectionSubFields: ['grantCall.grantCallName', 'awardNumber', 'awardTitle',
        'title', 'proposalType.description', 'grantCallType.description', 'activityType.description',
        'awardType.description', 'sponsorName', 'startDate', 'endDate', 'duration', 'primeSponsorName',
        'externalFundingAgencyId', 'sponsorDeadlineDate', 'internalDeadLineDate', 'baseProposalNumber',
        'programAnnouncementNumber', 'abstractDescription', 'cfdaNumber', 'researchDescription', 'multiDisciplinaryDescription',
    ]
};

export const ProposalPersons: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'proposalPersons',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['fullName', 'proposalPersonRole.description', 'projectRole', 'personRoleId',
        'designation', 'percentageOfEffort', 'department'],
    reviewSectionUniqueFields: ['rolodexId', 'personId']
};

export const Organization: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'Organization',
    reviewSectionName: 'organization',
    reviewSectionType: 'object',
    reviewSectionSubFields: [],
    reviewSectionUniqueFields: ['organizationType','location', 'organizationName', 'organization.contactPersonName']
};

export const OrganizationContactDetails: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'Contact Details',
    reviewSectionName: 'contactDetails',
    reviewSectionType: 'object',
    reviewSectionSubFields: ['fullName', 'phoneNumber', 'address', 'postalCode', 'city',
        'countryName', 'state', 'designation'],
    reviewSectionUniqueFields: ['rolodexId', 'personId']
};

export const ProposalOrganization: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'Proposal Organization',
    reviewSectionName: 'proposalOrganizations',
    reviewSectionType: 'Array',
    reviewSectionSubFields: [ 'organization.contactPersonName', 'proposalCongDistricts'],
    reviewSectionUniqueFields: ['organizationType.description','organization.organizationName']
};

export const ProposalSpecialReviews: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'proposalSpecialReviews',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['protocolNumber', 'applicationDate', 'approvalDate', 'expirationDate', 'comments'],
    reviewSectionUniqueFields: ['specialReviewType.description', 'approvalType.description']
};

export const ProposalResearchAreas: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'proposalResearchAreas',
    reviewSectionType: 'Array',
    reviewSectionSubFields: [],
    reviewSectionUniqueFields: ['awardResearchType.description', 'researchTypeArea.description', 'researchTypeSubArea.description']
};


export const ProposalMilestones: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'proposalMileStones',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['startMonth', 'duration'],
    reviewSectionUniqueFields: ['mileStone']
};

export const ProposalKPI: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'proposalKpis',
    reviewSectionType: 'Array',
    reviewSectionSubFields: [],
    reviewSectionUniqueFields: ['kpiTypeCode']
};

export const ProposalAttachments: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'Attachments',
    reviewSectionName: 'proposalAttachments',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['description', 'narrativeStatus.description', 'lastUpdateUserFullName',
        'updateTimestamp', 'attachmentType.description'],
    reviewSectionUniqueFields: ['fileName']
};

export const ProposalKeyWords: CompareType = {
    reviewSectionCode: 300,
    reviewSectionDescription: 'ProposalKeyWords',
    reviewSectionName: 'proposal',
    reviewSectionType: 'Array',
    reviewSectionSubFields: [],
    reviewSectionUniqueFields: ['scienceKeywordCode', 'scienceKeyword.description', 'keyword']
};

export const ProposalBudgetOverview: CompareType = {
    reviewSectionCode: 308,
    reviewSectionDescription: 'Budget Overview',
    reviewSectionName: 'budgetHeader',
    reviewSectionType: 'Object',
    reviewSectionUniqueFields: [],
    reviewSectionSubFields: [ 'budgetStatus.description', 'comments',
         'isAutoCalc', 'campusFlag', 'startDate', 'endDate'
        , 'totalCost', 'totalDirectCost', 'totalIndirectCost', 'rateType.rateClassDescription',
        'underrecoveryRateType.rateClassDescription', 'totalModifiedDirectCost',
        'costSharingAmount', 'underrecoveryAmount', 'totalInKind', 'totalOfTotalCost',
        'budgetTemplate.description', 'offCampusRates', 'onCampusRates', 'costSharingType.description'
    ]
};

export const ProposalBudgetPeriods: CompareType = {
    reviewSectionCode: 308,
    reviewSectionDescription: 'Budget Periods',
    reviewSectionName: 'budgetPeriods',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['budgetPeriod'],
    reviewSectionSubFields: ['startDate', 'endDate', 'totalCost', 'totalDirectCost', 'totalIndirectCost',
    'totalModifiedDirectCost', 'totalInKind','costSharingAmount','underrecoveryAmount', 'totalOfTotalCost']
};

export const ProposalBudgetSummary: CompareType = {
    reviewSectionCode: 308,
    reviewSectionDescription: 'Budget Summary',
    reviewSectionName: 'budgetPeriodSummaries',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['budgetCategory'],
    reviewSectionSubFields: ['totalLineItemCostSum', 'periodTotalSum']
};

export const ProposalPeriodDetail: CompareType = {
    reviewSectionCode: 308,
    reviewSectionDescription: 'Budget Period Detail',
    reviewSectionName: 'budgetSummaryVOs',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['periodNumber'],
    reviewSectionSubFields: ['lineItemCost']
};

export const ProposalDetailBudget: CompareType = {
    reviewSectionCode: 308,
    reviewSectionDescription: 'Detail Budget',
    reviewSectionName: 'budgetDetails',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['budgetCategory'],
    reviewSectionSubFields: ['totalLineItemCostSum']
};
export const ProposalSimpleBudget: CompareType = {
    reviewSectionCode: 308,
    reviewSectionDescription: 'Detail Budget',
    reviewSectionName: 'simpleBudgetVo',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['costElementCode','lineItemNumber'],
    reviewSectionSubFields: ['quantity','totalLineItemCost','lineItemDescription']
};
export const ProposalModularBudget: CompareType = {
    reviewSectionCode: 308,
    reviewSectionDescription: 'Modular Budget',
    reviewSectionName: 'modularBudget',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['periodId'],
    reviewSectionSubFields: ['startDate','endDate','totalDirectAndInDirectCost',
'totalDirectCost','totalIndirectCost']
};

export const ProposalSection: Array<Section> = [
    { reviewSectionCode: 301, reviewSectionDescription: 'General Proposal Information', documentId: 'Proposal301', subSectionCode: '301' },
    { reviewSectionCode: 302, reviewSectionDescription: 'Key Personnel', documentId: 'Proposal302', subSectionCode: '302' },
    { reviewSectionCode: 332, reviewSectionDescription: 'Organization', documentId: 'Proposal332', subSectionCode: '332' },
    { reviewSectionCode: 303, reviewSectionDescription: 'Special Review', documentId: 'Proposal303', subSectionCode: '303' },
    { reviewSectionCode: 304, reviewSectionDescription: 'Area Of Research', documentId: 'Proposal304', subSectionCode: '304' },
    { reviewSectionCode: 333, reviewSectionDescription: 'Key Performance Indicator', documentId: 'Proposal333', subSectionCode: '334' },
    { reviewSectionCode: 305, reviewSectionDescription: 'Milestone', documentId: 'Proposal305', subSectionCode: '305' },
    { reviewSectionCode: 306, reviewSectionDescription: 'Other Information', documentId: 'Proposal306', subSectionCode: '306' },
    { reviewSectionCode: 343, reviewSectionDescription: 'Budget Overview', documentId: 'Proposal343', subSectionCode: '343' },
    { reviewSectionCode: 308, reviewSectionDescription: 'Periods and Totals', documentId: 'Proposal308', subSectionCode: '308' },
    { reviewSectionCode: 310, reviewSectionDescription: 'Detailed Budget', documentId: 'Proposal310', subSectionCode: '310' },
    { reviewSectionCode: 311, reviewSectionDescription: 'Simple Budget', documentId: 'Proposal311', subSectionCode: '311' },
    { reviewSectionCode: 338, reviewSectionDescription: 'Modular Budget', documentId: 'Proposal338', subSectionCode: '338' },
    { reviewSectionCode: 307, reviewSectionDescription: 'Budget Summary', documentId: 'Proposal307', subSectionCode: '307' },
    { reviewSectionCode: 312, reviewSectionDescription: 'Questionnaire', documentId: 'Proposal312', subSectionCode: '312' },
    { reviewSectionCode: 313, reviewSectionDescription: 'Attachments', documentId: 'Proposal313', subSectionCode: 'DP305' },
    { reviewSectionCode: 314, reviewSectionDescription: 'Comments', documentId: 'Proposal314', subSectionCode: 'DP306' }
];



