    import { Component, OnInit, OnDestroy} from '@angular/core';
    import { IndicationOfInterestService } from './indication-of-interest.service';

    @Component({
      selector: 'app-indication-of-interest',
      template: '<router-outlet></router-outlet>',
      styleUrls: ['./indication-of-interest.component.css']
    })
    export class IndicationOfInterestComponent implements OnInit, OnDestroy {

    constructor(private _ioiService: IndicationOfInterestService) { }

    ngOnInit() {
        document.getElementById('ioi-tab').classList.add('active');
    }
    ngOnDestroy() {
        this._ioiService.ioiTabName = 'MY_IOI';
    }
}
