import { Component, OnInit } from '@angular/core';
import { InstituteProposal } from '../institute-proposal-interfaces';
import { DataStoreService } from '../services/data-store.service';
import { InstituteProposalService } from '../services/institute-proposal.service';

@Component({
  selector: 'app-instProposalMedusa',
  template: `<app-medusa *ngIf="_instituteService.ipSectionConfig['207'].isActive" [medusa] = "medusa"></app-medusa>`
})
export class MedusaComponent implements OnInit {

  medusa: any = {};

  constructor(public _instituteService: InstituteProposalService,
    private _dataStore: DataStoreService) { }

  ngOnInit() {
    this.getIPNumberFromGeneralDetails();
  }

  getIPNumberFromGeneralDetails() {
    const data: InstituteProposal = this._dataStore.getData(['instProposal']);
    this.medusa.projectId = data.instProposal.proposalNumber;
    this.medusa.moduleCode = 2;
  }

}
