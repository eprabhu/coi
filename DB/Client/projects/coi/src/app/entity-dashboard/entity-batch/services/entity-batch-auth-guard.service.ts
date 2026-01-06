import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../../../common/services/common.service';
import { forkJoin, NextObserver, Observable, of } from 'rxjs';
import { EntityBatchService } from './entity-batch.service';
import { BATCH_STATUS_TYPE_CODE, COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, IMPORT_ENTITY_RIGHTS } from '../../../app-constants';
import { InformationAndHelpTextService } from '../../../common/services/informationAndHelpText.service';
import { BatchEntity, BatchEntityRO } from './entity-batch.interface';

interface ForkJoinResponse { BATCH_LOOKUP: any, LOAD_BATCH: BatchEntity, sectionConfiguration?: any }

@Injectable()
export class EntityBatchAuthGuard implements CanActivate {
    constructor(public _commonService: CommonService,
                private _entityBatchService: EntityBatchService,
                private _informationAndHelpTextService: InformationAndHelpTextService) {}

    private readonly _moduleCode = 'GE26';

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
        const HAS_IMPORT_ENTITY_RIGHTS = this._commonService.getAvailableRight(IMPORT_ENTITY_RIGHTS);
        const BATCH_ID: number = Number(route.queryParamMap.get('batchId'));
        if (HAS_IMPORT_ENTITY_RIGHTS && this._commonService.isShowEntityMigrationPhase && !Number.isNaN(BATCH_ID)) {
            return new Observable<boolean>((observer: NextObserver<boolean>) => {
                forkJoin({
                    BATCH_LOOKUP: this.getBatchEntityLookups(),
                    LOAD_BATCH: this.loadBatchDetails(BATCH_ID),
                    sectionConfiguration: this.isSectionConfigAlreadyFetched() ? of(undefined) : this.getEntityBatchSectionConfig()
                }).subscribe({
                    next: (result: ForkJoinResponse) => {
                        if (result?.sectionConfiguration !== undefined) {
                            this.updateSectionConfig(result.sectionConfiguration);
                        }
                        this._entityBatchService.entityBatchLookups = result?.BATCH_LOOKUP;
                        if (result?.LOAD_BATCH && this.checkBatchStatusCompleted(result?.LOAD_BATCH)) {
                            this._entityBatchService.batchEntity = result.LOAD_BATCH;
                            this._entityBatchService.currentBatchId = BATCH_ID;
                            observer.next(true);
                        } else {
                            this._entityBatchService.showErrorAndGoToDashboard();
                            observer.next(false);
                        }
                    },
                    error: (_error: any) => {
                        this._entityBatchService.showErrorAndGoToDashboard();
                    }
                })
            });
        } else {
            this._entityBatchService.showErrorAndGoToDashboard();
            return of(false);
        }
    }

    private checkBatchStatusCompleted(batchEntity: BatchEntity): boolean {
        return batchEntity?.batchDetail?.batchStatusType?.batchStatusCode === BATCH_STATUS_TYPE_CODE.COMPLETED;
    }

    private getBatchEntityLookups(): Observable<any> {
        return this._entityBatchService.getBatchEntityLookups();
    }

    private loadBatchDetails(batchId: number): Observable<any> {
        const BATCH_ENTITY_RO: BatchEntityRO = this._entityBatchService.getBatchEntityRO(batchId);
        return this._entityBatchService.loadBatchDetails(BATCH_ENTITY_RO);
    }

    private isSectionConfigAlreadyFetched(): number {
        return Object.keys(this._entityBatchService.entityBatchSectionConfig).length;
    }

    private updateSectionConfig(sectionData: any): void {
        this._entityBatchService.entityBatchSectionConfig = this._commonService.getSectionCodeAsKeys(sectionData);
        this.setModuleConfiguration();
    }
    
    private getEntityBatchSectionConfig(): any {
        return this._commonService.getDashboardActiveModules(this._moduleCode);
    }

    private setModuleConfiguration(): void {
        this._informationAndHelpTextService.moduleConfiguration = this._entityBatchService.entityBatchSectionConfig;
    }
    
}