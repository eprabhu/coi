import { Component, OnDestroy, OnInit } from '@angular/core';
import { AwardHierarchyService } from './award-hierarchy.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../services/common-data.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { AwardService } from '../services/award.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { openInNewTab } from '../../common/utilities/custom-utilities';

declare var $: any;

@Component({
    selector: 'app-award-hierarchy',
    templateUrl: './award-hierarchy.component.html',
    styleUrls: ['./award-hierarchy.component.css']
})

export class AwardHierarchyComponent implements OnInit, OnDestroy {
    result: any = {};
    piName: string;
    expandAllEnabled = false;
    nodes: any = [];
    selectedNode: any;
    accountNumber: any;
    awardProperties: any;
    awardId: any;
    awardNumber: any;
    rootAwardNumber: any;
    awardList: any;
    tempAwardList: any;
    treeData: any = [];
    parentName: any;
    completerAwardOptions: any = {};
    childAwardObj: any = {};
    highlightAward: any;
    deleteAwardObj: any = {};
    toast_message: string;
    isHierarchyEdit = true;
    isModifyAward = false;
    $subscriptions: Subscription[] = [];
    awardVersionObject: any = {};
    awardData: any = {};
    copyQuestionnaire = false;
    copyOtherInformation = false;
    currentUser = this._commonService.getCurrentUserDetail('userName');
    isCreateAward = false;

    constructor(public awardHierarchyService: AwardHierarchyService,
        public route: ActivatedRoute, public router: Router, public _commonService: CommonService,
        public _commonData: CommonDataService, private _awardService: AwardService) {
    }

