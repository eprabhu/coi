import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostListener, Inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { map, pairwise, takeUntil } from 'rxjs/operators';

declare var $: any;

@Directive({
    selector: '[appModalDrag]'
})
export class ModalDragDirective implements OnInit, OnDestroy {

    private startX!: number;
    private startY!: number;
    private initialPosition = { left: 0, top: 0 };
    private initialWidth!: number;
    private initialHeight!: number;
    private subscriptions: Subscription[] = [];
    @Input() resetPosition!: Observable<boolean>;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document: any
    ) { }

    ngOnInit(): void {
        const mousedown$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mousedown');
        const mousemove$ = fromEvent<MouseEvent>(this.document, 'mousemove');
        const mouseup$ = fromEvent<MouseEvent>(this.document, 'mouseup');
        const drag$ = mousedown$.subscribe(event => {
            const target = event.target as HTMLElement;
            const modalClass = ['modal-header', 'modal-title'];
            if (modalClass.some(cls => target.classList.contains(cls))) {
                this.startX = event.clientX;
                this.startY = event.clientY;
                const RECT = this.elementRef.nativeElement.getBoundingClientRect();
                this.initialPosition.left = RECT.left;
                this.initialPosition.top = RECT.top;
                this.initialWidth = RECT.width;
                this.initialHeight = RECT.height;
                this.renderer.setStyle(this.elementRef.nativeElement, 'width', `${this.initialWidth}px`);
                this.renderer.setStyle(this.elementRef.nativeElement, 'height', `${this.initialHeight}px`);
                const dragMove$ = mousemove$.pipe(
                    map(move => ({ move, event })),
                    pairwise(),
                    takeUntil(mouseup$)
                ).subscribe(([ curr]) => {
                    const NEW_X = curr.move.clientX - this.startX + this.initialPosition.left;
                    const NEW_Y = curr.move.clientY - this.startY + this.initialPosition.top;
                    const ELEMENT = this.elementRef.nativeElement;
                    const PARENT = ELEMENT.parentElement;
                    const PARENT_RECT = PARENT.getBoundingClientRect();
                    const MAX_X = PARENT_RECT.width - ELEMENT.offsetWidth - 10;
                    const MAX_Y = PARENT_RECT.height - ELEMENT.offsetHeight - 10;
                    const BOUNDED_X = Math.max(0, Math.min(NEW_X, MAX_X));                   
                    const BOUNDED_Y = Math.max(0, Math.min(NEW_Y, MAX_Y));
                    this.renderer.setStyle(ELEMENT, 'position', 'absolute');
                    this.renderer.setStyle(ELEMENT, 'left', `${BOUNDED_X}px`);
                    this.renderer.setStyle(ELEMENT, 'top', `${BOUNDED_Y}px`)                              
                });
                const dragEnd$ = mouseup$.subscribe(() => {
                    const MODAL_ID = this.elementRef.nativeElement.parentElement.id
                    this.modalCloseById(MODAL_ID);
                    dragMove$.unsubscribe();
                });
                this.subscriptions.push(dragEnd$);              
            }
        });
        this.subscriptions.push(drag$);       
    }
    
    /* Selects the modal element with the given ID using jQuery*/
    modalCloseById(id: string) {
        $('#' + id).on('hidden.bs.modal', () => {
            this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'static');
        });
    }
    
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
