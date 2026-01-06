import { NgModule } from '@angular/core';
import {AppAutocompleterComponent} from './app-autocompleter/app-autocompleter.component';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import { GraphComponent } from './graph/graph.component';
import { DynamicPopoverComponent } from './dynamic-popover/dynamic-popover.component';
import { PersonCardComponent } from './graph/data-cards/person-card.component';
import { AwardCardComponent } from './graph/data-cards/award-card.component';
import { SponsorCardComponent } from './graph/data-cards/sponsor-card.component';
import { TravelDisclosureCardComponent } from './graph/data-cards/travel-card.component';
import { UnitCardComponent } from './graph/data-cards/unit-card.componenet';
import { ProposalCardComponent } from './graph/data-cards/proposal-card.component';
import { COICardComponent } from './graph/data-cards/coi-card.component';
import { EntityCardComponent } from './graph/data-cards/entity-card.componenet';
import { CountryCardComponent } from './graph/data-cards/country-card.component';
import { TimelineComponent } from './graph/timeline/timeline.component';
import { DragDirective } from './directives/drag.directive';
import { TooltipComponent } from './graph/tooltip/tooltip.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppAutocompleterComponent,
    GraphComponent,
    DynamicPopoverComponent,
    TimelineComponent,
    DragDirective,
    TooltipComponent,

  ],
  imports: [
      FormsModule,
      CommonModule,
      MatIconModule,
      MatButtonModule,
      PersonCardComponent,
      AwardCardComponent,
      SponsorCardComponent,
      TravelDisclosureCardComponent,
      UnitCardComponent,
      ProposalCardComponent,
      COICardComponent,
      UnitCardComponent,
      EntityCardComponent,
      CountryCardComponent
  ],
  exports: [
    AppAutocompleterComponent,
    GraphComponent,
    DynamicPopoverComponent,
    DragDirective
  ]
})
export class SharedLibraryModule { }
