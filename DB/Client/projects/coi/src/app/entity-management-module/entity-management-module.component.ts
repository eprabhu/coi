import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { AutoSaveService } from '../common/services/auto-save.service';
import { Subscription } from 'rxjs';
import {subscriptionHandler} from '../../../../fibi/src/app/common/utilities/subscription-handler';
import { EntityManagementService } from './entity-management.service';
import { ENTITY_RIGHT_PANEL_SECTION_ID, ENTITY_RIGHT_PANEL_TOGGLE_BTN_ID } from './shared/entity-constants';
import { focusElementById } from '../common/utilities/custom-utilities';

@Component({
    selector: 'app-entity-management-module',
    templateUrl: './entity-management-module.component.html',
    styleUrls: ['./entity-management-module.component.scss']
})
export class EntityManagementModuleComponent implements OnInit, OnDestroy {

    result: any;
    dunsResponse: any;
    $subscriptions: Subscription[] = [];
    bindOnClick: (event: MouseEvent) => void;
    bindOnKeyup: (event: KeyboardEvent) => void;
    toggleBtnId = ENTITY_RIGHT_PANEL_TOGGLE_BTN_ID;

    private timeOutRef: ReturnType<typeof setTimeout>;

    constructor(private _el: ElementRef, public _autoSaveService: AutoSaveService, public entityManagementService: EntityManagementService) { }

    ngOnInit(): void {
        this._autoSaveService.initiateAutoSave();
        this.initializeEventBindings();
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        this._autoSaveService.stopAutoSaveEvent();
        subscriptionHandler(this.$subscriptions);
    }

    private initializeEventBindings(): void {
        this.bindOnClick = this.onDocumentClick.bind(this);
        this.bindOnKeyup = this.onDocumentKeyup.bind(this);
        this.addListener();
    }

    private onDocumentClick(event: MouseEvent): void {
        this.handleOutsideInteraction(event.target as HTMLElement);
    }

    private onDocumentKeyup(event: KeyboardEvent): void {
        if (event.key === 'Tab') {
            this.handleOutsideInteraction(event.target as HTMLElement);
        }
    }

    private handleOutsideInteraction(target: HTMLElement): void {
        const RIGHT_PANEL_ELEMENT = this._el.nativeElement.querySelector('#' + ENTITY_RIGHT_PANEL_SECTION_ID);
        const RIGHT_PANEL_TOGGLE_ELEMENT = this._el.nativeElement.querySelector('#' + ENTITY_RIGHT_PANEL_TOGGLE_BTN_ID);
        if (RIGHT_PANEL_TOGGLE_ELEMENT?.contains(target)) {
            return;
        }
        if (!RIGHT_PANEL_ELEMENT?.contains(target)) {
            this.entityManagementService.isExpandRightNav = false;
            this.removeListener();
        }
    }

    private addListener(): void {
        document.addEventListener('click', this.bindOnClick);
        document.addEventListener('keyup', this.bindOnKeyup);
    }

    private removeListener(): void {
        document.removeEventListener('click', this.bindOnClick);
        document.removeEventListener('keyup', this.bindOnKeyup);
    }

    toggleRightPanel(): void {
        this.entityManagementService.isExpandRightNav = !this.entityManagementService.isExpandRightNav;
        this.entityManagementService.isExpandRightNav ? this.addListener() : this.removeListener();
        if (this.entityManagementService.isExpandRightNav) {
            this.timeOutRef = setTimeout(() => {
                focusElementById(ENTITY_RIGHT_PANEL_SECTION_ID);
            }, 50);
        }
    }

}
