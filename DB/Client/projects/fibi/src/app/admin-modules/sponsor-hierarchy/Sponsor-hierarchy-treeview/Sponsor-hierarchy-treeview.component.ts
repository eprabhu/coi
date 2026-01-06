import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { getEndPointOptionsForSponsorGroup } from '../../../common/services/end-point.config';
import { SponsorHierarchyService } from '../sponsor-hierarchy.service';
import { SelectOrDeleteEvent, SponsorHierarchyList } from '../sponsor-hierarchy-interfaces';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';

declare var $: any;
@Component({
    selector: 'app-Sponsor-hierarchy-treeview',
    templateUrl: './Sponsor-hierarchy-treeview.component.html',
    styleUrls: ['./Sponsor-hierarchy-treeview.component.css']
})
export class SponsorHierarchyTreeviewComponent implements OnInit {

    helpInfo = true;
    sponsorSearchOptions: any = {};
    clearField: String;
    $subscriptions: Subscription[] = [];
    sponsorHierarchyList: Array<SponsorHierarchyList> = [];
    selectedNode: any = {};
    groupName: string;
    sponsorGroupId: number;
    isEditMode = false;
    editSponsorId: any;
    sponsorGroupName: string;
    deleteSponsorId: number;
    newSponsorHierarchy: string;
    rootSponsorGroupId: number;
    currentSelectedNode: SponsorHierarchyList;
    deleteValue: string;
    backRefSHNode: any;
    searchSponsorHierarchyList: any = [];
    shSearchOptions: any = {};
    errorMessage = '';
    closedNodes = [];
    tempChildSponsorHierarchies: any = [];
    sponsorSearchValidationMap: Map<string, string> = new Map();
    isSaving:boolean=false;

    constructor(private _sponsorService: SponsorHierarchyService, public _commonService: CommonService) { }

    ngOnInit() {
        this.getTreeDetails();
    }

    addNewSponsor(sponsor) {
        if (sponsor == null) {
            return;
        }
        if (this.currentSelectedNode.childSponsorHierarchies == null) {
            this.currentSelectedNode.childSponsorHierarchies = [];
        }
        let orderNumber = 1;
        if (this.currentSelectedNode.childSponsorHierarchies.length > 0) {
            orderNumber = this.currentSelectedNode.childSponsorHierarchies[0].orderNumber + 1;
        }
        this.sponsorSearchValidationMap.clear();
        const isSponsorExist = this.currentSelectedNode.childSponsorHierarchies.find(element =>
            element.sponsorCode === sponsor.sponsorCode) ? true : false;
        if (!isSponsorExist) {
            const tempObj: any = {
                'orderNumber': orderNumber,
                'sponsor': sponsor,
                'sponsorCode': sponsor.sponsorCode,
                'accType': 'I'
            };
            this.tempChildSponsorHierarchies.push(tempObj);
            this.currentSelectedNode.childSponsorHierarchies.splice(0, 0, tempObj);
            this.clearField = new String('true');
            this.sponsorSearchValidationMap.clear();
        } else {
            this.sponsorSearchValidationMap.set('newSponsor', 'Sponsor already exist');
            this.clearField = new String('true');
        }
    }

    getSponsorHierarchy(hierarchyId: number) {
        this.$subscriptions.push(this._sponsorService.sponsorHierarchy(hierarchyId)
            .subscribe((data: any) => {
                this.sponsorHierarchyList = [data.data];
                this.setValidationMessage(this.sponsorHierarchyList[0].emptyGroup);
                this.searchSponsorHierarchyList = [];
                this.prepareSearchSHList(this.sponsorHierarchyList);
                this.shSearchOptions.arrayList = this.searchSponsorHierarchyList;
                this.shSearchOptions.contextField = 'groupName';
                this.shSearchOptions.filterFields = 'groupName, sponsorCode, sponsorName, acronym';
                this.shSearchOptions.formatString = 'sponsorCode groupName type';
                this.clearField = new String('true');
            }));
    }

    prepareSearchSHList(sponsorHierarchyList) {
        for (let index = 0; index < sponsorHierarchyList.length; index++) {
            let spOrGroupName = '';
            let spAcronym = '';
            let spCode = '';
            let type;
            if (sponsorHierarchyList[index].sponsor != null) {
                spOrGroupName = sponsorHierarchyList[index].sponsor.sponsorName;
                spAcronym = sponsorHierarchyList[index].sponsor.acronym;
                spCode = sponsorHierarchyList[index].sponsorCode + ' :';
            } else {
                spCode = '';
                spOrGroupName = sponsorHierarchyList[index].sponsorGroupName;
                type = '<span class="badge badge-warning ml-2">Sponsor Group</span>';
            }
            this.searchSponsorHierarchyList.push({
                'sponsorCode': spCode,
                'acronym': spAcronym,
                'groupId': sponsorHierarchyList[index].sponsorGroupId,
                'groupName': spOrGroupName,
                'type': type
            });
            if (sponsorHierarchyList[index].childSponsorHierarchies != null) {
                this.prepareSearchSHList(sponsorHierarchyList[index].childSponsorHierarchies);
            }
        }
    }

