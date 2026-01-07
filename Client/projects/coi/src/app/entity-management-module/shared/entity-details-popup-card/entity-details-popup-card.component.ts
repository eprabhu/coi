import { Component, Input } from '@angular/core';
import { EntityDetailsInPopup } from '../entity-interface';

@Component({
  selector: 'app-entity-details-popup-card',
  templateUrl: './entity-details-popup-card.component.html',
  styleUrls: ['./entity-details-popup-card.component.scss']
})
export class EntityDetailsPopupCardComponent {

@Input() entityDetails = new EntityDetailsInPopup();

}
