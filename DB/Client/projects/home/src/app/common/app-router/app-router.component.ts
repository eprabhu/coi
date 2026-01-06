import {Component, OnInit} from '@angular/core';
import {CommonService} from "../services/common.service";
import {copyToClipboard} from "../../../../../fibi/src/app/common/utilities/custom-utilities";
import {getFromLocalStorage} from "../../../../../fibi/src/app/common/utilities/user-service";

@Component({
    selector: 'app-app-router',
    templateUrl: './app-router.component.html',
    styleUrls: ['./app-router.component.scss']
})
export class AppRouterComponent implements OnInit {

    constructor(public commonService: CommonService) {
    }

    ngOnInit(): void {
    }

    redirectTo(applicationName: 'fibi' | 'COI') {
        window.location.href = this.commonService[applicationName + 'Url'];
    }
}
