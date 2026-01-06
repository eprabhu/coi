/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtendedProjectDetailsCardComponent } from './extended-project-details-card.component';

describe('ExtendedProjectDetailsCardComponent', () => {
    let component: ExtendedProjectDetailsCardComponent;
    let fixture: ComponentFixture<ExtendedProjectDetailsCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExtendedProjectDetailsCardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExtendedProjectDetailsCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
