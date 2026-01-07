import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {CommonService} from "../common/services/common.service";

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

    deployMap = environment.deployUrl;

    constructor(private _router: Router, private _commonService: CommonService) {
    }

    ngOnInit() {
        this._commonService.clearLocalStoragePersonDetails();
    }

    login() {
        (this._commonService.enableSSO === true) ? this._router.navigate(['home']) : this._router.navigate(['/login']);
    }
}

