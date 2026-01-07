export class ReportingRequirement {
    sponsorReportId: null| string = null;
    fundingSchemeId: null | string = null;
    reportClassCode: null | string = null;
    reportCode: null | string = null;
    frequencyCode: null | string = null;
    frequencyBaseCode: null | string = null;
    useAsBaseDate = false;
    endOnProjectEndDate = false;
    customEndDate: string = null;
    endOnOccurrences = 0;
    sponsorCode: null | string = null;
    baseDate: null | string= null;
    day = 0;
    month = 0;
  }

  export class SearchReportingRequirement {
    fundingSchemeId: number | null= null;
    reportClassCode: string | null= null;
    sponsorCode: string | null= null;
    reportCode: string | null= null;
    frequencyCode: string | null= null;
    currentPage = 1;
    pageSize= 20;
  }
