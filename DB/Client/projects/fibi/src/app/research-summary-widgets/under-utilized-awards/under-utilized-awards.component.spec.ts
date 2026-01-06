import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderUtilizedAwardsComponent } from './under-utilized-awards.component';

describe('UnderUtilizedAwardsComponent', () => {
  let component: UnderUtilizedAwardsComponent;
  let fixture: ComponentFixture<UnderUtilizedAwardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnderUtilizedAwardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnderUtilizedAwardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
