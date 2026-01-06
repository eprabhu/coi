import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { AgreementCommonDataService } from '../agreement-common-data.service';
import { AgreementService } from '../agreement.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  result: any = {};
  agreementActionLogs: any = [];
  isShowChatIcon = [];

  constructor(private _commonAgreementData: AgreementCommonDataService,
    private _agreementService: AgreementService,public _dataFormatPipe: DateFormatPipeWithTimeZone) { }

  ngOnInit() {
    this._commonAgreementData.isShowSaveButton = false;
    this.getAgreementGeneralData();
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
		this.loadAgreementHistory(data.agreementHeader.agreementRequestId);
    }));
  }

  loadAgreementHistory(agreementId) {
    this.$subscriptions.push(this._agreementService.getAgreementHistory(agreementId).subscribe((data: any) => {
        this.updateHistoryLogs(data);
    }));
  }

  /**
  * @param  {} data : history log array
  * converts the key value pair to array of objects
  */
   updateHistoryLogs(data: any) {
    if (data.agreementHistories) {
      this.agreementActionLogs = [];
      data.agreementHistories.forEach((historyObj) => {
        const date = this._dataFormatPipe.transform(historyObj.updateTimestamp);
        this.agreementActionLogs[date] = this.agreementActionLogs[date] ? this.agreementActionLogs[date] : [];
        this.agreementActionLogs[date].push(historyObj);
      });
    }
  }

  /**
   * @param  {} attachment
   * downloads the attachment in all browsers.
   */
  downloadCommentAttachment(attachment) {
    this.$subscriptions.push(this._agreementService.downloadCommentAttachment
      ({ 'attachmentId': attachment.agreementNoteAttachmentId, 'isLocationComment': false })
      .subscribe((data: any) => {
        (window.navigator as any).msSaveOrOpenBlob ? this.downloadInIeEdgeBrowsers(data, attachment) :
          this.downloadInRestOfTheBrowsers(data, attachment);
      },
        error => console.log('Error downloading the file.', error)
      ));
  }

  /**
   * @param  {any} data
   * @param  {any} attachment
   * downloads the attachment in IE and Edge browsers.
   */
  downloadInIeEdgeBrowsers(data: any, attachment: any) {
    (window.navigator as any).msSaveBlob(new Blob([data], { type: attachment.mimeType }), attachment.fileName);
  }

  /**
   * @param  {any} data
   * @param  {any} attachment
   * Downloads the attachments other than IE and Edge browsers.
   */
  downloadInRestOfTheBrowsers(data: any, attachment: any) {
    const a = document.createElement('a');
    const blob = new Blob([data], { type: data.type });
    a.href = URL.createObjectURL(data);
    a.download = attachment.fileName;
    a.id = 'attachment';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(document.getElementById('attachment'));
  }

 ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  sortNull() { return 0; }

}
