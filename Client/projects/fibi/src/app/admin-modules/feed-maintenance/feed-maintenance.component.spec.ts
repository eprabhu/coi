import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedMaintenanceComponent } from './feed-maintenance.component';

describe('FeedMaintenanceComponent', () => {
  let component: FeedMaintenanceComponent;
  let fixture: ComponentFixture<FeedMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
