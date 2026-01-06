import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getCurrentTime } from '../../common/utilities/date-utilities';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { CommonService } from '../../common/services/common.service';
import { CustomElement } from '../../shared/custom-element/custom-element.interface';
import { CustomELementAutoSaveConfig } from '../../common/services/coi-common.interface';

@Component({
	selector: 'app-coi-custom-element-autosave',
	templateUrl: './coi-custom-element-autosave.component.html',
	styleUrls: ['./coi-custom-element-autosave.component.scss']
})

export class CoiCustomElementAutosaveComponent {

	@Input() config: CustomELementAutoSaveConfig;
	@Output() availableConfiguredElements = new EventEmitter<CustomElement[]>();

	constructor(private _autoSaveService: AutoSaveService, private _commonService: CommonService) { }

	afterCustomDataAutoSave(isSaved: boolean): void {
		const STATUS = isSaved ? 'SUCCESS' : 'ERROR';
		if (isSaved) {
			this._autoSaveService.lastSavedTime = getCurrentTime();
		}
		this._commonService.setChangesAvailable(false);
		this._commonService.hideAutoSaveSpinner(STATUS);
	}

	setCustomDataChange(isChanged: boolean): void {
		if (isChanged) {
			this._commonService.setChangesAvailable(true);
			this._commonService.showAutoSaveSpinner();
		}
	}

	checkIfHasCustomElements(customElements: CustomElement[]): void {
		this.availableConfiguredElements.next(customElements);
	}
}
