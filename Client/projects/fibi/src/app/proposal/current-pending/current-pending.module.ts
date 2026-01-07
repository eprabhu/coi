import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentPendingComponent } from './current-pending.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CurrentPendingDetailsComponent } from './current-pending-details/current-pending-details.component';
import { PersonDetailsComponent } from './person-details/person-details.component';
import { AdditionalDetailsComponent } from './additional-details/additional-details.component';
import { PersonEventInteractionService } from './person-event-interaction.service';
import { CurrentPendingService } from './current-pending.service';
import { AdditionalDetailsViewComponent } from './additional-details/additional-details-view/additional-details-view.component';
import { DeclarationSectionComponent } from './declaration-section/declaration-section.component';
import { DeclarationViewComponent } from './declaration-section/declaration-view/declaration-view.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: CurrentPendingComponent }]),
    FormsModule,
    SharedModule
  ],
  declarations: [CurrentPendingComponent, CurrentPendingDetailsComponent, PersonDetailsComponent,
  AdditionalDetailsComponent, AdditionalDetailsViewComponent, DeclarationSectionComponent,
  DeclarationViewComponent],
  providers: [PersonEventInteractionService, CurrentPendingService]
})
export class CurrentPendingModule { }
