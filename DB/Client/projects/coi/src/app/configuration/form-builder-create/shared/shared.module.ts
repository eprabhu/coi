import {NgModule} from '@angular/core';
import {CommonModule, CurrencyPipe, DecimalPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';

import {MatDatepickerModule} from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {MatIconModule} from '@angular/material/icon';
import {DATE_PICKER_FORMAT_MATERIAL} from '../../../app-constants';
import {MatMenuModule} from '@angular/material/menu';
import {CdkMenuModule} from '@angular/cdk/menu';
import { FormNoDataLabelComponent } from './no-data-label/no-data-label.component';
import { ViewQuestionnaireV2Component } from './view-questionnaire-v2/view-questionnaire-v2.component';
import { DataLayerComponent } from './form-builder-view/data-layer/data-layer.component';
import { PELayerComponent } from './form-builder-view/PE-layer/PE-layer.component';
import { OPACompUncompComponent } from './form-builder-view/PE-components/OPA-comp-uncomp/OPA-comp-uncomp.component';
import { OPAOutsideFinancialRelationComponent } from './form-builder-view/PE-components/OPA-outside-financial-relation/OPA-outside-financial-relation.component';
import { OPAInstituteResourceUseComponent } from './form-builder-view/PE-components/OPA-institute-resources/OPA-institute-resources.component';
import { OPAStudentSubordinateEmployeeComponent } from './form-builder-view/PE-components/OPA-student-subordinate-employee/OPA-student-subordinate-employee.component';
import { OPACompUncompService } from './form-builder-view/PE-components/OPA-comp-uncomp/OPA-comp-uncomp.service';
import { FormBuilderService } from './form-builder-view/form-builder.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormBuilderViewComponent } from './form-builder-view/form-builder-view.component';
import { FormSectionsComponent } from './form-builder-view/form-sections/form-sections.component';
import { FormValidatorModule } from './form-validator/form-validator.module';
import { FormElementViewComponent } from './form-element-view/form-element-view.component';
import { SharedModule } from '../../../shared/shared.module';
import { FormElementViewService } from './form-element-view/form-element-view.service';
import { FormBuilderCreateService } from '../form-builder-create.service';
import { COITravelDestinationComponent } from './form-builder-view/PE-components/COI-travel-destination/COI-travel-destination.component';
import { OPAAppointmentComponent } from './form-builder-view/PE-components/OPA-appointment/OPA-appointment.component';
import { SharedFormEngagementCardComponent } from './shared-form-engagement-card/shared-form-engagement-card.component';
import { OPAPersonEngagementsComponent } from './form-builder-view/PE-components/OPA-person-engagements/OPA-person-engagements.component';
import { NoInformationComponent } from './no-information/no-information.component';
import { OpaPersonEngagementService } from './form-builder-view/PE-components/OPA-person-engagements/opa-person-engagement.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CKEditorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        CdkMenuModule,
        MatMenuModule,
        MatSelectModule,
        MatInputModule,
        MatAutocompleteModule,
        FormValidatorModule,
        SharedModule,
        // SharedComponentModule
    ],
    declarations: [
        FormNoDataLabelComponent, ViewQuestionnaireV2Component, DataLayerComponent,
        PELayerComponent, OPACompUncompComponent, OPAOutsideFinancialRelationComponent,
        OPAInstituteResourceUseComponent, OPAStudentSubordinateEmployeeComponent,
        FormBuilderViewComponent, FormSectionsComponent, FormElementViewComponent,
        COITravelDestinationComponent, OPAAppointmentComponent, OPAPersonEngagementsComponent,
        SharedFormEngagementCardComponent, NoInformationComponent
    ],
    exports: [
        CKEditorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        CdkMenuModule,
        MatMenuModule,
        FormNoDataLabelComponent,
        ViewQuestionnaireV2Component,
        DataLayerComponent,
        PELayerComponent,
        OPACompUncompComponent,
        OPAOutsideFinancialRelationComponent,
        OPAInstituteResourceUseComponent,
        OPAStudentSubordinateEmployeeComponent,
        COITravelDestinationComponent,
        MatAutocompleteModule,
        FormBuilderViewComponent,
        FormSectionsComponent,
        FormValidatorModule,
        FormElementViewComponent,
        OPAAppointmentComponent,
        OPAPersonEngagementsComponent,
        SharedFormEngagementCardComponent,
        NoInformationComponent,
        SharedModule
    ],

    providers: [
        {
            provide: DateAdapter, useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        {provide: MAT_DATE_FORMATS, useValue: DATE_PICKER_FORMAT_MATERIAL},
        CurrencyPipe,
        DecimalPipe,
        OPACompUncompService,
        OpaPersonEngagementService,
        FormBuilderService,
        FormElementViewService,
        FormBuilderCreateService
    ],

})
export class FormSharedModule {
}
