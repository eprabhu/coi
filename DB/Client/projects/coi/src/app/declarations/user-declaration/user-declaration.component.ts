import { Subscription } from 'rxjs';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { UserDeclaration } from '../declaration.interface';
import { CommonService } from '../../common/services/common.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { closeCommonModal, isEmptyObject } from '../../common/utilities/custom-utilities';
import { DataStoreEvent, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { DeclarationActionType, UserDeclarationService } from './services/user-declaration.service';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { UserDeclarationDataStoreService } from './services/user-declaration-data-store.service';
import { DECLARATION_ROUTE_URLS } from '../declaration-constants';
import { ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { NavigationService } from '../../common/services/navigation.service';
import { ValidationConfig } from '../../configuration/form-builder-create/shared/form-validator/form-validator.interface';
import { AutoSaveEvent, AutoSaveService } from '../../common/services/auto-save.service';

@Component({
    selector: 'app-user-declaration',
    templateUrl: './user-declaration.component.html',
    styleUrls: ['./user-declaration.component.scss'],
})
export class UserCertificationComponent implements OnInit, OnDestroy {

    isEditMode = false;
    userDeclaration = new UserDeclaration();
    validationPath = DECLARATION_ROUTE_URLS.FORM

    private $subscriptions: Subscription[] = [];

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event: Event) {
        this.userDeclarationService.setTopForDeclaration();
    }

    constructor(public router: Router,
        private _commonService: CommonService,
        private _activatedRoute: ActivatedRoute,
        public autoSaveService: AutoSaveService,
        private _navigationService: NavigationService,
        private _userDeclarationDataStore: UserDeclarationDataStoreService,
        public userDeclarationService: UserDeclarationService) {
    }

    ngOnInit(): void {
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenUrlChanges();
        this.autoSaveSubscribe();
        this.listenGlobalEventNotifier();
        this.listenDataChangeFromStore();
        this.autoSaveService.initiateAutoSave();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
        this.userDeclarationService.clearDeclarationServiceData();
    }

    private listenUrlChanges(): void {
        this.$subscriptions.push(
            this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.handleUrlChange();
                }
            })
        );
    }

    private handleUrlChange(): void {
        const DECLARATION_ID = this._activatedRoute.snapshot.queryParams['declarationId'];
        const USER_DECLARATION: UserDeclaration = this._userDeclarationDataStore.getData();
        if (!DECLARATION_ID) {
            this.router.navigate([], { queryParams: { declarationId: USER_DECLARATION?.declaration?.declarationId } });
        } else if (DECLARATION_ID != USER_DECLARATION?.declaration?.declarationId) {
            this.fetchDeclarationById(DECLARATION_ID);
        }
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const USER_DECLARATION = this._userDeclarationDataStore.getData();
        if (isEmptyObject(USER_DECLARATION)) { return; }
        this.userDeclaration = USER_DECLARATION;
        this.isEditMode = this._userDeclarationDataStore.isFormEditable();
        if (storeEvent.action === 'REFRESH') {
            if (!this.router.url.includes(DECLARATION_ROUTE_URLS.FORM)) {
                this.getApplicableForms();
            }
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._userDeclarationDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private fetchDeclarationById(declarationId: string): void {
        this.$subscriptions.push(
            this.userDeclarationService.fetchDeclarationById(declarationId)
                .subscribe((userDeclaration: UserDeclaration) => {
                    this.userDeclarationService.clearDeclarationServiceData();
                    this._userDeclarationDataStore.setStoreData(userDeclaration);
                }, (error) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    private getApplicableForms(): void {
        this.$subscriptions.push(
            this.userDeclarationService.getApplicableForms(this.userDeclaration?.declaration)
                .subscribe({
                    next: (data: any) => {
                        const FORM_LIST = data || [];
                        this.userDeclarationService.setFormStatus(FORM_LIST);
                        setTimeout(() => {
                            this.userDeclarationService.setFormBuilderId(FORM_LIST[0], this._userDeclarationDataStore.isFormEditable());
                        });
                    },
                    error: () => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                }));
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                const EVENT_DATA = event?.content;
                if (event?.uniqueId === 'TRIGGER_USER_DECLARATION_ACTIONS' && EVENT_DATA?.actionType === 'FORM_SAVE_COMPLETE') {
                    this.userDeclarationService.isFormBuilderDataChangePresent = false;
                    this._commonService.setChangesAvailable(false);
                    const UPDATE_TIME_STAMP = Array.isArray(EVENT_DATA.result) ? EVENT_DATA.result[0]?.updateTimestamp : EVENT_DATA.updateTimestamp;
                    this.updateLastSavedTime(UPDATE_TIME_STAMP);
                    if (this.userDeclarationService.isAnyAutoSaveFailed) {
                        this.autoSaveService.commonSaveTrigger$.next({ action: 'RETRY' });
                    }
                }
            })
        );
    }

    private updateLastSavedTime(updateTimestamp: number): void {
        const USER_DECLARATION: UserDeclaration = this._userDeclarationDataStore.getData();
        USER_DECLARATION.declaration.updateTimestamp = updateTimestamp;
        this.autoSaveService.updatedLastSaveTime(updateTimestamp, true);
        this._userDeclarationDataStore.updateStore(['declaration'], { declaration: USER_DECLARATION.declaration });
    }

    private autoSaveSubscribe(): void {
        this.$subscriptions.push(
            this.autoSaveService.autoSaveTrigger$
                .subscribe((event: AutoSaveEvent) => {
                    this.userDeclarationService.formBuilderEvents.next({ eventType: 'SAVE' });
                }));
    }

    postConfirmation(modalActionEvent: ModalActionEvent): void {
        closeCommonModal(this.userDeclarationService.unSavedConfirmModalConfig.namings.modalName);
        if (modalActionEvent.action === 'SECONDARY_BTN') {
            this.userDeclarationService.isFormBuilderDataChangePresent = false;
            this.router.navigateByUrl(this._navigationService.navigationGuardUrl);
        }
    }

    closeCompleteDisclosureHistorySlider(): void {
        this.userDeclarationService.isShowOverallHistory = false;
    }

}
