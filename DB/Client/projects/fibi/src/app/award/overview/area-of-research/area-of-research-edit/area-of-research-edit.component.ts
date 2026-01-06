import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { OverviewService } from '../../overview.service';
import { AwardService } from '../../../services/award.service';
import { CommonDataService } from '../../../services/common-data.service';
import { CommonService } from '../../../../common/services/common.service';
import { areaOfResearchAward } from '../../../award-interfaces';

declare var $: any;
@Component({
  selector: 'app-area-of-research-edit',
  templateUrl: './area-of-research-edit.component.html',
  styleUrls: ['./area-of-research-edit.component.css']
})
export class AreaOfResearchEditComponent implements OnChanges {
  @Input() result: any = {};
  @Input() lookupData: any = {};
  @Input() helpText: any = {};

  awardObject: any = {};

  isError = false;
  clearAreaField: String;
  clearSubAreaField: String;

  researchWarningMsg = null;
  selectedArea: any = null;
  selectedSubArea: any = null;

  areaHttpOptions: any = {};
  subAreaHttpOptions: any = {};
  areaToRemove: any = {};
  $subscriptions: Subscription[] = [];
  isShowCollapse = true;
  isMoreInfoWidgetOpen = true;
  isHighlighted = false;
  isSaving = false;

  areaOfResearchAwardEditObject: areaOfResearchAward;
  editIndex: number;
  isEditAreaOfResearch = false;

  constructor(private _overviewService: OverviewService, private _awardService: AwardService,
    private _commonService: CommonService, public _commonData: CommonDataService) { }

ngOnChanges(): void {
    if (this.lookupData.researchTypes && this.lookupData.researchTypes.length > 0) {
      this.researchTypeSet();
      this.setAreaOptions();
      this.setSubAreaOptions('');
    }
    this.isHighlighted = this._commonData.checkSectionHightlightPermission('125');
  }

  /** Check whether any research type is active or not */
  researchTypeSet(): void {
    const researchType = this.lookupData.researchTypes.find(type => type.isActive === true);
    this.awardObject.researchType = researchType ? researchType.researchTypeCode : null;
  }

  /** sets type code, type and endpoint search options for research area and sub-area */
  researchTypeChange(): void {
    this.researchWarningMsg = null;
    this.isError = false;
    this.selectedArea = null;
    this.selectedSubArea = null;
    this.setAreaOptions('');
    this.setSubAreaOptions('');
  }

  setAreaOptions(defaultValue = ''): void {
    this.areaHttpOptions = this._awardService.setHttpOptions('description', 'description',
      'findResearchTypeArea', defaultValue, { 'researchTypeCode': this.awardObject.researchType });
  }

  /** sets end point search options for sub-area with dynamic params based on conditions
   * @param defaultValue
   */
  setSubAreaOptions(defaultValue): void {
    const SUB_AREA_PARAM = {
      'researchTypeCode': this.awardObject.researchType,
      'researchTypeAreaCode': this.selectedArea ? this.selectedArea.researchTypeAreaCode : null
    };
    this.subAreaHttpOptions = this._awardService.setHttpOptions('description', 'description', 'findResearchTypeSubArea',
      defaultValue, SUB_AREA_PARAM);
  }

  /** sets area object from end point search, also clears sub-area field
   * @param result
   */
  researchAreaSelectedFunction(result): void {
    if (result) {
      this.selectedArea = result;
    } else {
      this.selectedArea = null;
    }
    this.selectedSubArea = null;
    this.setSubAreaOptions('');
  }

  /** sets sub-area object from end point search, also defaults the value of area
   * @param result
   */
  researchSubAreaSelectedFunction(result): void {
    if (result) {
      this.selectedSubArea = result;
      this.setSubAreaForResearchArea(result);
    } else {
      this.selectedSubArea = null;
    }
  }

  /**
   * @param  {} result
   * sets the sub area if the selected type is 'Research Area'.
   */
  setSubAreaForResearchArea(result): void {
    if (result.researchTypeArea && result.researchTypeArea.description) {
      this.selectedArea = result.researchTypeArea;
      this.areaHttpOptions.defaultValue = result.researchTypeArea.description;
      this.isError = false;
      this.clearAreaField = new String('false');
    }
  }

