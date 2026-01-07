export class ProposalDashBoardRequest {
    property1: string = '';
    property2: string = '';
    property3: any[] = [];
    property4: any[] = [];
    property5: string = '';
    property6: any[] = [];
    property7: string = '';
    property8: string = '';
    property9: string = '';
    property10: string = '';
    property11: string = '';
    property12: string = '';
    property13: string[] = [];
    property14: string = '';
    property15: string = '';
    property16: string = '';
    pageNumber: number =20;
    sortBy: string = 'updateTimeStamp';
    sort: any = {};
    tabName: string;
    advancedSearch: string;
    grantCallId?: any;
    currentPage: number;
    proposalRank: any;
    fullName: string;
    grantCallName: string;
}

    export interface ResearchType {
        researchTypeCode: string;
        description: string;
        updateTimeStamp: number;
        updateUser: string;
        isActive: boolean;
    }

    export interface ResearchType2 {
        researchTypeCode: string;
        description: string;
        updateTimeStamp: number;
        updateUser: string;
        isActive: boolean;
    }

    export interface ResearchTypeArea {
        researchTypeAreaCode: string;
        description: string;
        researchTypeCode: string;
        researchType: ResearchType2;
        isActive: boolean;
        updateTimeStamp: number;
        updateUser: string;
    }

    export interface ResearchType3 {
        researchTypeCode: string;
        description: string;
        updateTimeStamp: number;
        updateUser: string;
        isActive: boolean;
    }

    export interface ResearchTypeArea2 {
        researchTypeAreaCode: string;
        description: string;
        researchTypeCode: string;
        researchType: ResearchType3;
        isActive: boolean;
        updateTimeStamp: number;
        updateUser: string;
    }

    export interface ResearchTypeSubArea {
        researchTypeSubAreaCode: string;
        description: string;
        researchTypeAreaCode: string;
        researchTypeArea: ResearchTypeArea2;
        isActive: boolean;
        updateTimeStamp: number;
        updateUser: string;
    }

    export interface areaOfResearchProposal {
        researchAreaId: number;
        researchTypeCode: string;
        researchType: ResearchType;
        researchTypeAreaCode: string;
        researchTypeArea: ResearchTypeArea;
        researchTypeSubAreaCode: string;
        researchTypeSubArea: ResearchTypeSubArea;
        proposalId: number;
        updateTimeStamp: number;
        updateUser: string;
    }



    
    export interface Investigator {
        proposalPersonId?: any;
        proposalId?: any;
        personId: string;
        rolodexId?: any;
        fullName: string;
        personRoleId?: any;
        proposalPersonRole?: any;
        updateTimeStamp?: any;
        updateUser?: any;
        percentageOfEffort?: any;
        units: any[];
        emailAddress?: any;
        proposalPersonAttachment: any[];
        isPi: boolean;
        designation?: any;
        department?: any;
        isMultiPi: boolean;
        isGenerated: boolean;
        primaryTitle?: any;
    }

    export interface ProposalDashBoardItem {
        proposalId: number;
        grantCallId?: any;
        statusCode: number;
        proposalStatus?: any;
        typeCode?: any;
        proposalType?: any;
        title: string;
        startDate?: any;
        endDate?: any;
        submissionDate: number;
        internalDeadLineDate?: any;
        abstractDescription?: any;
        fundingStrategy?: any;
        details?: any;
        deliverables?: any;
        researchDescription?: any;
        createTimeStamp?: any;
        createUser?: any;
        updateTimeStamp?: any;
        updateUser?: any;
        ipNumber?: any;
        sponsorDeadlineDate?: any;
        isEndorsedOnce: boolean;
        proposalRank?: any;
        applicationId?: any;
        multiDisciplinaryDescription?: any;
        duration?: any;
        proposalKeywords: any[];
        grantTypeCode: number;
        grantCallType?: any;
        homeUnitNumber?: any;
        homeUnitName: string;
        unit?: any;
        activityTypeCode: string;
        activityType?: any;
        sponsorCode: string;
        sponsor?: any;
        submitUser?: any;
        sponsorProposalNumber?: any;
        awardTypeCode?: any;
        awardType?: any;
        primeSponsorCode?: any;
        primeSponsor?: any;
        baseProposalNumber?: any;
        programAnnouncementNumber?: any;
        cfdaNumber?: any;
        externalFundingAgencyId?: any;
        clusterCode?: any;
        disciplineCluster?: any;
        isEligibilityCriteriaMet?: any;
        recommendationCode?: any;
        evaluationRecommendation?: any;
        awardNumber?: any;
        documentStatusCode?: any;
        documentStatus?: any;
        sourceProposalId?: any;
        applicationActivityType: string;
        applicationType: string;
        applicationStatus: string;
        workflow?: any;
        proposalPreReviews?: any;
        reviewerReview?: any;
        preReviewExist: boolean;
        isPreReviewer: boolean;
        workflowList?: any;
        principalInvestigatorForMobile?: any;
        grantORTTManagers: any[];
        isAssigned: boolean;
        isRcbfProposal: boolean;
        isModularBudgetEnabled: boolean;
        isSimpleBudgetEnabled: boolean;
        isDetailedBudgetEnabled: boolean;
        isBudgetCategoryTotalEnabled: boolean;
        createUserFullName?: any;
        lastUpdateUserFullName?: any;
        submitUserFullName: string;
        hasRecommendation: boolean;
        hasRank: boolean;
        investigator: Investigator;
        grantCallName?: any;
        grantCallClosingDate?: any;
        proposalPersons: any[];
        isReviewExist?: any;
        score: number;
        categoryCode?: any;
        proposalEvaluationScore?: any;
        totalCost?: any;
        total?: any;
        scoringMapId?: any;
        abbreviation?: any;
        awardTitle?: any;
        awardId?: any;
        proposalTypeDescription?: any;
        proposalCategory?: any;
        sourceProposalTitle?: any;
        baseProposalTitle?: any;
        sponsorName: string;
        primeSponsorName?: any;
    }
