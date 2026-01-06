import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [MatIconModule],
  selector: 'app-travel-card',
  template: `
      <div class="data-grid">
        <div class="mr-15">
            <img class="profile_img" [src]="imagePath" alt="an icon for representing a person">
        </div>
        <div class="ms-2 mr-8">
            <h2 class="heading">Travel Number{{data.travel_number}}</h2>
        </div>
        <div class="align-items-end d-flex ms-auto">
          <button (click)="openTravelDisclosure(data.travel_number)" class="align-items-center btn btn-primary d-flex fs-14"
          title="Click here to view travel disclosure details" aria-label="Click here to view travel disclosure details">
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
export class TravelDisclosureCardComponent {

  @Input() data: any = {};
  @Input() imagePath: any = {};

  constructor(public graphDataService: DataService) {}

  openTravelDisclosure(id) {
    this.graphDataService.openDetailsEvent.next({'node': 'TravelDisclosure', 'id': id});
  }

}
