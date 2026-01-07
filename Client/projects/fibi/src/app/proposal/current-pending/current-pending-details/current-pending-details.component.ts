import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { fileDownloader, openInNewTab, scrollIntoView } from '../../../common/utilities/custom-utilities';
import { CommonService } from '../../../common/services/common.service';
import { ProposalService } from '../../services/proposal.service';
import { CurrentPendingService } from '../current-pending.service';
import { PersonEventInteractionService } from '../person-event-interaction.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { fadeDown } from '../../../common/utilities/animations';
import { getDateObjectFromTimeStamp } from '../../../common/utilities/date-utilities';
import { setHelpTextForSubItems } from '../../../common/utilities/custom-utilities';
declare var $: any;

@Component({
    selector: 'app-current-pending-details',
    templateUrl: './current-pending-details.component.html',
    styleUrls: ['./current-pending-details.component.css'],
    animations: [fadeDown]
})
export class CurrentPendingDetailsComponent implements OnInit, OnDestroy {
    isPersonViewData = [];
    $subscriptions: Subscription[] = [];
    isPersonWidgetVisible = false;
    isCurrentViewVisible = [];
    isPendingViewVisible = [];
    currentAdditionalDetailsVisible = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    pendingAdditionalDetailsVisible = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    currentAndPendingDetails: any = {};
    @Output() selected: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() personDetails: any = {};
    tempPersonDetails: any = {};
    proposalId: any;
    sponsorObject: any = {};
    personIndex: any = null;
    editIndex: any = null;
    deleteSponsorId: any;
    deleteIndex: any;
    linkedModuleCode: any;
    helpText: any = {};
    scrollIntoView = scrollIntoView;

    constructor(public _eventService: PersonEventInteractionService, public _commonService: CommonService,
        private _activatedRoute: ActivatedRoute, private _cpService: CurrentPendingService,
        public _proposalService: ProposalService) { }

