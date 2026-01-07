/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';


import { AwardMilestoneComponent } from './award-milestone.component';

describe('MilestoneComponent', () => {
  let component: AwardMilestoneComponent;
  let fixture: ComponentFixture<AwardMilestoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardMilestoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardMilestoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
