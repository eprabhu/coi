import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, Params } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { HeaderService } from './header.service';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    isAccessible = false;
    currentTheme = 'green';
    fontSizeValue: any = 64 + '%';
    fibiTheme: any;
    currentContrast: number;

    isAdmin = false;
    isShowMore = false;
    isNotificationBox = false;
    isShowLockList = false;
    showMenu = true;
    docId: string;
    personId: string;
    fullName: string;
    userName: string;
    adminStatus: string;
    logo: string;
    defaultThemeColor = 'theme-green';
    $subscriptions: Subscription[] = [];
    currentNotificationTab: 'NEW' | 'ALL' = 'NEW';
    isShowNotification = false;
    badgeCount = 0;
    collapseViewMore = {};
    allNotificationList: any = {};
    notificationList: any = {};
    closeNotification = false;
    priorityNotificationList: any = [];
    priorityNotificationMessage: string;

    themes = new Map([
        ['green', 'theme-green'],
        ['greendark', 'theme-green-dark'],
        ['greenlight', 'theme-green-light'],
        ['blue', 'theme-blue'],
        ['bluedark', 'theme-blue-dark'],
        ['bluelight', 'theme-blue-light'],
    ]);

    @ViewChild('notificationBar', { static: false }) notificationBar: ElementRef;
    @ViewChild('configurationBar', { static: false }) configurationBar: ElementRef;
    @ViewChild('showWheelChair', { static: true }) showWheelChair: ElementRef;
    @ViewChild('themeConfigurationBar', { static: false }) themeConfigurationBar: ElementRef;
    @ViewChild('sideBarMenu', { static: true }) sideBarMenu: ElementRef;
    @ViewChild('notificationOverlay', { static: true }) notificationOverlay: ElementRef;

    applicationAdminstrator: any;
    researchAdmin: any;
    canViewAdminDashboard = false;
    rightList = ['APPLICATION_ADMINISTRATOR', 'MAINTAIN_QUESTIONNAIRE', 'MAINTAIN_ROLODEX', 'MAINTAIN_SPONSOR', 'MAINTAIN_USER_ROLES',
        'MAINTAIN_ROLE', 'MAINTAIN_ORCID_WORKS', 'MAINTAIN_PERSON', 'MAINTAIN_SAP_FEED', 'VIEW_SAP_FEED', 'MAINTAIN_MANPOWER_FEED',
        'MAINTAIN_DELEGATION', 'AGREEMENT_ADMINISTRATOR', 'MAINTAIN_EXTERNAL_REVIEW',
        'MAINTAIN_KEY_PERSON_TIMESHEET', 'VIEW_KEY_PERSON_TIMESHEET', 'MAINTAIN_TRAINING'];
    irbUrl = 'https://polus.fibiweb.com/irb/login';

    constructor(private _router: Router, public _commonService: CommonService,
                private _headerService: HeaderService) {
        document.addEventListener('mouseup', this.offClickSideBarHandler.bind(this));
        document.addEventListener('mouseup', this.offClickHeaderHandlerConf.bind(this));
        // this.logo = './assets/images/kki_logo.png';
        // this.logo = './assets/images/logo-smu.jpg';
        this.logo = environment.deployUrl + './assets/images/logo.png';
    }

    offClickSideBarHandler(event: any) {
        if (!this.sideBarMenu.nativeElement.contains(event.target)) {
            const ICONELEMENT = <HTMLInputElement>document.getElementById('toggleMenuIcon');
            if (ICONELEMENT && ICONELEMENT.classList.contains('fa-times')) {
            ICONELEMENT.classList.add('fa-bars');
            ICONELEMENT.classList.remove('fa-times');
            this.hideMenu(event);
            }
        }
    }

    offClickHeaderHandlerConf(event: any) {
        if (this.showWheelChair) {
            if (!this.showWheelChair.nativeElement.contains(event.target)) {
                this.isAccessible = false;
            }
        }
    }

    /**
     * getAllNotificationList called with 2 params
     * 1 - for opening the notification list.
     * 2 - for initial load.
     */
    ngOnInit(): void {
        this.userName = this._commonService.getCurrentUserDetail('userName');
        this.fullName = this._commonService.getCurrentUserDetail('fullName');
        this.personId = this._commonService.getCurrentUserDetail('personID');
    }

    /**
     * @param  {any} e
     * Function for the responsive Menu bar. While user clicks on hamburger icon 'slideMenu-expand'
     * class will be add/remove on div class.
     */
    toggleMenu(e: any) {
        e.preventDefault();
        const ELEMENT = <HTMLInputElement>document.getElementById('myMenu');
        const ICONELEMENT = <HTMLInputElement>document.getElementById('toggleMenuIcon');
        if (this.showMenu) {
            ELEMENT.classList.add('slideMenu-expand');
            ICONELEMENT.classList.remove('fa-bars');
            ICONELEMENT.classList.add('fa-times');
        } else {
            ELEMENT.classList.remove('slideMenu-expand');
            ICONELEMENT.classList.add('fa-bars');
            ICONELEMENT.classList.remove('fa-times');
        }

        this.showMenu = !this.showMenu;
    }

    hideMenu(e: any) {
        e.preventDefault();
        const ELEMENT = <HTMLInputElement>document.getElementById('myMenu');
        if (ELEMENT) {
            ELEMENT.classList.remove('slideMenu-expand');
            const ICONELEMENT = <HTMLInputElement>document.getElementById('toggleMenuIcon');
            if (ICONELEMENT.classList.contains('fa-times')) {
                ICONELEMENT.classList.remove('fa-times');
                ICONELEMENT.classList.add('fa-bars');
            }
            this.showMenu = true;
        }
    }

    logout() {
        this._commonService.clearLocalStoragePersonDetails();
        this._router.navigate(['/logout']);
    }

}


