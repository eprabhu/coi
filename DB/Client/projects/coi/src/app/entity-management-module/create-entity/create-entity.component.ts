import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SharedEntityManagementModule } from '../shared/shared-entity-management.module';
import { DuplicateCheckObj, EntityDupCheckConfig, EntityUpdateClass } from '../shared/entity-interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
import { NavigationService } from "../../common/services/navigation.service";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EntityCreationConfig, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { deepCloneObject } from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-create-entity',
    templateUrl: './create-entity.component.html',
    styleUrls: ['./create-entity.component.scss'],
    imports: [SharedModule, SharedEntityManagementModule, FormsModule, CommonModule],
    standalone: true
})
export class CreateEntityComponent implements OnInit, OnDestroy {

    constructor(private _activatedRoute: ActivatedRoute,
                private _navigationService: NavigationService,
                private _router: Router,
                public _commonService: CommonService,
                private _informationAndHelpTextService: InformationAndHelpTextService) {}

    dupCheckPayload: DuplicateCheckObj;
    entityDupCheckConfig = new EntityDupCheckConfig();
    entityCreationConfig = new EntityCreationConfig();
    $performAction = new Subject<'SAVE_AND_VALIDATE' | 'VALIDATE_ONLY'>();
    $subscriptions: Subscription[] = [];    

    ngOnInit() {
        this.listenToGlobalNotifier();
        this.entityCreationConfig.isCreateView = true;
        this._informationAndHelpTextService.moduleConfiguration = this._commonService
            .getSectionCodeAsKeys(this._activatedRoute.snapshot.data.entityConfig);
        window.scroll(0, 0);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if(data.uniqueId === 'CREATE_ENTITY_LEAVE_PAGE') {
                this.leavePageModalAction(data?.content?.modalActionEvent);
            }
        }));
    }

    private setDataChangesFlag(flag: boolean): void {
        this._commonService.isEntityChangesAvailable = flag;
    }
    
    private leavePageModalAction(modalAction: ModalActionEvent): void {
        this._commonService.closeCOILeavePageModal();
        if (modalAction.action === 'SECONDARY_BTN') {
            this._commonService.isEntityChangesAvailable = false;
            this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
        }
    }

    proceedCreateEntity() {
        this.$performAction.next('VALIDATE_ONLY');
    }

    goBack() {
        if (this._navigationService.previousURL) {
            this._router.navigateByUrl(this._navigationService.previousURL);
        } else {
            this._commonService.redirectToCOI();
        }
    }

    getMandatoryResponse(event: EntityUpdateClass) {
        this.entityDupCheckConfig.duplicateView = 'MODAL_VIEW';
        this.entityDupCheckConfig.entityActions = {
            VIEW: { visible: true }
        };
        const ENTITY_DETAILS = new DuplicateCheckObj();
        ENTITY_DETAILS.entityName = event.entityRequestFields.entityName;
        ENTITY_DETAILS.countryCode = event.entityRequestFields.countryCode;
        ENTITY_DETAILS.primaryAddressLine1 = event.entityRequestFields.primaryAddressLine1;
        ENTITY_DETAILS.primaryAddressLine2 = event.entityRequestFields.primaryAddressLine2;
        this.dupCheckPayload = deepCloneObject(ENTITY_DETAILS);
    }

    duplicateCheckResponse(event: 'CLOSE_BTN' | 'SECONDARY_BTN' | 'PRIMARY_BTN' | 'NOT_FOUND') {
        if (event === 'PRIMARY_BTN' || event === 'NOT_FOUND') {
            this.$performAction.next('SAVE_AND_VALIDATE');
            this.setDataChangesFlag(false);
        }
    }

    checkEntityValuesHasChange(event: boolean): void {
        this.setDataChangesFlag(event);
    }
}
