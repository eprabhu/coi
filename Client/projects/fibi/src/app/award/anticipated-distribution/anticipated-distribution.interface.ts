export class AnticipatedDistributionPeriod {
    awardId: number;
    awardNumber: string;
    sequenceNumber: number;
    budgetPeriod: number;
    startDate: Date | string;
    endDate: Date | string;
    totalDirectCost: number;
    totalIndirectCost: number;
    updateUser?: string;
    updateTimestamp?: number;
    createUser?: string;
    createTimeStamp?: number;
    comment: string;
    fnaDistributionId?: number;

    constructor(
        passedBudgetPeriod?: number,
        passedAwardId?: number,
        passedAwardNumber?: string,
        passedSequenceNumber?: number
    ) {
        this.budgetPeriod = passedBudgetPeriod;
        this.awardId = passedAwardId;
        this.awardNumber = passedAwardNumber;
        this.sequenceNumber = passedSequenceNumber;
    }
}

export class AnticipatedAmountInfo {
    obligatedTotal: number;
    anticipatedTotal: number;

    constructor(assignValue?: AnticipatedAmountInfo) {
        if (assignValue) {
            this.obligatedTotal = assignValue.obligatedTotal;
            this.anticipatedTotal = assignValue.anticipatedTotal;
        }
    }
}

export interface AmountInfo {
    startDate?: any;
    endDate?: any;
    obligatedTotal: number;
    anticipatedTotal: number;
    obligatedDistributableTotal: number;
    anticipatedDistributableTotal: number;
    totalCost: number;
    totalCostInCurrency: number;
    currencyCode?: any;
    currency?: any;
    currencyDetails?: any;
}

export interface CurrencyDetail {
    currencyCode: string;
    currency: string;
    currencySymbol: string;
    updateUser?: any;
    updateTimeStamp?: any;
}

export interface AwardFunds {
    pendingAmountInfo?: AmountInfo;
    activeAmountInfo?: AmountInfo;
    instituteTotal: number;
    sponsorTotal: number;
    costShareTotal: number;
    costShareDistributable: number;
    projectStartDate: number;
    projectEndDate: number;
    currencyDetails: CurrencyDetail[];
}

export class PeriodsDate {
    startErrorMessage?: string;
    endErrorMessage?: string;
    period?: number;
}

export class AmountTotals {
    totalDirectCost = 0;
    totalIndirectCost = 0;
    totalCost = 0;
}

export interface LoadAnticipatedObject {
    awardNumber: string;
    sequenceNumber: number;
    awardId: number;
    transactionStatus: string;
    awardSequenceStatus: string;
}
