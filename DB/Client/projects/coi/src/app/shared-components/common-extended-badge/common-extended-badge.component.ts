import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
    selector: 'app-common-extended-badge',
    templateUrl: './common-extended-badge.component.html',
    styleUrls: ['./common-extended-badge.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonExtendedBadgeComponent implements AfterViewInit {

    tooltipMsg = 'Extended due to award disclosure approval';

    @ViewChild('commonExtendedBadge', { static: false }) commonExtendedBadge!: ElementRef;

    ngAfterViewInit(): void {
        this.setTooltip();
    }

    private setTooltip(): void {
        new bootstrap.Tooltip(this.commonExtendedBadge.nativeElement);
    }

}
