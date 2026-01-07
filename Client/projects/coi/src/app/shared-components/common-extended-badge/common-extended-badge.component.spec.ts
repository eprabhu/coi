import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonExtendedBadgeComponent } from './common-extended-badge.component';

describe('CommonExtendedBadgeComponent', () => {
  let component: CommonExtendedBadgeComponent;
  let fixture: ComponentFixture<CommonExtendedBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonExtendedBadgeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonExtendedBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
