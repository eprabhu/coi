import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, Params } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { HeaderService } from './header.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { WebSocketService } from '../services/web-socket.service';


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
                private _headerService: HeaderService,
                public webSocketService: WebSocketService) {
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

    /**
     * getAllNotificationList called with 2 params
     * 1 - for opening the notification list.
     * 2 - for initial load.
     */
    ngOnInit(): void {
        this.userName = this._commonService.getCurrentUserDetail('userName');
        this.fullName = this._commonService.getCurrentUserDetail('fullName');
        this.personId = this._commonService.getCurrentUserDetail('personID');
        this.getPermissions();
        this.getAllNotificationList(false, true);
    }

    myDashboard(event: any) {
        event.preventDefault();
        this._router.navigate(['fibi/dashboard']);
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
        const logoutData: any = {};
        logoutData.personId = this._commonService.getCurrentUserDetail('personID');
        logoutData.userName = this._commonService.getCurrentUserDetail('userName');
        logoutData.userFullName = this._commonService.getCurrentUserDetail('fullName');
        logoutData.unitNumber = this._commonService.getCurrentUserDetail('unitNumber');
        this.$subscriptions.push(this._commonService.signOut(logoutData)
            .subscribe((data: any) => { this._router.navigate(['/logout']); }));
    }

    changeTheme(theme) {
        this.fibiTheme = document.getElementById('fibi-body');
        this.fibiTheme.className = '';
        this.fibiTheme.classList.add(theme);
    }

    changeContrast() {
        let currentTheme = this.currentTheme + (this.currentContrast === 0 ? 'light' : this.currentContrast === 1 ? '' : 'dark');
        currentTheme = this.themes.get(currentTheme);
        this.changeTheme(currentTheme);
    }

    changeFontSize(size) {
        (document.querySelector(':root') as HTMLElement).style.fontSize = size;
    }

    onChangeFont() {
        this.changeFontSize(this.fontSizeValue + '%');
    }

    offClickHeaderHandlerConf(event: any) {
        if (this.showWheelChair) {
            if (!this.showWheelChair.nativeElement.contains(event.target)) {
                this.isAccessible = false;
            }
        }
    }

    resetToDefaultSetting() {
        this.changeTheme(this.defaultThemeColor);
        this.currentContrast = 1;
        this.fontSizeValue = 64;
        this.changeFontSize(this.fontSizeValue + '%');
    }

    async getPermissions() {
        for (const element of this.rightList) {
            const isTrue = await this._commonService.checkPermissionAllowed(element);
            if (isTrue) {
                this.canViewAdminDashboard = isTrue;
                break;
            }
        }
    }

    getNotificationList(type: 'NEW' | 'ALL'): void {
        type === 'ALL' ? this.getAllTabNotifications() : this.filterUnReadNotification();
        this.collapseViewMore = {};
    }

    private filterUnReadNotification(isInitialLoad = false, isNotificationNeeded = false): void {
        this.notificationList = this.getNewNotifications();
        this.badgeCount = this.notificationList.length;
        if (!isNotificationNeeded) {
            this.triggerSoundAndAnimation(isInitialLoad);
        }
        this.currentNotificationTab = 'NEW';
    }

    private getNewNotifications(): any {
        return this.allNotificationList.filter(ele => ele.personSystemNotificationMapping === null && ele.isActive === 'Y');
    }

    private triggerSoundAndAnimation(isInitialLoad: boolean): void {
        if (isInitialLoad && this.badgeCount > 0) {
            const BELL = document.getElementById('fa-bell');
            if (BELL) {
                setTimeout(() => {
                    BELL.classList.add('bell');
                    if (BELL.classList.contains('bell')) {
                        this._commonService.sound.play();
                    }
                }, 3000);
            }
        }
    }

    getAllNotificationList(isNotificationNeeded: boolean, isInitialLoad: boolean): void {
        this._headerService.getAllNotifications().subscribe((data: any) => {
            if (data) {
                this.allNotificationList = data.systemNotifications;
                this.filterUnReadNotification(isInitialLoad, isNotificationNeeded);
                this.priorityNotificationList = JSON.parse(JSON.stringify(this.notificationList.filter(ele => ele.priority === 'Y')));
                this.prepareNotificationMessage(this.priorityNotificationList);
                if (isNotificationNeeded) {
                    this.isShowNotification = !this.isShowNotification;
                    this.notificationOverlay.nativeElement.style.display = this.isShowNotification ? 'block' : 'none';
                }
            }
        }, err => {
            this.notificationList = [];
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Notifications fetching failed. Please try again.');
        });
    }

    prepareNotificationMessage(priorityNotificationList) {
        let priorityNotificationMessage = null;
        priorityNotificationList.forEach(notification => {
           if (this.priorityNotificationMessage == null) {
                priorityNotificationMessage = notification.message;
           } else {
                priorityNotificationMessage = priorityNotificationMessage + ' | ' + notification.message;
           }
        }); 
        this._commonService.setPriorityMessage(priorityNotificationMessage);
    }

    private getAllTabNotifications(): void {
            this.currentNotificationTab = 'ALL';
            this.notificationList = this.allNotificationList.filter(ele => ele.isActive === 'Y');
    }

    readNotification(id: number, readFlag: boolean, notificationIndex: number): void {
        const REQUEST_OBJECT = {
            'systemNotificationId': id,
            'systemNotificationRead': readFlag
        };
        this._headerService.markNotificationRead(REQUEST_OBJECT).subscribe((data: any) => {
            if (this.currentNotificationTab === 'NEW') {
                const notificationToDelete = document.getElementById(`message-${id}`);
                notificationToDelete.classList.add('flip-top');
                this.allNotificationList =  data.systemNotifications;
                this.removeReadNotification(notificationIndex);
            } else {
                this.allNotificationList = this.notificationList = data.systemNotifications.filter(ele => ele.isActive === 'Y');
                this.badgeCount = this.getNewNotifications().length;
            }
            if (readFlag) {
                this.priorityNotificationList = this.priorityNotificationList.filter(ele => ele.systemNotificationId !== id);
                this.prepareNotificationMessage(this.priorityNotificationList);
            } else {
                this.priorityNotificationList = this.notificationList.filter(ele => ele.priority === 'Y' &&
                                                ele.personSystemNotificationMapping === null);
                this.prepareNotificationMessage(this.priorityNotificationList);
            }
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Reading notifications failed. Please try again.');
        });
    }

    private removeReadNotification(notificationIndex: number): void {
        setTimeout(() => {
            this.notificationList.splice(notificationIndex, 1);
            this.badgeCount = this.notificationList.length;
        }, 500);
    }

    collapseViewMoreOption(id: number, flag: boolean): void {
        this.collapseViewMore = {};
        this.collapseViewMore[id] = !flag;
    }

    hideNotificationList(): void {
        this.isShowNotification = false;
        this.notificationOverlay.nativeElement.style.display = 'none';
    }


    removeLock(lockDetail) {
        this.webSocketService.releaseLockOnDemand(lockDetail);
        this.webSocketService.removeModuleFromLockList(lockDetail);
    }

    deleteElement(index: number): void {
		this.cancelPerviousDelete();
		const period = document.getElementById(`period-${index}`);
		period.style.display = 'none';
		const deleteConfirmation = document.getElementById(`delete-confirmation-${index}`);
		deleteConfirmation.style.display = 'table-row';
		deleteConfirmation.classList.add('flip-top');
	}

	cancelPerviousDelete(): void {
		const existingDeleteConfirmation = document.querySelector('.flip-top');
		if (existingDeleteConfirmation) {
			const existingDeleteId = existingDeleteConfirmation.id.split('-');
			this.cancelDeleteElement(parseInt(existingDeleteId[2], 10));
		}
	}
	/**
	 * @param  {number} index
	 * function adds animation to the delete confirmation on cancelling the delete operation
	 */
	cancelDeleteElement(index: number): void {
		const deleteConfirmation = document.getElementById(`delete-confirmation-${index}`);
		deleteConfirmation.style.display = 'none';
		deleteConfirmation.classList.remove('flip-top');
		const period = document.getElementById(`period-${index}`);
		period.style.display = 'table-row';
		period.classList.add('flip-bottom');
	}
}


