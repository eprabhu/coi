import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormListComponent } from './form-list.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import {FormsModule} from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
            {path: '', component: FormListComponent}
        ]),
        FormsModule
    ],
    declarations: [FormListComponent]
})

export class FormListModule { }


