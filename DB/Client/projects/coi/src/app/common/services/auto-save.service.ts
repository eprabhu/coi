import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from './common.service';
import { takeUntil, throttleTime } from 'rxjs/operators';


/**
 * Author  Mahesh Sreenath V M
 * This is a complicated system where it orchestrates a trigger on a timely manner.
 * This is a not a single piece but works with a toaster that is designed on the app level.
 * See the details of the toast on app-router.component.html.
 * The autoSaveTrigger$ is the event that will be fired up on a single button click or
 * on a timely manner when we implement auto save functionality.
 * This will be combined with the stream of commonSaveTrigger$ and time$ which can be used in
 * future.This helps me to combine the click and automatic event in a single channel.
 * All the other components can subscribe to this event and they can do their stuffs independent
 * of how this works. Just subscribe to the autoSaveTrigger on your components to get an event.
 * Make sure You UNSUBSCRIBE at the end to avoid potential memory leak.
 * There are two type or errors that can happen(API failure and mandatory field error).
 * So consume the errorEvent API to fire back the error. This service will help with
 * listing and navigation of error just send me a name to display, documentId to go and
 * type of error occurred. I have added interface so that you can take advantage of knowing what i need
 * in advance. For clarifications or support email
 * @ mahesh.sreenath@polussoftware.com/maheshsreenath@gmail.com
 * Happy coding :)
 */
interface Warning {
    name: string;
    documentId: string;
    hasChange: boolean;
    isHidden: boolean;
}

interface Error {
    name: string;
    documentId: string;
    type: string;
}

export type AutoSaveEvent = { action: AutoSaveType, content?: any };
export type AutoSaveType = 'RETRY' | 'SAVE';

@Injectable()
export class AutoSaveService {

    autoSaveTrigger$ = new Subject<AutoSaveEvent>();
    commonSaveTrigger$ = new Subject<AutoSaveEvent>();
    commonSaveEvent: any;
    unSubscribe$ = new Subject();
    errors: Array<Error> = [];
    lastSavedTime: String;
    lastSavedTimeStamp: any;
    isShowErrorToast = new Subject();
    unSavedSections: Array<Warning> = [];

    constructor() { }

    initiateAutoSave() {
        this.commonSaveEvent = this.commonSaveTrigger$.pipe(
            takeUntil(this.unSubscribe$))
            .subscribe((event: AutoSaveEvent) => {
                this.triggerSaveEvent(event);
            });
    }

    stopAutoSaveEvent() {
        this.isShowErrorToast.next(false);
        this.unSubscribe$.next();
        this.unSubscribe$.complete();
        this.commonSaveEvent.unsubscribe();
        this.clearUnsavedChanges();
    }

    triggerSaveEvent(event: AutoSaveEvent) {
        // this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Saving...', 1000);
        setTimeout(() => {
            this.isShowErrorToast.next(true);
        }, 1500);
        this.lastSavedTime = new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
        this.lastSavedTimeStamp = + new Date();
        this.errors = [];
        this.autoSaveTrigger$.next(event);
    }

    errorEvent(error: Error) {
        this.errors.push(error);
    }

    navigateToError(error: Error | Warning) {
        // scrollIntoView(error.documentId, 'below-header');
    }

    setUnsavedChanges(name, documentId, hasChange, isHidden = false) {
        const warning: Warning = { name, documentId, hasChange, isHidden };
        const warningIndex = this.unSavedSections.findIndex(msg => msg.documentId === warning.documentId);
        // if(hasChange) {
        //     const toastEl = document.getElementById('app-toast');
        //     toastEl.classList.add('invisible');
        //     let LAST_SAVED_TOAST = document.getElementById('last-saved-toast');
        //     if (LAST_SAVED_TOAST) {
        //         LAST_SAVED_TOAST.classList.remove('invisible');
        //     }
        // }
        if (warningIndex >= 0) {
            if (warning.hasChange) {
                this.unSavedSections[warningIndex].hasChange = warning.hasChange;
            } else {
                this.unSavedSections.splice(warningIndex, 1);
            }
        } else {
            if (warning.hasChange) {
                this.unSavedSections.push(warning);
            }
        }
        this.isShowErrorToast.next(this.unSavedSections.some(msg => msg.hasChange) || this.errors.length);
    }

    getUnsavedChanges() {
        return this.unSavedSections.map(section => section.name);
    }

    clearUnsavedChanges() {
        this.unSavedSections = [];
        this.clearErrors();
    }

    clearErrors() {
        if (this.errors.length) {
            this.errors = [];
            this.isShowErrorToast.next(false);
        }
    }

    getShowableUnsavedSections() {
        return this.unSavedSections.filter(section => !section.isHidden);
    }

    updatedLastSaveTime(timestamp: number, isSecondsNeeded = false) {
        const DATE_TIME = new Date(timestamp);
        if (isSecondsNeeded) {
            this.lastSavedTime = DATE_TIME.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } else {
            this.lastSavedTime = DATE_TIME.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        this.lastSavedTimeStamp = DATE_TIME.getTime();
    }
}
