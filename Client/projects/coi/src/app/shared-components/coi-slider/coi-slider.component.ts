import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { closeCoiSlider } from '../../common/utilities/custom-utilities';
import { hideModal, openModal } from '../../../../../fibi/src/app/common/utilities/custom-utilities';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-coi-slider',
    templateUrl: './coi-slider.component.html',
    styleUrls: ['./coi-slider.component.scss']
})
export class CoiSliderComponent implements OnInit, OnDestroy {

    isEnableSlider = false;
    $subscriptions: Subscription[] = [];

    @Input() isHeaderNeeded = false;
    @Input() isStickyNeeded = true;
    @Input() slider_z_index: any = null;
    @Input() overlay_z_index: any = null;
    @Input() isChangedFieldValue = false;
    @Output() closeSlider: EventEmitter<undefined> = new EventEmitter<undefined>();
    @Input() elementId = 'coiSlider';
    @Input() sliderWidth: 'w-25' | 'w-50' | 'w-75' | 'w-100' | 'w-auto' | string = 'w-100 w-md-90 w-lg-75';
    @ViewChild('SliderParentElement', { static: true }) sliderParentElement: ElementRef;
    @ViewChild('Backdrop', { static: false }) backdrop: ElementRef;

    constructor(private _router: Router) { }

    ngOnInit() {
        setTimeout(() => {
            if (this.slider_z_index && this.overlay_z_index) {
                this.backdrop.nativeElement.style.zIndex = this.overlay_z_index;
                this.sliderParentElement.nativeElement.style.zIndex = this.slider_z_index;
            }
            this.backdrop.nativeElement.classList.add('show');
            this.isEnableSlider = true;
        });
        this.listenRouterChanges();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
        if (this.isEnableSlider) {
            this.closeModalAndSlider();
        }
    }

    private listenRouterChanges(): void {
        this.$subscriptions.push(this._router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd && !this.isChangedFieldValue) {
                this.closeModalAndSlider();
            }
        }));
    }

    private closeModalAndSlider(): void {
        hideModal(`${this.elementId}-confirmation-modal`);
        this.emitCloseSlider();
    }

    closeSliderWindow() {
        !this.isChangedFieldValue ? this.emitCloseSlider() : openModal(`${this.elementId}-confirmation-modal`);
    }

    emitCloseSlider() {
        this.isEnableSlider = false;
        this.closeSlider.emit();
        closeCoiSlider(this.elementId);
        this.backdrop.nativeElement.classList.remove('show');
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc') && this.isEnableSlider) {
            this.closeSliderWindow();
        }
    }

    leaveSlider() {
        this.emitCloseSlider();
    }


}
