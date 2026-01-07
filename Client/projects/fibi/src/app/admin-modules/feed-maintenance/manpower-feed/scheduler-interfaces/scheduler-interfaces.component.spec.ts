import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerInterfacesComponent } from './scheduler-interfaces.component';

describe('SchedulerInterfacesComponent', () => {
  let component: SchedulerInterfacesComponent;
  let fixture: ComponentFixture<SchedulerInterfacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerInterfacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerInterfacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
