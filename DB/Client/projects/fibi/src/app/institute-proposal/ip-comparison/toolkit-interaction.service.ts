import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CompareDetails } from './interface';

@Injectable()
export class ToolkitInteractionService {

	constructor() { }
	// for triggering comparison in review-component.
	$compareEvent = new Subject<CompareDetails>();
	// for setting view mode in review-component.
	$viewEvent = new Subject<CompareDetails>();
	// for setting left and right version (header values).
	$currentHeader = new BehaviorSubject<any>({});
	// for showing comparison text in header.
	$isCompareActive = new BehaviorSubject<boolean>(false);
	// for triggering comparison when compare with button in header is clicked.
	$compareFromHeader = new Subject();
	// for expanding and collapsing toolkit when review-component arrow clicked.
	$isToolkitVisible = new BehaviorSubject(true);
}
