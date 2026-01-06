import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedDisclosuresEngagementCardComponent } from './related-disclosures-engagement-card.component';

describe('RelatedDisclosuresEngagementCardComponent', () => {
  let component: RelatedDisclosuresEngagementCardComponent;
  let fixture: ComponentFixture<RelatedDisclosuresEngagementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatedDisclosuresEngagementCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedDisclosuresEngagementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
