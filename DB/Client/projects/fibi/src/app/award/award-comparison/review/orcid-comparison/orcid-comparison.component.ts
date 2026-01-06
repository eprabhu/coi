import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrcidService } from '../../../../admin-modules/person-maintenance/orcid/orcid.service';
import { ActivatedRoute } from '@angular/router';
import { DateParserService } from '../../../../common/services/date-parser.service';

@Component({
	selector: 'app-orcid-comparison',
	templateUrl: './orcid-comparison.component.html',
	styleUrls: ['./orcid-comparison.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrcidComparisonComponent implements OnInit {

	$subscriptions: Subscription[] = [];
	isMoreInfoShowLevel1 = [];
	isMoreInfoShowLevel2 = [];
	orcidData: any = {};
	orcidAwardId: any;
	isDuplicate: any = {};
	isCollapse: Boolean[] = [];

	constructor(private _CDRef: ChangeDetectorRef, public _orcidService: OrcidService,
		private _activeRoute: ActivatedRoute, public dateFormatter: DateParserService) { }

	ngOnInit() {
		this.getLinkedOrcidWorksOfAward()
	}

	updateCitationData(data) {
		data.forEach(work => {
			if (work.orcidWork.citationValue && work.orcidWork.citationType.orcidWorkCitationTypeCode === 'bibtex') {
				work.orcidWork.citationValueFormatted = this.switchCitationView(work.orcidWork.citationValue);
			}
			work.orcidWork.publicationDate = work.orcidWork.publicationYear ? this.setPublishDate(work.orcidWork.publicationDay,
				work.orcidWork.publicationMonth, work.orcidWork.publicationYear) : null;
		});
	}

	getLinkedOrcidWorksOfAward() {
		this.orcidAwardId = this._activeRoute.snapshot.queryParamMap.get('awardId');
		this.$subscriptions.push(this._orcidService.getLinkedOrcidWorksOfAward({
			'awardId': this.orcidAwardId
		}).subscribe((data: any) => {
			this.updateCitationData(data.personOrcidWorks);
			this.orcidData = data;
			this._CDRef.markForCheck();
		}));
	}

	redirectUrl(url) {
		window.open(url, '_blank');
	}

	titleLabelSwitch(typeCode) {
		switch (typeCode) {
			case 'journal-article':
			case 'journal-issue':
			case 'preprint':
			case 'dissertation-thesis': { return 'Journal title'; }
			case 'book':
			case 'dictionary-entry':
			case 'book-chapter': { return 'Book title'; }
			case 'magazine-article': { return 'Magazine title'; }
			case 'newsletter': { return 'Newsletter title'; }
			case 'newspaper-article': { return 'Newspaper title'; }
			case 'report':
			case 'supervised-student-publication':
			case 'working-paper':
			case 'test':
			case 'research-tool': { return 'Institution'; }
			case 'disclosure':
			case 'license':
			case 'artistic-performance':
			case 'data-set':
			case 'invention':
			case 'lecture-speech':
			case 'patent':
			case 'research-technique':
			case 'spin-off-company':
			case 'technical-standard':
			case 'standards-and-policy':
			case 'book-review':
			case 'edited-book':
			case 'encyclopedia-entry':
			case 'other':
			case 'manual':
			case 'online-resource':
			case 'website':
			case 'translation':
			case 'online-resource':
			case 'registered-copyright': { return 'Publisher'; }
			case 'conference-abstract':
			case 'conference-paper':
			case 'conference-poster': { return 'Conference title'; }
			case 'software':
			case 'trademark': { return 'Journal article'; }
			case 'annotation':
			case 'physical-object': { return 'Custodian'; }
			default: { return 'title'; }
		}
	}

	switchCitationView(content: string) {
		let formattedContent: any = content.replace(',', '@');
		formattedContent = this.selectCitationWithCommaOnly(formattedContent);
		formattedContent = formattedContent.replace(/{},/g, '~ =');
		formattedContent = formattedContent.replace(/},/g, '@');
		formattedContent = formattedContent.replace(/",/g, '@');
		formattedContent = formattedContent.replace(/= [{"]/g, '=');
		formattedContent = formattedContent.replace(/@/g, '=');
		formattedContent = formattedContent.replace(/{/, '=');
		formattedContent = formattedContent.replace(/}\s}/, '=');
		formattedContent = formattedContent.replace(/}}/, '=');
		formattedContent = formattedContent.split('=').map(data => data.trim()).filter(Boolean);
		return formattedContent;
	}

	selectCitationWithCommaOnly(content: string) {
		let matchValue: any, matchBackup: any;
		matchValue = content.match(/= ([A-Za-z0-9])+,/g);
		matchBackup = content.match(/= ([A-Za-z0-9])+,/g);
		if (matchValue && matchBackup) {
			matchValue = this.replaceCommas(matchValue);
			content = this.replaceCitationValues(content, matchValue, matchBackup);
		}
		return content;
	}

	replaceCommas(array) {
		let tempArray = [];
		array.map(element => {
			element = element.replace(',', '@');
			tempArray.push(element);
		});
		return tempArray;
	}

	replaceCitationValues(content, changedValues, oldValues) {
		changedValues.forEach((element, index) => {
			content = content.replace(oldValues[index], element);
		});
		return content;
	}

	setPublishDate(date, month, year) {
		let publicationDate: string;
		if (date) {
			publicationDate = date + '-';
		}
		if (month) {
			publicationDate = publicationDate ? publicationDate + month + '-' : month + '-';
		}
		publicationDate = publicationDate ? publicationDate + year : year;
		return publicationDate;
	}

}
