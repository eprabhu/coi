import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {SummaryComponent} from './summary.component';
import {ReviewComponent} from './review/review.component';
import {CoiSummaryEventsAndStoreService} from './services/coi-summary-events-and-store.service';
import {CertifySummaryComponent} from './review/certify-summary/certify-summary.component';
import {ScreeningQuestionnaireSummaryComponent} from './review/screening-questionnaire-summary/screening-questionnaire-summary.component';
import {SfiSummaryComponent} from './review/sfi-summary/sfi-summary.component';
import {CoiSummaryService} from './services/coi-summary.service';
import {FormsModule} from '@angular/forms';
import {SharedModule} from "../../shared/shared.module";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SharedComponentModule} from "../../shared-components/shared-component.module";
import { EntityDetailsModule } from '../entity-details/entity-details.module';
import { SharedDefineRelationshipModule } from '../define-relationship/shared-define-relationship/shared-define-relationship.module';
import { SummaryNavigationComponent } from './summary-navigation/summary-navigation.component';
import { DefineRelationshipSummaryComponent } from './review/define-relationship-summary/define-relationship-summary.component';
import { ExtendedProjectRelationSummaryModule } from '../extended-project-relation-summary/extended-project-relation-summary.module';
import { ExtendedProjectRelationshipSummaryComponent } from './review/extended-project-relationship-summary/extended-project-relationship-summary.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([{path: '', component: SummaryComponent}]),
        SharedModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        SharedComponentModule,
        EntityDetailsModule,
        SharedDefineRelationshipModule,
        ExtendedProjectRelationSummaryModule
    ],
    declarations: [
        SummaryComponent,
        ReviewComponent,
        SfiSummaryComponent,
        ScreeningQuestionnaireSummaryComponent,
        CertifySummaryComponent,
        SummaryNavigationComponent,
        DefineRelationshipSummaryComponent,
        ExtendedProjectRelationshipSummaryComponent
    ],
    providers: [
        CoiSummaryEventsAndStoreService,
        CoiSummaryService
    ]
})
export class SummaryModule {
}
