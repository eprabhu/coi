/**
 * created by Mahesh Sreenath V M
 * last updated on 30-09-2019.
 * please read this documentation before making any code changes
 * https://docs.google.com/document/d/1x-__S6RpPgnbkS0VmPEyVO3kqtLGit1VFgzTtpImBFs/edit?usp=sharing
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { HTTP_SUCCESS_STATUS } from '../../app-constants';
import { ElasticConfigService } from './elastic-config.service';
import { environment } from '../../../environments/environment';
import { getFromLocalStorage, setIntoLocalStorage } from '../utilities/user-service';

@Injectable()

export class CommonService {

	isShowLoader = new BehaviorSubject<boolean>(true);
	isManualLoaderOn = false;
	isPreventDefaultLoader = false;
	appLoaderContent = 'Loading...';
	appToastContent = '';
	isShowOverlay = false;
	baseUrl = '';
	orcidUrl = '';
	elasticIndexUrl = '';
	socketUrl = 'http://localhost:4000';
	outputPath = 'https://demo.fibiweb.com/kc-dev';
	outputPathAB = 'https://demo.fibiweb.com/AwardBudgetTool';
	outputPathOST = 'https://demo.fibiweb.com/sst';
	IRBOutputPath = 'https://demo.fibiweb.com/fibi-irb/dashboard#/irb/dashboard';
	currencyFormat = '$';
	forbiddenModule = '';
	isEvaluation: boolean;
	isMapRouting: boolean;
	isEvaluationAndMapRouting: boolean;
	generalFileType: any = [];
	cvFileType: any = [];
	wordFileType: any = [];
	claimFileType: any = [];
	correspondenceTemplateType: any = [];
	enableSSO = false;
	rightsArray: any = [];
	isElasticAuthentiaction = false;
	elasticUserName = '';
	elasticDelimiter = '';
	elasticAuthScheme = '';
	elasticPassword = '';
	isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
	isValidUser = true;
	extension: any = [];
	currentUserDetails: any = {};
	isWafEnabled: boolean;
	canAddOrganization: boolean;
	isOrcidWOrkEnabled = false;
	isGrantCallStatusAutomated = false;
	isEnableSpecialReview = false;       // Hide Special Review section using Parameter.
	isManpowerEnabled = false;
	isEnableAddtoAddressBook = false;
	dashboardModules: any = {};
	isDevProposalVersioningEnabled = false;
	isProposalOrganizationEnabled = false;
	isExternalUser = false;
	isTriageQuestionnaireRequired = false;
	isCreateAgreement = false;
	isShowAgreementSupport = false;
	isShowAgreementNotifyAction = false;
	isEnableSocket = false;
	isEnableLock = false;
	tabId = null;
	dashboardNavigationURL: string;
	externalReviewRights: any = [];
	deployMap = environment.deployUrl;
	sound = new Audio(this.deployMap + 'assets/bell.mp3');
	timer: any
	priorityNotificationMessage = null;
	lockActiveModuleDetails: any = [];
	isElasticSyncSQSEnable = false;

	constructor(private _http: HttpClient, private _elasticConfig: ElasticConfigService) {
	}

	signOut(params) {
		return this._http.post(this.baseUrl + '/signout', params);
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
				this.checkExternalUser();
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

	getRequiredParameters() {
		return this._http.get(this.baseUrl + '/fetchRequiredParams').toPromise();
	}
	/**
	* @param  {} configurationData
	* assign system configurations to global variables
	*/
	assignConfigurationValues(configurationData) {
		this.baseUrl = configurationData.baseUrl;
		this.socketUrl = configurationData.socketUrl;
		this.enableSSO = configurationData.enableSSO;
		this.currencyFormat = configurationData.currencyFormat;
		this._elasticConfig.url = configurationData.elasticIndexUrl;
		this.isElasticAuthentiaction = configurationData.isElasticAuthentiaction;
		this.elasticUserName = configurationData.elasticUserName;
		this.elasticDelimiter = configurationData.elasticDelimiter;
		this.elasticPassword = configurationData.elasticPassword;
		this.elasticAuthScheme = configurationData.elasticAuthScheme;
	}
	/**
	 * @param  {} parameters assign system level parameters to global variables
	 */
	assignSystemParameters(parameters) {
		this.isEvaluation = parameters.isEvaluation;
		this.isMapRouting = parameters.isMapRouting;
		this.isEvaluationAndMapRouting = parameters.isEvaluationAndMapRouting;
		if (parameters.fileTypes && parameters.fileTypes.length) {
			this.generalFileType = parameters.fileTypes[0] ? parameters.fileTypes[0].extension : null;
			this.cvFileType = parameters.fileTypes[1] ? parameters.fileTypes[1].extension : null;
			this.claimFileType = parameters.fileTypes[2] ? parameters.fileTypes[2].extension : null;
			this.wordFileType = parameters.fileTypes[3] ? parameters.fileTypes[3].extension : null;
			this.correspondenceTemplateType = parameters.fileTypes[4] ? parameters.fileTypes[4].extension : null;
		}
		this.isWafEnabled = parameters.isWafEnabled;
		this.canAddOrganization = parameters.canUserAddOrganization;
		this.isOrcidWOrkEnabled = parameters.isOrcidWOrkEnabled;
		this.isGrantCallStatusAutomated = parameters.isGrantCallStatusAutomated;
		this.isEnableSpecialReview = parameters.isEnableSpecialReview;
		this.isManpowerEnabled = parameters.isAwardManpowerActive;
		this.isEnableAddtoAddressBook = parameters.isEnableAddtoAddressBook;
		this.isTriageQuestionnaireRequired = parameters.triageQuestionnaireRequired;
		this.isDevProposalVersioningEnabled = parameters.isDevProposalVersioningEnabled;
		this.isProposalOrganizationEnabled = parameters.isProposalOrganizationEnabled;
		this.isCreateAgreement = parameters.isShowCreateAgreement;
		this.isShowAgreementNotifyAction = parameters.isShowAgreementNotifyAction;
		this.isShowAgreementSupport = parameters.isShowAgreementSupport;
		this.isEnableLock = parameters.isEnableLock;
		this.isEnableSocket = parameters.isEnableSocket;
		this.lockActiveModuleDetails = parameters.lockConfiguration;
		this.isElasticSyncSQSEnable = parameters.isElasticsyncSQSEnable;
	}

	showLoader(loaderContent = 'Loading...', overlay: boolean = false) {
		this.appLoaderContent = loaderContent;
		this.isShowOverlay = overlay;
	}

	showToast(status = HTTP_SUCCESS_STATUS, toastContent = '', time = 10000) {
		clearTimeout(this.timer);
		this.appToastContent = toastContent === '' ? status === HTTP_SUCCESS_STATUS ?
			'Your details saved successfully' : 'Error Saving Data! Please try again' : toastContent;
		const toastEl = document.getElementById('app-toast');
		if (toastEl) {
			const LAST_SAVED_TOAST = document.getElementById('last-saved-toast');
			if (LAST_SAVED_TOAST) {
				LAST_SAVED_TOAST.classList.add('invisible');
			}
			toastEl.className = status === HTTP_SUCCESS_STATUS ? 'app-toast visible alert-warning' :
				status === 'HTTP_INFO' ? 'app-toast visible alert-primary' :
					' app-toast visible alert-danger';
			if (toastContent.length > 200) {
				toastEl.style.width = '95%';
			}
			this.timer = setTimeout(() => {
				toastEl.className = this.appToastContent = '';
				this.appLoaderContent = 'Loading...';
				this.isShowOverlay = false;
				toastEl.style.width = 'max-content';
				if (LAST_SAVED_TOAST) {
					LAST_SAVED_TOAST.classList.remove('invisible');
				}
			}, time);
		}
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

	evaluateValidation(id) {
		return this._http.post(this.baseUrl + '/evaluateValidationRule', id);
	}

	fetchPermissions() {
		return this._http.get(this.baseUrl + '/getAllSystemRights').toPromise();
	}

	checkPermissionAllowed(input) {
		return new Promise<boolean>(async (resolve) => {
			if (this.rightsArray.length) {
				resolve(this.rightsArray.includes(input));
			} else {
				this.rightsArray = await this.fetchPermissions().catch() || [];
				resolve(this.rightsArray.includes(input));
			}
		});
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

	/**Method to check whether current user is an external user
	*/
	checkExternalUser() {
		this.isExternalUser = this.getCurrentUserDetail('externalUser');
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

	setPriorityMessage(message: string): void {
		if (message) {
			this.priorityNotificationMessage = message;
		}
	}

	removePriority(): void {
		this.priorityNotificationMessage = null;
	}
}
