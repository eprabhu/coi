
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonMaintenanceService } from '../person-maintenance.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ActivatedRoute } from '@angular/router';
import { DegreeRequestObject } from '../degree/degree-interface';
declare var $: any;

@Component({
    selector: 'app-degree',
    templateUrl: './degree.component.html',
    styleUrls: ['./degree.component.css'],
})
export class DegreeComponent implements OnInit, OnDestroy {

    $subscriptions = [];
    degreeList = [];
    personId: string;
    degreeDeleteId: string;
    deleteDegreeType: string;
    degreeTypeLookUp: any;
    isSaving = false;
    isDeleting = false;
    isShowTable = false;
    degreeValidationMap = new Map();
    isMaintainPerson: Boolean;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    degreeObject: DegreeRequestObject = new DegreeRequestObject();

    constructor(
        private _route: ActivatedRoute,
        public _commonService: CommonService,
        private _personService: PersonMaintenanceService,

    ) { }

    ngOnInit() {
        this.getPermission();
        this._personService.isPersonEditOrView = true;
        this.personId = this._route.snapshot.queryParams['personId'];
        this.loadPersonDegrees();
        this.loadDegreeTypeLookUpdata();

    }

    async getPermission() {
        this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
    }

    loadDegreeTypeLookUpdata(): void {
        this.$subscriptions.push(
            this._personService.getDegreeType().subscribe((data: any) => {
                this.degreeTypeLookUp = data;
            })
        );
    }

    loadPersonDegrees(): void {
        this.$subscriptions.push(
            this._personService
                .getAllPersonDegrees(this.personId)
                .subscribe((res: any) => {
                    this.degreeList = res;
                    this.isShowTable = true;
                },
                    (err: any) => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Listing of Degrees failed. Please try again.');
                        this.isShowTable = true;
                    }
                )
        );
    }

    saveDegree(): void {
        if (this.degreeDetailsValidation() && !this.isSaving) {
            this.isSaving = true;
            this.prepareRequestBodyObject();
            this.$subscriptions.push(
                this._personService.saveOrUpdatePersonDegree({ personDegree: this.degreeObject }).subscribe(
                    (res: any) => {
                        this.degreeList = res;
                        $('#addDegreeModal').modal('hide');
                        this.clearRequestObject();
                        setTimeout(() => {
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Degree added successfully.');
                        }, 500);
                        this.isSaving = false;
                    },
                    (err: any) => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Degree failed. Please try again.');
                        this.isSaving = false;
                    }
                )
            );
        }
    }

    degreeDetailsValidation(): boolean {
        this.degreeValidationMap.clear();
        if (!this.degreeObject.degreeCode) {
            this.degreeValidationMap.set('degreeType', '* please select a degree type');
        }
            return this.degreeValidationMap.size === 0;
    }

    prepareRequestBodyObject(): void {
        this.degreeObject.personId = this.personId;
        this.degreeObject.degreeType = this.degreeTypeLookUp.find((el: any) => el.degreeCode == this.degreeObject.degreeCode);
    }

    clearRequestObject(): void {
        this.degreeObject = new DegreeRequestObject();
    }

    deleteDegree(): void {
        if (!this.isDeleting) {
            this.isDeleting = true;
            this.$subscriptions.push(this._personService.deletePersonDegree(this.degreeDeleteId).subscribe((data: any) => {
                this.degreeList.splice(this.degreeList.findIndex((el: any) => el.personDegreeId === this.degreeDeleteId), 1);
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Degree deleted successfully.');
                this.isDeleting = false;
                this.degreeDeleteId = null;
                this.deleteDegreeType = null;
            }, (err: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Degree failed. Please try again.');
                this.isDeleting = false;
            }));
        }
    }

    setDeleteDegreeTypeAndId(degreeDetail: any) {
        this.deleteDegreeType = degreeDetail.degreeType.description;
        this.degreeDeleteId = degreeDetail.personDegreeId;
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
