import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ComparisonDataStoreService {

	$comparisonData = new Subject();
	$helpText = new Subject();
	$currentMethod = new Subject();
	$customElementCompare = new Subject();

	constructor() { }

	setHelpTextData(data) {
		this.$helpText.next(data);
	}

	setCustomElementCompareData(data) {
		this.$customElementCompare.next(data);
	}

	setCurrentMethodData(data) {
		this.$currentMethod.next(data);
	}

	setComparisonData(data) {
		this.$comparisonData.next(data);
	}

}
