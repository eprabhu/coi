import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OpaRouteLogComponent } from './opa-route-log.component';
import { SharedComponentModule } from "../../shared-components/shared-component.module";

const ROUTES: Routes = [{path: '', component: OpaRouteLogComponent}];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentModule,
        RouterModule.forChild(ROUTES)
    ],
    declarations: [OpaRouteLogComponent]
})
export class OpaRouteLogModule {}
