import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { QuestionnaireComponent } from "./questionnaire.component";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { ProposalSharedModule } from "../proposal-shared/proposal-shared.module"

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProposalSharedModule,
    RouterModule.forChild([
      {
        path: "",
        component: QuestionnaireComponent
      }
    ])
  ],
  declarations: [QuestionnaireComponent]
})
export class QuestionnaireModule {}
