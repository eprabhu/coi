import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryDetailsComponent } from './industry-details.component';

describe('IndustryDetailsComponent', () => {
  let component: IndustryDetailsComponent;
  let fixture: ComponentFixture<IndustryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndustryDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
