import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import {environment} from "../../../environments/environment";
import {getFromLocalStorage, setIntoLocalStorage} from "../../../../../fibi/src/app/common/utilities/user-service";

@Injectable()

export class CommonService {

    isShowLoader = new BehaviorSubject<boolean>(true);
    isManualLoaderOn = false;
    isShowOverlay = false;
    baseUrl = '';
    fibiUrl = '';
    currencyFormat = '$';
    forbiddenModule = '';
    isEvaluation: boolean;
    isMapRouting: boolean;
    isEvaluationAndMapRouting: boolean;
    cvFileType: any = [];
    claimFileType: any = [];
    enableSSO = false;
    rightsArray: any = [];
    isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
    isValidUser = true;
    extension: any = [];
    currentUserDetails: any = {};
    isWafEnabled: boolean;
    canAddOrganization: boolean;
    isGrantCallStatusAutomated = false;
    isManpowerEnabled = false;
    isEnableAddtoAddressBook = false;
    isDevProposalVersioningEnabled = false;
    isExternalUser = false;
    isCreateAgreement = false;
    isShowAgreementSupport = false;
    isShowAgreementNotifyAction = false;
    isEnableLock = false;
    COIUrl = '';
    timer: any
    dashboardModules: any = {};

    constructor(private _http: HttpClient) {
    }

    /**
     * returns a config file from assets and assign to application variables
     */
    async getAppConfig() {
        return new Promise(async (resolve, reject) => {
            const CONFIG_DATA: any = await this.readConfigFile();
            this.assignConfigurationValues(CONFIG_DATA);
            if (this.enableSSO) {
                const USER_DATA = await this.loginWithCurrentUser();
                this.isValidUser = USER_DATA.body['login'];
                this.updateLocalStorageWithUserDetails(USER_DATA);
            }
            if (this.currentUserDetails && this.currentUserDetails.Authorization) {
                try {
                    const SYSTEM_PARAMETERS: any = await this.getRequiredParameters();
                    this.assignSystemParameters(SYSTEM_PARAMETERS);
                } catch (e) { console.error(e) }
                resolve(true);
            } else {
                resolve(true);
            }
        });
    }

    readConfigFile() {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Cache-Control', 'no-store');
        headers = headers.append('Pragma', 'no-cache');
        return this._http.get(environment.deployUrl + 'assets/app-config.json', { headers }).toPromise();
    }

    /**
     * @param  {} configurationData
     * assign system configurations to global variables
     */
    assignConfigurationValues(configurationData) {
        this.baseUrl = configurationData.baseUrl;
        this.fibiUrl = configurationData.fibiUrl;
        this.enableSSO = configurationData.enableSSO;
        this.COIUrl = configurationData.COIUrl;
    }

    pageScroll(elementId) {
        const id = document.getElementById(elementId);
        if (id) {
            id.scrollIntoView({ behavior: 'smooth' });
        }
    }

    _keyPress(event: any, patternType) {
        const pattern = patternType === 'date' ? /[0-9\+\-\/\ ]/ : /[0-9\a-zA-Z]/;
        if (!pattern.test(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
    }

    loginWithCurrentUser() {
        return this._http.post(this.baseUrl + '/login', {}, { observe: 'response' }).toPromise();
    }

    /**
     * @param  {} details update the local storage with application constant values
     *  will be moved to application context once SSO is stable
     */
    updateLocalStorageWithUserDetails(details) {
        details.body['Authorization'] = details.headers.get('Authorization');
        this.currentUserDetails = details.body;
        setIntoLocalStorage(details.body);
    }

    getCurrentUserDetail(detailsKey: string) {
        return this.currentUserDetails && this.currentUserDetails[detailsKey] ?
            this.currentUserDetails[detailsKey] : this.updateCurrentUser(detailsKey);
    }

    updateCurrentUser(detailsKey: string) {
        this.currentUserDetails = getFromLocalStorage();
        return this.currentUserDetails && this.currentUserDetails[detailsKey] ? this.currentUserDetails[detailsKey] : '';
    }

    getDashboardActiveModules(moduleCode = '') {
        return this._http.get(this.baseUrl + '/getModulesConfiguration' + (moduleCode ? '/' + moduleCode : ''));
    }

    /**
     * Converts array to an object with keys as sectionCode or subSectionCodes and values as the whole object.
     * @param data
     * */
    getSectionCodeAsKeys(data: any) {
        return data.sectionConfig.reduce((acc, obj) => {
            const subSections = obj.subSectionConfig.reduce((ac, ob) => ({ ...ac, [ob.subSectionCode]: ob }), {});
            return { ...acc, [obj.sectionCode]: obj, ...subSections };
        }, {});
    }

    getRequiredParameters() {
        return this._http.get(this.baseUrl + '/fetchRequiredParams').toPromise();
    }

    /**
     * @param  {} parameters assign system level parameters to global variables
     */
    assignSystemParameters(parameters) {
        this.isEvaluation = parameters.isEvaluation;
        this.isMapRouting = parameters.isMapRouting;
        this.isEvaluationAndMapRouting = parameters.isEvaluationAndMapRouting;
        if (parameters.fileTypes && parameters.fileTypes.length) {
            this.cvFileType = parameters.fileTypes[1] ? parameters.fileTypes[1].extension : null;
            this.claimFileType = parameters.fileTypes[2] ? parameters.fileTypes[2].extension : null;
        }
        this.isWafEnabled = parameters.isWafEnabled;
        this.canAddOrganization = parameters.canUserAddOrganization;
        this.isGrantCallStatusAutomated = parameters.isGrantCallStatusAutomated;
        this.isManpowerEnabled = parameters.isAwardManpowerActive;
        this.isEnableAddtoAddressBook = parameters.isEnableAddtoAddressBook;
        this.isDevProposalVersioningEnabled = parameters.isDevProposalVersioningEnabled;
        this.isCreateAgreement = parameters.isShowCreateAgreement;
        this.isShowAgreementNotifyAction = parameters.isShowAgreementNotifyAction;
        this.isShowAgreementSupport = parameters.isShowAgreementSupport;
        this.isEnableLock = parameters.isEnableLock;
    }

    fetchPermissions() {
        return this._http.get(this.baseUrl + '/getAllSystemRights').toPromise();
    }

    clearLocalStoragePersonDetails() {
        this.enableSSO ? localStorage.clear() :
            ['authKey', 'cookie', 'sessionId', 'currentTab'].forEach((item) => localStorage.removeItem(item));
        this.currentUserDetails = {};
        this.rightsArray = [];
    }

}
