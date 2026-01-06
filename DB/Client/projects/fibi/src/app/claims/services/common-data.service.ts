import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class CommonDataService {

    public $claimData = new BehaviorSubject<any>(null);
    public $saveEndorsement = new Subject<boolean>();
    public $claimAdvanceData = new BehaviorSubject<object>(null);

    public isClaimDataChange = false;
    public claimSectionConfig: any = {};

    constructor(public _commonService: CommonService) {
    }

    setClaimData(claimData) {
        this.$claimData.next(claimData);
    }

    isClaimModifiable(): boolean {
        const CLAIM_DATA: any = this.$claimData.value;
        return ['MODIFY_CLAIMS', 'CLAIM_PREPARER'].some(right => CLAIM_DATA.availableRights.includes(right));
    }

    isTriggerable(): boolean {
        const CLAIM_DATA: any = this.$claimData.value;
        return CLAIM_DATA.availableRights.includes('CLAIM_TRIGGER_INVOICE');
    }


}
