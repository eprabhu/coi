import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EngagementCardActionEvent, LegacyEngagement } from '../migrated-engagements-interface';

@Component({
	selector: 'app-migrated-engagements-card',
	templateUrl: './migrated-engagements-card.component.html',
	styleUrls: ['./migrated-engagements-card.component.scss'],
})
export class MigratedEngagementsCardComponent {

	@Input() engagementDetails = new LegacyEngagement();
	@Input() isShowFooter = true;
	@Input() customClass = '';
	@Input() isShowExcludeBtn = false;
	@Output() cardActions = new EventEmitter<EngagementCardActionEvent>();
	isTriggeredFromSlider = true;

	// Emits user-selected action from the card along with the engagement details
	handleCardAction(action: 'VIEW' | 'EXCLUDE' | 'PROCEED' | 'REVERT'): void {
		this.cardActions.emit({
			action: action,
			engagementDetails: this.engagementDetails
		});
	}

}
