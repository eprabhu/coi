import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-award-card',
  imports: [MatIconModule],
  template: `
      <div class="data-grid">
        <div class="mr-15">
            <img class="profile_img" [src]="imagePath" alt="an icon for representing a person">
        </div>
        <div class="ms-2 mr-8">
            <h2 class="heading">{{data.title}}({{data.award_number}})</h2>
            <p class="sub-heading">{{data.pi_name}} (PI)</p>
        </div>
        <div class="align-items-end d-flex ms-auto">
          <button (click)="openAward(data.award_number)" class="align-items-center btn btn-primary d-flex fs-14"
          title="Click here to view award details" aria-label="Click here to view award details">
          <mat-icon class="me-2">visibility</mat-icon>View</button>
        </div>
      </div>
      <div>
          <p class="sub-heading">
            <span> <i aria-hidden="true" class="fa fa-calendar fa-large"></i></span>
            {{data.start_date}} - {{data.end_date}}
          </p>
          <p class="sub-heading">
            <span > <i aria-hidden="true" class="fa fa-home fa-large"></i></span>
            {{data.lead_unit}}({{data.unit_number}})</p>
          <p class="sub-heading">
            <span>
            <img class="" src="/assets/images/sponsor.png" alt="an icon for represrnting a person">
            </span> {{data.sponsor_name}}({{data.sponsor_code}})</p>
      </div>
  `,
  styles: [
    `.profile_img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      object-position: 50% 50%;
      border-radius: 100%;
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
      display:flex;
      justify-content: start;
    }
     .sub-heading span img {
      height:18px;
      width:18px;
    }
    .sub-heading span {
      margin-right: 2rem;
    }
    .sub-heading span i {
      font-size: 2rem;
    }
  `],
})
export class AwardCardComponent {

  @Input() data: any = {};
  @Input() imagePath: any = {};

  constructor(public graphDataService: DataService) {}

  openAward(id) {
    this.graphDataService.openDetailsEvent.next({'node': 'Award', 'id': id});
  }

}
