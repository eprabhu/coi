import { ETHICS_SAFETY_LABEL } from '../../app-constants';
import {CompareType, Section} from './interfaces';

export const GeneralDetails: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'award',
    reviewSectionType: 'Object',
    reviewSectionUniqueFields: [],
    reviewSectionSubFields: ['accountNumber', 'accountType.description',
        'activityType.description', 'title', 'duration', 'sponsorAwardNumber',
        'awardStatus.description', 'principalInvestigator', 'leadUnit.unitName',
        'sponsor.sponsorType.description', 'beginDate', 'finalExpirationDate',
        'awardEffectiveDate', 'awardType.description', 'primeSponsor.sponsorName',
        'primeSponsor.sponsorCode', 'primeSponsor.acronym', 'cfdaNumber', 'dfafsNumber',
        'grantCallName', 'researchDescription', 'multiDisciplinaryDescription',
        'sponsor.sponsorName', 'sponsor.sponsorCode', 'sponsor.acronym', 'grantHeaderId']
};
//primary key missing
export const AwardSubContracts: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'awardSubContracts',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['organization.organizationName', 'amount'],
    reviewSectionUniqueFields: ['organizationId']
};

export const AwardKPI: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'awardKpis',
    reviewSectionType: 'Array',
    reviewSectionSubFields: [],
    reviewSectionUniqueFields: ['kpiTypeCode']
};

//primary key missing
export const AwardMilestones: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'awardMileStones',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['startDate', 'endDate', 'duration', 'milestoneStatus.description', 'comment'],
    reviewSectionUniqueFields: ['milestone']
};

export const AwardPersons: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'awardPersons',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['fullName', 'proposalPersonRole.description', 'projectRole', 'personRoleId',
        'designation', 'percentageEffort', 'department'],
    reviewSectionUniqueFields: ['rolodexId', 'personId']
};

export const AwardProjectTeams: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'awardProjectTeams',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['projectRole', 'designation', 'startDate', 'endDate', 'percentageCharged'],
    reviewSectionUniqueFields: ['rolodexId', 'personId']
};

export const AwardContacts: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'awardContacts',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['fullName', 'designation', 'phoneNumber', 'emailAddress', 'awardContactType.description'],
    reviewSectionUniqueFields: ['rolodexId', 'personId']
};

//primary key missing
export const AwardSpecialReviews: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'awardSpecialReviews',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['protocolNumber', 'applicationDate', 'approvalDate', 'expirationDate',
        'specialReview.description', 'specialReviewApprovalType.description', 'comments'],
    reviewSectionUniqueFields: ['specialReviewCode']
};

//primary key missing
export const AwardResearchAreas: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'General Information',
    reviewSectionName: 'awardResearchAreas',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['awardResearchType.description'],
    reviewSectionUniqueFields: ['researchTypeCode']
};

export const AwardAttachments: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Attachments',
    reviewSectionName: 'newAttachments',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['description', 'narrativeStatus.description', 'documentStatusCode', 'fileName'],
    reviewSectionUniqueFields: ['awardAttachmentId']
};

//primary key missing
export const AwardCostShare: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Cost Share',
    reviewSectionName: 'awardCostShares',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['comments', 'commitmentAmount', 'costShareDistributable', 'costShareMet',
        'costSharePercentage', 'destination', 'projectPeriod', 'source', 'verificationDate'],
    reviewSectionUniqueFields: ['costShareTypeCode']
};

