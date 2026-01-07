import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { subscriptionHandler } from '../utilities/subscription-handler';
import { CommonService } from "../services/common.service";
import { NavigationEnd, Router } from '@angular/router';
import { focusElementById } from '../utilities/custom-utilities';
import { APPLICATION_MAIN_ROUTER_ID, SSO_LOGOUT_URL, SSO_TIMEOUT_ERROR_MESSAGE } from '../../app-constants';
import { AutoSaveService } from '../services/auto-save.service';
@Component({
    selector: 'app-app-router',
    templateUrl: './app-router.component.html',
    styleUrls: ['./app-router.component.scss']
})
export class AppRouterComponent implements OnInit, OnDestroy {

    isShowLoader = false;
    $subscriptions = [];
    errorMessage = SSO_TIMEOUT_ERROR_MESSAGE;
    APPLICATION_MAIN_ROUTER_ID = APPLICATION_MAIN_ROUTER_ID;

    @HostListener('window:scroll', ['$event'])
    scrollEvent(event) {
        const pageYOffset = this.elementRef.nativeElement.querySelector('.canvas').scrollTop;
        this.commonService.$ScrollAction.next({ event, pageYOffset });
    }

    constructor(public commonService: CommonService, private elementRef: ElementRef,
        private _router: Router, public autoSaveService: AutoSaveService) {
        this._router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                this.commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_ROUTER_NAVIGATION_END' });
                focusElementById(APPLICATION_MAIN_ROUTER_ID);
                window.scroll(0, 0);
                this.commonService.removeApplicationPreLoader();
            }
        });
    }

    ngOnInit(): void {
        this.$subscriptions.push(this.commonService.isShowLoader.subscribe(data =>
            setTimeout(() => {
                this.isShowLoader = data;
            }, 0)));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    redirectToLogoutPage() {
        localStorage.clear();
        window.location.href = SSO_LOGOUT_URL;
    }

    triggerAutoSave(): void {
        this.autoSaveService.commonSaveTrigger$.next({ action: 'RETRY' });
    }
}