  /** function validates areas according to type chosen and calls method to add if validation is successful */
  validateAndSetReqObject(): void {
    if (this.result.award.awardId) {
      this.validateAreaOfResearch();
      if (!this.researchWarningMsg) {
        this.setResearchAreaReqObject();
        this.clearResearchArea();
        this.clearResearchSubArea();
        this.setSubAreaOptions('');
      }
    }
  }

  /** main method to validate area of research */
  validateAreaOfResearch(): void {
    this.researchWarningMsg = null;
    if (this.selectedArea && this.result.awardResearchAreas.length) {
      this.validateResearchArea();
    } else if (!this.selectedArea) {
      this.isError = true;
      this.researchWarningMsg = '* Please add an Area';
    }
  }

  /** method to validate research area */
  validateResearchArea(): void {
    for (const area of this.result.awardResearchAreas) {
      if (!this.isEditMode(area)) {
        if ((area.researchTypeCode == this.awardObject.researchType) &&
          (area.researchTypeAreaCode == this.selectedArea.researchTypeAreaCode) &&
          ((!area.researchTypeSubArea && !this.selectedSubArea) || (this.selectedSubArea && area.researchTypeSubAreaCode &&
            area.researchTypeSubAreaCode == this.selectedSubArea.researchTypeSubAreaCode))) {
          this.researchWarningMsg = 'Area already added';
          break;
        }
      }

    }
  }

  isEditMode(researchArea) {
    if (this.isEditAreaOfResearch) {
      if (!researchArea.researchAreaId || researchArea.researchAreaId == this.areaOfResearchAwardEditObject.researchAreaId) {
        return true;
      }
    }
    return false;
  }

  /** sets request object for research area */
  setResearchAreaReqObject(): void {
    const areaObject: any = {};
    areaObject.researchTypeCode = this.awardObject.researchType;
    areaObject.researchType = this.lookupData.researchTypes
      .find(area => area.researchTypeCode == this.awardObject.researchType);
    areaObject.researchTypeAreaCode = this.selectedArea.researchTypeAreaCode;
    areaObject.researchTypeArea = this.selectedArea;
    areaObject.researchTypeSubAreaCode = this.selectedSubArea == null ? null : this.selectedSubArea.researchTypeSubAreaCode;
    areaObject.researchTypeSubArea = this.selectedSubArea == null ? null : this.selectedSubArea;
    if (this.isEditAreaOfResearch) {
      areaObject.researchAreaId = this.areaOfResearchAwardEditObject.researchAreaId;
    }
    this.addAwardAreaOfResearch(areaObject);
  }


  /** common request object for area of research and adds them
   * @param areaOfResearchObj
   */
  addAwardAreaOfResearch(areaOfResearchObj: areaOfResearchAward): void {
    this.setObjectForAddingResearchArea(areaOfResearchObj);
    this.$subscriptions.push(this._overviewService.addAwardAreaOfResearch(
      {
        'awardId': this.result.award.awardId, 'awardResearchArea': areaOfResearchObj,
        'updateUser': this._commonService.getCurrentUserDetail('userName')
      })
      .subscribe((data: any) => {
        this.result.awardResearchAreas = data;
        this.isError = false;
        this.clearResearchArea();
        this.updateAwardStoreData();
        $('#add-area-modal').modal('hide');
      },
        err => { this.errorToastWhileAddingResearchArea(); },
        () => { this.successToastWhileAddingResearchArea(); }));
  }

  errorToastWhileAddingResearchArea(): void {
    if (this.isEditAreaOfResearch) {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Area failed. Please try again');
      this.isEditAreaOfResearch = true;
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Area failed. Please try again.');
      this.isEditAreaOfResearch = false;
    }
  }

  successToastWhileAddingResearchArea(): void {
    if (this.isEditAreaOfResearch) {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Area updated successfully.');
    } else {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Area added successfully.');
    }
    this.isEditAreaOfResearch = false;
  }


  /**
   * @param  {} areaOfResearchObj
   * sets Area of Research Object with required fields while adding  Research Area.
   */
  setObjectForAddingResearchArea(areaOfResearchObj): void {
    areaOfResearchObj.awardId = this.result.award.awardId;
    areaOfResearchObj.awardNumber = this.result.award.awardNumber;
    areaOfResearchObj.sequenceNumber = this.result.award.sequenceNumber;
    areaOfResearchObj.updateTimeStamp = new Date().getTime();
    areaOfResearchObj.updateUser = this._commonService.getCurrentUserDetail('userName');
  }
  /**
  * setup award common data the values that changed after the service call need to be updated into the store.
  * every service call wont have all the all the details as response so
  * we need to cherry pick the changes and update them to the store.
  */
  updateAwardStoreData(): void {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setAwardData(this.result);
  }

