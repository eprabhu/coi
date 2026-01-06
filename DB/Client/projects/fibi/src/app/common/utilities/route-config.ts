/**
 * Author Mahesh Sreenath V M - designed with guidance of Anish T
 * this configuration file consist of 3 parts
 * documentID(before first #)- the unique id of each parent component of router.
 * route(after# and before second#-middle part)- route paths for routing.a
 * query params(after second # last part)- consists of values used as query params the values
 * should be identical to the values used in components. in other words this will be used
 * as key for query params
 * the values should be separated with comma(,) which will used as delimiter in code logic
 */

export const routeConfigurations = {
    awardOverview: 'award-overview-section#fibi/award/overview#awardId',
    awardDatesAndAmounts: 'award-dates-amounts-section#fibi/award/dates#awardId',
    awardBudgetExpense_Budget: 'Award102#fibi/award/budget-expense/budget#awardId',
    awardBudgetExpense_ExpenseTrack: 'Award114#fibi/award/budget-expense/expensetrack#awardId',
    awardCostShare: 'award-cost-share-section#fibi/award/cost-share#awardId',
    awardAttachment: 'award-attachment-section#fibi/award/attachments#awardId',
    awardPermissions: '#fibi/award/permissions#awardId',
    awardReports: 'award-reporting-requirements-section#fibi/award/reports#awardId',
    awardTerms_SponsorTerms: 'Award110#fibi/award/terms-approval/terms#awardId',
    awardTerms_SpecialApproval: 'Award119#fibi/award/terms-approval/approval#awardId',
    awardProjectOutcome: 'award-project-outcome-section#fibi/award/project-outcome#awardId',
    awardHeirarchy: 'award-hierarchy-section#fibi/award/hierarchy#awardId',
    awardReview: 'award-review-section#fibi/award/review#awardId',
    awardOtherInformation: 'award-other-information-section#fibi/award/other-information#awardId',
    awardPayments: 'award-payments-section#fibi/award/payments#awardId',
    awardQuestionnaire: 'award-questionnaire#fibi/award/questionnaire#awardId',
    manpower: 'award-manpower#fibi/award/manpower#awardId',
    periodsAndTotal: 'proposal-periods-total#fibi/proposal/budget/periods-total#proposalId',
};
