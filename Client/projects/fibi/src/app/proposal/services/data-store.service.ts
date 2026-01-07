import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ProposalService } from './proposal.service';

@Injectable()
export class DataStoreService {

    constructor(private _commonService: CommonService, private _proposalService: ProposalService) { }

    private proposalData: any = {};

    dataEvent = new Subject();

    getData(keys?: Array<string>): any {
        if (!keys) {
            return JSON.parse(JSON.stringify(this.proposalData));
        }
        const data: any = {};
        keys.forEach(key => {
            data[key] = this.proposalData[key];
        });
        return JSON.parse(JSON.stringify(data));
    }

    manualDataUpdate(updatedData) {
        const KEYS = Object.keys(updatedData);
        KEYS.forEach(key => {
            if (typeof (updatedData[key]) == 'object') {
                this.proposalData[key] = JSON.parse(JSON.stringify(updatedData[key]));
            } else {
                this.proposalData[key] = updatedData[key];
            }
        });
        this.dataEvent.next(KEYS);
    }

    setProposal(data: any) {
        this.proposalData = data;
        if (this._proposalService.proposalSectionConfig['DP316'].isActive) {
            this._commonService.externalReviewRights = this.getExternalReviewerRights(data);
        }
    }

    getExternalReviewerRights(data) {
        return data.availableRights.filter(e => e === 'MODIFY_EXT_REVIEW' || e === 'CREATE_EXT_REVIEW');
    }

    updateStore(updatedData: string[], variable) {
        const UPDATED_DATA = {};
        updatedData.forEach(element => {
            UPDATED_DATA[element] = variable[element];
        });
        this.manualDataUpdate(UPDATED_DATA);
    }
}
