import { CommonService } from './../../../common/services/common.service';
import { Component, OnInit } from '@angular/core';
import { ClausesService } from './clauses.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';

@Component({
  selector: 'app-clauses',
  templateUrl: './clauses.component.html',
  styleUrls: ['./clauses.component.css']
})
export class ClausesComponent implements OnInit {
  clausesGroupList: any = [];
  clauseGroup: any;
  clausesList: any = [];
  clauses: any = [];
  clauseGroupIndex = -1;
  clauseGroupEditIndex = -1;
  clauseEditIndex: any;
  isEditClause = false;
  isEditClauseGroup = false;
  currentUser = '';
  currentClausesGroupIndex = -1;
  lookupValues: any;
  tempAgreementTypes = [];
  clearField: any;
  clearClausesField: any;
  completerAgreementTypeListOptions: any = {};
  agreementTypeRequestObject: any = {};
  clauseRequestObject: any = {
    clauseCode: null
  };
  clausesSearchOptions: any = {};
  agreementTypeSelected = false;
  deleteAgreementTypeObject: any = {};
  deleteClauseObj: any = {};
  clauseCode: any;
  clauseGroupCode: any;
  deleteGroupIndex: any;

  constructor(private _clausesService: ClausesService, private _commonService: CommonService) { }

  ngOnInit() {
    this.currentUser = this._commonService.getCurrentUserDetail('userName');
    this.getClausesGroup();
    this.clausesSearchOptions = this._clausesService.setSearchOptions('description', 'description', 'findClauses');
  }

  getClausesGroup() {
    this._clausesService.fetchAllClausesGroup().subscribe(
      (data: any) => {
        this.clausesGroupList = data.clausesDetails;
        this.completerAgreementTypeListOptions.defaultValue = '';
        this.completerAgreementTypeListOptions.arrayList = data.agreementTypes;
        this.completerAgreementTypeListOptions.contextField = 'description';
        this.completerAgreementTypeListOptions.filterFields = 'description';
        this.completerAgreementTypeListOptions.formatString = 'description';
        if (this.clausesGroupList.length > 0) {
          this.selectClausesGroup(this.clausesGroupList[0], 0);
        }
      }
    );
  }

  addClausesGroup() {
    if (this.clauseGroup) {
      const requestObject = {
        clausesGroup: {
          description: this.clauseGroup,
          updateUser: this.currentUser
        }
      };
      this._clausesService.addNewClausesGroup(requestObject).subscribe(
        (data: any) => {
          this.clausesGroupList.push(data.clausesGroup);
          this.clauseGroup = '';
          this.selectClausesGroup(this.clausesGroupList[this.clausesGroupList.length - 1], this.clausesGroupList.length - 1);
        }
      );
    }
  }

  addClauses() {
    if (this.clauses) {
      if (!this.isClausesAlreadyAdded()) {
        const requestObject = {
          clausesGroup: { ...this.clausesGroupList[this.currentClausesGroupIndex] }
        };
        const newClause = {
          description: this.clauses,
          updateUser: this.currentUser
        };
        requestObject.clausesGroup.clauses.push(newClause);
        this.addToClausesGroup(requestObject);
        if (!this.clauseCode) {
          this.addToClausesBank(newClause);
        }
      } else {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Clause already present.');
        this.clearClausesField = true;
        this.clauseRequestObject = null;
      }
    }
  }

  addToClausesGroup(requestObject) {
    this._clausesService.addNewClausesGroup(requestObject).subscribe(
      (data: any) => {
        this.clausesGroupList[this.currentClausesGroupIndex] = data.clausesGroup;
        this.clausesList = [...this.clausesGroupList[this.currentClausesGroupIndex].clauses];
        this.clearClausesField = new Boolean('true');
        this.clauseRequestObject = null;
      }
    );
  }

  /**
   * newly added clauses will be added
   * in the clauses bank.
   */
  addToClausesBank(newClause) {
    this._clausesService.addToClausesBank(newClause).subscribe(() => {
      this.clauses = '';
      this.clauseCode = '';
    });
  }

  setClauses(value: any) {
    this.clauses = value;
  }

  onAgreementTypeSelect(eventData: any) {
    this.clearField = false;
    this.agreementTypeRequestObject = eventData;
    this.agreementTypeSelected = true;
  }

  setDeleteClause(clausesCode: number, index: number) {
    this.deleteClauseObj.clausesCode = clausesCode;
    this.deleteClauseObj.index = index;
  }

  deleteClause(clausesCode: number, index: number) {
    if (typeof index === 'number') {
      const requestObject = {
        clausesCode
      };
      this._clausesService.deleteClause(requestObject).subscribe(
        (_data: any) => {
          this.clausesList.splice(index, 1);
          this.clausesGroupList[this.currentClausesGroupIndex].clauses.splice(index, 1);
        }
      );
      if (this.isEditClause) {
        this.cancelClauseEdit();
      }
    }
  }

  setDeleteAgreementTypeObject(agreementTypeCode: string, clausesGroupCode: number, index: number) {
    this.deleteAgreementTypeObject.agreementType = agreementTypeCode;
    this.deleteAgreementTypeObject.clausesGroupCode = clausesGroupCode;
    this.deleteAgreementTypeObject.index = index;
  }

