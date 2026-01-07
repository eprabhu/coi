import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { DataStoreService } from './data-store.service';
import { CommonService } from '../../common/services/common.service';
import { DefineRelationshipService } from '../define-relationship/services/define-relationship.service';
import { COI, ProjectSfiRelationLoadRO } from '../coi-interface';
import { DefineRelationshipDataStoreService } from '../define-relationship/services/define-relationship-data-store.service';
import { CoiService } from './coi.service';
import { COMMON_ERROR_TOAST_MSG, CONFLICT_STATUS_TO_PROJECT_STATUS_MAP, DISCLOSURE_TYPE, HTTP_ERROR_STATUS, PROJECT_CONFLICT_STATUS_COUNT_COLOR } from '../../app-constants';
import { ExtendedProjRelDataStoreService } from '../extended-project-relation-summary/services/extended-project-relation-data-store.service';
import { ExtendedProjectRelationService } from '../extended-project-relation-summary/services/extended-project-relation.service';

@Injectable()
export class DefineRelationsRouterGuard implements CanActivate {

    constructor(
        private _coiService: CoiService,
        private _dataStore: DataStoreService,
        private _commonService: CommonService,
        private _defineRelationshipService: DefineRelationshipService,
        private _extendedProjRelService: ExtendedProjectRelationService,
        private _defineRelationshipDataStore: DefineRelationshipDataStoreService,
        private _extendedProjRelDataStoreService: ExtendedProjRelDataStoreService,
    ) {}

    async canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
        const RESULT = await this.initializeDefineRelationshipAsync(_state.url.includes('create-disclosure/relationship') ? 'EDIT' : 'VIEW');
        return RESULT; // must return true or false
    }

    async initializeDefineRelationshipAsync(mode: 'VIEW' | 'EDIT'): Promise<boolean> {
        this._defineRelationshipService.isEditMode = mode === 'EDIT';
        this._coiService.isExpandSummaryBySection['COI803'] = this._defineRelationshipService.isEditMode;
        try {
            const RESPONSE: any[] = await forkJoin(this.getAPIRequests()).toPromise();
            this._defineRelationshipService.setProjectConflictStatusMapping(RESPONSE[0]?.coiProjConflictStatusTypes);
            this._extendedProjRelService.relationshipConflictType = this._defineRelationshipService.relationshipConflictType;
            this._defineRelationshipDataStore.setStoreData(RESPONSE[1] ?? []);
            this._extendedProjRelDataStoreService.setStoreData(RESPONSE[2] ?? []);
            this._defineRelationshipService.configureScrollSpy();
            return true;
        } catch (err: any) {
            if (err.status === 405) {
                this._coiService.concurrentUpdateAction = 'Relationships';
            } else {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }
            return false;
        }
    }

    private getAPIRequests(): Observable<any>[] {
        const COI_DATA: COI = this._dataStore.getData();
        const IS_ANNUAL_DISCLOSURE = COI_DATA?.coiDisclosure?.fcoiTypeCode && String(COI_DATA.coiDisclosure.fcoiTypeCode) !== String(DISCLOSURE_TYPE.PROJECT);
        const IS_SHOW_EXTENDED_PROJECTS = IS_ANNUAL_DISCLOSURE && !this._defineRelationshipService.isEditMode;
        return [
            this.getLookups(),
            this.getProjectRelations(),
            ...(IS_SHOW_EXTENDED_PROJECTS ? [this.getExtendedProjectRelations()] : [])
        ];
    }

    private getLookups(): Observable<any> {
        return this._defineRelationshipService.lookups();
    }

    private getProjectRelations(): Observable<any> {
        const COI_DATA: COI = this._dataStore.getData();
        const PROJECT_SFI_RELATION: ProjectSfiRelationLoadRO = {
            personId: COI_DATA.coiDisclosure.person.personId,
            disclosureId: COI_DATA.coiDisclosure.disclosureId,
            disclosureNumber: COI_DATA.coiDisclosure.disclosureNumber,
            dispositionStatusCode: COI_DATA.coiDisclosure.dispositionStatusCode
        };
        return this._commonService.getProjectRelations(PROJECT_SFI_RELATION);
    }

    private getExtendedProjectRelations(): Observable<any> {
        const COI_DATA: COI = this._dataStore.getData();
        const PROJECT_SFI_RELATION: ProjectSfiRelationLoadRO = {
            personId: COI_DATA.coiDisclosure.person.personId,
            disclosureId: COI_DATA.coiDisclosure.disclosureId,
            disclosureNumber: COI_DATA.coiDisclosure.disclosureNumber,
            dispositionStatusCode: COI_DATA.coiDisclosure.dispositionStatusCode
        };
        return this._extendedProjRelService.getExtendedProjectRelations(PROJECT_SFI_RELATION);
    }

}
