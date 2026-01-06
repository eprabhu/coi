import { Component, Input, EventEmitter, OnInit, Output } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { PersonRolodexViewService } from './person-rolodex-view.service';
import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-person-rolodex-view',
    templateUrl: './person-rolodex-view.component.html',
    styleUrls: ['./person-rolodex-view.component.css']
})
export class PersonRolodexViewComponent implements OnInit {
    @Input() personRolodexType;
    @Input() personRolodexIsTraining;
    @Input() personRolodexPersonDescription;
    @Input() personRolodexId;
    @Input() personRolodexTrainingStatus;
    @Input() personRolodexIsDegree = false;
    @Input() personRolodexProposalPersonId = null;
    @Input() personRolodexIsViewMode = false;
    @Output() personRolodexViewModal: EventEmitter<any> = new EventEmitter<any>();

    $subscriptions: Subscription[] = [];
    selectedPersonDetails: any = {};
    personCertificationHistory = [];
    isTraining: false;
    personDescription: string;
    canViewTrainingDetails = false;
    isMaintainTraining = false;
    currentTab = 'PersonRolodexDetails';
    isMaintainPerson = false;
    headerName: string;
    deployMap = environment.deployUrl;

    constructor(public __rolodexViewServices: PersonRolodexViewService, public _commonService: CommonService, private _router: Router) { }

    async ngOnInit() {
        this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
        this.personDescription = this.personRolodexPersonDescription;
        this.isTraining = this.personRolodexIsTraining;
        this.fetchPersonRolodexDetails();
    }

    fetchPersonRolodexDetails(): void {
        if (this.personRolodexType === 'PERSON') {
            if (this.personRolodexId === this._commonService.getCurrentUserDetail('personID') || this.isMaintainPerson) {
                this.$subscriptions.push(this.__rolodexViewServices.getPersonData(this.personRolodexId).subscribe((data: any) => {
                    this.updateSelectedPersonDetails(data.person);
                    document.getElementById('app-view-non-employee-btn').click();
                }, _err => {
                    this.emitPersonRolodexResult();
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching person details failed. Please try again.');
                }));
            } else {
                this.$subscriptions.push(this.__rolodexViewServices.getPersonInformation(this.personRolodexId).subscribe((data: any) => {
                    this.updateSelectedPersonDetails(data);
                    document.getElementById('app-view-non-employee-btn').click();
                }, _err => {
                    this.emitPersonRolodexResult();
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching person details failed. Please try again.');
                }));
            }
        } else {
            this.$subscriptions.push(this.__rolodexViewServices.getRolodexData(this.personRolodexId).subscribe((data: any) => {
                this.updateSelectedPersonDetails(data.rolodex);
                this.selectedPersonDetails.organization = data.rolodex.organizations &&
                    data.rolodex.organizations.organizationName || data.rolodex.organizationName || null;
                document.getElementById('app-view-non-employee-btn').click();
            }, _err => {
                this.emitPersonRolodexResult();
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching person details failed. Please try again.');
            }));
        }
    }

    updateSelectedPersonDetails(selectedPersonDetails) {
        this.selectedPersonDetails = selectedPersonDetails;
        this.selectedPersonDetails.proposalPersonRole = this.personRolodexPersonDescription;
        this.selectedPersonDetails.trainingStatus = this.isTraining ? this.personRolodexTrainingStatus : null;
        this.getPersonHeader(selectedPersonDetails);
    }

    getPersonHeader(selectedPersonDetails) {
        if (selectedPersonDetails.fullName && selectedPersonDetails.rolodexId) {
            this.headerName = '<i class="mr-2 fa fa-user-circle text-danger" aria-hidden="true"></i>' + selectedPersonDetails.fullName;
        }
        if (selectedPersonDetails.fullName && selectedPersonDetails.personId) {
            this.headerName = '<i class="mr-2 fa fa-user-o" aria-hidden="true"></i>' + selectedPersonDetails.fullName;
        }
        if (this.personDescription && this.headerName) {
            this.headerName = this.headerName + ' (' + this.personDescription + ')';
        }
        if (selectedPersonDetails.organizations && selectedPersonDetails.organizations.organizationName) {
            this.headerName = this.headerName ? this.headerName + ' | ' +
                '<img src="' + this.deployMap + 'assets/images/org-icon-6.svg" class="mr-2 mb-2"></span>' +
                selectedPersonDetails.organizations.organizationName :
                '<img src="' + this.deployMap + 'assets/images/org-icon-6.svg" class="mr-2 mb-2"></span>' +
                selectedPersonDetails.organizations.organizationName;
        }
        if (!selectedPersonDetails.organizations && selectedPersonDetails.organizationName) {
            this.headerName = this.headerName ? this.headerName + ' | ' +
                '<img src="' + this.deployMap + 'assets/images/org-icon-6.svg" class="mr-2 mb-2"></span>' +
                selectedPersonDetails.organizationName :
                '<img src="' + this.deployMap + 'assets/images/org-icon-6.svg" class="mr-2 mb-2"></span>' +
                selectedPersonDetails.organizationName;
        }
    }

    emitPersonRolodexResult() {
        this.personRolodexViewModal.emit({ 'isPersonRolodexViewModal': false });
    }
}
