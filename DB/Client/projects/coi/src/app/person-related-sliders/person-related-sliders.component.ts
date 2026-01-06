import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { openCoiSlider } from '../common/utilities/custom-utilities';
import { CommonService } from '../common/services/common.service';

@Component({
    selector: 'app-person-related-sliders',
    templateUrl: './person-related-sliders.component.html',
    styleUrls: ['./person-related-sliders.component.scss']
})
export class PersonRelatedSlidersComponent implements OnInit {

    @Input() for: string;
    @Input() sliderType: string;
    @Input() personId: string;
    @Input() isShowRiskLevel = false;
    @Input() personName: string;
    @Input() reviewStatusCode: any = null;
    @Input() isAttachmentViewMode: boolean = true;
    @Input() canShowAddNote = false;
    @Output() closePage: EventEmitter<any> = new EventEmitter<any>();

    canAddNote = false;
    loginPersonId = '';
    gridClass: string = 'coi-grid-1 coi-grid-md-1 coi-grid-lg-1 coi-grid-xl-1 coi-grid-xxl-2';

    constructor(private _commonService: CommonService) { }

    ngOnInit(): void {
        this.loginPersonId = this._commonService.getCurrentUserDetail('personID');
        setTimeout(() => {
            openCoiSlider('disclosure-person-slider');
        });
    }

    validateSliderClose() {
        setTimeout(() => {
            this.closePage.emit(null);
        }, 500);
    }

    concurrencyAction(event: any): void {
        this.closePage.emit(event);
    }

}
