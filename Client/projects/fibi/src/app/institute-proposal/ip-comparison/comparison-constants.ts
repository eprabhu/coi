import { CompareType, Section } from "./interface";

export const ProposalAttachments: CompareType = {
	reviewSectionCode: 206,
	reviewSectionDescription: 'Attachments',
	reviewSectionName: 'instituteProposalAttachments',
	reviewSectionType: 'Array',
	reviewSectionSubFields: ['description', 'narrativeStatus.description', 'lastUpdateUserFullName',
		'updateTimestamp', 'attachmentType.description'],
	reviewSectionUniqueFields: ['attachmentId']
};

export const IPBudgetOverview: CompareType = {
	reviewSectionCode: 209,
	reviewSectionDescription: 'Budget Overview',
	reviewSectionName: 'instituteProposalBudgetHeader',
	reviewSectionType: 'Object',
	reviewSectionUniqueFields: [],
	reviewSectionSubFields: ['budgetStatus.description', 'comments',
		'isAutoCalc', 'campusFlag', 'startDate', 'endDate'
		, 'totalCost', 'totalDirectCost', 'totalIndirectCost', 'rateType.rateClassDescription',
		'underrecoveryRateType.rateClassDescription', 'totalModifiedDirectCost',
		'costSharingAmount', 'underrecoveryAmount', 'totalInKind', 'totalOfTotalCost',
		'budgetTemplate.description', 'offCampusRates', 'onCampusRates', 'costSharingType.description'
	]
};

export const IPBudgetPeriods: CompareType = {
	reviewSectionCode: 210,
	reviewSectionDescription: 'Budget Periods',
	reviewSectionName: 'budgetPeriods',
	reviewSectionType: 'Array',
	reviewSectionUniqueFields: ['budgetPeriod'],
	reviewSectionSubFields: ['startDate', 'endDate', 'totalCost', 'totalDirectCost', 'totalIndirectCost',
		'totalModifiedDirectCost', 'totalInKind', 'costSharingAmount', 'underrecoveryAmount', 'totalOfTotalCost']
};

export const IPResearchAreas: CompareType = {
	reviewSectionCode: 205,
	reviewSectionDescription: 'General Information',
	reviewSectionName: 'instituteProposalResearchAreas',
	reviewSectionType: 'Array',
	reviewSectionSubFields: [],
	reviewSectionUniqueFields: ['awardResearchType.description', 'researchTypeArea.description', 'researchTypeSubArea.description']
};

export const IPGeneralDetails: CompareType = {
	reviewSectionCode: 201,
	reviewSectionDescription: 'General Information',
	reviewSectionName: 'instProposal',
	reviewSectionType: 'Object',
	reviewSectionUniqueFields: [],
	reviewSectionSubFields: ['grantCall.grantCallName', 'awardNumber', 'awardTitle',
		'title', 'instProposalType.description', 'grantCallType.description', 'activityType.description',
		'awardType.description', 'sponsorName', 'startDate', 'endDate', 'duration', 'primeSponsorName',
		'disciplineCluster.description', 'sponsorProposalNumber',
		'externalFundingAgencyId', 'sponsorDeadlineDate', 'internalDeadLineDate', 'baseProposalNumber','baseProposalTitle',
		'programAnnouncementNumber', 'abstractDescription', 'cfdaNumber', 'researchDescription', 'multiDisciplinaryDescription',
	]
};

export const IPPersons: CompareType = {
	reviewSectionCode: 202,
	reviewSectionDescription: 'General Information',
	reviewSectionName: 'instituteProposalPersons',
	reviewSectionType: 'Array',
	reviewSectionSubFields: ['fullName', 'proposalPersonRole.description', 'projectRole', 'personRoleId',
		'designation', 'percentageOfEffort', 'department', 'unit?.unitName', 'proposalPersonAttachment.fileName'],
	reviewSectionUniqueFields: ['rolodexId', 'personId']
};

export const IPSpecialReviews: CompareType = {
	reviewSectionCode: 204,
	reviewSectionDescription: 'General Information',
	reviewSectionName: 'instituteProposalSpecialReviews',
	reviewSectionType: 'Array',
	reviewSectionSubFields: ['protocolNumber', 'applicationDate', 'approvalDate', 'expirationDate', 'comments'],
	reviewSectionUniqueFields: ['specialReviewType.description', 'approvalType.description']
};

export const IPProposalKeyWords: CompareType = {
	reviewSectionCode: null,
	reviewSectionDescription: 'ProposalKeyWords',
	reviewSectionName: 'instituteProposalKeywords',
	reviewSectionType: 'Array',
	reviewSectionSubFields: [],
	reviewSectionUniqueFields: ['scienceKeywordCode', 'scienceKeyword.description', 'keyword']
};


export const IPSection: Array<Section> = [
	{ reviewSectionCode: 201, reviewSectionDescription: 'General Proposal Information', documentId: 'Proposal201', subSectionCode: '214' },
	{ reviewSectionCode: 202, reviewSectionDescription: 'Key Personnel', documentId: 'Proposal202', subSectionCode: '215' },
	{ reviewSectionCode: 204, reviewSectionDescription: 'Special Review', documentId: 'Proposal204', subSectionCode: '217' },
	{ reviewSectionCode: 205, reviewSectionDescription: 'Area Of Research', documentId: 'Proposal205', subSectionCode: '218' },
	{ reviewSectionCode: 211, reviewSectionDescription: 'Other Information', documentId: 'Proposal211', subSectionCode: '224' },
	{ reviewSectionCode: 209, reviewSectionDescription: 'Budget Overview', documentId: 'Proposal209', subSectionCode: '222' },
	{ reviewSectionCode: 210, reviewSectionDescription: 'Periods and Totals', documentId: 'Proposal210', subSectionCode: '223' },
	{ reviewSectionCode: 206, reviewSectionDescription: 'Attachments', documentId: 'Proposal206', subSectionCode: '221' },
	{ reviewSectionCode: 212, reviewSectionDescription: 'Comments', documentId: 'Proposal212', subSectionCode: '225' }
];

