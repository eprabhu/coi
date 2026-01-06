/* Last updated by Mahesh Sreenath V M  on 28-02-20201 */
import { Component, OnInit, OnDestroy } from '@angular/core';

import { SearchService } from './search.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CodeTableJson, CodeTableItem } from '../codetable-interface';

/**
 * revamped by Mahesh Sreenath V M
 * the code comments are purposefully removed you can find the basic details from here.
 * https://docs.google.com/document/d/1kmpsKZxQBqRBHsBQpNzHv0BbGtO2ZP8X6j795kojN1w/edit
 * this document include the work flow and how this code is organized.
 * if further clarifications are required contact @ mahesh.sreenth@polussoftware.com
 */
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit, OnDestroy {
    codeTableProperty: any = {};
    tableProperty: CodeTableJson;
    checkedList: any = {};
    codeTableValues: any = [];
    groupNames: any = [];
    currentTab: string;
    codeTableLength: number;
    selectedTableIndex: number;
    isCollapse = false;
    helpInfo = false;
    completerSearchOptions: any = {};
    $subscriptions: Subscription[] = [];
    clearField;
    codeTableList: CodeTableItem[] = [];

    constructor(private _tableService: SearchService) { }

    ngOnInit() {
        this.$subscriptions.push(this._tableService.getTableProperties()
            .subscribe((data: CodeTableJson) => {
                this.tableProperty = data;
                this.groupNames = this.getDistinctGroupNames();
                this.currentTab = this.groupNames[0];
                this.completerSearchOptions.arrayList = this.tableProperty.codeTableConfigurations;
                this.completerSearchOptions.contextField = 'displayName';
                this.completerSearchOptions.filterFields = 'group,displayName';
                this.completerSearchOptions.formatString = 'displayName';
                this.codeTableList = this.getCodeTableList(this.currentTab);
            }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setCurrentTab(groupName: string): void {
        this.currentTab = groupName
        this.setSelectedTableIndex(-1);
        this.codeTableList = this.getCodeTableList(this.currentTab);
    }

    getCodeTableList(groupName: any): CodeTableItem[] {
        if (groupName !== undefined) {
            const list = this.tableProperty.codeTableConfigurations.filter(table => table.groupName === groupName);
            list.sort((a, b) => {
                return a.tableName.toLowerCase() > b.tableName.toLowerCase() ? 1 :
                    a.tableName.toLowerCase() < b.tableName.toLowerCase() ? -1 : 0
            });
            return list;
        }
    }
    getDistinctGroupNames(): Array<string> {
        let list = [];
        list = this.tableProperty.codeTableConfigurations.map((table: CodeTableItem) => table.groupName);
        list = Array.from(new Set(list)).sort();
        return list;
    }

    /**
     * @param  {} tableName
     * filter out properties of searched table selected from search dropdown in the top.
     * when a table name is selcted from the dropdown collapses the codetable name list which shows under radio button list.
     */
    getSearchedTable(tableDetails: CodeTableItem): any {
        if (tableDetails != null) {
            this.setCurrentTab(tableDetails.groupName);
            const codeTableList = this.getCodeTableList(tableDetails.groupName);
            const ID = codeTableList.findIndex(item => item.tableName === tableDetails.tableName);
            this.getSelectedTable(tableDetails.groupName, tableDetails.tableName, ID);
        }
    }

    getSelectedTable(modulename: string, tableName: string, index: number) {
        this.clearField = new String('true');
        this.codeTableProperty = {};
        this.codeTableProperty = this.tableProperty.codeTableConfigurations.filter(fieldList => (
            (modulename === fieldList.groupName) && (tableName === fieldList.tableName)))[0];
        this.setSelectedTableIndex(index);
    }

    setSelectedTableIndex(id: number) {
        this.selectedTableIndex = id;
    }
}
