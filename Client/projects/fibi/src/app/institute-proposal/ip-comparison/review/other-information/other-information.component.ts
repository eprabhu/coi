import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ComparisonDataStoreService } from '../../comparison-data-store.service';
import { ToolkitInteractionService } from '../../toolkit-interaction.service';

@Component({
	selector: 'app-ip-other-information',
	templateUrl: './other-information.component.html'
})
export class OtherInformationComponent implements AfterViewInit {

	isOtherInfoOpen = false;
	customElementDetails = new Subject();

	constructor(private _comparisonStoreData: ComparisonDataStoreService) {
	}

	ngAfterViewInit() {
		this._comparisonStoreData.$customElementCompare.subscribe((data: any) => {
			this.customElementDetails.next(data);
		});
	}

	updateAccordionStatus(event) {
		this.isOtherInfoOpen = event;
	}

}
