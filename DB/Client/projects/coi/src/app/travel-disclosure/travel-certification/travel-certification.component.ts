import { Component, OnInit, OnDestroy } from '@angular/core';
import { TravelDisclosureService } from '../services/travel-disclosure.service';
import { TravelDataStoreService } from '../services/travel-data-store.service';
import { TravelDisclosure } from '../travel-disclosure.interface';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { CommonService } from '../../common/services/common.service';

@Component({
    selector: 'app-travel-certification',
    templateUrl: './travel-certification.component.html',
    styleUrls: ['./travel-certification.component.scss'],
    animations: [fadeInOutHeight]
})
export class TravelCertificationComponent implements OnInit, OnDestroy {

    isCheckBoxDisable = true;
    travelDisclosure: TravelDisclosure;
    constructor(public travelService: TravelDisclosureService, private _dataStore: TravelDataStoreService,
        public commonService: CommonService
    ) { }

    ngOnInit(): void {
        this.getDataFromStore();
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        this.travelService.setUnSavedChanges(false, '');
        this.travelService.isTravelCertified = false;
    }

    private getDataFromStore(): void {
        this.travelDisclosure = this._dataStore.getData();
    }

    certify(): void {
        this.travelService.setUnSavedChanges(true, 'Certification');
        this.travelService.isTravelCertified = !this.travelService.isTravelCertified;
        this.travelService.stepsNavBtnConfig.primaryBtnConfig.isDisabled = !this.travelService.isTravelCertified;
        this.travelService.stepsNavBtnConfig.primaryBtnConfig.isDisabled = !this.travelService.isTravelCertified;
        this.travelService.stepsNavBtnConfig.primaryBtnConfig.title = this.travelService.isTravelCertified ? 'Click here to submit travel disclosure' : 'Please certify to submit travel disclosure';
        this.travelService.stepsNavBtnConfig.primaryBtnConfig.ariaLabel = this.travelService.stepsNavBtnConfig.primaryBtnConfig.title;
    }

    triggerTravelCertificationModal(): void {
        this.commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_TRAVEL_CERTIFY_MODAL'});
    }

}
