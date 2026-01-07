import { Component } from '@angular/core';
import { CommonService } from '../common/services/common.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EngagementMigrationCount, LoginPersonDetails } from '../common/services/coi-common.interface';
import { HeaderService } from '../common/header/header.service';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss']
})

export class LogoutComponent {

    $subscriptions: Subscription[] = [];

    constructor(private _commonService: CommonService, private _router: Router, private _headerService: HeaderService) { }

    ngOnInit() {
        this.$subscriptions.push(this._commonService.signOut().subscribe(
            null,
            null,
            () => {
                this.clearCurrentUserAndGotoLogin();
        }));
    }

    clearCurrentUserAndGotoLogin() {
        if (!this._commonService.enableSSO) {
            ['authKey', 'cookie', 'sessionId', 'currentTab'].forEach((item) => localStorage.removeItem(item));
            this._commonService.currentUserDetails = new LoginPersonDetails();
        }
        this._headerService.migrationChecked = false;
        this._headerService.hasPendingMigrations = false;
        this._headerService.migratedEngagementsCount = new EngagementMigrationCount();
    }

    async login() {
        if (this._commonService.enableSSO) {
            try {
                const loginDetails: any = await this._commonService.authLogin();
                this._commonService.onSuccessFullLogin(loginDetails);
            } catch (e) {
                this._commonService.onFailedLogin(e);
            }
        } else {
                this._router.navigate(['/login']);
        }
    }

}
