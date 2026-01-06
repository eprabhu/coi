import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {LoginService} from "./login.service";
import {CommonService} from "../common/services/common.service";
import {subscriptionHandler} from "../../../../fibi/src/app/common/utilities/subscription-handler";
import {HTTP_ERROR_STATUS} from "../../../../fibi/src/app/app-constants";
import {HttpErrorResponse} from "@angular/common/http";
import { COMMON_ERROR_TOAST_MSG } from '../app-constants';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [LoginService]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

    credentials = {
        username: '',
        password: ''
    };
    isLoggedInWithInactiveUser = false;
    $subscriptions: Subscription[] = [];

    @ViewChildren('input') usernameInput: any;
    @ViewChild('input', {static: true}) input: ElementRef | undefined;
    isCapsOn = false;
    showPassword = false;
    isResetPassword = false;
    isSaving = false;
    isShowLoader = false;

    constructor(private _router: Router, private _loginService: LoginService, public commonService: CommonService) {
    }

    ngOnInit(): void {
        this.$subscriptions.push(this.commonService.isShowLoader.subscribe(data =>
            setTimeout(() => {
                this.isShowLoader = data;
            }, 0)));
        this.commonService.removeApplicationPreLoader();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.usernameInput.first.nativeElement.focus();
        });
    }

    OnCapsLockClick(event: { getModifierState: (arg0: string) => any; }) {
        if (event.getModifierState) {
            this.isCapsOn = event.getModifierState('CapsLock') ? true : false;
        }
    }

    login() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._loginService.login(this.credentials).subscribe((data: any) => {
                this.isSaving = false;
                if (data.body != null) {
                    if (data.body) {
                        this.commonService.updateLocalStorageWithUserDetails(data);
                        this.commonService.getRequiredParameters().then(systemParameters => {
                            this.commonService.assignSystemParameters(systemParameters);
                            this.commonService.redirectToCOI();
                        }, (err: any) => {
                            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                        });
                    }
                }
            }, (err: HttpErrorResponse) => {
                this.isSaving = false;
                if (err.status == 401) {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'The username or password that you have entered is incorrect');
                } else if (err.status == 403){
                    this.isLoggedInWithInactiveUser = true;
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            }));
        }
    }

    resetVisiblityIcon() {
        if(!this.credentials.password) {
            this.showPassword = false;
        }
    }

}
