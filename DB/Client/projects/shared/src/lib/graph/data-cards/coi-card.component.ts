import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-coi-card',
  template: `
      <div class="data-grid">
        <div class="mr-15">
            <img class="profile_img" [src]="imagePath" alt="an Ican for represrnting a person">
        </div>
        <div class="ms-2">
            <h2 class="heading">Disclosure Number{{data.disclosure_number}}</h2>
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
export class COICardComponent {

  @Input() data: any = {};
  @Input() imagePath: any = {};

}
