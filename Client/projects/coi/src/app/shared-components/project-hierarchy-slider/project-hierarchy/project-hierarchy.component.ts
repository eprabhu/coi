import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectHierarchySliderService } from '../services/project-hierarchy-slider.service';

@Component({
    selector: 'app-project-hierarchy',
    templateUrl: './project-hierarchy.component.html',
    styleUrls: ['./project-hierarchy.component.scss'],
})
export class ProjectHierarchyComponent {

    @Input() hierarchyProjectTree: any;
    @Output() hierarchyAction = new EventEmitter<any>();

    constructor(public hierarchyService: ProjectHierarchySliderService) {}

    getProjectDetails(projectNode): void {
        if (this.hierarchyService.activeProjectNumber != projectNode.projectNumber) {
            this.hierarchyService.activeProjectNumber = projectNode.projectNumber;
            this.hierarchyService.activeProjectTypeCode = projectNode.projectTypeCode;
            this.hierarchyAction.emit(projectNode);
        }
    }

}
