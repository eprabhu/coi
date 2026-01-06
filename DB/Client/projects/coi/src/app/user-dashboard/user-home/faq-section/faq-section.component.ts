import { Component, OnDestroy, OnInit } from '@angular/core';
import { COMMON_ERROR_TOAST_MSG, COI_USER_HELP_ROUTE_URLS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { heightAnimation } from '../../../common/utilities/animations';
import { CommonService } from '../../../common/services/common.service';
import { UserHomeService } from '../services/user-home.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
	selector: 'app-faq-section',
	templateUrl: './faq-section.component.html',
	styleUrls: ['./faq-section.component.scss'],
	animations: [heightAnimation('0', '*', 300, 'heightAnimation')]
})
export class FaqSectionComponent implements OnInit, OnDestroy {

	faqRequestObject: any = {};
	$subscriptions: Subscription[] = [];
	questionsList = [];
	isCollapsedMap: { [key: number]: boolean } = {};

	constructor(private _router: Router,
		private _userHomeService: UserHomeService,
		private _commonService: CommonService
	) { }

	ngOnInit() {
		this.displayFAQ(14, '', true,);
	}

	ngOnDestroy(): void {
		subscriptionHandler(this.$subscriptions);
	}

	navigateToFaq() {
		return this._router.navigate([COI_USER_HELP_ROUTE_URLS.FAQ]);
	}

	displayFAQ(categoryCode, subCategoryCode, isSelected,) {
		this.faqRequestObject.categoryCode = categoryCode;
		this.faqRequestObject.subCategoryCode = subCategoryCode;
		if (isSelected) {
			this.$subscriptions.push(this._userHomeService.getFaq(this.faqRequestObject).subscribe((data: any) => {
				const FAQ_COUNT = Number(this._userHomeService?.landingConfig?.faqConfig?.maxCount) || 0;
				this.questionsList = FAQ_COUNT > -1 ? data.faq.slice(0, FAQ_COUNT) : data.faq;
				this.questionsList.forEach(item => {
					this.isCollapsedMap[item.questionId] = true;
				});
			},(error) => {
				this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
			}));
		}
	}

	toggleAnswer(item: any) {
		const id = item.questionId;
		this.isCollapsedMap[id] = !this.isCollapsedMap[id];
	}
}
