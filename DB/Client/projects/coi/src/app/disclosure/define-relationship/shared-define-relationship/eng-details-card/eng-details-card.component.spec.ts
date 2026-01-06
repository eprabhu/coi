/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EngagementDetailsCardComponent } from './eng-details-card.component';

describe('EngagementDetailsCardComponent', () => {
    let component: EngagementDetailsCardComponent;
    let fixture: ComponentFixture<EngagementDetailsCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EngagementDetailsCardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EngagementDetailsCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
