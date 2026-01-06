import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { BudgetData, InstituteProposalBudgetHeader } from '../ip-budget';

@Injectable()
export class BudgetDataService {

  constructor() { }

  public ipBudgetData = new Subject();
  budgetData: BudgetData;
  budgetDataChanged = false;
  activityTypeCode = null;
  isBudgetDatesFilled = false;
  previousFinalBudgetId = null;
  isBudgetOverviewChanged = false;

    getBudgetData(keys: Array<string>): any {
        if (!this.budgetData) {
            return null;
        }
        const data = {};
        keys.forEach(key => {
            data[key] = this.budgetData[key];
        });
        return JSON.parse(JSON.stringify(data));
    }

    updateBudgetData(updatedData) {
        const KEYS = Object.keys(updatedData);
        KEYS.forEach(key => {
            if (typeof (updatedData[key]) === 'object') {
                this.budgetData[key] = JSON.parse(JSON.stringify(updatedData[key]));
            } else {
                this.budgetData[key] = updatedData[key];
            }
        });
        this.ipBudgetData.next(KEYS);
    }

    setInstituteProposalBudget(data: BudgetData) {
        this.budgetData = data;
        this.ipBudgetData.next(Object.keys(data));
    }

  /**
  * Converting budget start date and date date from time stamp to date object.
  */
  convertDateObject(instituteProposalBudgetHeader: InstituteProposalBudgetHeader): void {
    if (instituteProposalBudgetHeader) {
        instituteProposalBudgetHeader.budgetPeriods.forEach(period => {
        period.startDate = getDateObjectFromTimeStamp(period.startDate);
        period.endDate = getDateObjectFromTimeStamp(period.endDate);
      });
    }
  }

  setDateFormatFromWithoutTimeStamp(instituteProposalBudgetHeader: InstituteProposalBudgetHeader): void {
    instituteProposalBudgetHeader.startDate = getDateObjectFromTimeStamp(instituteProposalBudgetHeader.startDate);
    instituteProposalBudgetHeader.endDate = getDateObjectFromTimeStamp(instituteProposalBudgetHeader.endDate);

    instituteProposalBudgetHeader.startDate = parseDateWithoutTimestamp(instituteProposalBudgetHeader.startDate);
    instituteProposalBudgetHeader.endDate = parseDateWithoutTimestamp(instituteProposalBudgetHeader.endDate);
    instituteProposalBudgetHeader.budgetPeriods.forEach(element => {
      element.startDate = parseDateWithoutTimestamp(element.startDate);
      element.endDate = parseDateWithoutTimestamp(element.endDate);
    });
  }

  checkBudgetDatesFilled(periods = this.budgetData.instituteProposalBudgetHeader.budgetPeriods): boolean {
    this.isBudgetDatesFilled = periods.find(period => period.startDate == null || period.endDate == null) ? false : true;
    return this.isBudgetDatesFilled;
  }

}
