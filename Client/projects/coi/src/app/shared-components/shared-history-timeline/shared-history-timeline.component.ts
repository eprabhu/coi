import { Component, Input } from '@angular/core';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../shared-component.module';

@Component({
    selector: 'app-shared-history-timeline',
    templateUrl: './shared-history-timeline.component.html',
    styleUrls: ['./shared-history-timeline.component.scss'],
    standalone : true,
    imports: [CommonModule, SharedModule, SharedComponentModule],
    animations: [fadeInOutHeight]
})
export class SharedHistoryTimelineComponent {

    @Input() customClass = 'border-0';
    @Input() historyLogs: any = {};
    @Input() timelineId: string = 'history-timeline';

    isEmptyObject = isEmptyObject;
    isReadMore: { [timestamp: string]: boolean } = {};

    toggleReadMore(timestamp: string): void {
        this.isReadMore[timestamp] = !this.isReadMore[timestamp];
    }

    sortNull(): number {
        return 0;
    };

}
