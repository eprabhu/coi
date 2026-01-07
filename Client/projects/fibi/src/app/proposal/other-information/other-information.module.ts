import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInformationComponent } from './other-information.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{path: '', component: OtherInformationComponent}]),
        SharedModule,
    ],
    declarations: [OtherInformationComponent]
})
export class OtherInformationModule {
}
