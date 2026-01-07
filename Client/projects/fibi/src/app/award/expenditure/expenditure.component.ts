import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExpenditureService } from './expenditure.service';
import { KUConfigService } from '../../common/services/KU-config.service';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../services/common-data.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-expenditure',
  templateUrl: './expenditure.component.html',
  styleUrls: ['./expenditure.component.css']
})
export class ExpenditureComponent implements OnInit, OnDestroy {
  expenditureOverview: any;
  expenditureList: any = [];
  isExpenditure: any;
  KUConfig: any = {};
  award: any;
  $subscriptions: Subscription[] = [];

  constructor(private _expService: ExpenditureService,
    private _commonDataService: CommonDataService,
    private _KUConfig: KUConfigService) { }

  ngOnInit() {
    this.$subscriptions.push(this._commonDataService.awardData.subscribe((data: any) => {
      if (data) {
        this.award = data.award;
        if (this.award.awardId !== null) {
          this.IntialLoad();
        }
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  async IntialLoad() {
    this.KUConfig = await this._expService.getKuExpenditureConfig();
    this.KUConfig = this.KUConfig[0];
    this._KUConfig.KUProjectTaskUrl = this.KUConfig.project_task_api;
    this._KUConfig.KUProjectUrl = this.KUConfig.project_expenditure_api;
    this._KUConfig.KuToken = this.KUConfig.token;
    this._KUConfig.KuTokenType = this.KUConfig.token_type;
    this.expenditureOverview = await this._expService.expenditureLookUpData(this.award.accountNumber);
    this.expenditureOverview = this.expenditureOverview[0];
    // tslint:disable-next-line: max-line-length
    this.expenditureList = await this._expService.expenditureLookUpDetails(this.expenditureOverview.projectId, this.expenditureOverview.taskId);
  }
}
