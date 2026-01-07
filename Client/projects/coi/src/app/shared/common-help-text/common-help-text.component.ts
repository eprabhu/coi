import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
import * as bootstrap from 'bootstrap';

@Component({
    selector: 'app-common-help-text',
    templateUrl: './common-help-text.component.html',
    styleUrls: ['./common-help-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonHelpTextComponent implements OnInit, OnChanges, AfterViewInit {

    @Input() elementId: any = '';
    @Input() subSectionId: any = '';
    @Input() helpTextHardCoded: string = '';
    @Input() placement: 'left' | 'right' | 'top' | 'bottom' = 'right';

    helpText: string = '';

    @ViewChild('commonHelpText', { static: false }) commonHelpText!: ElementRef;

    constructor(private _informationAndHelpText: InformationAndHelpTextService) { }

    ngOnInit() {
        this.getInformation();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elementId || changes.subSectionId || changes.helpTextHardCoded) {
            this.helpText = '';
            this.getInformation();
            setTimeout(() => {
                this.setTooltip();
            });
        }
    }

    ngAfterViewInit() {
        this.setTooltip();
    }

    private setTooltip(): void {
        if (this.commonHelpText) {
            new bootstrap.Tooltip(this.commonHelpText.nativeElement);
        }
    }

    getInformation() {
        this.helpText = this.helpTextHardCoded != '' ? this.helpTextHardCoded : this._informationAndHelpText.getHelpText(this.subSectionId, this.elementId);
    }

}

