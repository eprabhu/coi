import { Component, OnInit } from '@angular/core';
import { MigratedEngagementsService } from '../migrated-engagements.service';
import { CommonModule } from '@angular/common';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { MatIconModule } from '@angular/material/icon';
import { EngagementRelationshipDetailsComponent } from '../engagement-relationship-details/engagement-relationship-details.component';

@Component({
  selector: 'app-view-eng-relationship-slider',
  standalone: true,
  imports: [CommonModule, SharedComponentModule, MatIconModule, EngagementRelationshipDetailsComponent],
  templateUrl: './view-eng-relationship-slider.component.html',
  styleUrls: ['./view-eng-relationship-slider.component.scss']
})
export class ViewEngRelationshipSliderComponent implements OnInit {

  constructor(public migratedEngagementService: MigratedEngagementsService) { }

  ngOnInit() {
  }

}
