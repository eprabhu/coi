import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedTravelDisclosuresComponent } from './related-travel-disclosures.component';

describe('RelatedTravelDisclosuresComponent', () => {
  let component: RelatedTravelDisclosuresComponent;
  let fixture: ComponentFixture<RelatedTravelDisclosuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatedTravelDisclosuresComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedTravelDisclosuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
