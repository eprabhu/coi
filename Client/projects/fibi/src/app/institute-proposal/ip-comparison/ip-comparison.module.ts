import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpComparisonComponent } from './ip-comparison.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReviewComponent } from './review/review.component';
import { ToolKitComponent } from './tool-kit/tool-kit.component';
import { BudgetComponent } from './review/budget/budget.component';
import { OverviewComponent } from './review/overview/overview.component';
import { FormsModule } from '@angular/forms';
import { OtherInformationComponent } from './review/other-information/other-information.component';
import { CommentsComponent } from './review/comments/comments.component';
import { AttachmentsComponent } from './review/attachments/attachments.component';
import { SharedComponentModule } from '../../shared-component/shared-component.module';
import { AreaOfResearchComponent } from './review/overview/area-of-research/area-of-research.component';
import { GeneralInformationComponent } from './review/overview/general-information/general-information.component';
import { KeyPersonnelComponent } from './review/overview/key-personnel/key-personnel.component';
import { SpecialReviewComponent } from './review/overview/special-review/special-review.component';
import { ToolkitInteractionService } from './toolkit-interaction.service';
import { ComparisonDataStoreService } from './comparison-data-store.service';
import { ToolKitService } from './tool-kit/tool-kit.service';
import { AttachmentService } from './review/attachments/attachment.service';
import { CurrencyParserService } from '../../common/services/currency-parser.service';
import { DateParserService } from '../../common/services/date-parser.service';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([{ path: '', component: IpComparisonComponent }]),
		SharedModule,
		FormsModule,
		SharedComponentModule
	],
	providers: [ToolkitInteractionService,
		ComparisonDataStoreService,
		ToolKitService,
		AttachmentService,
		CurrencyParserService,
		DateParserService
	],
	declarations: [
		IpComparisonComponent,
		ReviewComponent,
		ToolKitComponent,
		OverviewComponent,
		OtherInformationComponent,
		BudgetComponent,
		CommentsComponent,
		AttachmentsComponent,
		AreaOfResearchComponent,
		GeneralInformationComponent,
		KeyPersonnelComponent,
		SpecialReviewComponent
	]
})
export class IpComparisonModule { }
