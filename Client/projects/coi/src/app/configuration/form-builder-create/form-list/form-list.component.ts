import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilderCreateService } from '../form-builder-create.service';
import {Observable, Subscription} from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import {CreateForm, FormHeader, FormList} from '../form-builder-create-interface';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonService} from '../../../common/services/common.service';
import {HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../app-constants';
declare const $: any;

@Component({
    selector: 'app-form-list',
    templateUrl: './form-list.component.html',
    styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    isReadMore = [];
    $formList: Observable<FormList[]> = new Observable();
    formValidationMap = new Map();
    createForm: CreateForm = new CreateForm();
    searchText = '';


    constructor(private _formBuilderService: FormBuilderCreateService, private _router: Router,
                private _activatedRoute: ActivatedRoute, private _commonService: CommonService) { }

    ngOnInit() {
        this.getFormList();
        this._formBuilderService.versionModalIntialLoad = true;
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    getFormList(): void {
        this.$formList = this._formBuilderService.getFormList();
    }

    createNewForm(): void {
        if (!this.isFormCreationValid()) { return; }
        this.$subscriptions.push(this._formBuilderService.createFormHeader(this.createForm).subscribe((data: FormHeader) => {
            $('#FB-create-form-modal').modal('hide');
            this._router.navigate(['../form-editor'],
                { queryParams: { formBuilderId: data.formBuilderId }, relativeTo: this._activatedRoute });

        }, (error) => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Creating Form failed. Please try again later.');
        }));
    }

    cancelCreateForm(): void {
        this.createForm = new CreateForm();
        this.formValidationMap.clear();
    }

    isFormCreationValid(): boolean {
        this.formValidationMap.clear();
        if (!this.createForm.title) {
            this.formValidationMap.set('title', '*Please enter a title');
        }
        if (!this.createForm.description) {
            this.formValidationMap.set('description', '*Please enter a description');
        }
        return this.formValidationMap.size <= 0;
    }

    activateOrDeactivateForm(status: string, form: FormList ): void {
        this.$subscriptions.push(this._formBuilderService.updateFormHeader(this.activateOrDeactivateFormObject(form, status)).
        subscribe((data: FormHeader) => {
            form.isActive = data.isActive;
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `Form ${status === 'Y' ? 'activated' : 'deactivated'} successfully.`);
        }, (error) => {
            setTimeout(() => {
            form.isActive = status === 'Y' ? 'N' : 'Y';
            }, 1000);
            this._commonService.showToast(HTTP_ERROR_STATUS, `Form ${status === 'Y' ? 'activation' : 'deactivation'} failed. Please try again later.`);
        }));
    }

    activateOrDeactivateFormObject(form: FormList, status: string )  {
        return {
            formBuilderId : String(form.formBuilderId),
            title : form.title,
            description : form.description,
            isActive : status,
            versionStatus: form.versionStatus
        };
    }


}
