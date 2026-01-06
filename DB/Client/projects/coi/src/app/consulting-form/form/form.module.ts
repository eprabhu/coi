import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormComponent } from './form.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { FormSharedModule } from '../../configuration/form-builder-create/shared/shared.module';

@NgModule({
    declarations: [
        FormComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: FormComponent }]),
        SharedModule,
        SharedComponentModule,
        FormsModule,
        FormSharedModule
    ],
    providers: []
})
export class FormModule {}
