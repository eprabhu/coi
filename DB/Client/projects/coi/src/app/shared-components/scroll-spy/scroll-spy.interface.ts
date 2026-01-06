export class ScrollSpyConfiguration {
    activeCounter = 0;
    dynamicMaxWidth = 1399;
    navItemClass = '';
    contentItemClass = '';
    isActiveKeyNavigation = false;
    focusedSection: 'LEFT' | 'RIGHT' = 'LEFT';
    offsetHeight = 0;
    leftOffsetTop = 0;
    rightOffsetTop = 0;
    leftOffsetBottom = 0;
    rightOffsetBottom = 0;
    scrollLeftHeight = 'auto';
    scrollRightHeight = 'auto';
    scrollLeftCustomClass = 'col overflow-y-auto scrollbar-sm rounded-3 shadow-sm ps-0 pe-1 scroll-snap-y-mandatory';
    scrollRightCustomClass = 'col-xxxl-3 col-xxl-4 col-xl-4 col-lg-5 col-5 overflow-y-auto scrollbar-sm rounded-3 ps-2 pe-0 pe-xxl-1 scroll-snap-y-mandatory coi-bg-body d-xxl-block';
    elementVisiblePercentageList: any[] = [];
}

export interface ScrollSpyEvent {
    isScrolling: boolean;
    navItemClass: string;
    activeCounter: number;
    previousCounter: number | null;
    contentItemClass: string;
    isActiveKeyNavigation: boolean;
    activeElement: HTMLElement | null;
    focusedSection: 'LEFT' | 'RIGHT';
}
