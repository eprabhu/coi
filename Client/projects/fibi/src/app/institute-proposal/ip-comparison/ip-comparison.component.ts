import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-ip-comparison',
	template: `<div>
               <div class="left-div" id="ip_compare_review">
                <app-ip-review></app-ip-review>
                </div>
                <div class="right-div" id="ip_toolkit">
                <app-tool-kit></app-tool-kit>
                </div>
             </div>`,
	styleUrls: ['./ip-comparison.component.css']
})
export class IpComparisonComponent implements OnInit {

	constructor() { }

	ngOnInit() {
	}

}