  deleteAgreementType(agreementTypeCode: string, clausesGroupCode: number, index: number) {
    const requestObject = {
      agreementTypeCode,
      clausesGroupCode
    };
    this._clausesService.deleteAgreementType(requestObject).subscribe(
      (_data: any) => {
        this.clausesGroupList[this.currentClausesGroupIndex].agreementTypes.splice(index, 1);
      }
    );
    if (this.isEditClause) {
      this.cancelClauseEdit();
    }
  }

  selectClausesGroup(clauseGroup: any, index: number) {
    this.clauseGroupIndex = index;
    this.clausesList = [...clauseGroup.clauses];
    this.currentClausesGroupIndex = index;
    if (this.isEditClause) {
      this.cancelClauseEdit();
    }
    if (this.isEditClauseGroup) {
      this.cancelClauseGroupEdit();
    }
  }

  editClause(clause: string, index: number) {
    this.clauses = clause;
    this.clausesSearchOptions.defaultValue = clause;
    this.clauseEditIndex = index;
    this.isEditClause = true;
    if (this.isEditClauseGroup) {
      this.cancelClauseGroupEdit();
    }
  }

  editClauseGroup(description: string, index: number, event: any) {
    event.stopImmediatePropagation();
    this._commonService.pageScroll('pageScrollToTop');
    this.clauseGroup = description;
    this.clauseGroupEditIndex = index;
    this.isEditClauseGroup = true;
    if (this.isEditClause) {
      this.cancelClauseEdit();
    }
  }

  cancelClauseEdit() {
    this.isEditClause = false;
    this.clauses = '';
    this.clauseEditIndex = -1;
  }

  cancelClauseGroupEdit() {
    this.isEditClauseGroup = false;
    this.clauseGroup = '';
    this.clauseGroupEditIndex = -1;
  }

  saveClauseGroupEdit() {
    if (this.clauseGroup) {
      const requestObject = {
        clausesGroup: { ...this.clausesGroupList[this.clauseGroupEditIndex] }
      };
      requestObject.clausesGroup.description = this.clauseGroup;
      requestObject.clausesGroup.updateUser = this.currentUser;
      this._clausesService.addNewClausesGroup(requestObject).subscribe(
        (data: any) => {
          this.clausesGroupList[this.clauseGroupEditIndex] = data.clausesGroup;
          this.cancelClauseGroupEdit();
        }
      );
    }
  }

  saveClauseEdit() {
    if (this.clauses) {
      const requestObject = {
        clausesGroup: { ...this.clausesGroupList[this.currentClausesGroupIndex] }
      };
      requestObject.clausesGroup.clauses[this.clauseEditIndex].description = this.clauses;
      requestObject.clausesGroup.clauses[this.clauseEditIndex].updateUser = this.currentUser;
      this._clausesService.addNewClausesGroup(requestObject).subscribe(
        (data: any) => {
          this.clausesGroupList[this.clauseGroupEditIndex] = data.clausesGroup;
          this.cancelClauseEdit();
        }
      );
    }
  }
  onLookupSelect(data: any) {
    this.tempAgreementTypes.push(data.code);
  }

  addAgreementTypes() {
    this.clearField = true;
    if (!this.isAgreementTypeAlreadyAdded()) {
      const requestObject = {
        agreementClausesGroupMapping: {
          agreementTypeCode: this.agreementTypeRequestObject.agreementTypeCode,
          clausesGroupCode: this.clausesGroupList[this.currentClausesGroupIndex].clauseGroupCode,
          updateUser: this.currentUser
        }
      };
      if (requestObject.agreementClausesGroupMapping.agreementTypeCode !== '') {
        this._clausesService.addAgreementType(requestObject).subscribe(
          (_data: any) => {
            this.clausesGroupList[this.currentClausesGroupIndex].agreementTypes.push(this.agreementTypeRequestObject);
          }
        );
      }
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Agreement Type already present.');
      this.clearField = new Boolean('true');
    }
    this.agreementTypeSelected = false;
  }

  isAgreementTypeAlreadyAdded() {
    return this.clausesGroupList[this.currentClausesGroupIndex].agreementTypes.some((data: any) =>
      data.agreementTypeCode === this.agreementTypeRequestObject.agreementTypeCode);
  }

  selectClauses(data: any) {
    if (data) {
      this.clearClausesField = false;
      this.clauseRequestObject = data;
      this.clauses = data.description;
      this.clauseCode = data.clauseCode;
    }
  }

  isClausesAlreadyAdded() {
    if (this.clauseRequestObject === null) {
      return false;
    }
    return this.clausesGroupList[this.currentClausesGroupIndex].clauses.some((data: any) =>
      data.clauseCode === this.clauseRequestObject.clauseCode);
  }

  deleteClauseGroup() {
    this.clauseGroupCode = this.clausesGroupList[this.currentClausesGroupIndex].clauseGroupCode;
    this._clausesService.deleteClausesGroup(this.clauseGroupCode).subscribe((data: any) => {
      this.clausesGroupList.splice(this.deleteGroupIndex, 1);
      this._commonService.showToast(HTTP_SUCCESS_STATUS, data);
      this.selectClausesGroup(this.clausesGroupList[0], 0);
    }, err => { 
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Clause Group delete failed.');    
    });
  }
}
