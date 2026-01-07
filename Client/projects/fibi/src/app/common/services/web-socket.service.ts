import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io } from 'socket.io-client';
import { CommonService } from './common.service';

declare var $: any;

class LockItem {
	groupId: string;
	currentUser: string;
	tabId: string;
	currentUserId: number;
	activeUsers: Array<User> = [];
	lockedItemTitle?: string;
	createTimeStamp: number;
	isLockManuallyReleased?: boolean;
	isModuleLockAvailable?: boolean;
}

interface User {
	id: string;
	name: string;
}

@Injectable()
export class WebSocketService {

	private socket: any = {};
	private promiseResolve: any;
	currentLockedModule = {};
	selfMessage$ = new Subject();
	lockFail$ = new Subject();
	isModuleLockAvailable: 'Available' | 'NotAvailAble' | 'NotTriggered' = 'NotTriggered';
	currentModuleId: number | string;
	currentModuleDescription: string;
	currentUser: string;
	createTimeStamp: number;
	isShowChatWindow = false;
	isServerAvailable = true;
	private isLockActivated = false;
	private failedReleaseLockDetails = {};
	lockedList: Array<LockItem> = [];
	isLockReleasedManually = false;


	constructor(private _commonService: CommonService) {
		if (this._commonService.isEnableSocket) {
			this.socket = io(this._commonService.socketUrl, { 'transports': ['websocket'], 'timeout': 3000 });
			if (this._commonService.isEnableLock) {
				this.getModuleLockResponse();
				this.alreadyLockedEvent();
				this.lockReleaseEvent();
				this.getMessage();
				this.errorHandler();
				this.getLockListForUser();
			}
		}
	}

	listenToSocketEvents(eventName: string): Observable<any> {
		return new Observable((subscriber) => {
			this.socket.on(eventName, (data: any) => {
				subscriber.next(data);
			});
		});
	}

	errorHandler(): void {
		this.socket.on('connect_error', (data: any) => {
			this.isServerAvailable = false;
			if (this.promiseResolve) {
				this.isModuleLockAvailable = 'NotAvailAble';
				this.promiseResolve(false);
				this.promiseResolve = null;
				if (this._commonService.isEnableLock) {
					const message = 'Lock functionality is currently unavailable. Please contact the application administrator.';
					this._commonService.setPriorityMessage(message);
				}
				Object.keys(this.failedReleaseLockDetails).forEach(key => {
					this.currentLockedModule[key].isModuleLockAvailable = true;
				});
			}
		});

		/**
		 * please rewrite thIS code to support new multiple module lock structure.
		 */

		this.socket.on('connect', (data) => {
			this.isServerAvailable = true;
			// if (this.currentModuleId && this.currentModuleDescription && this._commonService.isEnableLock && this.isLockActivated) {
			// 	this.getLockForModule(this.currentModuleDescription, this.currentModuleId);
			// }
			this._commonService.removePriority();
			if (this.failedReleaseLockDetails) {
				setTimeout(() => {
					Object.keys(this.failedReleaseLockDetails).forEach(key => {
						const DATA = this.getLockData(this.failedReleaseLockDetails[key].groupId);
						this.emit('releaseModuleLock', DATA);
					});
					this.failedReleaseLockDetails = {};
				}, 5000);
			}
		});

		this.socket.on('disconnect', (data) => {
			this.isServerAvailable = false;
		});
	}

	private emit(eventName: string, data: any): void {
		if (this.isServerAvailable) {
			this.socket.emit(eventName, data);
		}
	}

	getLockForModule(moduleName: string, moduleItemKey: string | number, LockedItemTitle = ''): void {
		this.isLockActivated = true;
		// if (this.isServerAvailable &&  !this.getLockEnabledModule(moduleName)) {
		// 	const message = `${moduleName} lock is currently unavailable. Please contact the application administrator.`
		// 	this._commonService.showToast('HTTP_INFO', message, 600000);
		// }
		if (moduleName && moduleItemKey && this._commonService.isEnableLock && this.isServerAvailable && this.getLockEnabledModule(moduleName)) {
			const DATA = this.getLockData(moduleName + '#' + moduleItemKey, LockedItemTitle);
			if (this.isModuleLockAvailable === 'Available' || this.isModuleLockAvailable === 'NotTriggered') {
				this.emit('getModuleLock', DATA);
				DATA.isModuleLockAvailable = true;
				this.setCurrentActiveDocument(DATA, moduleName + '#' + moduleItemKey);
				this.getLockListForUser();
			} else {
				this.emit('addToActiveUser', DATA);
			}
		}
	}

