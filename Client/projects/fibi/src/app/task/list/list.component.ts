import { Component, OnInit, OnDestroy } from '@angular/core';
import { ListserviceService } from './listservice.service';
import { CommonService } from '../../common/services/common.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { DEFAULT_DATE_FORMAT } from '../../app-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonDataService } from '../../award/services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { setFocusToElement } from '../../common/utilities/custom-utilities';

@Component({
  selector: 'app-task-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  taskList: any = [];
  taskId = null;
  isDesc: any;
  column = 'taskId';
  direction: number = -1;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  elasticSearchOptionsPerson: any = {};
  moduleItemKey = null;
  lookupValues: any = [];
  searchObject: any = {
    assigneePersonId: '',
    taskStatus: [],
    dueDateFrom: '',
    dueDateTo: '',
    moduleCode: '1',
    moduleItemKey: null,
    personId: this._commonService.getCurrentUserDetail('personID')
  };
  advSearchClearField: String;
  isCreateTask = false;
  departmentRights: any = [];
  taskStatusTypeOptions = 'TASK_STATUS#TASK_STATUS_CODE#true';
  taskStatusTypeColumnName = 'TASK_STATUS_CODE';
  $subscriptions: Subscription[] = [];
  workflowAwardStatusCode: any;
  taskTab = 'TASKS';
  isTaskTabInfo = true;
  awardSequenceStatus: any;
  awardStatusCode: any;
  setFocusToElement = setFocusToElement;
  isSaving = false;

  constructor(public _commonService: CommonService, private _ListserviceService: ListserviceService, public _commonData: CommonDataService,
    private _elasticConfig: ElasticConfigService, private _activatedRoute: ActivatedRoute, private _router: Router) { }

  ngOnInit() {
    this.taskList = [];
    this.departmentRights = this._commonData.departmentLevelRights;
    this.getAwardDetails();
    this.getAllowedTasks();
    this.elasticSearchOptionsPerson = this._elasticConfig.getElasticForPerson();

  }

     getAllowedTasks() {
        if (this._commonData.awardSectionConfig['143'].isActive) {
            this.fetchTask('TASKS');
        } else if (this._commonData.awardSectionConfig['144'].isActive) {
            this.taskTab = 'ALL_TASKS';
            this.fetchTask('ALL_TASKS');
        }
    }


    ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAwardDetails(): void {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.moduleItemKey = data.award.awardNumber;
        this.searchObject.moduleItemKey = data.award.awardNumber;
        this.awardSequenceStatus = data.award.awardSequenceStatus;
        this.awardStatusCode = data.award.statusCode;
        this.getPermissions();
        if (this._router.url.includes('/award/task/list')) {
          this.getAllowedTasks();
        }
      }
    }));
  }

  getPermissions(): void {
    this.isCreateTask = this.departmentRights.find(element => element === 'MAINTAIN_TASK') &&
      ['PENDING', 'ACTIVE'].includes(this.awardSequenceStatus) ? true : false;
  }

  /**
  * fetchTasks
  * to fetch task list
  */
  fetchTask(taskTab) {
    if (!this.isSaving) {
      this.isSaving = true;
      const moduleCode = 1;
      this.$subscriptions.push(this._ListserviceService.fetchTasksByParams({
        'moduleCode': moduleCode,
        'subModuleCode': 2,
        'moduleItemKey': this.moduleItemKey,
        'personId': this._commonService.getCurrentUserDetail('personID'),
        'moduleItemId': this._activatedRoute.snapshot.queryParamMap.get('awardId'),
        'taskTabName': taskTab || this.taskTab
      }).subscribe((data: any) => {
        this.taskList = data.tasks;
        this._commonData.taskCount = data.taskCount;
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    }
  }

  /**
   *searchTask
   *advanced search for task list
   */
  searchTask() {
    if (!this.isSaving) {
      this.isSaving = true;
      this.searchObject.dueDateFrom = parseDateWithoutTimestamp(this.searchObject.dueDateFrom);
      this.searchObject.dueDateTo = parseDateWithoutTimestamp(this.searchObject.dueDateTo);
      this.$subscriptions.push(this._ListserviceService.advancedSearchForTask(this.searchObject)
        .subscribe((data: any) => {
          this.taskList = data.tasks;
          this.isSaving = false;
        }, err => { this.isSaving = false; }));
    }
  }

  /**
   * @param  {} property column name to be sorted by
   * for sorting dashoard
   */
  sortBy(property) {
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  clearAdvancedSearchField(taskTabName) {
    this.advSearchClearField = new String('true');
    this.searchObject.taskStatus = [];
    this.searchObject.dueDateFrom = new String('');
    this.searchObject.dueDateTo = new String('');
    this.lookupValues = [];
    this.lookupValues.taskStatus = [];
    taskTabName ? this.fetchTask(taskTabName) : this.fetchTask('TASKS');
  }

  selectPerson(event) {
    if (event) {
      this.searchObject.assigneePersonId = event.prncpl_id;
      this.advSearchClearField = new String('false');
    } else {
      this.searchObject.assigneePersonId = null;
    }
  }
  /**
   * @param  {} data
   * @param  {} template
   * for lookup selection
   */
  onLookupSelect(data, template) {
    this.lookupValues[template] = data;
    this.searchObject[template] = data.length ? data.map(d => d.description) : [];
  }
  switchTab(taskTabName) {
    this.taskTab = taskTabName;
    this.isTaskTabInfo = true;
    this.clearAdvancedSearchField(taskTabName);
  }
}
