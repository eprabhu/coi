import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Constants } from '../../questionnaire.constants';
import { CreateQuestionnaireService } from '../../services/create.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS } from '../../../../app-constants';

/**
 * developer note : since UI uses drop down the bind value will be string that is why double equal is used.
 * the initial value for look up will be integer and once user selects it wil bind as string.
 * to.String is not used because there is chance for null value which will cause error.
 * please don't change double equals unless you are absolutely sure of what you are doing
 * refer maintenance/questionnaire-list component for understanding the query param handling
 * and what is it purpose
 */
@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDetailsComponent implements OnInit, OnDestroy {

  constructor(public createQuestionnaireService: CreateQuestionnaireService, private _commonService: CommonService,
    private _activatedRoute: ActivatedRoute, private _ref: ChangeDetectorRef) { }
  @Input() data: any;
  @Input() isViewMode: any;
  newUsage = Object.assign({}, Constants.newUsage);
  UsageEditIndex = null;
  ruleList = [];
  $subscriptions: Subscription[] = [];
  moduleList = [];
  subModuleList = [];
  errorMap = new Map();

  ngOnInit(): void {
    this.getModuleList();
    this.newUsage.QUESTIONNAIRE_LABEL = this.data.header.QUESTIONNAIRE_NAME;
    this.$subscriptions.push(this._activatedRoute.queryParams.subscribe((data: any) => {
      this.isViewMode = (data.id && data.id.slice(0, 1) === 'T');
    }));
  }

  ngOnDestroy(): void {
    this.addNewUsage();
    subscriptionHandler(this.$subscriptions);
  }

  getModuleList(): void {
    this.$subscriptions.push(this.createQuestionnaireService.$moduleLookup
      .subscribe((data: any) => {
        this.moduleList = data;
        this.mapUsageDetails();
      }));
  }

  mapUsageDetails(): void {
    if (this.moduleList.length > 0) {
      this.data.usage.forEach(el => {
        const MODULE = this.getModule(el.MODULE_ITEM_CODE);
        el.MODULE_NAME = MODULE.DESCRIPTION;
        el.SUB_MODULE_NAME = this.getSubModuleItemName(MODULE.subModules, el.MODULE_SUB_ITEM_CODE);
      });
      this.createQuestionnaireService.before.usageModules = this.getModulesDetails(this.data.usage);
      this._ref.markForCheck();
    }
  }

 private getModulesDetails(usage): string{
    return usage.map(ele => `${ele.QUESTIONNAIRE_LABEL} is ${ele.IS_MANDATORY ? 'required' : 'optional'} in ${ele.MODULE_NAME}${this.getSubModule(ele)} ${this.appendRuleName(ele)}`);
  }

  private appendRuleName(module): string{
    return module.RULE ? `based on rule ${module.RULE}` : '';
  }

  private getSubModule(ele): string{
   return ele.SUB_MODULE_NAME ? (' - '+ ele.SUB_MODULE_NAME) : '';
  }

  getModule(code: string) {
    // tslint:disable-next-line:triple-equals
    const label = this.moduleList.find(M => M.MODULE_CODE == code);
    return label;
  }

  getSubModuleItemName(list, subModuleCode) {
    // tslint:disable-next-line:triple-equals
    const SUB_MODULE = list.find(sm => sm.SUB_MODULE_CODE == subModuleCode);
    return SUB_MODULE ? SUB_MODULE.DESCRIPTION : '';
  }
  /**
  * is show error is added to elimate a bug when the save is intiated from the create-main component.ts
  * the is feature if the user has typed in some alues to the new usage and instead of clicking the
  * add button in add usage screen usees the global save then also the item needed to added/saved.
  * so to make this happen for global save event we have intaiated this function from parent.
  * thus showing an error even though user haven't chnaged anything in add usage.
  * So to avoid that error isShowError is used.
  */
  addNewUsage(isShowError = true) {
    if (this.newUsage.MODULE_ITEM_CODE && this.newUsage.MODULE_ITEM_CODE !== '0' && this.checkDuplicateUsage()) {
      this.newUsage.QUESTIONNAIRE_ID = this.data.header.QUESTIONNAIRE_ID;
      this.newUsage.RULE = this.getRuleName(this.newUsage.RULE_ID);
      const MODULE = this.getModule(this.newUsage.MODULE_ITEM_CODE);
      this.newUsage.MODULE_NAME = MODULE.DESCRIPTION;
      this.newUsage.SUB_MODULE_NAME = this.getSubModuleItemName(MODULE.subModules, this.newUsage.MODULE_SUB_ITEM_CODE);
      this.data.usage.push(Object.assign({}, this.newUsage));
      this.newUsage = Object.assign({}, Constants.newUsage);
      this.newUsage.QUESTIONNAIRE_LABEL = this.data.header.QUESTIONNAIRE_NAME;
      this.errorMap.clear();
      this._ref.markForCheck();
    } else if (isShowError || !this.checkDuplicateUsage()) {
      this.setErrorMessage();
    }
  }

  addOrUpdate(isShowError = true) {
    this.UsageEditIndex == null ?  this.addNewUsage(isShowError) : this.updateUsage();
  }
  /**
   * Invokes only on add usage button click.
   */
  showToast() {
    if (!this.newUsage.MODULE_ITEM_CODE || this.newUsage.MODULE_ITEM_CODE === '0') {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please select atleast one Module.');
    }
  }
  /**
   * @param  {} ruleId
   * return rule name for the given rule id;
   * since UI uses drop down the bind value will be string that is why double equal is used
   */
  getRuleName(ruleId) {
    // tslint:disable-next-line: triple-equals
    const ruleName = this.ruleList.find(rule => rule.RULE_ID == ruleId);
    return ruleName ? ruleName.RULE : '';
  }

  findSubModuleList(moduleId: any) {
    // tslint:disable-next-line: triple-equals
    const LIST: any = this.moduleList.find(M => M.MODULE_CODE == moduleId);
    this.subModuleList = LIST && LIST.subModules ? this.sortSubModules(LIST.subModules) : [];
  }

  sortSubModules(subModuleList: any): any[] {
    subModuleList.sort((a, b) => {
        return a.DESCRIPTION.toLowerCase() > b.DESCRIPTION.toLowerCase() ? 1 :
               a.DESCRIPTION.toLowerCase() < b.DESCRIPTION.toLowerCase() ? -1 : 0;
    });
    return subModuleList;
  }

  updateUsageDetails() {
    this.newUsage.MODULE_SUB_ITEM_CODE = '0';
    this.getRuleList();
    this.findSubModuleList(this.newUsage.MODULE_ITEM_CODE);
    this.newUsage.RULE_ID = null;
  }

  removeUsage(index: number) {
    this.data.usage[index].AC_TYPE = 'D';
    this.createQuestionnaireService.isGeneralDetailsChanged = true;
  }
  /**
   * @param  {} data
   * @param  {} index
   * set edit usage index and populates the current data in edit field
   */
  editUsage(data, index) {
    this.findSubModuleList(data.MODULE_ITEM_CODE);
    this.UsageEditIndex = index;
    this.newUsage = Object.assign({}, data);
    this.getRuleList();
  }

  cancelUsageEdit() {
    this.newUsage = Object.assign({}, Constants.newUsage);
    this.UsageEditIndex = null;
  }

  updateUsage() {
    if (this.newUsage.MODULE_ITEM_CODE && this.newUsage.MODULE_ITEM_CODE !== '0' && this.checkDuplicateUsage()) {
      this.newUsage.RULE = this.getRuleName(this.newUsage.RULE_ID);
      const MODULE = this.getModule(this.newUsage.MODULE_ITEM_CODE);
      this.newUsage.MODULE_NAME = MODULE.DESCRIPTION;
      this.newUsage.SUB_MODULE_NAME = this.getSubModuleItemName(MODULE.subModules, this.newUsage.MODULE_SUB_ITEM_CODE);
      this.data.usage.splice(this.UsageEditIndex, 1, this.newUsage);
      this.cancelUsageEdit();
      this.errorMap.clear();
    } else {
      this.setErrorMessage();
    }
  }

  checkDuplicateUsage() {
    // tslint:disable:triple-equals
    const index = this.data.usage.findIndex(U => U.MODULE_ITEM_CODE == this.newUsage.MODULE_ITEM_CODE &&
      U.MODULE_SUB_ITEM_CODE == this.newUsage.MODULE_SUB_ITEM_CODE && U.AC_TYPE !== 'D');
    return index === -1 ? true : this.UsageEditIndex === index ? true : false;
  }

  setErrorMessage(): void {
    if (!this.newUsage.MODULE_ITEM_CODE || this.newUsage.MODULE_ITEM_CODE === '0') {
      this.errorMap.set('duplicate', 'Please select a Module first for adding a Questionnaire');
    } else {
      this.errorMap.set('duplicate', 'Only one usage of a Questionnaire can be linked to the same Module and same Submodule.');
    }
  }

  getRuleList() {
    this.errorMap.clear();
    this.$subscriptions.push(this.createQuestionnaireService.getRuleList(
      { 'moduleItemCode': this.newUsage.MODULE_ITEM_CODE, 'moduleSubItemCode': this.newUsage.MODULE_SUB_ITEM_CODE })
      .subscribe((data: any) => { this.ruleList = data; this._ref.markForCheck(); }));
  }

}
