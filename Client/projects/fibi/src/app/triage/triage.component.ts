import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../common/services/common.service';
import { TriageService } from './triage.service';

/**
 * Developed by Mahesh Sreenath V M
 * Maintained by Arun Raj
 * This modules works in sync with questionnaire module to  setup an Agreement (in this cse  will work with all modules).
 * The idea is to create an agreement based on the answer selected by the user. Once the agreement is generated
 * the user is navigated into the agreement detail detail screen.
 * The data required for the Questionnaire module to work is read from the URL query params separated by character 'Z'
 * The first part is module code the second part is sub module code and the third part is module item key.
 * The questionnaire module will fire an event on save an d we capture that event to see if the questionnaire is complete
 * and if that has a post Evaluation logic attached to it. If so we trigger the post evaluation logic otherwise nothing
 * would happen.
 * see this document for more details https://docs.google.com/document/d/1Se8NzG-TEcTGvAbaV3yiFVdmp3W7xOKAwohUqDCxKms/edit
 */

@Component({
  selector: 'app-triage',
  templateUrl: './triage.component.html',
  styleUrls: ['./triage.component.css']
})
export class TriageComponent implements OnInit {

  questionnaireDetails = {};
  configuration: any = {
    moduleItemCode: 13,
    moduleSubitemCodes: [999],
    moduleItemKey: '',
    moduleSubItemKey: 0,
    actionUserId: this._commonService.getCurrentUserDetail('personID'),
    actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
    enableViewMode: false,
    isEnableVersion: false,
    questionnaireMode: 'ACTIVE'
  };
  moduleCode: string;
  subModuleCode: string;
  triageId: string;
  isAgreementNeeded = true;
  isAgreementAdministrator = false;

  constructor(private _route: ActivatedRoute, private _router: Router, private _triageService: TriageService,
    private _commonService: CommonService) { }

  async ngOnInit() {
    const triageId = this._route.snapshot.queryParamMap.get('triageId');
    if (!triageId) {
      this.gotoAgreementCreation();
    } else {
      this.parseQueryParams(triageId);
    }
  }

  async gotoAgreementCreation() {
     const triageHeader = {
        moduleCode: 13,
        subModuleCode: 0,
        updateUser: this._commonService.getCurrentUserDetail('userName'),
        personId: this._commonService.getCurrentUserDetail('personID')
      };
      const triageId: any = await this._triageService.getTriageHeader({ triageHeader });
      const triageHeaderId = this.getQueryValueForTriage(triageId.triageHeader.triageHeaderId);
      this._router.navigate(['.'], { relativeTo: this._route, queryParams: { 'triageId': triageHeaderId } });
      this.parseQueryParams(triageHeaderId);
  }

  getQueryValueForTriage(moduleItemKey) {
    return '13Z999Z' + moduleItemKey;
  }

  parseQueryParams(queryParam: string) {
    const QUERY_PARAMS: string[] = queryParam.split('Z');
    this.moduleCode = QUERY_PARAMS[0];
    this.subModuleCode = QUERY_PARAMS[1];
    this.triageId = QUERY_PARAMS[2];
    this.setQuestionnaireConfiguration(this.moduleCode, this.subModuleCode, this.triageId);
  }

  setQuestionnaireConfiguration(moduleCode, subModuleCode, triageId) {
    this.configuration.moduleItemCode = moduleCode;
    this.configuration.moduleSubitemCodes = [subModuleCode];
    this.configuration.moduleItemKey = triageId;
    this.configuration = JSON.parse(JSON.stringify(this.configuration));
  }

  backToAgreementList() {
    this._router.navigate(['fibi/dashboard/agreementsList']);
  }
  /**
   * this function gets the save event from questionnaire and if the condition is met the n Post evaluation logic is triggered.
   * Currently this only work with Agreement Modules as it grows we can add additional logic here to open for specific modules
   */
  async getSaveEvent(questionnaireDetails) {
    if (questionnaireDetails.TRIGGER_POST_EVALUATION === 'Y' && questionnaireDetails.QUESTIONNAIRE_COMPLETED_FLAG === 'Y') {
      const REQUEST_OBJECT = {
        updateUser: this._commonService.getCurrentUserDetail('userName'),
        triageHeaderId: this.triageId,
        personId: this._commonService.getCurrentUserDetail('personID')
      };
      this._commonService.isManualLoaderOn = true;
      const POST_EVALUATION: any = await this._triageService.postEvaluationLogic(REQUEST_OBJECT);
      this._commonService.isManualLoaderOn = false;
      this.checkAgreementNeeded(POST_EVALUATION.moduleItemKey);
    }
  }

  checkAgreementNeeded(moduleItemKey) {
    moduleItemKey ? this.openModuleDetails(moduleItemKey) : this.isAgreementNeeded = false;
  }
  /**
   * Need to open the details of the screen based on the currently working Module.
   * code only written for Agreement as it is required for agreement as of now.
   */
  openModuleDetails(moduleItemKey) {
    if (this.moduleCode === '13') {
      this._router.navigate(['/fibi/agreement/form'], { queryParams: { 'agreementId': moduleItemKey, 'triageId': this.triageId } });
    }
  }

}
