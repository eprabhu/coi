import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { deepCloneObject, scrollToElementWithinBoundaries } from '../../common/utilities/custom-utilities';
import { ScrollSpyConfiguration, ScrollSpyEvent } from './scroll-spy.interface';

@Component({
    selector: 'app-scroll-spy',
    templateUrl: './scroll-spy.component.html',
    styleUrls: ['./scroll-spy.component.scss']
})
export class ScrollSpyComponent implements OnInit, OnChanges, OnDestroy {

    @Input() isExpandRightNav = true;
    @Input() elementVisiblePercentageList: number[] = [];
    @Input() scrollSpyConfiguration = new ScrollSpyConfiguration();
    @Output() scrollSpyConfigurationChange = new EventEmitter<ScrollSpyConfiguration>();
    @Output() isExpandRightNavChange = new EventEmitter<boolean>();
    @Output() contentChanged = new EventEmitter<ScrollSpyEvent>();

    isResponsive = false;
    isMouseClicked = false;
    private isListenerActive = false;
    private previousCounter: number | null = null;
    private bindOnClick: (event: MouseEvent) => void;
    private bindOnKeyup: (event: KeyboardEvent) => void;
    private bindOnKeydown: (event: KeyboardEvent) => void;
    private bindOnResize: () => void;

    constructor() { }

    ngOnInit(): void {
        this.bindOnClick = this.onDocumentClick.bind(this);
        this.bindOnKeyup = this.onDocumentKeyup.bind(this);
        this.bindOnKeydown = this.onDocumentKeydown.bind(this);
        this.bindOnResize = this.onDocumentResize.bind(this);
        window.addEventListener('resize', this.bindOnResize);
        this.updateResponsiveClass();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const { currentValue, previousValue } = changes['elementVisiblePercentageList'] || {};
        if (currentValue !== previousValue) {
            this.scrollSpy(currentValue);
        }
    }

    ngOnDestroy(): void {
        this.removeListener();
    }

    private onDocumentClick(event: MouseEvent): void {
        this.removeListenerIfNotInsideContainer(event);
    }

    private onDocumentResize(): void {
        this.updateResponsiveClass()
    }

    private onDocumentKeyup(event: KeyboardEvent): void {
        if (event.key === 'Tab') {
            this.removeListenerIfNotInsideContainer(event);
        }
    }

