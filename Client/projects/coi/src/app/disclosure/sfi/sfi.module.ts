import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SfiComponent} from './sfi.component';
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { MatIconModule } from '@angular/material/icon';
import { EntityDetailsModule } from '../entity-details/entity-details.module';

const routes: Routes = [{path: '', component: SfiComponent}];
@NgModule({
    declarations: [
        SfiComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedComponentModule,
        MatIconModule,
        EntityDetailsModule
    ], exports : [
        SfiComponent
    ]
})
export class SfiModule  {
}
