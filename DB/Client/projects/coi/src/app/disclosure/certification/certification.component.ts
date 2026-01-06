import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {DataStoreService} from '../../disclosure/services/data-store.service';
import {CoiService} from '../../disclosure/services/coi.service';
import {subscriptionHandler} from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { CommonService } from '../../common/services/common.service';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CREATE_DISCLOSURE_RELATIONSHIP_ROUTE_URL } from '../../app-constants';
import { DataStoreEvent } from '../../common/services/coi-common.interface';
import { HeaderService } from '../../common/header/header.service';

@Component({
    selector: 'app-certification',
    templateUrl: './certification.component.html',
    styleUrls: ['./certification.component.scss'],
    animations: [fadeInOutHeight]
})
export class CertificationComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    dependencies = ['coiDisclosure'];
    isEditMode = true;
    isSaving = false;
    deployMap = environment.deployUrl;
    coiDisclosure: any;
    isReadMore = false;
    collapseViewMore = {};

    constructor(public _dataStore: DataStoreService,
        public router: Router,
        public _coiService: CoiService,
        public commonService: CommonService,
        private _headerService: HeaderService,
    ) { }

    ngOnInit() {
        this._coiService.isShowCertifyInfo = true;
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        window.scrollTo(0, 0);
    }
    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._coiService.isCertified = false;
    }

    private getDataFromStore() {
        const DATA = this._dataStore.getData(this.dependencies);
        this.coiDisclosure = DATA.coiDisclosure;
        if (this.coiDisclosure && this.coiDisclosure.certifiedBy) {
            this._coiService.isCertified = true;
        }
        // this.isEditMode = this._dataStore.getEditModeForCOI();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                if (storeEvent.dependencies?.some((dep) => this.dependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }

checkForDisable() {
    return this._coiService.certificationResponseErrors.length > 0 && this._coiService.certificationResponseErrors.find(data => data.validationType == "VE")
}
  toggleCertification() {
    this._coiService.isCertified = !this._coiService.isCertified;
    this._dataStore.dataChanged = true;
    this._coiService.unSavedModules = 'Certification';
    this._coiService.stepsNavBtnConfig.primaryBtnConfig.isDisabled = !this._coiService.isCertified;
    this._coiService.stepsNavBtnConfig.primaryBtnConfig.title = this._coiService.isCertified ? 'Click here to submit disclosure' : 'Please certify to submit disclosure';
    this._coiService.stepsNavBtnConfig.primaryBtnConfig.ariaLabel = this._coiService.stepsNavBtnConfig.primaryBtnConfig.title;
  }

    closeCertifyInfo() {
        this._coiService.isShowCertifyInfo = false;
    }

    getSFIName(sfiName) {
        return sfiName.split("||")[1];
    }

    openSFI(sfiName) {
       let sfiId = sfiName.split("||")[0];
       this.router.navigate(['/coi/create-disclosure/sfi']);
       this._coiService.focusSFIId = sfiId;
    }

    openRelationship(projectName) {
        let sfiId = projectName.DisclDetailId;
        this.router.navigate([CREATE_DISCLOSURE_RELATIONSHIP_ROUTE_URL]);
        this._coiService.focusSFIRelationId = sfiId;
        this._coiService.focusModuleId = projectName.ModuleItemKey;
     }

    collapseViewMoreOption(id: number, flag: boolean): void {
        this.collapseViewMore[id] = !flag;
    }

    getProjectName(projectName) {
        return projectName.Title + ' | ' + projectName.Entity;
    }

    openQuestionnaire() {
        this._coiService.isFromCertificationTab = true;
        this.router.navigate(['/coi/create-disclosure/screening'],{ queryParamsHandling: 'merge' });

        const { QUESTIONNAIRE_ID: questionnaireId  } = this._coiService.currentActiveQuestionnaire;
        setTimeout(() => {
            if (questionnaireId) {
                this._headerService.$globalPersistentEventNotifier.$questionnaire.next({ questionnaireId, isTriggerValidation: true });
            }
        });
    }

    triggerDisclosureCertificationModal(): void {
        this.commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_DISCLOSURE_CERTIFY_MODAL'});
    }
}
