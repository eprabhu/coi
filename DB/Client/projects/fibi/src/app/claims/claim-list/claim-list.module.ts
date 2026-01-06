import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClaimListComponent} from './claim-list.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import { ClaimListService } from './claim-list.service';

const routes: Routes = [
    {path: '', component: ClaimListComponent}
];

@NgModule({
    declarations: [ClaimListComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        SharedModule,
        FormsModule
    ],
    providers: [ClaimListService]
})
export class ClaimListModule {
}
