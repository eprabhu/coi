import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';
@Component({
  selector: 'app-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.css']
})
export class FileDropComponent implements OnInit {

  @Input() multiple;
  @Input() fileAccept = this._commonService.generalFileType;
  @Output() filesDropEvent: EventEmitter<any> = new EventEmitter();
  @ViewChild('dragdropfile', { static: true })

  public fileSelector: ElementRef;
  constructor(public _commonService: CommonService) {
  }

  ngOnInit() {
    if (this.multiple) {
      (this.fileSelector.nativeElement as HTMLInputElement).multiple = true;
    }
  }

  onFileDrop(files) {
    const fileList = this.checkFileExtensionSize(files);
    this.filesDropEvent.emit(fileList);
    (this.fileSelector.nativeElement as HTMLInputElement).value = '';
  }

  triggerClickEvent() {
    (this.fileSelector.nativeElement as HTMLInputElement).click();
  }

  /**
   * checkFileExtensionSize - to check extension and size of given file and separate the files which satisfy it
   * variable filesExtension : stores value of extension which is extracted from input file using spilt
   * returns array fileList and numerical value rejectedFiles
   * fileList array : contains the list of file which satisfy the conditions
   * rejectedFiles: contains count of files which reject the condition
   * file extension of input file and fieldsize checking is compared with the mentioned file
   * when a file disobey the condition count is incremented
   * else the file is pushed into an array fileList for further process
   */

  checkFileExtensionSize(files) {
    let rejectedFiles = 0;
    let inValidErrorMsg = null;
    const fileList = [];
    for (const file of files) {
      const fileExtension = file.name.split('.').pop();
      inValidErrorMsg = this.validateAttachment(file, fileExtension, inValidErrorMsg);
      (this.isFileSizeWithinRange(file, 1, 52428800) && this.isAllowedFileType(fileExtension)) ? fileList.push(file) : rejectedFiles++;
    }
    this.showAttachmentsErrorMsg(inValidErrorMsg);
    return fileList;
  }

  private showAttachmentsErrorMsg(inValidErrorMsg: string) {
    const errorMessage = this.setErrorMsg(inValidErrorMsg);
    if (errorMessage) {
      this._commonService.showToast(HTTP_ERROR_STATUS, errorMessage, 2500);
    }
  }

    isAllowedFileType(fileExtension: string = ''): boolean {
        if (!fileExtension) { return false; }
        return ((this.fileAccept).replace(/\s/g, '').split(',').includes(fileExtension.toLowerCase()));
    }

    /**
     * minimumFileSize : represented by Byte.
     * maximumFileSize : represented by Byte.
     */
    isFileSizeWithinRange({ size }: File, minimumFileSize: number, maximumFileSize: number): boolean {
        return size >= minimumFileSize && size <= maximumFileSize;
    }

  validateAttachment(file, fileExtension, fileTypeErrors) {
    if (fileTypeErrors === 'BOTH') {
      return 'BOTH';
    }
    let error = null;
    if (!this.isAllowedFileType(fileExtension)) {
      error = 'TYPE_ERROR';
    }
    if (!this.isFileSizeWithinRange(file, 1, 52428800)) {
      error = error === 'TYPE_ERROR' ? 'BOTH' : 'SIZE_ERROR';
    }
    return error ? fileTypeErrors && fileTypeErrors.includes(error) ? fileTypeErrors : error : fileTypeErrors;
  }

  setErrorMsg(inValidErrorMsg: string) {
    switch (inValidErrorMsg) {
      case 'BOTH': return 'File format is not supported. File size cannot exceed 50MB.';
      case 'SIZE_ERROR': return 'File size cannot exceed 50MB.';
      case 'TYPE_ERROR': return 'File format is not supported. RISE supports '+this.fileAccept+'.';
      default: break;
    }
  }

}
