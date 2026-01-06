/**
 * created by Harshith A S
 * last updated on 31-01-2020.
 * Please read this documentation before making any code changes
 * https://docs.google.com/document/d/1vDG_di1AkWOi5AboNArc60zhX3Vzw4lcVTUo66lEnUc/edit
 */

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { KeyPerformanceIndicatorService } from '../key-performance-indicator.service';

@Component({
  selector: 'app-kpi-edit',
  templateUrl: './kpi-edit.component.html',
  styleUrls: ['./kpi-edit.component.css']
})
export class KpiEditComponent implements OnInit , OnDestroy {

  @Input() result: any;
  searchList: any = [];
  grantCallKpiList: any = [];
  grantCallId: any = '';
  isCollapsed = [];
  kpiSelectedList = [];
  $subscriptions: Subscription[] = [];
  disabled: boolean;

  constructor(public _commonService: CommonService,
    public _KeyPerformanceIndicatorService: KeyPerformanceIndicatorService) { }

  ngOnInit() {
    this.grantCallId = this.result.grantCall.grantCallId;
    this.loadKpiBygrantCall();
    this.selectedCard();
  }
  /**
   * If there is card a selected. The array of isCollaped will be place in localstorage. Then
   * card will collpased according to the list in localstorage.
   */

   // why is this  code block required????
  selectedCard() {
    if (localStorage.getItem('collapsed')) {
      this.isCollapsed = JSON.parse(localStorage.getItem('collapsed'));
    } else {
      this.isCollapsed[0] = true;
    }
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * In initial load we get previous added list from grantCallKpis
   * and list of full KPI and Criteria will get from kpiTypes.
   */
  loadKpiBygrantCall() {
    this.$subscriptions.push(this._KeyPerformanceIndicatorService.getKpiByGrantCall({ 'grantCallId': this.grantCallId })
      .subscribe((data: any) => {
        this.grantCallKpiList = JSON.parse(JSON.stringify(data.grantCallKpis));
        this.searchList = Object.assign(JSON.parse(JSON.stringify(data.kpiTypes)));
        this.checkKPISelection(this.grantCallKpiList, this.searchList);
      }));
  }
  /**
   * It is a function to set collapsed list to localstorage.
   */
  setCollapsedList() {
    localStorage.setItem('collapsed', JSON.stringify(this.isCollapsed));
  }
  /**
  * save and update Kpi the grandCallKpiList is pass with service.
  * grantCallKpiList has all the Kpi and Criteria Selected.
  */
  saveOrUpdateGrantCallKpiList(selectedKPI, index, criteriaIndex = null) {
    const params = { 'grantCallKpis': selectedKPI, 'grantCallId': this.grantCallId };
    this.$subscriptions.push(this._KeyPerformanceIndicatorService.saveorupdatekpi(params).subscribe((data: any) => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Key Performance Indicator saved successfully.');
      this.grantCallKpiList = data.grantCallKpis;
      this.loadKpiBygrantCall();
      this.disabled = false;
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Key Performance Indicator failed. Please try again.');
      if(!criteriaIndex){
        this.selectKpi(index, false);
      } else {
        this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = false;
        this.kpiSelectedList[index].kpiSelected = false;
      }
      this.disabled = false;
    }));
  }
  /**
 * @param  {} params
 * To delete a Kpi or Criteria there is two condition
 * 1) To delete kpi grantCallKpiId is passed
 * 2) To criteria kpi grantCallKpiId and grantCallCriteriaId is passed
 */
  deleteKpi(params, index, criteriaIndex = null) {
    this.$subscriptions.push(this._KeyPerformanceIndicatorService.deleteKpis(params).subscribe(data => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Key Performance Indicator removed successfully.');
      this.loadKpiBygrantCall();
      this.disabled = false;
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Key Performance Indicator failed. Please try again.');
      if (!criteriaIndex) {
        this.selectKpi(index, true);
      } else {
        this.kpiSelectedList[index].kpiSelected = true;
        this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = true;
      }
      this.disabled = false;
    }));
  }
  /**
   * @param  {} index
   * @param  {} kpi
   * Add Kpi To the grantCallList. According to kpiSelectedList kpi and criteria is selected.
   */
  addKpiToList(index, kpi) {
    this.disabled = true;
    this.isCollapsed[index] = true;
    this.selectKpi(index, true);
    this.saveOrUpdateGrantCallKpiList([this.prepareKpiObject(kpi)], index);
    this.setCollapsedList();
  }

  setKpiCriteria(kpi): any {
    return {
      'description': kpi.description,
      'kpiCriteriaTypeCode': kpi.kpiCriteriaTypeCode,
      'kpiTypeCode': kpi.kpiTypeCode,
    };
}
prepareKpiObject(kpi) {
  let criteriaTempList: any ;
    criteriaTempList = {
        'kpiTypeCode': kpi.kpiTypeCode,
        'grantCallId': this.grantCallId,
        'description': kpi.description,
        'grantCallKpiCriterias': this.setKpiTypes(kpi.kpiCriteriaType),
      };
  return criteriaTempList;
}

  setKpiTypes(types) {
    const temp = [];
    types.forEach((ele) => {
      if (ele.isActive) {
        temp.push(
          {'description': ele.description,
           'kpiCriteriaTypeCode': ele.kpiCriteriaTypeCode,
           'kpiTypeCode': ele.kpiTypeCode
         });
      }
    });
    return temp;
  }

  /**
   * @param  {} index
   * To select kpi change value in kpiSelectedList to true.
   */
  selectKpi(index, value) {
    this.kpiSelectedList[index].kpiSelected = value;
    this.kpiSelectedList[index].criteriaSelected.forEach(element => {
      if (element.isActive) {
        element.criteriaSelected = value;
      }
    });
  }
  /**
   * @param  {} index
   * @param  {} kpi
   * delete Kpi To the grantCallList. According to kpiSelectedList kpi and criteria is selected.
   */
  deleteKpiFromList(index, kpi) {
    this.disabled = true;
    this.selectKpi(index, false);
    const curKPI = this.grantCallKpiList.find(x => x.kpiTypeCode === kpi.kpiTypeCode);
    if (curKPI) {
      const params = {
        grantCallId: this.grantCallId,
        grantCallKpiId: curKPI.grantCallKpiId,
        grantCallKpiCriteriaId: null
      };
      this.deleteKpi(params, index);
    }
  }

  /**
   * @param  {} index
   * @param  {} criteriaIndex
   * @param  {} kpi
   * @param  {} criteria
   * Add criteria to granCallKpiList.
   */
  addCriteria(index, criteriaIndex, kpi, criteria) {
    this.disabled = true;
    this.selectCriteria(index, criteriaIndex);
    const currentKpi = this.grantCallKpiList.find(x => x.kpiTypeCode === kpi.kpiTypeCode);
    if (currentKpi) {
      if(!currentKpi.grantCallKpiCriterias.find(e => e.kpiCriteriaTypeCode === criteria.kpiCriteriaTypeCode )){
        currentKpi.grantCallKpiCriterias.push(this.setKpiCriteria(criteria));
        this.saveOrUpdateGrantCallKpiList([currentKpi],index, criteriaIndex);
      } else{
        this.disabled = false;
        this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = false;
        this.kpiSelectedList[index].kpiSelected = false;
      }
    } else {
      this.addCriteriaToList(criteria, kpi);
      this.saveOrUpdateGrantCallKpiList(this.grantCallKpiList,index, criteriaIndex);
    }
  }
  /**
   * @param  {} index
   * @param  {} criteriaIndex
   * To select each criteria change criteriaSelectedList to true
   */
  selectCriteria(index, criteriaIndex) {
    this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = true;
    this.kpiSelectedList[index].kpiSelected = true;
  }
  /**
   * @param  {} criteria
   * @param  {} kpi
   * To select a criteria object is prepared and push to grantCallKpiList.
   */
  addCriteriaToList(criteria, kpi) {
    const kpiCriteria = [];
    kpiCriteria.push(this.setKpiCriteria(criteria));
    this.grantCallKpiList.push(
      {
        'kpiTypeCode': kpi.kpiTypeCode,
        'grantCallId': this.grantCallId,
        'description': kpi.description,
        'grantCallKpiCriterias': kpiCriteria,
        'updateUser': kpi.updateUser,
        'updateTimestamp': new Date().getTime()
      });
  }
  /**
   * @param  {} index
   * @param  {} criteriaIndex
   * @param  {} criteria
   * @param  {} kpi
   * To delete criteria we select this function for this we give kpiId and criteriaId to backend.
   * Also splice the criteria from grantCallKpiList.
   */
  deleteCriteria(index, criteriaIndex, criteria, kpi) {
    this.disabled = true;
    const isAllCriteriaFalse = this.deSelectCriteria(index, criteriaIndex);
    if (isAllCriteriaFalse) {
      this.singleCriteriaDeletion(index, kpi);
    } else {
      this.deleteCriteriaFromList(index, kpi, criteria, criteriaIndex);
    }
  }
  /**
   * @param  {} index
   * @param  {} criteriaIndex
   * deSelectCriteria to deselect criteria is selected to false.
   */
  deSelectCriteria(index, criteriaIndex) {
    this.kpiSelectedList[index].criteriaSelected[criteriaIndex].criteriaSelected = false;
    let isAllCriteriaFalse = true;
    this.kpiSelectedList[index].criteriaSelected.forEach(element => {
      if (element.criteriaSelected === true) {
        isAllCriteriaFalse = false;
      }
    });
    return isAllCriteriaFalse;
  }
  /**
   * @param  {} index
   * @param  {} kpi
   * delete single criteria under a kpi for this change kpiSelected to false.
   */
  singleCriteriaDeletion(index, kpi) {
    this.kpiSelectedList[index].kpiSelected = false;
    const curKPI = this.grantCallKpiList.find(x => x.kpiTypeCode === kpi.kpiTypeCode);
    if (curKPI) {
      const params = { grantCallId: this.grantCallId, grantCallKpiId: curKPI.grantCallKpiId, grantCallKpiCriteriaId: null };
      this.deleteKpi(params, index);
    }
  }
  /**
   * @param  {} index
   * @param  {} kpi
   * @param  {} criteria
   * delete a criteria under a kpi. Also change kpiSelected to true.
   */
  deleteCriteriaFromList(index, kpi, criteria, criteriaIndex) {
    this.kpiSelectedList[index].kpiSelected = true;
    const curKPI = this.grantCallKpiList.find(x => x.kpiTypeCode === kpi.kpiTypeCode);
    if (curKPI) {
      const curKPICriteria = curKPI.grantCallKpiCriterias.find(x => x.kpiCriteriaTypeCode === criteria.kpiCriteriaTypeCode);
      if (curKPICriteria) {
        const params = {
          grantCallId: parseInt(this.grantCallId, 10),
          grantCallKpiId: parseInt(curKPI.grantCallKpiId, 10),
          grantCallKpiCriteriaId: curKPICriteria.grantCallKpiCriteriaId
        };
        this.deleteKpi(params, index, criteriaIndex);
        
      }
    }
  }
  /**
   * @param  {} selectedKPIs
   * @param  {} lookupKPIs
   * check Kpis are selected in intial load for this we traverse through lookupKPIs and check if there is id in grandCallKpiList
   * then kpi and criteria is selected for this use the kpiSelectedList.
   */
  checkKPISelection(selectedKPIs, lookupKPIs) {
    lookupKPIs.forEach(element => {
      let thisKpiSelected = false;
      let thisKpiId = 0;
      const thisKpi = selectedKPIs.find(x => x.kpiTypeCode === element.kpiTypeCode);
      const criteriaSelected = [];
      if (thisKpi) {
        thisKpiSelected = true;
        thisKpiId = thisKpi.grantCallKpiId;
        element.kpiCriteriaType.forEach(criteria => {
          this.checkAllCriteriaSelected(thisKpi, criteria, criteriaSelected);
        });
      } else {
        this.checkCriteriaSelected(thisKpiSelected, element, criteriaSelected);
      }
      const thiKpiSelected = {
        'kpiSelected': thisKpiSelected,
        'thisKpiId': thisKpiId,
        'criteriaSelected': criteriaSelected
      };
      this.kpiSelectedList.push(thiKpiSelected);
    });
  }
  /**
   * @param  {} thisKpi
   * @param  {} criteria
   * @param  {} criteriaSelected
   * To check wheather criterias are selected for this it will traverse through lookupList and change criteriaSelected to true.
   */
  checkAllCriteriaSelected(thisKpi, criteria, criteriaSelected) {
    const thisKpiCriteria = thisKpi.grantCallKpiCriterias.find(x => x.kpiCriteriaTypeCode === criteria.kpiCriteriaTypeCode);
    if (!thisKpiCriteria) {
      const thisCriteriaSelected = {
        'criteriaSelected': false, 'criteriaId': 0, 'isActive': criteria.isActive
      };
      criteriaSelected.push(thisCriteriaSelected);
    } else {
      const thisCriteriaSelected = {
        'criteriaSelected': true,
        'criteriaId': thisKpiCriteria.grantCallKpiCriteriaId,
        'isActive': criteria.isActive
      };
      criteriaSelected.push(thisCriteriaSelected);
    }
  }
  /**
   * @param  {} thisKpiSelected
   * @param  {} element
   * @param  {} criteriaSelected
   * If there is criteria selected then push criteriaSelected to false.
   */
  checkCriteriaSelected(thisKpiSelected, element, criteriaSelected) {
    thisKpiSelected = false;
    element.kpiCriteriaType.forEach(criteria => {
      const thiCriteriaSelected = {
        'criteriaSelected': false,
        'criteriaId': 0,
        'isActive': criteria.isActive
      };
      criteriaSelected.push(thiCriteriaSelected);
    });
  }
}
