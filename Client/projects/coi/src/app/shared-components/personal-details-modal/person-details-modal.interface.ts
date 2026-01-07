export class TrainingDashboardRequest {
    pageNumber = 20;
    sort: any = {};
    sortBy = 'updateTimeStamp';
    currentPage = 1;
    trainingCode: number;
    constructor(public personId: number | string = null) {}
}
