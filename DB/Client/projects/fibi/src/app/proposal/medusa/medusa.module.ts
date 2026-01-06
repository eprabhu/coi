import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MedusaComponent } from './medusa.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{path: '', component: MedusaComponent}];

@NgModule({
    declarations: [MedusaComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
    ]
})
export class MedusaModule {
}
