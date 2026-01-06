import { Injectable } from '@angular/core';
import { CanDeactivate} from '@angular/router';
import { FormBuilderCreateService } from '../form-builder-create/form-builder-create.service';
import { FormEditorComponent } from './form-editor/form-editor/form-editor.component';
declare const $: any;


@Injectable()
export class FormBuilderCreateRouteGaurdService implements  CanDeactivate<FormEditorComponent> {

	constructor(private _formBuilderService: FormBuilderCreateService) { }

	canDeactivate(): boolean {
		if (!this._formBuilderService.isUnconfiguredcomponentsPresent()) {
			return true;
		} else {
			$('#FB-unSavedChange-warning-Modal').modal('show');
		}
		return false;
	}

}
