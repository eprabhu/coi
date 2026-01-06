import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EndorsementComponent} from './endorsement.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {EndorsementEditComponent} from './endorsement-edit/endorsement-edit.component';
import {EndorsementViewComponent} from './endorsement-view/endorsement-view.component';

const routes: Routes = [
    {path: '', component: EndorsementComponent}
];

@NgModule({
    declarations: [EndorsementComponent, EndorsementEditComponent, EndorsementViewComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        SharedModule,
        FormsModule
    ]
})
export class EndorsementModule {
}