    private onDocumentKeydown(event: KeyboardEvent): void {
        const { isActiveKeyNavigation, focusedSection, contentItemClass, navItemClass, activeCounter } = this.scrollSpyConfiguration;
        if (!isActiveKeyNavigation) {
            return;
        }
        const ACTIVE_ELEMENT = document.activeElement;
        const INVALID_TAGS = ['INPUT', 'BUTTON', 'TEXTAREA'];
        const FOCUS_ELEMENT_ITEM_CLASS = focusedSection === 'LEFT' ? contentItemClass : navItemClass;
        if (INVALID_TAGS.includes(ACTIVE_ELEMENT.tagName) && !ACTIVE_ELEMENT.classList.contains(FOCUS_ELEMENT_ITEM_CLASS)) {
            return;
        }

        const SCROLL_SPY_ITEMS = this.getAllElements(focusedSection);
        if (SCROLL_SPY_ITEMS.length) {
            this.previousCounter = deepCloneObject(activeCounter);
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this.scrollSpyConfiguration.activeCounter = Math.min(activeCounter + 1, SCROLL_SPY_ITEMS.length - 1);
                    this.focusElementAndScroll(SCROLL_SPY_ITEMS[this.scrollSpyConfiguration.activeCounter]);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.scrollSpyConfiguration.activeCounter = Math.max(activeCounter - 1, 0);
                    this.focusElementAndScroll(SCROLL_SPY_ITEMS[this.scrollSpyConfiguration.activeCounter]);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.updateFocusedSection('RIGHT');
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.updateFocusedSection('LEFT');
                    break;
                case 'Enter':
                    event.preventDefault();
                    SCROLL_SPY_ITEMS[this.scrollSpyConfiguration.activeCounter]?.click();
                    break;
            }
        }
    }

    private scrollSpy(elementVisiblePercentageList: number[]): void {
        const SCROLL_COUNTER = elementVisiblePercentageList.indexOf(Math.max(...elementVisiblePercentageList));
        if (SCROLL_COUNTER >= 0 && this.scrollSpyConfiguration.activeCounter != SCROLL_COUNTER && !this.isMouseClicked) {
            this.previousCounter = deepCloneObject(this.scrollSpyConfiguration.activeCounter);
            this.scrollSpyConfiguration.activeCounter = deepCloneObject(SCROLL_COUNTER);
            this.scrollRight(false);
            this.emitContentChanged(this.getElementByCounter('LEFT'), true);
        }
        setTimeout(() => {
            this.isMouseClicked = false;
        }, 200);
    }

    private updateFocusedSection(section: 'LEFT' | 'RIGHT'): void {
        this.scrollSpyConfiguration.focusedSection = section;
        this.focusElementAndScroll(this.getElementByCounter(section));
    }

    private getElementByCounter(focusedSection: 'LEFT' | 'RIGHT', counter: number = this.scrollSpyConfiguration.activeCounter): HTMLElement | undefined {
        return this.getAllElements(focusedSection)[counter];
    }

    private removeListenerIfNotInsideContainer(event: MouseEvent | KeyboardEvent): void {
        const SCROLL_SPY_CONTAINER = document.getElementById('SCROLL_SPY_CONTAINER');
        if (SCROLL_SPY_CONTAINER && !SCROLL_SPY_CONTAINER.contains(event.target as Node)) {
            this.removeListener();
        } else {
            this.setCurrentCounter(event.target as HTMLElement);
        }
    }

    private findAncestorWithId(element: HTMLElement, id: string): HTMLElement | null {
        while (element && element.id !== id) {
            element = element.parentElement as HTMLElement;
        }
        return element && element.id === id ? element : null;
    }

    private findAncestorWithClass(element: HTMLElement | null, className: string): HTMLElement | null {
        while (element && !element.classList.contains(className)) {
            element = element.parentElement;
        }
        return element?.classList.contains(className) ? element : null;
    }

    private emitContentChanged(activeElement: HTMLElement | undefined, isScrolling = false) {
        this.contentChanged.emit({
            activeElement: activeElement,
            previousCounter: this.previousCounter,
            navItemClass: this.scrollSpyConfiguration.navItemClass,
            activeCounter: this.scrollSpyConfiguration.activeCounter,
            focusedSection: this.scrollSpyConfiguration.focusedSection,
            contentItemClass: this.scrollSpyConfiguration.contentItemClass,
            isActiveKeyNavigation: this.scrollSpyConfiguration.isActiveKeyNavigation,
            isScrolling: isScrolling
        });
        this.scrollSpyConfigurationChange.emit(this.scrollSpyConfiguration);
    }

    private getAllElements(focusedSection: 'LEFT' | 'RIGHT'): HTMLElement[] {
        const { contentItemClass, navItemClass } = this.scrollSpyConfiguration;
        const FOCUS_ELEMENT_ID = focusedSection === 'LEFT' ? 'SCROLL_SPY_LEFT_CONTAINER' : 'SCROLL_SPY_RIGHT_CONTAINER';
        const FOCUS_ELEMENT_ITEM_CLASS = focusedSection === 'LEFT' ? contentItemClass : navItemClass;
        const FOCUSED_CONTAINER = document.getElementById(FOCUS_ELEMENT_ID);
        return FOCUSED_CONTAINER ? Array.from(FOCUSED_CONTAINER.querySelectorAll('.' + FOCUS_ELEMENT_ITEM_CLASS)) : [];
    }

    private setCurrentCounter(FOCUS_ELEMENT: HTMLElement | undefined): void {
        this.scrollSpyConfiguration.focusedSection = this.findAncestorWithId(FOCUS_ELEMENT as HTMLElement, 'SCROLL_SPY_LEFT_CONTAINER') ? 'LEFT' : 'RIGHT';
        const { focusedSection, contentItemClass, navItemClass, activeCounter } = this.scrollSpyConfiguration;
        const FOCUS_ELEMENT_ITEM_CLASS = focusedSection === 'LEFT' ? contentItemClass : navItemClass;
        const SCROLL_SPY_ITEMS = this.getAllElements(focusedSection);
        const SCROLL_SPY_ELEMENT = this.findAncestorWithClass(FOCUS_ELEMENT as HTMLElement, FOCUS_ELEMENT_ITEM_CLASS);
        const ACTIVE_COUNTER = SCROLL_SPY_ELEMENT ? SCROLL_SPY_ITEMS.indexOf(SCROLL_SPY_ELEMENT) : activeCounter
        this.previousCounter = deepCloneObject(activeCounter);
        this.scrollSpyConfiguration.activeCounter = ACTIVE_COUNTER;
        if (SCROLL_SPY_ELEMENT) {
            this.isMouseClicked = true;
            if (focusedSection === 'RIGHT') {
                this.scrollIntoView(SCROLL_SPY_ELEMENT);
            }
        }
    }

    private focusElementAndScroll(activeElement: HTMLElement | undefined): void {
        if (activeElement) {
            activeElement.focus();
            this.scrollIntoView(activeElement);
        }
    }

    private scrollIntoView(activeElement: HTMLElement | undefined): void {
        window.scroll(0, 0);
        this.scrollLeft();
        this.scrollRight();
        this.expandOrCollapseRightNav(false)
        this.emitContentChanged(activeElement);
    }

    private scrollLeft(): void {
        const { leftOffsetTop } = this.scrollSpyConfiguration;
        const SCROLL_SPY_LEFT_ITEM = this.getElementByCounter('LEFT');
        const SCROLL_SPY_LEFT_CONTAINER = document.getElementById('SCROLL_SPY_LEFT_CONTAINER');

        if (SCROLL_SPY_LEFT_CONTAINER && SCROLL_SPY_LEFT_ITEM) {
            SCROLL_SPY_LEFT_CONTAINER.scrollTo({
                top: SCROLL_SPY_LEFT_ITEM.offsetTop - SCROLL_SPY_LEFT_CONTAINER.offsetTop - leftOffsetTop,
                behavior: 'auto'
            });
        }
    }

    private scrollRight(needFocus = false): void {
        const { rightOffsetTop, rightOffsetBottom } = this.scrollSpyConfiguration;
        const SCROLL_SPY_RIGHT_ITEM = this.getElementByCounter('RIGHT');
        const SCROLL_SPY_RIGHT_CONTAINER = document.getElementById('SCROLL_SPY_RIGHT_CONTAINER');
        if (needFocus) {
            SCROLL_SPY_RIGHT_ITEM?.focus();
        }
        scrollToElementWithinBoundaries(SCROLL_SPY_RIGHT_ITEM, rightOffsetTop, rightOffsetBottom, SCROLL_SPY_RIGHT_CONTAINER);
    }

    private updateResponsiveClass(): void {
        this.isResponsive = window.innerWidth <= this.scrollSpyConfiguration.dynamicMaxWidth;
    }

    private removeListener(): void {
        this.isListenerActive = false;
        document.removeEventListener('click', this.bindOnClick);
        document.removeEventListener('keyup', this.bindOnKeyup);
        document.removeEventListener('keydown', this.bindOnKeydown);
        window.removeEventListener('resize', this.bindOnResize);
    }

    addListener(): void {
        if (!this.isListenerActive) {
            this.isListenerActive = true;
            document.addEventListener('click', this.bindOnClick);
            document.addEventListener('keyup', this.bindOnKeyup);
            if (this.scrollSpyConfiguration.isActiveKeyNavigation) {
                document.addEventListener('keydown', this.bindOnKeydown);
            }
        }
    }

    expandOrCollapseRightNav(isExpandRightNav: boolean): void {
        this.isExpandRightNav = ( window.innerWidth > this.scrollSpyConfiguration.dynamicMaxWidth ) ? true : isExpandRightNav;
        this.isExpandRightNavChange.emit(this.isExpandRightNav);
    }
}
