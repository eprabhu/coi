
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
import {SSO_TIMEOUT_ERROR_CODE} from "../../../../../fibi/src/app/app-constants";
import { LoginPersonDetails } from './coi-common.interface';
import { openModal } from '../../../../../fibi/src/app/common/utilities/custom-utilities';
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

    currentActiveAPICount = 0;

    constructor(private _router: Router, private _commonService: CommonService) { }

    /**catches every request and adds the authentication token from local storage
     * creates new header with auth-key
    */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this._commonService.isPreventDefaultLoader) {
            this._commonService.loaderRestrictedUrls.push(req.urlWithParams);
        } else {
            this.currentActiveAPICount++;
            this._commonService.isShowLoader.next(true);
        }
        return next.handle(req).pipe(
            catchError((error) => {
                if (error.status === 401 || this.isUnAuthorized(error)) {
                    this._commonService.enableSSO ? localStorage.clear() : this._commonService.removeUserDetailsFromLocalStorage();
                    this._commonService.currentUserDetails = new LoginPersonDetails();
                    this._commonService.enableSSO ?  this._router.navigate(['error/401']) : this._router.navigate(['/login']);
                }

                if (error.status === 403 && !window.location.href.includes('/login')) {
                    this._commonService.navigateToErrorRoute('FORBIDDEN');
                }

                if (error.status === SSO_TIMEOUT_ERROR_CODE && this._commonService.enableSSO) {
                    openModal('sessionTimeoutModal', {
                        backdrop: 'static',
                        keyboard: false,
                        focus: false
                    });
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
                const INDEX = this._commonService.loaderRestrictedUrls.indexOf(req.urlWithParams);
                INDEX > -1 ? this._commonService.loaderRestrictedUrls.splice(INDEX, 1) : this.currentActiveAPICount--;
                if (this.currentActiveAPICount <= 0) {
                    this._commonService.isShowLoader.next(false);
                    this._commonService.appLoaderContent = 'Loading...';
                }
            })) as any;
    }

    isUnAuthorized(error: HttpErrorResponse) {
        return error && error.error && error.error.message == "missing authorization header";
    }
}
