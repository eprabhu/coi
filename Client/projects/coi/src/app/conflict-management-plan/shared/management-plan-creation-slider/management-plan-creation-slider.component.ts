import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { CmpCreationEvent, CmpCreationSliderConfig } from '../management-plan.interface';
import { Subject, Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { closeCoiSlider, openCoiSlider } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ManagementPlanCreationFormComponent } from '../management-plan-creation-form/management-plan-creation-form.component';

@Component({
  selector: 'app-management-plan-creation-slider',
  templateUrl: './management-plan-creation-slider.component.html',
  styleUrls: ['./management-plan-creation-slider.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule, SharedComponentModule, ManagementPlanCreationFormComponent]
})
export class ManagementPlanCreationSliderComponent implements OnInit , OnDestroy {
    
    @Input() cmpCreationSliderConfig = new CmpCreationSliderConfig();
    @Output() closeSlider = new EventEmitter<any>();

    isSaving = false;
    $performAction = new Subject<CmpCreationEvent>();

    private $subscriptions: Subscription[] = [];

    constructor(private _commonService: CommonService) {}

    ngOnInit(): void {
        this.openCmpCreationSlider();
        this.listenPerformAction();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenPerformAction(): void {
        this.$subscriptions.push(this.$performAction.subscribe((event: CmpCreationEvent) => {
            if (event.actionType === 'SAVE_COMPLETE') {
                this.closeCmpCreationSlider();
            }
        }))
    }

    closeCmpCreationSlider(): void {
        closeCoiSlider(this.cmpCreationSliderConfig?.sliderId);
        this.clearCmpCreationSlider();
    }

    clearCmpCreationSlider(): void {
        setTimeout(() => {
            this.closeSlider.emit();
        }, 500);
    }

    private openCmpCreationSlider(): void {
        setTimeout(() => {
            openCoiSlider(this.cmpCreationSliderConfig?.sliderId);
        }, 100);
    }

    proceedCreateCMP(): void {
        this.$performAction.next({ actionType: 'SAVE_AND_VALIDATE' });
    }

}
