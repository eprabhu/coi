import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

export class TooltipPosition {
  clientX: number;
  clientY: number;
  popoverHeight: number;
  popoverWidth: number;
  containerWidth: number;
  containerHeight: number;
  index: null;
  type: string;
  source: string;
  target: string;
}

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {

  @Input() openTooltipEvent: Observable<boolean>;
  @Input() tooltipPositionDetails = new TooltipPosition();
  subscription: Subscription;
  
  constructor() { }

  ngOnInit() {
    this.showToolTip();
  }
  
  private showToolTip(): void {
    this.subscription = this.openTooltipEvent
        .subscribe((data: boolean) => data ? this.showBasicDetailsPopup(this.tooltipPositionDetails) : this.hideBasicDetailsPopup());
  }

  private showBasicDetailsPopup(event: TooltipPosition): void {
    document.body.style.overflowY = 'hidden';
    const POPUP: HTMLElement = document.querySelector('#dynamic-tooltip');
    setTimeout(() => {
        POPUP.style.display = 'block';
        POPUP.style.zIndex = '21234';
        this.tooltipPositionDetails.popoverHeight = POPUP.offsetHeight || this.tooltipPositionDetails.popoverHeight;
        this.tooltipPositionDetails.popoverWidth = POPUP.offsetWidth || this.tooltipPositionDetails.popoverWidth;
        POPUP.style.left = this.getLeftPosition();
        POPUP.style.top = this.getTopPosition();
    });
}

private hideBasicDetailsPopup(): void {
  if (!document.querySelector('[data-bs-overflow]')) {
    document.body.style.overflowY = 'auto';
  }
    const POPUP: HTMLElement = document.querySelector('#dynamic-tooltip');
    POPUP.style.display = 'none';
}

private getLeftPosition(): string {
  // return this.tooltipPositionDetails.clientX  + 'px';
    let displayWidth = this.tooltipPositionDetails.containerWidth || screen.width;
    return  displayWidth > this.tooltipPositionDetails.popoverWidth + this.tooltipPositionDetails.clientX ?
        this.tooltipPositionDetails.clientX + 'px' :
        this.tooltipPositionDetails.clientX - this.tooltipPositionDetails.popoverWidth + 'px';
}

private getTopPosition(): string {
  // return this.tooltipPositionDetails.clientY  + 'px';
    let displayHeight = this.tooltipPositionDetails.containerHeight || screen.height;
    return displayHeight > this.tooltipPositionDetails.popoverHeight + this.tooltipPositionDetails.clientY  ?
        (this.tooltipPositionDetails.clientY - 35) + 'px' :
        (this.tooltipPositionDetails.clientY - 35) - this.tooltipPositionDetails.popoverHeight + 'px';
}
}