    fetchSponsorHierarchy(sponsorHierarchy) {
        if (sponsorHierarchy) {
            this.selectedNode = sponsorHierarchy;
            this.closedNodes.forEach(node => node.visible = false);
            this.closedNodes = [];
            document.querySelectorAll('ul .d-none').forEach(hiddenUlTag => hiddenUlTag.classList.remove('d-none'));
            document.getElementById(sponsorHierarchy.groupId).scrollIntoView({ block: 'center' });
        } else {
            this.clearField = new String('true');
        }
    }

    toggleGroup(node) {
        node.visible = !node.visible;
        if (node.visible) {
            this.closedNodes.push(node);
        } else {
            this.closedNodes = this.closedNodes.filter(N => N.sponsorGroupId !== node.sponsorGroupId);
        }
    }

    getTreeDetails() {
        this._sponsorService.dataEvent.subscribe((event: SelectOrDeleteEvent) => {
            if (event === 'select') {
                this.rootSponsorGroupId = this._sponsorService.selectedGroupId;
                this.getSponsorHierarchy(this.rootSponsorGroupId);
            }
        });
    }

    listClick(event, node) {
        this.selectedNode = node;
        event.stopPropagation();
    }

    addGroup(node) {
        let orderNumber = 1;
        if (node.childSponsorHierarchies != null && node.childSponsorHierarchies.length > 0) {
            orderNumber = node.childSponsorHierarchies[0].orderNumber + 1;
        }
        const group = {
            'orderNumber': orderNumber,
            'sponsor': null,
            'sponsorCode': null,
            'sponsorGroupName': null,
            'sponsorOriginatingGroupId': node.sponsorGroupId,
            'isAddGroup': true,
            'sponsorRootGroupId': node.sponsorRootGroupId ? node.sponsorRootGroupId : node.sponsorGroupId,
            'emptyGroup': false
        };
        if (node.childSponsorHierarchies == null) {
            node.childSponsorHierarchies = [group];
        } else {
            node.childSponsorHierarchies.splice(0, 0, group);
        }
        this.sponsorGroupName = '';
        this.backRefSHNode = node;
    }

    addSponsorModal() {
        this.sponsorSearchValidationMap.clear();
        $('#addSponsorModal').modal('show');
    }

    updateSponsorHierarchy(node) {
        if (!this.isSaving) {
            this.isSaving = true;
            const sponsorHierarchy = Object.assign({}, node);
            sponsorHierarchy.sponsorGroupName = node.sponsorGroupName;
            sponsorHierarchy.childSponsorHierarchies = null;
            delete sponsorHierarchy.visible;
            delete sponsorHierarchy.isAddGroup;
            delete sponsorHierarchy.isEditMode;
            this.$subscriptions.push(this._sponsorService.updateSponsorHierarchy(sponsorHierarchy).subscribe((result: any) => {
                if (result.data.sponsorOriginatingGroupId == null) {
                    this._sponsorService.triggerEventWithGroupId('update', result.data.sponsorGroupId, result.data);
                    const index = this.searchSponsorHierarchyList.findIndex(e =>
                        e.groupId === sponsorHierarchy.sponsorGroupId);
                    this.searchSponsorHierarchyList[index].groupName = result.data.sponsorGroupName;
                } else if (sponsorHierarchy.sponsorGroupId == null) {
                    node.sponsorGroupId = result.data.sponsorGroupId;
                    this.updateSponsorHierarchyTraverse(result.data.sponsorOriginatingGroupId, this.sponsorHierarchyList);
                } else {
                    node.sponsorGroupName = result.data.sponsorGroupName;
                    node.sponsorGroupId = result.data.sponsorGroupId;
                    const index = this.searchSponsorHierarchyList.findIndex(nde =>
                        nde.groupId === sponsorHierarchy.sponsorGroupId);
                    this.searchSponsorHierarchyList[index].groupName = result.data.sponsorGroupName;
                }
                if (node.isAddGroup) {
                    const type = '<span class="badge badge-warning ml-2">Sponsor Group</span>';
                    this.searchSponsorHierarchyList.push({
                        'sponsorCode': '',
                        'acronym': '',
                        'groupId': result.data.sponsorGroupId,
                        'groupName': result.data.sponsorGroupName,
                        'type': type
                    });
                    node.emptyGroup = true;
                }
                this.setValidationMessage(result.data.emptyGroup);
                node.isAddGroup = false;
                node.isEditMode = false;
                this.isSaving = false;
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding to group failed. Please try again.');
                    this.isSaving = false;
                }));
        }
    }

