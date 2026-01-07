/* tslint:disable:no-unused-variable */
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OPAAppointmentComponent } from './OPA-appointment.component';

describe('OPAAppointmentComponent', () => {
    let component: OPAAppointmentComponent;
    let fixture: ComponentFixture<OPAAppointmentComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [OPAAppointmentComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OPAAppointmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
