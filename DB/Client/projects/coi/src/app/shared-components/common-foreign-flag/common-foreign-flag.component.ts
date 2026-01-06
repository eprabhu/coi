import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-common-foreign-flag',
    templateUrl: './common-foreign-flag.component.html',
    styleUrls: ['./common-foreign-flag.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonForeignFlagComponent {

    @Input() customClass = '';
    @Input() entityName = '';

    constructor() { }

}
