import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SearchComponent } from './search/search.component';
import { CodeTableComponent } from './code-table/code-table.component';
import { SearchService } from './search/search.service';
import { CodeTableService } from './code-table/code-table.service';
import { FilterPipe } from './code-table/filter.pipe';
import { CodetableRoutingModule } from './codetable-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [CommonModule,
    FormsModule,
    CodetableRoutingModule,
    SharedModule
  ],
  declarations: [SearchComponent,
    CodeTableComponent,
    FilterPipe,
  ],
  providers: [SearchService,
    CodeTableService
  ],
  exports: [CodeTableComponent,
    SearchComponent
  ]
})
export class CodetableModule { }
