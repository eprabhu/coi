import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../common/services/navigation.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { RoleMaintainanceService } from './role-maintainance.service';

declare var $: any;
@Component({
	selector: 'app-role-maintainance',
	templateUrl: './role-maintainance.component.html',
	styleUrls: ['./role-maintainance.component.css'],
	providers: [RoleMaintainanceService]
})

export class RoleMaintainanceComponent implements OnInit, OnDestroy {

	showInfo = false;
	infoMessage: any;
	showTabs: any;
	$subscriptions: Subscription[] = [];

	constructor(
		private _navigationService: NavigationService,
		private _router: Router,
		public roleMaintenanceService: RoleMaintainanceService
	) {
		this.routerEventSubscription();
	}

	ngOnInit() { }

	openInfo(): void {
		this.showInfo = true;
		if (this._navigationService.currentURL.includes('userRolesList')) {
			this.infoMessage =
				'This module lists the roles assigned to users.There are options to add a new role and to remove a role from the user is also possible.This module lists the roles assigned to users.';
		} else {
			this.infoMessage =
				'There are options to add a new role with available rights, delete an existing role, and edit the rights of an existing role.';
		}
	}

	private routerEventSubscription(): void {
		this.$subscriptions.push(this._router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.showTabs = event.urlAfterRedirects.includes('userRoleMaintain') ? false : true;
			}
		}));
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

}
