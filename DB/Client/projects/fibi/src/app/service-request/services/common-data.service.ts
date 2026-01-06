import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ServiceRequestRoot } from '../service-request.interface';

@Injectable()

export class CommonDataService {

    serviceRequestData: ServiceRequestRoot = new ServiceRequestRoot();
    dataEvent = new Subject();

    constructor(
        private _commonService: CommonService
    ) { }

    getData(keys: Array<string>): ServiceRequestRoot {
        const data = {};
        keys.forEach(key => {
            data[key] = this.serviceRequestData[key];
        });
        return JSON.parse(JSON.stringify(data));
    }

    updateStoreData(updatedData): void {
        const KEYS = Object.keys(updatedData);
        KEYS.forEach(key => {
            if (typeof (updatedData[key]) === 'object') {
                this.serviceRequestData[key] = JSON.parse(JSON.stringify(updatedData[key]));
            } else {
                this.serviceRequestData[key] = updatedData[key];
            }
        });
        this.dataEvent.next(KEYS);
    }

    setServiceRequestData(data: ServiceRequestRoot): void {
        this.serviceRequestData = data;
    }

    canUserEdit(): boolean {
        return !this.serviceRequestData.serviceRequest.isSystemGenerated && (this.checkDepartmentRight('MAINTAIN_SERVICE_REQUEST') ||
            this.checkDepartmentRight('CREATE_SERVICE_REQUEST') ||
            this.serviceRequestData.serviceRequest.createUser === this._commonService.getCurrentUserDetail('userName')) &&
            [1, 3, 7].includes(this.serviceRequestData.serviceRequest.statusCode);
    }

    checkDepartmentRight(right: string): boolean {
        return !this.serviceRequestData.serviceRequest.isSystemGenerated && this.serviceRequestData.availableRights.length
            && this.serviceRequestData.availableRights.includes(right);
    }

}
