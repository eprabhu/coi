/**
 * Author: Aravind P S
 * Parent Component which calls details and person List section
 */
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProposalService } from '../services/proposal.service';
import { CurrentPendingService } from './current-pending.service';
import { PersonDetailsComponent } from './person-details/person-details.component';
import { PersonEventInteractionService } from './person-event-interaction.service';

@Component({
  selector: 'app-current-pending',
  templateUrl: './current-pending.component.html',
  styleUrls: ['./current-pending.component.css'],
})
export class CurrentPendingComponent implements OnInit, OnDestroy {

  personDetails: any = {};
  @ViewChild(PersonDetailsComponent, { static: false }) childPerson: PersonDetailsComponent;

  constructor(private router: Router, public _eventService: PersonEventInteractionService,
    public _proposalService: ProposalService, private _cpService: CurrentPendingService,
    private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.getPersonDetails();
    this._proposalService.$currentTab.next('C&P');
  }

  getPersonDetails() {
    const requestObject = {
      'moduleCode': 3,
      'moduleItemKey': this._activatedRoute.snapshot.queryParamMap.get('proposalId')
    };
    this._cpService.getPersonList(requestObject).subscribe((data: any) => {
      this.personDetails = data;
      this.checkActivePersonList();
    });
  }
  /**
   * Hides person widget when no report is generated for a proposal in view mode
   */
  checkActivePersonList() {
    if (this._proposalService.proposalMode !== 'edit' && this.personDetails.proposalPersons
    && !this.personDetails.proposalPersons.find(e => e.isGenerated)) {
      this._eventService.$isPersonWidgetVisible.next(false);
    }
  }
  /**
   * set the generated flag of a person to true after the generate service request
   */
  setGenerateFlag() {
    if (this.personDetails && this.personDetails.proposalPersons && this.personDetails.proposalPersons.length) {
      this.personDetails.proposalPersons.forEach(e => { if (e.isChecked && !e.isGenerated ) {
        e.isGenerated = true;
       } });
    }
  }

  ngOnDestroy() {
    this._eventService.$personList.next([]);
    this._eventService.$isPersonWidgetVisible.next(true);
    this._eventService.$isGenerateOptionEnable.next(true);
  }
}
