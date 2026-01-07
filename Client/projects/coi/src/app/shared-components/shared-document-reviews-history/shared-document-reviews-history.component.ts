import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { SharedHistoryTimelineComponent } from '../shared-history-timeline/shared-history-timeline.component';

@Component({
    selector: 'app-shared-document-reviews-history',
    templateUrl: './shared-document-reviews-history.component.html',
    styleUrls: ['./shared-document-reviews-history.component.scss'],
    standalone: true,
    animations: [fadeInOutHeight],
    imports: [CommonModule, SharedHistoryTimelineComponent]
})
export class SharedDocumentReviewsHistoryComponent {

    @Input() customClass = '';
    @Input() headerTop = '200px';
    @Input() historyLogs: any = {};
    @Input() timelineId = 'review-history-timeline';

    isEmptyObject = isEmptyObject;
    isReadMore: { [timestamp: string]: boolean } = {};

    toggleReadMore(timestamp: string): void {
        this.isReadMore[timestamp] = !this.isReadMore[timestamp];
    }

    sortNull(): number {
        return 0;
    };

}
