import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {subscriptionHandler} from '../../../common/utilities/subscription-handler';
import {InvoiceService} from '../invoice.service';
import {ActivatedRoute} from '@angular/router';
import {ClaimInvoiceVersions, SapMessage} from '../invoice.interface';
import {CommonService} from '../../../common/services/common.service';

declare var $: any;

@Component({
    selector: 'app-invoice-summary',
    templateUrl: './invoice-summary.component.html',
    styleUrls: ['./invoice-summary.component.css']
})
export class InvoiceSummaryComponent implements OnInit, OnDestroy {

    isInvoiceWidgetOpen = true;
    claimId: number = null;
    invoiceSummaryList: ClaimInvoiceVersions[][] = [];
    isInvoiceDetailsShow: any = {};
    isSequenceDetailsShow: boolean[] = [];
    isMoreDetailsShow: any = {};
    selectedMessageRow: ClaimInvoiceVersions[] = [];
    sapResponses: SapMessage[] = [];
    filterMemoization: Map<number, SapMessage[]> = new Map();
    $subscriptions: Subscription[] = [];

    constructor(private _invoiceService: InvoiceService,
                private _route: ActivatedRoute,
                public _commonService: CommonService) {
    }

    ngOnInit() {
        this.claimId = this._route.snapshot.queryParams['claimId'];
        this.loadClaimInvoiceSummary();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    toggleLineItems(invoiceId: number): void {
        const currentValue = this.isInvoiceDetailsShow[invoiceId];
        this.isInvoiceDetailsShow = {};
        this.isInvoiceDetailsShow[invoiceId] = !currentValue;
    }

    showSAPResponses(sequenceNumber: number, groupedBySequence: ClaimInvoiceVersions[]): void {
        this.$subscriptions.push(this._invoiceService.loadClaimInvoiceSapResponse(this.claimId, sequenceNumber).subscribe((res: any) => {
            if (res) {
                this.filterMemoization.clear();
                this.selectedMessageRow = groupedBySequence;
                this.sapResponses = res.sapMessages;
                $('#SAPResponseModal').modal('show');
            }
        }));
    }

    getInvoiceIdBasedMessages(claimInvoiceLogId: number): SapMessage[] {
        if (this.filterMemoization.has(claimInvoiceLogId)) { return this.filterMemoization.get(claimInvoiceLogId); }
        const filteredInvoiceMessages = this.sapResponses.filter(response => response.claimInvoiceLogId === claimInvoiceLogId);
        this.filterMemoization.set(claimInvoiceLogId, filteredInvoiceMessages);
        return filteredInvoiceMessages;
    }

    private loadClaimInvoiceSummary(): void {
        this.$subscriptions.push(this._invoiceService.loadClaimInvoiceSummary(this.claimId).subscribe((res: any) => {
            if (res && res.claimInvoiceVersions) {
                this.invoiceSummaryList = res.claimInvoiceVersions || [];
            }
        }));
    }


}
