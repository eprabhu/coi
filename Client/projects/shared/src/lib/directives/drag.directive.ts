import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[appDrag]'
})
export class DragDirective implements OnDestroy, OnInit {

    private element: HTMLElement;
    private subscriptions: Subscription[] = [];
    @Input() resetPosition: Observable<boolean>;

    constructor(
        private elementRef: ElementRef,
        @Inject(DOCUMENT) private document: any
    ) { }

    ngOnInit(): void {
        this.element = this.elementRef.nativeElement as HTMLElement;
        this.initDrag();
        this.resetDocumentPositionEvent();
    }

    initDrag(): void {
        const dragStart$ = fromEvent<MouseEvent>(this.element, 'mousedown');
        const dragEnd$ = fromEvent<MouseEvent>(this.document, 'mouseup');
        const drag$ = fromEvent<MouseEvent>(this.document, 'mousemove').pipe(
            takeUntil(dragEnd$)
        );
        let initialX: number,
            initialY: number,
            currentX = 0,
            currentY = 0;
        let dragSub: Subscription;
        const dragStartSub = dragStart$.subscribe((event: MouseEvent) => {
            initialX = event.clientX - currentX;
            initialY = event.clientY - currentY;
            dragSub = drag$.subscribe((event2: MouseEvent) => {
                event.preventDefault();
                currentX = event2.clientX - initialX;
                currentY = event2.clientY - initialY;
                this.element.style.transform =
                    'translate3d(' + currentX + 'px, ' + currentY + 'px, 0)';
            });
        });
        const dragEndSub = dragEnd$.subscribe(() => {
            initialX = currentX;
            initialY = currentY;
            if (dragSub) {
                dragSub.unsubscribe();
            }
        });
        this.subscriptions.push.apply(this.subscriptions, [
            dragStartSub,
            dragSub,
            dragEndSub,
        ]);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s && s.unsubscribe());
    }

    private resetDocumentPositionEvent(): void {
        if (this.resetPosition) {
            this.subscriptions.push(this.resetPosition.subscribe(event => {
                if (event) {
                    this.element.style.transform = 'translate(0px, 0px)';
                }
            }));
        }
    }
}

