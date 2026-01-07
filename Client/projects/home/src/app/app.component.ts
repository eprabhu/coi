import {Component} from '@angular/core';
import {CommonService} from "./common/services/common.service";

@Component({
    selector: 'app-root',
    template: `<router-outlet></router-outlet>`,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor() {
    }



}
