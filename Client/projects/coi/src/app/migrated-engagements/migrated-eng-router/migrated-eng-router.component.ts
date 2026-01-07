import { Component } from '@angular/core';
import { MigratedEngagementsService } from '../migrated-engagements.service';

@Component({
  selector: 'app-migrated-eng-router',
  templateUrl: './migrated-eng-router.component.html',
  styleUrls: ['./migrated-eng-router.component.scss']
})
export class MigratedEngRouterComponent {

  constructor(public migratedEngagementService: MigratedEngagementsService) { }

}
