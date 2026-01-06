/**
 * Author Aravind P S
 * this configuration file consits of 4 parts
 * the key value indicates the section code of each component
 * name - Dispaly name of each award sections
 * documentID - the unique id of each parent componet of router.
 * routeName -route paths for routing.a
 */

export const AWARD_SECTION = {
    101: { name: 'Award Overview (General)', documentId: 'Award101', routeName: 'awardOverview' },
    102: { name: 'Budget', documentId: 'Award102', routeName: 'awardBudgetExpense_Budget'},
    103: { name: 'Attachments', documentId: 'Award103', routeName: 'awardAttachment'},
    104: { name: 'Award Overview (Key Personnel)', documentId: 'Award104', routeName: 'awardOverview'},
    105: { name: 'Award Overview (Project Team)', documentId: 'Award105', routeName: 'awardOverview'},
    106: { name: 'Award Overview (Contacts)', documentId: 'Award106', routeName: 'awardOverview'},
    107: { name: 'Permissions', documentId: 'Award107', routeName: 'awardPermissions'},
    108: { name: 'Dates & Amounts', documentId: 'Award108', routeName: 'awardDatesAndAmounts'},
    109: { name: 'Report Req.', documentId: 'Award109', routeName: 'awardReports'},
    110: { name: 'Terms', documentId: 'Award110', routeName: 'awardTerms_SponsorTerms'},
    111: { name: 'Cost Share', documentId: 'Award111', routeName: 'awardCostShare'},
    112: { name: 'Award Overview (Sub Contracts)', documentId: 'Award112', routeName: 'awardOverview'},
    113: { name: 'Award Overview (Special Review)', documentId: 'Award113', routeName: 'awardOverview'},
    114: { name: 'Expense Tracking', documentId: 'Award114', routeName: 'awardBudgetExpense_ExpenseTrack'},
    115: { name: 'Outcome', documentId: 'Award115', routeName: 'awardProjectOutcome'},
    116: { name: 'Award Hierarchy', documentId: 'Award116', routeName: 'awardHeirarchy'},
    117: { name: 'Institute Proposal', documentId: 'Award117', routeName: 'awardOverview'},
    118: { name: 'Review', documentId: 'Award118', routeName: 'awardReview'},
    119: { name: 'Special Approval', documentId: 'Award119', routeName: 'awardTerms_SpecialApproval'},
    120: { name: 'Other Information', documentId: 'Award120', routeName: 'awardOtherInformation'},
    121: { name: 'Payments', documentId: 'Award121', routeName: 'awardPayments'},
    122: { name: 'KPI', documentId: 'Award122', routeName: 'awardOverview'},
    123: { name: 'Milestone', documentId: 'Award123', routeName: 'awardOverview'},
    124: { name: 'Award Questionnaire', documentId: 'award-questionnaire', routeName: 'awardQuestionnaire'},
    125: { name: 'Award Overview (Area Of Research)', documentId: 'Award125', routeName: 'awardOverview'},
    126: { name: 'Data Management Plan', documentId: 'dmp-questionnaire', routeName: 'dmpQuestionnaire'},
    127: { name: 'Periods and Totals', documentId: 'Award127', routeName: 'awardBudgetExpense_Budget'},
    128: { name: 'Budget Summary', documentId: 'Award128', routeName: 'awardBudgetExpense_Budget'},
    129: { name: 'Detailed Budget', documentId: 'Award129', routeName: 'awardBudgetExpense_Budget'},
    130: { name: 'Project Cost Overview', documentId: 'Award130', routeName: 'awardOverview'},
    131: { name: 'Manpower Staff New Hire Request', documentId: 'award-manpower', routeName: 'manpower'},
    132: { name: 'Manpower Others', documentId: 'award-manpower', routeName: 'manpower'},
    133: { name: 'Manpower Staff', documentId: 'award-manpower', routeName: 'manpower'},
    134: { name: 'Manpower Students', documentId: 'award-manpower', routeName: 'manpower'},
    136: { name: 'Manpower Staff Admin Correction', documentId: 'award-manpower', routeName: 'manpower'},
};
/**
 * @param  {} sectionCodes
 * Returns an array w.r.t section type codes passes
 */
export function getSectionList(sectionCodes) {
    let resultSectionArray = [];
    sectionCodes.forEach(element => {
        resultSectionArray = resultSectionArray.concat(getSectionObject(element));
    });
    return resultSectionArray;
}

function getSectionObject(section) {
    AWARD_SECTION[section.sectionCode].variableType = section.variableType;
    return  JSON.parse(JSON.stringify(AWARD_SECTION[section.sectionCode]));
}
