import {Component, OnInit, AfterViewInit, HostListener, OnDestroy} from '@angular/core';
import { FBConfiguration } from '../../shared/form-builder-view/form-builder-interface';
import { ActivatedRoute } from '@angular/router';
import { FormBuilderCreateService } from '../../form-builder-create.service';
import { CommonService } from '../../../../common/services/common.service';
import {subscriptionHandler} from '../../../../common/utilities/subscription-handler';
import {Subscription} from 'rxjs';
import {FB_SECOND_NAV_BAR_ID} from '../../form-builder-constants';


@Component({
    selector: 'app-form-preview',
    templateUrl: './form-preview.component.html',
    styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent implements OnInit, AfterViewInit, OnDestroy {

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.isWindowScrolling();
    }

    fbConfiguration = new FBConfiguration();
    formBuilderId: number;
    $subscriptions: Subscription[] = [];

    constructor(private _route: ActivatedRoute,
        public _formBuilderService: FormBuilderCreateService,
        private _commonService: CommonService, private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.formBuilderId = Number(params['formBuilderId']);
            if (this.formBuilderId) {
                this.loadForm();
                this._formBuilderService.formBuilderVisibilityMode = 'PREVIEW';
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.formBuilderId) {
            this.fbConfiguration.moduleItemCode = '23';
            this.fbConfiguration.moduleSubItemCode = '0';
            this.fbConfiguration.documentOwnerPersonId = this._commonService.currentUserDetails.personID;
            this.fbConfiguration.formBuilderId = this.formBuilderId;
            this._formBuilderService.formBuilderEvents.next({ eventType: 'BLANK_FORM', data: this.fbConfiguration });
        }
    }

    loadForm() {
        if (this.formBuilderId) {
            this.fbConfiguration.moduleItemCode = '23';
            this.fbConfiguration.moduleSubItemCode = '0';
            this.fbConfiguration.documentOwnerPersonId = this._commonService.currentUserDetails.personID;
            this.fbConfiguration.formBuilderId = this.formBuilderId;
            this._formBuilderService.formBuilderEvents.next({ eventType: 'BLANK_FORM', data: this.fbConfiguration });
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        const SECOND_NAV_BAR =  document.getElementById(FB_SECOND_NAV_BAR_ID);
        this.addOrRemoveNavStyle(SECOND_NAV_BAR, 'Add', 'fb-mt-2');
    }

    private isWindowScrolling() {
        const scrollPosition = window.scrollY;
        const SECOND_NAV_BAR =  document.getElementById(FB_SECOND_NAV_BAR_ID);
        this.addOrRemoveNavStyle(SECOND_NAV_BAR, scrollPosition > 1 ? 'Remove' : 'Add', 'fb-mt-2');
    }

    private addOrRemoveNavStyle(element: HTMLElement , action: string, cssClass: string) {
        element.classList.toggle(cssClass, action === 'Add');
    }

}