  /** deletes area of research*/
  deleteAreaOfResearch(): void {
    const requestObj: any = {};
    this.setObjectForDeletingResearchArea(requestObj);
    this.$subscriptions.push(this._overviewService.deleteAwardResearchArea(requestObj)
      .subscribe((data: any) => {
        this.result.awardResearchAreas = data.awardResearchAreas;
        this.updateAwardStoreData();
        this.resetAreaOfResearch();
      },
        err => { this.errorToastWhileDeletingResearchArea(); },
        () => {
          this.successToastWhileDeletingResearchArea();
          this.areaToRemove = {};
        }));
  }

  /**
   * @param  {} requestObj
   * sets an Object with required fields while deleting a Research Area.
   */
  setObjectForDeletingResearchArea(requestObj): void {
    requestObj.awardId = this.result.award.awardId;
    requestObj.researchAreaId = this.areaToRemove.researchAreaId;
    requestObj.updateUser = this._commonService.getCurrentUserDetail('userName');
  }

  errorToastWhileDeletingResearchArea(): void {
    this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Area failed. Please try again.');
  }

  successToastWhileDeletingResearchArea(): void {
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Area removed successfully.');
  }

  saveMoreInfo(): void {
    if (this.result.award.awardId && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._overviewService.saveDescriptionOfAward({
        'awardId': this.result.award.awardId, 'researchDescription': this.result.award.researchDescription,
        'multiDisciplinaryDescription': this.result.award.multiDisciplinaryDescription,
        'updateUser': this._commonService.getCurrentUserDetail('userName')
      }).subscribe((data: any) => {
        this.result.grantCallId = data.grantCallId;
        this.result.award.researchDescription = data.researchDescription;
        this.result.award.multiDisciplinaryDescription = data.multiDisciplinaryDescription;
        this.updateAwardStoreData();
        this.isSaving = false;
        this._commonData.isAwardDataChange = false;
      },
        err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving more information failed. Please try again.');
          this.isSaving = false;
        },
        () => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'More Information saved successfully.');
          this.isSaving = false;
        }));
    }
  }

  /** temporary saves area of research object before deletion
   * @param e
   * @param id
   */
  temporarySaveAreaOfResearch(e, area): void {
    e.preventDefault();
    this.isError = false;
    this.researchWarningMsg = '';
    this.areaToRemove = area;
  }

  /** clears area field */
  clearResearchArea(): void {
    this.selectedArea = null;
    this.areaHttpOptions.defaultValue = '';
    this.clearAreaField = new String('true');
  }

  /** clears sub-area field*/
  clearResearchSubArea(): void {
    this.selectedSubArea = null;
    this.subAreaHttpOptions.defaultValue = '';
    this.clearSubAreaField = new String('true');
  }

  editAreaOfResearch(index) {
    this.isError = false;
    this.researchWarningMsg = null;
    this.isEditAreaOfResearch = true;
    this.editIndex = index;
    this.areaOfResearchAwardEditObject = JSON.parse(JSON.stringify(this.result.awardResearchAreas[index]));
    this.awardObject.researchType =  this.areaOfResearchAwardEditObject.researchTypeCode;
     this.clearSubAreaField = new String('false');
     this.clearAreaField = new String('false');
     this.selectedArea =  this.areaOfResearchAwardEditObject.researchTypeArea;
     this.selectedSubArea = this.areaOfResearchAwardEditObject.researchTypeSubArea;
     this.setAreaOptions( this.areaOfResearchAwardEditObject.researchTypeArea.description);
     if (this.areaOfResearchAwardEditObject.researchTypeSubArea) {
      this.setSubAreaOptions(this.areaOfResearchAwardEditObject.researchTypeSubArea.description);
     }  
  }

  resetAreaOfResearch() {
    this.isError = false;
    this.researchWarningMsg = null;
    this.isEditAreaOfResearch = false;
    this.editIndex = -1;
    this.clearResearchArea();
    this.clearResearchSubArea();
    this.awardObject.researchType = 1;

  }
}
