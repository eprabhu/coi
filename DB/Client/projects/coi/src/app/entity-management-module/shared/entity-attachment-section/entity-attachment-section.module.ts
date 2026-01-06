import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../shared/shared.module";
import { EntityAttachmentSectionComponent } from "./entity-attachment-section.component";
import { SharedComponentModule } from "../../../shared-components/shared-component.module";
import { EntityAttachmentModalService } from "./entity-attachment-section.service";
import { EntityAttachmentModalComponent } from "./entity-attachment-modal/entity-attachment-modal.component";

@NgModule({
    declarations: [
        EntityAttachmentSectionComponent,
        EntityAttachmentModalComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        SharedModule,
        SharedComponentModule,
    ],
    exports: [
        EntityAttachmentModalComponent,
        EntityAttachmentSectionComponent
    ],
    providers: [
        EntityAttachmentModalService
    ]
})
export class EntityAttachmentSectionModule { }
