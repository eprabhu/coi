import { Component, OnInit } from '@angular/core';
import { PlaceholderServiceService } from './placeholder-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.css']
})
export class PlaceholderComponent implements OnInit {
  copyPlaceholderMessage = null;
  isInboxInfo = true;
  placeHolderDetails: any;
  placeholderGroup: String = 'F';
  itemIndex
  $subscriptions: Subscription[] = [];
  completerSearchOptions: any = {};
  searchText: '';
  agreementTypes: any;
  agreementTypeCode;
  disableButton: any = [];
  copymessage: any;

  constructor(private _templateService: PlaceholderServiceService,) { }

  ngOnInit() {
    this.loadPlaceholderData();
  }

  loadPlaceholderData() {
    if (this.placeholderGroup === 'F') {
      this.loadAllFormPlaceHolders(null);
    } else if (this.placeholderGroup === 'Q') {
      this.loadAllQuestionnairePlaceHolders();
    } else {
      this.loadAllClausesPlaceHolders();
    }
  }

  setCompleterSearchOptions(contextField, formatString, filterFields, defaultValue, arrayList) {
    this.completerSearchOptions.contextField = contextField;
    this.completerSearchOptions.formatString = formatString;
    this.completerSearchOptions.filterFields = filterFields;
    this.completerSearchOptions.defaultValue = defaultValue;
    this.completerSearchOptions.arrayList = arrayList;
    return JSON.parse(JSON.stringify(this.completerSearchOptions));
  }

  loadAllFormPlaceHolders(event) {
    this.$subscriptions.push(this._templateService.loadAllFormPlaceHolders().subscribe((data: any) => {
      this.placeHolderDetails = data.agreementPlaceHolder;
      if (!this.agreementTypeCode && !event) {
        this.agreementTypeCode = data.agreementTypes[0].agreementTypeCode;
        this.completerSearchOptions = this.setCompleterSearchOptions('description',
          'description', 'description', data.agreementTypes[0].description, data.agreementTypes);
      }
    }));
  }
  loadAllQuestionnairePlaceHolders() {
    if (this.agreementTypeCode) {
      this.$subscriptions.push(this._templateService.loadAllQuestionsPlaceHolders({
        'agreementTypeCode': this.agreementTypeCode
      }).subscribe((data: any) => {
        this.placeHolderDetails = data.agreementPlaceHolder;
      }));
    } else {
      this.placeHolderDetails = []
    }
  }
  loadAllClausesPlaceHolders() {
    if (this.agreementTypeCode) {
      this.$subscriptions.push(this._templateService.loadAllClausesPlaceHolders({
        'agreementTypeCode': this.agreementTypeCode
      }).subscribe((data: any) => {
        this.placeHolderDetails = data.placeHolders;
      }));
    } else {
      this.placeHolderDetails = []
    }
  }

  getSearchedData(data) {
    if (data && this.placeholderGroup !== 'F') {
      this.agreementTypeCode = data.agreementTypeCode;
      this.loadPlaceholderData();
    } else if (!data && this.placeholderGroup === 'F') {
      this.agreementTypeCode = null;
    } else if (data && this.placeholderGroup === 'F') {
      this.agreementTypeCode = data.agreementTypeCode;
    } else {
      this.agreementTypeCode = null;
      this.placeHolderDetails = [];
    }
  }

  copyMessage(index, placeholderName) {
    if (this.itemIndex) {
      this.disableButton[this.itemIndex] = false;
    }
    this.itemIndex = index;
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.value = '$' + placeholderName + '';
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    if (document.execCommand('copy')) {
      this.copymessage = 'Copied';
      const placeholderElement = document.getElementById('copyPlaceholderId' + this.itemIndex);
      const copyInfoElement = document.getElementById('copyInfoId' + this.itemIndex);
      placeholderElement.classList.remove('fa-files-o');
      placeholderElement.classList.add('fa-check');
      copyInfoElement.classList.add('d-block');
      setTimeout(() => {
        placeholderElement.classList.remove('fa-check');
        placeholderElement.classList.add('fa-files-o');
        copyInfoElement.classList.remove('d-block');
      }, 500);
    }
    document.body.removeChild(selBox);
  }

  showOrHideTooltip(index, isShowTooltip) {
    this.copymessage = 'Copy Placeholder';
    const copyInfoElement = document.getElementById('copyInfoId' + index);
    isShowTooltip ? copyInfoElement.classList.add('d-block') : copyInfoElement.classList.remove('d-block');
  }
}
