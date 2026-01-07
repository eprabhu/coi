/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TravelDisclosureComponent } from './travel-disclosure.component';

describe('TravelDisclosureComponent', () => {
    let component: TravelDisclosureComponent;
    let fixture: ComponentFixture<TravelDisclosureComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TravelDisclosureComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TravelDisclosureComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
