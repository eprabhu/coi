// Last updated by Aravind on 22-02-2021
import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { KeyPerformanceIndicatorAwardService } from './key-performance-indicator-award.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonDataService } from '../../services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-key-performance-indicator-award',
  templateUrl: './key-performance-indicator-award.component.html',
  styleUrls: ['./key-performance-indicator-award.component.css']
})
export class KeyPerformanceIndicatorAwardComponent implements OnInit, OnChanges, OnDestroy {
  disabled: boolean;

  constructor(private _keyPerformanceIndicatorAwardService: KeyPerformanceIndicatorAwardService,
    private _commonService: CommonService, private _commonData: CommonDataService) { }

  @Input() isEditable;
  @Input() result;
  isCollapse = [];
  isShowCollapse = true;
  kpiList: any = [];
  kpiLookupList: any = [];
  kpiSelectedList = [];
  isHighlighted: boolean;
  $subscriptions: Subscription[] = [];

  ngOnInit() {
    this.isCollapse[0] = true;
  }

  ngOnChanges() {
    this.isHighlighted = this._commonData.checkSectionHightlightPermission('122');
    this.fetchKpiAward();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * Call service to fetch linked kpis from proposal and load lookup for add new kpis.
   */
  fetchKpiAward() {
    this.kpiLookupList = this.result.kpiTypes;
    this.kpiList = JSON.parse(JSON.stringify(this.result.awardKpis));
    this.checkKPISelection(this.kpiList, this.kpiLookupList);
  }

  /**
   * restrict negative numbers and characters
   */
  scoreValidation(event: any) {
    const pattern = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  /**
   * function for close modal
   */
  closeKpiModal() {
    document.getElementById('addkpimodal').click();
  }

  /**
   * function to add kpi and criteria under selected kpi.
   */
  addKpiToList(kpis, index) {
    this.disabled = true;
    this.updateKPIModal(index, true);
    this.saveOrUpdateKpiAward([this.prepareKpiObject(kpis)], true, index);
  }

  updateKPIModal(index, value) {
    this.kpiSelectedList[index].kpiSelected = value;
    this.kpiSelectedList[index].criteriaSelected.forEach(element => {
      if (element.isActive) {
        element.criteriaSelected = value;
      }
    });
  }

  /**
   * object prepared for kpi to save.Object cannot be prepared in kpi thats why we prepared object using lookup
   */
  prepareKpiObject(kpis) {
    let criteriaTempList = [];
    kpis.kpiCriteriaType.forEach(element => {
      if (element.isActive) {
        criteriaTempList.push(
          {
            'kpiCriteriaTypeCode': element.kpiCriteriaTypeCode,
            'kpiCriteriaType': {
              'description': element.description,
              'kpiCriteriaTypeCode': element.kpiCriteriaTypeCode,
              'kpiTypeCode': element.kpiTypeCode,
              'updateTimestamp': new Date().getTime(),
              'updateUser': this._commonService.getCurrentUserDetail('userName')
            },
            'target': '',
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'updateTimeStamp': new Date().getTime()
          });
      }
     
    });
    return this.listForAddKpi(kpis, criteriaTempList);
  }

  /**
   * isIndividualSave = true when save is triggered inside the popup
   * isIndividualSave = false when save is triggered from KPI common save
   */
  saveOrUpdateKpiAward(kpiList, isIndividualSave, index, criteriaIndex = null) {
    this.$subscriptions.push(this._keyPerformanceIndicatorAwardService.saveOrUpdateAwardKpi(
      { 'awardKpis': kpiList, 'awardId': this.result.award.awardId })
      .subscribe((data: any) => {
        this.kpiList = data.awardKpis;
        this.result.awardKpis = this.kpiList;
        this.disabled = false;
        this.updateAwardStoreData();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Key Performance Indicator added successfully.');
      }, err => {
        if (isIndividualSave) {
          if (!criteriaIndex) {
            this.updateKPIModal(index, false);
          } else {
            this.kpiSelectedList[index].kpiSelected = false;
            this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = false;
          }
        }
        this.disabled = false;
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Key Performance Indicator failed. Please try again.');
      }));
  }

  /**
   * delete kpi and criteria under selected kpi
   */
  deleteKpiFromList(kpis, index) {
    this.disabled = true;
    this.updateKPIModal(index, false);
    const selectKpi = this.kpiList.find(element => element.kpiTypeCode === kpis.kpiTypeCode);
    const params = {
      awardId: this.result.award.awardId,
      awardKPIId: selectKpi.awardKPIId,
      awardKPICriteriaId: null,
      updateUser: this._commonService.getCurrentUserDetail('userName')
    };
    if (selectKpi.awardKPIId) {
      this.deleteKpi(params, index);
    }
  }

  /**
 * service to delete kpi.There is two condition to delete kpi and criteria.
 * 1) delete kpis and criteria
 * 2) delete each criteria
 */
  deleteKpi(params, index, criteriaIndex = null) {
    this.$subscriptions.push(this._keyPerformanceIndicatorAwardService.deleteAwardKpi(params).subscribe((data: any) => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Key Performance Indicator removed successfully.');
      this.disabled = false;
      const KpiIndex = this.findKpiIndex(params.awardKPIId);
      if (!criteriaIndex) {
        this.kpiList.splice(KpiIndex, 1);
      } else {
        const KpiCriteriaIndex = this.findCriteriaIndex(KpiIndex, params.awardKPICriteriaId);
        this.kpiList[KpiIndex].awardKPICriterias.splice(KpiCriteriaIndex, 1);
      }
      this.result.awardKpis = this.kpiList;
      this.updateAwardStoreData();
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Key Performance Indicator failed. Please try again.');
      this.disabled = false;
      if (!criteriaIndex) {
        this.updateKPIModal(index, true);
      } else {
        this.kpiSelectedList[index].kpiSelected = true;
        this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = true;
      }
    }));
  }

  findKpiIndex(awardKPIId) {
    return this.kpiList.findIndex(element => element.awardKPIId === awardKPIId);
  }

  findCriteriaIndex(KpiIndex, awardKPICriteriaId) {
    return this.kpiList[KpiIndex].awardKPICriterias.findIndex(element => element.awardKPICriteriaId === awardKPICriteriaId);
  }

  updateAwardStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setAwardData(this.result);
  }

