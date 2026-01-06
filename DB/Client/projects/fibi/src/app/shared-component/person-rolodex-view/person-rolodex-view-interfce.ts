
export class DegreeDetails {
    proposalPersonId: string;
    degreeType = null;
    degree: string;
    fieldOfStudy: string;
    specialization: string;
    school: string;
    graduationDate: string;
    degreeCode: string;
}

export class TrainingDashboardRequest {
    pageNumber = 20;
    sort: any = {};
    sortBy = 'updateTimeStamp';
    currentPage = 1;
    trainingCode: number;
    constructor(public personId: number| string = null) {
    }
}
