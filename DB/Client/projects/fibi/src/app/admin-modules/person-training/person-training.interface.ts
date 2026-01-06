export class TrainingDashboardRequest {
    pageNumber = 20;
    sort: any = {};
    sortBy = 'updateTimeStamp';
    currentPage = 1;
    trainingCode: number;
    constructor(public personId: number| string = null) {
    }
}

export class PersonTrainingComments {
    trainingCommentId = null;
    personTrainingId: number ;
    comment = null;
    updateUser = null;
    updateUserName = null;
}

export interface EndpointOptions {
    contextField: string;
    formatString: string;
    path: string;
    defaultValue: string;
    params: string;
}

export interface TrainingSearch {
    description: string;
    trainingCode: number;
    updateTimestamp: number;
    updateUser: string;
}

export interface Training {
    personTrainingId: number;
    personId: string;
    trainingCode: number;
    description?: string;
    training?: any;
    dateRequested?: any;
    dateSubmitted?: any;
    dateAcknowledged?: any;
    followupDate?: any;
    score?: any;
    comments?: any;
    nonEmployee?: any;
    updateTimestamp: number;
    updateUser?: any;
    personTrainingAttachments?: any;
    personTrainingComments?: any;
    trainingDescription: string;
    personName: string;
}


export interface TrainingVO {
    person?: any;
    personId?: any;
    acType?: any;
    message?: any;
    persons?: any;
    sortBy: string;
    reverse?: any;
    currentPage: number;
    pageNumber: number;
    totalPersons: number;
    property1?: any;
    property2?: any;
    property3?: any;
    property4?: any;
    property5?: any;
    property6?: any;
    property7?: any;
    property8?: any;
    property9?: any;
    property10?: any;
    property11?: any;
    property12: any[];
    documentHeading?: any;
    exportType?: any;
    trainings: Training[];
    totalResult: number;
    sort: any;
    userName?: any;
    personTraining?: any;
    trainingCode?: any;
    personTrainingComment?: any;
    personTrainingAttachment?: any;
    searchString?: any;
}

export interface PersonTraining {
    personTrainingId: number;
    personId: string;
    trainingCode: number;
    training: Training;
    dateRequested: number;
    dateSubmitted: number;
    dateAcknowledged: number;
    followupDate: number;
    score: string;
    comments?: any;
    nonEmployee?: any;
    updateTimestamp: number;
    updateUser: string;
    personTrainingAttachments: any[];
    personTrainingComments: any[];
    trainingDescription?: any;
    personName?: any;
}

export class PreviousSearchObj {
    searchRequestObj: TrainingDashboardRequest = null;
    isSearched = false;
    training?: TrainingSearch = null;
    person?: any = null;
    personType?: 'employee' | 'non-employee' = null;
}
