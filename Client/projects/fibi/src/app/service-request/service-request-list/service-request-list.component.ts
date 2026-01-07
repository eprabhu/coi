import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { getEndPointOptionsForDepartment } from '../../common/services/end-point.config';
import { fileDownloader, openInNewTab, pageScroll } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { AdvanceSearch, ServiceRequestList } from './service-request-list.interface';
import { ServiceRequestListService } from './service-request-list.service';
import { concatUnitNumberAndUnitName } from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-service-request-list',
    templateUrl: './service-request-list.component.html',
    styleUrls: ['./service-request-list.component.css']
})
export class ServiceRequestListComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    $dashboardList = new Subject();

    statusOptions = 'SR_STATUS#STATUS_CODE#true#true';
    priorityOptions = 'SR_PRIORITY#PRIORITY_ID#true#true';
    typeOptions = 'SR_TYPE#TYPE_CODE#true#true';
    categoryOptions = 'COEUS_MODULE#MODULE_CODE#true#true';
    lookupValues: any = [];

    departmentSearchOptions: any = {};
    clearFieldLeadUnit: String;

    serviceRequestDashboard: ServiceRequestList = new ServiceRequestList();
    serviceRequestTab: string;
    isShowRequestList = true;
    isShowSearchList = false;
    advanceSearch = new AdvanceSearch();
    sortMap: any = {};
    sortCountObj: any = {};
    canCreateServiceRequest = false;
    canViewAllReviewTabs = false;
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

    constructor(
        public _serviceRequestListService: ServiceRequestListService,
        private _commonService: CommonService,
        private _router: Router
    ) { }

    ngOnInit() {
        this.setSearchOptions();
        if (this._serviceRequestListService.advanceSearchBackup) {
            this.advanceSearch = JSON.parse(JSON.stringify(this._serviceRequestListService.advanceSearchBackup));
        }
        this.showAdvancedSearch();
        this.loadDashboard();
        this.setDashboardTab();
        this.getPermissions();
        if (this.advanceSearch.tabName === 'ALL_REQUEST') {
            document.getElementById('collapseAdvanceSearch').classList.add('show');
            this.isShowSearchList = false;
        } else {
            this.isShowSearchList = true;
            document.getElementById('collapseAdvanceSearch').classList.remove('show');
        }
        if (this.advanceSearch.tabName !== 'ALL_REQUEST' || this.advanceSearch.advancedSearch === 'A') {
            this.searchServiceRequest();
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setSearchOptions() {
        this.departmentSearchOptions = getEndPointOptionsForDepartment();
    }

    async getPermissions(): Promise<void> {
        this.canCreateServiceRequest = await this._commonService.checkPermissionAllowed('CREATE_SERVICE_REQUEST');
        this.canViewAllReviewTabs = await this._commonService.checkPermissionAllowed('VIEW_ASSIGMENT_GROUP_SERVICE_REQUEST') ||
            await this._commonService.checkPermissionAllowed('SERVICE_REQUEST_ADMINISTRATOR');
    }

    setDashboardTab(): void {
        const TAB_NAME = !sessionStorage.getItem('currentServiceRequestTab')
            ? 'MY_REQUEST' : sessionStorage.getItem('currentServiceRequestTab');
        if (!sessionStorage.getItem('currentServiceRequestTab')) {
            this.clearServiceRequest();
        }
        this.setCurrentTabValues(TAB_NAME);

    }


    setCurrentTabValues(tabName: string): void {
        this.advanceSearch.tabName = tabName;
        sessionStorage.setItem('currentServiceRequestTab', tabName);
        this.serviceRequestDashboard.serviceRequestList = [];
        if (tabName !== 'ALL_REQUEST' || (tabName === 'ALL_REQUEST' && this._serviceRequestListService.isAdvanceSearchMade === false )) {
            this.$dashboardList.next();
            this.showAdvancedSearch();
        }
    }

    setCurrentTab(tabName: string): void {
        this._serviceRequestListService.isAdvanceSearchMade = tabName === 'ALL_REQUEST' ? true : false;
        document.getElementById('collapseAdvanceSearch').classList.remove('show');
        this.showAdvancedSearch();
        this.resetSortObject();
        this.setCurrentTabValues(tabName);
    }


    showAdvancedSearch(): void {
        if (this._serviceRequestListService.isAdvanceSearchMade) {
            document.getElementById('collapseAdvanceSearch').classList.add('show');
            this.setDefaultValueForCustomLibrarySearch();
            this.generateLookupArrayForDropdown();
        } else {
            document.getElementById('collapseAdvanceSearch').classList.remove('show');
        }
    }


    /* Setting default value for end-point, elastic search, so to display in UI. */
    setDefaultValueForCustomLibrarySearch() {
        this.departmentSearchOptions.defaultValue = this.advanceSearch.unitName;

    }

    generateLookupArrayForDropdown() {
        if (this.advanceSearch.srPriorities.length) {
            this.generateLookupArray(this.advanceSearch.srPriorities, 'srPriorities');
        }
        if (this.advanceSearch.srStatusCodes.length) {
            this.generateLookupArray(this.advanceSearch.srStatusCodes, 'srStatusCodes');
        }
        if (this.advanceSearch.moduleCodes.length) {
            this.generateLookupArray(this.advanceSearch.moduleCodes, 'moduleCodes');
        }
        if (this.advanceSearch.srTypeCodes.length) {
            this.generateLookupArray(this.advanceSearch.srTypeCodes, 'srTypeCodes');
        }
    }

    generateLookupArray(property, propertyNumber) {
        this.lookupValues[propertyNumber] = [];
        property.forEach(element => {
            this.lookupValues[propertyNumber].push({ code: element });
        });
    }
    /**
     * @param  {} data
     * @param  {} template
     * to get the values of the lookups in advanced search which returns string value
     */
    onLookupSelect(data, template: string): void {
        this.lookupValues[template] = data;
        this.advanceSearch[template] = data.length ? data.map(d => d.code) : [];
    }

    loadDashboard(): void {
        this.$subscriptions.push(this.$dashboardList.pipe(
            switchMap(() => this._serviceRequestListService.loadServiceRequestDashBoard(this.getPreparedObj())))
            .subscribe((data: any) => {
                this.serviceRequestDashboard = data;
            }, err => {
                this.showErrorMessage('Error occurred while fetching dashboard data. Please try again.');
            }));
    }

    getPreparedObj() {
        const {unitName, ...rest} = this.advanceSearch;
        return {...rest};
    }

    createNewServiceRequest(): void {
        this._serviceRequestListService.advanceSearchBackup = JSON.parse(JSON.stringify(this.advanceSearch));
        this._router.navigate(['fibi/service-request']);
    }

    viewServiceRequestById(serviceRequestId): void {
        this._serviceRequestListService.advanceSearchBackup = JSON.parse(JSON.stringify(this.advanceSearch));
        openInNewTab('service-request?', ['serviceRequestId'], [serviceRequestId]);
    }

    searchServiceRequest(): void {
        this.advanceSearch.advancedSearch = 'A';
        this._serviceRequestListService.isAdvanceSearchMade = true;
        this.$dashboardList.next();
        // if (this.advanceSearch.serviceRequestId !== null || this.advanceSearch.serviceRequestId !== '') {
        //     this.isShowSearchList = true;
        // }
        this.isShowSearchList = true;
    }

    clearServiceRequest(): void {
        this.advanceSearch = new AdvanceSearch(this.advanceSearch.tabName);
        this.advanceSearch.advancedSearch = 'L';
        this.clearFieldLeadUnit = new String('true');
        this._serviceRequestListService.isAdvanceSearchMade = false;
        this.lookupValues = [];
    }

    sortResult(sortFieldBy: string): void {
        if (!this.sortCountObj.hasOwnProperty(sortFieldBy)) {
            this.sortCountObj[sortFieldBy] = 0;
        }
        this.sortCountObj[sortFieldBy]++;
        this.advanceSearch.sortBy = sortFieldBy;
        if (this.sortCountObj[sortFieldBy] < 3) {
            this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.sortMap[sortFieldBy];
        }
        this.advanceSearch.sort = this.sortMap;
        this._serviceRequestListService.sortCountObj = this.sortCountObj;
        this.$dashboardList.next();
    }

    resetSortObject() {
        this.sortCountObj = {};
        this.sortMap = {};
    }

    actionsOnPageChange(event): void {
        this.advanceSearch.currentPage = event;
        this.$dashboardList.next();
        pageScroll('pageScrollToTop');
    }

    selectDepartment(event): void {
        this.advanceSearch.unitName = event ? event.unitName : null;
        this.advanceSearch.unitNumber = event ? event.unitNumber : null;
    }

    exportServiceRequestList(printType: string): void {
        const exportData = this.setPrintHeader(printType);
        this.$subscriptions.push(
            this._serviceRequestListService.exportServiceRequestDashBoard(exportData).subscribe(
                (data: any) => {
                    let fileName = '';
                    fileName = exportData.documentHeading;
                    fileDownloader(data.body, fileName, exportData.exportType);
                }, err => {
                    this.showErrorMessage('Error occurred while exporting. Please try again.');
                }));
    }

    setPrintHeader(printType: string) {
        return {
            ...this.advanceSearch,
            documentHeading: this.getDocumentHeading(),
            exportType: this.getExportType(printType)
        };
    }

    getDocumentHeading(): string {
        switch (this.advanceSearch.tabName) {
            case 'MY_REQUEST': return 'My Service Requests';
            case 'ALL_REQUEST': return 'List of all Service Requests';
            case 'ALL_PENDING_SERVICE_REQUEST': return 'All Pending Service Requests';
            case 'NEW_SUBMISSIONS': return 'New Service Requests';
            case 'MY_PENDING_SERVICE_REQUEST': return 'Service Requests Pending My Review';
            default: return 'Service Requests';
        }
    }

    getExportType(printType: string): string {
        return printType === 'excel' ? 'xlsx' : 'pdf';
    }

    private showErrorMessage(message: string): void {
        this._commonService.showToast(HTTP_ERROR_STATUS, message);
    }

}
