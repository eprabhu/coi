import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { openModal } from '../../../../../fibi/src/app/common/utilities/custom-utilities';

@Component({
    selector: 'app-concurrency-warning-modal',
    templateUrl: './concurrency-warning-modal.component.html',
    styleUrls: ['./concurrency-warning-modal.component.scss']
})
export class ConcurrencyWarningModalComponent implements OnInit {

    @Input() sectionName = '';
    @Output() closePage: EventEmitter<any> = new EventEmitter;

    constructor() { }

    ngOnInit() {
        openModal('invalidActionModalCOI', {
            backdrop: 'static',
            keyboard: false,
            focus: !document.querySelector('.offcanvas-backdrop')
          });
    }

    reload() {
        window.location.reload();
    }

    closeCountModal() {
        this.closePage.emit(false);
    }
}
