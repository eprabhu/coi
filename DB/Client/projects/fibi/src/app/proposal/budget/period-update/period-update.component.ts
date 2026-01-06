import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { ProposalService } from '../../services/proposal.service';
import { toggleErrorToast } from '../budget-validations';
import { BudgetDataService } from '../../services/budget-data.service';
import { BudgetService } from '../budget.service';

declare var $: any;

@Component({
    selector: 'app-period-update',
    templateUrl: './period-update.component.html',
    styleUrls: ['./period-update.component.css']
})

export class PeriodUpdateComponent implements OnInit {

    @Input() budgetData: any = {};
    @Input() isBudgetIdRequired = true;
    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

    constructor(public _proposalService: ProposalService,
        private _budgetDataService: BudgetDataService, private _budgetService: BudgetService, private _commonService: CommonService) { }

    ngOnInit(): void {
        $('#budgetDateModalProposal').modal('show');
    }

    updateBudgetDates(): void {
        $('#budgetDateModalProposal').modal('hide');
        if (this._proposalService.proposalDateChangeType === 'INC') {
            const BUDGET_ID = this.isBudgetIdRequired ? this.budgetData.budgetHeader.budgetId : null;
            this.updateProposalBudgetPeriods(BUDGET_ID);
        } else if (this._proposalService.proposalDateChangeType === 'DEC') {
            this.openWarningModal();
        } else {
            toggleErrorToast(this.budgetData, this._proposalService);
        }
    }

    private openWarningModal() {
        document.getElementById('dateManualEdit').click();
    }

    emitWarningMessage(): void {
        this.closeModal.emit({ 'selectedOption': 'N' });
        this._proposalService.isDatesChanged = false;
        toggleErrorToast(this.budgetData, this._proposalService);
    }

    private updateProposalBudgetPeriods(bid): void {
        const tempBudgetStartDate = this.budgetData.budgetHeader.startDate;
        const tempBudgetEndDate = this.budgetData.budgetHeader.endDate;
        this.budgetData.budgetHeader.startDate = parseDateWithoutTimestamp(this._proposalService.proposalStartDate);
        this.budgetData.budgetHeader.endDate = parseDateWithoutTimestamp(this._proposalService.proposalEndDate);
        this._budgetService.updateProposalBudgetPeriods(this.budgetData.budgetHeader.proposalId,
            this._budgetDataService.activityTypeCode, bid).subscribe((data: any) => {
                this.updateBudgetData(data);
            }, err => {
                this.budgetData.budgetHeader.startDate = tempBudgetStartDate;
                this.budgetData.budgetHeader.endDate = tempBudgetEndDate;
                this._budgetDataService.setProposalBudgetData(this.budgetData);
                toggleErrorToast(this.budgetData, this._proposalService);
                this.closeModal.emit({ 'selectedOption': 'N' });
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Budget Period dates failed. Please try again.');
            });
    }

    adjustBudgetDatesManually(): void {
        this._proposalService.proposalDateChangeType = null;
        this._proposalService.isDatesChanged = false;
        this.closeModal.emit({ 'selectedOption': 'N' });
        $('#manualDateAlignModal').modal('hide');
        toggleErrorToast(this.budgetData, this._proposalService);
    }

    private updateBudgetData(data: any): void {
        this.budgetData.budgetHeader = data.budgetHeader;
        this._budgetDataService.setProposalBudgetData(this.budgetData);
        this._proposalService.proposalDateChangeType = null;
        this._proposalService.isDatesChanged = false;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Period dates updated successfully.');
        toggleErrorToast(this.budgetData, this._proposalService);
        this.closeModal.emit({ 'selectedOption': 'Y' });
    }
}
