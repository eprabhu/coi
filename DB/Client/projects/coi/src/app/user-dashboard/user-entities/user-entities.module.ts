import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserEntitiesComponent} from './user-entities.component';
import {RouterModule, Routes} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {SharedComponentModule} from "../../shared-components/shared-component.module";
import { SharedModule } from '../../shared/shared.module';
import { EntityDetailsModule } from '../../disclosure/entity-details/entity-details.module';

const routes: Routes = [{path: '', component: UserEntitiesComponent}];

@NgModule({
    declarations: [
        UserEntitiesComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatIconModule,
        SharedModule,
        FormsModule,
        SharedComponentModule,
        EntityDetailsModule
    ]
})
export class UserEntitiesModule {
}
