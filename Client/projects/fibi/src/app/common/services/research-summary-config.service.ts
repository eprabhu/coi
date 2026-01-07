import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Subject } from 'rxjs';

@Injectable()
export class ResearchSummaryConfigService {
      isResearchSummary = false;

      constructor() { }

      expenditureVolume = new BehaviorSubject<boolean>(
            (localStorage.getItem('expenditureVolumWidget') === 'true') ||
            (localStorage.getItem('expenditureVolumWidget') == null));
      researchSummary = new BehaviorSubject<boolean>(
            (localStorage.getItem('researchSummaryWidget') === 'true') ||
            (localStorage.getItem('researchSummaryWidget') == null));
      awardedProposal = new BehaviorSubject<boolean>(
            (localStorage.getItem('awardedProposalBySponsorWidget') === 'true') ||
            (localStorage.getItem('awardedProposalBySponsorWidget') == null));
      awardBysponsor = new BehaviorSubject<boolean>(
            (localStorage.getItem('awardBysponsorTypesWidget') === 'true') ||
            (localStorage.getItem('awardBysponsorTypesWidget') == null));
      proposalBySponsor = new BehaviorSubject<boolean>(
            (localStorage.getItem('proposalBySponsorTypesWidget') === 'true') ||
            (localStorage.getItem('proposalBySponsorTypesWidget') == null));
      inProgressproposal = new BehaviorSubject<boolean>(
            (localStorage.getItem('inProgressproposalBySponsorWidget') === 'true') ||
            (localStorage.getItem('inProgressproposalBySponsorWidget') == null));
      notifyActionList = new BehaviorSubject<boolean>(
            (localStorage.getItem('actionList') === 'true') ||
            (localStorage.getItem('actionList') == null));
      supportList = new BehaviorSubject<boolean>(
            (localStorage.getItem('fibiSupport') === 'true') ||
            (localStorage.getItem('fibiSupport') == null));

      selectedUnit$  =  new BehaviorSubject<any>({});
}
