/**  Last updated ('Add Term' modal issue fix) by Arun Raj on 18/03/2020 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SponsorTermsService } from '.././sponsor-terms.service';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../../../services/common-data.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonService } from '../../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
declare var $: any;

@Component({
  selector: 'app-sponsor-terms-edit',
  templateUrl: './sponsor-terms-edit.component.html',
  styleUrls: ['./sponsor-terms-edit.component.css']
})
export class SponsorTermsEditComponent implements OnInit, OnDestroy {

  termObject: any = {
    awardSponsorTerm:
    {
      awardSponsorTermId: null,
      awardId: null,
      awardNumber: null,
      sequenceNumber: null,
      sponsorTermTypeCode: null,
      sponsorTermCodeList: [],
      updateUser: null
    },
    acType: null
  };
  termKeys: any[] = [];
  termDatas: any = [];
  awardData: any;
  reportTermsLookup: any = {};
  sponsorTermList: any = [];
  termCheckAll = false;
  isEdit = false;
  tempTermTypeCode: any;
  tempTermList: any = [];
  isTerms = false;
  isCollapsed = [];
  $subscriptions: Subscription[] = [];
  isSaving = false;
  isTermsValid = true;
  editedKey = null;

  constructor(private _termsService: SponsorTermsService, private _commonData: CommonDataService,
    public _commonService: CommonService) { }

  ngOnInit() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = data.award;
      }
      if (this.awardData) {
        this.$subscriptions.push(this._termsService.reportsTermsLookUpData(this.awardData.awardId)
          .subscribe((result: any) => {
            this.reportTermsLookup = result;
          }));
        this.getTermsData();
        this.isCollapsed[0] = true;
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getTermsData() {
    this.$subscriptions.push(this._termsService.termsData(this.awardData.awardId)
      .subscribe((data: any) => {
        this.termDatas = data.awardTermsList;
        if (this.termDatas) {
          this.termKeys = Object.keys(this.termDatas);
        }
      }));
  }

  /**
  * @param  {} sponsortermtypecode
  * after selecting a term class in 'add term' popup, list out the terms which comes under the selected sponsortermtypecode
  */
  filterSponsorTermList(sponsortermtypecode) {
    this.isTermsValid = !this.isTermsValid ? !this.isTermsValid : this.isTermsValid;
    this.termObject.awardSponsorTerm.sponsorTermCodeList = [];
    this.termCheckAll = false;
    if (this.tempTermTypeCode === sponsortermtypecode) {
      this.sponsorTermList = this.tempTermList;
    } else {
      this.sponsorTermList = this.reportTermsLookup.sponsorTermList.filter(element => element.sponsorTermTypeCode === sponsortermtypecode);
      let sponsorType: any = {};
      if (this.reportTermsLookup.sponsorTermTypeList && sponsortermtypecode) {
        sponsorType = this.reportTermsLookup.sponsorTermTypeList.find(type => type.sponsorTermTypeCode === sponsortermtypecode);
        this.termObject.awardSponsorTerm.sponsorTermType = sponsorType.description;
      }
      const keys = this.termKeys.find((element) => element === sponsorType.description);
      if (this.termDatas[keys]) {
        this.sponsorTermList = this.sponsorTermList.filter(({ sponsorTermCode: sponsorTerm }) =>
          !this.termDatas[keys].some(({ sponsorTermCode: termDataTerm }) => termDataTerm === sponsorTerm));
      }
    }
  }
  clearTermObject() {
    this.termObject.awardSponsorTerm = {};
    this.tempTermTypeCode = '';
    this.termObject.awardSponsorTerm.sponsorTermCodeList = [];
    this.sponsorTermList = [];
    this.termCheckAll = false;
    this.termObject.awardSponsorTerm.sponsorTermTypeCode = '';
    this.isTermsValid = true;
    this.editedKey = null;
    this.isEdit = false;
    if (this.reportTermsLookup.sponsorTermList) {
      this.reportTermsLookup.sponsorTermList.forEach(element => {
        element.isChecked = false;
      });
    }
  }
  /**
   * @param  {} sponsorTermCode
   * @param  {} sponsorDescription
   * @param  {} event
   * if a term is checked the selected terms code and description is push into an array
   * if it is unchecked the selected terms code and description is removes from the array
   * */
  onChangeTerm(sponsorTermCode, sponsorDescription, event, acType, awardSponsorTermId) {
    const INDEX = this.termObject.awardSponsorTerm.sponsorTermCodeList.findIndex(item => item.code === sponsorTermCode);
    if (event.target.checked) {
      if (acType === 'U') {
        this.termObject.awardSponsorTerm.sponsorTermCodeList.splice(INDEX, 1);
        this.termCheckAll = false;
      } else {
        this.termObject.awardSponsorTerm.sponsorTermCodeList.push({
          'code': sponsorTermCode, 'description': sponsorDescription,
          'acType': 'I'
        });
      }
    } else {
      this.termCheckAll = false;
      if (acType === 'U') {
        this.termObject.awardSponsorTerm.sponsorTermCodeList.push({
          'code': sponsorTermCode, 'description': sponsorDescription,
          'acType': 'D', 'awardSponsorTermId': awardSponsorTermId
        });
      } else {
        this.termObject.awardSponsorTerm.sponsorTermCodeList.splice(INDEX, 1);
        this.termCheckAll = false;
      }
    }
  }
  /**
   * to select all terms in a check box click
   */
  checkUncheckAllTerms() {
    this.termObject.awardSponsorTerm.sponsorTermCodeList = [];
    if (this.termCheckAll === true) {
      this.sponsorTermList.forEach(element => {
        element.isChecked = true;
        if (element.acType !== 'U') {
          this.termObject.awardSponsorTerm.sponsorTermCodeList.push({
            'code': element.sponsorTermCode, 'description': element.description,
            'acType': 'I'
          });
        }
      });
    } else {
      this.sponsorTermList.forEach(element => {
        element.isChecked = false;
        if (element.acType === 'U') {
          this.termObject.awardSponsorTerm.sponsorTermCodeList.push({
            'code': element.sponsorTermCode, 'description': element.description,
            'acType': 'D', 'awardSponsorTermId': element.awardSponsorTermId
          });
        }
      });
    }
  }

  validateTerms() {
    const isTermsSelected = this.editedKey ? this.termDatas[this.editedKey].length !== 0 ? true : false
                              : this.termObject.awardSponsorTerm.sponsorTermCodeList.length !== 0? true : false;
    this.isTermsValid = !this.termObject.awardSponsorTerm.sponsorTermTypeCode || (this.termObject.awardSponsorTerm.sponsorTermTypeCode && !isTermsSelected)
                          ? false : true;
    return this.isTermsValid;
  }

  saveTerms() {
    if (!this.isSaving && this.validateTerms()) {     
      $('#add-terms-modal').modal('hide');
      this.isSaving = true;
      this.termObject.awardSponsorTerm.awardNumber = this.awardData.awardNumber;
      this.termObject.awardSponsorTerm.awardId = this.awardData.awardId;
      this.termObject.awardSponsorTerm.sequenceNumber = this.awardData.sequenceNumber;
      this.termObject.awardSponsorTerm.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.isEdit ? this.termObject.acType = 'U' : this.termObject.acType = 'I';
      this.$subscriptions.push(this._termsService.saveTerm(this.termObject)
        .subscribe((data: any) => {
          this.termDatas = data.awardTermsList;
          if (this.termDatas) {
            this.termKeys = Object.keys(this.termDatas);
          }
          this.sponsorTermList.forEach(element => {
            element.acType = '';
          });
          this.resetAfterSave();
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Terms saved successfully.');
        }, err => {
            this.resetAfterSave();
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Terms failed. Please try again.');
        }));
    }
  }
  editTerms(key: any, termCodeList: any) {
    this.clearTermObject();
    this.termObject.awardSponsorTerm.sponsorTermCodeList.splice(0, this.termObject.awardSponsorTerm.sponsorTermCodeList.length);
    let sponsorType: any = {};
    if (this.reportTermsLookup.sponsorTermTypeList) {
      sponsorType = this.reportTermsLookup.sponsorTermTypeList.find(type => type.description === key);
      this.termObject.awardSponsorTerm.sponsorTermTypeCode = sponsorType.sponsorTermTypeCode;
      this.tempTermTypeCode = sponsorType.sponsorTermTypeCode;
      this.sponsorTermList = this.reportTermsLookup.sponsorTermList.filter(element =>
        element.sponsorTermTypeCode === sponsorType.sponsorTermTypeCode);
      this.tempTermList = this.sponsorTermList;
      this.sponsorTermList.forEach(element => {
        termCodeList.forEach(selectedItem => {
          if (element.sponsorTermCode === selectedItem.sponsorTermCode) {
            element.isChecked = true;
            element.acType = 'U';
            element.awardSponsorTermId = selectedItem.awardSponsorTermId;
          }
        });
      });
      termCodeList = {};
      this.isEdit = true;
      this.editedKey = key;
    }
  }
  resetAfterSave() {
    this.isEdit = false;
    this.editedKey = null;
    this.isSaving = false;
  }
}
