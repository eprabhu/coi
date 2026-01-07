import { AWARD_LABEL } from "../../app-constants";

export const Constants = {
    paths: {
        2: { name: 'Institute Proposal', path: '#/fibi/instituteproposal/overview?instituteProposalId=', class: 'text-warning' },
        3: { name: 'Development Proposal', path: '#/fibi/proposal?proposalId=', class: 'text-success' },
        5: { name: 'Negotiation', path: '#/fibi/negotiation/negotiationhome?negotiationId=', class: 'text-secondary' },
        6: { name: 'Delegation', path: '#/fibi/person/delegation?personId=', class: 'text-warning' },
        10: { name: `${AWARD_LABEL}`, path: '#/fibi/award/overview?awardId=', class: 'text-primary' },
        11: { name: `${AWARD_LABEL}`, path: '#/fibi/award/overview?awardId=', class: 'text-primary' },
        12: { name: `${AWARD_LABEL} Task`, path: '#/fibi/award/task/details?awardId=', subPath: '&&taskId=', class: 'text-info' },
        13: { name: 'Agreement', path: '#/fibi/agreement/form?agreementId=', class: 'text-info' },
        14: { name: 'Claims', path: '#/fibi/claims/endorsement?claimId=', class: 'text-danger' },
        16: { name: 'Progress Report', path: '#/fibi/progress-report/overview?progressReportId=', class: 'text-secondary' },
        20: { name: 'Service Request', path: '#/fibi/service-request/overview?serviceRequestId=', class: 'text-primary' },
    }
};
