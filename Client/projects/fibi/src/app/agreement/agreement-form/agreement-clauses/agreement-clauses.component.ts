import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { AgreementClausesService } from './agreement-clauses.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AgreementCommonDataService } from '../../agreement-common-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';

@Component({
  selector: 'app-agreement-clauses',
  templateUrl: './agreement-clauses.component.html',
  styleUrls: ['./agreement-clauses.component.css']
})
export class AgreementClausesComponent implements OnInit, OnDestroy {

  result: any = {};
  agreementId: any;
  currentUser: any;
  agreementClausesGroupList: any;
  clausesList = [];
  clausesSearchOptions: any;
  clearClausesField: any;
  isEditClause: any;
  clauseEditIndex: any;
  clauseGroupEditIndex: any;
  clauseDescription: any;
  isCollapsed = [];
  isAddCollapsed = [];
  clauseRequestObject: any = {
    clauseCode: null
  };
  clauses = [];
  clauseEditObject: any = {};
  deleteClauseObj: any = {};
  deleteGroupObj: any = {};
  $subscriptions: Subscription[] = [];
  isModifyClauses =  false;
  isClausesEditMode = false;
  isShowClauses = true;

  constructor(private _agreementClausesService: AgreementClausesService,
              private _route: ActivatedRoute, private _commonService: CommonService,
              public _commonAgreementData: AgreementCommonDataService) { }

  ngOnInit() {
    this.getAgreementGeneralData();
    this.agreementId = this._route.snapshot.queryParamMap.get('agreementId');
    this.currentUser = this._commonService.getCurrentUserDetail('userName');
    this.clausesSearchOptions = this._agreementClausesService.setSearchOptions('description', 'description', 'findClauses');
    this.isModifyClauses = this.result.availableRights.includes('MODIFY_CLAUSES');
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.isClausesEditMode = this._commonAgreementData.getSectionEditPermission('104');
        this.agreementClausesGroupList = JSON.parse(JSON.stringify(this.result.agreementClausesGroup));
        this.setAgreementClauses();
      }
    }));
  }

  setAgreementClauses() {
    this.agreementClausesGroupList.forEach((item, index) => {
      const local = [];
      Object.keys(item.clauses).map(key => {
        local.push({ 'agreementClauseId': key, 'description': item.clauses[key] });
      });
      this.clauses[index] = [...local];
    });
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  editClause(description, groupIndex, clauseIndex) {
    this.clauseDescription = description;
    this.clauseEditIndex = clauseIndex;
    this.clauseGroupEditIndex = groupIndex;
    this.isEditClause = true;
  }

  setDeleteClause(agreementClauseId, groupIndex, clauseIndex) {
    this.deleteClauseObj.agreementClauseId = agreementClauseId;
    this.deleteClauseObj.groupIndex = groupIndex;
    this.deleteClauseObj.clauseIndex = clauseIndex;
  }

  deleteClause(agreementClauseId, groupIndex, clauseIndex) {
    const requestObject: any = {};
    requestObject.agreementClauseId = agreementClauseId;
    this._agreementClausesService.deleteAgreementClauses(requestObject).subscribe(data => {
      this.clauses[groupIndex].splice(clauseIndex, 1);
      if (this.isEditClause) {
        this.cancelClauseEdit();
      }
    });
  }

  cancelClauseEdit() {
    this.isEditClause = false;
    this.clauseDescription = '';
    this.clauseEditIndex = -1;
    this.clauseGroupEditIndex = -1;
  }

  saveClauseEdit(clause, groupIndex, clauseIndex) {
    this.clauseEditObject = clause;
    const clauseGroupCode = this.agreementClausesGroupList[this.clauseGroupEditIndex].clausesGroup.clauseGroupCode;
    if (this.clauseDescription) {
      const requestObject = {
        agreementClause: {
          agreementRequestId: this.agreementId,
          clauses: this.clauseDescription,
          updateUser: this.currentUser,
          clausesGroupCode: clauseGroupCode,
          agreementClauseId: this.clauseEditObject.agreementClauseId
        }
      };
      this.clauseEditObject.description = this.clauseDescription;
      this._agreementClausesService.saveOrUpdateAgreementClauses(requestObject).subscribe(
        (_data: any) => {
          this.clauses[groupIndex][clauseIndex] = this.clauseEditObject;
          this.cancelClauseEdit();
        }
      );
    }
  }

  selectClauses(data: any) {
    this.clearClausesField = false;
    this.clauseRequestObject = data;
    this.clauseDescription = data.description;
  }

  setClauses(value: any) {
    this.clauseDescription = value;
  }

  addClauses(clauseGroupCode, clauseGroupIndex) {
    if (this.clauseDescription) {
      const requestObject = {
        agreementClause: {
          agreementRequestId: this.agreementId,
          clauses: this.clauseDescription,
          updateUser: this.currentUser,
          clausesGroupCode: clauseGroupCode,
          agreementClauseId: ''
        }
      };
      this._agreementClausesService.saveOrUpdateAgreementClauses(requestObject).subscribe(
        (data: any) => {
          const agreementClause = data.agreementClause;
          this.clauses[clauseGroupIndex].push({ agreementClauseId: agreementClause.agreementClauseId,
            description: agreementClause.clauses });
          this.clauseDescription = '';
          this.clearClausesField = new Boolean('true');
          this.clauseRequestObject.clauseCode = null;
        }
      );
    } else {
      this.clearClausesField = true;
      this.clauseRequestObject.clauseCode = null;
    }
  }

  setDeleteClauseGroup(clausesGroupCode, groupIndex) {
    this.deleteGroupObj.clausesGroupCode = clausesGroupCode;
    this.deleteGroupObj.groupIndex = groupIndex;
  }

  deleteClauseGroup(clausesGroupCode, groupIndex) {
    const requestObject = {
      agreementRequestId: this.agreementId,
      clausesGroupCode: clausesGroupCode
    };
    this._agreementClausesService.deleteAgreementGroup(requestObject).subscribe(_data => {
      this.agreementClausesGroupList.splice(groupIndex, 1);
    });
  }

}