	releaseCurrentModuleLock(lockKey: string): void {
		if (this.currentLockedModule[lockKey] && this.currentLockedModule[lockKey].groupId && this.isServerAvailable) {
			const DATA = this.getLockData(lockKey, '');
			this.emit('releaseModuleLock', DATA);
		} else if (!this.isServerAvailable && this.currentLockedModule[lockKey] && this.currentLockedModule[lockKey].groupId) {
			this.failedReleaseLockDetails[lockKey] = this.getLockData(lockKey, '');
		}
		this.isLockActivated = false;
		this.resetCurrentActiveDocument(lockKey);
		this.setChatWindowStatus(false);
		this.isModuleLockAvailable = 'NotTriggered';
		this.currentModuleDescription = '';
		this.selfMessage$.next('clear');
	}

	private getLockData(id = null, lockedItemTitle = ''): LockItem {
		const DATA = new LockItem();
		DATA.groupId = id || this.currentLockedModule[id].groupId;
		DATA.currentUser = this._commonService.getCurrentUserDetail('fullName');
		DATA.currentUserId = this._commonService.getCurrentUserDetail('personID');
		DATA.tabId = this._commonService.tabId;
		DATA.lockedItemTitle = lockedItemTitle;
		return DATA;
	}

	sendMessage(message: string): void {
		const data: any = {};
		data.groupId = this.getCurrentModuleChatGroup();
		data.user = this._commonService.getCurrentUserDetail('fullName');
		data.message = message;
		this.emit('sendMessage', data);
	}

	private setCurrentActiveDocument(data: LockItem, lockKey: string) {
		if (data) {
			this.currentLockedModule[lockKey] = { ...this.currentLockedModule[lockKey], ...data };
		}
	}

	private resetCurrentActiveDocument(lockKey: string): void {
		delete this.currentLockedModule[lockKey];
	}

	isModuleLocked(moduleName: string, moduleItemKey: number | string): Promise<boolean> {
		this.currentModuleDescription = moduleName;
		this.currentModuleId = moduleItemKey;
		return new Promise((resolve, reject) => {
			if (this._commonService.isEnableLock && this.isServerAvailable) {
				this.checkModuleLocked(moduleName + '#' + moduleItemKey);
				this.promiseResolve = resolve;
			} else {
				if (this._commonService.isEnableLock && !this.isServerAvailable) {
					const message = 'Lock functionality is currently unavailable. Please contact the application administrator.';
					this._commonService.setPriorityMessage(message);
				}
				this.isModuleLockAvailable = 'Available';
				this.currentLockedModule[moduleName + '#' + moduleItemKey] = {};
				this.currentLockedModule[moduleName + '#' + moduleItemKey].isModuleLockAvailable = true;
				resolve(false);
			}
		});
	}

	isLockAvailable(key): boolean {
		if (!this._commonService.isEnableLock && !this.isServerAvailable) {
			return true;
		} else if (this._commonService.isEnableLock && !this.isServerAvailable) {
			return false;
		} else {
			return !this.currentLockedModule[key] ? true : this.currentLockedModule[key].isModuleLockAvailable;
		}
	}

	private checkModuleLocked(moduleItem: string): void {
		this.emit('isModuleLocked', moduleItem);
	}

	private getModuleLockResponse(): void {
		this.listenToSocketEvents('isModuleLockedResponse').subscribe((data: LockItem) => {
			if (this.promiseResolve) {
				const lockStatus = this.checkLockStatus(data);
				this.isModuleLockAvailable = lockStatus ? 'Available' : 'NotAvailAble';
				this.currentLockedModule[data.groupId] = {};
				this.currentLockedModule[data.groupId].isModuleLockAvailable = lockStatus;
				if (data) {
					this.setCurrentActiveDocument(data, data.groupId);
				}
				this.promiseResolve(!lockStatus);
				this.promiseResolve = null;
				this.isLockActivated = true;
			}
		});
	}

	private checkLockStatus(data: LockItem): boolean {
		return !data || !data.currentUserId || data && this._commonService.getCurrentUserDetail('personID') === data.currentUserId &&
			this._commonService.tabId === data.tabId;
	}

	private alreadyLockedEvent(): void {
		this.listenToSocketEvents('alreadyLocked').subscribe((data: LockItem) => {
			this.currentLockedModule[data.groupId] = data;
			this.isModuleLockAvailable = 'NotAvailAble';
			this.currentLockedModule[data.groupId].isModuleLockAvailable = false;
			this.lockFail$.next(true);
			this.showModal(data.groupId);
		});
	}

	private lockReleaseEvent(): void {
		this.listenToSocketEvents('leftEvent').subscribe((data: LockItem) => {
			if (!this.isLockOwner(data)) {
				let CONTENT: string;
				const DATA = data.groupId.split('#');
				let moduleName = DATA[0].toLowerCase();
				if (DATA[0].includes('IP')) {
					moduleName = 'institute proposal';
				}
				const currentModuleId = DATA[0].includes('Certification') ? '' : DATA[1];
				CONTENT = `The lock of ${moduleName} ${currentModuleId} has been released.
					Please refresh the screen to access the ${moduleName} and see the latest changes or edit the fields, if any.`;
				this._commonService.showToast('HTTP_INFO', CONTENT, 600000);
			} else {
				this.isLockReleasedManually = data.isLockManuallyReleased ? true : false;
				this.showModal(data.groupId);
			}
			this.setChatWindowStatus(false);
			this.removeModuleFromLockList(data);
			this.currentModuleId = null;
			this.currentModuleDescription = null;
			this.currentUser = null;
			this.createTimeStamp = null;
		});
	}

