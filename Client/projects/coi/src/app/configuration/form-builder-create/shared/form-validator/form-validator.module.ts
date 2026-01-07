import { CommonModule } from "@angular/common";
import { FormValidatorComponent } from "./form-validator.component";
import { NgModule } from "@angular/core";
import { FreeDraggingDirective } from "./free-dragging.directive";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        FormValidatorComponent,
        FreeDraggingDirective
    ],
    exports: [
        FormValidatorComponent
    ]
})
export class FormValidatorModule { }
