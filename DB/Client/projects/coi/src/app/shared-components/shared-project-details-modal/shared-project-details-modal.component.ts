import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { DisclosureProjectModalData } from '../shared-interface';
import { HttpClient } from '@angular/common/http';
import { HTTP_ERROR_STATUS, PROJECT_DETAILS_ORDER, PROJECT_DETAILS_ORDER_WITHOUT_ROLE, URL_FOR_DISCLOSURE_PROJECT } from '../../app-constants';
import { getFormattedSponsor } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-shared-project-details-modal',
    templateUrl: './shared-project-details-modal.component.html',
    styleUrls: ['./shared-project-details-modal.component.scss']
})
export class SharedProjectDetailsModalComponent implements OnInit, OnDestroy {

    sponsor = '';
    leadUnit = '';
    primeSponsor = '';
    $subscriptions = [];
    projectDetailsOrder = {};

    @Input() selectedProject: DisclosureProjectModalData = new DisclosureProjectModalData();

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.commonService.closeProjectDetailsModal(false);
        }
    }

    constructor(public commonService: CommonService, private _http: HttpClient) { }

    ngOnInit(): void {
        if (this.selectedProject.projectDetails?.projectId) {
            this.setModalData()
            document.getElementById('coi-project-view-modal-trigger-btn')?.click();
        } else {
            this.getProjectDetails();
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private setModalData(): void {
        this.sponsor = getFormattedSponsor(this.selectedProject?.projectDetails?.sponsorCode, this.selectedProject?.projectDetails?.sponsorName);
        this.leadUnit = this.commonService.getPersonLeadUnitDetails(this.selectedProject?.projectDetails);
        this.primeSponsor = getFormattedSponsor(this.selectedProject?.projectDetails?.primeSponsorCode, this.selectedProject?.projectDetails?.primeSponsorName);
        this.projectDetailsOrder = this.selectedProject?.needReporterRole ? PROJECT_DETAILS_ORDER : PROJECT_DETAILS_ORDER_WITHOUT_ROLE;
    }

    private getDisclosureProjects(disclosureId: number) {
        return this._http.get(this.commonService.baseUrl + URL_FOR_DISCLOSURE_PROJECT.replace('{disclosureId}', disclosureId.toString()));
    }

    private getProjectDetails(): void {
        this.$subscriptions.push(this.getDisclosureProjects(this.selectedProject.coiDisclosureId)
            .subscribe((res: any) => {
                if (res[0]) {
                    this.selectedProject.projectDetails = res[0];
                    this.setModalData();
                    document.getElementById('coi-project-view-modal-trigger-btn')?.click();
                } else {
                    this.clearModalDataAndShowToast();
                }
            }, (_error: any) => {
                this.clearModalDataAndShowToast();
            }
        ));
    }

    private clearModalDataAndShowToast(): void {
        this.commonService.projectDetailsModalInfo = new DisclosureProjectModalData();
        this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please try again.');
    }

    redirectToProjectDetails() {
        this.commonService.closeProjectDetailsModal(true);
        const { documentNumber, projectId, projectTypeCode } = this.selectedProject?.projectDetails || {};
        this.commonService.redirectToProjectDetails(projectTypeCode, (documentNumber || projectId));
    }

}
