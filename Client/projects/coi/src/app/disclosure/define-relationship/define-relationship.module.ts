import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefineRelationshipComponent } from './define-relationship.component';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';
import { SharedDefineRelationshipModule } from './shared-define-relationship/shared-define-relationship.module';

const routes: Routes = [{path: '', component: DefineRelationshipComponent}];
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        SharedModule,
        SharedComponentModule,
        SharedDefineRelationshipModule
    ],
    declarations: [
        DefineRelationshipComponent,
    ]
})
export class DefineRelationshipModule { }
