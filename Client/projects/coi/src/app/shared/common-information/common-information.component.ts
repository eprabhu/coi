import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';

@Component({
    selector: 'app-common-information',
    templateUrl: './common-information.component.html',
    styleUrls: ['./common-information.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonInformationComponent implements OnInit {

    @Input() elementId: any = '';
    @Input() subSectionId;
    @Input() hardCodedText: string = '';
    infoTextContent: string;

    constructor(private _informationAndHelpText: InformationAndHelpTextService) { }

    ngOnInit() {
        this.getInformation();
    }

    getInformation() {
        this.infoTextContent = this.hardCodedText != '' ? this.hardCodedText : this._informationAndHelpText.getInFormationText(this.subSectionId, this.elementId);
    }

}