	private getMessage(): void {
		this.listenToSocketEvents('receiveMessage').subscribe((data: string) => {
			this.setChatWindowStatus(true);
			this.selfMessage$.next(data);
		});
	}

	setChatWindowStatus(status: boolean): void {
		this.isShowChatWindow = status;
	}

	showModal(lockKey: string): void {
		if (this.isServerAvailable) {
			const DATA = lockKey.split('#');
			this.currentModuleDescription = DATA[0];
			this.currentModuleId = Number(DATA[1]);
			this.currentUser = this.currentLockedModule[lockKey].currentUser;
			this.createTimeStamp = this.currentLockedModule[lockKey].createTimeStamp;
			$('#LockModal').modal('show');
		}
	}
	async initiateLockListRequest() {
		const isLockReleaseRight = await this._commonService.checkPermissionAllowed('RELEASE_LOCKS');
		if (isLockReleaseRight) {
			this.emit('getAllLockList', { currentUserId: this._commonService.getCurrentUserDetail('personID') });
		} else {
			this.emit('getLockList', { currentUserId: this._commonService.getCurrentUserDetail('personID') });
		}
	}

	private getLockListForUser(): void {
		this.listenToSocketEvents('getLockListResponse').subscribe((data: Array<LockItem>) => {
			this.lockedList = data;
		});
	}

	releaseLockOnDemand(lockDetail): void {
		this.emit('removeLockForcefully', lockDetail);
	}

	isLockOwner(socketData): boolean {
		return (
			socketData.currentUserId === this._commonService.getCurrentUserDetail('personID') &&
			socketData.tabId === this._commonService.tabId
		);
	}

	removeModuleFromLockList(releasedLockDetail: LockItem): void {
		const INDEX = this.lockedList.findIndex(L => L.groupId === releasedLockDetail.groupId);
		if (INDEX > -1) {
			this.lockedList.splice(INDEX, 1);
		}
	}

	releaseAllModuleLock(): void {
		Object.keys(this.currentLockedModule).forEach(key => {
			if (this.currentLockedModule[key] && this.currentLockedModule[key].groupId && this.isServerAvailable) {
				const DATA = this.getLockData(key, '');
				this.removeLockViaAPI(DATA);
			}
		});
	}

	removeLockViaAPI(socketData) {
		let url = this._commonService.socketUrl+'removeLockBasedOnId';
		let requestObj = {'socketData': socketData, 'token': this._commonService.getCurrentUserDetail('Authorization')}
		navigator.sendBeacon(url, JSON.stringify(requestObj));
	}

	/*
	this codes return the current groupId for sending messages. The groupID is taken W.R.T 'currentModuleDescription'
	 since this holds the value of the module that is being currently used.
	In case of certification the currentModuleDescription might be 'certification' but since we can't have message from
	 certification we will be using 'proposal' as description.
	*/

	getCurrentModuleChatGroup() {
		let moduleDescription = this.currentModuleDescription;
		if (moduleDescription === 'Certification' || moduleDescription === '') {
			moduleDescription = 'Proposal'
			return Object.keys(this.currentLockedModule).find(M => M.includes(moduleDescription));
		} else {
			return Object.keys(this.currentLockedModule).find(M => M.includes(moduleDescription));
		}
	}

	getLockEnabledModule(moduleName) {
		const index = this._commonService.lockActiveModuleDetails.findIndex(item => item.moduleCode === this.getModuleCode(moduleName) &&
			item.subModuleCode === this.getSubModuleCode(moduleName));
		return this._commonService.lockActiveModuleDetails[index].isActive;
	}

	getLockChatEnabled(moduleName) {
		const index = this._commonService.lockActiveModuleDetails.findIndex(item => item.moduleCode === this.getModuleCode(moduleName) &&
			item.subModuleCode === this.getSubModuleCode(moduleName));
		return this._commonService.lockActiveModuleDetails[index].chatActiveFlag;
	}

	getModuleCode(moduleName) {
		let moduleCode = null;
		switch (moduleName) {
			case 'Award': moduleCode = '1';
				break;
			case 'Proposal': moduleCode = '3';
				break;
			case 'IP': moduleCode = '2';
				break;
			case 'Certification': moduleCode = '3';
				break;
			default: null;
		}
		return moduleCode;
	}

	getSubModuleCode(moduleName) {
		let subModuleCode = null;
		switch (moduleName) {
			case 'Award': subModuleCode = '0';
				break;
			case 'Proposal': subModuleCode = '0';
				break;
			case 'IP': subModuleCode = '0';
				break;
			case 'Certification': subModuleCode = '3';
				break;
			default: null;
		}
		return subModuleCode;
	}
}