  /**
   * add criteria under each kpi. find index is used to check duplication and insert criteria.
   */
  addCriteriaToList(criteriaList, kpis, index, criteriaIndex) {
    this.disabled = true;
    this.kpiSelectedList[index].kpiSelected = true;
    this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = true;
    const criteriaTempList = [];
    const selectedKPI = this.kpiList.find(item => item.kpiTypeCode === kpis.kpiTypeCode)
    if (selectedKPI) {
      this.listForAddCriteria(criteriaTempList, criteriaList);
      selectedKPI.awardKPICriterias = selectedKPI.awardKPICriterias.concat(criteriaTempList);
      this.saveOrUpdateKpiAward([selectedKPI], true, index, criteriaIndex);
    } else {
      this.listForAddCriteria(criteriaTempList, criteriaList);
      this.saveOrUpdateKpiAward([this.listForAddKpi(kpis, criteriaTempList)], true, index, criteriaIndex);
    }
  }

  /**
   * Prepare object of criteria list to push array.
   */
  listForAddCriteria(criteriaTempList, criteriaList) {
    criteriaTempList.push(
      {
        'kpiCriteriaTypeCode': criteriaList.kpiCriteriaTypeCode,
        'kpiCriteriaType': {
          'description': criteriaList.description,
          'kpiCriteriaTypeCode': criteriaList.kpiCriteriaTypeCode,
          'kpiTypeCode': criteriaList.kpiTypeCode,
          'updateTimestamp': new Date().getTime(),
          'updateUser': this._commonService.getCurrentUserDetail('userName')
        },
        'target': '',
        'updateUser': this._commonService.getCurrentUserDetail('userName'),
        'updateTimeStamp': new Date().getTime(),
      });
    return criteriaTempList;
  }

  /**
   * Object is prepared in front end. back end cannot be prepared.
   */
  listForAddKpi(kpis, criteriaTempList) {
    return {
      'kpiTypeCode': kpis.kpiTypeCode,
      'awardKPICriterias': criteriaTempList,
      'kpiType': {
        'kpiTypeCode': kpis.kpiTypeCode,
        'description': kpis.description,
        'isActive': kpis.isActive
      },
      'awardId': this.result.award.awardId,
      'awardNumber': this.result.award.awardNumber,
      'sequenceNumber': this.result.award.sequenceNumber,
      'updateUser': this._commonService.getCurrentUserDetail('userName'),
      'updateTimeStamp': new Date().getTime(),
    };
  }

