
import { throwError as observableThrowError, Observable, from } from 'rxjs';
/**
 * custom request handler for fibi
 * Author Mahesh Sreenath V M
 * this will intercept every request sent from application to Server.
 */
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';

import { Router } from '@angular/router';
import { CommonService } from './common.service';
import { SSO_TIMEOUT_ERROR_CODE } from '../../app-constants';
/**
 * this is used to add authorization token and handle error on token expiration
 * and loader for the entire application is handled here
 * we show the loader on every request start and switch off the loader on request finish or Error.
 * For WAF related issues the Loader is not switched off automatically
 * if the isManualLoader is switched on.See common.service.ts documentation for more details
 * https://docs.google.com/document/d/1x-__S6RpPgnbkS0VmPEyVO3kqtLGit1VFgzTtpImBFs/edit?usp=sharing
 * the scenarios for SSO and Non- SSo are handled differently
 * in SSO environments we can't navigate the user to our login page so the app will use a
 * hard reload since the app login is called on behind the scene with current user
 * the JWT token will be regenerated.But on Non-SSO environments we clear current user credentials
 * and navigates him to login screen. In production most cases we uses SSO.
 */
@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
    constructor(private _router: Router, private _commonService: CommonService) { }
    AuthToken: string;
    /**catches every request and adds the authentication token from local storage
     * creates new header with auth-key
    */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.AuthToken = this._commonService.getCurrentUserDetail('Authorization');
        if (this.AuthToken) {
            req = req.clone({ headers: req.headers.set('Authorization', this.AuthToken) });
        }
        if (!this._commonService.isPreventDefaultLoader) {
            this._commonService.isShowLoader.next(true);
        }
        return next.handle(req).pipe(
            catchError((error) => {
                if (!this._commonService.isManualLoaderOn) {
                    this._commonService.isShowLoader.next(true);
                    this._commonService.appLoaderContent = 'Loading...';
                    this._commonService.isShowOverlay = false;
                }
                if (error.status === 401) {
                    this._commonService.enableSSO ? localStorage.clear() :
                    ['authKey', 'cookie', 'sessionId', 'currentTab'].forEach((item) => localStorage.removeItem(item));
                    this._commonService.currentUserDetails = {};
                    this._commonService.enableSSO ? window.location.reload() : this._router.navigate(['/login']);
                }
                if (error.status === SSO_TIMEOUT_ERROR_CODE && this._commonService.enableSSO) {
                    const TOAST_ELEMENT = document.getElementById('app-toast');
                    TOAST_ELEMENT.remove();
                    document.getElementById('timeoutModalButton').click();
                }
                if (error.error instanceof Blob) {
                    return from(Promise.resolve(error).then(async x => {
                        throw new HttpErrorResponse({ error: JSON.parse(await x.error.text()), headers: x.headers,
                            status: x.status, statusText: x.statusText, url: x.url || undefined });
                    }));
                }
                return observableThrowError(error);
            }),

            finalize(() => {
                if (!this._commonService.isManualLoaderOn) {
                    this._commonService.isShowLoader.next(false);
                    this._commonService.appLoaderContent = 'Loading...';
                    this._commonService.isShowOverlay = false;
                }
            })) as any;
    }
}
