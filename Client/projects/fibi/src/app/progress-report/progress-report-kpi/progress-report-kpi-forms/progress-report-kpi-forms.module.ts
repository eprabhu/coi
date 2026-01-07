import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProgressReportKpiFormsService} from './progress-report-kpi-forms.service';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {ProgressReportKpiForm1Component} from './progress-report-kpi-form1/progress-report-kpi-form1.component';
import {ProgressReportKpiForm2Component} from './progress-report-kpi-form2/progress-report-kpi-form2.component';
import { ProgressReportKpiForm3Component } from './progress-report-kpi-form3/progress-report-kpi-form3.component';
import {ProgressReportKpiForm4Component} from './progress-report-kpi-form4/progress-report-kpi-form4.component';
import { ProgressReportKpiForm5Component } from './progress-report-kpi-form5/progress-report-kpi-form5.component';
import { ProgressReportKpiForm6Component } from './progress-report-kpi-form6/progress-report-kpi-form6.component';
import {ProgressReportKpiForm7Component} from './progress-report-kpi-form7/progress-report-kpi-form7.component';
import {ProgressReportKpiForm8Component} from './progress-report-kpi-form8/progress-report-kpi-form8.component';
import { ProgressReportKpiForm9Component } from './progress-report-kpi-form9/progress-report-kpi-form9.component';
import { ProgressReportKpiForm10Component } from './progress-report-kpi-form10/progress-report-kpi-form10.component';
import {ProgressReportKpiForm11Component} from './progress-report-kpi-form11/progress-report-kpi-form11.component';
import { ProgressReportKpiForm12Component } from './progress-report-kpi-form12/progress-report-kpi-form12.component';
import {ProgressReportKpiForm13Component} from './progress-report-kpi-form13/progress-report-kpi-form13.component';
import {ProgressReportKpiForm14Component} from './progress-report-kpi-form14/progress-report-kpi-form14.component';
import {ProgressReportKpiForm15Component} from './progress-report-kpi-form15/progress-report-kpi-form15.component';
import {ProgressReportKpiForm16Component} from './progress-report-kpi-form16/progress-report-kpi-form16.component';

@NgModule({
    declarations: [
        ProgressReportKpiForm1Component,
        ProgressReportKpiForm2Component,
        ProgressReportKpiForm3Component,
        ProgressReportKpiForm4Component,
        ProgressReportKpiForm5Component,
        ProgressReportKpiForm6Component,
        ProgressReportKpiForm7Component,
        ProgressReportKpiForm8Component,
        ProgressReportKpiForm9Component,
        ProgressReportKpiForm10Component,
        ProgressReportKpiForm11Component,
        ProgressReportKpiForm12Component,
        ProgressReportKpiForm13Component,
        ProgressReportKpiForm14Component,
        ProgressReportKpiForm15Component,
        ProgressReportKpiForm16Component
    ],

    imports: [
        CommonModule,
        FormsModule,
        SharedModule
    ],
    providers: [ProgressReportKpiFormsService],
    exports: [
        ProgressReportKpiForm1Component,
        ProgressReportKpiForm2Component,
        ProgressReportKpiForm3Component,
        ProgressReportKpiForm4Component,
        ProgressReportKpiForm5Component,
        ProgressReportKpiForm6Component,
        ProgressReportKpiForm7Component,
        ProgressReportKpiForm8Component,
        ProgressReportKpiForm9Component,
        ProgressReportKpiForm10Component,
        ProgressReportKpiForm11Component,
        ProgressReportKpiForm12Component,
        ProgressReportKpiForm13Component,
        ProgressReportKpiForm14Component,
        ProgressReportKpiForm15Component,
        ProgressReportKpiForm16Component
    ]
})
export class ProgressReportKpiFormsModule {
}
