import { CommonService } from './../common/services/common.service';
import { Component, AfterViewInit, ViewChild, ViewChildren, Renderer2, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { LoginService } from './login.service';
import { Subscription } from 'rxjs';
import {subscriptionHandler} from "../../../../fibi/src/app/common/utilities/subscription-handler";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [LoginService]
})

export class LoginComponent implements AfterViewInit, OnInit, OnDestroy {
    credentials = {
        username: '',
        password: ''
    };
    loginFail = false;
    $subscriptions: Subscription[] = [];

    @ViewChildren('input') usernameInput;
    @ViewChild('input', { static: true }) input: ElementRef;
    isCapsOn = false;
    isPassword = true;

    constructor(private loginService: LoginService, private router: Router, private renderer: Renderer2,
        private _router: Router, private _http: HttpClient, private _commonService: CommonService) { }

    ngOnInit() {
        const authToken = this._commonService.getCurrentUserDetail('Authorization');
        if (authToken) {
            if (localStorage.getItem('currentUrl') != null) {
                window.location.hash = localStorage.getItem('currentUrl');
            }
            this.router.navigate(['fibi/dashboard']);
        }
    }

    ngAfterViewInit() {
        this.usernameInput.first.nativeElement.focus();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
    async login() {
        if (this.credentials.username && this.credentials.password) {
            this.$subscriptions.push(this.loginService.login(this.credentials.username, this.credentials.password).subscribe(
                (data: any) => {
                    if (data.body != null) {
                        if (data.body.login === true) {
                            this._commonService.updateLocalStorageWithUserDetails(data);
                            this._commonService.getRequiredParameters().then(systemParameters => {
                                this._commonService.assignSystemParameters(systemParameters);
                            });
                            this.loginService.setLeadUnits(data.body.leadUnits);
                            this._commonService.fetchPermissions().then((response: any) => {
                                this._commonService.rightsArray = response || [];
                            });
                            if (localStorage.getItem('currentUrl') != null && localStorage.getItem('currentUrl').indexOf('login') === -1) {
                                window.location.hash = localStorage.getItem('currentUrl');
                            } else {
                                this.router.navigate(['/home']);
                            }
                        } else {
                            this.loginFail = true;
                            this.router.navigate(['/home']);
                            this.credentials.username = '';
                            this.credentials.password = '';
                            // this.renderer.invokeElementMethod(this.input.nativeElement, 'focus');
                        }
                    }
                }));
        } else {
            this.loginFail = true;
        }
    }

    OnCapsLockClick(event) {
        if (event.getModifierState) {
            this.isCapsOn = event.getModifierState('CapsLock') ? true : false;
        }
    }
}
