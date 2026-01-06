import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngagementAdditionalFormComponent } from './engagement-additional-form.component';

describe('EngagementAdditionalFormComponent', () => {
  let component: EngagementAdditionalFormComponent;
  let fixture: ComponentFixture<EngagementAdditionalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngagementAdditionalFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngagementAdditionalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
