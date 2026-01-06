import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { Subscription, Subject } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedViewService } from './expanded-view.service';
import { pageScroll } from '../../common/utilities/custom-utilities';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-expanded-view',
    templateUrl: './expanded-view.component.html',
    styleUrls: ['./expanded-view.component.css'],
})
export class ExpandedViewComponent implements OnInit {
    $agreementList = new Subject();
    researchSummaryReqObj: any = {
        personId: this._commonService.getCurrentUserDetail('personID'),
        pageNumber: 20,
        sortBy: 'updateTimeStamp',
        currentPage: 1,
        reverse: '',
    };
    exportDataHeading = '';
    $subscriptions: Subscription[] = [];
    exportDataReqObj: any = {};
    agreementList: any = [];
    totalCount = null;
    isReverse = true;

    constructor(
        private _route: ActivatedRoute,
        private _expandedViewService: ExpandedViewService,
        public _commonService: CommonService,
        private _router: Router
    ) {}

    ngOnInit() {
        this.exportDataHeading = this._route.snapshot.queryParamMap.get('summaryHeading');
        this.researchSummaryReqObj.property2 = this._route.snapshot.queryParamMap.get('categoryCode');
        this.researchSummaryReqObj.tabName = this._route.snapshot.queryParamMap.get('tabName');
        this.getAgreementBasedOnCategory();
        this.$agreementList.next();
    }

    /** returns the list of agreements in the selected category and status */
    getAgreementBasedOnCategory() {
        this.$subscriptions.push(
            this.$agreementList
                .pipe(
                    switchMap(() => this._expandedViewService.getAgreementBasedOnCategory(this.researchSummaryReqObj))
                )
                .subscribe((data: any) => {
                    this.agreementList = data.agreementHeaderList || [];
                    this.totalCount = data.inProgressCount;
                })
        );
    }

    viewAgreementById(agreementId) {
        this._router.navigate(['fibi/agreement/form'], { queryParams: { agreementId: agreementId } });
    }

    myDashboard(event: any) {
        event.preventDefault();
        this._router.navigate(['fibi/dashboard']);
    }

    exportAsTypeDoc(docType) {
        this.exportDataReqObj = this.researchSummaryReqObj;
        this.exportDataReqObj.exportHeading = this.exportDataHeading;
        this.exportDataReqObj.exportType = docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '';
        this.$subscriptions.push(
            this._expandedViewService.exportAgreementBasedOnCategory(this.exportDataReqObj).subscribe((data) => {
                const temp: any = data || {};
                // msSaveOrOpenBlob only available for IE & Edge
                if ((window.navigator as any).msSaveOrOpenBlob) {
                    (window.navigator as any).msSaveBlob(
                        new Blob([data.body], { type: this.exportDataReqObj.exportType }),
                        this.exportDataHeading.toLowerCase() + '.' + this.exportDataReqObj.exportType
                    );
                } else {
                    const exportDataElement = document.createElement('a');
                    exportDataElement.href = URL.createObjectURL(temp.body);
                    exportDataElement.download = this.exportDataHeading + '.' + this.exportDataReqObj.exportType;
                    document.body.appendChild(exportDataElement);
                    exportDataElement.click();
                }
            })
        );
    }

    /**
     * @param event
     * for pagination.
     * sets the selected page and trigger the method that fetches the agreement list
     */
    actionsOnPageChange(event) {
        this.researchSummaryReqObj.currentPage = event;
        this.$agreementList.next();
        pageScroll('pageScrollToTop');
    }

    /**
     * @param sortFieldBy
     * sets the sort order and sort icon.
     * And trigger the method that fetches the agreement list
     */
    sortResult(sortFieldBy) {
        this.isReverse = this.researchSummaryReqObj.sortBy === sortFieldBy ? !this.isReverse : false;
        this.isReverse ? (this.researchSummaryReqObj.reverse = 'DESC') : (this.researchSummaryReqObj.reverse = 'ASC');
        this.researchSummaryReqObj.sortBy = sortFieldBy;
        this.$agreementList.next();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
