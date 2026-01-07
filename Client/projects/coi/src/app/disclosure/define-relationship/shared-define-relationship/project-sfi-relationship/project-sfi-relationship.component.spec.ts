/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectSfiRelationshipComponent } from './project-sfi-relationship.component';

describe('ProjectSfiRelationshipComponent', () => {
    let component: ProjectSfiRelationshipComponent;
    let fixture: ComponentFixture<ProjectSfiRelationshipComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProjectSfiRelationshipComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectSfiRelationshipComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
