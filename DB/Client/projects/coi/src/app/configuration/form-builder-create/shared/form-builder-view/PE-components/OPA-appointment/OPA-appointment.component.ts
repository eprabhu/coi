import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../../../../../common/services/common.service';

@Component({
    selector: 'app-OPA-appointment',
    templateUrl: './OPA-appointment.component.html',
    styleUrls: ['./OPA-appointment.component.scss']
})
export class OPAAppointmentComponent implements OnInit {

    @Input() componentData: any = {};
    @Input() formBuilderId: number | string | null = null;

    hrOrgUnitDisplayName = '';
    adminOrgUnitDisplayName = '';

    constructor(private _commonService: CommonService) { }

    ngOnInit(): void {
        this.hrOrgUnitDisplayName = this._commonService.getPersonLeadUnitDetails({
            homeUnitNumber: this.componentData?.appointmentDetails?.hrOrgUnitId,
            homeUnitName: this.componentData?.appointmentDetails?.hrOrgUnitTitle
        });
        this.adminOrgUnitDisplayName = this._commonService.getPersonLeadUnitDetails({
            homeUnitNumber: this.componentData?.appointmentDetails?.adminOrgUnitId,
            homeUnitName: this.componentData?.appointmentDetails?.adminOrgUnitTitle
        });
    }

}
