import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-coi-notification-banner',
	templateUrl: './coi-notification-banner.component.html',
	styleUrls: ['./coi-notification-banner.component.scss']
})
export class CoiNotificationBannerComponent {

	@Input() notificationType: string;
	@Input() isShowNotification = true;
	@Output() isShowNotificationChange = new EventEmitter<boolean>();

	constructor() { }

	toggleNotificationVisibility(): void {
		this.isShowNotification = !this.isShowNotification;
		this.isShowNotificationChange.emit(this.isShowNotification);
	}

}
