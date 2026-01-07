/**
 * created by Harshith A S
 * last updated on 29-10-2019.
 * please read this documentation before making any code changes
 * https://docs.google.com/document/d/1vDG_di1AkWOi5AboNArc60zhX3Vzw4lcVTUo66lEnUc/edit
 */

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { KeyPerformanceIndicatorProposalService } from './key-performance-indicator-proposal.service';
import { CommonService } from '../../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
import { DataStoreService } from '../../../services/data-store.service';

@Component({
    selector: 'app-key-performance-indicator-proposal',
    templateUrl: './key-performance-indicator-proposal.component.html',
    styleUrls: ['./key-performance-indicator-proposal.component.css']
})
export class KeyPerformanceIndicatorProposalComponent implements OnInit, OnDestroy {

    @Input() result: any;
    @Input() mode = null;
    isCollapse = [];
    isFlag = false;
    proposalKpiList: any = [];
    proposalId: any = '';
    $subscriptions: Subscription[] = [];
    hasUnsavedChanges = false;

    constructor(public _commonService: CommonService,
                private _keyPerformanceIndicatorProposalService: KeyPerformanceIndicatorProposalService,
                private _autoSaveService: AutoSaveService,
                private _dataStore: DataStoreService) { }

    ngOnInit() {
        this.listenForGlobalSave();
        this.proposalId = this.result.proposal.proposalId;
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /**
     * save or update targets in proposal key performance indicator
     */
    saveOrUpdate() {
        const resultCopy = JSON.parse(JSON.stringify(this.result));
        this.$subscriptions.push(
            this._keyPerformanceIndicatorProposalService.saveOrUpdateProposalKPIs({ proposalKpis: this.result.proposalKpis }).subscribe(data => {
                this._dataStore.updateStore(['proposalKpis'], this.result);
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Key Performance Indicator saved.');
                this.hasUnsavedChanges = false;
                this.result.dataVisibilityObj.dataChangeFlag = false;
                this._dataStore.updateStore(['dataVisibilityObj'], this.result);
                this._autoSaveService.setUnsavedChanges('Key Performance Indicator', 'proposal-performace-indicator', false, true);
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Target failed. Please try again.');
            }));
    }
    /**
     * score validation for restrict special characters, negative numbers.
     */
    scoreValidation(event: any) {
        const pattern = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/;
        if (!pattern.test(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
        if (!this.result.dataVisibilityObj.dataChangeFlag) {
            this.result.dataVisibilityObj.dataChangeFlag = true;
            this.hasUnsavedChanges = true;
            this._dataStore.updateStore(['dataVisibilityObj'], this.result);
            this._autoSaveService.setUnsavedChanges('Key Performance Indicator', 'proposal-performace-indicator', true, true);
        }
    }

    listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => {
            if (this.hasUnsavedChanges && this.result.proposalKpis.length > 0 && this.mode !== 'view') { this.saveOrUpdate() }}));
    }
}
