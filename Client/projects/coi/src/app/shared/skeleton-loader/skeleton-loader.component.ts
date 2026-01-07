import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { animate, group, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, ElementRef,
    EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

type LoaderType = 'PROFILE_CARD' | 'SQUARE' | 'RECTANGLE' | 'CIRCLE';
type TableLoaderType = { rows: number, columns: number };

@Component({
    selector: 'app-skeleton-loader',
    templateUrl: './skeleton-loader.component.html',
    styleUrls: ['./skeleton-loader.component.scss'],
    standalone: true,
    imports: [CommonModule, MatIconModule],
    animations: [
        trigger('heightAnimationOnLeave', [
            transition(':leave', [
                style({ height: '*', opacity: 1, 'padding-top': '*', 'padding-bottom': '*', overflow: 'hidden' }),
                group([
                    animate('300ms', style({ height: '0' })),
                    animate('300ms ease-in-out', style({ opacity: 0, 'padding-top': '0', 'padding-bottom': '0' }))
                ])
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonLoaderComponent implements OnChanges {

    @Input() uniqueId = 'custom';
    @Input() loaderColor: string | null = null; // color code for loader
    @Input() retryBtnName = 'Retry';
    @Input() loaderType: LoaderType | TableLoaderType; // if table give rows and columns
    @Input() viewMode: 'LOADER' | 'RETRY' | 'NONE' = 'LOADER';

    @Output() emitRetry: EventEmitter<any> = new EventEmitter();

    columnArray: number[] = [];
    rowArray: number[] = [];

    constructor(private _elementRef: ElementRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        const previousLoaderType = changes.loaderType?.previousValue;
        const currentLoaderType = changes.loaderType?.currentValue;
    
        if (this.isTableLoaderType(previousLoaderType) && this.isTableLoaderType(currentLoaderType)) {
            if (previousLoaderType.rows !== currentLoaderType.rows || previousLoaderType.columns !== currentLoaderType.columns) {
                this.columnArray = this.generateArray(currentLoaderType.columns);
                this.rowArray = this.generateArray(currentLoaderType.rows - 1);
            }
        } else if (this.isTableLoaderType(currentLoaderType)) {
            // Initial setting if previous value was not TableLoaderType but current is
            this.columnArray = this.generateArray(currentLoaderType.columns);
            this.rowArray = this.generateArray(currentLoaderType.rows - 1);
        }

         // Update loader color only if it changed
        if (changes.loaderColor) {
            const PREVIOUS_COLOR = changes.loaderColor.previousValue;
            const CURRENT_COLOR = changes.loaderColor.currentValue;
            if (PREVIOUS_COLOR !== CURRENT_COLOR && CURRENT_COLOR) {
                this.updateSkeletonColor(CURRENT_COLOR);
            }
        }
    }

    /** Updates skeleton background color only for this component instance */
    private updateSkeletonColor(newColor: string): void {
        this._elementRef.nativeElement.style.setProperty('--lib-skeleton-blue-light', newColor);
    }
    
    private isTableLoaderType(loader: any): loader is TableLoaderType {
        return loader && typeof loader === 'object' && 'columns' in loader && 'rows' in loader;
    }

    retry(): void {
        this.viewMode = 'LOADER';
        this.emitRetry.emit(this.viewMode);
    }

    generateArray(length: number): any[] {
        return Array.from({ length });
    }
}
