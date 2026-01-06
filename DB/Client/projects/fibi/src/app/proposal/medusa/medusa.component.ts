import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProposalService } from '../services/proposal.service';

@Component({
    selector: 'app-proposalMedusa',
    templateUrl: './medusa.component.html',
    styleUrls: ['./medusa.component.css']
})
export class MedusaComponent implements OnInit {
    proposalId: any;
    medusa: any = {};

    constructor(private route: ActivatedRoute, public _proposalService: ProposalService) {
    }

    ngOnInit() {
        this.proposalId = this.route.snapshot.queryParams['proposalId'];
        this.medusa.moduleCode = 3;
        this.medusa.projectId = this.proposalId;
    }

}
