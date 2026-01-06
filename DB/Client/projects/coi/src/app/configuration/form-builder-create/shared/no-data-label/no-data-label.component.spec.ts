import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDataLabelComponent } from './no-data-label.component';

describe('NoDataLabelComponent', () => {
  let component: NoDataLabelComponent;
  let fixture: ComponentFixture<NoDataLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoDataLabelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDataLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