  /**
   * to delete kpi awardId and awardKpiId is passed.If there is no awardKpiId it is sliced from kpiList.
   */
  deleteKpiCriteriaFromList(criteriaList, kpis, index, criteriaIndex) {
    this.disabled = true;
    let params = {};
    const isAllCriteriaFalse = this.selectKpiCriteriaSelectedToTrue(index, criteriaIndex);
    const currentKpi = this.kpiList.find(x => x.kpiTypeCode === kpis.kpiTypeCode);
    if (isAllCriteriaFalse && this.kpiList) {
      this.kpiSelectedList[index].kpiSelected = false;
      params = this.prepareCriteriaObject(null, currentKpi);
      this.deleteKpi(params, index);
    } else {
      const currentKpiCriteria = currentKpi.awardKPICriterias.find(x => x.kpiCriteriaTypeCode === criteriaList.kpiCriteriaTypeCode);
      params = this.prepareCriteriaObject(currentKpiCriteria, currentKpi);
      this.deleteKpi(params, index, criteriaIndex);
    }
  }

  /**
   * Status of button change to false.For this we traverse in kpiSelectedList and change isAllCriteriaFalse into false.
   */
  selectKpiCriteriaSelectedToTrue(index, criteriaIndex) {
    this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = false;
    let isAllCriteriaFalse = true;
    this.kpiSelectedList[index].criteriaSelected.forEach(element => {
      if (element.criteriaSelected === true) {
        isAllCriteriaFalse = false;
      }
    });
    return isAllCriteriaFalse;
  }

  prepareCriteriaObject(currentKpiCriteria, currentKpi) {
    const params = {
      awardId: parseInt(this.result.award.awardId, 10),
      awardKPIId: parseInt(currentKpi.awardKPIId, 10),
      awardKPICriteriaId: currentKpiCriteria ? currentKpiCriteria.awardKPICriteriaId : null,
      updateUser: this._commonService.getCurrentUserDetail('userName')
    };
    return params;
  }

  /**
   * this function is used to check wheather kpi and criterias are selected in inital load.To determine toggle on of position.
   */
  checkKPISelection(selectedKPIs, lookupKPIs) {
    if (selectedKPIs && lookupKPIs) {
      lookupKPIs.forEach(element => {
        let thisKpiSelected = false;
        let thisKpiId = 0;
        const thisKpi = selectedKPIs.find(x => x.kpiTypeCode === element.kpiTypeCode);
        const criteriaSelected = [];
        if (thisKpi) {
          thisKpiSelected = true;
          thisKpiId = thisKpi.grantCallKpiId;
          element.kpiCriteriaType.forEach(criteria => {
            this.findCriteriaSelected(thisKpi, criteria, criteriaSelected);
          });
        } else {
          thisKpiSelected = false;
          element.kpiCriteriaType.forEach(criteria => {
            const thisCriteriaSelected = this.objectKpiSelected(criteria.isActive);
            criteriaSelected.push(thisCriteriaSelected);
          });
        }
        this.kpiSelectedList.push({ 'kpiSelected': thisKpiSelected, 'thisKpiId': thisKpiId, 'criteriaSelected': criteriaSelected, 'isActive' :element.isActive});
      });
    }
  }

  /**
   * find criteria is selected if there is typecode.
   */
  findCriteriaSelected(thisKpi, criteria, criteriaSelected) {
    const thisKpiCriteria = thisKpi.awardKPICriterias.find(x => x.kpiCriteriaTypeCode === criteria.kpiCriteriaTypeCode);
    this.selectCriteria(criteriaSelected, thisKpiCriteria, criteria);
  }

  /**
   * Is to check whether a criteria is selected or not.
   */
  selectCriteria(criteriaSelected, thisKpiCriteria, criteria) {
    if (!thisKpiCriteria) {
      const thisCriteriaSelected = this.objectKpiSelected(criteria.isActive);
      criteriaSelected.push(thisCriteriaSelected);
    } else {
      const thisCriteriaSelected = {
        'criteriaSelected': true,
        'criteriaId': thisKpiCriteria.grantCallKpiCriteriaId,
        'isActive': criteria.isActive };
      criteriaSelected.push(thisCriteriaSelected);
    }
  }

  objectKpiSelected(isActive: boolean) {
    return { 'criteriaSelected': false, 'criteriaId': 0, 'isActive': isActive };
  }
}
