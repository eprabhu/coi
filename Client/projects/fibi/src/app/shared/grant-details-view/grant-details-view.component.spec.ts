import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantDetailsViewComponent } from './grant-details-view.component';

describe('GrantDetailsViewComponent', () => {
  let component: GrantDetailsViewComponent;
  let fixture: ComponentFixture<GrantDetailsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrantDetailsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
