import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RateMaintainanceComponent } from './rate-maintainance.component';

describe('RateMaintainanceComponent', () => {
  let component: RateMaintainanceComponent;
  let fixture: ComponentFixture<RateMaintainanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateMaintainanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateMaintainanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
