import { Component, OnInit } from '@angular/core';
import { ComparisonDataStoreService } from '../../comparison-data-store.service';

@Component({
	selector: 'app-comments',
	templateUrl: './comments.component.html',
	styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

	instProposalId: any;
	isShowCollapse = true;

	constructor(private _comparisonStoreData: ComparisonDataStoreService) { }

	ngOnInit() {
		this.getComparisonData();
	}

	getComparisonData() {
		this._comparisonStoreData.$comparisonData.subscribe((data: any) => {
			this.instProposalId = data.baseProposalId;
		});
	}

	showCollapse() {
		this.isShowCollapse = !this.isShowCollapse;
	}

}
