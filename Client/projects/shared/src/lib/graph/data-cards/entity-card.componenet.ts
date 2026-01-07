import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [MatIconModule],
  selector: 'app-entity-card',
  template: `
      <div class="data-grid">
        <div class="mr-15">
            <img class="profile_img" [class.h-auto]="data.is_sponsor == 'Y'" [src]="imagePath" alt="an icon for representing a entity">
        </div>
        <div class="ms-2">
            <h2 class="heading">{{data.name}}</h2>
            <p class="sub-heading">Country : {{data.country_name}}</p>
            <p class="sub-heading">Ownership Type : {{data.ownership_type}}</p>
            <p class="sub-heading">Status : {{data.document_status_type}}</p>
        </div>
        <div class="align-items-end d-flex ms-auto">
          <button (click)="openEntity(data.id)" class="align-items-center btn btn-primary d-flex fs-14"
          title="Click here to view entity details" aria-label="Click here to view entity details">
          <mat-icon class="me-2">visibility</mat-icon>View</button>
        </div>
      </div>
  `,
  styles: [
    `.profile_img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      object-position: 50% 50%;
    }
    .data-grid {
      display: flex;
      flex-direction: row;
    }
    .heading {
      font-weight: bold;
      font-size: 16px;
      margin: 3px 0;
      color: #007dec;
    }
    .sub-heading {
      font-weight: bold;
      font-size: 14px;
      margin: 5px 0;
    }
  `],
})
export class EntityCardComponent {

  @Input() data: any = {};
  @Input() imagePath: any = {};

  constructor(public graphDataService: DataService) {}

  openEntity(id) {
    const ID = id.includes('ENT') ? id.replace('ENT', '') : id;
    this.graphDataService.openDetailsEvent.next({'node': 'Entity', 'id': ID});
  }

}