//primary key missing
export const AwardDateAndAmounts: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Date & Amounts',
    reviewSectionName: 'awardAmountInfos',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['awardAmountTransaction.awardTransactionType.description', 'awardAmountTransaction.noticeDate',
        'awardAmountTransaction.fundingProposalNumber', 'awardAmountTransaction.sourceAwardNumber', 'currentFundEffectiveDate',
        'awardAmountTransaction.destinationAwardNumber', 'obligationExpirationDate', 'obligatedChange', 'anticipatedChange',
        'awardAmountTransaction.awardTransactionStatus?.description'],
    reviewSectionUniqueFields: ['awardAmountTransaction.awardAmountTransactionId']
};
export const AwardPayments: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Payments',
    reviewSectionName: 'award',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['awardBasisOfPayment.description', 'awardMethodOfPayment.description', 'frequency.description',
        'invoiceNoOfCopies', 'finalInvoiceDue', 'invoiceInstructions'],
    reviewSectionUniqueFields: []
};
export const AwardKeyWords: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Award KeyWords',
    reviewSectionName: 'award',
    reviewSectionType: 'Array',
    reviewSectionSubFields: [],
    reviewSectionUniqueFields: ['scienceKeywordCode', 'scienceKeyword.description', 'keyword']
};
export const AwardTermsList: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Terms',
    reviewSectionName: 'awardTermsList',
    reviewSectionType: 'Object',
    reviewSectionSubFields: [],
    reviewSectionUniqueFields: ['sponsorTermCode']
};

//primary key missing
export const AwardForeignTravel: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Special Approval',
    reviewSectionName: 'awardAprovedForeignTravelList',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['destination', 'amount', 'startDate', 'endDate', 'travellerName'],
    reviewSectionUniqueFields: ['personId']
};

//primary key missing
export const AwardEquipment: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Special Approval',
    reviewSectionName: 'awardApprovedEquipmentList',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['item', 'model', 'vendor', 'amount'],
    reviewSectionUniqueFields: []
};
export const AwardPublications: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Publications',
    reviewSectionName: 'awardPublications',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['publication.publicationStatus', 'publication.publicationType',
        'publication.nameOfJournal', 'publication.schoolOfAuthor', 'publication.title',
        'publication.url', 'publication.year'],
    reviewSectionUniqueFields: ['publication.publicationType']
};
export const AwardAssociations: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Associations',
    reviewSectionName: 'awardAssociations',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['awardAssociationDetail.piName', 'awardAssociationDetail.sponsor.sponsorName',
        'awardAssociationDetail.fundingScheme.schemeName', 'awardAssociationDetail.totalProjectCost',
        'awardAssociationDetail.statusDescription', 'awardAssociationDetail.primeSponsor.sponsorName',
        'awardAssociationDetail.unit.unitName'],
    reviewSectionUniqueFields: ['associationTypeCode' , 'awardAssociationDetail.title']
};

//primary key missing
export const AwardAchievements: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Acheivements',
    reviewSectionName: 'awardAcheivements',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['comment', 'fileName'],
    reviewSectionUniqueFields: []
};
export const AwardProjectOverview: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Project Overview',
    reviewSectionName: '',
    reviewSectionType: 'Object',
    reviewSectionSubFields: ['activeAmountInfo.obligatedDistributableTotal', 'activeAmountInfo.anticipatedDistributableTotal',
    'activeAmountInfo.anticipatedTotal', 'activeAmountInfo.obligatedTotal', 'activeAmountInfo.endDate', 
    'activeAmountInfo.startDate','activeAmountInfo.totalCost', 'activeAmountInfo.totalCostInCurrency', 
    'activeAmountInfo.currencyCode', 'activeAmountInfo.currencySymbol',
    'pendingAmountInfo.obligatedDistributableTotal', 'pendingAmountInfo.anticipatedDistributableTotal',
    'pendingAmountInfo.anticipatedTotal', 'pendingAmountInfo.obligatedTotal', 
    'pendingAmountInfo.endDate', 'pendingAmountInfo.startDate',
    'pendingAmountInfo.totalCost', 'pendingAmountInfo.totalCostInCurrency', 'pendingAmountInfo.currencyCode',
    'pendingAmountInfo.currencySymbol', 'projectStartDate', 'projectEndDate', 'sponsorTotal',
    'instituteTotal','costShareTotal'],
    reviewSectionUniqueFields: []
}; 
export const AwardBudgetOverview: CompareType = {
    reviewSectionCode: 102,
    reviewSectionDescription: 'Budget Overview',
    reviewSectionName: 'budgetHeader',
    reviewSectionType: 'Object',
    reviewSectionUniqueFields: [],
    reviewSectionSubFields: ['availableFund', 'availableFundType', 'budgetStatus.description'
        , 'budgetType.description', 'comments', 'cumulativeVirement', 'fundCenter'
        , 'fundCode', 'isAutoCalc', 'onOffCampusFlag', 'rateType.description', 'startDate', 'endDate'
        , 'totalCost', 'totalDirectCost', 'totalIndirectCost', 'versionNumber', 'virement',
        'onCampusRates', 'offCampusRates', 'costSharingType.description', 'fundDisbursementBasisType.description'
    ]
};

