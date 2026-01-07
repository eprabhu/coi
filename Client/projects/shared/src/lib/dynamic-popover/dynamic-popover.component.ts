import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

class Position {
    clientX: number;
    clientY: number;
    popoverHeight: number;
    popoverWidth: number;
    containerWidth: number;
    containerHeight: number;
}

@Component({
    selector: 'app-dynamic-popover',
    templateUrl: './dynamic-popover.component.html',
    styleUrls: ['./dynamic-popover.component.scss']
})
export class DynamicPopoverComponent implements OnInit, OnDestroy {

    constructor() { }

    @Input() showPopupEvent: Observable<boolean>;
    @Input() positionDetails = new Position();
    subscription: Subscription;

    ngOnInit() {
        this.showPopUpEventHandler();
    }

    ngOnDestroy() {
        if (this.subscription) { this.subscription.unsubscribe(); }
    }

    private showPopUpEventHandler(): void {
        this.subscription = this.showPopupEvent
            .subscribe((data: boolean) => data ? this.showBasicDetailsPopup(this.positionDetails) : this.hideBasicDetailsPopup());
    }

    private showBasicDetailsPopup(event: Position): void {
        document.body.style.overflowY = 'hidden';
        const POPUP: HTMLElement = document.querySelector('#dynamic-popover');
        setTimeout(() => {
            POPUP.style.display = 'block';
            POPUP.style.zIndex = '21234';
            this.positionDetails.popoverHeight = POPUP.offsetHeight || this.positionDetails.popoverHeight;
            this.positionDetails.popoverWidth = POPUP.offsetWidth || this.positionDetails.popoverWidth;
            POPUP.style.left = this.getLeftPosition();
            POPUP.style.top = this.getTopPosition();
        });
    }

    private hideBasicDetailsPopup(): void {
        if (!document.querySelector('[data-bs-overflow]')) {
            document.body.style.overflowY = 'auto';
        }
        const POPUP: HTMLElement = document.querySelector('#dynamic-popover');
        POPUP.style.display = 'none';
    }

    private getLeftPosition(): string {
        const displayWidth = this.positionDetails.containerWidth || screen.width;
        return  displayWidth > this.positionDetails.popoverWidth + this.positionDetails.clientX ?
            this.positionDetails.clientX + 'px' :
            this.positionDetails.clientX - this.positionDetails.popoverWidth + 'px';
    }

    private getTopPosition(): string {
        const displayHeight = this.positionDetails.containerHeight || screen.height;
        return displayHeight > this.positionDetails.popoverHeight + this.positionDetails.clientY ?
            this.positionDetails.clientY + 'px' :
            this.positionDetails.clientY - this.positionDetails.popoverHeight + 'px';
    }

}
