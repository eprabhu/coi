import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationComponent } from './certification.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../../shared-component/shared-component.module';

const routes: Routes = [{path: '', component: CertificationComponent}];

@NgModule({
    declarations: [CertificationComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        SharedComponentModule,
    ]
})
export class CertificationModule {
}