export const AwardBudgetPeriods: CompareType = {
    reviewSectionCode: 102,
    reviewSectionDescription: 'Budget Periods',
    reviewSectionName: 'budgetPeriods',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['budgetPeriod'],
    reviewSectionSubFields: ['startDate', 'endDate', 'totalCost', 'totalDirectCost', 'totalIndirectCost']
};

export const AwardBudgetSummary: CompareType = {
    reviewSectionCode: 102,
    reviewSectionDescription: 'Budget Summary',
    reviewSectionName: 'budgetPeriodSummaries',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['budgetCategory'],
    reviewSectionSubFields: ['totalLineItemCostSum', 'periodTotalSum']
};

export const AwardPeriodDetail: CompareType = {
    reviewSectionCode: 102,
    reviewSectionDescription: 'Budget Period Detail',
    reviewSectionName: 'budgetSummaryVOs',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['periodNumber'],
    reviewSectionSubFields: ['lineItemCost']
};

export const AwardDetailBudget: CompareType = {
    reviewSectionCode: 102,
    reviewSectionDescription: 'Detail Budget',
    reviewSectionName: 'budgetDetails',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['budgetCategory'],
    reviewSectionSubFields: ['totalLineItemCostSum']
};

export const AwardPermissions: CompareType = {
    reviewSectionCode: 107,
    reviewSectionDescription: 'Permissions',
    reviewSectionName: 'awardPersonRoles',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['personId', 'roleId'],
    reviewSectionSubFields: []
};

export const AwardManpower: CompareType = {
    reviewSectionCode: 131,
    reviewSectionDescription: 'Manpower',
    reviewSectionName: 'manpower',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['budgetReferenceNumber'],
    reviewSectionSubFields: ['approvedHeadCount', 'actualHeadCount', 'budgetAmount', 'sapCommittedAmount', 'expenseAmount'
    , 'committedBalance', 'unCommittedAmount', 'balance']
};

export const AwardManpowerResource: CompareType = {
    reviewSectionCode: 131,
    reviewSectionDescription: 'Manpower',
    reviewSectionName: 'awardManpowerResources',
    reviewSectionType: 'Array',
    reviewSectionUniqueFields: ['resourceUniqueId'],
    reviewSectionSubFields: [ 'costAllocation', 'committedCost', 'plannedSalary', 'manpowerPlanJobProfileType.description',
        'plannedBaseSalary', 'isMultiAccount', 'isMainAccount', 'planStartDate', 'planEndDate', 'expenseAmount',
         'sapCommittedAmount', 'balance', 'fullName', 'manpowerResourceType.description', 'resourceName', 'department',
         'chargeStartDate', 'chargeEndDate', 'positionId', 'planDuration', 'chargeDuration', 'manpowerPositionStatus.description']
};

