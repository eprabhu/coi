import { Component, OnInit } from '@angular/core';
import { ClausesManagementService } from './clauses-management.service';
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS } from '../../app-constants';

@Component({
  selector: 'app-clauses-management',
  templateUrl: './clauses-management.component.html',
  styleUrls: ['./clauses-management.component.css']
})
export class ClausesManagementComponent implements OnInit {

  clausesSearchOptions: any = {};
  clearClausesField: any;
  clauses: any = [];
  clausesList: any = [];
  currentUser: string;
  clauseEditIndex: number;
  isEditClauseGroup: any;
  isEditClause: boolean;
  deleteClauseObj = {
    clausesCode : '',
    index: ''
  };
  clauseCode: any;
  editClauseValue: any;

  constructor(private clausesservice: ClausesManagementService, private _commonService: CommonService) { }

  ngOnInit() {
    this.currentUser = this._commonService.getCurrentUserDetail('userName');
   this.loadAllBankClauses();
  }
 loadAllBankClauses() {
  this.clausesservice.loadAllClausesBank().subscribe((data: any) => {
      this.clausesList = data.clausesBanks;
   });
  }
  addClauses() {
    const requestObject: any = {};
    if (this.clauseCode) {
      requestObject.clauseCode = this.clauseCode;
    }
    requestObject.description = this.clauses;
    requestObject.updateUser = this.currentUser;
    this.clausesservice.addToClausesBank(requestObject).subscribe((data: any) => {
      this.clausesList.push(data);
      this.loadAllBankClauses();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Clauses added successfully.');
      this.clauses = '';
   });
  }
  editClause(clause: string, code, index: number) {
    this.editClauseValue = clause;
    this.clausesSearchOptions.defaultValue = clause;
    this.clauseEditIndex = index;
    this.isEditClause = true;
    this.clauseCode = code;
  }
  deleteClausesById(code, index) {
    const requestObject: any = {};
    requestObject.clauseCode = code;
    this.clausesservice.deleteClausesById(requestObject).subscribe((data: any) => {
      this.clausesList.splice(index, 1);
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Clauses deleted successfully.');
    });
  }
  cancelClauseEdit() {
    this.isEditClause = false;
    this.clauses = '';
    this.clauseEditIndex = -1;
    this.clauseCode = '';
  }

  editAndSaveClause() {
    const requestObject: any = {};
    requestObject.clauseCode = this.clauseCode;
    requestObject.description = this.editClauseValue;
    requestObject.updateUser = this.currentUser;
    this.clausesservice.addToClausesBank(requestObject).subscribe((data: any) => {
      this.clausesList = data.clausesBanks;
      requestObject.description = {};
      this.cancelClauseEdit();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Clauses updated successfully.');
   });
  }
}
