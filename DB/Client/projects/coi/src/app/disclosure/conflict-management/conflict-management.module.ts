import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConflictManagementComponent} from './conflict-management.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [{path: '', component: ConflictManagementComponent}];

@NgModule({
    declarations: [
        ConflictManagementComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class ConflictManagementModule {
}
