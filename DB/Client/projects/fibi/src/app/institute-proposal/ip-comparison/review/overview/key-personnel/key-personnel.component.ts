import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { fileDownloader } from '../../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { IPPersons } from '../../../comparison-constants';
import { ComparisonData } from '../../../interface';
import { OverviewService } from '../overview.service';

@Component({
	selector: 'app-ip-key-personnel',
	templateUrl: './key-personnel.component.html',
	styleUrls: ['./key-personnel.component.css']
})
export class KeyPersonnelComponent implements OnInit, OnDestroy {
	fileName: any;
	currentPersons: any;
	proposalPersons: any;
	isReverse: boolean;
	direction: number;
	sortListBy: any;
	$subscriptions: Subscription[] = [];
	isKeyPersonWidgetOpen = true;
	comparisonData: ComparisonData;
	deployMap = environment.deployUrl;
	currentMethod = 'VIEW';

	constructor(private _ipOverviewService: OverviewService) { }

	ngOnInit() {
		this.comparisonData = new ComparisonData();
		this.getComparisonData();
		this.viewOrCompare();
	}

	private getComparisonData(): void {
		this.$subscriptions.push(this._ipOverviewService.$childComparisonData.subscribe((data: any) => {
			this.comparisonData = data;
		}));
	}

	private viewOrCompare(): void {
		this.$subscriptions.push(this._ipOverviewService.$childMethod.subscribe((data: any) => {
			if (data + '' !== '') {
				this.currentMethod = data || '';
				data + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
			}
		}));
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	/**
	 * @returns void
	 * 1.compare key persons of base with current
	 * 2.loop through the compared output
	 * 3.if the status is 0 then
	 * 4.find the persons from the current version
	 * 5.compare the inner array of key persons
	 * We have a array of array lets say data = [A[B]] to compare here so the logic is to compare
	 * so we compare key persons of both versions first. Then if person status is 0 that
	 * means present in both versions. otherwise its new or deleted no need to check the items
	 * inside each key person. So we go through each of Person and find its match in current then
	 * we compare the inner Units array inside the proposalPersons. So achieve this need
	 * to keep a copy of current key persons's since after the first comparison the data on the current
	 * is lost. so currentPersons holds a copy of the data.
	 * filename is save in temp variable so that it will be available on compare mode
	 * (during compare the file name may contain html tags)
	 * personId and rolodexId is set to proposalPersonAttachment and units
	 * as primary key combination for compare array
	 */

	private compare(): void {
		this.setPersonId(this.comparisonData.base[IPPersons.reviewSectionName]);
		this.setPersonId(this.comparisonData.current[IPPersons.reviewSectionName]);
		this.currentPersons = JSON.parse(JSON.stringify(this.comparisonData.current[IPPersons.reviewSectionName]));
		this.proposalPersons = compareArray(this.comparisonData.base[IPPersons.reviewSectionName],
			this.comparisonData.current[IPPersons.reviewSectionName],
			IPPersons.reviewSectionUniqueFields,
			IPPersons.reviewSectionSubFields);
		this.proposalPersons.forEach((person, index) => {
			if (person.status === 0) {
				const current = this.findInCurrent(person.personId ? person.personId : person.rolodexId);
				person.units = compareArray(person.units,
					current.units,
					['unitNumber', 'personId', 'rolodexId'], []);
				this.fileName[index] = person.proposalPersonAttachment.length ? person.proposalPersonAttachment[0].fileName : [];
				person.proposalPersonAttachment = compareArray(person.proposalPersonAttachment,
					current.proposalPersonAttachment,
					IPPersons.reviewSectionUniqueFields,
					['fileName']);
			}
		});
	}

	private setPersonId(personList): void {
		personList.forEach(person => {
			person.units.map(v => Object.assign(v, { personId: person.personId, rolodexId: person.rolodexId }));
			person.proposalPersonAttachment.map(v => Object.assign(v, { personId: person.personId, rolodexId: person.rolodexId }));
		});
	}

	private findInCurrent(code): any {
		return this.currentPersons.find(person => person.personId === code || person.rolodexId === code);
	}

	private setCurrentView(): void {
		if (this.comparisonData.base) {
			this.proposalPersons = this.comparisonData.base[IPPersons.reviewSectionName];
			this.fileName = [];
		}
	}

	downloadProposalPersonCV(attachment): void {
		this.$subscriptions.push(this._ipOverviewService.downloadAttachment(attachment.attachmentId)
			.subscribe(data => {
				fileDownloader(data, attachment.fileName);
			}));
	}

	getFileName(name): any {
		if (name.length > 10) {
			let fileName = name.slice(0, 10);
			fileName = fileName + '...';
			return fileName;
		} else {
			return name;
		}
	}

}
