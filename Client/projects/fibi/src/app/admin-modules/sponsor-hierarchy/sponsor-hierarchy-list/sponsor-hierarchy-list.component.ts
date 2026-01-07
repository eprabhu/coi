import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { SponsorHierarchyService } from '../sponsor-hierarchy.service';
import { SelectOrDeleteEvent, SponsorHierarchyList } from '../sponsor-hierarchy-interfaces';

declare var $: any;
@Component({
    selector: 'app-sponsor-hierarchy-list',
    templateUrl: './sponsor-hierarchy-list.component.html',
    styleUrls: ['./sponsor-hierarchy-list.component.css']
})
export class SponsorHierarchyListComponent implements OnInit {
    $subscriptions: Subscription[] = [];
    sponsorHierarchyList: Array<SponsorHierarchyList> = [];
    sponsorGroupId: number;
    selectedNode: SponsorHierarchyList;
    newSponsorHierarchy: string;
    createHierarchyValidationMap: Map<string, string> = new Map();

    constructor(private _sponsorService: SponsorHierarchyService) { }

    ngOnInit() {
        this.fetchSponsorHierarchyList();
        this.modifyEventListener();
    }

    fetchSponsorHierarchyList() {
        this.$subscriptions.push(this._sponsorService.sponsorHierarchies().subscribe((result: any) => {
            if (result.data.length > 0) {
                this.sponsorHierarchyList = result.data;
                this._sponsorService.sponsorHierarchyList = result.data;
                this._sponsorService.triggerEventWithGroupId('select', result.data[0].sponsorGroupId);
                this.selectedNode = result.data[0];
            }
        }));
    }

    getTreeList(sponsorGroupId) {
        this._sponsorService.triggerEventWithGroupId('select', sponsorGroupId);
        this.sponsorGroupId = sponsorGroupId;
    }

    modifyEventListener() {
        this._sponsorService.dataEvent.subscribe((event: SelectOrDeleteEvent) => {
            if (event === 'delete') {
                const index = this.sponsorHierarchyList.findIndex(ele => ele.sponsorGroupId === this._sponsorService.selectedGroupId);
                this.sponsorHierarchyList.splice(index, 1);
                if (this.sponsorHierarchyList[0]) {
                    this._sponsorService.triggerEventWithGroupId('select', this.sponsorHierarchyList[0].sponsorGroupId);
                }
                this.selectedNode = this.sponsorHierarchyList[0];
            } else if (event === 'update') {
                this.updateSponsorHierarchy(this._sponsorService.shObject);
            }
        });
    }

    updateSponsorHierarchy(sponsorHierarchy): void {
        const index = this.sponsorHierarchyList.findIndex(ele => ele.sponsorGroupId === sponsorHierarchy.sponsorGroupId);
        this.sponsorHierarchyList.splice(index, 1, sponsorHierarchy);
    }

    listClick(event, node): void {
        this.selectedNode = node;
        event.stopPropagation();
    }

    createSponsorHierarchy() {
        if (this.validateHierarchy()) {
            let orderNumber = 1;
            if (this._sponsorService.sponsorHierarchyList != null && this._sponsorService.sponsorHierarchyList.length > 0) {
                orderNumber = this._sponsorService.sponsorHierarchyList[0].orderNumber + 1;
            }
            const sponsorHierarchy = {
                'orderNumber': orderNumber,
                'sponsor': null,
                'sponsorCode': null,
                'sponsorGroupName': this.newSponsorHierarchy,
                'sponsorOriginatingGroupId': null,
                'sponsorRootGroupId': null
            };
            this.$subscriptions.push(this._sponsorService.createSponsorHierarchy(sponsorHierarchy).subscribe((result: any) => {
                this.sponsorHierarchyList.splice(0, 0, result.data);
                this._sponsorService.triggerEventWithGroupId('select', result.data.sponsorGroupId);
                this.selectedNode = result.data;
            }));
            this.newSponsorHierarchy = '';
            $('#create-hierarchy-modal').modal('hide');
        }
    }

    private validateHierarchy(): boolean {
        this.createHierarchyValidationMap.clear();
        if (!this.newSponsorHierarchy) {
            this.createHierarchyValidationMap.set('newSponsorHierarchy', 'Please enter a name for Sponsor Hierarchy');
        }
        return this.createHierarchyValidationMap.size === 0 ? true : false;
    }

    clearCreateNewHierarchy() {
        this.newSponsorHierarchy = '';
        this.createHierarchyValidationMap.clear();
    }
}
