import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, Subscriber } from 'rxjs';
import { EntityDataStoreService } from './entity-data-store.service';
import { CommonService } from '../common/services/common.service';
import { InformationAndHelpTextService } from '../common/services/informationAndHelpText.service';
import { EntityManagementService } from './entity-management.service';
import { catchError } from 'rxjs/operators';
import { openModal } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { COMMON_ERROR_TOAST_MSG, ENTITY_RIGHTS, HTTP_ERROR_STATUS } from '../app-constants';
import { ENTITY_NOTES_RIGHTS } from './shared/entity-constants';

@Injectable()
export class EntityManagementResolveService {

  private readonly _moduleCode = 'GE26';

  constructor(private _dataStore: EntityDataStoreService, private _commonService: CommonService,
    private _informationAndHelpTextService : InformationAndHelpTextService, private _entityManagementService: EntityManagementService) { }

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>((observer: Subscriber<boolean>) => {
        forkJoin(this.getHttpRequests(route)).subscribe((res: any[]) => {
            if (res.length > 1) {
                this.updateSectionConfig(res[1]);
            }
            if (res[0]) {
                this.updateEntityDataStore(res[0]);
                observer.next(true);
                observer.complete();
            } else {
                observer.next(true);
                observer.complete();
            }
        });
    });

}

private getHttpRequests(route: ActivatedRouteSnapshot): Observable<any>[] {
    const HTTP_REQUESTS = [];
    const ENTITY_ID = route.queryParamMap.get('entityManageId');
    if (ENTITY_ID) {
        HTTP_REQUESTS.push(this.loadEntityData(ENTITY_ID));
    } else {
        this._commonService.navigateToErrorRoute('FORBIDDEN');
    }
    // help text api's
    if (!this.isSectionConfigAlreadyFetched()) {
        HTTP_REQUESTS.push(this.getDisclosureSectionConfig());
    } else {
        this.setModuleConfiguration();
    }
    return HTTP_REQUESTS;
}

updateSectionConfig(sectionData: any): void {
    this._dataStore.entitySectionConfig = this._commonService.getSectionCodeAsKeys(sectionData);
    this.setModuleConfiguration();
}

private async updateEntityDataStore(data: any) {
    this._dataStore.setStoreData(data);
}

private loadEntityData(entityId: string) {
    return this._entityManagementService.getEntityDetails(entityId).pipe((catchError(error => this.redirectOnError(error))));
}

isSectionConfigAlreadyFetched() {
    return Object.keys(this._dataStore.entitySectionConfig).length;
}

getDisclosureSectionConfig() {
    return this._commonService.getDashboardActiveModules(this._moduleCode)
}

setModuleConfiguration() {
    this._informationAndHelpTextService.moduleConfiguration = this._dataStore.entitySectionConfig;
}


private redirectOnError(error) {
    return new Observable(null);
}
}

@Injectable()
export class EntityPathResolveService {

    constructor(private _commonService: CommonService) {
    }

    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): any {
        if (this._commonService.hasChangesAvailable) {
            this._commonService.isNavigationStopped = true;
            this._commonService.attemptedPath = nextState.url;
            this._commonService.appLoaderContent = 'Saving...';
            this._commonService.isShowLoader.next(true);
            const elements = document.getElementsByClassName('invalid-feedback');
            const errToast = document.getElementById('coi-retry-error-toast');
            if ((errToast && !errToast?.classList.contains('invisible')) || (elements && elements.length)) {
                this._commonService.isShowLoader.next(false);
                openModal('coi-entity-confirmation-modal');
            }
            return false;
        } else {
            this._commonService.isNavigationStopped = false;
            this._commonService.attemptedPath = '';
            return true;
        }
    }

}

@Injectable()
export class EntityConfigurationResolveGuardService implements CanDeactivate<boolean> {

    private readonly _moduleCode = 'GE26';
    constructor( private _commonService: CommonService, private _entityManagementService: EntityManagementService ) { }

    canDeactivate(): boolean {
        if (this._commonService.isEntityChangesAvailable) {
            this._entityManagementService.openEntityLeaveModal();
            return false;
        }
        return true;
    }

    resolve() {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

}

@Injectable()
export class EntityHistroyLogService {

    constructor(private _entityManageService: EntityManagementService, private _dataStore: EntityDataStoreService, private _commonService: CommonService) { }
    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): Observable<boolean> {
        return new Observable<boolean>((observer: Subscriber<boolean>) => {
            const TAB_NAME = this.getTabName(currentRoute?.routeConfig?.path);
            if (this._dataStore.canLogModificationHistory && TAB_NAME) {
                this._entityManageService.logFeedHistory({
                    entityId: currentRoute.queryParamMap.get('entityManageId'),
                    actionLogCode: 8,
                    tabName: TAB_NAME
                }).subscribe((res: string) => {
                    this._dataStore.canLogModificationHistory = false;
                    observer.next(true);
                    observer.complete();
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG)
                    observer.next(false);
                    observer.complete();
                });
            } else {
                observer.next(true);
                observer.complete();
            }
        });
    }

    getTabName(path): string {
        switch (true) {
            case path.includes('entity-overview'):
                return 'Overview';
            case path.includes('entity-sponsor'):
               return 'Sponsor';
            case path.includes('entity-subaward'):
               return 'Sub-award Organization';
            case path.includes('entity-compliance'):
               return 'Compliance';
            case path.includes('entity-notes'):
               return 'Notes';
            case path.includes('entity-attachments'):
               return 'Attachments';
            default:
                return '';
        }
    }

}

@Injectable()
export class EntityNotesSection {

    constructor(private _commonService: CommonService) { }
    canActivate(){
        if(this._commonService.getAvailableRight(ENTITY_NOTES_RIGHTS)) {
            return true;
        } else {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return false;
        }
    }

}

@Injectable()
export class EntityViewCheck {

    constructor(private _commonService: CommonService) { }

    canActivate() {
        if (this._commonService.getAvailableRight(ENTITY_RIGHTS)) {
            return true;
        } else {
            this._commonService.navigateToErrorRoute('FORBIDDEN');
            return false;
        }
    }

}
