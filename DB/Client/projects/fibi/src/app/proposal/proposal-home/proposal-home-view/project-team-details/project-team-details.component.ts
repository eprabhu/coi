import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProposalHomeService } from '../../proposal-home.service';

@Component({
  selector: 'app-project-team-details',
  templateUrl: './project-team-details.component.html',
  styleUrls: ['./project-team-details.component.css']
})
export class ProjectTeamDetailsComponent implements OnInit {
  @Input() dataVisibilityObj: any = {};
  @Input() result: any = {};
  selectedpersonDetails: any = {};
  $subscriptions: Subscription[] = [];


  isRolodexViewModal = false;
  type = 'PERSON';
  isTraining = false;
  id: string;
  personDescription: string;
  trainingStatus: string;

  constructor(private _proposalHomeService: ProposalHomeService) { }

  ngOnInit() {
    this.dataVisibilityObj.isPersonData = true;
  }

 /**
   * @param  {} person
   */
   /* fetches employee or non employee details of project team based on the value of nonEmployeeFlag */
  fetchProjectTeamMemberDetails(person) {
    this.isRolodexViewModal = true;
    this.personDescription = person.projectRole;
    if (person.nonEmployeeFlag === 'N') {
      this.id = person.personId;
      this.type = 'PERSON';
    } else {
      this.id = person.personId;
      this.type = 'ROLODEX';
    }
  }

setPersonRolodexModalView(personRolodexObject) {
    this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
    this.type = 'PERSON';
  }

  viewKeyPerson() {
    const a = document.createElement('a');
    if (this.selectedpersonDetails.hasOwnProperty('personId')) {
      a.href = '#/fibi/person/person-details?personId=' + this.selectedpersonDetails.personId;
    } else {
      a.href = '#/fibi/rolodex?rolodexId=' + this.selectedpersonDetails.rolodexId;
    }
    a.target = '_blank';
    a.click();
  }
}
