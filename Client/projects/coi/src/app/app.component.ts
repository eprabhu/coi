import { Component, HostListener, OnInit } from '@angular/core';
import { CommonService } from './common/services/common.service';
import { getFromLocalStorage } from 'projects/fibi/src/app/common/utilities/user-service';
import { openModal } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { Router } from '@angular/router';
import { focusElementById } from './common/utilities/custom-utilities';
import { APPLICATION_FULL_LOADER_ID } from './app-constants';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title = 'coi';
    modalMessage: string;

    constructor(private _commonService: CommonService, private _router: Router) {
        this._commonService.isShowPreLoader = true;
        focusElementById(APPLICATION_FULL_LOADER_ID);
    }

    ngOnInit(): void {
        setTimeout(() => {
            this._commonService.removeApplicationPreLoader();
        }, 3600);
    }

	@HostListener('window:storage', ['$event'])
	onStorageChange(event) {
		const CURRENT_USER = getFromLocalStorage();
		const REFRESH_MODAL = document.getElementById('refreshModal');
		if (CURRENT_USER) {
			if (this._commonService.getCurrentUserDetail('personID') != CURRENT_USER.personID) {
				this.openRefreshModal(REFRESH_MODAL);
			} else {
                if(window.location.href.includes('/logout')) {
                    this._commonService.redirectToCOI();
                } else {
                    this.closeModalOrRelogin(REFRESH_MODAL);
                }
			}
		} else {
			this.openRefreshModal(REFRESH_MODAL);
		}
	}

	closeModalOrRelogin(refreshModal) {
		if (refreshModal.classList.contains('show')) {
			this.closeRefreshModal();
		}
		if (window.location.href.includes('/login')) {
			this.modalMessage = "You logged in via another tab. Please click the Refresh button to continue."
			openModal('refreshModal', {
				backdrop: 'static',
				keyboard: false,
				focus: true
			});
		}
	}

	private openRefreshModal(refreshModal): void {
		if (!refreshModal.classList.contains('show') && !window.location.href.includes('/login')) {
			openModal('refreshModal', {
				backdrop: 'static',
				keyboard: false,
				focus: true
			});
			this.modalMessage = "You (" + this._commonService.getCurrentUserDetail('fullName') + ") are currently logged out. Please click the Refresh button to continue."
		}
	}

	refreshPage(): void {
		const CURRENT_USER = getFromLocalStorage();
		if (CURRENT_USER) {
			if (window.location.href.includes('/login')) {
				this._commonService.redirectToCOI();
			} else {
				location.reload();
				sessionStorage.clear();
			}
		} else {
			this._router.navigate(['/login']);
		}
		this.closeRefreshModal();
	}

	private closeRefreshModal(): void {
		document.getElementById('refreshModal-dismiss-btn').click();
		setTimeout(() => {
			document.body.removeAttribute("style");
		}, 1500);
	}
}
