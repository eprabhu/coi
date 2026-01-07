import { Component, OnDestroy, OnInit } from '@angular/core';
import { GrantCommonDataService } from '../services/grant-common-data.service';
import { ActivatedRoute } from '@angular/router';
import { AutoSaveService } from '../../common/services/auto-save.service';

@Component({
  selector: 'app-other-information',
  template: `<div id ="grant-other-information-section">
              <app-custom-element *ngIf="grantId"
              [moduleItemKey]="grantId" [moduleCode]='15'
              [viewMode]="commonData.isViewMode ? 'view' : 'edit'"
              [isShowSave]="false"
              [externalSaveEvent]="autoSaveService.autoSaveTrigger$"
              (dataChangeEvent)="dataChangeEvent($event)">
              </app-custom-element> </div>`,
})
export class OtherInformationComponent implements OnInit, OnDestroy {

  grantId: any;
  viewMode: string;

  constructor(public commonData: GrantCommonDataService,
              private _activeRoute: ActivatedRoute,
              public autoSaveService: AutoSaveService) { }

  ngOnInit() {
    this.grantId = this._activeRoute.snapshot.queryParamMap.get('grantId');
  }

  dataChangeEvent(event) {
    this.commonData.isGrantCallDataChange = event;
    this.autoSaveService.setUnsavedChanges('Other Information', 'other-information', event, true);
  }

  ngOnDestroy() {
    this.autoSaveService.clearUnsavedChanges();
  }

}
