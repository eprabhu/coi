import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../app-constants';
import { CommonService } from '../common/services/common.service';
import { ElasticConfigService } from '../common/services/elastic-config.service';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { AwardBaseSalaryList, PersonDetails, SearchHeader } from './award-basesalary-list.interface';
import { AwardBasesalaryListService } from './award-basesalary-list.service';

@Component({
  selector: 'app-award-basesalary-list',
  templateUrl: './award-basesalary-list.component.html',
  styleUrls: ['./award-basesalary-list.component.css']
})
export class AwardBasesalaryListComponent implements OnInit, OnDestroy {

  personSearchOptions: any = {};
  searchHead: SearchHeader = new SearchHeader();
  personDetails: PersonDetails = new PersonDetails();
  temporaryPerson: PersonDetails = new PersonDetails();
  awardBaseSalaryList: AwardBaseSalaryList[];
  searchMap = new Map();
  $subscriptions: Subscription[] = [];
  searchType = '1'; // if value is 1 then award number search will be shown and it value is 2 then account number

  constructor(private _elasticConfig: ElasticConfigService, private _commonService: CommonService,
    private _baseSalaryService: AwardBasesalaryListService) { }

  ngOnInit() {
    this.personSearchOptions = this._elasticConfig.getElasticForPerson();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  selectPerson(person: any): void {
    this.searchHead.personId = this.temporaryPerson.personId = person ? person.prncpl_id : '';
    this.temporaryPerson.fullName = person ? person.full_name : '';
  }

  clearSearch(): void {
    this.searchMap.clear();
    this.searchHead = new SearchHeader();
    this.temporaryPerson = new PersonDetails();
    this.personSearchOptions = this._elasticConfig.getElasticForPerson();
    this.awardBaseSalaryList = [];
    this.searchType = '1';
  }

  validateSearch(): boolean {
    this.searchMap.clear();
    if (!this.searchHead.personId) {
      this.searchMap.set('personId', '* Please select a person.');
    }
    if (this.searchType === '1' && !this.searchHead.awardNumber) {
      this.searchMap.set('awardNumber', '* Please enter award #.');
    }
    if (this.searchType === '2' && !this.searchHead.accountNumber) {
      this.searchMap.set('accountNumber', '* Please enter account number.');
    }
    return this.searchMap.size === 0;
  }

  getSearchResult(): void {
    if (!this.validateSearch()) {
      return;
    }
    if (!this.searchHead.accountNumber) {
      this.searchHead.accountNumber = null;
    }
    if (!this.searchHead.awardNumber) {
      this.searchHead.awardNumber = null;
    }
    this.fetchAwardBaseSalary();
  }

  fetchAwardBaseSalary(): void {
    this.$subscriptions.push(
      this._baseSalaryService.fetchManpowerBaseSalaryDetails(this.searchHead).subscribe((data: any) => {
        this.awardBaseSalaryList = data;
        this.personDetails = JSON.parse(JSON.stringify(this.temporaryPerson));
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Base Salary fetching failed. Please try again.');
      })
    );
  }

}
