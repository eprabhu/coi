import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardComparisonComponent } from './award-comparison.component';
import { RouterModule } from '@angular/router';
import { ToolKitComponent } from './tool-kit/tool-kit.component';
import { ToolKitService } from './tool-kit/tool-kit.service';
import { DateParserService } from '../../common/services/date-parser.service';
import { SharedModule } from '../../shared/shared.module';
import { CurrencyParserService } from '../../common/services/currency-parser.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: AwardComparisonComponent,
        children: [
          { path: '', redirectTo: 'review', pathMatch: 'full'},
          {
            path: '',
            loadChildren: () => import('./review/review.module').then(m => m.ReviewModule)
          },
          {
            path: '',
            loadChildren: () => import('./comment/comment.module').then(m => m.CommentModule)
          }
      ]}
    ]),
    CommonModule,
    SharedModule,
    FormsModule
  ],
  declarations: [AwardComparisonComponent, ToolKitComponent],
  providers: [ToolKitService, DateParserService, CurrencyParserService]
})
export class AwardComparisonModule { }
