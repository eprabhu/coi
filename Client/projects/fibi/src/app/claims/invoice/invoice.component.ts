import {Component, OnInit} from '@angular/core';
import {CommonDataService} from '../services/common-data.service';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {

    constructor(public _commonData: CommonDataService) {
    }

    ngOnInit() {
    }


}