    updateSponsorHierarchyTraverse(sponsorGroupId, sponsorHierarchyList) {
        for (let index = 0; index < sponsorHierarchyList.length; index++) {
            if (sponsorHierarchyList[index].sponsorGroupId === sponsorGroupId && sponsorHierarchyList[index].emptyGroup) {
                sponsorHierarchyList[index].emptyGroup = false;
            } else if (sponsorHierarchyList[index].childSponsorHierarchies != null) {
                this.updateSponsorHierarchyTraverse(sponsorGroupId, sponsorHierarchyList[index].childSponsorHierarchies);
            }
        }
    }

    deleteSponsorHierarchy(sponsorGroupId) {
        this.$subscriptions.push(this._sponsorService.deleteSponsorHierarchy(sponsorGroupId).subscribe((data: any) => {
            if (this.currentSelectedNode.sponsorOriginatingGroupId == null && this.currentSelectedNode.sponsorCode == null) {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Hierarchy deleted successfully.');
                this.setValidationMessage(false);
            }else if (this.currentSelectedNode.sponsorCode == null) {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Group deleted successfully.');
            } else {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Sponsor deleted successfully.');
            }
            if (sponsorGroupId === this.rootSponsorGroupId) {
                this._sponsorService.triggerEventWithGroupId('delete', this.rootSponsorGroupId);
            }
            const i = this.searchSponsorHierarchyList.findIndex(item =>
                item.groupId === sponsorGroupId);
            this.searchSponsorHierarchyList.splice(i, 1);
            this.deleteSponsorHierarchyTraverse(sponsorGroupId, this.sponsorHierarchyList, null);
        }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Sponsor from Hierarchy failed. Please try again.'); }));
    }

    deleteSponsorHierarchyTraverse(sponsorGroupId, sponsorHierarchyList, parentSponsorHierarchyObject) {
        for (let index = 0; index < sponsorHierarchyList.length; index++) {
            if (sponsorHierarchyList[index].sponsorGroupId === sponsorGroupId) {
                if (sponsorHierarchyList[index].childSponsorHierarchies != null) {
                    this.deleteSearchChildNodes(sponsorHierarchyList[index].childSponsorHierarchies);
                }
                sponsorHierarchyList.splice(index, 1);
                if (sponsorHierarchyList.length === 0
                    && parentSponsorHierarchyObject != null) {
                        parentSponsorHierarchyObject.emptyGroup = true;
                } else {
                    this.setValidationMessage(false);
                }
                return false;
            } else if (sponsorHierarchyList[index].childSponsorHierarchies != null) {
                this.deleteSponsorHierarchyTraverse(sponsorGroupId, sponsorHierarchyList[index].childSponsorHierarchies,
                    sponsorHierarchyList[index]);
            }
        }
    }

    deleteSearchChildNodes(sponsorHierarchyList) {
        for (let index = 0; index < sponsorHierarchyList.length; index++) {
            const i = this.searchSponsorHierarchyList.findIndex(item =>
                item.groupId === sponsorHierarchyList[index].sponsorGroupId);
            this.searchSponsorHierarchyList.splice(i, 1);
            if (sponsorHierarchyList[index].childSponsorHierarchies != null) {
                this.deleteSearchChildNodes(sponsorHierarchyList[index].childSponsorHierarchies);
            }
        }
    }

    deleteHierarchyModal(data) {
        this.deleteSponsorId = data.sponsorGroupId;
        if (data.sponsorCode != null) {
            this.deleteValue = data.sponsor.sponsorName;
        } else {
            this.deleteValue = data.sponsorGroupName;
        }
        this.currentSelectedNode = data;
        $('#hierarchy-delete-modal').modal('show');
    }

    modifySponsor(node) {
        this.sponsorSearchValidationMap.clear();
        this.backRefSHNode = node;
        this.currentSelectedNode = JSON.parse(JSON.stringify(node));
        this.tempChildSponsorHierarchies = [];
        $('#addSponsorModal').modal('show');
        this.sponsorSearchOptions = getEndPointOptionsForSponsorGroup({ rootGroupId: this.currentSelectedNode.sponsorRootGroupId });
    }

    updateOrAddSponsor() {
        if (!this.isSaving) {
            this.isSaving = true;
            const noChildSponsorPresent = (this.currentSelectedNode.childSponsorHierarchies == null ||
                this.currentSelectedNode.childSponsorHierarchies.length === 0) && this.tempChildSponsorHierarchies.length < 1;
            if (noChildSponsorPresent) {
                this.sponsorSearchValidationMap.clear();
                this.sponsorSearchValidationMap.set('newSponsor', 'Please select a sponsor');
                return;
            }
            delete this.currentSelectedNode.visible;
            delete this.currentSelectedNode.isAddGroup;
            delete this.currentSelectedNode.isEditMode;
            this.currentSelectedNode.childSponsorHierarchies = this.tempChildSponsorHierarchies;
            this.$subscriptions.push(this._sponsorService.updateSponsorHierarchy(this.currentSelectedNode).subscribe((data: any) => {
                for (let index = 0; index < data.data.childSponsorHierarchies.length; index++) {
                    if (data.data.childSponsorHierarchies[index].accType === 'I') {
                        if (this.backRefSHNode.childSponsorHierarchies == null) {
                            this.backRefSHNode.childSponsorHierarchies = [];
                        }
                        this.backRefSHNode.childSponsorHierarchies.push(data.data.childSponsorHierarchies[index]);
                        this.searchSponsorHierarchyList.push({
                            'sponsorCode': data.data.childSponsorHierarchies[index].sponsorCode,
                            'acronym': data.data.childSponsorHierarchies[index].sponsor.acronym + ' :',
                            'groupId': data.data.childSponsorHierarchies[index].sponsorGroupId,
                            'groupName': data.data.childSponsorHierarchies[index].sponsor.sponsorName,
                            'type': ''
                        });
                    } else if (data.data.childSponsorHierarchies[index].accType === 'D') {
                        let i = this.backRefSHNode.childSponsorHierarchies.findIndex(nde =>
                            nde.sponsorGroupId === data.data.childSponsorHierarchies[index].sponsorGroupId);
                        this.backRefSHNode.childSponsorHierarchies.splice(i, 1);
                        i = this.searchSponsorHierarchyList.findIndex(item =>
                            item.groupId === data.data.childSponsorHierarchies[index].sponsorGroupId);
                        this.searchSponsorHierarchyList.splice(i, 1);
                    }
                }
                if (this.backRefSHNode.childSponsorHierarchies.length > 0 && this.backRefSHNode.emptyGroup) {
                    this.backRefSHNode.emptyGroup = false;
                } else if (this.backRefSHNode.childSponsorHierarchies.length < 1 && !this.backRefSHNode.emptyGroup) {
                    this.backRefSHNode.emptyGroup = true;
                }
                this.setValidationMessage(data.emptyGroup);
                $('#addSponsorModal').modal('hide');
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Sponsor updated successfully.');
                this.isSaving = false;
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Add Sponsor to Hierarchy failed. Please try again.');
                    this.isSaving = false;
                }));

        }
    }

    removeSponsor(node, index) {
        this.currentSelectedNode.childSponsorHierarchies.splice(index, 1);
        if (node.sponsorGroupId) {
            const tempObj = {
                'accType': 'D',
                'sponsorGroupId': node.sponsorGroupId
            };
            this.tempChildSponsorHierarchies.push(tempObj);
        } else {
            index = this.tempChildSponsorHierarchies.findIndex(tempObj => tempObj.sponsorCode === node.sponsorCode);
            this.tempChildSponsorHierarchies.splice(index, 1);
        }
    }

    setValidationMessage(emptyGroup: boolean) {
        this.errorMessage = emptyGroup ? 'You must have at least one sponsor or subgroup in each group' : '';
    }

    cancelGroupEntry(node) {
        if (node.isAddGroup) {
            for (let index = 0; index < this.backRefSHNode.childSponsorHierarchies.length; index++) {
                if (this.backRefSHNode.childSponsorHierarchies[index].sponsorGroupId == null &&
                    this.backRefSHNode.childSponsorHierarchies[index].orderNumber === node.orderNumber) {
                    this.backRefSHNode.childSponsorHierarchies.splice(index, 1);
                    return;
                }
            }
        } else if (node.isEditMode) {
            node.isEditMode = false;
            node.sponsorGroupName = this.sponsorGroupName;
        }
    }

    isEmptyGroupCheck(node) {
        if (node.emptyGroup) {
            this.setValidationMessage(node.emptyGroup);
            return true;
        }
        return false;
    }

}
