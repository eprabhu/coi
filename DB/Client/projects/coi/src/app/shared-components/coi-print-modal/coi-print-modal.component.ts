import { Subscription } from 'rxjs';
import { CoiPrintModalService } from './coi-print-modal.service';
import { CommonService } from '../../common/services/common.service';
import { ModalActionEvent } from '../common-modal/common-modal.interface';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { closeCommonModal, fileDownloader, openCommonModal } from '../../common/utilities/custom-utilities';
import { DownloadLetterTemplateRO, PrintModalClose, PrintModalConfig } from '../../common/services/coi-common.interface';

@Component({
    selector: 'app-coi-print-modal',
    templateUrl: './coi-print-modal.component.html',
    styleUrls: ['./coi-print-modal.component.scss'],
    providers: [CoiPrintModalService]
})
export class CoiPrintModalComponent implements OnInit, OnDestroy {

    @Input() printModalConfig = new PrintModalConfig();
    @Output() modalClosed = new EventEmitter<PrintModalClose>;

    modalName = '';
    isPrinting = false;
    validationMap = new Map();
    isChecked: boolean[] = [];
    printTemplates: any[] = [];
    selectedTemplates: any[] = [];

    private $subscriptions: Subscription[] = [];
    private timeOutRef: ReturnType<typeof setTimeout>;

    constructor(private _commonService: CommonService, private _printModalService: CoiPrintModalService) { }

    ngOnInit(): void {
        this.modalName = this.printModalConfig?.modalConfig?.namings?.modalName;
        this.loadPrintTemplate();
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
    }

    private loadPrintTemplate(): void {
        const { printApiEndpoint, moduleItemCode, moduleSubItemCode } = this.printModalConfig || {};
        this.$subscriptions.push(
            this._printModalService.fetchPrintTemplates(printApiEndpoint?.printTemplateEndpoint, moduleItemCode, moduleSubItemCode)
                .subscribe((printTemplates: any[]) => {
                    if (printTemplates?.length) {
                        this.printTemplates = printTemplates;
                        this.downloadOrOpenDisclosurePrint();
                    } else {
                        this.handleFetchingTemplateFailure('No templates are available.');
                    }
                }, (_err) => {
                    this.handleFetchingTemplateFailure('Error in fetching print templates');
                }));
    }

    private handleFetchingTemplateFailure(errorMessage: string): void {
        this.clearPrintModal('ERROR');
        this._commonService.showToast(HTTP_ERROR_STATUS, errorMessage);
    }

    private downloadOrOpenDisclosurePrint(): void {
        if (this.printTemplates.length === 1) {
            this.selectedTemplates = this.printTemplates;
            this.performPrint();
        } else {
            openCommonModal(this.printModalConfig?.modalConfig?.namings?.modalName);
        }
    }

    private closeAndClearModal(closeModalType: PrintModalClose['closeModalType']): void {
        closeCommonModal(this.printModalConfig?.modalConfig?.namings?.modalName);
        this.timeOutRef = setTimeout(() => {
            this.clearPrintModal(closeModalType);
        }, 200);
    }

    private clearPrintModal(closeModalType: PrintModalClose['closeModalType']): void {
        this.isPrinting = false;
        this.printModalConfig.isOpenPrintModal = false;
        this.modalClosed.emit({ printModalConfig: this.printModalConfig, closeModalType });
    }

    private getPrintValidation(): boolean {
        this.validationMap.clear();
        if (!this.selectedTemplates?.length) {
            this.validationMap.set('selectTemplate', 'Please select at least one template.')
        }
        return this.validationMap.size === 0;
    }

    private getDownloadTemplateRO(): DownloadLetterTemplateRO {
        const { moduleItemCode, moduleItemKey, moduleItemNumber, moduleSubItemCode } = this.printModalConfig || {};
        const LETTER_TEMPLATE_TYPE_CODES = this.selectedTemplates?.map(template => template?.letterTemplateTypeCode);
        return {
            moduleItemCode,
            moduleItemKey,
            moduleItemNumber,
            moduleSubItemCode,
            letterTemplateTypeCodes: LETTER_TEMPLATE_TYPE_CODES
        }
    }

    private performPrint(): void {
        if (!this.isPrinting && this.getPrintValidation()) {
            this.isPrinting = true;
            this.$subscriptions.push(
                this._printModalService.downloadTemplate(this.printModalConfig?.printApiEndpoint?.downloadPrintEndpoint, this.getDownloadTemplateRO())
                    .subscribe((res: any) => {
                        this.closeAndClearModal('PRINT_COMPLETE');
                        this.parsePrintedPage(res, this.selectedTemplates.length === 1 ? this.selectedTemplates[0].printFileType : 'zip');
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Template downloaded successfully.');
                    }, (_err) => {
                        this.isPrinting = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, "Printing failed, please try again.");
                        if (this.printTemplates?.length === 1) {
                            this.clearPrintModal('ERROR');
                        }
                    }));
        }
    }

    parsePrintedPage(data, fileType: string) {
        fileDownloader(data, this.printModalConfig?.fileName, fileType);
    }

    changeSelectedTemplate(isChecked: boolean, template: any): void {
        if (isChecked) {
            this.selectedTemplates.push(template);
        } else {
            const INDEX = this.selectedTemplates.findIndex((selectedTemplate: any) => selectedTemplate?.letterTemplateTypeCode === template?.letterTemplateTypeCode);
            this.selectedTemplates.splice(INDEX, 1);
        }
    }

    printModalActions(modalAction: ModalActionEvent): void {
        if (modalAction?.action === 'PRIMARY_BTN') {
            this.performPrint();
        } else {
            this.closeAndClearModal('MANUAL_CLOSE');
        }
    }

}
