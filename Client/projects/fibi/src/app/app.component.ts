import { Router } from '@angular/router';
import { CommonService } from './common/services/common.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  providers: [],
})

export class AppComponent implements OnInit {

  constructor(public _commonService: CommonService, private _router: Router) { }

  ngOnInit() {
    this.setUniqueTabId();
    this._commonService.isValidUser ? this.readRedirectPathFromURL() : this.redirectToUnauthorizedPath();
    this.removeLoader();
  }

  readRedirectPathFromURL() {
    let url = sessionStorage.getItem('url');
    if (url) {
      url = url.substr(5);
      url = url.replace(/AND/g, '&');
      window.location.hash = url;
      sessionStorage.clear();
    }
  }

  redirectToUnauthorizedPath() {
    this._router.navigate(['error/401']);
  }

  removeLoader() {
    setTimeout(() => {
      const LOADER = document.getElementById('fibi-full-loader');
      document.body.style.overflow = 'visible';
      if (LOADER) {
        LOADER.remove();
      }
    }, 3600);
  }

  setUniqueTabId() {
    const tabId = sessionStorage.getItem('tabId') || this.createUNiqueTabId();
    this._commonService.tabId = tabId;
    sessionStorage.removeItem('tabId');
  }

  createUNiqueTabId(): string {
    return new Date().getTime().toString();
  }
}
