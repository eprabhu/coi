import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';

@Component({
    selector: 'app-comments',
    template: `<app-shared-comment [requestId]="result.proposal.proposalId"
                                   [isEditMode]="isCommentEditMode"
                                   [requestModuleCode]="3"
                                   (commentEditEvent)="setUnsavedChanges(true)" 
                                   (commentSaveEvent)="setUnsavedChanges(false)">
		</app-shared-comment>`
})
export class CommentsComponent implements OnInit, OnDestroy {

    result: any;
    $subscriptions: Subscription[] = [];
    dataDependencies = ['proposal', 'availableRights', 'dataVisibilityObj'];
    isCommentEditMode = false;
    hasUnsavedChanges = false;

    constructor(
        private _dataStore: DataStoreService,
        private _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        this._autoSaveService.clearUnsavedChanges();
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore() {
        this.result = this._dataStore.getData(this.dataDependencies);
        this.isShowCommentButton();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }

    private isShowCommentButton() {
        let isViewPrivate = false;
        let isLoginIsGM;
        if (this.result.availableRights !== null && this.result.availableRights.length > 0) {
            isViewPrivate = this.result.availableRights.includes('MAINTAIN_PRIVATE_COMMENTS');
            isLoginIsGM = this.result.availableRights.includes('START_EVALUATION');
        }
        this.isCommentEditMode = ((isLoginIsGM != null && isLoginIsGM !== undefined) || isViewPrivate) ? true : false;
    }

    setUnsavedChanges(flag: boolean) {
        if (this.hasUnsavedChanges != flag) {
            this._autoSaveService.setUnsavedChanges('Comments', 'proposal-comments', flag, true);
            this.result.dataVisibilityObj.dataChangeFlag = flag;
            this._dataStore.updateStore(['dataVisibilityObj'], this.result);
        }
        this.hasUnsavedChanges = flag;
    }
}
