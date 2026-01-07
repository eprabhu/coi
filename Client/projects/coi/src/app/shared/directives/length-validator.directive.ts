import { Directive, Input, HostListener, ElementRef, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';

/**
 * Written by Mahesh Sreenath V M
 * This is dynamic length validator for any angular applications.
 * to use this just add the selector to your input element.
 * if you don't give an element id where I can show the limit decrease,
 * I will create a random one at the end of the parent to the input element.
 * you can  pass your style as input which will be replaced(it only support class names)
 * you can change the limit by giving an input otherwise its set to 2000 by default.
 * for styling please know that the dynamic element created will be of this hierarchy
 * div
 *  span - (current content length)
 *  span - (support text - static value - "character left")
 * /div
 * the style you give will be appended to the div tag so be mindful of that.
 * I create a random ID so that you can use it multiple times in same page without conflicts.
 * happy coding :)
 */
@Directive({
    selector: '[appLengthValidator]',
    providers: [NgModel],
})
export class LengthValidatorDirective implements OnInit, OnChanges, OnDestroy {

    @Input() limit = 2000;
    @Input() elementId: string;
    @Input() isShowLimiter = true;
    @Input() position = 'BELOW';
    @Input() styleList = 'p2 text-end word-count';
    @Input() ngModel;

    customElementId = null;
    hostElement: HTMLInputElement;
    element = this.position === 'BELOW' ? '<div class="CLASS_LIST"><span id = "ELEMENT_ID" >LIMIT</span><span> characters remaining</span></div>'
                                        : '<span class="CLASS_LIST"><span id = "ELEMENT_ID" >LIMIT</span><span> characters remaining</span></span>';
    currentLengthValueElement: HTMLElement;

    constructor(public _hostElement: ElementRef) {
        this.hostElement = _hostElement.nativeElement;
        this.hostElement.maxLength = this.limit;
    }

    ngOnInit() {
        if (!this.elementId) {
            this.addOrRemoveLimiterNode();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.limit) {
            this.hostElement.maxLength = changes.limit.currentValue;
        }
        if (changes.isShowLimiter && changes.isShowLimiter.previousValue !== changes.isShowLimiter.currentValue) {
            this.addOrRemoveLimiterNode();
        }
        if (this.isShowLimiter) {
            setTimeout(() => {
                this.updateLimitValue();
            });
        }
    }

    ngOnDestroy(): void {
        this.removeLimiterHTMLNode();
    }

    private addLimiterHTMLNode() {
        if (!this.elementId) {
            this.assignElementId();
        }
        this.position === 'BELOW' ? (this.hostElement.parentNode as HTMLElement).insertAdjacentHTML('beforeend', this.element) : 
        (this.hostElement.parentNode as HTMLElement).insertAdjacentHTML('afterbegin', this.element);
        this.currentLengthValueElement = document.getElementById(this.elementId);
    }

    private removeLimiterHTMLNode() {
        if (this.elementId) {
            const LIMITER_NODE = document.getElementById(this.elementId);
            if (LIMITER_NODE) { (LIMITER_NODE.parentNode as HTMLElement).remove(); }
        }
    }

    private addOrRemoveLimiterNode() {
        this.isShowLimiter ? this.addLimiterHTMLNode() : this.removeLimiterHTMLNode();
    }

    @HostListener('keyup') arrowDown() {
        if (this.isShowLimiter) {
            this.updateLimitValue();
        }
    }

    updateLimitValue() {
        if (this.currentLengthValueElement) {
            this.currentLengthValueElement.innerHTML = this.limit - (this.hostElement.value ? this.hostElement.value.length : 0) + '';
            (80 / 100) * this.limit < (this.getValueLength()) ?
                this.addDangerClass() : this.removeDangerClass();
        }
    }

    private getValueLength() {
        return this.hostElement.value ? this.hostElement.value.length : 0;
    }

    addDangerClass() {
        const ELEMENT = document.getElementById(this.elementId);
        if (ELEMENT) {
            ELEMENT.classList.add('text-danger');
        }
    }
    removeDangerClass() {
        const ELEMENT = document.getElementById(this.elementId);
        if (ELEMENT) {
            ELEMENT.classList.remove('text-danger');
        }
    }

    getRandomElementID() {
        return Math.random() + '';
    }

    assignElementId() {
        this.elementId = this.getRandomElementID();
        this.element = this.element.replace('ELEMENT_ID', this.elementId);
        this.element = this.element.replace('LIMIT', this.limit - (this.hostElement.value ? this.hostElement.value.length : 0) + '');
        this.element = this.element.replace('CLASS_LIST', this.styleList);
    }

}
