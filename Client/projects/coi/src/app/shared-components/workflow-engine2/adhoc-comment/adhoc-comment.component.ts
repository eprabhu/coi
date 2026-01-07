import {Component, Input, OnInit} from '@angular/core';
import { DateFormatPipeWithTimeZone } from '../../../shared/pipes/custom-date.pipe';

interface PopoverOverFlowDetail {
    clientWidth: number;
    clientHeight: number;
    isOverflowX: boolean;
    isOverflowY: boolean;
}

@Component({
    selector: 'app-adhoc-comment',
    templateUrl: './adhoc-comment.component.html',
    styleUrls: ['./adhoc-comment.component.css']
})
export class AdhocCommentComponent implements OnInit {
    @Input() id;
    @Input() commentDetail;
    isOpenPopover = false;
    isHidden = true;
    canOpen = true;
    screenReaderLabel = '';

    constructor(public _dataFormatPipe: DateFormatPipeWithTimeZone) { }

    ngOnInit() {
        this.setScreenReaderLabel();
    }

    private setScreenReaderLabel(): void {
        this.screenReaderLabel = `on ${this._dataFormatPipe.transform(this.commentDetail.createTimeStamp, 'screen-reader-datetime')}. ${this.commentDetail?.createUserFullName?.split(',')?.join(' ')} commented that ${this.commentDetail?.note}`;
    }

    openPopover(mouseEvent: MouseEvent) {
        if (this.canOpen) {
            this.canOpen = false;
            this.isHidden = true;
            this.isOpenPopover = true;
            this.setPopOverPosition(mouseEvent);
        }
    }

    setPopOverPosition(mouseEvent: MouseEvent): void {
        setTimeout(() => {
            const popover = document.getElementById('popover-' + this.id);
            const popoverArrow = document.getElementById('popover-arrow-' + this.id);
            this.isHidden = false;
            if (popover) {
                const popoverStyle = popover.style;
                const { isOverflowY, clientHeight, isOverflowX, clientWidth } = this.isPopoverOverFlow(popover, mouseEvent);
                this.setPopoverOverFlowPosition(popoverStyle, isOverflowY, clientHeight, isOverflowX, clientWidth);
                this.setArrowPosition(popoverArrow, isOverflowX, isOverflowY);
            }
        }, 100);
    }

    private setPopoverOverFlowPosition(popoverStyle: CSSStyleDeclaration, isOverflowY: boolean, clientHeight: number, isOverflowX: boolean, clientWidth: number): void {
        popoverStyle.top = isOverflowY ? `-${clientHeight - 30}px` : '0px';
        popoverStyle.left = isOverflowX ? `-${clientWidth + 10}px` : '30px';
    }

    private isPopoverOverFlow(popover: HTMLElement, mouseEvent: MouseEvent): PopoverOverFlowDetail {
        const clientHeight = popover.clientHeight;
        const clientWidth = popover.clientWidth;
        const isOverflowY = mouseEvent.clientY + clientHeight > document.documentElement.clientHeight;
        const isOverflowX = mouseEvent.clientX + clientWidth > document.documentElement.clientWidth;
        return { isOverflowY, clientHeight, isOverflowX, clientWidth };
    }

    private setArrowPosition(popoverArrow: HTMLElement, isOverflowX: boolean, isOverflowY: boolean): void {
        if (!isOverflowX && !isOverflowY) {
            popoverArrow.style.left = '-9px';
            popoverArrow.style.top = '9px';
            popoverArrow.style.transform = 'rotate(45deg)';
        }
        if (isOverflowX && !isOverflowY) {
            popoverArrow.style.right = '-9px';
            popoverArrow.style.top = '9px';
            popoverArrow.style.transform = 'rotate(-135deg)';
        }
        if (!isOverflowX && isOverflowY) {
            popoverArrow.style.left = '-9px';
            popoverArrow.style.bottom = '11px';
            popoverArrow.style.transform = 'rotate(45deg)';
        }
        if (isOverflowX && isOverflowY) {
            popoverArrow.style.right = '-9px';
            popoverArrow.style.bottom = '11px';
            popoverArrow.style.transform = 'rotate(-135deg)';
        }
    }

    hide(): void {
        this.isOpenPopover = false;
        this.canOpen = true;
    }

}