export const AwardSection: Array<Section> = [
    { reviewSectionCode: 101, reviewSectionDescription: 'General Award Information', documentId: 'Award101', subSectionCode: '164' },
    { reviewSectionCode: 104, reviewSectionDescription: 'Key Personnel', documentId: 'Award104', subSectionCode: '165' },
    { reviewSectionCode: 105, reviewSectionDescription: 'Project Team', documentId: 'Award105', subSectionCode: '166' },
    { reviewSectionCode: 106, reviewSectionDescription: 'Contacts', documentId: 'Award106', subSectionCode: '167' },
    { reviewSectionCode: 113, reviewSectionDescription: ETHICS_SAFETY_LABEL, documentId: 'Award113', subSectionCode: '189' },
    { reviewSectionCode: 112, reviewSectionDescription: 'Sub Contracts', documentId: 'Award112', subSectionCode: '168' },
    { reviewSectionCode: 125, reviewSectionDescription: 'Area Of Research', documentId: 'Award125', subSectionCode: '169' },
    { reviewSectionCode: 123, reviewSectionDescription: 'Milestone', documentId: 'Award123', subSectionCode: '170' },
    { reviewSectionCode: 122, reviewSectionDescription: 'Key Performance Indicator', documentId: 'Award122', subSectionCode: '171' },
    { reviewSectionCode: 121, reviewSectionDescription: 'Payment & Invoices', documentId: 'Award121', subSectionCode: '172' },
    { reviewSectionCode: 120, reviewSectionDescription: 'Other Information', documentId: 'Award120', subSectionCode: '173' },
    { reviewSectionCode: 130, reviewSectionDescription: 'Dates & Amounts Overview', documentId: 'Award130', subSectionCode: '174' },
    { reviewSectionCode: 108, reviewSectionDescription: 'Dates & Amounts History', documentId: 'Award108', subSectionCode: '175' },
    { reviewSectionCode: 102, reviewSectionDescription: 'Budget Overview', documentId: 'Award102', subSectionCode: '176' },
    { reviewSectionCode: 127, reviewSectionDescription: 'Periods and Totals', documentId: 'Award127', subSectionCode: '177' },
    { reviewSectionCode: 129, reviewSectionDescription: 'Detailed Budget', documentId: 'Award129', subSectionCode: '178' },
    { reviewSectionCode: 128, reviewSectionDescription: 'Budget Summary', documentId: 'Award128', subSectionCode: '179' },
    { reviewSectionCode: 131, reviewSectionDescription: 'Manpower', documentId: 'Award131', subSectionCode: '180' },
    { reviewSectionCode: 111, reviewSectionDescription: 'Cost Sharing', documentId: 'Award111', subSectionCode: '181' },
    { reviewSectionCode: 103, reviewSectionDescription: 'Attachments', documentId: 'Award103', subSectionCode: '182' },
    // { reviewSectionCode: 126, reviewSectionDescription: 'Data Management Plan', documentId: 'Award126', subSectionCode: '183' },
    { reviewSectionCode: 124, reviewSectionDescription: 'Questionnaire', documentId: 'Award124', subSectionCode: '184' },
    { reviewSectionCode: 110, reviewSectionDescription: 'Terms', documentId: 'Award110', subSectionCode: '185' },
    { reviewSectionCode: 119, reviewSectionDescription: 'Special Approval', documentId: 'Award119', subSectionCode: '186' },
    { reviewSectionCode: 115, reviewSectionDescription: 'Outcomes', documentId: 'Award115', subSectionCode: '187' },
    { reviewSectionCode: 107, reviewSectionDescription: 'Permissions', documentId: 'Award107', subSectionCode: '188' },
];

export const AwardScopus: CompareType = {
    reviewSectionCode: 100,
    reviewSectionDescription: 'Scopuses',
    reviewSectionName: 'awardScopuses',
    reviewSectionType: 'Array',
    reviewSectionSubFields: ['scopus.sourceTitle', 'scopus.affiliations',
        'scopus.fundingScheme.authors', 'scopus.doi',
        'scopus.citations', 'scopus.issn',
        'scopus.sourceType',  'scopus.coverDate', 'scopus.pubMedId', 'scopus.reference'],
    reviewSectionUniqueFields: ['scopusId']
};
