import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoiRouteLogComponent } from './coi-route-log.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';

const ROUTES: Routes = [{ path: '', component: CoiRouteLogComponent }];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentModule,
        RouterModule.forChild(ROUTES)
    ],
    declarations: [CoiRouteLogComponent]
})
export class CoiRouteLogModule { }
