import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelDisclosureEngagementsComponent } from './travel-disclosure-engagements.component';

describe('TravelDisclosureEngagementsComponent', () => {
  let component: TravelDisclosureEngagementsComponent;
  let fixture: ComponentFixture<TravelDisclosureEngagementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelDisclosureEngagementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelDisclosureEngagementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
