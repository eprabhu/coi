import { Component, Input, OnChanges } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';
import { compareDates, getDateObjectFromTimeStamp, getDuration } from '../../../../common/utilities/date-utilities';
import { ProposalService } from '../../../services/proposal.service';

@Component({
  selector: 'app-general-proposal-information',
  templateUrl: './general-proposal-information.component.html',
  styleUrls: ['./general-proposal-information.component.css']
})
export class GeneralProposalInformationComponent implements OnChanges {
  @Input() result: any = {};
  @Input() proposalDataBindObj: any = {};

  currency: string;
  showGrantDetails = false;

  constructor(public _commonService: CommonService, public _proposalService: ProposalService) { }

  ngOnChanges() {
    this.currency = this._commonService.currencyFormat;
    this.differenceBetweenDates();
    this.deadlineDateValidation();
  }

    differenceBetweenDates() {
        if (this.result.proposal.startDate && this.result.proposal.endDate) {
            const DATEOBJ = getDuration(this.result.proposal.startDate, this.result.proposal.endDate);
            this.result.proposal.duration = DATEOBJ.durInYears + ' year(s), ' + DATEOBJ.durInMonths +
                ' month(s) & ' + DATEOBJ.durInDays + ' day(s)';
        }
    }

  setGrantDetailsValue(isShowModal) {
    this.showGrantDetails = isShowModal;
  }
  openProposal(id: number) {
    let url = window.location.origin + window.location.pathname + '#/fibi/proposal?proposalId=' + id;
    window.open(url, '_blank');
  }

  deadlineDateValidation() {
    const currentDate: Date = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (this.result.proposal.sponsorDeadlineDate != null &&
      compareDates(getDateObjectFromTimeStamp(this.result.proposal.sponsorDeadlineDate), currentDate, 'dateObject', 'dateObject') === -1) {
      this.proposalDataBindObj.dateWarningList.set('deadlineDate', 'Sponsor deadline date already passed.');
    }
    if (this.result.proposal.internalDeadLineDate != null &&
      compareDates(getDateObjectFromTimeStamp(this.result.proposal.internalDeadLineDate), currentDate, 'dateObject', 'dateObject') === -1) {
      this.proposalDataBindObj.dateWarningList.set('internalDeadline', 'Internal deadline date already passed.');
    }
  }
}
