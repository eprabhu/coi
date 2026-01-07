import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';
import { DataStoreEvent } from '../../../common/services/coi-common.interface';
import { MAINTAIN_DISCL_FROM_AFFILIATED_UNITS } from '../../../app-constants';
import { CmpHeader, CmpReviewLocation, CmpRouteGuard, ManagementPlanStoreData } from '../../shared/management-plan.interface';
import { CMP_REVIEWER_STATUS, CMP_STATUS, MAINTAIN_CMP_RIGHTS } from '../../shared/management-plan-constants';
import { CMP_COMMENTS_RIGHTS } from '../../../shared-components/coi-review-comments/coi-review-comments-constants';
import { CmpTaskDetails } from '../sub-modules/management-plan-tasks/task.interface';

@Injectable()
export class ManagementPlanDataStoreService {

    constructor(private _commonService: CommonService) { }

    public storeData = new ManagementPlanStoreData();
    dataChanged = false;
    moduleSectionConfig: any = {};

    dataEvent = new Subject<DataStoreEvent>();

    getData(keys?: Array<string>): any {
        if (!keys) {
            return deepCloneObject(this.storeData);
        }
        const data: any = {};
        keys.forEach(key => {
            data[key] = this.storeData[key];
        });
        return deepCloneObject(data);
    }

    updateStore(updatedData: (keyof ManagementPlanStoreData)[], variable): void {
        const UPDATED_DATA = {};
        updatedData.forEach(element => {
            UPDATED_DATA[element] = variable[element];
        });
        this.manualDataUpdate(UPDATED_DATA);
    }

    manualDataUpdate(updatedData: any): void {
        const KEYS = Object.keys(updatedData);
        KEYS.forEach(key => {
            this.storeData[key] = deepCloneObject(updatedData[key]);
        });
        this.dataEvent.next({ dependencies: KEYS, action: 'UPDATE' });
    }

    setRouteGuardStoreData(managementPlan: CmpRouteGuard): void {
        const STORE_DATA = { ... new ManagementPlanStoreData(), ...managementPlan?.CMP_HEADER };
        STORE_DATA.cmpEntityList = managementPlan?.ENTITY_DATA;
        STORE_DATA.cmpProjectList = managementPlan?.PROJECT_DATA;
        STORE_DATA.loggedPersonTaskList = managementPlan?.PERSON_TASK;
        STORE_DATA.cmpReviewLocationList = managementPlan?.REVIEWERS_LIST;
        this.setStoreData(STORE_DATA);
    }

    setStoreData(data: ManagementPlanStoreData): void {
        this.storeData = deepCloneObject(data);
        const KEYS = Object.keys(data);
        this.dataEvent.next({ dependencies: KEYS, action: 'REFRESH' });
    }

    getCommentButtonVisibility(): boolean {
        const HAS_COMMENT_RIGHT = this._commonService.getAvailableRight(CMP_COMMENTS_RIGHTS);
        const IS_CMP_PERSON = this.isLoggedCmpPerson();
        const IS_LOGGED_PERSON_REVIEWER = this.isLoggedPersonReviewer();
        const HAS_MAINTAIN_CMP_RIGHTS = this.getHasMaintainCmp();
        return IS_CMP_PERSON || HAS_MAINTAIN_CMP_RIGHTS || IS_LOGGED_PERSON_REVIEWER || HAS_COMMENT_RIGHT;
    }

    isFormEditable(): boolean {
        const IS_CMP_PERSON = this.isLoggedCmpPerson();
        const IS_LOGGED_PERSON_REVIEWER = this.isLoggedPersonReviewer();
        const HAS_MAINTAIN_CMP_RIGHTS = this.getHasMaintainCmp();
        return this.isFormEditableStatus() && (IS_CMP_PERSON || HAS_MAINTAIN_CMP_RIGHTS || IS_LOGGED_PERSON_REVIEWER);
    }

    isFormEditableStatus(): boolean {
        const CMP_HEADER: CmpHeader = this.storeData?.plan;
        const EDITABLE_STATUSES: string[] = [
            CMP_STATUS.INPROGRESS.toString(),
            CMP_STATUS.DRAFT.toString(),
        ];
        const DECLARATION_REVIEW_STATUS_CODE = CMP_HEADER?.statusType?.statusCode?.toString();
        return EDITABLE_STATUSES.includes(DECLARATION_REVIEW_STATUS_CODE);
    }

    isLoggedPersonReviewer(): boolean {
        const REVIEWERS_LIST: CmpReviewLocation[] = this.storeData?.cmpReviewLocationList;
        const LOGGED_PERSON_ID = this._commonService.getCurrentUserDetail('personID');
        const IS_LOGGED_PERSON_REVIEWER = REVIEWERS_LIST?.some(({ assigneePersonId }) => assigneePersonId === LOGGED_PERSON_ID);
        return IS_LOGGED_PERSON_REVIEWER;
    }

    getActiveLoggedInReviewer(): CmpReviewLocation | null {
        const REVIEWERS_LIST: CmpReviewLocation[] = this.storeData?.cmpReviewLocationList;
        const LOGGED_PERSON_ID = this._commonService.getCurrentUserDetail('personID');
        const ACTIVE_REVIEWER_DETAILS = REVIEWERS_LIST?.find(reviewer =>
            reviewer?.assigneePersonId === LOGGED_PERSON_ID && String(reviewer?.reviewStatusTypeCode) !== String(CMP_REVIEWER_STATUS.COMPLETED));
        return ACTIVE_REVIEWER_DETAILS || null;
    }

    isLocationReviewsCompleted(): boolean {
        const REVIEWERS_LIST: CmpReviewLocation[] = this.storeData?.cmpReviewLocationList;
        return REVIEWERS_LIST.every(reviewer => reviewer?.reviewStatusTypeCode && String(reviewer.reviewStatusTypeCode) === String(CMP_REVIEWER_STATUS.COMPLETED));
    }

    isLoggedCmpPerson(): boolean {
        const CMP_HEADER: CmpHeader = this.storeData.plan;
        const LOGGED_PERSON_ID = this._commonService.getCurrentUserDetail('personID');
        return LOGGED_PERSON_ID === CMP_HEADER?.person?.personId;
    }

    getHasMaintainCmp(): boolean {
        return this._commonService.getAvailableRight(MAINTAIN_CMP_RIGHTS);
    }

    getCanEditOrReview(): boolean {
        return true;
    }

    getIsAdminOrCanManageAffiliatedDiscl(): boolean {
        // const { isHomeUnitSubmission } = this.storeData.plan || {};
        return this._commonService.getIsAdminOrCanManageAffiliatedDiscl(true, null, MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
    }

    /* 
    * To check the logged in user is the assignee for the specific task
    */
    checkLoggedInUserIsAssignee(task: CmpTaskDetails): boolean {
        const LOGGED_PERSON_ID = this._commonService.getCurrentUserDetail('personID');
        return task?.assigneePersonId ? String(task.assigneePersonId) === String(LOGGED_PERSON_ID) : false;
    }

}
