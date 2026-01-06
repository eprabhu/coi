/**
 * Author:- Jobin Sebastian
 * This library provides you with a way to easily and declaratively create drag-and-drop interfaces, with support for free dragging,
 * sorting within a list, transferring items between lists with option to drag using drag handles.
 *
 * Inputs:
 * dragCollection : the list of elements are passed where the drag has to be implemented
 * draggingNode : node which is dragged (basically each recurrent items from list)
 * isDragHandelUsed : boolean value which decides where the dragging to be restricted to a handle
 * isDragOut : for copying the elements in the same array
 * isDropIn : for deleting the elements from the array
 * draggingClass : custom style for dragging event of an item could be added
 * dragOverClass : custom style for dragging over an element could be added
 * dropClass : custom style for drop event could be added
 *
 * Output:
 * dropped: emits data when an item is dropped. Returns and object which has keys
 *      drag: element that was dragged,
 *      dragCollection: list from which the element was dragged,
 *      drop: dropped element,
 *      dropCollection: list from which the element was dropped,
 *      fromIndex: from index of the dragend item which was added,
 *      toIndex: index to where the element was dropped
 * Hover: emits where a div is hovered when dragged
 *
 * Usage:
 * <div *ngFor="let item of dragListNew1" id="id-{{item.name}}" appDragNDrag class="col-3" [draggingNode]="item"
    [dragCollection]="dragList" (dropped)="test($event)">
      <div class="box box-fill">
        {{item.name}}
      </div>
    </div>
 * will add this to github  once its finalized till then please contact the author for more information or any bugs-
 * email: jobin.s@polussoftware.com
 */
import { AfterViewInit, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

@Directive({
    selector: '[appDragNDrag]',
})
export class DragNDragDirective implements AfterViewInit {

    static $cache: any = {};

    @Input() dragCollection: any[] = [];
    @Input() draggingNode: any;
    @Input() isDragHandelUsed = false;
    @Input() isDragOut = true;
    @Input() isDropIn = true;
    @Input() draggingClass = 'dragging';
    @Input() dragOverClass = 'drag-over';
    @Input() dropClass = 'drop';

    @Output() dropped = new EventEmitter<any>();
    @Output() hovered = new EventEmitter<boolean>();

    @HostBinding('draggable') draggable = true;

    mouseDownTarget: any;

    private handleSpan = `<span id="drag-handel" style="position: absolute; right: .3em; top: .3em; opacity: .6; cursor: move; z-index: 3">
        <svg width="24px" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"></path>
        <path d="M0 0h24v24H0z" fill="none"></path></svg></span>`;

    constructor(public el: ElementRef) { }

    ngAfterViewInit() {
        this.isDragHandelUsed ? this.addDragHandel() : this.setCursorStyle();
    }

    private addDragHandel() {
        this.el.nativeElement.insertAdjacentHTML('afterbegin', this.handleSpan);
    }

    private setCursorStyle() {
        this.el.nativeElement.style.cursor = 'move';
    }

    @HostListener('dragstart', ['$event'])
    onDragStart(event: any) {
        event.stopPropagation(); // if drag started on child, don't call drag on parents

        const currentHandel = this.isDragHandelUsed && this.getCurrentDragHandel();
        (!this.isDragHandelUsed || currentHandel) ? this.dragAction(event) : event.preventDefault();

    }

    private getCurrentDragHandel() {
        const dragHandelList = Array.from(document.querySelectorAll('[id=drag-handel]'));
        return dragHandelList.find(ele => ele.contains(this.mouseDownTarget));
    }

    private dragAction(event: any) {
        this.removeDropClass();
        this.setCache(event);

        if (this.draggingClass) {
            this.el.nativeElement.classList.add(this.draggingClass);
        }
    }

    private removeDropClass() {
        const dropClassList = document.querySelectorAll('.' + this.dropClass);
        dropClassList.forEach(element => {
            element.classList.remove(this.dropClass);
        });
    }

    private setCache(event: any) {
        const key = Date.now().toString();
        event.dataTransfer.setData('text', key);

        DragNDragDirective.$cache[key] = {};
        DragNDragDirective.$cache[key].drag = this.draggingNode;
        DragNDragDirective.$cache[key].dragCollection = this.dragCollection;
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: any) {
        this.mouseDownTarget = event.target;
    }

    @HostListener('dragend', ['$event'])
    onDragEnd(event: any) {
        event.preventDefault();
        if (this.draggingClass) {
            this.el.nativeElement.classList.remove(this.draggingClass);
        }
    }

    @HostListener('drop', ['$event'])
    onDrop(event: any) {
        // handle event
        event.preventDefault();
        event.stopPropagation();

        // transfer state
        const key = event.dataTransfer.getData('text');
        const dropEvent: any = this.getDropEvent(key);

        // manipulate binding state (when dragOut or dropIn enabled)
        const { fromIndex, toIndex } = this.getDragNDropIndices(dropEvent);

        this.switchDragNodePosition(fromIndex, dropEvent, toIndex);
        this.clearCache(key);

        // emit
        if (key) {
            this.dropped.emit({
                ...dropEvent,
                fromIndex: fromIndex,
                toIndex: toIndex
            });
            this.hovered.emit(false);
        }

        if (this.dragOverClass && this.dropClass) {
            this.el.nativeElement.classList.remove(this.dragOverClass);
            this.el.nativeElement.classList.add(this.dropClass);
        }
    }

    private switchDragNodePosition(fromIndex: any, dropEvent: any, toIndex: any) {
        if (fromIndex !== -1 && this.isDragOut) {
            dropEvent.dragCollection.splice(fromIndex, 1);
        }

        if (this.isDropIn && dropEvent.dropCollection) {
            if (dropEvent.drop) {
                dropEvent.dropCollection.splice(toIndex, 0, dropEvent.drag);
            } else {
                dropEvent.dropCollection.push(dropEvent.drag);
            }
        }
    }

    private getDragNDropIndices(dropEvent: any) {
        const fromIndex = dropEvent.dragCollection ? dropEvent.dragCollection.indexOf(dropEvent.drag) : -1;
        const toIndex = dropEvent.dropCollection ? dropEvent.dropCollection.indexOf(dropEvent.drop) : -1;
        return { fromIndex, toIndex };
    }

    // clean up
    private clearCache(key: string) {
        delete DragNDragDirective.$cache[key];
    }

    private getDropEvent(key: string) {
        if (!DragNDragDirective.$cache[key]) {
            return {
                drag: null,
                dragCollection: null,
                drop: null,
                dropCollection: null,
            };
        }
        return {
            drag: DragNDragDirective.$cache[key].drag,
            dragCollection: DragNDragDirective.$cache[key].dragCollection,
            drop: this.draggingNode,
            dropCollection: this.dragCollection,
        };
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event: any) {
        event.preventDefault();
        if (this.dragOverClass) {
            this.el.nativeElement.classList.add(this.dragOverClass);
        }
        this.hovered.emit(true);
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: any) {
        event.preventDefault();
        this.hovered.emit(false);
        if (this.dragOverClass) {
            this.el.nativeElement.classList.remove(this.dragOverClass);
        }
    }

}
