import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { sanitizeHtml } from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-common-shared-info-text',
    templateUrl: './common-shared-info-text.component.html',
    styleUrls: ['./common-shared-info-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonSharedInfoTextComponent implements OnInit {

    @Input() elementId: any = '';
    @Input() subSectionId;
    // This input is used to receive custom styles for the info text, if the user needs to apply specific styling.
    @Input() customClass = '';

    expandInfo = false;
    infoTextContent: string;
    isExpanded: boolean = false;
    textAfterSafeConversion: SafeHtml;
    visibleTextLength: number = 0;

    constructor(private _informationAndHelpText: InformationAndHelpTextService, private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.getInformation();
    }

    private getInformation(): void {
        const RAW_CONTENT = this._informationAndHelpText.getInFormationText(this.subSectionId, this.elementId);
        if (RAW_CONTENT?.trim()) {
            this.infoTextContent = sanitizeHtml(RAW_CONTENT);
            this.updateDisplayedContent();
        }
    }

    private updateDisplayedContent(): void {
        const PLAIN_TEXT = this.getPlainText(this.infoTextContent);
        this.visibleTextLength = PLAIN_TEXT.length;
        const TEXT_TO_SHOW = this.expandInfo || PLAIN_TEXT.length <= 200
            ? this.infoTextContent
            : this.truncateHtmlContent(this.infoTextContent, 200);
        this.textAfterSafeConversion = this.sanitizer.bypassSecurityTrustHtml(TEXT_TO_SHOW);
    }

    private getPlainText(html: string): string {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    toggleInfoText(): void {
        this.expandInfo = !this.expandInfo;
        this.updateDisplayedContent();
    }

    private truncateHtmlContent(html: string, limit: number): string {
        const PARSER = new DOMParser();
        const DOC = PARSER.parseFromString(html, 'text/html');
        const DIV = DOC.body;
        const RESULT = document.createElement('div');
        let charCount = 0;
        for (let i = 0; i < DIV.childNodes.length && charCount < limit; i++) {
            this.traverseAndAppend(DIV.childNodes[i], RESULT, limit, (count) => charCount = count, () => charCount);
        }
        return RESULT.innerHTML + (charCount >= limit ? '...' : '');
    }

    private traverseAndAppend(node: Node, parent: Node, limit: number, setCharCount: (count: number) => void, getCharCount: () => number): void {
        if (getCharCount() >= limit) return;
        switch(node.nodeType) {
            case Node.TEXT_NODE:
                this.appendTruncatedText(node, parent, limit, setCharCount, getCharCount);
                break;
            case Node.ELEMENT_NODE:
                const ELEMENT = node as HTMLElement;
                const CLONE = ELEMENT.cloneNode(false) as HTMLElement;
                parent.appendChild(CLONE);
                for (let i = 0; i < node.childNodes.length && getCharCount() < limit; i++) {
                    this.traverseAndAppend(node.childNodes[i], CLONE, limit, setCharCount, getCharCount);
                }
                break;
            default:
                break;
        }
    }

    private appendTruncatedText(node: Node, parent: Node, limit: number, setCharCount: (count: number) => void, getCharCount: () => number): void {
        const TEXT = node.textContent || '';
        const REMAINING = limit - getCharCount();
        const TRUNCATED_TEXT = TEXT.substring(0, REMAINING);
        parent.appendChild(document.createTextNode(TRUNCATED_TEXT));
        setCharCount(getCharCount() + TRUNCATED_TEXT.length);
    }

}