    ngOnInit() {
        this.awardId = this.route.snapshot.queryParams['awardId'];
        if (this.awardId) {
            this.getAwardTree();
            if (this.treeData.length) {
                this.viewAwardDetails(this.awardId);
            }
        }
        this.getPermissions();
        this.isAwardTreeChange();
        this.subscribeAwardData();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
    /**
     * function for calling hierarchy when child award is added from more options
     */
    isAwardTreeChange() {
        this.$subscriptions.push(this._awardService.isAwardTreeTrigger.subscribe(data => {
            this.getAwardTree();
        }));
    }

    subscribeAwardData() {
        this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
            if (data) {
                this.awardData = data;
                this.getSectionEditableList();
            }
        }));
    }

    getSectionEditableList() {
        this.isHierarchyEdit = this._commonData.getSectionEditableFlag('116'); // hierarchy
    }

    async getPermissions() {
        this.isModifyAward = await this._commonData.checkDepartmentLevelRightsInArray('MODIFY_AWARD');
        this.isCreateAward = await this._commonData.checkDepartmentLevelRightsInArray('CREATE_AWARD');
    }

    /**
    * Get search data for award hierarchy list
    */
    async getSearchList() {
        await this.$subscriptions.push(this.awardHierarchyService.getAwardlist(this.awardNumber).subscribe((data: any) => {
            this.awardList = data;
            this.completerAwardOptions.arrayList = data;
            this.completerAwardOptions.contextField = 'name';
            this.completerAwardOptions.filterFields = 'name';
            this.completerAwardOptions.formatString = 'name';
        }));
    }

    /**
     * Generate award hierarchy with respect to awrardId
     */
    getAwardTree() {
        return new Promise((resolve, reject) => {
            this.treeData = [];
            this.$subscriptions.push(this.awardHierarchyService.loadAwardSummary(this.awardId).subscribe(data => {
                this.result = data || [];
                if (this.result.awardDetails && this.result.awardDetails.length > 0) {
                    this.awardNumber = this.result.awardDetails[0].award_number;
                    this.rootAwardNumber = this.result.awardDetails[0].root_award_number;
                    this._commonService.isManualLoaderOn = true;
                    this.getSearchList();
                    this.$subscriptions.push(
                        this.awardHierarchyService.loadAwardHierarchy(this.rootAwardNumber, this.awardNumber)
                            .subscribe((value: any) => {
                                if (value.awardHierarchy !== null) {
                                    this.treeData.push(value.awardHierarchy);
                                    this.openAllNodes(this.treeData);
                                    this.viewAwardDetails(this.awardId);
                                    this._commonService.isShowLoader.next(false);
                                    this._commonService.isManualLoaderOn = false;
                                }
                            }));
                }
            }));
            resolve(true);
        });
    }


    /**
  * @param  {scroll'} 'tree-outer
  * @param  {} []:- to set scroll to top
  */
    onWindowScroll(event) {
        (document.getElementsByClassName('award-tree-outer')[0].scrollTop > 300) ?
            document.getElementById('scrollUpBtn').style.display = 'block' : document.getElementById('scrollUpBtn').style.display = 'none';
    }
    scrollToTop() {
        document.getElementsByClassName('award-tree-outer')[0].scrollTop = 0;
    }

    onSelectAward(event) {
        if (event) {
            this.viewAwardDetails(event.awardId);
        }
    }

    /**
   * @param  {} event
   * @param  {} node
   * Accordion functionality on clicking a specific node
   */
    listClick(event, node) {
        this.selectedNode = node;
        node.visible = !node.visible;
        event.stopPropagation();
    }
    /**
     * @param  {} nodes
     * Expand every nodes in the treeview
     */
    openAllNodes(nodes) {
        nodes.forEach(node => {
            node.visible = true;
            if (node.children) {
                this.openAllNodes(node.children);
            }
        });
    }

    /**
  * @param  {} awardId
  * Scroll to specific node and highlight it on selecting specific field in the search box
  */
    selectAward(awardId) {
        this.openAllNodes(this.treeData);
        if (document.getElementsByClassName('highlight-node')[0]) {
            document.getElementsByClassName('highlight-node')[0].classList.remove('highlight-node');
        }
        this.highlightAward = document.getElementById(awardId);
        if (awardId && this.highlightAward) {
            this.highlightAward.classList.add('highlight-node');
            this.highlightAward.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
    }
    /**
     * @param  {} awardId
     * view overview of selected award
     */
    viewAwardDetails(awardId) {
        this.$subscriptions.push(this.awardHierarchyService.loadAwardSummary(awardId).subscribe((data: any) => {
            this.awardProperties = data.awardDetails[0];
            this.selectAward(awardId);
        }));
    }

    /**
     * @param  {} award
     * add  child award as the copy of selected award(general details,keyperson and project team)
     */
    addChildAward(award) {
        this.childAwardObj.parentAwardId = award.awardId;
        this.childAwardObj.parentAwardNumber = award.awardNumber;
        this.childAwardObj.loggedUserName = this._commonService.getCurrentUserDetail('userName');
        this.childAwardObj.acType = 'I';
        this.childAwardObj.copyOtherInformation = this.copyOtherInformation;
        this.childAwardObj.copyQuestionnaire = this.copyQuestionnaire;
        this.$subscriptions.push(this.awardHierarchyService.maintainAward(this.childAwardObj).subscribe((data: any) => {
            if (data) {
                this.getAwardTree().then(value => {
                    setTimeout(() => {
                        this.viewAwardDetails(data.awardId);
                    }, 1000);
                });
                this._commonService.showToast(HTTP_SUCCESS_STATUS, "Child Award added successfully.");
            }
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Child Award failed. Please try again.');
          }));
        this.clearModalFlags();
    }

    clearModalFlags() {
        this.copyOtherInformation = false;
        this.copyQuestionnaire = false;
    }

    deleteAward(award) {
        this.deleteAwardObj.acType = 'D';
        this.deleteAwardObj.awardNumber = award.awardNumber;
        this.$subscriptions.push(this.awardHierarchyService.maintainAward(this.deleteAwardObj).subscribe((data: any) => {
            if (data === 'success') {
                this.toast_message = 'Award deleted successfully.';
                this._commonService.showToast(HTTP_SUCCESS_STATUS, this.toast_message);
                this.getAwardTree();
                this.getSearchList();
            } else if (data === 'failed') {
                this.toast_message = 'Unable to delete.';
                this._commonService.showToast(HTTP_ERROR_STATUS, this.toast_message);
            } else {
                this.toast_message = 'Deleting award failed. Please try again.';
                this._commonService.showToast(HTTP_ERROR_STATUS, this.toast_message);
            }
        }));
    }

    navigateToAward(award) {
        this.awardHierarchyService.getAwardVersions({ 'awardNumber': award.award_number }).subscribe((data: any) => {
            this.awardVersionObject = data;
            if (this.awardVersionObject.activeAward && this.awardVersionObject.pendingAwards.length) {
                $('#newAwardVersionAleradyExist').modal('show');
            } else {
                this.routeToAwardId(award.award_id);
            }
        });
    }
    routeToAwardId(awardId) {
        openInNewTab('award/overview?', ['awardId'], [awardId]);
    }
    /**
    * Sets award status badge w.r.t status code
    * 1-Active
    * 2-withdraw
    * 3-draft
    * 4-inactive
    * 5-closed
    * 6-Hold
    * 7-rejected
    */
    getBadgeByAwardStatusCode(statusCode) {
        if (statusCode === '1') {
            return 'success';
        } else if (statusCode === '2' || statusCode === '4' || statusCode === '5') {
            return 'danger';
        } else if (statusCode === '3' || statusCode === '6') {
            return 'warning';
        } else {
            return 'info';
        }
    }
    getBadgeByStatusCode(statusCode) {
        if (statusCode === 'ACTIVE') {
            return 'success';
        } else if (statusCode === 'CANCELLED') {
            return 'danger';
        } else if (statusCode === 'PENDING') {
            return 'warning';
        } else {
            return 'info';
        }
    }
}
