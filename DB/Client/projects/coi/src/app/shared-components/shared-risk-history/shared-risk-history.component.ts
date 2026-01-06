import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-shared-risk-history',
    templateUrl: './shared-risk-history.component.html',
    styleUrls: ['./shared-risk-history.component.scss']
})
export class SharedRiskHistoryComponent {

    @Input() riskHistory: any;
    isReadMore: boolean[] = [];
    
    constructor() { }

}
