import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HierarchyProjectDetails, HierarchyProjectTree, ProjectHierarchySliderPayload } from './services/project-hierarchy-slider.interface';
import { ProjectHierarchySliderService } from './services/project-hierarchy-slider.service';
import { getFormattedSponsor, openCoiSlider } from '../../common/utilities/custom-utilities';
import { deepCloneObject } from '../../../../../fibi/src/app/common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../app-constants';

@Component({
    selector: 'app-project-hierarchy-slider',
    templateUrl: './project-hierarchy-slider.component.html',
    styleUrls: ['./project-hierarchy-slider.component.scss'],
    providers: [ProjectHierarchySliderService]
})
export class ProjectHierarchySliderComponent implements OnInit, OnDestroy {

    @Input() projectInfo = new ProjectHierarchySliderPayload;
    @Output() closeSlider = new EventEmitter<any>();

    isProjectLoading = true;
    $subscriptions: Subscription[] = [];
    getFormattedSponsor = getFormattedSponsor;
    hierarchyProjectTree = new HierarchyProjectTree();
    COI_HIERARCHY_SLIDER_ID = 'project-hierarchy-slider';
    projectDetailsCache: { [projectNumber: string]: HierarchyProjectDetails } = {};

    constructor(private _commonService: CommonService, public hierarchyService: ProjectHierarchySliderService) {}

    ngOnInit(): void {
        this.hierarchyService.activeProjectNumber = this.projectInfo.projectNumber;
        this.hierarchyService.activeProjectTypeCode = this.projectInfo.projectTypeCode;
        this.fetchHierarchyProjectTree();
        this.fetchHierarchyProjectDetails();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    closeHierarchySlider(): void {
        setTimeout(() => {
            this.clearHierarchySlider();
        }, 500);
    }

    private clearHierarchySlider(): void {
        this.hierarchyProjectTree = new HierarchyProjectTree();
        this.projectDetailsCache = {};
        this.closeSlider.emit();
    }

    private fetchHierarchyProjectTree(): void {
        this.$subscriptions.push(
            this.hierarchyService.fetchHierarchyProjectTree(this.hierarchyService.activeProjectTypeCode, this.hierarchyService.activeProjectNumber)
                .subscribe((hierarchyProjectTree: any) => {
                    this.hierarchyProjectTree = hierarchyProjectTree || new HierarchyProjectTree();
                    this.hierarchyProjectTree?.projectNumber ? this.openHierarchySlider() : this.showErrorToast();
                }, (_error: any) => {
                    this.showErrorToast();
                }));
    }

    private showErrorToast(): void {
        this.clearHierarchySlider();
        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }

    private fetchHierarchyProjectDetails(): void {
        const { activeProjectTypeCode, activeProjectNumber } = this.hierarchyService;
        this.isProjectLoading = true;
        // Check if the result is already cached
        if (this.projectDetailsCache[activeProjectNumber]) {
            this.isProjectLoading = false;
            return;
        }
        // call api if not in cache
        this._commonService.setLoaderRestriction();
        this.$subscriptions.push(
            this.hierarchyService.fetchHierarchyProjectDetails(activeProjectTypeCode, activeProjectNumber)
                .subscribe((hierarchyProjectDetails: any) => {
                    // Cache the result
                    this.projectDetailsCache[activeProjectNumber] = deepCloneObject(hierarchyProjectDetails);
                    this.isProjectLoading = false;
                }, (_error: any) => {
                    this.isProjectLoading = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
        this._commonService.removeLoaderRestriction();
    }

    private openHierarchySlider(): void {
        setTimeout(() => {
            openCoiSlider(this.COI_HIERARCHY_SLIDER_ID);
        }, 100);
    }

}