    ngOnInit() {
        this.getPersonList();
        this.getPersonWidgetVisibility();
        this.proposalId = this._activatedRoute.snapshot.queryParamMap.get('proposalId');
        this.fetchHelpText();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /**
* Get help texts for Current and Pending codes 308.
*/
    fetchHelpText() {
        this.$subscriptions.push(this._proposalService.fetchHelpText({
            'moduleCode': 3, 'sectionCodes': [308]
        }).subscribe((data: any) => {
            this.helpText = data;
            if (Object.keys(this.helpText).length && this.helpText.currentAndPending && this.helpText.currentAndPending.parentHelpTexts.length) {
                this.helpText = setHelpTextForSubItems(this.helpText, 'currentAndPending');
            }
        }));
    }



    getPersonList() {
        this.$subscriptions.push(this._eventService.$personList.subscribe(data => {
            this._commonService.isManualLoaderOn = true;
            data.length ? this.fetchCurrentAndPendingDetails(data) : this.fetchGeneratedList(data);
        }));
    }

    preparePersonObject(personDetails) {
        Object.assign(this.tempPersonDetails, {
            personId: personDetails.personId,
            isGenerated: personDetails.isGenerated,
            nonEmployeeFlag: personDetails.nonEmployeeFlag,
            personName: personDetails.personName,
            roleName: personDetails.roleName
        });
    }

    setRequestObject(list) {
        return {
            'loginPersonId': this._commonService.getCurrentUserDetail('personID'),
            'moduleCode': 3,
            'moduleItemKey': this._activatedRoute.snapshot.queryParamMap.get('proposalId'),
            'createUser': this._commonService.getCurrentUserDetail('userName'),
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'selectedPersonIds': this.getSelectedPersonsIdList(list)
        };
    }

    private getSelectedPersonsIdList(persons): string[] {
        const personIdList = [];
        persons.forEach(person => {
            personIdList.push(person.personId);
        });
        return personIdList;
    }

    fetchGeneratedList(list) {
        this._cpService.getCurrentAndPendingList(this.setRequestObject(list)).subscribe((data: any) => {
            this.currentAndPendingDetails = data;
            this.closeLoader();
        }, err => {
            this.closeLoader();
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Report failed. Please try again.');
        });
    }

    fetchCurrentAndPendingDetails(list) {
        this._eventService.$isGenerateOptionEnable.next(false);
        this._cpService.fetchCurrentAndPendingDetails(this.setRequestObject(list)).subscribe((data: any) => {
            if (data) {
                this.currentAndPendingDetails = data;
                this.closeLoader();
                this.selected.emit(true);
                this.tempPersonDetails = {};
                this.clearVisibleFlag();
                this.isPersonViewData = [];
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Report generated successfully.');
            }
        }, err => {
            this.closeLoader();
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Generating Report failed. Please try again.');
        });
    }

    closeLoader() {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
        this._eventService.$isGenerateOptionEnable.next(true);
    }

    getPersonWidgetVisibility() {
        this.$subscriptions.push(this._eventService.$isPersonWidgetVisible.subscribe(data => {
            this.isPersonWidgetVisible = data;
        }));
    }

    excludeCurrentAndPending(details, isExcluded, moduleName, moduleId) {
        const requestObject = {
            'cpReportHeaderId': details.cpReportHeaderId,
            'cpReportProjectDetailId': details.cpReportProjectDetailId,
            'isExcluded': isExcluded,
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
        };
        this._cpService.excludeCurrentAndPendingDetails(requestObject).subscribe((data: any) => {
            details.isExcluded = isExcluded;
            this._commonService.showToast(HTTP_SUCCESS_STATUS, this.getToastMessage(isExcluded, moduleName, moduleId));
        }, err => {
            details.isExcluded = !isExcluded;
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Record failed. Please try again.');
        });
    }

    getToastMessage(isExcluded, moduleName, moduleId) {
        return isExcluded ? moduleName + ' - ' + moduleId + ' is excluded from the report'
            : moduleName + ' - ' + moduleId + ' is included to the report';
    }

    toggleToolkitVisibility() {
        this.isPersonWidgetVisible = !this.isPersonWidgetVisible;
        this._eventService.$isPersonWidgetVisible.next(this.isPersonWidgetVisible);
    }

    viewProposalById(proposalId) {
        localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
        openInNewTab('proposal?', ['proposalId'], [proposalId]);
    }

    hideCurrentAdditionalDetails(personIndex, currentIndex) {
        const currentFlag = this.currentAdditionalDetailsVisible[personIndex][currentIndex];
        this.clearVisibleFlag();
        this.currentAdditionalDetailsVisible[personIndex][currentIndex] = !currentFlag;
    }

    hidePendingAdditionalDetails(personIndex, pendingIndex) {
        const pendingFlag = this.pendingAdditionalDetailsVisible[personIndex][pendingIndex];
        this.clearVisibleFlag();
        this.pendingAdditionalDetailsVisible[personIndex][pendingIndex] = !pendingFlag;
    }

    clearVisibleFlag() {
        this.isCurrentViewVisible = [];
        this.isPendingViewVisible = [];
        this.currentAdditionalDetailsVisible = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        this.pendingAdditionalDetailsVisible = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    }

    checkIncludeList(details) {
        if (details) { return details.find(e => !e.isExcluded) ? true : false; }
    }

    exportCurrentAndPendingDetails(details) {
        this.$subscriptions.push(this._cpService.exportCurrentAndPendingDetails(details.personId)
            .subscribe(data => {
                fileDownloader(data, this.setExportFileName(details), 'pdf');
            }));
    }

    exportAllCurrentAndPendingDetails() {
        this.$subscriptions.push(this._cpService.exportAllCurrentAndPendingDetails().subscribe(data => {
            fileDownloader(data, this.setExportFileName(), 'pdf');
        }));
    }

    setExportFileName(details = null) {
        const fileName = this.proposalId + '_CurrentAndPendingReport';
        return details ? details.personName + '_' + fileName : fileName;
    }

    setExternalObject(details, personIndex) {
        this.personIndex = personIndex;
        this.sponsorObject = this.setSponsorObjectToDefault();
        this.sponsorObject.cpReportHeader = details.cpReportHeader;
        $('#addExternalProjectsModal').modal('show');
    }

    /**
     * isExcluded is set to false to make it included in C&P
     * isManuallyAdded is set to true to indicate external project
     */
    setSponsorObjectToDefault() {
        return {
            fundingStatusCode: null,
            sponsorTypeCode: null,
            currencyCode: null,
            currency: null,
            personRoleId: null,
            isExcluded: false,
            linkedModuleCode: '1',
            totalAwardAmount: 0,
            isManuallyAdded: true,
        };
    }
    /**
     * @param  {} details
     * @param  {} personIndex
     * @param  {} currentIndex
     * Project details is double parsed to avoid change inside the table while editing sponsor details
     */

    editExternalDetails(details, personIndex, currentIndex) {
        this.personIndex = personIndex;
        this.editIndex = currentIndex;
        this.setSponsorObjectToDefault();
        this.sponsorObject = JSON.parse(JSON.stringify(this.prepareExternalObject(details)));
        $('#addExternalProjectsModal').modal('show');
    }

    viewExternalDetails(details) {
        this.sponsorObject = {};
        this.sponsorObject = details;
        $('#viewExternalProjectsModal').modal('show');
    }

    /**
     * @param  {} details
     * if Type = 'I' Inserting the external details to the existing list w.r.t the external type
     * else Type = 'U' Updating the existing External Details
     */
    updateExternalDetails(details) {
        this.linkedModuleCode = details.result.externalProjectDetail.linkedModuleCode;
        if (details.type === 'I') {
            this.currentAndPendingDetails.selectedPersons[this.personIndex][this.getExternalType(this.linkedModuleCode)]
                .push(details.result.externalProjectDetail);
            this.scrollToView(details);
        } else {
            this.currentAndPendingDetails.selectedPersons[this.personIndex][this.getExternalType(this.linkedModuleCode)]
                .splice(this.editIndex, 1, details.result.externalProjectDetail);
        }
    }

    scrollToView(details) {
        setTimeout(() => {
            scrollIntoView(details.result.externalProjectDetail.cpReportProjectDetailId);
        }, 1000);
    }

    getExternalType(linkedModuleCode) {
        return linkedModuleCode === 1 ? 'currentAwards' : 'pendingProposals';
    }

    /**
     * Dates are converted to date Object so that it can be bind in datePicker
     */
    prepareExternalObject(details) {
        return {
            title: details.title,
            startDate: getDateObjectFromTimeStamp(details.startDate),
            endDate: getDateObjectFromTimeStamp(details.endDate),
            sponsorCode: details.sponsorCode,
            percentageEffort: details.percentageEffort,
            totalAwardAmount: details.totalAwardAmount,
            isExcluded: details.isExcluded,
            cpReportProjectDetailId: details.cpReportProjectDetailId,
            cpReportHeader: this.currentAndPendingDetails.selectedPersons[this.personIndex].cpReportHeader,
            personRoleId: details.personRoleId,
            isManuallyAdded: details.isManuallyAdded,
            grantCallName: details.grantCallName,
            currencyCode: details.currencyCode,
            sponsorTypeCode: details.sponsorTypeCode,
            sponsor: details.sponsor,
            sponsorName: details.sponsor ? details.sponsor.sponsorName : null,
            fundingStatusCode: details.fundingStatusCode,
            linkedModuleCode: details.linkedModuleCode,
        };
    }

    setDeleteIndex(details, personIndex, deleteIndex) {
        this.deleteSponsorId = details.cpReportProjectDetailId;
        this.personIndex = personIndex;
        this.deleteIndex = deleteIndex;
        this.linkedModuleCode = details.linkedModuleCode;
    }

    deleteSponsor() {
        this.$subscriptions.push(this._cpService.deleteProposalSponsor({
            'cpReportProjectDetailId': this.deleteSponsorId
        }).subscribe((data: any) => {
            this.currentAndPendingDetails.selectedPersons[this.personIndex]
            [this.getExternalType(this.linkedModuleCode)].splice(this.deleteIndex, 1);
        },
            err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing External Funding Support failed. Please try again.');
            },
            () => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'External Funding Support deleted successfully.');
            }));
    }
}
