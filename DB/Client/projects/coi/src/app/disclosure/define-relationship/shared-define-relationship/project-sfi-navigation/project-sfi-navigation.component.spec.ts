/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectSfiNavigationComponent } from './project-sfi-navigation.component';

describe('ProjectSfiNavigationComponent', () => {
    let component: ProjectSfiNavigationComponent;
    let fixture: ComponentFixture<ProjectSfiNavigationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProjectSfiNavigationComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectSfiNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
