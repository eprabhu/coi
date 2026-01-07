import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilderCreateComponent } from './form-builder-create.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormBuilderCreateService } from './form-builder-create.service';

const routes: Routes = [
    {
        path: '', component: FormBuilderCreateComponent,
        children: [
            { path: '', redirectTo: 'form-list', pathMatch: 'full' },
            { path: 'form-list', loadChildren: () => import('./form-list/form-list.module').then(m => m.FormListModule) },
            { path: 'form-editor', loadChildren: () => import('./form-editor/form-editor.module').then(m => m.FormEditorModule) }
        ]
    }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
    ],
    declarations: [FormBuilderCreateComponent],
    providers: [FormBuilderCreateService]
})
export class FormBuilderCreateModule { }
