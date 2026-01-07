import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ManagementPlanCreationFormComponent } from '../management-plan-creation-form/management-plan-creation-form.component';
import { Subject } from 'rxjs';
import { CmpCreationEvent } from '../management-plan.interface';

@Component({
    selector: 'app-management-plan-creation',
    templateUrl: './management-plan-creation.component.html',
    styleUrls: ['./management-plan-creation.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ManagementPlanCreationFormComponent]
})
export class ManagementPlanCreationComponent {

    $performAction = new Subject<CmpCreationEvent>();

    constructor(private _location: Location) {}

    redirectBack(): void {
        this._location.back();
    }

    proceedCreateCMP(): void {
        this.$performAction.next({ actionType: 'SAVE_AND_VALIDATE' });
    }

}
