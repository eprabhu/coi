/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtendedProjRelNavigationComponent } from './ext-proj-rel-navigation.component';

describe('ExtendedProjRelNavigationComponent', () => {
    let component: ExtendedProjRelNavigationComponent;
    let fixture: ComponentFixture<ExtendedProjRelNavigationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExtendedProjRelNavigationComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExtendedProjRelNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
