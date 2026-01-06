import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getCompleterOptionsForLeadUnitWithCustField } from '../../common/services/completer.config';
import { NavigationService } from '../../common/services/navigation.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { BusinessRuleService } from './common/businessrule.service';
import { mapModules, setCompleterOptions } from './common/commonFunctions';

@Component({
  selector: 'app-business-rule',
  templateUrl: './business-rule.component.html',
  styleUrls: ['./business-rule.component.css']
})
export class BusinessRuleComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  selectedUnitName: string;
  showTabs = true;
  showInfo = false;
  infoMessage: any;

  constructor(private ruleService: BusinessRuleService,
              private _navigationService: NavigationService,
              private _router: Router) {
    this.routerEventSubscription();
  }

  ngOnInit() {
    this.ruleService.completerUnitListOptions = getCompleterOptionsForLeadUnitWithCustField();
    this.ruleService.completerModuleListOptions =
            setCompleterOptions([], 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
    this.getUnitList();
    this.ruleService.completerRuleListOptions = setCompleterOptions(this.ruleService.conditionsForList, 'name', 'name', 'name');
  }

  routerEventSubscription() {
		this.$subscriptions.push(this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          this.showTabs = event.urlAfterRedirects.includes('create') ? false : true ;
      }
		}));
	}

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  setModuleList() {
    if (this.ruleService.moduleSubModuleList) {
      this.ruleService.completerModuleListOptions =
                         setCompleterOptions(this.ruleService.moduleSubModuleList, 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
    }
  }

  getUnitList() {
    this.$subscriptions.push(this.ruleService.getUnitList().subscribe((data: any) => {
        this.ruleService.completerUnitListOptions =
                         getCompleterOptionsForLeadUnitWithCustField(data.unitList, this.selectedUnitName);
        this.getModuleSubModuleList();
    }));
  }

  getModuleSubModuleList() {
    this.$subscriptions.push(this.ruleService.getBusinessRuleList().subscribe((data: any) => {
        this.ruleService.moduleSubModuleList = data.moduleSubmoduleList.filter(item => item.IS_ACTIVE === 'Y');
        this.ruleService.completerModuleListOptions =
                         setCompleterOptions(this.ruleService.moduleSubModuleList, 'DESCRIPTION', 'DESCRIPTION', 'DESCRIPTION');
    }));
  }

  openInfo() {
    this.showInfo = true;
    if (this._navigationService.currentURL.includes('metaRules')) {
      this.infoMessage =
      'This screen lists the created meta rules. There are options to create new meta rules as well as modify the existing meta rules.';
    } else {
      this.infoMessage =
        'This screen lists the created business rules. There are options to create new rules as well as modify the existing rules.';
    }
  }
}

