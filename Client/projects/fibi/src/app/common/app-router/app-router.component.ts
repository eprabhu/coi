import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonService } from './../services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../utilities/subscription-handler';
import { NavigationService } from '../services/navigation.service';
import { SSO_TIMEOUT_ERROR_MESSAGE, SSO_LOGOUT_URL } from '../../app-constants';
import { AutoSaveService } from '../services/auto-save.service';
import { WebSocketService } from '../services/web-socket.service';
@Component({
  selector: 'app-app-router',
  templateUrl: './app-router.component.html',
  styleUrls: ['./app-router.component.css']
})
export class AppRouterComponent implements OnInit, OnDestroy {
  isShowLoader: boolean;
  $subscriptions: Subscription[] = [];
  errorMessage = SSO_TIMEOUT_ERROR_MESSAGE;

  constructor(public _commonService: CommonService, public _autoSaveService: AutoSaveService, public _navigationService: NavigationService,
    public webSocket: WebSocketService) {
  }

  ngOnInit() {
    this.$subscriptions.push(this._commonService.isShowLoader.subscribe(data =>
      setTimeout(() => {
        this.isShowLoader = data;
      }, 0)));
  }

  redirectToLogoutPage() {
    localStorage.clear();
    window.location.href = SSO_LOGOUT_URL;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadEventHandler() {
    this.webSocket.releaseAllModuleLock();
    sessionStorage.setItem('tabId', this._commonService.tabId);
  }

  showChatWindow(): void {
    if(this.webSocket.getLockChatEnabled(this.webSocket.currentModuleDescription)) {
      this.webSocket.setChatWindowStatus(true);
    }
  }

  leavePage() {
    window.history.back();
  }

  closeToast() {
    const toastEl: HTMLElement = document.getElementById('app-toast');
    const LAST_SAVED_TOAST = document.getElementById('last-saved-toast');
    toastEl.className = this._commonService.appToastContent = '';
    this._commonService.appLoaderContent = 'Loading...';
    this._commonService.isShowOverlay = false;
    toastEl.style.width = 'max-content';
    if (LAST_SAVED_TOAST) {
      LAST_SAVED_TOAST.classList.remove('invisible');
    }
  }
   reload () {
    window.location.reload();
   }

}
